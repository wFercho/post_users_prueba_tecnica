import { useState, useEffect } from 'react';
import { getCurrentUser, updateUser } from '../services/userService';
import type { User, UserUpdate } from '../types/user';

interface ProfileModalProps {
    isOpen: boolean;
    onClose: () => void;
    onUserUpdate?: (user: User) => void;
}

export default function ProfileModal({ isOpen, onClose, onUserUpdate }: ProfileModalProps) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [formData, setFormData] = useState<UserUpdate>({});

    useEffect(() => {
        if (isOpen) {
            loadUserData();
        }
    }, [isOpen]);

    const loadUserData = async () => {
        setLoading(true);
        setError(null);
        try {
            const userData = await getCurrentUser();
            setUser(userData);
            setFormData({
                email: userData.email,
                username: userData.username,
                first_name: userData.first_name,
                last_name: userData.last_name,
                phone: userData.phone,
                address: userData.address,
            });
        } catch (err) {
            setError('Error al cargar los datos del usuario');
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setError(null);

        try {
            const updatedUser = await updateUser(formData);
            setUser(updatedUser);
            onUserUpdate?.(updatedUser);
            onClose();
        } catch (err) {
            setError('Error al actualizar el perfil');
        } finally {
            setSaving(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-lg mx-4">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">Editar Perfil</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                    >
                        ✕
                    </button>
                </div>

                {loading ? (
                    <p className="text-center text-gray-600 dark:text-gray-300">Cargando datos...</p>
                ) : (
                    <>
                        {error && (
                            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <InputField label="Correo electrónico" name="email" value={formData.email} onChange={handleInputChange} required />
                            <InputField label="Usuario" name="username" value={formData.username} onChange={handleInputChange} required />
                            <InputField label="Nombre" name="first_name" value={formData.first_name} onChange={handleInputChange} />
                            <InputField label="Apellido" name="last_name" value={formData.last_name} onChange={handleInputChange} />
                            <InputField label="Teléfono" name="phone" value={formData.phone} onChange={handleInputChange} />
                            <InputField label="Dirección" name="address" value={formData.address} onChange={handleInputChange} />

                            <div className="text-xs text-gray-500 dark:text-gray-400">
                                <p>Cuenta creada: {new Date(user?.created_at!).toLocaleDateString()}</p>
                                <p>Última actualización: {new Date(user?.updated_at || '').toLocaleDateString()}</p>
                            </div>

                            <div className="flex gap-2 pt-4">
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                                >
                                    {saving ? 'Guardando...' : 'Guardar cambios'}
                                </button>
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="flex-1 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-200 py-2 px-4 rounded-md hover:bg-gray-400 dark:hover:bg-gray-700"
                                >
                                    Cancelar
                                </button>
                            </div>
                        </form>
                    </>
                )}
            </div>
        </div>
    );
}

// Subcomponente para inputs reutilizable
function InputField({
    label,
    name,
    type = 'text',
    value = '',
    onChange,
    required = false,
}: {
    label: string;
    name: string;
    type?: string;
    value: string | undefined;
    onChange: React.ChangeEventHandler<HTMLInputElement>;
    required?: boolean;
}) {
    return (
        <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {label}
            </label>
            <input
                type={type}
                name={name}
                value={value || ''}
                onChange={onChange}
                required={required}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            />
        </div>
    );
}
