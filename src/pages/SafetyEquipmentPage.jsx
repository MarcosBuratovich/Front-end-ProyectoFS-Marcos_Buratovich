import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  getAllSafetyEquipment,
  createSafetyEquipment,
  updateSafetyEquipment,
  deleteSafetyEquipment,
} from '../services/apiService';
import { useAuth } from '../context/AuthContext';
import { RiShieldCheckFill } from 'react-icons/ri';
import './SafetyEquipmentPage.css';

const emptyForm = { type: 'Helmet', size: 'M', quantity: 1, status: 'available' };

const SafetyEquipmentPage = () => {
  const { token, user } = useAuth();
  const navigate = useNavigate();
  const [equipment, setEquipment] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const [formVisible, setFormVisible] = useState(false);
  const [formData, setFormData] = useState(emptyForm);
  const [editId, setEditId] = useState(null);

  // Only staff / admin
  useEffect(() => {
    const isAuthorized = user && ['staff', 'admin'].includes(user.role);
    if (!isAuthorized) navigate('/');
  }, [user, navigate]);

  const refreshList = async () => {
    try {
      setLoading(true);
      const list = await getAllSafetyEquipment(token);
      setEquipment(list);
    } catch (err) {
      setError(err.message || 'Error al cargar equipo');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) refreshList();
  }, [token]);

  const openCreateForm = () => {
    setFormData(emptyForm);
    setEditId(null);
    setFormVisible(true);
  };

  const openEditForm = (item) => {
    setFormData({ type: item.type, size: item.size, quantity: item.quantity, status: item.status });
    setEditId(item._id);
    setFormVisible(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Eliminar equipo?')) {
      try {
        await deleteSafetyEquipment(id, token);
        setMessage('Equipo eliminado');
        refreshList();
      } catch (err) {
        setError(err.message);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editId) {
        await updateSafetyEquipment(editId, formData, token);
        setMessage('Equipo actualizado');
      } else {
        await createSafetyEquipment(formData, token);
        setMessage('Equipo creado');
      }
      setFormVisible(false);
      refreshList();
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) return <div className="dashboard-loading"><div className="loading-spinner"></div><p>Cargando equipo...</p></div>;
  if (error) return <div className="dashboard-card"><div className="error-message">{error}</div></div>;

  return (
    <div className="equipment-container">
      <div className="dashboard-card-header">
        <h2><RiShieldCheckFill style={{ marginRight: 8 }} />Gestión de Equipo de Seguridad</h2>
      </div>
      {message && <div className="success-message dashboard-message">{message}</div>}
      <div className="dashboard-card">
        <button className="action-button add-button" onClick={openCreateForm}>＋ Añadir Equipo</button>
        <div className="table-responsive">
          <table className="equipment-table">
            <thead>
              <tr>
                <th>Tipo</th>
                <th>Talla</th>
                <th>Cantidad</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {equipment.map(item => (
                <tr key={item._id}>
                  <td>{item.type}</td>
                  <td>{item.size}</td>
                  <td>{item.quantity}</td>
                  <td>{item.status}</td>
                  <td>
                    <button className="action-button edit-button" onClick={() => openEditForm(item)}>✏️</button>
                    <button className="action-button delete-button" onClick={() => handleDelete(item._id)}>🗑️</button>
                  </td>
                </tr>
              ))}
              {equipment.length === 0 && <tr><td colSpan="5">No hay equipos registrados.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      {formVisible && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>{editId ? 'Editar Equipo' : 'Añadir Equipo'}</h3>
            <form onSubmit={handleSubmit} className="equipment-form">
              <label>Tipo:
                <select value={formData.type} onChange={e => setFormData({ ...formData, type: e.target.value })} required>
                  <option value="Helmet">Casco</option>
                  <option value="LifeJacket">Chaleco Salvavidas</option>
                </select>
              </label>
              <label>Talla:
                <select value={formData.size} onChange={e => setFormData({ ...formData, size: e.target.value })} required>
                  <option value="XS">XS</option>
                  <option value="S">S</option>
                  <option value="M">M</option>
                  <option value="L">L</option>
                  <option value="XL">XL</option>
                </select>
              </label>
              <label>Cantidad:
                <input type="number" min="1" value={formData.quantity} onChange={e => setFormData({ ...formData, quantity: Number(e.target.value) })} required />
              </label>
              <label>Estado:
                <select value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value })} required>
                  <option value="available">Disponible</option>
                  <option value="maintenance">Mantenimiento</option>
                  <option value="unavailable">No disponible</option>
                </select>
              </label>
              <div className="form-actions">
                <button type="submit" className="action-button save-button">Guardar</button>
                <button type="button" className="action-button cancel-button" onClick={() => setFormVisible(false)}>Cancelar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SafetyEquipmentPage;
