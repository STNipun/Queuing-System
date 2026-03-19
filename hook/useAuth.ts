import
{
    signIn,
    signOut,
    signUp
} from "@/lib/auth/auth-service.client"

export function useAuth()
{
    const login = async (username: string, password: string) =>
    {
        return signIn({ username, password });
    };

    const signup = async (
        username: string,
        password: string,
        firstName: string,
        lastName: string,
        role?: "admin" | "doctor" | "front_desk" | "user"
    ) =>
    {
        return signUp({
            username,
            password,
            first_name: firstName,
            last_name: lastName,
            role,
        });
    };

    const logout = async () =>
    {
        return signOut();
    };

    return {
        login,
        signup,
        logout
    }
}