import { useEffect, useState } from 'react';
import { getPosts } from '../services/postService';
import type { PostListResponse } from '../types/post';
import PostCard from '../components/PostCard';
import Navbar from '../components/Navbar';

export default function PostList() {
    const [posts, setPosts] = useState<PostListResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        getPosts()
            .then(data => setPosts(data.items))
            .catch(() => setError('No se pudieron cargar los posts'))
            .finally(() => setLoading(false));
    }, []);

    return (
        <div className="p-6 bg-gray-100 dark:bg-gray-900 min-h-screen text-gray-900 dark:text-white">
            <Navbar title="Lista de posts" >
                <button
                    onClick={() => window.location.href = '/dashboard'}
                    className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
                >Dashboard</button>
            </Navbar>

            {loading && <p className="text-gray-600 dark:text-gray-300">Cargando posts...</p>}
            {error && <p className="text-red-500">{error}</p>}

            {!loading && posts.length === 0 && (
                <p className="text-gray-700 dark:text-gray-400">No hay posts disponibles.</p>
            )}

            <div className="grid gap-4">
                {posts.map(post => (
                    <PostCard key={post.id} post={post} />
                ))}
            </div>
        </div>
    );
}
