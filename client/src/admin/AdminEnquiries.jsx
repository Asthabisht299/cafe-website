
import { useEffect, useState } from "react";
import api from "../api/axios";
import "./Admin.css";

function AdminEnquiries() {
  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  // Fetch enquiries
  const fetchEnquiries = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/admin/enquiries");

      setEnquiries(response.data.enquiries || []);
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to load enquiries."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEnquiries();
  }, []);

  // Update enquiry status
  const updateStatus = async (id, status) => {
    try {
      setError("");
      setMessage("");

      await api.patch(`/admin/enquiries/${id}/status`, { status });

      setMessage("Enquiry status updated successfully.");
      await fetchEnquiries();
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to update status."
      );
    }
  };

  // Delete enquiry
  const deleteEnquiry = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this enquiry?"
    );

    if (!confirmDelete) return;

    try {
      setError("");
      setMessage("");

      await api.delete(`/admin/enquiries/${id}`);

      setMessage("Enquiry deleted successfully.");
      await fetchEnquiries();
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to delete enquiry."
      );
    }
  };

  if (loading) {
    return <div className="admin-page">Loading enquiries...</div>;
  }

  return (
    <div className="admin-page">

      <div className="admin-page-header">
        <div>
          <h1>Contact Enquiries</h1>
          <p>View and manage messages from your customers.</p>
        </div>

        <button
          type="button"
          onClick={fetchEnquiries}
          className="admin-btn"
        >
          Refresh
        </button>
      </div>

      {message && (
        <p className="admin-success" role="status">
          {message}
        </p>
      )}

      {error && (
        <p className="admin-error" role="alert">
          {error}
        </p>
      )}

      {/* ENQUIRY STATISTICS */}
      <div className="admin-stats-grid">

        <div className="admin-stat-card">
          <h3>Total Enquiries</h3>
          <h2>{enquiries.length}</h2>
        </div>

        <div className="admin-stat-card">
          <h3>New Enquiries</h3>
          <h2>
            {enquiries.filter((item) => item.status === "new").length}
          </h2>
        </div>

        <div className="admin-stat-card">
          <h3>Replied</h3>
          <h2>
            {enquiries.filter((item) => item.status === "replied").length}
          </h2>
        </div>

      </div>

      {/* CUSTOMER MESSAGES */}
      <div className="admin-table-container">
        <h2>Customer Messages</h2>

        {enquiries.length === 0 ? (
          <p className="admin-empty">
            No enquiries found. Customer messages will appear here.
          </p>
        ) : (
          <div className="enquiry-list">

            {enquiries.map((item) => (
              <div className="enquiry-card" key={item.id}>

                <div className="enquiry-card-header">
                  <div>
                    <h3>{item.subject || "No subject"}</h3>

                    <p>
                      <strong>{item.name}</strong> · {item.email}
                    </p>
                  </div>

                  <span className={`enquiry-status ${item.status}`}>
                    {item.status}
                  </span>
                </div>

                <p className="enquiry-message">
                  {item.message}
                </p>

                <p className="enquiry-date">
                  {new Date(item.created_at).toLocaleString()}
                </p>

                <div className="enquiry-actions">
                  <select
                    aria-label={`Status for enquiry from ${item.name}`}
                    value={item.status}
                    onChange={(e) =>
                      updateStatus(item.id, e.target.value)
                    }
                  >
                    <option value="new">New</option>
                    <option value="read">Read</option>
                    <option value="replied">Replied</option>
                  </select>

                  <button
                    type="button"
                    className="admin-delete-btn"
                    onClick={() => deleteEnquiry(item.id)}
                  >
                    Delete
                  </button>
                </div>

              </div>
            ))}

          </div>
        )}
      </div>

    </div>
  );
}

export default AdminEnquiries;
