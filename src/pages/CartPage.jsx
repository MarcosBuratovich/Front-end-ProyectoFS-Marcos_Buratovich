import { useCart } from '../context/CartContext';
import { useState } from 'react';
import CheckoutModal from '../components/CheckoutModal';

function CartPage() {
  const { items, removeFromCart, clearCart } = useCart();
  const [checkoutOpen, setCheckoutOpen] = useState(false);

  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);

  if (items.length === 0) {
    return <div><h2>Carrito vacío</h2></div>;
  }

  return (
    <div>
      <h2>Carrito ({totalItems})</h2>
      <table>
        <thead>
          <tr>
            <th>Producto</th>
            <th>Cantidad</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {items.map(({ product, quantity }) => (
            <tr key={product._id}>
              <td>{product.type}</td>
              <td>{quantity}</td>
              <td><button onClick={() => removeFromCart(product._id)}>Quitar</button></td>
            </tr>
          ))}
        </tbody>
      </table>
      <button onClick={clearCart}>Vaciar carrito</button>
      <button onClick={() => setCheckoutOpen(true)}>Continuar a reservar</button>
      {checkoutOpen && <CheckoutModal onClose={() => setCheckoutOpen(false)} />}
    </div>
  );
}

export default CartPage;
