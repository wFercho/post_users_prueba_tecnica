import { useEffect, useState } from 'react';
import { deletePost, getMyPosts, updatePost } from '../services/postService';
import type { PostListResponse, PostUpdate } from '../types/post';
import Navbar from '../components/Navbar';


export default function MyPosts() {
    const [posts, setPosts] = useState<PostListResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);
    const [publishedOnly, setPublishedOnly] = useState(false);
    const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
    const [viewPost, setViewPost] = useState<PostListResponse | null>(null);
    const [editPost, setEditPost] = useState<PostListResponse | null>(null);
    const [editForm, setEditForm] = useState<PostUpdate>({
        title: '',
        content: '',
        summary: '',
        is_featured: false,
        is_published: false

    });

    const size = 10; // Posts por página

    // Simulación de datos para demostración
    useEffect(() => {
        fetchPosts();
    }, [page, publishedOnly]);

    const fetchPosts = async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            window.location.href = '/login';
            return;
        }

        try {
            setLoading(true);

            const response = await getMyPosts(page, size, publishedOnly, token);

            setPosts(response.items);
            setTotal(response.total);
            setTotalPages(response.pages);
        } catch (err) {
            setError('Error al cargar los posts');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (postId: number) => {
        const token = localStorage.getItem('token');
        if (!token) {
            window.location.href = '/login';
            return;
        }

        try {
            await deletePost(postId, token);

            // Actualizar la lista después de eliminar
            fetchPosts();
            setDeleteConfirm(null);
        } catch (err) {
            setError('Error al eliminar el post');
            console.error(err);
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getStatusBadge = (isPublished: boolean, isFeatured: boolean) => {
        if (isFeatured) {
            return <span className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2.5 py-0.5 rounded">⭐ Destacado</span>;
        }
        if (isPublished) {
            return <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded">✅ Publicado</span>;
        }
        return <span className="bg-gray-100 text-gray-800 text-xs font-medium px-2.5 py-0.5 rounded">📝 Borrador</span>;
    };

    if (loading) {
        return (
            <div className="p-6 bg-gray-100 dark:bg-gray-900 min-h-screen">
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 bg-gray-100 dark:bg-gray-900 min-h-screen text-gray-900 dark:text-white">
            {/* Header */}
                <Navbar title={`Total: ${total} posts`} >
                    <button
                        onClick={() => window.location.href = '/create'}
                        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                    >
                        ➕ Nuevo Post
                    </button>
                    <button
                        onClick={() => window.location.href = '/dashboard'}
                        className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
                    >
                        ← Dashboard
                    </button>
                </Navbar>


            {/* Filtros */}
            <div className="mb-6 flex gap-4 items-center">
                <label className="flex items-center">
                    <input
                        type="checkbox"
                        checked={publishedOnly}
                        onChange={(e) => {
                            setPublishedOnly(e.target.checked);
                            setPage(1); // Reset to first page
                        }}
                        className="mr-2"
                    />
                    <span>Solo publicados</span>
                </label>
            </div>

            {/* Error */}
            {error && (
                <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
                    {error}
                </div>
            )}

            {/* Posts List */}
            <div className="space-y-4">
                {posts.length === 0 ? (
                    <div className="text-center py-12">
                        <p className="text-gray-500 dark:text-gray-400">
                            {publishedOnly ? 'No tienes posts publicados' : 'No tienes posts aún'}
                        </p>
                        <button
                            onClick={() => window.location.href = '/create'}
                            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                        >
                            Crear tu primer post
                        </button>
                    </div>
                ) : (
                    posts.map((post) => (
                        <div
                            key={post.id}
                            className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 hover:shadow-md transition-shadow"
                        >
                            <div className="flex justify-between items-start mb-3">
                                <div className="flex-1">
                                    <h3 className="text-lg font-semibold mb-1">{post.title}</h3>
                                    <div className="flex items-center gap-2 mb-2">
                                        {getStatusBadge(post.is_published, post.is_featured)}
                                        <span className="text-sm text-gray-500">
                                            👁️ {post.view_count} vistas
                                        </span>
                                        <span className="text-sm text-gray-500">
                                            💬 {post.comments_count} comentarios
                                        </span>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setViewPost(post)}
                                        className="text-blue-600 hover:text-blue-800 text-sm px-2 py-1 rounded hover:bg-blue-50"
                                    >
                                        👁️ Ver
                                    </button>

                                    <button
                                        onClick={() => {
                                            setEditPost(post);
                                            setEditForm({ title: post.title, content: post.content, summary: post.summary, is_featured: post.is_featured, is_published: post.is_published });
                                        }}
                                        className="text-green-600 hover:text-green-800 text-sm px-2 py-1 rounded hover:bg-green-50"
                                    >
                                        ✏️ Editar
                                    </button>

                                    <button
                                        onClick={() => setDeleteConfirm(post.id)}
                                        className="text-red-600 hover:text-red-800 text-sm px-2 py-1 rounded hover:bg-red-50"
                                    >
                                        🗑️ Eliminar
                                    </button>
                                </div>
                            </div>

                            <p className="text-gray-600 dark:text-gray-300 text-sm mb-3 line-clamp-2">
                                {post?.summary}
                            </p>
                            <p className="text-gray-600 dark:text-gray-300 text-sm mb-3 line-clamp-2">
                                {post?.content.substring(0, 123)}...
                            </p>

                            <div className="flex justify-between items-center text-sm text-gray-500">
                                <span>Creado: {formatDate(post.created_at)}</span>
                                {/* <span>Actualizado: {formatDate(post.updated_at)}</span> */}
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Paginación */}
            {totalPages > 1 && (
                <div className="mt-8 flex justify-center items-center gap-2">
                    <button
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        disabled={page === 1}
                        className="px-3 py-1 rounded bg-gray-200 dark:bg-gray-700 disabled:opacity-50 hover:bg-gray-300 dark:hover:bg-gray-600"
                    >
                        ← Anterior
                    </button>

                    <span className="px-4 py-2">
                        Página {page} de {totalPages}
                    </span>

                    <button
                        onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                        disabled={page === totalPages}
                        className="px-3 py-1 rounded bg-gray-200 dark:bg-gray-700 disabled:opacity-50 hover:bg-gray-300 dark:hover:bg-gray-600"
                    >
                        Siguiente →
                    </button>
                </div>
            )}

            {/* Modal de confirmación de eliminación */}
            {deleteConfirm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
                        <h3 className="text-lg font-semibold mb-4">Confirmar eliminación</h3>
                        <p className="text-gray-600 dark:text-gray-300 mb-6">
                            ¿Estás seguro de que quieres eliminar este post? Esta acción no se puede deshacer.
                        </p>
                        <div className="flex justify-end gap-2">
                            <button
                                onClick={() => setDeleteConfirm(null)}
                                className="px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={() => handleDelete(deleteConfirm)}
                                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                            >
                                Eliminar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {viewPost && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-xl w-full mx-4 max-h-[80vh] overflow-y-auto">
                        <h3 className="text-xl font-semibold mb-4">{viewPost.title}</h3>
                        <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap mb-6">
                            {viewPost.summary}
                        </p>
                        <div className="flex justify-end">
                            <button
                                onClick={() => setViewPost(null)}
                                className="px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded"
                            >
                                Cerrar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {editPost && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-xl w-full mx-4 max-h-[80vh] overflow-y-auto">
                        <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Editar Post</h3>

                        {/* Título */}
                        <div className="mb-4">
                            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Título</label>
                            <input
                                type="text"
                                value={editForm.title || ''}
                                onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                                className="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:text-white dark:border-gray-600"
                                maxLength={255}
                            />
                        </div>

                        {/* Resumen */}
                        <div className="mb-4">
                            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Resumen</label>
                            <textarea
                                rows={3}
                                value={editForm.summary || ''}
                                onChange={(e) => setEditForm({ ...editForm, summary: e.target.value })}
                                className="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:text-white dark:border-gray-600"
                                maxLength={500}
                            />
                        </div>

                        {/* Contenido */}
                        <div className="mb-4">
                            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Contenido</label>
                            <textarea
                                rows={6}
                                value={editForm.content || ''}
                                onChange={(e) => setEditForm({ ...editForm, content: e.target.value })}
                                className="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:text-white dark:border-gray-600"
                            />
                        </div>

                        {/* Publicado */}
                        <div className="mb-4">
                            <label className="inline-flex items-center text-sm text-gray-700 dark:text-gray-300">
                                <input
                                    type="checkbox"
                                    checked={editForm.is_published || false}
                                    onChange={(e) => setEditForm({ ...editForm, is_published: e.target.checked })}
                                    className="mr-2"
                                />
                                ¿Publicado?
                            </label>
                        </div>

                        {/* Destacado */}
                        <div className="mb-4">
                            <label className="inline-flex items-center text-sm text-gray-700 dark:text-gray-300">
                                <input
                                    type="checkbox"
                                    checked={editForm.is_featured || false}
                                    onChange={(e) => setEditForm({ ...editForm, is_featured: e.target.checked })}
                                    className="mr-2"
                                />
                                ¿Destacado?
                            </label>
                        </div>

                        {/* Botones */}
                        <div className="flex justify-end gap-2">
                            <button
                                onClick={() => setEditPost(null)}
                                className="px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded dark:hover:bg-gray-700"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={async () => {
                                    const token = localStorage.getItem('token');
                                    if (!token) return;

                                    try {
                                        await updatePost(editPost.id, editForm, token);
                                        setEditPost(null);
                                        fetchPosts();
                                    } catch (err) {
                                        alert("Error al actualizar post");
                                    }
                                }}
                                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                            >
                                Guardar cambios
                            </button>
                        </div>
                    </div>
                </div>
            )}


        </div>
    );
}