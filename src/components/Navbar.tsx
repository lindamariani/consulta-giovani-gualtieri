import { useState } from "react";
import { Menu, X } from "lucide-react";
import { Link } from "react-router-dom";

import logoConsulta from "../assets/logo-consulta.png";

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  const closeMenu = () => {
    setMenuOpen(false);
  };

  return (
    <header className="navbar">
      <div className="navbar-inner">
        <Link
          to="/"
          className="navbar-logo"
          onClick={closeMenu}
        >
          <img
            src={logoConsulta}
            alt="Consulta Giovani Gualtieri"
            className="navbar-logo-image"
          />

          <div className="navbar-logo-text">
            <strong>Consulta Giovani</strong>
            <span>Gualtieri</span>
          </div>
        </Link>

        <nav className="desktop-nav">
          <Link to="/eventi">
            Eventi
          </Link>

          <Link to="/consulta">
            La Consulta
          </Link>

          <Link to="/#gallery">
            Gallery
          </Link>

          <Link to="/idee">
            Dicci la tua
          </Link>

          <Link
            to="/prenota"
            className="nav-booking"
          >
            Prenota
          </Link>
        </nav>

        <button
          className="mobile-menu-button"
          onClick={() =>
            setMenuOpen((prev) => !prev)
          }
          aria-label={
            menuOpen
              ? "Chiudi menu"
              : "Apri menu"
          }
        >
          {menuOpen ? (
            <X size={27} />
          ) : (
            <Menu size={27} />
          )}
        </button>
      </div>

      {menuOpen && (
        <nav className="mobile-nav">
          <Link
            to="/eventi"
            onClick={closeMenu}
          >
            Eventi
          </Link>

          <Link
            to="/consulta"
            onClick={closeMenu}
          >
            La Consulta
          </Link>

          <Link
            to="/#gallery"
            onClick={closeMenu}
          >
            Gallery
          </Link>

          <Link
            to="/idee"
            onClick={closeMenu}
          >
            Dicci la tua
          </Link>

          <Link
            to="/prenota"
            className="mobile-booking"
            onClick={closeMenu}
          >
            Prenota un campo
          </Link>
        </nav>
      )}
    </header>
  );
}

export default Navbar;