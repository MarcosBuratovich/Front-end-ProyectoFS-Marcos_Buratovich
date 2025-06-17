import React, { useState } from 'react';
import './ProductCard.css';
import { useAuth } from '../context/AuthContext';

import ReservationModal from './ReservationModal';

function ProductCard({ product }) {
  const { token, isAuthenticated } = useAuth();
  const [message, setMessage] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [quantity, setQuantity] = useState(1);



  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleReserveClick = () => {
    if (!isAuthenticated) {
      setMessage('Debes iniciar sesión para reservar.');
      setTimeout(() => setMessage(''), 3000);
      return;
    }
    if (quantity < 1 || quantity > product.quantity) {
      setMessage('Cantidad inválida');
      setTimeout(()=>setMessage(''),2000);
      return;
    }
    setIsModalOpen(true);
  };

  return (
    <>
      <div className="product-card dashboard-card action-card"> 
        <h3>{product.type} {product.sizeCategory && `(${product.sizeCategory})`}</h3>
        <div className="product-details">
          <span className="product-price">${product.price} / día</span>
          <span className={`badge product-quantity ${product.quantity > 0 ? 'badge-success' : 'badge-warning'}`}>
            Disponibles: {product.quantity}
          </span>
        </div>
        <div className="product-actions">
          <div className="quantity-selector">
              <button onClick={()=>setQuantity(q=>Math.max(1,q-1))} disabled={quantity<=1}>-</button>
              <span className="qty-value">{quantity}</span>
              <button onClick={()=>setQuantity(q=>Math.min(product.quantity,q+1))} disabled={quantity>=product.quantity}>+</button>
           </div>
           <button 
            onClick={handleReserveClick} 
            disabled={product.quantity === 0}
            className="btn btn-secondary"
          >
            Reservar
          </button>
          {message && <p className="reservation-message">{message}</p>}
        </div>
      </div>
      {isModalOpen && (
        <ReservationModal 
          product={product} 
          quantity={quantity}
          onClose={handleCloseModal} 
        />
      )}
    </>
  );
}

export default ProductCard;
