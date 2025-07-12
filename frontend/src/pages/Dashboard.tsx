import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import type { PostStats } from '../types/post';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';

export default function Dashboard() {
    const [stats, setStats] = useState<PostStats | null>(null);
    const [error, setError] = useState<string | null>(null);
    const { token, currentUser, loading } = useAuth();

    const navigate = useNavigate();


    useEffect(() => {
        if (!token && !loading) {
            navigate('/login');
            return;
        }

        axios
            .get<PostStats>('http://localhost:8001/my-stats', {
                headers: { Authorization: `Bearer ${token}` },
            })
            .then(res => setStats(res.data))
            .catch(() => { setStats(null); setError("Error cargando estadisticas") });
    }, [token, navigate]);



    if (error) return <div className="p-6 text-red-600">{error}</div>;

    return (
        <div className="p-6 bg-gray-100 dark:bg-gray-900 min-h-screen text-gray-900 dark:text-white">
            <Navbar title="Dashboard" >
                <button
                    onClick={() => window.location.href = '/'}
                    className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
                >Post publicos</button>
            </Navbar>

            {currentUser && (
                <div className="mb-4">
                    <p className="text-lg">
                        Bienvenido, <strong>{currentUser.username}</strong> ({currentUser.email})
                    </p>
                </div>
            )}

            {stats ? (
                <div className="grid grid-cols-2 gap-4 mt-4">
                    <Stat label="Total Posts" value={stats.total_posts} />
                    <Stat label="Publicados" value={stats.published_posts} />
                    <Stat label="Borradores" value={stats.draft_posts} />
                    <Stat label="Vistas Totales" value={stats.total_views} />
                    <Stat label="Destacados" value={stats.featured_posts} />
                </div>
            ) : (
                <p className="text-sm text-gray-600 dark:text-gray-400">Cargando estadísticas...</p>
            )}

            <div className="mt-8 flex flex-col sm:flex-row gap-4">
                <a
                    href="/create"
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-center"
                >
                    ➕ Crear nuevo post
                </a>
                <a
                    href="/my-posts"
                    className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 text-center"
                >
                    📝 Ver mis posts
                </a>
            </div>
        </div>
    );
}

function Stat({ label, value }: { label: string; value: number }) {
    return (
        <div className="bg-white dark:bg-gray-800 rounded p-4 shadow text-center">
            <p className="text-2xl font-bold">{value}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">{label}</p>
        </div>
    );
}
