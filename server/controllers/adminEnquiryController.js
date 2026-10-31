import db from "../config/db.js";

// Get all contact enquiries
export const getAllEnquiries = async (req, res) => {
  try {
    const [enquiries] = await db.query(
      `SELECT * FROM contact_enquiries
       ORDER BY created_at DESC`
    );

    res.status(200).json({
      success: true,
      count: enquiries.length,
      enquiries,
    });
  } catch (error) {
    console.error("Get enquiries error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch enquiries.",
    });
  }
};

// Update enquiry status
export const updateEnquiryStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const allowedStatuses = ["new", "read", "replied"];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid enquiry status.",
      });
    }

    const [result] = await db.query(
      `UPDATE contact_enquiries
       SET status = ?
       WHERE id = ?`,
      [status, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Enquiry not found.",
      });
    }

    res.status(200).json({
      success: true,
      message: "Enquiry status updated successfully.",
    });
  } catch (error) {
    console.error("Update enquiry error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to update enquiry status.",
    });
  }
};

// Delete an enquiry
export const deleteEnquiry = async (req, res) => {
  try {
    const { id } = req.params;

    const [result] = await db.query(
      `DELETE FROM contact_enquiries WHERE id = ?`,
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Enquiry not found.",
      });
    }

    res.status(200).json({
      success: true,
      message: "Enquiry deleted successfully.",
    });
  } catch (error) {
    console.error("Delete enquiry error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to delete enquiry.",
    });
  }
};