import ReservationModal from './ReservationModal';
import { useCart } from '../context/CartContext';
import { useState } from 'react';

function CheckoutModal({ onClose }) {
  const { items, clearCart } = useCart();
  const [reservationOpen, setReservationOpen] = useState(false);

  if (reservationOpen) {
    // Send all items to reservation modal (modified to accept array)
    return <ReservationModal products={items} onClose={() => { setReservationOpen(false); clearCart(); onClose(); }} multi />;
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <h3>Resumen del carrito</h3>
        <ul>
          {items.map(({ product, quantity }) => (
            <li key={product._id}>{product.type} x {quantity}</li>
          ))}
        </ul>
        <div className="modal-actions">
          <button className="btn-secondary" onClick={onClose}>Volver</button>
          <button className="btn-primary" onClick={() => setReservationOpen(true)}>Seleccionar fecha y horarios</button>
        </div>
      </div>
    </div>
  );
}

export default CheckoutModal;
