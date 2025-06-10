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
 * @param {object} reservationData - Datos de la reserva ({ productId, startDate, endDate }).
 * @param {string} token - Token JWT del usuario.
 * @returns {Promise<object>} - La reserva creada.
 */
export const createReservation = async (reservationData, token) => {
  const { user, productId, date, slots, quantity } = reservationData;
  try {
    const response = await fetch(`${API_BASE_URL}/reservations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`, // <-- Token de autenticación
      },
            body: JSON.stringify({
        customer: {
          id: user.id,
          name: user.name,
          contact: user.username,
        },
        products: [{ product: productId, quantity }],
        date,
        slots,
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

/**
 * Registra un nuevo usuario.
 * @param {object} userData - Datos del usuario (name, username, password).
 * @returns {Promise<object>} - El usuario creado.
 */
export const registerUser = async (userData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    const data = await response.json();

    if (!response.ok) {
      // El backend devuelve el error en data.message
      throw new Error(data.message || 'Error al registrar el usuario');
    }

    return data;
  } catch (error) {
    console.error('Error en registerUser:', error);
    throw error;
  }
};

/**
 * Obtiene todas las reservas del usuario autenticado.
 * @param {string} token - Token JWT del usuario.
 * @returns {Promise<Array>} - Un array de las reservas del usuario.
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

export const getUserReservations = async (token) => {
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
    return data.reservations; // El backend ahora devuelve las reservas en un objeto 'reservations'
  } catch (error) {
    console.error('Error en getUserReservations:', error);
    throw error;
  }
};

// Aquí se añadirán más funciones para interactuar con la API (productos, reservas, etc.)
