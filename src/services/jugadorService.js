// src/services/jugadorService.js
import axios from 'axios';

// Detectar si estamos en desarrollo o producción
const isDevelopment = import.meta.env.DEV;
const API_BASE_URL = isDevelopment
    ? 'http://localhost:5000'
    : window.location.origin; // En producción, la API está en el mismo dominio

console.log('🌐 API URL:', API_BASE_URL);

export const jugadorService = {
    // Obtener todos los jugadores
    getAll: async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/jugadores`);
            return response.data;
        } catch (error) {
            console.error('Error al obtener jugadores:', error);
            throw new Error('Error al obtener jugadores');
        }
    },

    // Crear un nuevo jugador
    create: async (jugador) => {
        try {
            const response = await axios.post(`${API_BASE_URL}/jugadores`, jugador, {
                headers: { 'Content-Type': 'application/json' }
            });
            return response.data;
        } catch (error) {
            console.error('Error al crear jugador:', error);
            throw new Error('Error al crear jugador');
        }
    },

    // Actualizar un jugador
    update: async (id, jugador) => {
        try {
            const response = await axios.put(`${API_BASE_URL}/jugadores/${id}`, jugador, {
                headers: { 'Content-Type': 'application/json' }
            });
            return response.data;
        } catch (error) {
            console.error('Error al actualizar jugador:', error);
            throw new Error('Error al actualizar jugador');
        }
    },

    // Eliminar un jugador
    delete: async (id) => {
        try {
            await axios.delete(`${API_BASE_URL}/jugadores/${id}`);
            return { success: true };
        } catch (error) {
            console.error('Error al eliminar jugador:', error);
            throw new Error('Error al eliminar jugador');
        }
    }
};