import Layout from "../components/LayoutAdmin";
import React from "react";
import "./Home.css";

const Home = () => {
  return (
    <Layout>
      <div className="home-container">
        {/* HERO */}
        <section className="hero-section">
          <div className="overlay"></div>
          <div className="hero-content">
            <h1>Programa Departamental de Tuberculosis</h1>
            <h2>SEDES Cochabamba</h2>
            <p>
              Comprometidos con la detección temprana, diagnóstico oportuno y tratamiento gratuito de la tuberculosis.
            </p>
          </div>
        </section>

        {/* INFO */}
        <section className="info">
          <h2>🩺 Conozca más sobre la Tuberculosis</h2>
          <div className="info-grid">
            <div className="info-card">
              <h3>¿Qué es?</h3>
              <p>
                La tuberculosis (TB) es una enfermedad infecciosa causada por la bacteria <em>Mycobacterium tuberculosis</em>.
                Afecta principalmente los pulmones, pero puede dañar otras partes del cuerpo.
              </p>
            </div>
            <div className="info-card">
              <h3>Cómo se transmite</h3>
              <p>
                Se propaga por el aire cuando una persona enferma tose, habla o estornuda. La detección temprana
                y el tratamiento son claves para detener su propagación.
              </p>
            </div>
            <div className="info-card">
              <h3>Tratamiento</h3>
              <p>
                El tratamiento es gratuito y altamente efectivo, supervisado por el equipo médico especializado
                del programa departamental.
              </p>
            </div>
          </div>
        </section>

        {/* PARALLAX IMPACT */}
        <section className="impact parallax">
          <div className="impact-overlay"></div>
          <div className="impact-content">
            <h2>Impacto en la Salud Pública</h2>
            <div className="stats">
              <div className="stat">
                <h3>+10,000</h3>
                <p>Pacientes tratados con éxito</p>
              </div>
              <div className="stat">
                <h3>98%</h3>
                <p>Tasa de recuperación</p>
              </div>
              <div className="stat">
                <h3>100%</h3>
                <p>Tratamientos gratuitos</p>
              </div>
            </div>
          </div>
        </section>

        {/* LÍNEA DE TIEMPO */}
        <section className="timeline">
          <h2>🧭 Proceso de Atención al Paciente</h2>
          <div className="timeline-container">
            <div className="timeline-item">
              <div className="circle">1</div>
              <h3>Detección</h3>
              <p>
                El paciente acude a su establecimiento de salud donde se realiza una evaluación clínica y pruebas diagnósticas.
              </p>
            </div>
            <div className="timeline-item">
              <div className="circle">2</div>
              <h3>Diagnóstico</h3>
              <p>
                Con base en exámenes de laboratorio y radiografía, se confirma el diagnóstico de tuberculosis pulmonar o extrapulmonar.
              </p>
            </div>
            <div className="timeline-item">
              <div className="circle">3</div>
              <h3>Tratamiento</h3>
              <p>
                El paciente recibe medicación gratuita y supervisada, con seguimiento médico y apoyo psicológico hasta su recuperación.
              </p>
            </div>
          </div>
        </section>

      </div>
    </Layout>
  );
};

export default Home;
