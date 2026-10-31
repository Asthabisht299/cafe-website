
import { useEffect, useState } from "react";
import api from "../api/axios";
import "./Admin.css";

const emptyForm = {
  name: "",
  description: "",
  image_url: "",
};

function AdminCategories() {
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  // Fetch categories
  const fetchCategories = async () => {
    try {
      setError("");

      const response = await api.get("/admin/categories");

      console.log(
  "Category details:",
  JSON.stringify(response.data.categories, null, 2)
);
setCategories(response.data.categories || []);
    } catch (err) {
      setError(
        err.response?.data?.message || "Unable to load categories."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // Handle form changes
  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // Reset form
  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
  };

  // Add or update category
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);
      setError("");
      setMessage("");

      const payload = {
        name: form.name.trim(),
        description: form.description.trim(),
        image_url: form.image_url.trim(),
      };

      if (editingId) {
        await api.put(`/admin/categories/${editingId}`, payload);
        setMessage("Category updated successfully.");
      } else {
        await api.post("/admin/categories", payload);
        setMessage("Category added successfully.");
      }

      resetForm();
      await fetchCategories();
    } catch (err) {
      setError(
        err.response?.data?.message || "Unable to save category."
      );
    } finally {
      setSaving(false);
    }
  };

  // Edit category
  const handleEdit = (category) => {
    setEditingId(category.id);

    setForm({
      name: category.name || "",
      description: category.description || "",
      image_url: category.image_url || "",
    });

    setError("");
    setMessage("");

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Delete category
  const handleDelete = async (category) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${category.name}"?`
    );

    if (!confirmed) return;

    try {
      setError("");
      setMessage("");

      await api.delete(`/admin/categories/${category.id}`);

      setMessage("Category deleted successfully.");
      await fetchCategories();
    } catch (err) {
      setError(
        err.response?.data?.message || "Unable to delete category."
      );
    }
  };

  if (loading) {
    return (
      <div className="admin-dashboard">
        Loading categories...
      </div>
    );
  }

  return (
    <div className="admin-dashboard">

      <div className="dashboard-heading">
        <div>
          <h1>Categories</h1>
          <p>Organize your café menu into categories.</p>
        </div>

        <button
          className="refresh-btn"
          type="button"
          onClick={fetchCategories}
        >
          Refresh
        </button>
      </div>

      {error && (
        <p className="dashboard-error" role="alert">
          {error}
        </p>
      )}

      {message && (
        <p className="product-success" role="status">
          {message}
        </p>
      )}

      {/* CATEGORY FORM */}
      <section className="product-form-section">
        <h2>
          {editingId ? "Edit Category" : "Add New Category"}
        </h2>

        <form className="product-form" onSubmit={handleSubmit}>
          <div className="product-form-grid">

            <div className="form-group full-width">
              <label htmlFor="category-name">
                Category Name
              </label>

              <input
                id="category-name"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="e.g. Coffee"
                maxLength={100}
                required
              />
            </div>

            <div className="form-group full-width">
              <label htmlFor="category-description">
                Description
              </label>

              <textarea
                id="category-description"
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder="Describe this category..."
                rows="3"
              />
            </div>

            <div className="form-group full-width">
              <label htmlFor="category-image">
                Image URL
              </label>

              <input
                id="category-image"
                name="image_url"
                type="url"
                value={form.image_url}
                onChange={handleChange}
                placeholder="https://example.com/image.jpg"
              />
            </div>

          </div>

          <div className="product-form-actions">
            <button type="submit" disabled={saving}>
              {saving
                ? "Saving..."
                : editingId
                  ? "Update Category"
                  : "Add Category"}
            </button>

            {editingId && (
              <button
                type="button"
                className="cancel-btn"
                onClick={resetForm}
              >
                Cancel Edit
              </button>
            )}
          </div>
        </form>
      </section>

      {/* CATEGORY LIST */}
      <section className="product-list-section">
        <h2>All Categories ({categories.length})</h2>

        {categories.length === 0 ? (
          <p>No categories found.</p>
        ) : (
          <div className="admin-categories-grid">

            {categories.map((category) => (
              <div
                className="admin-category-card"
                key={category.id}
              >
                {category.image_url ? (
                  <img
                    src={category.image_url}
                    alt={category.name}
                  />
                ) : (
                  <div className="admin-category-placeholder">
                    No Image
                  </div>
                )}

                <div className="admin-category-info">
                  <h3>{category.name}</h3>

                  <p>
                    {category.description || "No description"}
                  </p>

                  <span>
                    Products: {category.product_count}
                  </span>

                  <div className="admin-product-actions">
                    <button
                      type="button"
                      onClick={() => handleEdit(category)}
                    >
                      Edit
                    </button>

                    <button
                      type="button"
                      className="delete-btn"
                      onClick={() => handleDelete(category)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}

          </div>
        )}
      </section>

    </div>
  );
}

export default AdminCategories;
