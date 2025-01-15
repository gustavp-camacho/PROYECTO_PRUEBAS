//Calendar.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';


// Definimos la URL base de la API usando variables de entorno
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const Calendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const navigate = useNavigate();

  const fetchEvents = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth() + 1;
      
      const response = await fetch(`${API_URL}/api/events/calendar?year=${year}&month=${month}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
      });
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
  
      const data = await response.json();
      
      if (data.success) {
        const eventsByDay = {};
        data.events.forEach(event => {
          // Corregimos el problema de la fecha
          const eventDate = new Date(event.date);
          const day = eventDate.getUTCDate(); // Usamos getUTCDate() en lugar de getDate()
          if (!eventsByDay[day]) {
            eventsByDay[day] = [];
          }
          eventsByDay[day].push({
            id: event.id,
            name: `${event.localTeam} vs ${event.visitorTeam}`,
            date: eventDate,
            localTeam: event.localTeam,
            visitorTeam: event.visitorTeam
          });
        });
        setEvents(eventsByDay);
      } else {
        throw new Error(data.message || 'Error al cargar eventos');
      }
    } catch (error) {
      console.error('Error en fetchEvents:', error);
      setError(error.message);
      setEvents({});
    } finally {
      setLoading(false);
    }
  }, [currentDate]);
  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const daysInMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth() + 1,
    0
  ).getDate();

  const firstDayOfMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    1
  ).getDay();

  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

  const previousMonth = () => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(newDate.getMonth() - 1);
      return newDate;
    });
  };

  const nextMonth = () => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(newDate.getMonth() + 1);
      return newDate;
    });
  };

  const isToday = (day) => {
    const today = new Date();
    return (
      day === today.getDate() &&
      currentDate.getMonth() === today.getMonth() &&
      currentDate.getFullYear() === today.getFullYear()
    );
  };

  const handleDayClick = (day) => {
    const eventsForDay = events[day];
    if (eventsForDay && eventsForDay.length > 0) {
      if (eventsForDay.length === 1) {
        navigate(`/SelectTickets/${eventsForDay[0].id}`);
      } else {
        setSelectedEvent({ day, events: eventsForDay });
      }
    }
  };

  if (error) {
    return (
      <div className="error-container">
        <div className="error-message">
          <h3>Error al cargar el calendario</h3>
          <p>{error}</p>
          <button onClick={fetchEvents} className="retry-button">
            Intentar de nuevo
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="calendar-container">
        <div className="calendar-header">
          <div className="header-controls">
            <button 
              onClick={previousMonth}
              className="month-button"
              disabled={loading}
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            
            <h2 className="month-title">
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </h2>
            
            <button 
              onClick={nextMonth}
              className="month-button"
              disabled={loading}
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
          
          <div className="weekdays-grid">
            {dayNames.map(day => (
              <div key={day} className="weekday">
                {day}
              </div>
            ))}
          </div>
          
          <div className="days-grid">
            {Array(firstDayOfMonth).fill(null).map((_, index) => (
              <div key={`empty-${index}`} className="empty-cell" />
            ))}
            
            {Array(daysInMonth).fill(null).map((_, index) => {
              const day = index + 1;
              const hasEvent = events[day]?.length > 0;
              const isSelected = selectedEvent?.day === day;
              
              return (
                <div
                  key={day}
                  className={`day-cell ${isToday(day) ? 'current-day' : ''} 
                             ${hasEvent ? 'has-event' : ''} 
                             ${isSelected ? 'selected-day' : ''}`}
                  onClick={() => handleDayClick(day)}
                >
                  <div className="event-day">
                    {hasEvent && (
                      <img 
                        src="Yankees_logo.png" 
                        alt="evento" 
                        className="event-logo"
                        style={{
                          width: '16px',
                          height: '16px',
                          marginRight: '4px'
                        }}
                      />
                    )}
                    <span className="day-number">{day}</span>
                    {events[day]?.length > 1 && (
                      <span className="event-count">({events[day].length})</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {selectedEvent && (
        <div className="event-modal" onClick={() => setSelectedEvent(null)}>
          <div className="event-modal-content" onClick={e => e.stopPropagation()}>
            <h3>Eventos para el día {selectedEvent.day}</h3>
            <div className="event-list">
              {selectedEvent.events.map(event => (
                <button
                key={event.id}
                className="event-item"
                onClick={() => navigate(`/SelectTickets/${event.id}`)}
              >
                  <div className="event-details">
                    <strong>{event.name}</strong>
                    <div className="event-teams">
                      {event.localTeam} vs {event.visitorTeam}
                    </div>
                    <div className="event-time">
                      {new Date(event.date).toLocaleTimeString()}
                    </div>
                  </div>
                </button>
              ))}
            </div>
            <button 
              className="close-modal"
              onClick={() => setSelectedEvent(null)}
            >
              Cerrar
            </button>
          </div>
        </div>
      )}

      {loading && (
        <div className="loading-overlay">
          <div className="loading-spinner"></div>
          <p>Cargando eventos...</p>
        </div>
      )}
    </div>
  );
};

export default Calendar;