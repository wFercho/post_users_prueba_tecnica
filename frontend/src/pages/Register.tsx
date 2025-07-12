import { useState } from 'react';
import { Input } from '../components/Input';
import type { UserCreate } from '../types/user';
import { register } from '../services/auth';
import { Link, useNavigate } from 'react-router-dom';

export default function Register() {
    const [form, setForm] = useState<UserCreate>({
        email: '',
        username: '',
        first_name: '',
        last_name: '',
        password: '',
        phone: '',
        address: '',
    });

    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
        setError(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!form.email || !form.username || !form.first_name || !form.last_name || !form.password) {
            setError('Por favor completa los campos obligatorios.');
            return;
        }

        try {
            setLoading(true);
            const res = await register(form);
            console.log('Usuario registrado:', res);
            navigate('/');
        } catch (err) {
            setError('Error al registrar usuario');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 transition-colors duration-300">
            <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <h2 className="text-2xl font-bold mb-6 text-center text-gray-800 dark:text-white">
                    Registro de Usuario
                </h2>

                {error && (
                    <div className="mb-4 p-2 text-red-700 bg-red-100 dark:text-red-200 dark:bg-red-800 rounded text-sm">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <Input label="Correo electrónico" name="email" type="email" onChange={handleChange} />
                    <Input label="Usuario" name="username" onChange={handleChange} />
                    <Input label="Nombre" name="first_name" onChange={handleChange} />
                    <Input label="Apellido" name="last_name" onChange={handleChange} />
                    <Input label="Teléfono" name="phone" onChange={handleChange} />
                    <Input label="Dirección" name="address" onChange={handleChange} />
                    <Input label="Contraseña" name="password" type="password" onChange={handleChange} />

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-blue-600 text-white py-2 mt-4 rounded hover:bg-blue-700 transition disabled:opacity-50"
                    >
                        {loading ? 'Registrando...' : 'Registrarse'}
                    </button>
                </form>

                <p className="text-sm text-center mt-6 text-gray-700 dark:text-gray-300">
                    ¿Ya tienes una cuenta?{' '}
                    <Link to="/" className="text-blue-600 dark:text-blue-400 hover:underline">
                        Inicia sesión aquí
                    </Link>
                </p>
            </div>
        </div>
    );
}
