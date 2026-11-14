
import crypto from "crypto";
import db from "../config/db.js";
import razorpay from "../config/razorpay.js";

// ==========================================
// 1. CREATE RAZORPAY PAYMENT ORDER
// ==========================================

export const createRazorpayOrder = async (req, res, next) => {
  const {
    customer_name,
    customer_email,
    customer_phone,
    order_type,
    table_token,
    notes,
    items,
  } = req.body;

  let connection;
  let orderId;

  try {
    if (
      typeof customer_name !== "string" ||
      !customer_name.trim() ||
      typeof customer_email !== "string" ||
      !customer_email.trim() ||
      typeof customer_phone !== "string" ||
      !/^\d{10}$/.test(customer_phone) ||
      !["takeaway", "dine_in"].includes(order_type) ||
      !Array.isArray(items) ||
      items.length === 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Please provide valid order details.",
      });
    }

    if (
      order_type === "dine_in" &&
      (!table_token || !/^[a-f0-9]{64}$/i.test(table_token))
    ) {
      return res.status(400).json({
        success: false,
        message: "A valid table QR code is required.",
      });
    }

    if (items.length > 50) {
      return res.status(400).json({
        success: false,
        message: "Too many items in one order.",
      });
    }

    for (const item of items) {
      if (
        !Number.isInteger(Number(item.product_id)) ||
        Number(item.product_id) <= 0 ||
        !Number.isInteger(Number(item.quantity)) ||
        Number(item.quantity) < 1 ||
        Number(item.quantity) > 50
      ) {
        return res.status(400).json({
          success: false,
          message: "Invalid product or quantity.",
        });
      }

      if (
        item.option_ids !== undefined &&
        (!Array.isArray(item.option_ids) ||
          item.option_ids.some(
            (id) => !Number.isInteger(Number(id)) || Number(id) <= 0
          ))
      ) {
        return res.status(400).json({
          success: false,
          message: "Invalid customization options.",
        });
      }

      const optionIds = (item.option_ids || []).map(Number);

      if (new Set(optionIds).size !== optionIds.length) {
        return res.status(400).json({
          success: false,
          message: "Duplicate customization options are not allowed.",
        });
      }
    }

    const productIds = [
      ...new Set(items.map((item) => Number(item.product_id))),
    ];

    connection = await db.getConnection();
    await connection.beginTransaction();

    let tableNumber = null;

    if (order_type === "dine_in") {
      const [tables] = await connection.query(
        `SELECT table_number
         FROM cafe_tables
         WHERE qr_token = ? AND status = 'active'
         LIMIT 1`,
        [table_token]
      );

      if (tables.length === 0) {
        await connection.rollback();

        return res.status(400).json({
          success: false,
          message: "Invalid or inactive table QR code.",
        });
      }

      tableNumber = tables[0].table_number;
    }

    const [products] = await connection.query(
      `SELECT id, name, price, is_available
       FROM products
       WHERE id IN (?)`,
      [productIds]
    );

    if (products.length !== productIds.length) {
      await connection.rollback();

      return res.status(400).json({
        success: false,
        message: "One or more products were not found.",
      });
    }

    const productMap = new Map(
      products.map((product) => [Number(product.id), product])
    );

    let totalAmount = 0;
    const orderItems = [];

    for (const item of items) {
      const product = productMap.get(Number(item.product_id));

      if (!product || !product.is_available) {
        await connection.rollback();

        return res.status(400).json({
          success: false,
          message: `${product?.name || "A product"} is unavailable.`,
        });
      }

      const quantity = Number(item.quantity);
      const optionIds = (item.option_ids || []).map(Number);

      let selectedOptions = [];
      let optionsTotal = 0;

      if (optionIds.length > 0) {
        const [options] = await connection.query(
          `SELECT id, option_name, additional_price
           FROM product_options
           WHERE product_id = ? AND id IN (?)`,
          [product.id, optionIds]
        );

        if (options.length !== optionIds.length) {
          await connection.rollback();

          return res.status(400).json({
            success: false,
            message: `Invalid customization for ${product.name}.`,
          });
        }

        selectedOptions = options.map((option) => {
          const additionalPrice = Number(option.additional_price || 0);
          optionsTotal += additionalPrice;

          return {
            id: option.id,
            option_name: option.option_name,
            additional_price: additionalPrice,
          };
        });
      }

      const unitPrice = Number(product.price) + optionsTotal;
      const subtotal = unitPrice * quantity;

      totalAmount += subtotal;

      orderItems.push({
        product_id: product.id,
        product_name: product.name,
        quantity,
        unit_price: unitPrice,
        selected_options: selectedOptions,
        subtotal,
      });
    }

    if (!Number.isFinite(totalAmount) || totalAmount <= 0) {
      await connection.rollback();

      return res.status(400).json({
        success: false,
        message: "Invalid order total.",
      });
    }

    totalAmount = Number(totalAmount.toFixed(2));

    const trackingToken = crypto.randomBytes(32).toString("hex");

    const [orderResult] = await connection.query(
      `INSERT INTO orders
       (
         customer_name,
         customer_email,
         customer_phone,
         order_type,
         table_number,
         notes,
         total_amount,
         payment_method,
         payment_status,
         order_status,
         tracking_token
       )
       VALUES (?, ?, ?, ?, ?, ?, ?, 'razorpay', 'pending', 'placed', ?)`,
      [
        customer_name.trim(),
        customer_email.trim(),
        customer_phone.trim(),
        order_type,
        tableNumber,
        typeof notes === "string" ? notes.trim() || null : null,
        totalAmount.toFixed(2),
        trackingToken,
      ]
    );

    orderId = orderResult.insertId;

    for (const item of orderItems) {
      await connection.query(
        `INSERT INTO order_items
         (
           order_id,
           product_id,
           product_name,
           quantity,
           unit_price,
           selected_options,
           subtotal
         )
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          orderId,
          item.product_id,
          item.product_name,
          item.quantity,
          item.unit_price.toFixed(2),
          JSON.stringify(item.selected_options),
          item.subtotal.toFixed(2),
        ]
      );
    }

    await connection.commit();
    connection.release();
    connection = null;

    const amountInPaise = Math.round(totalAmount * 100);

    const razorpayOrder = await razorpay.orders.create({
      amount: amountInPaise,
      currency: "INR",
      receipt: `cafe_${orderId}`,
      notes: {
        cafe_order_id: String(orderId),
      },
    });

    await db.query(
      `INSERT INTO order_payments
       (order_id, provider_order_id, amount, currency, status)
       VALUES (?, ?, ?, 'INR', 'pending')`,
      [orderId, razorpayOrder.id, totalAmount.toFixed(2)]
    );

    return res.status(201).json({
      success: true,
      message: "Payment order created successfully.",
      key_id: process.env.RAZORPAY_KEY_ID,
      razorpay_order_id: razorpayOrder.id,
      amount: amountInPaise,
      currency: "INR",
      order: {
        id: orderId,
        total_amount: totalAmount.toFixed(2),
        order_status: "placed",
        payment_status: "pending",
        tracking_token: trackingToken,
        order_type,
        table_number: tableNumber,
      },
    });
  } catch (error) {
    if (connection) {
      try {
        await connection.rollback();
      } catch (rollbackError) {
        console.error("Payment order rollback failed:", rollbackError);
      }

      connection.release();
    }

    if (orderId) {
      try {
        await db.query(
          `UPDATE orders
           SET payment_status = 'failed', order_status = 'cancelled'
           WHERE id = ? AND payment_status = 'pending'`,
          [orderId]
        );
      } catch (updateError) {
        console.error("Failed to update payment order:", updateError);
      }
    }

    next(error);
  }
};

// ==========================================
// 2. VERIFY RAZORPAY PAYMENT
// ==========================================

export const verifyRazorpayPayment = async (req, res, next) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = req.body;

    if (
      typeof razorpay_order_id !== "string" ||
      typeof razorpay_payment_id !== "string" ||
      typeof razorpay_signature !== "string" ||
      !/^[a-f0-9]{64}$/i.test(razorpay_signature)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment verification details.",
      });
    }

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    const expectedBuffer = Buffer.from(expectedSignature, "hex");
    const receivedBuffer = Buffer.from(razorpay_signature, "hex");

    if (
      expectedBuffer.length !== receivedBuffer.length ||
      !crypto.timingSafeEqual(expectedBuffer, receivedBuffer)
    ) {
      return res.status(400).json({
        success: false,
        message: "Payment signature verification failed.",
      });
    }

    const [payments] = await db.query(
      `SELECT id, order_id, amount, currency, status, provider_payment_id
       FROM order_payments
       WHERE provider_order_id = ?
       LIMIT 1`,
      [razorpay_order_id]
    );

    if (payments.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Payment order not found.",
      });
    }

    const payment = payments[0];

    const gatewayPayment = await razorpay.payments.fetch(
      razorpay_payment_id
    );

    if (
      gatewayPayment.order_id !== razorpay_order_id ||
      gatewayPayment.amount !== Math.round(Number(payment.amount) * 100) ||
      gatewayPayment.currency !== payment.currency
    ) {
      return res.status(400).json({
        success: false,
        message: "Payment details do not match our order.",
      });
    }

    if (gatewayPayment.status !== "captured") {
      return res.status(202).json({
        success: true,
        message: "Payment has not been captured yet.",
        payment_status: "pending",
      });
    }

    const connection = await db.getConnection();

    try {
      await connection.beginTransaction();

      const [lockedPayments] = await connection.query(
        `SELECT id, order_id, status, provider_payment_id
         FROM order_payments
         WHERE id = ?
         FOR UPDATE`,
        [payment.id]
      );

      if (lockedPayments.length === 0) {
        await connection.rollback();

        return res.status(404).json({
          success: false,
          message: "Payment record not found.",
        });
      }

      const currentPayment = lockedPayments[0];

      if (currentPayment.status === "paid") {
        if (
          currentPayment.provider_payment_id !== razorpay_payment_id
        ) {
          await connection.rollback();

          return res.status(409).json({
            success: false,
            message: "A different payment has already been recorded.",
          });
        }

        await connection.commit();

        return res.json({
          success: true,
          message: "Payment was already verified.",
          payment_status: "paid",
          order_id: currentPayment.order_id,
        });
      }

      if (
        !["pending", "failed"].includes(currentPayment.status)
      ) {
        await connection.rollback();

        return res.status(409).json({
          success: false,
          message: "This payment attempt cannot be verified.",
        });
      }

      await connection.query(
        `UPDATE order_payments
         SET provider_payment_id = ?,
             payment_method = ?,
             status = 'paid',
             paid_at = CURRENT_TIMESTAMP
         WHERE id = ?`,
        [
          razorpay_payment_id,
          gatewayPayment.method || null,
          payment.id,
        ]
      );

      const [orderResult] = await connection.query(
        `UPDATE orders
         SET payment_status = 'paid'
         WHERE id = ? AND payment_status != 'paid'`,
        [currentPayment.order_id]
      );

      if (orderResult.affectedRows !== 1) {
        const [existingOrders] = await connection.query(
          `SELECT payment_status
           FROM orders
           WHERE id = ?`,
          [currentPayment.order_id]
        );

        if (
          existingOrders.length === 0 ||
          existingOrders[0].payment_status !== "paid"
        ) {
          await connection.rollback();

          return res.status(409).json({
            success: false,
            message: "Order payment status could not be updated.",
          });
        }
      }

      await connection.commit();

      return res.json({
        success: true,
        message: "Payment verified successfully.",
        payment_status: "paid",
        order_id: currentPayment.order_id,
      });
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  } catch (error) {
    next(error);
  }
};

// ==========================================
// 3. HANDLE RAZORPAY WEBHOOK
// ==========================================

export const handleRazorpayWebhook = async (req, res) => {
  let connection;

  try {
    // Webhook secret must exist in backend environment variables
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

    if (!webhookSecret) {
      console.error("Razorpay webhook secret is missing.");

      return res.status(500).json({
        success: false,
        message: "Webhook configuration error.",
      });
    }

    // express.raw() must provide the original Buffer
    if (!Buffer.isBuffer(req.body)) {
      return res.status(400).json({
        success: false,
        message: "Invalid webhook request body.",
      });
    }

    const receivedSignature = req.headers["x-razorpay-signature"];
    const eventId = req.headers["x-razorpay-event-id"];

    if (
      typeof receivedSignature !== "string" ||
      !/^[a-f0-9]{64}$/i.test(receivedSignature) ||
      typeof eventId !== "string" ||
      !eventId.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: "Missing or invalid webhook headers.",
      });
    }

    // Verify signature against the exact raw request body
    const expectedSignature = crypto
      .createHmac("sha256", webhookSecret)
      .update(req.body)
      .digest("hex");

    const expectedBuffer = Buffer.from(expectedSignature, "hex");
    const receivedBuffer = Buffer.from(receivedSignature, "hex");

    if (
      expectedBuffer.length !== receivedBuffer.length ||
      !crypto.timingSafeEqual(expectedBuffer, receivedBuffer)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid webhook signature.",
      });
    }

    // Parse JSON only after signature verification
    let eventData;

    try {
      eventData = JSON.parse(req.body.toString("utf8"));
    } catch {
      return res.status(400).json({
        success: false,
        message: "Invalid webhook JSON.",
      });
    }

    const eventType = eventData.event;

    if (typeof eventType !== "string" || !eventType) {
      return res.status(400).json({
        success: false,
        message: "Invalid webhook event.",
      });
    }

    // Store the event ID before processing.
    // The primary key prevents duplicate event records.
    await db.query(
      `INSERT IGNORE INTO payment_webhook_events
       (event_id, event_type, processing_status)
       VALUES (?, ?, 'received')`,
      [eventId, eventType]
    );

    connection = await db.getConnection();
    await connection.beginTransaction();

    // Lock this event so concurrent deliveries cannot process it twice
    const [events] = await connection.query(
      `SELECT event_id, processing_status
       FROM payment_webhook_events
       WHERE event_id = ?
       FOR UPDATE`,
      [eventId]
    );

    if (events.length === 0) {
      await connection.rollback();

      return res.status(500).json({
        success: false,
        message: "Webhook event could not be recorded.",
      });
    }

    if (events[0].processing_status === "processed") {
      await connection.commit();

      return res.status(200).json({
        success: true,
        message: "Webhook event already processed.",
      });
    }

    // Extract Razorpay payment details
    const paymentEntity = eventData.payload?.payment?.entity;

    if (
      ["payment.captured", "payment.failed"].includes(eventType) &&
      paymentEntity
    ) {
      const providerOrderId = paymentEntity.order_id;
      const providerPaymentId = paymentEntity.id;

      if (
        typeof providerOrderId === "string" &&
        typeof providerPaymentId === "string"
      ) {
        const [payments] = await connection.query(
          `SELECT id, order_id, amount, currency, status, provider_payment_id
           FROM order_payments
           WHERE provider_order_id = ?
           LIMIT 1
           FOR UPDATE`,
          [providerOrderId]
        );

        if (payments.length > 0) {
          const payment = payments[0];

          // Verify payment amount and currency against our database
          const amountMatches =
            Number(paymentEntity.amount) ===
            Math.round(Number(payment.amount) * 100);

          const currencyMatches =
            paymentEntity.currency === payment.currency;

          if (!amountMatches || !currencyMatches) {
            throw new Error(
              "Webhook payment amount or currency does not match the order."
            );
          }

          if (eventType === "payment.captured") {
            // Do not overwrite a different payment ID
            if (
              payment.status === "paid" &&
              payment.provider_payment_id &&
              payment.provider_payment_id !== providerPaymentId
            ) {
              throw new Error(
                "A different payment is already recorded for this order."
              );
            }

            // A captured payment is authoritative, even if an earlier
            // payment.failed event was received.
            if (payment.status !== "refunded") {
              await connection.query(
                `UPDATE order_payments
                 SET provider_payment_id = ?,
                     payment_method = ?,
                     status = 'paid',
                     paid_at = COALESCE(paid_at, CURRENT_TIMESTAMP)
                 WHERE id = ?`,
                [
                  providerPaymentId,
                  paymentEntity.method || null,
                  payment.id,
                ]
              );

              await connection.query(
                `UPDATE orders
                 SET payment_status = 'paid'
                 WHERE id = ?`,
                [payment.order_id]
              );
            }
          }

          if (eventType === "payment.failed") {
            // Never downgrade a payment that is already paid
            if (
              payment.status === "pending" &&
              !payment.provider_payment_id
            ) {
              await connection.query(
                `UPDATE order_payments
                 SET provider_payment_id = ?,
                     payment_method = ?,
                     status = 'failed'
                 WHERE id = ? AND status = 'pending'`,
                [
                  providerPaymentId,
                  paymentEntity.method || null,
                  payment.id,
                ]
              );

              await connection.query(
                `UPDATE orders
                 SET payment_status = 'failed'
                 WHERE id = ? AND payment_status = 'pending'`,
                [payment.order_id]
              );
            }
          }
        } else {
          console.warn(
            "Razorpay webhook received for an unknown order:",
            providerOrderId
          );
        }
      }
    }

    // Mark event as processed in the same transaction as payment updates
    await connection.query(
      `UPDATE payment_webhook_events
       SET processing_status = 'processed',
           processed_at = CURRENT_TIMESTAMP
       WHERE event_id = ?`,
      [eventId]
    );

    await connection.commit();

    return res.status(200).json({
      success: true,
      message: "Webhook processed successfully.",
    });
  } catch (error) {
    if (connection) {
      try {
        await connection.rollback();
      } catch (rollbackError) {
        console.error("Webhook rollback failed:", rollbackError);
      }
    }

    console.error("Razorpay webhook processing failed:", error.message);

    // Record failure so a retry can process the event again
    try {
      const eventId = req.headers["x-razorpay-event-id"];

      if (typeof eventId === "string") {
        await db.query(
          `UPDATE payment_webhook_events
           SET processing_status = 'failed'
           WHERE event_id = ? AND processing_status != 'processed'`,
          [eventId]
        );
      }
    } catch (updateError) {
      console.error("Could not update webhook event status:", updateError);
    }

    // Non-2xx response tells Razorpay that it may retry the webhook
    return res.status(500).json({
      success: false,
      message: "Webhook processing failed.",
    });
  } finally {
    if (connection) {
      connection.release();
    }
  }
};
