import React from "react";
import "./Footer.css";

const Footer = () => {
  return (
    <footer className="footer">
      {/* Botón ir arriba */}
      <a href="#top" className="go-top" title="Volver arriba">
        <span className="arrow-up">▲</span>
      </a>

        <div className="footer-bottom">
          <p>
            © {new Date().getFullYear()} Programa de Tuberculosis – SEDES Cochabamba.{" "}
            <span>Todos los derechos reservados.</span>
          </p>
        </div>
    </footer>
  );
};

export default Footer;
