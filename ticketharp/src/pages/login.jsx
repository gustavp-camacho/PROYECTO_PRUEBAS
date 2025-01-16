import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './login.css';

// Definimos la URL base de la API usando variables de entorno
const API_URL = process.env.REACT_APP_API_URL || 'http://18.216.192.185' || 'http://localhost:5000';

//COMENTARIO DE QUE HE AJUSTADO MIS DIRECCIONES
const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setIsLoading(true);
    setError('');
    
    try {
        console.log('Intentando login con:', formData);
        const response = await fetch(`${API_URL}/api/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });
        const data = await response.json();
        console.log('Respuesta completa del servidor:', data);
        
        if (response.ok) {
            localStorage.setItem('token', data.token);
            
            const userData = {
                username: data.username || data.user?.username || formData.email,
                email: data.email || data.user?.email,
                role: data.role || data.user?.role,
            };
            
            localStorage.setItem('user', JSON.stringify(userData));
            
            console.log('Datos guardados en localStorage:', {
                token: localStorage.getItem('token'),
                user: JSON.parse(localStorage.getItem('user'))
            });
            
            if (userData.role === 'admin') {
              navigate('/Menu_Admin');
            } else if (userData.role === 'user') {
              navigate('/Body');
            } else {
              navigate('/Body');
            }
        } else {
            setError(data.message || 'Error en la autenticación');
        }
    } catch (err) {
        console.error('Error detallado:', err);
        setError('Error de conexión con el servidor. Asegúrate de que el servidor esté activo.');
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      <h2>INICIAR SESIÓN</h2>
      <p>Bienvenido a la casa del mejor equipo de Beisbol del país</p>

      <form className="login-form" onSubmit={handleSubmit}>
        <label htmlFor="email">Correo Electrónico</label>
        <input
          type="email"
          id="email"
          name="email"
          placeholder="Correo Electrónico"
          value={formData.email}
          onChange={handleChange}
          disabled={isLoading}
          required
        />
        <label htmlFor="password">Contraseña</label>
        <input
          type="password"
          id="password"
          name="password"
          placeholder="Contraseña"
          value={formData.password}
          onChange={handleChange}
          disabled={isLoading}
          required
        />
        {error && (
          <div className="error-message" role="alert">
            {error}
          </div>
        )}
        <div className="account-options">
          <div className="create-account">
            <a href="/signup">CREAR CUENTA</a>
          </div>
          <div className="forgot-password">
            <a href="/resetP">Olvidé mi contraseña</a>
          </div>
        </div>
        <button 
          type="submit" 
          className="login-btn"
          disabled={isLoading}
        >
          {isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
        </button>
      </form>
    </div>
  );
};

export default Login;