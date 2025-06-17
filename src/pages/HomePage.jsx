import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { RiDashboardLine, RiCalendarCheckLine, RiShoppingCartLine } from 'react-icons/ri';

function HomePage() {
  const { isAuthenticated, user } = useAuth();
  
  // Verificar si el usuario es staff o admin
  const isStaffOrAdmin = isAuthenticated && (
    user?.role === 'staff' || 
    user?.role === 'admin' || 
    user?.username === 'admin' || 
    user?.username === 'staff'
  );

  return (
    <div className="home-page-container" style={{ width: '100%' }}>
      <div className="dashboard-card-header">
        <h2>Dashboard de Administración</h2>
      </div>
      
      <div className="dashboard-summary">
        <p>Bienvenido al sistema de administración de Beach Rentals. Esta plataforma permite gestionar reservas y productos para el alquiler de equipamiento de playa.</p>
      </div>
      
      <div className="dashboard-actions">
        <div className="action-cards">
          <div className="dashboard-card action-card">
            <div className="action-icon">
              <RiDashboardLine size={40} color="var(--accent)" />
            </div>
            <h3>Catálogo de Productos</h3>
            <p>Gestiona el catálogo de productos disponibles para alquiler.</p>
            <Link to="/products" className="btn btn-primary">Ver Productos</Link>
          </div>
          
          {isStaffOrAdmin && (
            <div className="dashboard-card action-card">
              <div className="action-icon">
                <RiCalendarCheckLine size={40} color="var(--accent)" />
              </div>
              <h3>Gestión de Reservas</h3>
              <p>Administra todas las reservas, marca pagos y realiza cancelaciones.</p>
              <Link to="/staff/reservations" className="btn btn-primary">Gestionar Reservas</Link>
            </div>
          )}
          
          <div className="dashboard-card action-card">
            <div className="action-icon">
              <RiShoppingCartLine size={40} color="var(--accent)" />
            </div>
            <h3>Nueva Reserva</h3>
            <p>Crea una nueva reserva para productos de la playa.</p>
            <Link to="/cart" className="btn btn-primary">Crear Reserva</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HomePage;
