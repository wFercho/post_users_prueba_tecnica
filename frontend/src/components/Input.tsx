import type { FC } from 'react';

interface Props extends React.InputHTMLAttributes<HTMLInputElement> {
    label: string;
    name: string;
}

export const Input: FC<Props> = ({ label, name, ...rest }) => (
    <div className="mb-4">
        <label htmlFor={name} className="block mb-1 text-sm font-semibold text-gray-700">
            {label}
        </label>
        <input
            id={name}
            name={name}
            {...rest}
            className="w-full p-2 border rounded-md shadow-sm 
    focus:outline-none focus:ring-2 focus:ring-blue-500
    dark:bg-gray-700 dark:text-white dark:border-gray-600"    />
    </div>
);
