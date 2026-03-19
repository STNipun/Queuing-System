import { AuthResponse } from "./auth-types";

export interface IAuthProvider
{
    signIn(username: string, password: string): Promise<AuthResponse>;
    signUp(
        username: string,
        password: string,
        first_name: string,
        last_name: string,
        role?: string
    ): Promise<AuthResponse>;
    verifyToken(token: string): Promise<AuthResponse>;
    signOut(): Promise<void>;
}
