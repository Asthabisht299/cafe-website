
import { useState } from "react";
import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { cartCount } = useCart();

  const closeMenu = () => setMenuOpen(false);

  return (
    <header className="navbar">
      <Link to="/" className="brand" onClick={closeMenu}>
        CAFÉ<span>.</span>
      </Link>

      <button
        className="menu-toggle"
        onClick={() => setMenuOpen(!menuOpen)}
        aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
        aria-expanded={menuOpen}
      >
        {menuOpen ? "✕" : "☰"}
      </button>

      <nav className={`nav-links ${menuOpen ? "active" : ""}`}>
        <Link to="/" onClick={closeMenu}>Home</Link>
        <Link to="/about" onClick={closeMenu}>About</Link>
        <Link to="/menu" onClick={closeMenu}>Menu</Link>
        <Link to="/gallery" onClick={closeMenu}>Gallery</Link>
        <Link to="/contact" onClick={closeMenu}>Contact</Link>
      </nav>

      <div className="navbar-actions">
        <Link to="/cart" className="cart-nav-link" onClick={closeMenu}>
          Cart ({cartCount})
        </Link>

        <Link to="/menu" className="nav-button" onClick={closeMenu}>
          Explore Menu
        </Link>
      </div>
    </header>
  );
}

export default Navbar;
