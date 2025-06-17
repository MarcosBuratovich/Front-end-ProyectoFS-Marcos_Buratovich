import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getReservationsByDate } from '../services/apiService';
import { useAuth } from '../context/AuthContext';
import { RiCalendarEventFill } from 'react-icons/ri';
import './StaffTodayPage.css';

const SLOT_ORDER = [
  '08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
  '12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30',
  '16:00', '16:30', '17:00', '17:30', '18:00', '18:30', '19:00', '19:30'
];

const StaffTodayPage = () => {
  const { token, user } = useAuth();
  const navigate = useNavigate();
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Only staff / admin
  useEffect(() => {
    const isAuthorized = user && ['staff', 'admin'].includes(user.role);
    if (!isAuthorized) navigate('/');
  }, [user, navigate]);

  const todayISO = new Date().toISOString().split('T')[0];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getReservationsByDate(todayISO, token);
        // Sort by first slot order
        data.sort((a, b) => {
          const aSlot = a.slots[0];
          const bSlot = b.slots[0];
          return SLOT_ORDER.indexOf(aSlot) - SLOT_ORDER.indexOf(bSlot);
        });
        setReservations(data);
      } catch (err) {
        setError(err.message || 'Error al cargar reservas');
      } finally {
        setLoading(false);
      }
    };
    if (token) fetchData();
  }, [token, todayISO]);

  // Helpers para formatear slot -> hora
  const slotToTime = (slot) => {
    const hours = Math.floor(slot / 2);
    const minutes = slot % 2 === 0 ? '00' : '30';
    return `${hours.toString().padStart(2,'0')}:${minutes}`;
  };
  const formatSlots = (arr=[]) => arr.map(slotToTime).join(' - ');

  if (loading) return <div className="dashboard-loading"><div className="loading-spinner"></div><p>Cargando reservas de hoy...</p></div>;
  if (error) return <div className="dashboard-card"><div className="error-message">{error}</div></div>;

  return (
    <div className="today-container">
      <div className="dashboard-card-header">
        <h2><RiCalendarEventFill style={{ marginRight: 8 }} />Reservas de Hoy ({todayISO})</h2>
      </div>
      <div className="dashboard-card">
        <div className="table-responsive">
          <table className="today-table">
            <thead>
              <tr>
                <th>Hora(s)</th>
                <th>Cliente</th>
                <th>Productos</th>
                <th>Personas</th>
                <th>Estado Pago</th>
              </tr>
            </thead>
            <tbody>
              {reservations.map(res => (
                <tr key={res._id} className={`status-${res.paymentStatus}`}>
                  <td>{formatSlots(res.slots)}</td>
                  <td>{res.customer?.name} - {res.customer?.contact}</td>
                  <td>
                    {res.products?.map((p,i)=>(
                      <span key={i}>{p.product?.name || p.product?.title || p.product?.type || p.productId || 'Producto'} ({p.quantity})</span>
                    ))}
                  </td>
                  <td>{res.riders || res.products?.reduce((sum,p)=>sum+p.quantity*2,0)}</td>
                  <td>{res.paymentStatus}</td>
                </tr>
              ))}
              {reservations.length === 0 && <tr><td colSpan="5">No hay reservas para hoy.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default StaffTodayPage;
