import React, { useState, useEffect } from 'react';
import { getProducts } from '../services/apiService';
import ProductCard from '../components/ProductCard';
import { RiParkingBoxLine } from 'react-icons/ri';
import './ProductsPage.css';

function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await getProducts();
        console.log('Datos recibidos de la API:', data); // <-- Punto de depuración
        setProducts(data.products);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  if (loading) return (
    <div className="dashboard-loading">
      <div className="loading-spinner"></div>
      <p>Cargando productos...</p>
    </div>
  );
  
  if (error) return (
    <div className="dashboard-card">
      <div className="error-message">Error: {error}</div>
    </div>
  );

  return (
    <div className="products-page-container" style={{ width: '100%' }}>
      <div className="dashboard-card-header" style={{ width: '100%' }}>
        <h2>
          <RiParkingBoxLine style={{ marginRight: '10px', verticalAlign: 'middle' }} />
          Catálogo de Productos
        </h2>
      </div>
      
      {products.length > 0 ? (
        <div className="dashboard-card" style={{ width: '100%' }}>
          <div className="product-grid">
            {products.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        </div>
      ) : (
        <div className="dashboard-card" style={{ width: '100%' }}>
          <p>No hay productos disponibles en este momento.</p>
        </div>
      )}
    </div>
  );
}

export default ProductsPage;
