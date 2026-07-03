// src/services/jugadorService.js
import axios from 'axios';

// En desarrollo: localhost:5000/api
// En producción: /api (relativo al mismo dominio)
const API_BASE_URL = import.meta.env.DEV
    ? 'http://localhost:5000/api'
    : '/api';

console.log('🌐 API URL:', API_BASE_URL);

export const jugadorService = {
    getAll: async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/jugadores`);
            return response.data;
        } catch (error) {
            console.error('Error al obtener jugadores:', error);
            throw new Error('Error al obtener jugadores');
        }
    },

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