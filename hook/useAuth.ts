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
        displayName: string
    ) =>
    {
        return signUp({ username, password, displayName });
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