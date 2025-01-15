import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import './Header.css';


// Definimos la URL base de la API usando variables de entorno
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [menuVisible, setMenuVisible] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userData, setUserData] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    setSearchQuery('');
  }, [location.pathname]);

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    
    if (userStr && token) {
      try {
        const user = JSON.parse(userStr);
        setIsAuthenticated(true);
        setUserData(user);
      } catch (error) {
        console.error('Error al parsear datos del usuario:', error);
      }
    } else {
      setIsAuthenticated(false);
      setUserData(null);
    }
  }, []);

  const toggleMenu = () => {
    setMenuVisible(!menuVisible);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsAuthenticated(false);
    setUserData(null);
    setMenuVisible(false);
    navigate('/');
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (searchQuery.trim() === '') {
      alert('Por favor ingresa un término de búsqueda');
      return;
    }

    try {
      localStorage.removeItem('searchResults');
      const response = await fetch(
<<<<<<< HEAD
        `${API_URL}/api/events/search?query=${encodeURIComponent(searchQuery)}`,
=======
        `http://18.216.192.185:5000/api/events/search?query=${encodeURIComponent(searchQuery)}`,
>>>>>>> a61de8c94631b70ad58ce94c06abfe2f6378d579
        {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
        }
      );

      const data = await response.json();
      
      if (data.success) {
        localStorage.setItem('searchResults', JSON.stringify(data.events));
        if (location.pathname === '/search') {
          navigate('/');
          setTimeout(() => navigate('/search'), 0);
        } else {
          navigate('/search');
        }
      } else {
        alert('Hubo un error al buscar eventos. Por favor, inténtalo de nuevo más tarde.');
      }
    } catch (error) {
      alert('Hubo un error al buscar eventos. Por favor, inténtalo de nuevo más tarde.');
    }
  };

  // Cerrar el menú cuando se hace clic fuera de él
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuVisible && !event.target.closest('.user-profile-container')) {
        setMenuVisible(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [menuVisible]);

  return (
    <header className="header">
      <div className="logo">
        <Link to="/body">
          <img src="/logo.png" alt="Logo Estadio" />
        </Link>
      </div>
      
      <div className="search-bar">
        <form onSubmit={handleSearch}>
          <input
            type="text"
            placeholder="Buscar eventos..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button type="submit">Buscar</button>
        </form>
      </div>

      <div className="header-right">
        <a href="/centro_de_ayuda" className="help-link">Centro de Ayuda</a>
        <div className="user-profile-container">
          {isAuthenticated ? (
            <>
              <div className="user-profile" onClick={toggleMenu}>
                <div className="user-icon">
                  <img src="/usuario_logo.png" alt="Icono Usuario" />
                </div>
                <span className="user-name">{userData?.username || 'Usuario'}</span>
              </div>
              {menuVisible && (
                <div className="dropdown-menu active">
                  <ul>
                    <li><button onClick={handleLogout}>Cerrar sesión</button></li>
                  </ul>
                </div>
              )}

            </>
          ) : (
            <Link to="/login" className="login-link">Iniciar Sesión</Link>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;