// src/pages/Home.js
import React from 'react';
import Layout from '../components/Layout';
import './About.css';

const About = () => {
  return (
    <Layout>
      <section className="p-6 about">
        <h1 className="text-3xl font-bold">Historia</h1>
        <p>El Servicio Departamental de Salud de Cochabamba (SEDES) tiene sus raíces en la creación del Ministerio de Salubridad en 1938 bajo la presidencia del Tcnl. Germán Busch. En 1965, mediante Decreto Ley No. 7299, se fundó la Unidad Sanitaria Cochabamba con el apoyo de la OPS/OMS, enfocada en la atención pública de salud y la prevención de enfermedades.</p>
        <p>En 1978, durante la presidencia de Hugo Banzer, se aprobó el Código de Salud que estableció normas clave para la salud pública, abarcando desde la educación para la salud hasta la reglamentación de bancos de sangre.</p>
        <p>Con la Ley de Participación Popular en 1994, se transfirieron los bienes de infraestructura de salud a los gobiernos municipales. Luego, en 1995, la Ley de Descentralización Administrativa permitió al Prefecto administrar los recursos y supervisar los servicios de salud.</p>
        <p>Finalmente, en 1998, con el Decreto Supremo No. 25233, se estableció formalmente la estructura de los Servicios Departamentales de Salud (SEDES) como órganos desconcentrados, independientes y bajo la supervisión directa de la Prefectura.</p>
      </section>
    </Layout>
  );
};

export default About;
