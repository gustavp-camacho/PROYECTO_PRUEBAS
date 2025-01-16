import React, { useState } from 'react';
import './PassFor.css';

// Definimos la URL base de la API usando variables de entorno
const API_URL = process.env.REACT_APP_API_URL || 'http://18.216.192.185' || 'http://localhost:5000';


const ResetPassword = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch(`${API_URL}/api/reset-password`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ email })
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('Si el correo existe en nuestra base de datos, recibirás las instrucciones para restablecer tu contraseña.');
        setEmail(''); // Limpiar el campo de email después de un envío exitoso
      } else {
        setError(data.message || 'Error al procesar la solicitud');
      }
    } catch (error) {
      setError('Error de conexión al servidor. Por favor, intenta más tarde.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="reset-password-container">
      <h2>Restablecer Contraseña</h2>
      <p className="instructions">
        Ingresa tu correo electrónico y te enviaremos las instrucciones para restablecer tu contraseña.
      </p>
      
      <form onSubmit={handleSubmit}>
        <label>
          Correo Electrónico:
          <input
            type="email"
            placeholder="Ingresa tu correo electrónico"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isLoading}
            required
          />
        </label>
        
        <button 
          type="submit"
          disabled={isLoading || !email}
          className={isLoading ? 'loading' : ''}
        >
          {isLoading ? 'Procesando...' : 'Enviar Instrucciones'}
        </button>
      </form>

      {error && <p className="error-message">{error}</p>}
      {success && <p className="success-message">{success}</p>}

      <div className="links">
        <p><a href="/">Volver a Iniciar Sesión</a></p>
      </div>
    </div>
  );
};

export default ResetPassword;