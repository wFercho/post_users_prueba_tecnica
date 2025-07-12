import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getPost, addComment, toggleLike } from '../services/postService';
import type { PostResponse } from '../types/post';
import CommentForm from '../components/CommentForm';

export default function PostView() {
    const { id } = useParams<{ id: string }>();
    const [post, setPost] = useState<PostResponse | null>(null);
    const token = localStorage.getItem('token') ?? '';

    useEffect(() => {
        if (id) {
            getPost(Number(id)).then(setPost);
        }
    }, [id]);

    const handleComment = async (content: string) => {
        if (post && token) {
            await addComment(post.id, { content }, token);
            const updated = await getPost(post.id);
            setPost(updated);
        }
    };

    const handleLike = async () => {
        if (post && token) {
            const res = await toggleLike(post.id, token);
            setPost({ ...post, view_count: post.view_count + 0, likes_count: res.likes_count });
        }
    };

    if (!post) return <div>Cargando...</div>;

    return (
        <div className="p-6 bg-gray-100 dark:bg-gray-900 min-h-screen text-gray-900 dark:text-white">
            <h1 className="text-3xl font-bold mb-2">{post.title}</h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">
                Por {post.author_username} · {new Date(post.created_at).toLocaleString()}
            </p>

            <div className="mt-4">{post.content}</div>

            <button
                onClick={handleLike}
                className="mt-6 px-4 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
                ❤️ Me gusta
            </button>

            <h2 className="text-xl mt-8 mb-2">Comentarios</h2>

            <CommentForm onSubmit={handleComment} />

            <ul className="mt-4 space-y-2">
                {post.comments.map(c => (
                    <li key={c.id} className="bg-white dark:bg-gray-800 p-3 rounded shadow">
                        <p className="text-sm">{c.content}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                            Por {c.author_username} · {new Date(c.created_at).toLocaleString()}
                        </p>
                    </li>
                ))}
            </ul>
        </div>
    );
}
