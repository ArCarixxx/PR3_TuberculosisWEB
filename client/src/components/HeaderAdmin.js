import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import "../Header.css";

const Header = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const nombreUsuario =
    localStorage.getItem("userNombre") ||
    localStorage.getItem("userNombreCompleto") ||
    "Usuario";

  const rolUsuario =
    localStorage.getItem("userRol") ||
    localStorage.getItem("rol") ||
    "Administrador";

  const nombreCompleto =
    localStorage.getItem("userNombreCompleto") ||
    localStorage.getItem("userNombre") ||
    "Usuario";

  const inicial = useMemo(() => {
    return nombreUsuario?.trim()?.charAt(0)?.toUpperCase() || "U";
  }, [nombreUsuario]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setUserDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userNombre");
    localStorage.removeItem("userNombreCompleto");
    localStorage.removeItem("nombre");
    localStorage.removeItem("usuario");
    localStorage.removeItem("userRol");
    localStorage.removeItem("rol");
    localStorage.removeItem("userIdPersona");
    localStorage.removeItem("userEstablecimiento");
    localStorage.removeItem("userIdEstablecimiento");

    navigate("/");
  };

  const navItems = [
    { path: "/lista-personal-salud", label: "Personal Salud" },
    { path: "/lista-pacientes", label: "Pacientes" },
    { path: "/transferencia", label: "Transferencia" },
    { path: "/videos", label: "Videos" },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <header className="header">
      <nav className="custom-navbar">
        <div className="navbar-left">
          <Link className="navbar-brand" to="/homea">
            <div className="brand-logo">TB</div>
            <div className="brand-text">
              <span className="brand-title">Sistema Tuberculosis</span>
              <span className="brand-subtitle">SEDES Cochabamba</span>
            </div>
          </Link>
        </div>

        <button
          className={`menu-toggle ${menuOpen ? "open" : ""}`}
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Abrir menú"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>

        <div className={`navbar-center ${menuOpen ? "show" : ""}`}>
          <ul className="nav-links">
            {navItems.map((item) => (
              <li className="nav-item" key={item.path}>
                <Link
                  className={`nav-link ${isActive(item.path) ? "active" : ""}`}
                  to={item.path}
                  onClick={() => setMenuOpen(false)}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className={`navbar-right ${menuOpen ? "show" : ""}`}>
          <div className="user-dropdown-wrapper" ref={dropdownRef}>
            <button
              className={`user-box user-box-button ${
                userDropdownOpen ? "active" : ""
              }`}
              onClick={() => setUserDropdownOpen(!userDropdownOpen)}
            >
              <div className="user-avatar">{inicial}</div>
              <div className="user-info">
                <span className="user-name">{nombreUsuario}</span>
                <span className="user-role">{rolUsuario}</span>
              </div>
              <span className={`dropdown-arrow ${userDropdownOpen ? "open" : ""}`}>
                ▼
              </span>
            </button>

            {userDropdownOpen && (
              <div className="user-dropdown-menu">
                <div className="dropdown-user-header">
                  <div className="dropdown-user-avatar">{inicial}</div>
                  <div className="dropdown-user-text">
                    <span className="dropdown-fullname">{nombreCompleto}</span>
                    <span className="dropdown-role">{rolUsuario}</span>
                  </div>
                </div>

                <div className="dropdown-divider"></div>

                <button
                  className="dropdown-item logout-item"
                  onClick={handleLogout}
                >
                  Cerrar sesión
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Header;