import React from "react"
import { Routes, Route, Link, NavLink } from "react-router-dom"
import { useAuth } from "./context/AuthContext"

import HomePage from "./pages/HomePage"
import LoginPage from "./pages/LoginPage"
import ProductsPage from "./pages/ProductsPage"

import StaffReservationsPage from "./pages/StaffReservationsPage"
import NotFoundPage from "./pages/NotFoundPage"
import "./App.css"
import { FcMoneyTransfer } from "react-icons/fc"
import SafetyEquipmentPage from "./pages/SafetyEquipmentPage"
import StaffTodayPage from "./pages/StaffTodayPage"
import ProductStockPage from "./pages/ProductStockPage"

function App() {
  const { isAuthenticated, user, logout, loading } = useAuth()

  // Verificar si el usuario es staff o admin
  const isStaffOrAdmin = isAuthenticated && (user?.role === "staff" || user?.role === "admin")
  const isAdmin = isAuthenticated && (user?.role === "admin" || user?.username === "admin")

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner"></div>
        <p>Cargando dashboard...</p>
      </div>
    )
  }

  return (
    <div className="dashboard-container">
      {/* Navbar superior */}
      <nav className="dashboard-navbar">
        <div className="dashboard-navbar-container">
          <Link to="/" className="dashboard-logo">
            <FcMoneyTransfer style={{ marginRight: "8px", fontSize: "1.5rem" }} />
            Gestor de alquileres
          </Link>

          <ul className="nav-links">
            {isAuthenticated && (
              <>
                <li>
                  <Link to="/products">Productos</Link>
                </li>

                {isStaffOrAdmin && (
                  <>
                    <li>
                      <Link to="/staff/reservations" className="staff-link">
                        Gestión Reservas
                      </Link>
                    </li>
                    <li>
                      <Link to="/staff/today" className="staff-link">
                        Turnos Hoy
                      </Link>
                    </li>
                  </>
                )}
                {isAdmin && (
                  <>
                    <li>
                      <Link to="/staff/safety-equipment" className="staff-link">
                        Equipo Seguridad
                      </Link>
                    </li>
                    <li>
                      <Link to="/admin/products" className="staff-link">
                        Stock Productos
                      </Link>
                    </li>
                  </>
                )}
              </>
            )}

            {/* Auth links a la derecha */}
            <li className="auth-links">
              {isAuthenticated ? (
                <div className="user-profile">
                  <span className="username">{user?.name || user?.username}</span>
                  <button onClick={logout}>Cerrar Sesión</button>
                </div>
              ) : (
                <NavLink to="/login">Iniciar Sesión</NavLink>
              )}
            </li>
          </ul>
        </div>
      </nav>

      {/* Contenido principal */}
      <div className="dashboard-content">
        <div className="dashboard-content-inner">
          <div className="dashboard-routes-container" style={{ width: "100%" }}>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/products" element={<ProductsPage />} />
              <Route path="/staff/reservations" element={<StaffReservationsPage />} />
              <Route path="/staff/safety-equipment" element={<SafetyEquipmentPage />} />
              <Route path="/staff/today" element={<StaffTodayPage />} />
              <Route path="/admin/products" element={<ProductStockPage />} />

              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
