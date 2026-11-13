
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import WhatsAppButton from "./components/WhatsAppButton";

import Home from "./pages/Home";
import Menu from "./pages/Menu";
import ProductDetails from "./pages/ProductDetails";
import Gallery from "./pages/Gallery";
import Contact from "./pages/Contact";
import About from "./pages/About";

import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import OrderTracking from "./pages/OrderTracking";

import AdminLogin from "./admin/AdminLogin";
import AdminLayout from "./admin/AdminLayout";
import AdminDashboard from "./admin/AdminDashboard";
import AdminOrders from "./admin/AdminOrders";
import AdminProducts from "./admin/AdminProducts";
import AdminCategories from "./admin/AdminCategories";
import AdminEnquiries from "./admin/AdminEnquiries";
import TableOrder from "./pages/TableOrder";
import AdminTableQR from "./admin/AdminTableQR";
import AdminTables from "./admin/AdminTables";
import AdminReviews from "./admin/AdminReviews";

import "./App.css";

function App() {
  return (
    <BrowserRouter>
      <Navbar />

      <Routes>
        {/* Customer routes */}
        <Route path="/" element={<Home />} />
        <Route path="/menu" element={<Menu />} />
        <Route path="/product/:id" element={<ProductDetails />} />
        <Route path="/gallery" element={<Gallery />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/about" element={<About />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/track/:token" element={<OrderTracking />} />
        <Route path="/table/:tableNumber" element={<TableOrder />} />

        {/* Admin login */}
        <Route path="/admin/login" element={<AdminLogin />} />

        {/* Admin dashboard and management routes */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="orders" element={<AdminOrders />} />
          <Route path="products" element={<AdminProducts />} />
          <Route path="categories" element={<AdminCategories />} />
          <Route path="enquiries" element={<AdminEnquiries />} />
          <Route path="table-qr" element={<AdminTableQR />} />
          <Route path="tables" element={<AdminTables />} />
          <Route path="reviews" element={<AdminReviews />} />
        </Route>
      </Routes>

      <Footer />

      {/* Floating WhatsApp button */}
      <WhatsAppButton />
    </BrowserRouter>
  );
}

export default App;
