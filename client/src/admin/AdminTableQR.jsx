
import { useEffect, useState } from "react";
import api from "../api/axios";
import { generateTableQR } from "../utils/generateTableQR";
import "./Admin.css";

function AdminTableQR() {
  const [tables, setTables] = useState([]);
  const [selectedTableId, setSelectedTableId] = useState("");
  const [qrImage, setQrImage] = useState("");
  const [loading, setLoading] = useState(true);
  const [qrLoading, setQrLoading] = useState(false);
  const [error, setError] = useState("");

  // Fetch active tables
  useEffect(() => {
    const fetchTables = async () => {
      try {
        const response = await api.get("/admin/tables");

        const activeTables = (response.data.tables || []).filter(
          (table) => table.status === "active" && table.qr_token
        );

        setTables(activeTables);

        if (activeTables.length > 0) {
          setSelectedTableId(String(activeTables[0].id));
        }
      } catch (err) {
        setError(
          err.response?.data?.message || "Unable to load tables."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchTables();
  }, []);

  const selectedTable = tables.find(
    (table) => String(table.id) === selectedTableId
  );

  // Generate QR code
  const handleGenerate = async () => {
    if (!selectedTable?.qr_token) {
      setError("Please select a valid active table.");
      return;
    }

    try {
      setQrLoading(true);
      setError("");
      setQrImage("");

      const image = await generateTableQR(selectedTable.qr_token);

      setQrImage(image);
    } catch (err) {
      setError(err.message || "Unable to generate QR code.");
    } finally {
      setQrLoading(false);
    }
  };

  // Download QR code
  const handleDownload = () => {
    if (!qrImage || !selectedTable) return;

    const link = document.createElement("a");
    link.href = qrImage;
    link.download = `cafe-${selectedTable.table_number}-QR.png`;
    link.click();
  };

  return (
    <div className="admin-page">

      <div className="admin-page-header">
        <div>
          <h1>Table QR Codes</h1>
          <p>Generate secure QR codes for your café tables.</p>
        </div>
      </div>

      <div className="admin-table-container">
        <h2>Generate Table QR Code</h2>

        {loading ? (
          <p>Loading tables...</p>
        ) : tables.length === 0 ? (
          <p>No active tables with secure QR tokens found.</p>
        ) : (
          <>
            <div className="form-group">
              <label htmlFor="qr-table-select">
                Select Table
              </label>

              <select
                id="qr-table-select"
                value={selectedTableId}
                onChange={(e) => {
                  setSelectedTableId(e.target.value);
                  setQrImage("");
                  setError("");
                }}
              >
                {tables.map((table) => (
                  <option key={table.id} value={table.id}>
                    Table {table.table_number}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="button"
              className="admin-btn"
              onClick={handleGenerate}
              disabled={qrLoading}
            >
              {qrLoading ? "Generating..." : "Generate QR Code"}
            </button>
          </>
        )}

        {error && (
          <p className="admin-error" role="alert">
            {error}
          </p>
        )}

        {qrImage && selectedTable && (
          <div className="table-qr-result">
            <h3>Table {selectedTable.table_number}</h3>

            <img
              src={qrImage}
              alt={`QR code for table ${selectedTable.table_number}`}
            />

            <p>Scan this QR code to open the café menu.</p>

            <button
              type="button"
              className="admin-btn"
              onClick={handleDownload}
            >
              Download QR Code
            </button>
          </div>
        )}
      </div>

    </div>
  );
}

export default AdminTableQR;
