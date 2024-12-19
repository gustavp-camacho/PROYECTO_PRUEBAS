import React, { useState } from 'react';
import './HelpCenter.css'; // Importa el archivo CSS
import { ChevronDown } from 'lucide-react';

const HelpCenter = () => {
  const [openSection, setOpenSection] = useState(null);

  const sections = [
    {
      id: 'stadium',
      title: 'REGLAS DEL ESTADIO',
      content: 'Información sobre las reglas del estadio...'
    },
    {
      id: 'tickets',
      title: 'PREGUNTAS DE LA COMPRA DE BOLETOS',
      content: 'Información sobre la compra de boletos...'
    },
    {
      id: 'other',
      title: 'OTRAS DUDAS',
      content: 'Otras preguntas frecuentes...'
    }
  ];

  const toggleSection = (id) => {
    setOpenSection(openSection === id ? null : id);
  };

  return (
    <div className="help-center-container">
      <h1 className="help-center-title">CENTRO DE AYUDA</h1>
      
      {sections.map((section) => (
        <div key={section.id} className="help-section">
          <button
            onClick={() => toggleSection(section.id)}
            className={`help-toggle-btn ${openSection === section.id ? 'active' : ''}`}
            aria-expanded={openSection === section.id}
          >
            <span className="help-section-title">{section.title}</span>
            <ChevronDown 
              className={`help-chevron ${openSection === section.id ? 'rotated' : ''}`}
            />
          </button>
          
          {openSection === section.id && (
            <div className="help-content">
              <p>{section.content}</p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default React.memo(HelpCenter);
