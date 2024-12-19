import React, { useState, useEffect } from 'react';
import './PassFor.css';

const DeleteEvents = () => {
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    eventId: '',
    username: '',
    adminPassword: ''
  });
  const [selectedDate, setSelectedDate] = useState({
    year: new Date().getFullYear(),
    month: new Date().getMonth() + 1
  });

  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

  // Array de meses para el selector
  const months = [
    { value: 1, label: 'Enero' },
    { value: 2, label: 'Febrero' },
    { value: 3, label: 'Marzo' },
    { value: 4, label: 'Abril' },
    { value: 5, label: 'Mayo' },
    { value: 6, label: 'Junio' },
    { value: 7, label: 'Julio' },
    { value: 8, label: 'Agosto' },
    { value: 9, label: 'Septiembre' },
    { value: 10, label: 'Octubre' },
    { value: 11, label: 'Noviembre' },
    { value: 12, label: 'Diciembre' }
  ];

  // Generar array de años (desde 2024 hasta 5 años en el futuro)
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 6 }, (_, i) => currentYear + i);

  const fetchEvents = async () => {
    try {
      setIsLoading(true);
      
      const response = await fetch(`${API_URL}/api/events/calendar?year=${selectedDate.year}&month=${selectedDate.month}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || `Error del servidor: ${response.status}`);
      }

      if (data.success) {
        setEvents(data.events || []);
      } else {
        throw new Error(data.message || 'Error al cargar los eventos');
      }
    } catch (error) {
      console.error('Error al cargar eventos:', error);
      setError('Error al cargar los eventos: ' + error.message);
      setEvents([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [selectedDate]); // Se ejecuta cuando cambia el mes o año seleccionado

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
  };

  const handleDateChange = (e) => {
    const { name, value } = e.target;
    setSelectedDate(prev => ({
      ...prev,
      [name]: parseInt(value)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.eventId) {
      setError('Por favor seleccione un evento');
      return;
    }

    if (!formData.username || !formData.adminPassword) {
      setError('Por favor complete todos los campos');
      return;
    }

    if (!window.confirm('¿Está seguro que desea eliminar este evento? Esta acción no se puede deshacer.')) {
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch(`${API_URL}/api/events/${formData.eventId}`, {
        method: 'DELETE',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          username: formData.username,
          adminPassword: formData.adminPassword
        })
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || `Error del servidor: ${response.status}`);
      }

      if (data.success) {
        alert('Evento eliminado exitosamente');
        setFormData({
          eventId: '',
          username: '',
          adminPassword: ''
        });
        await fetchEvents();
      } else {
        throw new Error(data.message || 'Error al eliminar el evento');
      }
    } catch (error) {
      console.error('Error:', error);
      setError(error.message || 'Error al eliminar el evento');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="delete-events-container">
      <div className="logo">
        <img src="Yankees_logo.png" alt="Logo Estadio" />
      </div>
      <h2>Eliminar Evento</h2>
      {error && <div className="error-message">{error}</div>}
      
      <form onSubmit={handleSubmit} className="delete-events-form">
        <div className="form-content">
          {/* Selectores de mes y año */}
          <div className="date-selectors">
            <select
              name="month"
              value={selectedDate.month}
              onChange={handleDateChange}
              disabled={isLoading}
            >
              {months.map(month => (
                <option key={month.value} value={month.value}>
                  {month.label}
                </option>
              ))}
            </select>

            <select
              name="year"
              value={selectedDate.year}
              onChange={handleDateChange}
              disabled={isLoading}
            >
              {years.map(year => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>

          <select
            name="eventId"
            value={formData.eventId}
            onChange={handleChange}
            disabled={isLoading}
            required
          >
            <option value="">Seleccione un evento</option>
            {events.map(event => (
              <option key={event.id} value={event.id}>
                {event.name} - {event.localTeam} vs {event.visitorTeam} - {new Date(event.date).toLocaleDateString()}
              </option>
            ))}
          </select>

          <input
            type="text"
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
            disabled={isLoading || !formData.eventId}
            className={isLoading ? 'loading' : ''}
          >
            {isLoading ? 'Eliminando evento...' : 'Eliminar evento'}
          </button>
          
          <p><a href="/Menu_Admin">Salir</a></p>
        </div>
      </form>
    </div>
  );
};

export default DeleteEvents;