import React from 'react';
import { useNavigate } from 'react-router-dom';

const PurchaseConfirmation = () => {
  const navigate = useNavigate();
  
  const yankeesSlogans = [
    "¡Nos vemos en el  !"
  ];

  const randomSlogan = yankeesSlogans[Math.floor(Math.random() * yankeesSlogans.length)];

  return (
    <div style={{
      minHeight: '70vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#f3f4f6'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '600px',
        backgroundColor: 'white',
        borderRadius: '8px',
        padding: '2rem',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        textAlign: 'center'
      }}>
        <div style={{
          marginBottom: '2rem'
        }}>
          <img 
            src="yankeeshero.png" 
            alt="New York Yankees Logo"
            style={{
              width: '200px',
              height: 'auto',
              margin: '0 auto 1.5rem'
            }}
          />
          
          <h1 style={{
            fontSize: '2rem',
            fontWeight: 'bold',
            color: '#1e3a8a',
            marginBottom: '1rem'
          }}>
            ¡Compra Exitosa!
          </h1>
          
          <p style={{
            fontSize: '1.25rem',
            color: '#4b5563',
            marginBottom: '1rem'
          }}>
            Tus boletos han sido confirmados
          </p>
          <p style={{
            fontSize: '.8rem',
            color: '#4b5563',
            marginBottom: '1rem'
          }}>
            (Los boletos han sido enviados a tu correo)
          </p>
          
          <p style={{
            fontSize: '1.125rem',
            fontStyle: 'italic',
            color: '#1e3a8a',
            fontWeight: '600'
          }}>
            {randomSlogan}
          </p>
        </div>

        <button 
          onClick={() => navigate('/Body')}
          style={{
            backgroundColor: '#1e3a8a',
            color: 'white',
            padding: '0.75rem 2rem',
            borderRadius: '6px',
            border: 'none',
            fontSize: '1rem',
            fontWeight: '500',
            cursor: 'pointer',
            transition: 'background-color 0.2s',
          }}
          onMouseOver={(e) => e.target.style.backgroundColor = '#1e40af'}
          onMouseOut={(e) => e.target.style.backgroundColor = '#1e3a8a'}
        >
          Ir al Menú Principal
        </button>
      </div>
    </div>
  );
};

export default PurchaseConfirmation;