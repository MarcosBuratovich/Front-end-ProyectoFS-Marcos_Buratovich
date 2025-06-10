import React, { useState } from 'react';
import './ProductCard.css';
import { useAuth } from '../context/AuthContext';
import ReservationModal from './ReservationModal';

function ProductCard({ product }) {
  const { token, isAuthenticated } = useAuth();
  const [message, setMessage] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleReserveClick = () => {
    if (!isAuthenticated) {
      setMessage('Debes iniciar sesión para reservar.');
      setTimeout(() => setMessage(''), 3000);
      return;
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };
  return (
    <>
      <div className="product-card"> 
        <div className="product-info">
          <h3>{product.type} {product.sizeCategory && `(${product.sizeCategory})`}</h3>
          <p className="product-description">{product.description || 'Sin descripción.'}</p>
          <div className="product-details">
            <span className="product-price">${product.price} / día</span>
            <span className="product-quantity">Disponibles: {product.quantity}</span>
          </div>
          <div className="product-actions">
            <button 
              onClick={handleReserveClick} 
              disabled={product.quantity === 0}
            >
              Reservar
            </button>
            {message && <p className="reservation-message">{message}</p>}
          </div>
        </div>
      </div>
      {isModalOpen && (
        <ReservationModal 
          product={product} 
          onClose={handleCloseModal} 
        />
      )}
    </>
  );
}

export default ProductCard;
