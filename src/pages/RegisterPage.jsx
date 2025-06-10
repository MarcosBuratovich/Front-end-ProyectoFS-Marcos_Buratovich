import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { registerUser } from '../services/apiService';
import './RegisterPage.css';

function RegisterPage() {
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.username || !formData.password) {
      setError('Todos los campos son obligatorios.');
      return;
    }
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await registerUser(formData);
      setSuccess('¡Usuario registrado con éxito! Redirigiendo al login...');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      setError(err.message || 'No se pudo completar el registro.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-container">
      <form className="register-form" onSubmit={handleSubmit}>
        <h2>Crear una Cuenta</h2>
        <div className="form-group">
          <label htmlFor="name">Nombre Completo</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="username">Nombre de Usuario</label>
          <input
            type="text"
            id="username"
            name="username"
            value={formData.username}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="password">Contraseña</label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
          />
        </div>
        <button type="submit" className="btn-submit" disabled={loading}>
          {loading ? 'Registrando...' : 'Crear Cuenta'}
        </button>
        {error && <p className="message error-message">{error}</p>}
        {success && <p className="message success-message">{success}</p>}
      </form>
    </div>
  );
}

export default RegisterPage;
