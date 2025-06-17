import React, { useEffect, useState } from 'react';
import { getProducts, updateProductQuantity } from '../services/apiService';
import { useAuth } from '../context/AuthContext';
import './ProductStockPage.css';

function ProductStockPage() {
  const { token } = useAuth();
  const [products, setProducts] = useState([]);
  const [edited, setEdited] = useState({}); // { productId: newQuantity }
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const loadProducts = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getProducts();
      setProducts(data.products || data);
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const handleChange = (id, value) => {
    setEdited(prev => ({ ...prev, [id]: parseInt(value) }));
  };

  const handleSave = async (product) => {
    const newQty = edited[product._id];
    if (newQty == null || newQty < 0) return;
    try {
      await updateProductQuantity(product._id, { quantity: newQty }, token);
      setSuccess(`Stock actualizado para ${product.type}`);
      setTimeout(()=>setSuccess(''),3000);
      await loadProducts();
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) return <p>Cargando productos...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div className="dashboard-card" style={{ width: '100%' }}>
      <h2>Stock de Productos</h2>
      {success && <p className="success-message">{success}</p>}
      <table className="stock-table">
        <thead>
          <tr>
            <th>Tipo</th>
            <th>Descripción</th>
            <th>Disponible</th>
            <th>Nuevo Stock</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {products.map(p => (
            <tr key={p._id}>
              <td>{p.type}{p.sizeCategory ? ` (${p.sizeCategory})` : ''}</td>
              <td>{p.description}</td>
              <td>{p.quantity}</td>
              <td>
                <input type="number" min="0" defaultValue={p.quantity}
                  onChange={e=>handleChange(p._id,e.target.value)} />
              </td>
              <td><button className="btn-primary" onClick={()=>handleSave(p)}>Guardar</button></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default ProductStockPage;
