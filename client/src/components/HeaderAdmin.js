import React from 'react';
import { Link } from 'react-router-dom';
import '../App.css'; 

const Header = () => {
  return (
    <header className="header">
      <nav className="navbar navbar-expand-lg navbar-dark custom-bg">
        <div className="container">
          <Link className="navbar-brand" to="/homea">Sistema Tuberculosis</Link>
          <button 
            className="navbar-toggler" 
            type="button" 
            data-bs-toggle="collapse" 
            data-bs-target="#navbarNav" 
            aria-controls="navbarNav" 
            aria-expanded="false" 
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse" id="navbarNav">
            <ul className="navbar-nav mx-auto justify-content-center">
              
              <li className="nav-item">
                <Link className="nav-link" to="/lista-personal-salud">Personal Salud</Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/lista-pacientes">Pacientes</Link> 
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/transferencia">Transferencia</Link> 
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/videos">Videos</Link> 
              </li>
              <li className="nav-item">
                <Link className="nav-link logout" to="/">Cerrar Sesión</Link>
              </li>
            </ul>
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Header;
