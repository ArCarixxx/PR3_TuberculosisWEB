import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min'; 

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Homea from './pages/Homea';
import Homeps from './pages/Homeps';
import Homesa from './pages/Homesa';
import Login from './pages/Login'; 
import ListaPersonalSalud from './pages/ListaPersonalSalud';
import ListaPersonalSaludSA from './pages/ListaPersonalSaludSA';
import RegistrarEstablecimiento from './pages/RegistrarEstablecimiento';
import RegistrarEstablecimientoSA from './pages/RegistrarEstablecimientoSA';
import RegistrarPersonalSalud from './pages/RegistrarPersonalSalud';
import RegistrarPersonalSaludSA from './pages/RegistrarPersonalSaludSA';
import ActualizarPersonalSalud from './pages/ActualizarPersonalSalud';
import ActualizarPersonalSaludSA from './pages/ActualizarPersonalSaludSA';
import Tratamiento from './pages/tratamiento';
import TratamientoSA from './pages/tratamientoSA';
import Paciente from './pages/Paciente';
import PacienteSA from './pages/PacienteSA';
import PacientePS from './pages/PacientePS';
import AñadirPaciente from './pages/AñadirPaciente';
import ActualizarPaciente from './pages/ActualizarPaciente';
import AñadirPacienteSA from './pages/AñadirPacienteSA';
import ActualizarPacienteSA from './pages/ActualizarPacienteSA';
import AñadirPacientePS from './pages/AñadirPacientePS';
import ActualizarPacientePS from './pages/ActualizarPacientePS';
import Establecimientos from './pages/ListaEstablecimientos';
import Transferencia from './pages/Transferencia';
import TransferenciaSA from './pages/TransferenciaSA';
import TransferenciaPS from './pages/TransferenciaPS';
import ListasTransferencias from './pages/ListaTransferencias';
import ListasTransferenciasSA from './pages/ListaTransferenciasSA';
import ListasTransferenciasPS from './pages/ListaTransferenciasPS';
import VideoList from './pages/VideoList';
import VideoListSA from './pages/VideoListSA';
import VideoListPS from './pages/VideoListPS';

function App() {
  return (
    <Router>
        <Routes>
        <Route path="/" element={<Login />} />
          <Route path="/Homea" element={<Homea />} />
          <Route path="/Homeps" element={<Homeps />} />
          <Route path="/Homesa" element={<Homesa />} />
          <Route path="/lista-personal-salud" element={<ListaPersonalSalud />} />
          <Route path="/lista-personal-saludSA" element={<ListaPersonalSaludSA />} />
          <Route path="/registrar-establecimiento" element={<RegistrarEstablecimiento />} />
          <Route path="/registrar-establecimientoSA" element={<RegistrarEstablecimientoSA />} />
          <Route path="/registrar-personal-salud" element={<RegistrarPersonalSalud />} />
          <Route path="/registrar-personal-saludSA" element={<RegistrarPersonalSaludSA />} />
          <Route path="/actualizar-personal-salud" element={<ActualizarPersonalSalud />} />
          <Route path="/actualizar-personal-saludSA" element={<ActualizarPersonalSaludSA />} />
          <Route path="/seguimiento-tratamientos" element={<Tratamiento />} />
          <Route path="/seguimiento-tratamientosSA" element={<TratamientoSA />} />
          <Route path="/lista-pacientes" element={<Paciente />} />
          <Route path="/lista-pacientesSA" element={<PacienteSA />} />
          <Route path="/lista-pacientesPS" element={<PacientePS />} />
          <Route path="/añadir-paciente" element={<AñadirPaciente />} /> 
          <Route path="/actualizar-paciente/:id" element={<ActualizarPaciente />} />
          <Route path="/añadir-pacienteSA" element={<AñadirPacienteSA />} /> 
          <Route path="/actualizar-pacienteSA/:id" element={<ActualizarPacienteSA />} />
          <Route path="/añadir-pacientePS" element={<AñadirPacientePS />} /> 
          <Route path="/actualizar-pacientePS/:id" element={<ActualizarPacientePS />} />
          <Route path="/lista-establecimientos" element={<Establecimientos />} />
          <Route path="/transferencia" element={<Transferencia />} />
          <Route path="/transferenciaPS" element={<TransferenciaPS />} />
          <Route path="/transferenciaSA" element={<TransferenciaSA />} />
          <Route path="/lista-transferencias" element={<ListasTransferencias />} />
          <Route path="/lista-transferenciasPS" element={<ListasTransferenciasPS />} />
          <Route path="/lista-transferenciasSA" element={<ListasTransferenciasSA />} />
          <Route path="/videos" element={<VideoList />} />
          <Route path="/videosSA" element={<VideoListSA />} />
          <Route path="/videosPS" element={<VideoListPS />} />
        </Routes>
    </Router>
  );
}

export default App;
