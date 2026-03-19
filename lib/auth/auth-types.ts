export interface AuthUser
{
    uid: string;
    username: string | null;
    displayName: string | null;
    emailVerified?: boolean;
    role?: string;
}

export interface LoginCredentials
{
    username: string;
    password: string;
}

export interface SignUpCredentials
{
    username: string;
    password: string;
    first_name: string;
    last_name: string;
    role?: "admin" | "doctor" | "front_desk" | "user";
}

export interface AuthResponse
{
    success: boolean;
    user?: AuthUser;
    token?: string;
    error?: string;
    requiresUsernameVerification?: boolean;
}