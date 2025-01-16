import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { X } from "lucide-react";
import './Select_tickets.css';

// Definimos la URL base de la API usando variables de entorno
const API_URL = process.env.REACT_APP_API_URL || 'http://18.216.192.185' || 'http://localhost:5000';

const ZONE_NAMES = {
  VIP: 'VIP',
  P_B_CEN: 'Platea Baja Central',
  P_B_LAT_ORO: 'Platea Baja Lateral Oro',
  P_B_LAT_PLATA: 'Platea Baja Lateral Plata',
  P_B_LAT_BRONCE: 'Platea Baja Lateral Bronce',
  P_A_CEN: 'Platea Alta Central',
  P_A_LAT: 'Platea Alta Lateral',
  BERMA_G_DER: 'Berma General Derecha',
  BERMA_G_IZQ: 'Berma General Izquierda'
};

const MAX_TICKETS = 5;

const Select_tickets = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const [eventData, setEventData] = useState(null);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedZone, setSelectedZone] = useState(null);

  useEffect(() => {
    const fetchEventData = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_URL}/api/events/${eventId}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || 'Error al cargar el evento');
        }

        if (data.success) {
          const normalizedData = {
            ...data,
            event: {
              ...data.event,
              prices: Object.keys(data.event.prices).reduce((acc, key) => {
                acc[key.toUpperCase()] = data.event.prices[key];
                return acc;
              }, {})
            }
          };
          setEventData(normalizedData);
        }
      } catch (error) {
        console.error('Error:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    if (eventId) {
      fetchEventData();
    }
  }, [eventId]);

  const handleSeatSelection = (zone, row, seat, price) => {
    const seatId = `${zone}-${row}-${seat}`;
    const isSelected = selectedSeats.find(s => s.id === seatId);
    
    if (isSelected) {
      setSelectedSeats(selectedSeats.filter(s => s.id !== seatId));
    } else {
      if (selectedSeats.length >= MAX_TICKETS) {
        alert(`Solo puedes seleccionar un máximo de ${MAX_TICKETS} boletos.`);
        return;
      }
      setSelectedSeats([...selectedSeats, {
        id: seatId,
        zone,
        row,
        seat,
        price
      }]);
    }
  };

  // Función para formatear la fecha correctamente
  const formatEventDate = (dateString) => {
    const date = new Date(dateString);
    // Ajustamos la zona horaria agregando un día
    date.setDate(date.getDate());
    
    // Opciones para formatear la fecha en español
    const options = { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      timeZone: 'UTC'
    };
    
    return date.toLocaleDateString('es-ES', options);
  };

  const renderZoneSelector = () => {
    if (!eventData) return null;

    return (
      <div className="zone-selector">
        <h3 className="zone-selector-title">Selecciona una zona</h3>
        <div className="zone-buttons">
          {Object.entries(eventData.seating).map(([zoneName, _]) => {
            const normalizedZoneName = zoneName.toUpperCase();
            const price = eventData.event.prices[normalizedZoneName];
            
            return (
              <button
                key={zoneName}
                className={`zone-select-button ${selectedZone === zoneName ? 'active' : ''}`}
                onClick={() => setSelectedZone(zoneName)}
              >
                <span className="zone-name">{ZONE_NAMES[normalizedZoneName] || zoneName}</span>
                <span className="zone-price">${price}</span>
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  const renderSelectedZoneSeats = () => {
    if (!selectedZone || !eventData) return null;

    const seats = eventData.seating[selectedZone];
    const normalizedZoneName = selectedZone.toUpperCase();
    const zonePrice = eventData.event.prices[normalizedZoneName];

    const config = {
      rows: Math.max(...seats.map(s => s.row)),
      seatsPerRow: Math.max(...seats.map(s => s.seatNumber))
    };

    return (
      <div className="zone-card">
        <h3 className="zone-title">{ZONE_NAMES[normalizedZoneName] || selectedZone}</h3>
        <p className="price-tag">Precio: ${zonePrice}</p>
        <div className="seats-layout">
          {Array.from({ length: config.rows }, (_, rowIndex) => {
            const row = rowIndex + 1;
            return (
              <div key={`row-${row}`} className="seat-row">
                <span className="row-label">F{row}</span>
                <div className="seats-container">
                  {Array.from({ length: config.seatsPerRow }, (_, seatIndex) => {
                    const seatNumber = seatIndex + 1;
                    const seat = seats.find(s => 
                      s.row === row && s.seatNumber === seatNumber
                    );
                    const isAvailable = seat && seat.status === 'available';
                    const seatId = `${selectedZone}-${row}-${seatNumber}`;
                    const isSelected = selectedSeats.some(s => s.id === seatId);

                    return (
                      <button
                        key={seatId}
                        className={`seat-button ${isSelected ? 'selected' : ''} ${!isAvailable ? 'occupied' : ''}`}
                        onClick={() => isAvailable && handleSeatSelection(selectedZone, row, seatNumber, zonePrice)}
                        disabled={!isAvailable || (!isSelected && selectedSeats.length >= MAX_TICKETS)}
                      >
                        {seatNumber}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const removeSeat = (seatId) => {
    setSelectedSeats(selectedSeats.filter(s => s.id !== seatId));
  };

  const handleProceedToPayment = () => {
    if (totalAmount > 0) {
      localStorage.setItem('selectedSeats', JSON.stringify(selectedSeats));
      navigate(`/payment/${eventId}`);
    }
  };

  if (loading) return <div>Cargando información del evento...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!eventData) return <div>No se encontró información del evento</div>;

  const totalAmount = selectedSeats.reduce((sum, seat) => sum + seat.price, 0);
  const remainingTickets = MAX_TICKETS - selectedSeats.length;

  return (
    <div className="seat-selector-container">
      <div className="seats-section">
        <h1 className="section-title">Estadio "Harp Helu"</h1>
        <div className="stadium-image-container">
          <img 
            src="/estadioPrueba.jpg" 
            alt="Mapa del Estadio" 
            className="stadium-image"
          />
        </div>
        <h2 className="event-title">
          {eventData.event.localTeam} vs {eventData.event.visitorTeam}
        </h2>
        <h3 className="event-date">
          {formatEventDate(eventData.event.date)}
        </h3>
        <h3 className="summary-title">
          Seleccionar asientos 
          <span className="remaining-tickets">
            (Puedes seleccionar {remainingTickets} boleto{remainingTickets !== 1 ? 's' : ''} más)
          </span>
        </h3>
        
        {renderZoneSelector()}
        <div className="zones-container">
          {renderSelectedZoneSeats()}
        </div>
      </div>

      <div className="summary-section">
        <div className="summary-card">
          <h3 className="summary-title">Asientos Seleccionados Para:</h3>
          <h2 className="match-name">
            {`${eventData.event.localTeam} vs ${eventData.event.visitorTeam}`}
          </h2>
          {selectedSeats.length === 0 ? (
            <p className="empty-message">No hay asientos seleccionados</p>
          ) : (
            <div className="summary-content">
              <img 
                src="/select.webp" 
                alt="Selección de asientos" 
                className="select-image" 
              />
              <div className="selected-seats-list">
                {selectedSeats.map((seat) => (
                  <div key={seat.id} className="selected-seat-item">
                    <div className="seat-info">
                      <p className="zone-name">{ZONE_NAMES[seat.zone.toUpperCase()] || seat.zone}</p>
                      <p className="seat-details">
                        Fila {seat.row}, Asiento {seat.seat}
                      </p>
                    </div>
                    <div className="seat-actions">
                      <p className="seat-price">${seat.price}</p>
                      <button 
                        onClick={() => removeSeat(seat.id)}
                        className="remove-button"
                        aria-label="Eliminar asiento"
                      >
                        <X className="remove-icon" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="total-section">
                <div className="total-row">
                  <p className="total-label">Total:</p>
                  <p className="total-amount">${totalAmount}</p>
                </div>
                {totalAmount > 0 && (
                  <button 
                    onClick={handleProceedToPayment}
                    className="proceed-button"
                  >
                    Continuar al pago
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Select_tickets;