import type { PostListResponse } from '../types/post';
import { Link } from 'react-router-dom';

export default function PostCard({ post }: { post: PostListResponse }) {
    return (
        <div className="p-4 bg-white dark:bg-gray-800 rounded shadow hover:shadow-md transition">
            <h2 className="text-xl font-bold text-blue-600 dark:text-blue-400">
                <Link to={`/posts/${post.id}`}>{post.title}</Link>
            </h2>

            {post.summary && (
                <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">{post.summary}</p>
            )}

            <div className="mt-2 text-xs text-gray-600 dark:text-gray-400 flex justify-between">
                <span>👤 {post.author_username}</span>
                <span>💬 {post.comments_count}</span>
                <span>👁️ {post.view_count}</span>
            </div>
        </div>
    );
}
