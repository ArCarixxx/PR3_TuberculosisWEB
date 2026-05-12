import Layout from "../components/Layout";
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
            <div className="hero-badge">
              <span>Programa Departamental de Salud</span>
            </div>

            <h1>Programa Departamental de Tuberculosis</h1>
            <h2>SEDES Cochabamba</h2>

            <p>
              Sistema integral orientado al seguimiento, control y apoyo en el
              tratamiento de pacientes con tuberculosis, fortaleciendo la
              gestión del programa a nivel departamental.
            </p>

            <div className="hero-highlights">
              <div className="highlight-item">Seguimiento continuo</div>
              <div className="highlight-item">Tratamiento gratuito</div>
              <div className="highlight-item">Atención integral</div>
            </div>
          </div>
        </section>

        {/* INFO */}
        <section className="info-section">
          <div className="section-header">
            <span className="section-tag">Información esencial</span>
            <h2>Conozca más sobre la Tuberculosis</h2>
            <p>
              Información clara y relevante sobre la enfermedad, su forma de
              transmisión y la importancia del tratamiento oportuno.
            </p>
          </div>

          <div className="info-grid">
            <div className="info-card">
              <h3>¿Qué es?</h3>
              <p>
                La tuberculosis (TB) es una enfermedad infecciosa causada por la
                bacteria <em> Mycobacterium tuberculosis</em>. Afecta
                principalmente los pulmones, aunque también puede comprometer
                otras partes del cuerpo.
              </p>
            </div>

            <div className="info-card">
              <h3>Cómo se transmite</h3>
              <p>
                Se propaga por el aire cuando una persona enferma tose, habla o
                estornuda. La detección temprana y el tratamiento adecuado son
                fundamentales para detener su propagación.
              </p>
            </div>

            <div className="info-card">
              <h3>Tratamiento</h3>
              <p>
                El tratamiento es gratuito y altamente efectivo cuando se
                cumple de manera correcta, con supervisión del personal de salud
                y seguimiento continuo.
              </p>
            </div>
          </div>
        </section>

        {/* IMPACTO */}
        <section className="impact-section">
          <div className="impact-overlay"></div>

          <div className="impact-content">
            <span className="section-tag light">Impacto del programa</span>
            <h2>Comprometidos con la Salud Pública</h2>
            <p>
              El programa fortalece la detección, el monitoreo y la adherencia
              al tratamiento, contribuyendo al control de la tuberculosis en el
              departamento.
            </p>

            <div className="stats">
              <div className="stat-card">
                <h3>+10,000</h3>
                <p>Pacientes tratados</p>
              </div>
              <div className="stat-card">
                <h3>98%</h3>
                <p>Tasa de adherencia</p>
              </div>
              <div className="stat-card">
                <h3>100%</h3>
                <p>Tratamiento gratuito</p>
              </div>
            </div>
          </div>
        </section>

        {/* PROCESO */}
        <section className="timeline-section">
          <div className="section-header">
            <span className="section-tag">Ruta de atención</span>
            <h2>Proceso de Atención al Paciente</h2>
            <p>
              El sistema acompaña las principales etapas de atención, desde la
              detección del caso hasta el seguimiento del tratamiento.
            </p>
          </div>

          <div className="timeline-container">
            <div className="timeline-item">
              <div className="circle">1</div>
              <h3>Detección</h3>
              <p>
                El paciente acude a su establecimiento de salud, donde se
                realiza una evaluación clínica inicial y se solicitan las
                pruebas necesarias.
              </p>
            </div>

            <div className="timeline-item">
              <div className="circle">2</div>
              <h3>Diagnóstico</h3>
              <p>
                Con base en estudios de laboratorio, exámenes clínicos y apoyo
                radiológico, se confirma el diagnóstico de tuberculosis.
              </p>
            </div>

            <div className="timeline-item">
              <div className="circle">3</div>
              <h3>Tratamiento</h3>
              <p>
                El paciente inicia tratamiento gratuito y supervisado, con
                seguimiento médico continuo hasta completar el esquema
                correspondiente.
              </p>
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
};

export default Home;