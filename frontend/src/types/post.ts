export interface CommentResponse {
    id: number;
    post_id: number;
    author_id: number;
    author_email: string;
    author_username: string;
    is_approved: boolean;
    content: string;
    created_at: string;
    updated_at?: string;
}

export interface PostResponse {
    id: number;
    title: string;
    content: string;
    summary?: string;
    is_published: boolean;
    is_featured: boolean;
    author_id: number;
    author_email: string;
    author_username: string;
    slug: string;
    view_count: number;
    created_at: string;
    updated_at?: string;
    likes_count: number
    comments: CommentResponse[];
}

export interface CommentCreate {
    content: string;
}

export interface PostStats {
    total_posts: number;
    published_posts: number;
    draft_posts: number;
    total_views: number;
    featured_posts: number;
}

export interface AuthUser {
    user_id: number;
    email: string;
    username: string;
}

// Tipos de usuario para autenticación
export interface AuthUser {
    user_id: number;
    username: string;
    email: string;
    is_active: boolean;
}

// Tipos para posts
export interface PostCreate {
    title: string;
    content: string;
    slug?: string;
    is_published?: boolean;
    is_featured?: boolean;
}

export interface PostUpdate {
    title?: string;
    content?: string;
    summary?: string;
    slug?: string;
    is_published?: boolean;
    is_featured?: boolean;
}

export interface PostListResponse {
    id: number;
    title: string;
    content: string;
    author_username: string
    summary: string;
    slug: string;
    is_published: boolean;
    is_featured: boolean;
    view_count: number;
    created_at: string;
    updated_at: string;
    author_id: number;
    comments_count: number;
}

// export interface PostResponse {
//   id: number;
//   title: string;
//   content: string;
//   slug: string;
//   is_published: boolean;
//   is_featured: boolean;
//   view_count: number;
//   created_at: string;
//   updated_at: string;
//   author_id: number;
//   author?: {
//     id: number;
//     username: string;
//     email: string;
//   };
// }

// Tipos para comentarios
export interface CommentCreate {
    content: string;
    parent_id?: number;
}


// Tipos para paginación
export interface PaginatedResponse {
    items: PostListResponse[];
    total: number;
    page: number;
    size: number;
    pages: number;
}

// Tipos para estadísticas
export interface PostStats {
    total_posts: number;
    published_posts: number;
    draft_posts: number;
    featured_posts: number;
    total_views: number;
    total_comments?: number;
    total_likes?: number;
}

// Tipos para likes
export interface LikeResponse {
    liked: boolean;
    likes_count: number;
    message: string;
}
