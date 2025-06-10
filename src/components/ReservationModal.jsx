import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getProductAvailability, createReservation } from '../services/apiService';
import './ReservationModal.css';

function ReservationModal({ product, onClose }) {
  const { user, token } = useAuth();
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [slots, setSlots] = useState([]);
  const [selectedSlots, setSelectedSlots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (!date) return;

    const fetchAvailability = async () => {
      setLoading(true);
      setError('');
      setSlots([]);
      setSelectedSlots([]);
      try {
        const response = await getProductAvailability(product._id, date);
        // Filtramos para mostrar solo slots con cantidad disponible y dentro del horario de 9 a 18 hs
        const filteredSlots = response.availability.slots.filter(slot => 
          slot.availableQuantity > 0 && slot.slot >= 18 && slot.slot < 36
        );
        setSlots(filteredSlots);
      } catch (err) {
        setError(err.message || 'No se pudo cargar la disponibilidad.');
      }
      setLoading(false);
    };

    fetchAvailability();
  }, [date, product._id]);

  const handleSlotClick = (slot) => {
    setSelectedSlots(prev => {
      if (prev.includes(slot.slot)) {
        return prev.filter(s => s !== slot.slot);
      }
      const newSelection = [...prev, slot.slot].sort((a, b) => a - b);
      if (newSelection.length > 3) {
        setError('No puedes seleccionar más de 3 horarios.');
        return prev;
      }
      for (let i = 1; i < newSelection.length; i++) {
        if (newSelection[i] !== newSelection[i-1] + 1) {
          setError('Los horarios deben ser consecutivos.');
          return prev;
        }
      }
      setError('');
      return newSelection;
    });
  };

  const handleConfirm = async () => {
    if (selectedSlots.length === 0) {
      setError('Debes seleccionar al menos un horario.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const reservationData = {
        user,
        productId: product._id,
        date,
        slots: selectedSlots,
        quantity: 1, // Simplificado a 1 por ahora
      };
      await createReservation(reservationData, token);
      setSuccess('¡Reserva confirmada con éxito!');
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (err) {
      setError(err.message || 'No se pudo confirmar la reserva.');
    }
    setLoading(false);
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <h2>Reservar: {product.type}</h2>
        <div className="form-group">
          <label htmlFor="date-picker">Selecciona una fecha:</label>
          <input 
            type="date" 
            id="date-picker"
            value={date}
            min={new Date().toISOString().split('T')[0]}
            onChange={e => setDate(e.target.value)}
          />
        </div>
        
        <div className="slots-container">
          {loading && <p>Cargando horarios...</p>}
          {!loading && slots.length === 0 && !error && <p>No hay horarios disponibles para esta fecha.</p>}
          <div className="slots-grid">
            {slots.map(slot => (
              <button 
                key={slot.slot}
                className={`slot-btn ${selectedSlots.includes(slot.slot) ? 'selected' : ''}`}
                onClick={() => handleSlotClick(slot)}
              >
                {slot.time}
              </button>
            ))}
          </div>
        </div>

        {error && <p className="message error-message">{error}</p>}
        {success && <p className="message success-message">{success}</p>}

        <div className="modal-actions">
          <button onClick={onClose} className="btn-secondary">Cancelar</button>
          <button onClick={handleConfirm} className="btn-primary" disabled={loading || selectedSlots.length === 0}>
            {loading ? 'Confirmando...' : 'Confirmar Reserva'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ReservationModal;
