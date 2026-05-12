import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

import { SocketProvider } from "./contexts/SocketContext";
import { Toaster } from "react-hot-toast";

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <SocketProvider>
    <React.StrictMode>  
      <div id='main'></div>
      
      <Toaster position="top-right" />
      <App />
    </React.StrictMode>  
  </SocketProvider>
);


