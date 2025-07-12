export interface UserBase {
    email: string;
    username: string;
    first_name: string;
    last_name: string;
    phone?: string;
    address?: string;
}

export interface UserCreate extends UserBase {
    password: string;
}

export interface LoginData {
    email: string;
    password: string;
}

export interface UserResponse {
    email: string;
    username: string;
    first_name: string;
    last_name: string;
    phone: string;
    address: string;
    id: number;
    is_active: boolean;
    is_verified: boolean;
    created_at: string;
    updated_at: string | null;
}

export interface User {
    email: string;
    username: string;
    first_name: string;
    last_name: string;
    phone: string;
    address: string;
    id: number;
    is_active: boolean;
    is_verified: boolean;
    created_at: string;
    updated_at: string | null;
}

export interface UserUpdate {
    username?: string;
    email?: string;
    first_name?: string;
    last_name?: string;
    phone?: string;
    address?: string;
}

