
import { useEffect, useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import api from "../api/axios";
import "./Admin.css";

function AdminLayout() {
  const navigate = useNavigate();
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isActive = true;

    const checkAdmin = async () => {
      try {
        const response = await api.get("/admin/me");

        if (isActive) {
          setAdmin(response.data.admin);
        }
      } catch {
        if (isActive) {
          navigate("/admin/login", { replace: true });
        }
      } finally {
        if (isActive) {
          setLoading(false);
        }
      }
    };

    checkAdmin();

    return () => {
      isActive = false;
    };
  }, [navigate]);

  const handleLogout = async () => {
    try {
      await api.post("/admin/logout");
      navigate("/admin/login", { replace: true });
    } catch {
      alert("Unable to log out. Please try again.");
    }
  };

  if (loading) {
    return (
      <div className="admin-loading">
        Loading dashboard...
      </div>
    );
  }

  if (!admin) {
    return null;
  }

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div className="admin-brand">CAFÉ.</div>

        <p className="admin-sidebar-label">MANAGEMENT</p>

        <nav className="admin-navigation">
          <NavLink to="/admin" end>
            Dashboard
          </NavLink>

          <NavLink to="/admin/orders">
            Orders
          </NavLink>

          <NavLink to="/admin/products">
            Products
          </NavLink>

          <NavLink to="/admin/categories">
            Categories
          </NavLink>

          <NavLink to="/admin/tables">
            Table Management
          </NavLink>

          <NavLink to="/admin/enquiries">
            Enquiries
          </NavLink>
          <NavLink to="/admin/reviews">
  Customer Reviews
</NavLink>

          <NavLink to="/admin/table-qr">
            Table QR Codes
          </NavLink>
        </nav>

        <div className="admin-sidebar-bottom">
          <p>{admin.name}</p>
          <span>{admin.email}</span>

          <button onClick={handleLogout}>
            Log Out
          </button>
        </div>
      </aside>

      <main className="admin-main">
        <header className="admin-topbar">
          <div>
            <h2>Admin Panel</h2>
            <p>Welcome back, {admin.name}</p>
          </div>
        </header>

        <section className="admin-content">
          <Outlet />
        </section>
      </main>
    </div>
  );
}

export default AdminLayout;
