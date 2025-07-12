import axios from 'axios';
import type {
  PostResponse,
  PaginatedResponse,
  CommentResponse,
  CommentCreate,
  PostCreate,
  PostUpdate,
  PostStats,
} from '../types/post';

const API = 'http://localhost:8001';

// Función existente para obtener posts públicos
export const getPosts = async (
  page = 1,
  size = 10
): Promise<PaginatedResponse> => {
  const res = await axios.get(`${API}/posts?page=${page}&size=${size}`);
  return res.data;
};

// NUEVA FUNCIÓN: Obtener mis posts
export const getMyPosts = async (
  page = 1,
  size = 10,
  publishedOnly = false,
  token: string
): Promise<PaginatedResponse> => {
  const res = await axios.get(`${API}/my-posts?page=${page}&size=${size}&published_only=${publishedOnly}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  console.warn({ res });

  return res.data;
};

// Función existente para obtener un post específico
export const getPost = async (id: number): Promise<PostResponse> => {
  const res = await axios.get(`${API}/posts/${id}`);
  return res.data;
};

// Función para obtener post por slug
export const getPostBySlug = async (slug: string): Promise<PostResponse> => {
  const res = await axios.get(`${API}/posts/slug/${slug}`);
  return res.data;
};

// NUEVA FUNCIÓN: Crear post
export const createPost = async (
  post: PostCreate,
  token: string
): Promise<PostResponse> => {
  const res = await axios.post(`${API}/posts`, post, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

// NUEVA FUNCIÓN: Actualizar post
export const updatePost = async (
  postId: number,
  post: PostUpdate,
  token: string
): Promise<PostResponse> => {
  const res = await axios.put(`${API}/posts/${postId}`, post, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

// NUEVA FUNCIÓN: Eliminar post
export const deletePost = async (
  postId: number,
  token: string
): Promise<void> => {
  await axios.delete(`${API}/posts/${postId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

// NUEVA FUNCIÓN: Obtener estadísticas del usuario
export const getMyStats = async (token: string): Promise<PostStats> => {
  const res = await axios.get(`${API}/my-stats`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

// Función existente para obtener comentarios
export const getComments = async (
  postId: number
): Promise<CommentResponse[]> => {
  const res = await axios.get(`${API}/posts/${postId}/comments`);
  return res.data;
};

// Función existente para agregar comentario
export const addComment = async (
  postId: number,
  comment: CommentCreate,
  token: string
) => {
  const res = await axios.post(`${API}/posts/${postId}/comments`, comment, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

// NUEVA FUNCIÓN: Eliminar comentario
export const deleteComment = async (
  commentId: number,
  token: string
): Promise<void> => {
  await axios.delete(`${API}/comments/${commentId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

// Función existente para toggle like
export const toggleLike = async (postId: number, token: string) => {
  const res = await axios.post(
    `${API}/posts/${postId}/like`,
    {},
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return res.data;
};

// Función para obtener likes de un post
export const getPostLikes = async (postId: number) => {
  const res = await axios.get(`${API}/posts/${postId}/likes`);
  return res.data;
};