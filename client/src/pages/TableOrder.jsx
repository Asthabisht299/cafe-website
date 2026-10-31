
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../api/axios";

function TableOrder() {
  const { tableNumber } = useParams();
  const navigate = useNavigate();

  const [message, setMessage] = useState("Verifying your table...");

  useEffect(() => {
    let active = true;

    const verifyTable = async () => {
      try {
        const response = await api.get(
          `/tables/verify/${encodeURIComponent(tableNumber)}`
        );

        if (!active) return;

        if (!response.data.success || !response.data.table) {
          throw new Error("Invalid table QR code.");
        }

        localStorage.setItem(
          "cafe_table_number",
          response.data.table.table_number
        );

        localStorage.setItem("cafe_table_token", tableNumber);

        navigate("/menu", { replace: true });
      } catch (error) {
        if (!active) return;

        localStorage.removeItem("cafe_table_number");
        localStorage.removeItem("cafe_table_token");

        setMessage(
          error.response?.data?.message ||
            error.message ||
            "Unable to verify this table. Please contact staff."
        );
      }
    };

    if (!tableNumber || !/^[a-f0-9]{64}$/i.test(tableNumber)) {
      localStorage.removeItem("cafe_table_number");
      localStorage.removeItem("cafe_table_token");
      setMessage("Invalid table QR code.");
      return;
    }

    verifyTable();

    return () => {
      active = false;
    };
  }, [tableNumber, navigate]);

  return (
    <main className="checkout-page">
      <div className="empty-cart">
        <h1>Welcome!</h1>
        <p>{message}</p>
      </div>
    </main>
  );
}

export default TableOrder;
