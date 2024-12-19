import React from 'react';
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';

// Estilos personalizados para el mapa
const mapStyles = {
  height: "400px",
  width: "100%"
};

// Coordenadas del estadio (puedes cambiar estas coordenadas por las de tu estadio)
const defaultCenter = {
  lat: 19.404484068754225, 
  lng: -99.08533448890726 
};

const MapComponent = () => {
  return (
    <LoadScript googleMapsApiKey= "AIzaSyBGtDqFUzgU6TQiSlcIo_xyozO1pIe2i1k" >
      <GoogleMap
        mapContainerStyle={mapStyles}
        zoom={15}
        center={defaultCenter}
      >
        {/* Marcador en la ubicación del estadio */}
        <Marker position={defaultCenter} />
      </GoogleMap>
    </LoadScript>
  );
}

export default MapComponent;
