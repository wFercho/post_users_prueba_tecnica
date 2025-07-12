import { createContext, useContext, useEffect, useState } from 'react';
import { getCurrentUser } from '../services/userService';
import type { User } from '../types/user';

interface AuthContextType {
    token: string | null;
    currentUser: User | null;
    loading: boolean;
    login: (token: string) => Promise<void>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [loading, setLoading] = useState<boolean>(!!token);

    useEffect(() => {
        if (token) {
            getCurrentUser()
                .then(setCurrentUser)
                .catch(() => {
                    setCurrentUser(null);
                    localStorage.removeItem('token');
                    setToken(null);
                })
                .finally(() => setLoading(false));
        } else {
            setLoading(false);
        }
    }, [token]);

    const login = async (newToken: string) => {
        console.log('AuthContext: iniciando login con token:', newToken);
        localStorage.setItem('token', newToken);
        setToken(newToken);
        setLoading(true);
        
        try {
            console.log('AuthContext: obteniendo usuario...');
            const user = await getCurrentUser();
            console.log('AuthContext: usuario obtenido:', user);
            setCurrentUser(user);
            console.log('AuthContext: login completado exitosamente');
        } catch (error) {
            console.error('Error al obtener usuario después del login:', error);
            logout();
            throw error; // Re-lanzar el error para que el componente lo maneje
        } finally {
            setLoading(false);
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        setToken(null);
        setCurrentUser(null);
    };

    return (
        <AuthContext.Provider value={{ token, currentUser, loading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth debe usarse dentro de un AuthProvider');
    return context;
}