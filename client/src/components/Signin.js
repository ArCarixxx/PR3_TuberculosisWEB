/* src/components/Signin.js */

import React, { useState } from "react";
import './Signin.css';

const Signin = ({ usuario, setUsuario, contrasenia, setContrasenia, handleLogin }) => {
    const [passwordError, setPasswordError] = useState("");
    // VALIDAMOS EL CAMPO DE ENTRADA [usuario]
    const validateTextInput = (e) => {
        const regex = /^[A-Za-z]+$/; 
        if (!regex.test(e.key)) {
            e.preventDefault();
        }
    };
    const handleKeyPress = (e) => {
        // Prevenir el ingreso de espacio en blanco
        if (e.key === ' ') {
            e.preventDefault();
        }
    };
    // VALIDAMOS EL CAMPO DE ENTRADA [contrasenia]
    const validatePasswordInput = (e) => {
        //const regex = /^[A-Za-z0-9!@#$%^&*()_+{}\[\]:;<>,.?~\\/-]*$/; // Permite letras, números y caracteres especiales comunes
        //const regex = /^[A-Za-z0-9!@#$%^&*()_+{}\[\]:;<>,.?~\\/-]*$/;
        const regex = /^[0-9]*$/;
        const password = e.target.value;

        /*if (e.key === ' ') {
            e.preventDefault();
        }
        if (regex.test(e.key)) {
            e.preventDefault();
        }*/
        if (e.key === ' ' || !regex.test(e.key)) {
            e.preventDefault();
        }
        if (password.length > 0 && password[password.length - 1] === e.key) {
            e.preventDefault();
        }
    };
    // VALIDACIONES ADICIONALES
    /*const validatePassword = (password) => {
        const minLength = 7;
        const hasLetters = /[A-Za-z]/.test(password);
        const hasNumbers = /\d/.test(password);
        const hasSpecialChars = /[!@#$%^&*()_+{}\[\]:;<>,.?~\\/-]/.test(password);

        if (password.length < minLength) {
            return "La contraseña debe tener al menos 7 caracteres.";
        } else if (!hasLetters || !hasNumbers || !hasSpecialChars) {
            return "La contraseña debe incluir letras, números y caracteres especiales.";
        }
        return "";
    };*/
    const validatePassword = (password) => {
        const minLength = 7; 
        if (password.length < minLength) {
            return "La contraseña debe tener al menos 7 caracteres.";
        } else if (!/^\d+$/.test(password)) { 
            return "La contraseña debe contener solo números.";
        }
        return ""; // Retorna vacío si no hay errores
    };

    const handlePasswordChange = (e) => {
        setContrasenia(e.target.value);
        const errorMessage = validatePassword(e.target.value);
        setPasswordError(errorMessage);
    };
    const handleSubmit = (e) => {
        e.preventDefault();
        const errorMessage = validatePassword(contrasenia);
        if (errorMessage) {
            setPasswordError(errorMessage);
        } else {
            handleLogin(e);
        }
    };

     

    return (
        <section className="section-signin">
            <div className="box">
                <div className="container-doc">
                    <div className="top">
                        <span className="text-title">¿Tienes una cuenta?</span>
                        <h2>Inicie sesión en su cuenta</h2>
                    </div>

                    <form onSubmit={handleSubmit}>
                        <div className="input-field">
                            <input type="text" className="input" placeholder="Ingrese su nombre de usuario" value={usuario} onChange={(e) => setUsuario(e.target.value) } onKeyPress={validateTextInput} required></input>
                        </div>
                        <div className="input-field">
                            <input type="password" className="input" placeholder="Ingrese su contraseña" value={contrasenia} onChange={handlePasswordChange} onKeyPress={validatePasswordInput} required></input>
                            <i className="fa-solid fa-lock"></i>
                        </div>
                        {passwordError && <p className="error">{passwordError}</p>}
                        <div className="input-field btn-submit">
                            <button type="submit">Iniciar sesión</button>
                        </div>
                    </form>

                    <div className="btn-redirect">
                        <p>
                            <a href="./register">¿No tiene una cuenta? Regístrese</a>
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Signin;

