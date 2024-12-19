// CreateEvents.jsx - ARCHIVO COMPLETO MODIFICADO
import React, { useState } from 'react';
import './CreateEvents.css';

const CreateEvents = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    eventName: '',
    localTeam: '',
    visitorTeam: '',
    eventDate: '',
    VIP: '',
    P_B_Cen: '',
    P_B_Lat_Oro: '',
    P_B_Lat_Plata: '',
    P_B_Lat_Bronce: '',
    P_A_Cen: '',
    P_A_Lat: '',
    Berma_G_Der: '',
    Berma_G_Izq: '',
    username: '',
    adminPassword: '',
    // Configuración de asientos agregada aquí
    seatingConfig: {
      VIP: { rows: 6, seatsPerRow: 10 },          // 60 asientos
      P_B_Cen: { rows: 20, seatsPerRow: 20 },     // 400 asientos
      P_B_Lat_Oro: { rows: 10, seatsPerRow: 40 },  // 300 asientos
      P_B_Lat_Plata: { rows: 10, seatsPerRow: 30 }, // 300 asientos
      P_B_Lat_Bronce: { rows: 10, seatsPerRow: 30 }, // 300 asientos
      P_A_Cen: { rows: 10, seatsPerRow: 25 },     // 250 asientos
      P_A_Lat: { rows: 10, seatsPerRow: 15 },     // 150 asientos
      Berma_G_Der: { rows: 6, seatsPerRow: 20 },  // 120 asientos
      Berma_G_Izq: { rows: 6, seatsPerRow: 20 }   // 120 asientos
    }
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No hay token de autenticación');
      }

      const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
      
      const response = await fetch(`${API_URL}/api/events`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      let data;
      try {
        data = await response.json();
      } catch (jsonError) {
        console.error('Error al parsear JSON:', jsonError);
        throw new Error('Error en la respuesta del servidor');
      }

      if (!response.ok) {
        throw new Error(data.message || 'Error al crear el evento');
      }

      if (data.success) {
        alert('Evento y asientos creados exitosamente');
        setFormData({
          eventName: '',
          localTeam: '',
          visitorTeam: '',
          eventDate: '',
          VIP: '',
          P_B_Cen: '',
          P_B_Lat_Oro: '',
          P_B_Lat_Plata: '',
          P_B_Lat_Bronce: '',
          P_A_Cen: '',
          P_A_Lat: '',
          Berma_G_Der: '',
          Berma_G_Izq: '',
          username: '',
          adminPassword: '',
          seatingConfig: formData.seatingConfig // Mantener la configuración de asientos
        });
      }
    } catch (error) {
      console.error('Error completo:', error);
      setError(error.message || 'Error al crear el evento');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="create-events-container">
      <div className="logo">
        <img src="Yankees_logo.png" alt="Logo Estadio" />
      </div>
      <h2 >Crear Nuevo Evento</h2>
      {error && <div className="error-message">{error}</div>}
      
      <form onSubmit={handleSubmit} className="create-events-form">
        <div className="left-column">
          <input
            name="eventName"
            placeholder="Nombre del evento"
            value={formData.eventName}
            onChange={handleChange}
            disabled={isLoading}
            required
          />
          <input
            name="localTeam"
            placeholder="Equipo local"
            value={formData.localTeam}
            onChange={handleChange}
            disabled={isLoading}
            required
          />
          <input
            name="visitorTeam"
            placeholder="Equipo visitante"
            value={formData.visitorTeam}
            onChange={handleChange}
            disabled={isLoading}
            required
          />
          <input
            name="eventDate"
            type="date"
            value={formData.eventDate}
            onChange={handleChange}
            disabled={isLoading}
            min={new Date().toISOString().split('T')[0]}
            required
          />
          
        </div>
        <div className="left-column">
        <input
            name="VIP"
            type="number"
            step="100"
            placeholder="Precio VIP"
            value={formData.VIP}
            onChange={handleChange}
            disabled={isLoading}
            min="0"
            required
          />
          <input
            name="P_B_Cen"
            type="number"
            step="100"
            placeholder="Precio P_B_Cen"
            value={formData.P_B_Cen}
            onChange={handleChange}
            disabled={isLoading}
            min="0"
            required
          />
          <input
            name="P_B_Lat_Oro"
            type="number"
            step="100"
            placeholder="Precio P_Lat_Oro"
            value={formData.P_B_Lat_Oro}
            onChange={handleChange}
            disabled={isLoading}
            min="0"
            required
          />
          <input
            name="P_B_Lat_Plata"
            type="number"
            step="100"
            placeholder="Precio P_B_Lat_Plata"
            value={formData.P_B_Lat_Plata}
            onChange={handleChange}
            disabled={isLoading}
            min="0"
            required
          />
          <input
            name="P_B_Lat_Bronce"
            type="number"
            step="100"
            placeholder="Precio P_B_Lat_Bronce"
            value={formData.P_B_Lat_Bronce}
            onChange={handleChange}
            disabled={isLoading}
            min="0"
            required
          />
          <input
            name="P_A_Cen"
            type="number"
            step="100"
            placeholder="Precio P_A_Cen"
            value={formData.P_A_Cen}
            onChange={handleChange}
            disabled={isLoading}
            min="0"
            required
          />
          <input
            name="P_A_Lat"
            type="number"
            step="100"
            placeholder="Precio P_A_Lat"
            value={formData.P_A_Lat}
            onChange={handleChange}
            disabled={isLoading}
            min="0"
            required
          />
          <input
            name="Berma_G_Der"
            type="number"
            step="100"
            placeholder="Precio Berma_G_Der"
            value={formData.Berma_G_Der}
            onChange={handleChange}
            disabled={isLoading}
            min="0"
            required
          />
          <input
            name="Berma_G_Izq"
            type="number"
            step="100"
            placeholder="Precio Berma_G_Izq"
            value={formData.Berma_G_Izq}
            onChange={handleChange}
            disabled={isLoading}
            min="0"
            required
          />
          
        </div>

        <div className="right-column">
          <input
            name="username"
            placeholder="Nombre de usuario administrador"
            value={formData.username}
            onChange={handleChange}
            disabled={isLoading}
            required
          />
          <input
            type="password"
            name="adminPassword"
            placeholder="Contraseña de administrador"
            value={formData.adminPassword}
            onChange={handleChange}
            disabled={isLoading}
            required
          />
          <button 
            type="submit" 
            disabled={isLoading}
            className={isLoading ? 'loading' : ''}
          >
            {isLoading ? 'Creando evento...' : 'Crear evento'}
          </button>
          <p><a href="/Menu_Admin">Salir</a></p>
        </div>
      </form>
    </div>
  );
};

export default CreateEvents;
