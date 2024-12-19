import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const SearchResults = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);

  useEffect(() => {
    const storedResults = localStorage.getItem('searchResults');
    
    if (storedResults) {
      try {
        const parsedResults = JSON.parse(storedResults);
        // Corregir la fecha ajustando la zona horaria
        const correctedResults = parsedResults.map(event => {
          const date = new Date(event.eventDate);
          // Ajustar la fecha para considerar la zona horaria
          const utcDate = new Date(date.getTime() + date.getTimezoneOffset() * 60000);
          
          return {
            ...event,
            eventDate: utcDate
          };
        });
        
        setEvents(correctedResults);
        localStorage.removeItem('searchResults');
      } catch (error) {
        console.error('Error al parsear resultados:', error);
      }
    }
  }, []);

  const formatDate = (date) => {
    // Formatear la fecha considerando la zona horaria local
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      timeZone: 'UTC'
    });
  };

  return (
    <div style={{
      padding: '2rem',
      maxWidth: '1000px',
      margin: '0 auto'
    }}>
      <h2 style={{
        fontSize: '1.8rem',
        color: '#1e3a8a',
        marginBottom: '1.5rem',
        textAlign: 'center',
        fontWeight: 'bold'
      }}>
        {events.length > 0 ? 'Eventos encontrados' : 'No se encontraron eventos'}
      </h2>

      <div style={{
        display: 'grid',
        gap: '1.5rem'
      }}>
        {events.map((event) => (
          <div
            key={event.id}
            style={{
              backgroundColor: 'white',
              borderRadius: '12px',
              overflow: 'hidden',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
              display: 'flex',
              transition: 'transform 0.2s ease, box-shadow 0.2s ease',
              cursor: 'pointer'
            }}
            onClick={() => navigate(`/SelectTickets/${event.id}`)}
          >
            <div style={{ flex: 1, padding: '1.5rem' }}>
              <h3 style={{
                fontSize: '1.4rem',
                fontWeight: 'bold',
                color: '#1a202c',
                marginBottom: '0.75rem'
              }}>
                {event.eventName}
              </h3>

              <div style={{ color: '#4a5568', marginBottom: '0.5rem' }}>
                <strong>Equipos:</strong> {event.localTeam} vs {event.visitorTeam}
              </div>

              <div style={{ color: '#4a5568', marginBottom: '0.5rem' }}>
                <strong>Fecha:</strong> {formatDate(event.eventDate)}
              </div>

              <button 
                style={{
                  backgroundColor: '#1e3a8a',
                  color: 'white',
                  padding: '0.75rem 1.5rem',
                  borderRadius: '6px',
                  marginTop: '1rem'
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/SelectTickets/${event.id}`);
                }}
              >
                Comprar Boletos
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SearchResults;