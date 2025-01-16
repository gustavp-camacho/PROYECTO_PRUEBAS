import React, { useState } from 'react';
import './Signup.css';

// Definimos la URL base de la API usando variables de entorno
const API_URL = process.env.REACT_APP_API_URL || 'http://18.216.192.185' || 'http://localhost:5000';


const Signup = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(`${API_URL}/api/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, username })
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(data.message);
        setError('');
      } else {
        setError(data.message);
        setSuccess('');
      }
    } catch (error) {
      setError('Error de conexión al servidor.');
      setSuccess('');
    }
  };

  return (
    <div className="signup-container">
      <h2>Crear Cuenta</h2>
      <form onSubmit={handleSubmit}>
        <label>
          Nombre de la Cuenta:
          <input
            type="text"
            placeholder="Nombre de usuario"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </label>
        <label>
          Correo Electrónico:
          <input
            type="email"
            placeholder="Correo electrónico"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </label>
        <label>
          Contraseña:
          <input
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </label>
        <button type="submit">Registrar</button>
      </form>
      {error && <p className="error-message">{error}</p>}
      {success && <p className="success-message">{success}</p>}
      <p>¿Ya tienes una cuenta? <a href="/">Iniciar Sesión</a></p>
    </div>
  );
};

export default Signup;