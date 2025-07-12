import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { login } from '../services/auth';
import { useAuth } from '../context/AuthContext';
import { Input } from '../components/Input';
import type { LoginData } from '../types/user';

export default function Login() {
    const [form, setForm] = useState<LoginData>({ email: '', password: '' });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();
    const { login: contextLogin } = useAuth();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
        setError(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!form.email || !form.password) {
            setError('Todos los campos son obligatorios');
            return;
        }

        try {
            setLoading(true);
            const res = await login(form);
            console.log('Login successful:', res);

            // Usar la función login del contexto en lugar de localStorage directo
            console.log('Iniciando contextLogin...');
            await contextLogin(res.access_token);
            console.log('contextLogin completado, navegando...');
            navigate('/dashboard');
        } catch (err) {
            console.error('Error en login:', err);
            setError('Correo o contraseña incorrectos');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-md mx-auto mt-12 p-6 bg-white dark:bg-gray-800 shadow rounded-xl text-gray-900 dark:text-white">
            <h1 className="text-2xl font-bold mb-6 text-center">Iniciar Sesión</h1>

            {error && (
                <div className="mb-4 p-2 text-red-600 bg-red-100 dark:bg-red-800 dark:text-red-200 rounded text-sm">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit}>
                <Input
                    label="Correo electrónico"
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleChange}
                />
                <Input
                    label="Contraseña"
                    name="password"
                    type="password"
                    value={form.password}
                    onChange={handleChange}
                />

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-blue-600 text-white p-2 rounded mt-4 hover:bg-blue-700 transition"
                >
                    {loading ? 'Ingresando...' : 'Ingresar'}
                </button>
            </form>

            <p className="text-sm text-center mt-6">
                ¿No tienes una cuenta?{' '}
                <Link to="/register" className="text-blue-600 hover:underline">
                    Regístrate aquí
                </Link>
            </p>
        </div>
    );
}