import React from 'react';
import './Footer.css';  // Ruta donde se encuentra el archivo CSS


function Footer() {
  return (
    <footer className="footer">
      <p>&copy; 2024 Venta de Boletos - Estadio. Todos los derechos reservados.</p>
      <ul>
        <li><a href="#">Términos de Uso</a></li>
        <li><a href="#">Política de Privacidad</a></li>
      </ul>
    </footer>
  );
}

export default Footer;


