import React, { useState, useEffect, useCallback } from 'react';
import { getUserReservations, cancelReservation } from '../services/apiService';
import { useAuth } from '../context/AuthContext';
import './ReservationsPage.css';

const ReservationsPage = () => {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const { token } = useAuth();

  useEffect(() => {
    const fetchReservations = async () => {
      if (!token) {
        setLoading(false);
        setError('Debes iniciar sesión para ver tus reservas.');
        return;
      }

      try {
        setLoading(true);
        const fetchedReservations = await getUserReservations(token);
        setReservations(fetchedReservations || []);
      } catch (err) {
        setError(err.message || 'No se pudieron cargar las reservas.');
      } finally {
        setLoading(false);
      }
    };

    fetchReservations();
  }, [token]);

  if (loading) {
    return <div className="reservations-container"><p>Cargando tus reservas...</p></div>;
  }

  const handleCancel = async (reservationId) => {
    if (window.confirm('¿Estás seguro de que quieres cancelar esta reserva?')) {
      try {
        const result = await cancelReservation(reservationId, token);
        setMessage(result.message);
        setReservations(prev => 
          prev.map(res => res._id === reservationId ? { ...res, cancellationStatus: 'canceled' } : res)
        );
      } catch (err) {
        setError(err.response?.data?.message || err.message || 'Error al cancelar la reserva.');
      }
    }
  };

  if (error) {
    return <div className="reservations-container"><p className="error-message">{error}</p></div>;
  }

  return (
    <div className="reservations-container">
            <h1>Mis Reservas</h1>
      {message && <p className="success-message">{message}</p>}
      {reservations.length === 0 ? (
        <p>Aún no tienes ninguna reserva.</p>
      ) : (
        <ul className="reservations-list">
          {reservations.map((res) => (
            <li key={res._id} className="reservation-item">
              <div className="reservation-details">
                                <p><strong>Producto:</strong> {res.products.filter(p => p.product).map(p => p.product.name).join(', ')}</p>
                <p><strong>Fecha:</strong> {new Date(res.date).toLocaleDateString()}</p>
                <p><strong>Horarios:</strong> {res.slots.join(' - ')}</p>
                                <p><strong>Estado del Pago:</strong> <span className={`status status-${res.paymentStatus}`}>{res.paymentStatus}</span></p>
                                {res.cancellationStatus !== 'none' && 
                                    <p><strong>Estado de Cancelación:</strong> <span className={`status status-${res.cancellationStatus}`}>{res.cancellationStatus}</span></p>
                                }
                                <p><strong>Total:</strong> ${res.totalPrice}</p>
                {res.cancellationStatus === 'none' && res.paymentStatus !== 'paid' && (
                  <button onClick={() => handleCancel(res._id)} className="cancel-button">
                    Cancelar Reserva
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ReservationsPage;
