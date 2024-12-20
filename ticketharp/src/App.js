//App.js
//import React, { useState } from 'react';
import Footer from './Components/Footer.jsx';
import Body from './Components/Body_main.jsx';
import Header from './Components/Header.jsx';


import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';
import Create from './pages/CreateEvents.jsx';
import Login from './pages/login.jsx';
import Signup from './pages/Signup.jsx';
import Events from './pages/Select_tickets.jsx';
import Orden from './pages/datails.jsx';
import Help from './pages/HelpCenter.jsx';
import Paid from './Components/CompraExitosa.jsx';
import Search from './pages/search.jsx';
import AdminM from './pages/AdminMain.jsx';
import AdminC from './Components/AdminCaro.jsx';
import ElimEvents from './pages/Eliminar_eventos.jsx';
import ResetP from './pages/PassFor.jsx';
import RestC from './pages/restablecerC.jsx';

function App() {
  const location = useLocation();

  // Función para determinar si se debe mostrar el header/footer
  const shouldShowHeaderFooter = () => {
    const path = location.pathname;
    return !['/', '/signup', '/Create_Event', '/Menu_Admin', '/Carousel_Admin', '/Eliminar_Eventos' , '/resetP', '/NewPass'].includes(path)
  };

  return (
    <div className="App">
      {shouldShowHeaderFooter() && <Header />}
     
      <div className="main-content">
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/Body" element={<Body/>} /> 
          <Route path="/Signup" element={<Signup />} />
          <Route path="/SelectTickets/:eventId" element={<Events />} /> 
          <Route path="/Payment/:eventId" element={<Orden />} />
          <Route path="/Centro_de_ayuda" element={<Help />} />
          <Route path="/Create_Event" element={<Create />} />
          <Route path="/Menu_Admin" element={<AdminM />} />
          <Route path="/paid" element={<Paid />} />
          <Route path="/search" element={<Search />} />
          <Route path="/Eliminar_Eventos" element={<ElimEvents />} />
          <Route path="/resetP" element={<ResetP />} />
          <Route path="/NewPass" element={<RestC />} />

          <Route path="/Carousel_Admin" element={ <AdminC />} />

          <Route path="*" element={<h2>Página no encontrada</h2>} />
        </Routes>
      </div>
     
      {shouldShowHeaderFooter() && <Footer />}
    </div>
  );
}

export default function AppWrapper() {
  return (
    <Router>
      <App />
    </Router>
  );
}