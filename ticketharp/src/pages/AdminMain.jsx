import React, { useState } from 'react';
import './AdminMain.css';
import { Link } from 'react-router-dom';

function AdminMenu() {
  const [activeSection, setActiveSection] = useState(null);

  const menuItems = [
    {
      id: 'crear-evento',
      label: 'Crear Evento',
      link: '/Create_Event',
      onClick: () => {
        // Lógica para cambiar a sección de crear evento
        setActiveSection('crear-evento');
      }
    },

    {
      id: 'eliminar-evento',
      label: 'Eliminar Evento',
      link: '/Eliminar_Eventos',
      onClick: () => {
        // Lógica para cambiar a sección de editar evento
        setActiveSection('eliminar-evento');
      }
    },

    {
      id: 'salir-evento',
      label: 'Salir de administración',
      link: '/',
      onClick: () => {
        // Lógica para cambiar a sección de editar evento
        setActiveSection('salir-evento');
      }
    },

  ];

  return (
    <div className="admin-menu-container">
      <div className="logo">
        <img src="logo.png" alt="Logo Estadio" />
      </div>

      <h2 className="admin-menu-title">Panel de Administración</h2>

      <div className="admin-menu-navigation">
        {menuItems.map((item) => (
          <Link
            key={item.id}
            to={item.link}
            className={`admin-menu-item ${activeSection === item.id ? 'active' : ''}`}
            onClick={item.onClick}
          >
            {item.label}
          </Link>
        ))}
      </div>
    </div>
  );
}

export default AdminMenu;