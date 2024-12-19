import React from 'react';
import './body_main.css';
import CalendarComponent from './Calendar.jsx'; // Importa el calendario
import MapComponent from './Map.jsx'; // Importa el componente del mapa
import CarouselComponent from './Carousel.jsx';



const Body = () => {
  return (
    <div className="body-container">
      {/* Parte izquierda */}
      <div className="left-section">
        {/* Promociones de eventos */}
        <div className="event-promotion">
        <CarouselComponent />
        </div>

        {/* Sección dividida en dos: ubicación y promociones */}
        <div className="botstom-section">
          <div style={{ marginTop: '20px' }}>
        <h2>Ubicación del Estadio</h2>
        <MapComponent /> {/* Agrega el mapa aquí */}
    
          </div>

         
        </div>
      </div>

      {/* Parte derecha: calendario */}
      <div className="right-section">
      <h2>Calendario</h2>
      <CalendarComponent /> {/* Agregar el calendario aquí */}
      </div>
    </div>
  );
};

export default Body;
