
import { useEffect, useState } from "react";
import api from "../api/axios";
import "./Admin.css";

const emptyForm = {
  name: "",
  description: "",
  price: "",
  category_id: "",
  image_url: "",
  is_available: 1,
};

const emptyOptionForm = {
  option_name: "",
  additional_price: "",
};

function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [selectedImage, setSelectedImage] = useState(null);
  const [previewImage, setPreviewImage] = useState("");
  const [editingId, setEditingId] = useState(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const [optionProduct, setOptionProduct] = useState(null);
  const [options, setOptions] = useState([]);
  const [optionForm, setOptionForm] = useState(emptyOptionForm);
  const [editingOptionId, setEditingOptionId] = useState(null);
  const [optionsLoading, setOptionsLoading] = useState(false);
  const [optionSaving, setOptionSaving] = useState(false);

  // Fetch products
  const fetchProducts = async () => {
    try {
      setError("");

      const response = await api.get("/admin/products");

      setProducts(response.data.products || []);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load products.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Product form changes
  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // Select and preview image
  const handleImageChange = (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
    ];

    if (!allowedTypes.includes(file.type)) {
      setError("Please select a JPG, PNG or WEBP image.");
      e.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("Image size must be less than 5 MB.");
      e.target.value = "";
      return;
    }

    setError("");
    setMessage("");
    setSelectedImage(file);
    setPreviewImage(URL.createObjectURL(file));
  };

  // Upload image to Cloudinary
  const uploadImage = async () => {
    if (!selectedImage) return form.image_url;

    const imageData = new FormData();
    imageData.append("image", selectedImage);

    setUploading(true);

    try {
      const response = await api.post(
        "/admin/upload/product-image",
        imageData
      );

      return response.data.image_url;
    } finally {
      setUploading(false);
    }
  };

  // Reset product form
  const resetForm = () => {
    setForm(emptyForm);
    setSelectedImage(null);
    setPreviewImage("");
    setEditingId(null);

    const fileInput = document.getElementById("product-image-file");

    if (fileInput) fileInput.value = "";
  };

  // Add or update product
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);
      setError("");
      setMessage("");

      const uploadedImageUrl = await uploadImage();

      const payload = {
        ...form,
        price: Number(form.price),
        category_id: form.category_id || null,
        image_url: uploadedImageUrl,
        is_available: Number(form.is_available),
      };

      if (editingId) {
        await api.put(`/admin/products/${editingId}`, payload);
        setMessage("Product updated successfully.");
      } else {
        await api.post("/admin/products", payload);
        setMessage("Product added successfully.");
      }

      resetForm();
      await fetchProducts();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to save product.");
    } finally {
      setSaving(false);
    }
  };

  // Edit product
  const handleEdit = (product) => {
    setEditingId(product.id);

    setForm({
      name: product.name || "",
      description: product.description || "",
      price: String(product.price),
      category_id: product.category_id
        ? String(product.category_id)
        : "",
      image_url: product.image_url || "",
      is_available: Number(product.is_available),
    });

    setSelectedImage(null);
    setPreviewImage(product.image_url || "");
    setMessage("");
    setError("");

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Delete product
  const handleDelete = async (product) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${product.name}"?`
    );

    if (!confirmed) return;

    try {
      setError("");
      setMessage("");

      await api.delete(`/admin/products/${product.id}`);

      if (optionProduct?.id === product.id) {
        setOptionProduct(null);
        setOptions([]);
      }

      setMessage("Product deleted successfully.");
      await fetchProducts();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to delete product.");
    }
  };

  // Change availability
  const handleAvailability = async (product) => {
    try {
      setError("");
      setMessage("");

      await api.put(`/admin/products/${product.id}`, {
        name: product.name,
        description: product.description || "",
        price: Number(product.price),
        category_id: product.category_id,
        image_url: product.image_url || "",
        is_available:
          Number(product.is_available) === 1 ? 0 : 1,
      });

      setMessage("Product availability updated.");
      await fetchProducts();
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Unable to update product availability."
      );
    }
  };

  // Fetch product customizations
  const fetchProductOptions = async (productId) => {
    try {
      setOptionsLoading(true);
      setError("");

      const response = await api.get(
        `/admin/products/${productId}/options`
      );

      setOptions(response.data.options || []);
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Unable to load customization options."
      );
    } finally {
      setOptionsLoading(false);
    }
  };

  // Open customization manager
  const handleManageOptions = async (product) => {
    setOptionProduct(product);
    setOptions([]);
    setOptionForm(emptyOptionForm);
    setEditingOptionId(null);
    setMessage("");
    setError("");

    await fetchProductOptions(product.id);

    document
      .getElementById("product-options-section")
      ?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
  };

  // Customization form changes
  const handleOptionChange = (e) => {
    const { name, value } = e.target;

    setOptionForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // Add or update customization
  const handleOptionSubmit = async (e) => {
    e.preventDefault();

    if (!optionProduct) return;

    try {
      setOptionSaving(true);
      setError("");
      setMessage("");

      const payload = {
        option_name: optionForm.option_name.trim(),
        additional_price: Number(optionForm.additional_price),
      };

      if (editingOptionId) {
        await api.put(
          `/admin/products/${optionProduct.id}/options/${editingOptionId}`,
          payload
        );

        setMessage("Customization updated successfully.");
      } else {
        await api.post(
          `/admin/products/${optionProduct.id}/options`,
          payload
        );

        setMessage("Customization added successfully.");
      }

      setOptionForm(emptyOptionForm);
      setEditingOptionId(null);

      await fetchProductOptions(optionProduct.id);
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Unable to save customization."
      );
    } finally {
      setOptionSaving(false);
    }
  };

  // Edit customization
  const handleEditOption = (option) => {
    setEditingOptionId(option.id);

    setOptionForm({
      option_name: option.option_name,
      additional_price: String(option.additional_price),
    });
  };

  // Delete customization
  const handleDeleteOption = async (option) => {
    const confirmed = window.confirm(
      `Delete "${option.option_name}"?`
    );

    if (!confirmed || !optionProduct) return;

    try {
      setError("");
      setMessage("");

      await api.delete(
        `/admin/products/${optionProduct.id}/options/${option.id}`
      );

      setMessage("Customization deleted successfully.");

      if (editingOptionId === option.id) {
        setEditingOptionId(null);
        setOptionForm(emptyOptionForm);
      }

      await fetchProductOptions(optionProduct.id);
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Unable to delete customization."
      );
    }
  };

  if (loading) {
    return (
      <div className="admin-dashboard">
        Loading products...
      </div>
    );
  }

  return (
    <div className="admin-dashboard">

      <div className="dashboard-heading">
        <div>
          <h1>Products</h1>
          <p>Manage your café menu and product availability.</p>
        </div>

        <button
          className="refresh-btn"
          type="button"
          onClick={fetchProducts}
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

      {/* PRODUCT FORM */}
      <section className="product-form-section">
        <h2>{editingId ? "Edit Product" : "Add New Product"}</h2>

        <form className="product-form" onSubmit={handleSubmit}>
          <div className="product-form-grid">

            <div className="form-group">
              <label htmlFor="product-name">Product Name</label>
              <input
                id="product-name"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="e.g. Cappuccino"
                maxLength={150}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="product-price">Price (₹)</label>
              <input
                id="product-price"
                name="price"
                type="number"
                min="0"
                step="0.01"
                value={form.price}
                onChange={handleChange}
                placeholder="e.g. 150"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="product-category">Category ID</label>
              <input
                id="product-category"
                name="category_id"
                type="number"
                min="1"
                value={form.category_id}
                onChange={handleChange}
                placeholder="Leave empty if none"
              />
            </div>

            <div className="form-group">
              <label htmlFor="product-availability">Availability</label>
              <select
                id="product-availability"
                name="is_available"
                value={form.is_available}
                onChange={handleChange}
              >
                <option value={1}>Available</option>
                <option value={0}>Unavailable</option>
              </select>
            </div>

            <div className="form-group full-width">
              <label htmlFor="product-image-file">Product Image</label>

              <input
                id="product-image-file"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleImageChange}
              />

              <small>JPG, PNG or WEBP. Maximum size: 5 MB.</small>

              {previewImage && (
                <div className="product-image-preview">
                  <img src={previewImage} alt="Product preview" />
                </div>
              )}
            </div>

            <div className="form-group full-width">
              <label htmlFor="product-description">Description</label>
              <textarea
                id="product-description"
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder="Describe your product..."
                rows="3"
              />
            </div>

          </div>

          <div className="product-form-actions">
            <button type="submit" disabled={saving || uploading}>
              {uploading
                ? "Uploading Image..."
                : saving
                  ? "Saving..."
                  : editingId
                    ? "Update Product"
                    : "Add Product"}
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

      {/* PRODUCT LIST */}
      <section className="product-list-section">
        <h2>All Products ({products.length})</h2>

        {products.length === 0 ? (
          <p>No products found.</p>
        ) : (
          <div className="admin-products-grid">
            {products.map((product) => (
              <div className="admin-product-card" key={product.id}>
                {product.image_url ? (
                  <img
                    src={product.image_url}
                    alt={product.name}
                    className="admin-product-image"
                  />
                ) : (
                  <div className="admin-product-placeholder">
                    No Image
                  </div>
                )}

                <div className="admin-product-info">
                  <h3>{product.name}</h3>
                  <p>{product.category_name || "Uncategorized"}</p>

                  <strong>
                    ₹{Number(product.price).toFixed(2)}
                  </strong>

                  <span
                    className={
                      Number(product.is_available) === 1
                        ? "availability available"
                        : "availability unavailable"
                    }
                  >
                    {Number(product.is_available) === 1
                      ? "Available"
                      : "Unavailable"}
                  </span>

                  <div className="admin-product-actions">
                    <button
                      type="button"
                      onClick={() => handleManageOptions(product)}
                    >
                      Manage Extras
                    </button>

                    <button
                      type="button"
                      onClick={() => handleEdit(product)}
                    >
                      Edit
                    </button>

                    <button
                      type="button"
                      className="availability-btn"
                      onClick={() => handleAvailability(product)}
                    >
                      {Number(product.is_available) === 1
                        ? "Disable"
                        : "Enable"}
                    </button>

                    <button
                      type="button"
                      className="delete-btn"
                      onClick={() => handleDelete(product)}
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

      {/* CUSTOMIZATION MANAGER */}
      {optionProduct && (
        <section
          className="product-form-section"
          id="product-options-section"
        >
          <div className="dashboard-heading">
            <div>
              <h2>Manage Customizations</h2>
              <p>
                Product: <strong>{optionProduct.name}</strong>
              </p>
            </div>

            <button
              type="button"
              className="cancel-btn"
              onClick={() => {
                setOptionProduct(null);
                setOptions([]);
                setEditingOptionId(null);
                setOptionForm(emptyOptionForm);
              }}
            >
              Close
            </button>
          </div>

          <form className="product-form" onSubmit={handleOptionSubmit}>
            <div className="product-form-grid">
              <div className="form-group">
                <label htmlFor="option-name">Extra Name</label>
                <input
                  id="option-name"
                  name="option_name"
                  value={optionForm.option_name}
                  onChange={handleOptionChange}
                  placeholder="e.g. Extra Shot"
                  maxLength={100}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="option-price">
                  Additional Price (₹)
                </label>
                <input
                  id="option-price"
                  name="additional_price"
                  type="number"
                  min="0"
                  max="9999999.99"
                  step="0.01"
                  value={optionForm.additional_price}
                  onChange={handleOptionChange}
                  placeholder="e.g. 30"
                  required
                />
              </div>
            </div>

            <div className="product-form-actions">
              <button
                type="submit"
                disabled={
                  optionSaving ||
                  !optionForm.option_name.trim() ||
                  optionForm.additional_price === ""
                }
              >
                {optionSaving
                  ? "Saving..."
                  : editingOptionId
                    ? "Update Extra"
                    : "Add Extra"}
              </button>

              {editingOptionId && (
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={() => {
                    setEditingOptionId(null);
                    setOptionForm(emptyOptionForm);
                  }}
                >
                  Cancel Edit
                </button>
              )}
            </div>
          </form>

          <div className="product-list-section">
            <h3>Existing Extras</h3>

            {optionsLoading ? (
              <p>Loading customizations...</p>
            ) : options.length === 0 ? (
              <p>No customizations added to this product yet.</p>
            ) : (
              <div className="admin-products-grid">
                {options.map((option) => (
                  <div className="admin-product-card" key={option.id}>
                    <div className="admin-product-info">
                      <h3>{option.option_name}</h3>

                      <strong>
                        +₹{Number(option.additional_price).toFixed(2)}
                      </strong>

                      <div className="admin-product-actions">
                        <button
                          type="button"
                          onClick={() => handleEditOption(option)}
                        >
                          Edit
                        </button>

                        <button
                          type="button"
                          className="delete-btn"
                          onClick={() => handleDeleteOption(option)}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

    </div>
  );
}

export default AdminProducts;
