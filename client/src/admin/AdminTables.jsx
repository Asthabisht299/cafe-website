
import { useEffect, useState } from "react";
import api from "../api/axios";
import "./Admin.css";
import { generateTableQR } from "../utils/generateTableQR";

function AdminTables() {
  const [tables, setTables] = useState([]);
  const [tableNumber, setTableNumber] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const [selectedQR, setSelectedQR] = useState(null);
  const [qrLoading, setQrLoading] = useState(false);
  const [allQRs, setAllQRs] = useState([]);

  // Fetch tables
  const fetchTables = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/admin/tables");

      setTables(response.data.tables || []);
    } catch (err) {
      setError(
        err.response?.data?.message || "Unable to load tables."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTables();
  }, []);

  // Add table
  const handleAddTable = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);
      setError("");
      setMessage("");

      await api.post("/admin/tables", {
        table_number: tableNumber.trim(),
      });

      setTableNumber("");
      setMessage("Table added successfully.");

      await fetchTables();
    } catch (err) {
      setError(
        err.response?.data?.message || "Unable to add table."
      );
    } finally {
      setSaving(false);
    }
  };

  // Activate or deactivate table
  const handleStatusChange = async (id, currentStatus) => {
    const newStatus =
      currentStatus === "active" ? "inactive" : "active";

    try {
      setError("");
      setMessage("");

      await api.patch(`/admin/tables/${id}/status`, {
        status: newStatus,
      });

      setMessage("Table status updated.");
      setSelectedQR(null);
      setAllQRs([]);

      await fetchTables();
    } catch (err) {
      setError(
        err.response?.data?.message || "Unable to update status."
      );
    }
  };

  // Delete table
  const handleDelete = async (id, number) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete table ${number}?`
    );

    if (!confirmed) return;

    try {
      setError("");
      setMessage("");

      await api.delete(`/admin/tables/${id}`);

      setMessage("Table deleted successfully.");
      setSelectedQR(null);
      setAllQRs([]);

      await fetchTables();
    } catch (err) {
      setError(
        err.response?.data?.message || "Unable to delete table."
      );
    }
  };

  // Generate one secure QR code
  const handleGenerateQR = async (table) => {
    try {
      setQrLoading(true);
      setError("");
      setSelectedQR(null);

      if (!table.qr_token) {
        throw new Error(
          "Secure QR token is missing. Refresh your tables."
        );
      }

      const image = await generateTableQR(table.qr_token);

      setSelectedQR({
        tableNumber: table.table_number,
        image,
      });
    } catch (err) {
      setError(err.message || "Unable to generate QR code.");
    } finally {
      setQrLoading(false);
    }
  };

  // Generate QR codes for all active tables
  const handleGenerateAllQR = async () => {
    const activeTables = tables.filter(
      (table) => table.status === "active"
    );

    if (activeTables.length === 0) {
      setError("There are no active tables.");
      return;
    }

    try {
      setQrLoading(true);
      setError("");
      setMessage("");
      setSelectedQR(null);
      setAllQRs([]);

      const generatedQRs = await Promise.all(
        activeTables.map(async (table) => {
          if (!table.qr_token) {
            throw new Error(
              `Secure QR token missing for table ${table.table_number}.`
            );
          }

          return {
            tableNumber: table.table_number,
            image: await generateTableQR(table.qr_token),
          };
        })
      );

      setAllQRs(generatedQRs);
      setMessage("Secure QR codes generated successfully.");
    } catch (err) {
      setError(
        err.message || "Unable to generate all QR codes."
      );
    } finally {
      setQrLoading(false);
    }
  };

  // Download individual QR
  const handleDownloadQR = () => {
    if (!selectedQR) return;

    const link = document.createElement("a");
    link.href = selectedQR.image;
    link.download = `cafe-${selectedQR.tableNumber}-QR.png`;
    link.click();
  };

  return (
    <div className="admin-page">

      <div className="admin-page-header">
        <div>
          <h1>Table Management</h1>
          <p>Manage your café tables and their availability.</p>
        </div>
      </div>

      {/* ADD TABLE */}
      <div className="admin-table-container">
        <h2>Add New Table</h2>

        <form
          onSubmit={handleAddTable}
          className="admin-table-form"
        >
          <div className="form-group">
            <label htmlFor="table-number">
              Table Number
            </label>

            <input
              id="table-number"
              type="text"
              value={tableNumber}
              onChange={(e) => setTableNumber(e.target.value)}
              placeholder="Example: T1, T2, VIP-1"
              maxLength={20}
              required
            />
          </div>

          <button
            type="submit"
            className="admin-btn"
            disabled={saving}
          >
            {saving ? "Adding..." : "Add Table"}
          </button>
        </form>

        {error && (
          <p className="admin-error" role="alert">
            {error}
          </p>
        )}

        {message && (
          <p className="admin-success" role="status">
            {message}
          </p>
        )}
      </div>

      {/* TABLE LIST */}
      <div className="admin-table-container">
        <div className="admin-page-header">
          <h2>All Tables ({tables.length})</h2>

          <button
            type="button"
            className="admin-btn"
            onClick={fetchTables}
            disabled={loading}
          >
            Refresh
          </button>
        </div>

        {!loading && tables.length > 0 && (
          <button
            type="button"
            className="admin-btn"
            onClick={handleGenerateAllQR}
            disabled={qrLoading}
          >
            {qrLoading
              ? "Generating..."
              : "Generate All Active QR Codes"}
          </button>
        )}

        {loading ? (
          <p>Loading tables...</p>
        ) : tables.length === 0 ? (
          <p>No tables added yet.</p>
        ) : (
          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Table Number</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {tables.map((table) => (
                  <tr key={table.id}>
                    <td>{table.id}</td>
                    <td>{table.table_number}</td>

                    <td>
                      <span
                        className={
                          table.status === "active"
                            ? "status-active"
                            : "status-inactive"
                        }
                      >
                        {table.status}
                      </span>
                    </td>

                    <td>
                      <div className="admin-table-actions">

                        <button
                          type="button"
                          className="admin-btn"
                          disabled={
                            table.status !== "active" || qrLoading
                          }
                          onClick={() => handleGenerateQR(table)}
                        >
                          Generate QR
                        </button>

                        <button
                          type="button"
                          className="admin-btn"
                          onClick={() =>
                            handleStatusChange(table.id, table.status)
                          }
                        >
                          {table.status === "active"
                            ? "Deactivate"
                            : "Activate"}
                        </button>

                        <button
                          type="button"
                          className="admin-delete-btn"
                          onClick={() =>
                            handleDelete(table.id, table.table_number)
                          }
                        >
                          Delete
                        </button>

                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* INDIVIDUAL QR */}
        {selectedQR && (
          <div className="table-qr-result">
            <h3>QR Code – Table {selectedQR.tableNumber}</h3>

            <img
              src={selectedQR.image}
              alt={`QR code for ${selectedQR.tableNumber}`}
            />

            <p>Scan to open this table's menu.</p>

            <button
              type="button"
              className="admin-btn"
              onClick={handleDownloadQR}
            >
              Download QR Code
            </button>
          </div>
        )}
      </div>

      {/* ALL TABLE QR CODES */}
      {allQRs.length > 0 && (
        <div className="admin-table-container">
          <div className="qr-sheet-actions">
            <h2>All Active Table QR Codes</h2>

            <button
              type="button"
              className="admin-btn"
              onClick={() => window.print()}
            >
              Print / Save as PDF
            </button>
          </div>

          <div className="print-qr-section">
            <h1>CAFÉ</h1>
            <p>Scan to explore our menu and order</p>

            <div className="qr-sheet-grid">
              {allQRs.map((qr) => (
                <div
                  className="qr-sheet-card"
                  key={qr.tableNumber}
                >
                  <h3>Table {qr.tableNumber}</h3>

                  <img
                    src={qr.image}
                    alt={`Table ${qr.tableNumber}`}
                  />

                  <p>Scan to Order</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default AdminTables;
