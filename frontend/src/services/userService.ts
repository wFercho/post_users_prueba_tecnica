import type { User, UserUpdate } from "../types/user";

const API_URL = 'http://localhost:8000';


// Obtener información del usuario actual
export const getCurrentUser = async (): Promise<User> => {
    const token = localStorage.getItem('token');

    if (!token) {
        throw new Error('No token found');
    }

    const response = await fetch(`${API_URL}/me`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
    });

    if (!response.ok) {
        throw new Error('Failed to fetch user data');
    }

    return response.json();
};

// Actualizar información del usuario
export const updateUser = async (userData: UserUpdate): Promise<User> => {
    const token = localStorage.getItem('token');

    if (!token) {
        throw new Error('No token found');
    }

    const response = await fetch(`${API_URL}/me`, {
        method: 'PUT',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
    });

    if (!response.ok) {
        throw new Error('Failed to update user');
    }

    return response.json();
};

// Cerrar sesión
export const logout = async (): Promise<void> => {
    const token = localStorage.getItem('token');

    if (!token) {
        return;
    }

    try {
        await fetch(`${API_URL}/logout`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });
    } catch (error) {
        console.error('Error during logout:', error);
    } finally {
        // Limpiar el token del localStorage independientemente del resultado
        localStorage.removeItem('token');
    }
};