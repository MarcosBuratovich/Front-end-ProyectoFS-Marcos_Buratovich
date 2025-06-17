const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001/api';

/**
 * Realiza una solicitud de login a la API.
 * @param {object} credentials - Las credenciales del usuario (email, password).
 * @returns {Promise<object>} - La respuesta de la API.
 */
export const loginUser = async (credentials) => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Error al iniciar sesión');
    }

    return response.json();
  } catch (error) {
    console.error('Error en loginUser:', error);
    throw error;
  }
};

/**
 * Obtiene la lista de todos los productos.
 * @returns {Promise<Array>} - Un array de productos.
 */
export const getProducts = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/products`);

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Error al obtener los productos');
    }

    return response.json();
  } catch (error) {
    console.error('Error en getProducts:', error);
    throw error;
  }
};

/**
 * Crea una nueva reserva para un producto.
 * @param {object} reservationData - Datos de la reserva ({ customerName, customerContact, productId, date, slots, quantity }).
 * @param {string} token - Token JWT del usuario.
 * @returns {Promise<object>} - La reserva creada.
 */
export const createReservation = async (reservationData, token) => {
  const {
    customerName,
    customerContact,
    productId,
    quantity,
    riders,
    date,
    slots,
    safetyEquipmentRequested = []
  } = reservationData;
  
  try {
    const response = await fetch(`${API_BASE_URL}/reservations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`, // <-- Token de autenticación
      },
            body: JSON.stringify({
        customer: { name: customerName, contact: customerContact },
        products: [{ product: productId, quantity }],
        date,
        slots,
        ...(riders ? { riders } : {}),
        ...(safetyEquipmentRequested.length ? { safetyEquipmentRequested } : {})
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Error al crear la reserva');
    }

    return response.json();
  } catch (error) {
    console.error('Error en createReservation:', error);
    throw error;
  }
};

/**
 * Obtiene los horarios disponibles para un producto en una fecha específica.
 * @param {string} productId - ID del producto.
 * @param {string} date - Fecha en formato YYYY-MM-DD.
 * @returns {Promise<object>} - La disponibilidad del producto.
 */
export const getProductAvailability = async (productId, date) => {
  try {
    const response = await fetch(`${API_BASE_URL}/availability/${date}/${productId}`);

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Error al obtener la disponibilidad');
    }

    return response.json();
  } catch (error) {
    console.error('Error en getProductAvailability:', error);
    throw error;
  }
};

// Actualiza cantidad de un producto (admin)
export const updateProductQuantity = async (productId, updateData, token) => {
  try {
    const res = await fetch(`${API_BASE_URL}/products/${productId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(updateData),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || 'Error al actualizar el producto');
    }
    return await res.json();
  } catch (error) {
    console.error('Error en updateProductQuantity:', error);
    throw error;
  }
};

// Función registerUser eliminada porque el sistema es cerrado para staff/admin

/**
 * Las siguientes funciones se enfocan solo en gestión por staff/admin
 */
/**
 * Cancela una reserva específica.
 * @param {string} reservationId - El ID de la reserva a cancelar.
 * @param {string} token - Token JWT del usuario.
 * @returns {Promise<Object>} - El objeto de la reserva actualizada.
 */
export const cancelReservation = async (reservationId, token) => {
  try {
    const response = await fetch(`${API_BASE_URL}/reservations/${reservationId}/cancel`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Error al cancelar la reserva');
    }

    return await response.json();
  } catch (error) {
    console.error('Error en cancelReservation:', error);
    throw error;
  }
};

// Función getUserReservations eliminada porque el sistema es cerrado para staff/admin

/**
 * ------------ SAFETY EQUIPMENT (Cascos / Chalecos) -------------
 */
export const getAllSafetyEquipment = async (token) => {
  try {
    const res = await fetch(`${API_BASE_URL}/safety-equipment`, {
      headers: {
        'Authorization': `Bearer ${token}`
      },
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || 'Error al obtener el equipo de seguridad');
    }
    const data = await res.json();
    return data.equipment || data;
  } catch (error) {
    console.error('Error en getAllSafetyEquipment:', error);
    throw error;
  }
};

export const createSafetyEquipment = async (equipmentData, token) => {
  try {
    const res = await fetch(`${API_BASE_URL}/safety-equipment`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(equipmentData),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || 'Error al crear el equipo');
    }
    return await res.json();
  } catch (error) {
    console.error('Error en createSafetyEquipment:', error);
    throw error;
  }
};

export const updateSafetyEquipment = async (id, equipmentData, token) => {
  try {
    const res = await fetch(`${API_BASE_URL}/safety-equipment/${id}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(equipmentData),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || 'Error al actualizar el equipo');
    }
    return await res.json();
  } catch (error) {
    console.error('Error en updateSafetyEquipment:', error);
    throw error;
  }
};

export const deleteSafetyEquipment = async (id, token) => {
  try {
    const res = await fetch(`${API_BASE_URL}/safety-equipment/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      },
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || 'Error al eliminar el equipo');
    }
    return await res.json();
  } catch (error) {
    console.error('Error en deleteSafetyEquipment:', error);
    throw error;
  }
};

/**
 * -------- RESERVAS DEL DÍA / CALENDARIO ----------
 */
export const getReservationsByDate = async (dateISO, token) => {
  try {
    const res = await fetch(`${API_BASE_URL}/reservations/date/${dateISO}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      },
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || 'Error al obtener las reservas del día');
    }
    const data = await res.json();
    return data.reservations || data;
  } catch (error) {
    console.error('Error en getReservationsByDate:', error);
    throw error;
  }
};

// Aquí se añadirán más funciones para interactuar con la API (productos, reservas, etc.)

/**
 * Obtiene todas las reservas del sistema (solo para staff/admin)
 * @param {string} token - Token JWT del staff o admin
 * @returns {Promise<Array>} - Un array con todas las reservas
 */
export const getAllReservations = async (token) => {
  try {
    const response = await fetch(`${API_BASE_URL}/reservations`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Error al obtener las reservas');
    }

    const data = await response.json();
    return data.reservations;
  } catch (error) {
    console.error('Error en getAllReservations:', error);
    throw error;
  }
};

/**
 * Marca una reserva como pagada
 * @param {string} reservationId - ID de la reserva
 * @param {string} token - Token JWT del staff o admin
 * @returns {Promise<Object>} - La respuesta de la API
 */
export const markReservationPaid = async (reservationId, token, payment = { type: 'cash', currency: 'local' }) => {
  try {
    const response = await fetch(`${API_BASE_URL}/reservations/${reservationId}/payment`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        paymentMethod: {
          type: payment.type,
          currency: payment.currency
        }
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Error al procesar el pago de la reserva');
    }

    return await response.json();
  } catch (error) {
    console.error('Error en markReservationPaid:', error);
    throw error;
  }
};

/**
 * Procesa el reembolso parcial (50 %) por seguro de tormenta
 * @param {string} reservationId - ID de la reserva
 * @param {string} token - Token JWT del staff o admin
 * @returns {Promise<Object>} - La respuesta de la API
 */
export const processStormRefund = async (reservationId, token) => {
  try {
    const response = await fetch(`${API_BASE_URL}/reservations/${reservationId}/storm-refund`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Error al procesar el reembolso por tormenta');
    }

    return await response.json();
  } catch (error) {
    console.error('Error en processStormRefund:', error);
    throw error;
  }
};
