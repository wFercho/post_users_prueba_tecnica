import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios, { AxiosError } from 'axios';
import Navbar from '../components/Navbar';

export default function PostCreate() {
    const [form, setForm] = useState({
        title: '',
        content: '',
        summary: '',
        is_published: true,
        is_featured: false,
    });

    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();
    const token = localStorage.getItem('token') ?? '';

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await axios.post('http://localhost:8001/posts', form, {
                headers: { Authorization: `Bearer ${token}` },
            });
            navigate('/my-posts');
        } catch (err) {
            if (err instanceof AxiosError) {
                if (err.response?.status == 401) {
                    navigate('/login');
                }
            }
            setError('Error al crear el post');
        }
    };

    return (
        <div className="p-6 bg-gray-100 dark:bg-gray-900 min-h-screen text-gray-900 dark:text-white">
            <Navbar title='Crear nuevo Post' />
            {error && (
                <div className="mb-4 text-sm text-red-600 dark:text-red-300">{error}</div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
                <input
                    name="title"
                    placeholder="Título"
                    value={form.title}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded"
                />
                <textarea
                    name="summary"
                    placeholder="Resumen (opcional)"
                    value={form.summary}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded"
                />
                <textarea
                    name="content"
                    placeholder="Contenido del post"
                    value={form.content}
                    onChange={handleChange}
                    rows={10}
                    required
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded"
                />

                <div className="flex items-center gap-4">
                    <label className="text-sm flex items-center gap-2">
                        <input
                            type="checkbox"
                            checked={form.is_published}
                            onChange={e => setForm(f => ({ ...f, is_published: e.target.checked }))}
                        />
                        Publicar
                    </label>
                    <label className="text-sm flex items-center gap-2">
                        <input
                            type="checkbox"
                            checked={form.is_featured}
                            onChange={e => setForm(f => ({ ...f, is_featured: e.target.checked }))}
                        />
                        Destacado
                    </label>
                </div>

                <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                    Publicar
                </button>
            </form>
        </div>
    );
}
