import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getProductAvailability, createReservation } from '../services/apiService';
import './ReservationModal.css';

function ReservationModal({ product, quantity = 1, onClose }) {
  const { user, token } = useAuth();
  const minRiders = quantity > 1 ? quantity : 1;
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [slots, setSlots] = useState([]);
  const [selectedSlots, setSelectedSlots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerContact, setCustomerContact] = useState('');
  const [riders, setRiders] = useState(minRiders);
  const [helmetSizes, setHelmetSizes] = useState({ XS:0,S:0,M:0,L:0,XL:0 });
  const [jacketSizes, setJacketSizes] = useState({ XS:0,S:0,M:0,L:0,XL:0 });

  const adjustSizeQty = (kind, size, delta) => {
    const state = kind === 'helmet' ? helmetSizes : jacketSizes;
    const setter = kind === 'helmet' ? setHelmetSizes : setJacketSizes;
    const current = state[size];
    // No disminuir por debajo de 0
    if (delta < 0 && current === 0) return;
    // No exceder la cantidad de riders
    if (delta > 0 && Object.values(state).reduce((a,b)=>a+b,0) >= riders) return;

    if (riders === 1 && delta > 0) {
      // Selección exclusiva (radio) cuando solo hay un rider
      const reset = Object.fromEntries(Object.keys(state).map(k => [k, k === size ? 1 : 0]));
      setter(reset);
      return;
    }

    setter({ ...state, [size]: Math.max(0, current + delta) });
  };

  // Disable slots for today if within 2h payment window
  const today = new Date().toISOString().split('T')[0];
  const now = new Date();
  const currentSlotNumber = now.getHours() * 2 + (now.getMinutes() >= 30 ? 1 : 0);
  const minSlotNumber = date === today ? currentSlotNumber + 4 : 0;

  // generate default slot list 8:00-19:00 every hour (12 slots)
  const generateDefaultSlots = () => {
    const times = [];
    for (let h = 8; h < 20; h++) {
      const label = `${h.toString().padStart(2, '0')}:00`;
      times.push({ slot: h - 8, time: label, availableQuantity: '-' });
    }
    return times;
  };

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
  }, [date]);

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
    if ((product.type === 'JetSki' || product.type === 'ATV') && (riders < minRiders || riders > quantity * 2)) {
      setError(`Número de pasajeros debe ser entre ${minRiders} y ${quantity * 2}`);
      return;
    }
    if (!customerName || !customerContact) {
      setError('Nombre y número de teléfono son obligatorios.');
      setLoading(false);
      return;
    }
    // Validate safety equipment totals
    if ((product.type === 'JetSki' || product.type === 'ATV')) {
      const totalHelmets = Object.values(helmetSizes).reduce((a,b)=>a+b,0);
      const totalJackets = Object.values(jacketSizes).reduce((a,b)=>a+b,0);
      if (totalHelmets !== riders) {
        setError(`Debes seleccionar exactamente ${riders} cascos`);
        return;
      }
      if (product.type==='JetSki' && totalJackets !== riders) {
        setError(`Debes seleccionar exactamente ${riders} chalecos`);
        return;
      }
    }

    if (selectedSlots.length === 0) {
      setError('Debes seleccionar al menos un horario.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const reservationData = {
        customerName,
        customerContact,
        date,
        slots: selectedSlots,
      };
      reservationData.productId = product._id;
      reservationData.quantity = quantity;
      if (product.type === 'JetSki' || product.type === 'ATV') {
        reservationData.riders = riders;
        const safetyEquipmentRequested = [];
        Object.entries(helmetSizes).forEach(([size,q])=>{
          if(q>0) safetyEquipmentRequested.push({type:'Helmet',size,quantity:q});
        });
        if(product.type==='JetSki'){
          Object.entries(jacketSizes).forEach(([size,q])=>{
            if(q>0) safetyEquipmentRequested.push({type:'LifeJacket',size,quantity:q});
          });
        }
        reservationData.safetyEquipmentRequested = safetyEquipmentRequested;
      }
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
        <h2>Reservar {quantity}× {product.type}</h2>
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
        <div className="form-group">
          <label htmlFor="customer-name">Nombre del cliente:</label>
          <input id="customer-name" type="text" value={customerName} onChange={e => setCustomerName(e.target.value)} />
        </div>
        <div className="form-group">
          <label htmlFor="customer-contact">Número de teléfono:</label>
          <input id="customer-contact" type="text" value={customerContact} onChange={e => setCustomerContact(e.target.value)} />
        </div>
        {(product.type === 'JetSki' || product.type === 'ATV') && (
          <div className="form-group">
            <label htmlFor="riders">Número de pasajeros ({minRiders}-{quantity*2}):</label>
            <input id="riders" type="number" min={minRiders} max={quantity*2} value={riders} onChange={e => setRiders(Math.max(minRiders, Math.min(quantity*2, parseInt(e.target.value) || minRiders)))} />
          </div>
        )}
        {(product.type === 'JetSki' || product.type === 'ATV') && (
          <div className="form-group">
            <div className="form-group">
              <p>Selecciona tallas de cascos (total {riders}):</p>
              <div className="size-grid">
                {['XS','S','M','L','XL'].map(size=> (
                  <div key={size} className="size-item"><span>{size}</span>
                    <div className="quantity-selector small">
                      <button onClick={()=>adjustSizeQty('helmet',size,-1)} disabled={helmetSizes[size]<=0}>-</button>
                      <span className="qty-value">{helmetSizes[size]}</span>
                      <button onClick={()=>adjustSizeQty('helmet',size,1)} disabled={Object.values(helmetSizes).reduce((a,b)=>a+b,0)>=riders}>+</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            {product.type==='JetSki' && (
              <div className="form-group">
                <p>Selecciona tallas de chalecos (total {riders}):</p>
                <div className="size-grid">
                  {['XS','S','M','L','XL'].map(size=> (
                    <div key={size} className="size-item"><span>{size}</span>
                    <div className="quantity-selector small">
                      <button onClick={()=>adjustSizeQty('jacket',size,-1)} disabled={jacketSizes[size]<=0}>-</button>
                      <span className="qty-value">{jacketSizes[size]}</span>
                      <button onClick={()=>adjustSizeQty('jacket',size,1)} disabled={Object.values(jacketSizes).reduce((a,b)=>a+b,0)>=riders}>+</button>
                    </div>
                  </div>
                ))}
                    

                </div>
              </div>
            )}
          </div>
        )}
        
        <div className="slots-container">
          {loading && <p>Cargando horarios...</p>}
          {!loading && slots.length === 0 && !error && <p>No hay horarios disponibles para esta fecha.</p>}
          <div className="slots-grid">
            {slots.map(slot => {
              const disabled = date === today && slot.slot < minSlotNumber;
              return (
                <button
                  key={slot.slot}
                  className={`slot-btn ${selectedSlots.includes(slot.slot) ? 'selected' : ''} ${disabled ? 'disabled' : ''}`}
                  disabled={disabled}
                  onClick={() => !disabled && handleSlotClick(slot)}
                >
                  <div>{slot.time}</div>
                  <div className="available-count">{slot.availableQuantity} disponibles</div>
                </button>
              );
            })}
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
