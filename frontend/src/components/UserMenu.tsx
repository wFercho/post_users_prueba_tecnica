import { useState, useRef, useEffect } from 'react';
import { logout } from '../services/userService';
import ProfileModal from './ProfileModal';
import { useNavigate } from 'react-router-dom';

interface UserMenuProps {
    username?: string;
    onLogout?: () => void;
}

export default function UserMenu({ username, onLogout }: UserMenuProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [showProfile, setShowProfile] = useState(false);
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);
    const navigate = useNavigate();

    // Cerrar menú al hacer clic fuera
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleLogout = async () => {
        setIsLoggingOut(true);
        try {
            await logout();
            onLogout?.();
            navigate('/login');
        } catch (error) {
            console.error('Error during logout:', error);
        } finally {
            setIsLoggingOut(false);
            setIsOpen(false);
        }
    };

    const handleProfileClick = () => {
        setShowProfile(true);
        setIsOpen(false);
    };

    return (
        <>
            <div className="relative" ref={menuRef}>
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="flex items-center space-x-2 text-gray-700 dark:text-gray-200 hover:text-gray-900 dark:hover:text-white focus:outline-none"
                >
                    <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                        {username?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <span className="hidden sm:block">{username || 'Usuario'}</span>
                    <svg
                        className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                </button>

                {isOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg z-10 border border-gray-200 dark:border-gray-700">
                        <div className="py-1">
                            <button
                                onClick={handleProfileClick}
                                className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center space-x-2"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                                <span>Mi Perfil</span>
                            </button>

                            <div className="border-t border-gray-200 dark:border-gray-700"></div>

                            <button
                                onClick={handleLogout}
                                disabled={isLoggingOut}
                                className="block w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center space-x-2 disabled:opacity-50"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                </svg>
                                <span>{isLoggingOut ? 'Cerrando sesión...' : 'Cerrar sesión'}</span>
                            </button>
                        </div>
                    </div>
                )}
            </div>

            <ProfileModal
                isOpen={showProfile}
                onClose={() => setShowProfile(false)}
                onUserUpdate={() => {
                    // Aquí podrías actualizar el username si es necesario
                    console.log('Perfil actualizado');
                }}
            />
        </>
    );
}