import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CreditCard } from "lucide-react";
import './details.css';

const PaymentProcess = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(null);
  const [eventData, setEventData] = useState(null);
  const [errors, setErrors] = useState({});
  const [paymentData, setPaymentData] = useState({
    cardHolder: '',
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    paypalEmail: '',
    paypalPassword: ''
  });

  useEffect(() => {
    const seats = JSON.parse(localStorage.getItem('selectedSeats') || '[]');
    setSelectedSeats(seats);

    const fetchEventData = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/events/${eventId}`);
        const data = await response.json();
        if (data.success) {
          setEventData(data.event);
        } else {
          navigate('/paid', { 
            replace: true, 
            state: { error: 'No se pudo cargar el evento' } 
          });
        }
      } catch (error) {
        console.error('Error:', error);
        navigate('/events', { 
          replace: true, 
          state: { error: 'Error al cargar el evento' } 
        });
      }
    };

    fetchEventData();
  }, [eventId, navigate]);

  const validateCardNumber = (number) => {
    const cleaned = number.replace(/\s/g, '');
    return /^[0-9]{13,19}$/.test(cleaned);
  };

  const validateCardHolder = (name) => {
    return /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]{3,50}$/.test(name);
  };

  const validateExpiryDate = (date) => {
    const regex = /^(0[1-9]|1[0-2])\/([0-9]{2})$/;
    if (!regex.test(date)) return false;
    
    const [month, year] = date.split('/');
    const currentYear = new Date().getFullYear() % 100; // Obtiene los últimos 2 dígitos del año actual
    
    // Validar que el año no sea menor que el actual
    if (parseInt(year) < currentYear) return false;
    
    const expiry = new Date(2000 + parseInt(year), parseInt(month) - 1);
    const today = new Date();
    return expiry > today;
  };

  const validateCVV = (cvv) => {
    const regex = /^[0-9]{3}$/;
    return regex.test(cvv);
  };

  const validateEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const validatePassword = (password) => {
    return password.length >= 8;
  };

  const formatCardNumber = (number) => {
    const cleaned = number.replace(/\D/g, '');
    const groups = cleaned.match(/.{1,4}/g) || [];
    return groups.join(' ').substr(0, 23);
  };

  const formatExpiryDate = (date) => {
    const cleaned = date.replace(/\D/g, '');
    if (cleaned.length >= 2) {
      // Validar que el mes no sea mayor a 12
      let month = cleaned.slice(0, 2);
      if (parseInt(month) > 12) {
        month = '12';
      }
      return `${month}/${cleaned.slice(2, 4)}`;
    }
    return cleaned;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    let formattedValue = value;
    let error = null;

    switch (name) {
      case 'cardNumber':
        formattedValue = formatCardNumber(value);
        if (value && !validateCardNumber(formattedValue)) {
          error = 'Número de tarjeta inválido. Debe tener entre 13 y 19 dígitos';
        }
        break;

      case 'cardHolder':
        if (/\d/.test(value)) {
          error = 'El nombre no debe contener números';
          formattedValue = value.replace(/\d/g, '');
        } else if (value && !validateCardHolder(value)) {
          error = 'Nombre del titular inválido';
        }
        break;

      case 'expiryDate':
        formattedValue = formatExpiryDate(value);
        if (value) {
          const [month, year] = formattedValue.split('/');
          const currentYear = new Date().getFullYear() % 100;
          
          if (month && parseInt(month) > 12) {
            error = 'Mes inválido';
          } else if (year && parseInt(year) < currentYear) {
            error = 'El año no puede ser menor al actual';
          } else if (!validateExpiryDate(formattedValue)) {
            error = 'Fecha de expiración inválida';
          }
        }
        break;

      case 'cvv':
        formattedValue = value.replace(/\D/g, '').slice(0, 3);
        if (value && !validateCVV(formattedValue)) {
          error = 'CVV inválido';
        }
        break;

      default:
        break;
    }

    setPaymentData(prev => ({
      ...prev,
      [name]: formattedValue
    }));

    setErrors(prev => ({
      ...prev,
      [name]: error
    }));
  };

  const handlePaymentMethodSelect = (method) => {
    setSelectedPaymentMethod(method);
    setErrors({});
  };

  const validateForm = () => {
    const newErrors = {};

    if (selectedPaymentMethod === 'card') {
      if (!validateCardHolder(paymentData.cardHolder)) {
        newErrors.cardHolder = 'Nombre del titular requerido';
      }
      if (!validateCardNumber(paymentData.cardNumber)) {
        newErrors.cardNumber = 'Número de tarjeta inválido';
      }
      if (!validateExpiryDate(paymentData.expiryDate)) {
        newErrors.expiryDate = 'Fecha de expiración inválida';
      }
      if (!validateCVV(paymentData.cvv)) {
        newErrors.cvv = 'CVV inválido';
      }
    } else if (selectedPaymentMethod === 'paypal') {
      if (!validateEmail(paymentData.paypalEmail)) {
        newErrors.paypalEmail = 'Correo electrónico inválido';
      }
      if (!validatePassword(paymentData.paypalPassword)) {
        newErrors.paypalPassword = 'Contraseña inválida';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleContinuePayment = async () => {
    if (!selectedPaymentMethod) {
      alert('Por favor selecciona un método de pago');
      return;
    }
    
    if (!validateForm()) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Debes iniciar sesión para continuar');
        navigate('/');
        return;
      }

      const paymentRequest = {
        eventId,
        seats: selectedSeats.map(seat => ({
          zone: seat.zone,
          row: seat.row,
          seatNumber: seat.seat,
          price: seat.price
        })),
        paymentMethod: selectedPaymentMethod,
        paymentData: selectedPaymentMethod === 'card' ? {
          cardHolder: paymentData.cardHolder,
          cardNumber: paymentData.cardNumber.replace(/\s/g, ''),
          expiryDate: paymentData.expiryDate
        } : {
          paypalEmail: paymentData.paypalEmail
        }
      };

      const response = await fetch('http://localhost:5000/api/payment/process', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(paymentRequest)
      });

      const data = await response.json();
      if (data.success) {
        localStorage.removeItem('selectedSeats');
        navigate('/payment/confirmation', {
          state: {
            reservationId: data.reservationId,
            eventId: eventId,
            seats: selectedSeats,
            total: total
          }
        });
      } else {
        alert(data.message || 'Error al procesar el pago');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error al procesar el pago. Por favor intenta de nuevo.');
    }
  };

  const subtotal = selectedSeats.reduce((sum, seat) => sum + seat.price, 0);
  const serviceCharge = subtotal * 0.05;
  const total = subtotal + serviceCharge;

  if (!eventData) {
    return <div className="loading">Cargando detalles del evento...</div>;
  }

  const renderPaymentForm = () => {
    if (!selectedPaymentMethod) return null;

    if (selectedPaymentMethod === 'card') {
      return (
        <div className="payment-form">
          <div className="form-group">
            <label htmlFor="cardHolder">Titular de la tarjeta</label>
            <input
              type="text"
              id="cardHolder"
              name="cardHolder"
              value={paymentData.cardHolder}
              onChange={handleInputChange}
              placeholder="Nombre del titular"
              className={errors.cardHolder ? 'error' : ''}
            />
            {errors.cardHolder && <span className="error-message">{errors.cardHolder}</span>}
          </div>
          <div className="form-group">
            <label htmlFor="cardNumber">Número de tarjeta</label>
            <input
              type="text"
              id="cardNumber"
              name="cardNumber"
              value={paymentData.cardNumber}
              onChange={handleInputChange}
              placeholder="0000 0000 0000 0000"
              maxLength="23"
              className={errors.cardNumber ? 'error' : ''}
            />
            {errors.cardNumber && <span className="error-message">{errors.cardNumber}</span>}
          </div>
          <div className="form-row">
            <div className="form-group half">
              <label htmlFor="expiryDate">Fecha de expiración</label>
              <input
                type="text"
                id="expiryDate"
                name="expiryDate"
                value={paymentData.expiryDate}
                onChange={handleInputChange}
                placeholder="MM/AA"
                maxLength="5"
                className={errors.expiryDate ? 'error' : ''}
              />
              {errors.expiryDate && <span className="error-message">{errors.expiryDate}</span>}
            </div>
            <div className="form-group half">
              <label htmlFor="cvv">CVV</label>
              <input
                type="text"
                id="cvv"
                name="cvv"
                value={paymentData.cvv}
                onChange={handleInputChange}
                placeholder="123"
                maxLength="3"
                className={errors.cvv ? 'error' : ''}
              />
              {errors.cvv && <span className="error-message">{errors.cvv}</span>}
            </div>
          </div>
        </div>
      );
    }
  };

  return (
    <div className="payment-main-container">
      <div className="payment-content">
        <h1 className="payment-title">Proceso de Pago</h1>
        <div className="payment-process-container">
          <div className="payment-section">
            <h2 className="section-subtitle">Selecciona tu método de pago</h2>
            <div className="payment-methods-grid">
              <button
                className={`payment-method-btn ${selectedPaymentMethod === 'card' ? 'selected' : ''}`}
                onClick={() => handlePaymentMethodSelect('card')}
              >
                <CreditCard className="payment-icon" />
                <span>Tarjeta de Crédito/Débito</span>
              </button>
            </div>
            {renderPaymentForm()}
          </div>
          
          <div className="purchase-summary-section">
            <h2 className="section-subtitle">Resumen de la Compra</h2>
            <div className="event-details">
              <h3 className="event-title">{eventData.title}</h3>
              <p className="event-date">{eventData.date}</p>
            </div>
            
            <div className="selected-seats-section">
              <h3 className="section-subtitle">Asientos Seleccionados</h3>
              {selectedSeats.map((seat, index) => (
                <div key={index} className="seat-item">
                  <div className="seat-details">
                    <p className="seat-zone">{seat.zone}</p>
                    <p className="seat-location">Fila {seat.row}, Asiento {seat.seat}</p>
                  </div>
                  <p className="seat-price">${seat.price}</p>
                </div>
              ))}
            </div>
            
            <div className="price-summary">
              <div className="price-row">
                <span>Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="price-row">
                <span>Cargo por servicio</span>
                <span>${serviceCharge.toFixed(2)}</span>
              </div>
              <div className="price-row total">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
        
        <button 
          className="continue-payment-btn"
          onClick={handleContinuePayment}
        >
          Continuar Pago
        </button>
      </div>
    </div>
  );
};

export default PaymentProcess;