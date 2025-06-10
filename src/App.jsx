import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, NavLink } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import ProductsPage from './pages/ProductsPage';
import ReservationsPage from './pages/ReservationsPage';
import NotFoundPage from './pages/NotFoundPage';
import './App.css';

function App() {
  const { isAuthenticated, user, logout, loading } = useAuth();

  if (loading) {
    return <div>Cargando aplicación...</div>;
  }

  return (
    <div>
      <nav>
        <ul>
          <li><Link to="/">Inicio</Link></li>
          <li><Link to="/products">Productos</Link></li>
          {isAuthenticated && <li><Link to="/reservations">Mis Reservas</Link></li>}
          {isAuthenticated ? (
            <li className="auth-links"><button onClick={logout}>Logout</button></li>
          ) : (
            <li className="auth-links"><NavLink to="/login">Login</NavLink></li>
          )}
        </ul>
      </nav>

      <hr />

      <main>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/products" element={<ProductsPage />} />
          <Route path="/reservations" element={<ReservationsPage />} />
          <Route path="*" element={<NotFoundPage />} />
          {/* registration route removed */}
        </Routes>
      </main>
    </div>
  );
}

export default App;
