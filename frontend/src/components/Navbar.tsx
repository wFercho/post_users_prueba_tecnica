import { Link } from 'react-router-dom';
import ThemeToggle from './ThemeToggle';
import UserMenu from './UserMenu';
import { useAuth } from '../context/AuthContext';
import type { ReactNode } from 'react';

interface NavbarProps {
    title: string;
    children?: ReactNode;
}

export default function Navbar({ title, children }: NavbarProps) {
    const { token, currentUser, loading, logout } = useAuth();

    return (
        <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{title}</h1>

            <div className="flex items-center space-x-4">
                {/* Botones adicionales que se pasan como children */}
                {token && currentUser && children}

                <ThemeToggle />

                {token && currentUser && !loading ? (
                    <UserMenu username={currentUser.username} onLogout={logout} />
                ) : token && loading ? (
                    <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-gray-300 dark:bg-gray-600 rounded-full animate-pulse" />
                        <span className="text-gray-500 dark:text-gray-400">Cargando...</span>
                    </div>
                ) : (
                    <div className="flex space-x-2">
                        <Link
                            to="/login"
                            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
                        >
                            Iniciar sesión
                        </Link>
                        <Link
                            to="/register"
                            className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 transition"
                        >
                            Registrarse
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}
