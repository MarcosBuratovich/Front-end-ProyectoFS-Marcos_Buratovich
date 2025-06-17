import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllReservations, markReservationPaid, cancelReservation, processStormRefund } from '../services/apiService';
import { useAuth } from '../context/AuthContext';
import { RiCalendarCheckLine } from 'react-icons/ri';
import './StaffReservationsPage.css';

const StaffReservationsPage = () => {
  const [reservations, setReservations] = useState([]);
  const [filteredReservations, setFilteredReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [filter, setFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('');
  const [expandedReservation, setExpandedReservation] = useState(null);
  const { token, user } = useAuth();
  const navigate = useNavigate();

  // Verificar que el usuario sea staff o admin
  useEffect(() => {
    // Verificar por rol o por nombre de usuario
    const isAuthorized = user && (
      ['staff', 'admin'].includes(user.role) || 
      ['admin', 'staff'].includes(user.username)
    );
    
    if (user && !isAuthorized) {
      navigate('/');
    }
  }, [user, navigate]);

  // Cargar todas las reservas
  useEffect(() => {
    const fetchAllReservations = async () => {
      if (!token) {
        setLoading(false);
        setError('Debes iniciar sesión para acceder a esta página.');
        return;
      }

      try {
        setLoading(true);
        const fetchedReservations = await getAllReservations(token);
        setReservations(fetchedReservations || []);
        setFilteredReservations(fetchedReservations || []);
      } catch (err) {
        setError(err.message || 'No se pudieron cargar las reservas.');
      } finally {
        setLoading(false);
      }
    };

    fetchAllReservations();
  }, [token]);
  
  // Aplicar filtros a las reservas
  useEffect(() => {
    let result = [...reservations];
    
    // Filtrar por estado
    if (filter !== 'all') {
      result = result.filter(res => res.paymentStatus === filter);
    }
    
    // Filtrar por fecha
    if (dateFilter) {
      const filterDate = new Date(dateFilter).setHours(0, 0, 0, 0);
      result = result.filter(res => {
        const resDate = new Date(res.date).setHours(0, 0, 0, 0);
        return resDate === filterDate;
      });
    }
    
    setFilteredReservations(result);
  }, [filter, dateFilter, reservations]);

  // Marcar una reserva como pagada
  const handleMarkPaid = async (reservationId) => {
    if (window.confirm('¿Confirmas que esta reserva ha sido pagada?')) {
      try {
        const result = await markReservationPaid(reservationId, token);
        setMessage(result.message || 'Pago registrado correctamente');
        
        // Actualizar el estado local con la reserva devuelta
        const updatedReservations = reservations.map(res => 
          res._id === reservationId ? result.reservation : res
        );
        setReservations(updatedReservations);
      } catch (err) {
        setError(err.message || 'Error al procesar el pago.');
      }
    }
  };
  
  // Procesar seguro de tormenta
  const handleStormRefund = async (reservationId) => {
    if (window.confirm('¿Confirmas que la reserva se vio afectada por condiciones climáticas y se debe reembolsar el 50%?')) {
      try {
        const result = await processStormRefund(reservationId, token);
        const refundMsg = result.refundAmount ? `${result.message || 'Reembolso por tormenta procesado'} - Monto reembolsado: $${result.refundAmount}` : (result.message || 'Reembolso por tormenta procesado');
        setMessage(refundMsg);

        // Actualizar estado local (pago pasa a "paid" pero podríamos marcar refundado)
        const updatedReservations = reservations.map(res =>
          res._id === reservationId ? { ...res, paymentStatus: 'partial refund', cancellationStatus: 'storm refund', refundAmount: result.refundAmount || (res.totalPrice * 0.5) } : res
        );
        setReservations(updatedReservations);
      } catch (err) {
        setError(err.message || 'Error al procesar el reembolso.');
      }
    }
  };

  // Cancelar una reserva
  const handleCancelReservation = async (reservationId) => {
    if (window.confirm('¿Estás seguro de que quieres cancelar esta reserva?')) {
      try {
        const result = await cancelReservation(reservationId, token);
        setMessage(result.message || 'Reserva cancelada correctamente');
        
        // Actualizar el estado local
        const updatedReservations = reservations.map(res => 
          res._id === reservationId ? { ...res, cancellationStatus: 'canceled', paymentStatus: 'canceled' } : res
        );
        setReservations(updatedReservations);
      } catch (err) {
        setError(err.message || 'Error al cancelar la reserva.');
      }
    }
  };
  
  // Ver detalles completos de una reserva
  const toggleExpandReservation = (id) => {
    setExpandedReservation(expandedReservation === id ? null : id);
  };

  // Convertir número de slot a hora HH:MM (slot de 30 min, 0 -> 00:00)
  const slotToTime = (slot) => {
    const hours = Math.floor(slot / 2);
    const minutes = slot % 2 === 0 ? '00' : '30';
    return `${hours.toString().padStart(2,'0')}:${minutes}`;
  };

  const formatSlots = (slotArr = []) => {
    return slotArr.map(s=>slotToTime(s)).join(' - ');
  };

  // Formatear la fecha para mostrarla correctamente
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' };
    return new Date(dateString).toLocaleDateString('es-ES', options);
  };
  
  // Determinar si el deadline de pago está cerca o pasado
  const getPaymentDeadlineStatus = (deadline) => {
    if (!deadline) return '';
    
    const now = new Date();
    const deadlineDate = new Date(deadline);
    const hoursLeft = (deadlineDate - now) / (1000 * 60 * 60);
    
    if (hoursLeft < 0) return 'deadline-past';
    if (hoursLeft < 6) return 'deadline-approaching';
    return '';  
  };
  
  // Mostrar el estado de pago en español
  const getPaymentStatusText = (status) => {
    switch (status) {
      case 'pending': return 'Pendiente';
      case 'paid': return 'Pagado';
      case 'partial refund': return 'Reembolso parcial';
      case 'canceled': return 'Cancelado';
      case 'partial refund': return 'Reembolso parcial';
      default: return status;
    }
  };
  
  // Mostrar el estado de cancelación en español
  const getCancellationStatusText = (status) => {
    switch (status) {
      case 'none': return 'No cancelada';
      case 'payment-expired': return 'Expirada por falta de pago';
      case 'canceled': return 'Cancelada por usuario';
      case 'storm refund': return 'Reembolso por tormenta';
      default: return status;
    }
  };

  // Estado de carga
  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner"></div>
        <p>Cargando reservas...</p>
      </div>
    );
  }

  // Si hay errores
  if (error) {
    return (
      <div className="dashboard-card">
        <div className="error-message">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="reservations-container">
      <div className="dashboard-card-header">
        <h2>
          <RiCalendarCheckLine style={{ marginRight: '10px', verticalAlign: 'middle' }} />
          Gestión de Reservas
        </h2>
      </div>
      
      {message && <div className="success-message dashboard-message">{message}</div>}
      {error && <div className="error-message dashboard-message">{error}</div>}
      
      {/* Filtros */}
      <div className="dashboard-card">
        <div className="filters-container">
          <div className="filter-group">
            <label>Estado:</label>
            <select 
              value={filter} 
              onChange={(e) => setFilter(e.target.value)}
              className="filter-select"
            >
              <option value="all">Todos</option>
              <option value="pending">Pendientes</option>
              <option value="paid">Pagadas</option>
              <option value="canceled">Canceladas</option>
            </select>
          </div>
          
          <div className="filter-group">
            <label>Fecha:</label>
            <input 
              type="date" 
              value={dateFilter} 
              onChange={(e) => setDateFilter(e.target.value)}
              className="filter-date"
            />
            {dateFilter && (
              <button 
                onClick={() => setDateFilter('')}
                className="clear-filter-btn"
              >
                ×
              </button>
            )}
          </div>
        </div>
      
        {filteredReservations.length === 0 ? (
          <p>No hay reservas que coincidan con los filtros seleccionados.</p>
        ) : (
          <div className="table-responsive">
            <table className="reservations-table">
              <thead>
                <tr>
                  <th>Cliente</th>
                  <th>Productos</th>
                  <th>Fecha</th>
                  <th>Horarios</th>
                  <th>Total</th>
                  <th>Deadline Pago</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredReservations.map((res) => (
                  <React.Fragment key={res._id}>
                    <tr className={`reservation-row ${res.paymentStatus === 'canceled' ? 'canceled' : ''}`}>
                      <td>
                        <div className="customer-info">
                          <span className="name">{res.customer?.name || 'N/A'}</span>
                          <span className="contact">{res.customer?.contact || 'N/A'}</span>
                        </div>
                      </td>
                      <td>
                        <div className="products-list">
                          {res.products?.map((item, idx) => (
                            <span key={idx} className="product-item">
                              {item.product?.name || item.product?.title || item.product?.type || item.productId || 'Producto'} ({item.quantity})
                            </span>
                          )) || 'N/A'}
                        </div>
                      </td>
                      <td>{formatDate(res.date)}</td>
                      <td>{formatSlots(res.slots)}</td>
                      <td className="price-column">${res.totalPrice}</td>
                      <td className={getPaymentDeadlineStatus(res.paymentDeadline)}>
                        {res.paymentDeadline ? new Date(res.paymentDeadline).toLocaleTimeString('es-ES', { 
                          hour: '2-digit', 
                          minute: '2-digit',
                          day: '2-digit',
                          month: '2-digit'
                        }) : 'N/A'}
                      </td>
                      <td>
                        <span className={`status status-${res.paymentStatus}`}>
                          {getPaymentStatusText(res.paymentStatus)}
                        </span>
                      </td>
                      <td>
                        <div className="action-buttons">
                          {/* Acciones según estado */}
                          {res.paymentStatus === 'pending' && (
                            <>
                              <button 
                                onClick={() => handleMarkPaid(res._id)} 
                                className="action-button pay-button"
                                title="Marcar como pagada"
                              >
                                💰 Pagada
                              </button>
                              <button 
                                onClick={() => handleCancelReservation(res._id)} 
                                className="action-button cancel-button"
                                title="Cancelar esta reserva"
                              >
                                ❌ Cancelar
                              </button>
                            </>
                          )}
                          
                          {res.paymentStatus === 'paid' && (
                              <>
                                <button 
                                  className="action-button refund-button"
                                  title="Aplicar seguro de tormenta (50% de devolución)"
                                  onClick={() => handleStormRefund(res._id)}
                                >
                                  🌧️ Reembolso 50%
                                </button>
                                <button 
                                  className="action-button receipt-button"
                                  title="Ver recibo"
                                  onClick={() => alert('Funcionalidad de recibo en desarrollo')}
                                >
                                  🧾 Recibo
                                </button>
                              </>
                            )}
                          
                          <button 
                            onClick={() => toggleExpandReservation(res._id)} 
                            className="action-button details-button"
                            title="Ver detalles completos"
                          >
                            {expandedReservation === res._id ? '🔼' : '🔽'}
                          </button>
                        </div>
                      </td>
                    </tr>
                    
                    {/* Detalles expandidos */}
                    {expandedReservation === res._id && (
                      <tr className="expanded-details">
                        <td colSpan="8">
                          <div className="details-container">
                            <h4>Detalles de la reserva</h4>
                            <div className="details-grid">
                              <div>
                                <h5>Información del cliente</h5>
                                <p><strong>Nombre:</strong> {res.customer?.name || 'N/A'}</p>
                                <p><strong>Contacto:</strong> {res.customer?.contact || 'N/A'}</p>
                              </div>
                              
                              <div>
                                <h5>Detalles de productos</h5>
                                <ul className="products-list">
                                  {res.products?.map((product, idx) => (
                                    <li key={idx}>
                                      <span>{product.product?.name || product.product?.title || product.product?.type || product.productId || 'Producto'}</span>
                                      <span>Cantidad: {product.quantity}</span>
                                      {product.product?.price && (<span>${product.product.price * product.quantity}</span>)}
                                    </li>
                                  ))}
                                </ul>
                                {res.discount > 0 && <p><strong>Descuento aplicado:</strong> ${res.discount}</p>}
                                <p><strong>Total:</strong> ${res.totalPrice}</p>
                                {res.refundAmount > 0 && <p><strong>Reembolso aplicado:</strong> ${res.refundAmount}</p>}
                              </div>
                              
                              <div>
                                <h5>Estado de la reserva</h5>
                                <p><strong>Estado de pago:</strong> {getPaymentStatusText(res.paymentStatus)}</p>
                                <p><strong>Estado de cancelación:</strong> {getCancellationStatusText(res.cancellationStatus)}</p>
                                <p><strong>Fecha reservada:</strong> {formatDate(res.date)}</p>
                                <p><strong>Horas:</strong> {formatSlots(res.slots)}</p>
                                <p><strong>Deadline de pago:</strong> {res.paymentDeadline ? new Date(res.paymentDeadline).toLocaleString() : 'N/A'}</p>
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default StaffReservationsPage;
