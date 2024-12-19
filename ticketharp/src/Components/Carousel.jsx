import React from 'react';
import { Carousel } from 'react-bootstrap';
import './carousel.css';
import { Link } from 'react-router-dom'; // Importa el componente Link

const CarouselComponent = () => {
  return (
    <Carousel>
      <Carousel.Item>
      <Link to="/SelectTickets">
        <img
          className="d-block w-100"
         
          src="yan_vs_dia.png"
          
          alt="Promoción 1" 
        />
        </Link>
        <Carousel.Caption>
          <h3>Promoción 1</h3>
          <p>Descripción de la promoción 1</p>
        </Carousel.Caption>
      </Carousel.Item>

      <Carousel.Item>
      <Link to="/SelectTickets/6731079105254483151cb963">
        <img
          className="d-block w-100"
          src="yan_vs_per.png"
          alt="Promoción 2"
        />
        </Link>
        <Carousel.Caption>
          <h3>Yankees vs Pericos Puebla</h3>
          <p>Descripción de la promoción 2</p>
        </Carousel.Caption>
      </Carousel.Item>

      <Carousel.Item>
      <Link to="/SelectTickets">
        <img
          className="d-block w-100"
          src="yan_vs_leo.png"
          alt="Promoción 3"
        />
        </Link>
        <Carousel.Caption>
          <h3>Yankees vs Leones Yucatán</h3>
          <p>Descripción de la promoción 3</p>
        </Carousel.Caption>
      </Carousel.Item>
    </Carousel>
  );
};

export default CarouselComponent;
