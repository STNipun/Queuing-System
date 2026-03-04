export interface AuthUser
{
    uid: string;
    username: string | null;
    displayName: string | null;
    usernameVerified?: boolean;
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
}

export interface AuthResponse
{
    success: boolean;
    user?: AuthUser;
    token?: string;
    error?: string;
    requiresUsernameVerification?: boolean;
}