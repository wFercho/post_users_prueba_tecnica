import { useState } from 'react';

export default function CommentForm({ onSubmit }: { onSubmit: (text: string) => void }) {
    const [text, setText] = useState('');

    const handleSend = () => {
        if (text.trim()) {
            onSubmit(text.trim());
            setText('');
        }
    };

    return (
        <div className="mt-4">
            <textarea
                value={text}
                onChange={e => setText(e.target.value)}
                rows={3}
                placeholder="Escribe un comentario..."
                className="w-full p-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
            <button
                onClick={handleSend}
                className="mt-2 bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
            >
                Comentar
            </button>
        </div>
    );
}
