import
{
    LoginCredentials,
    AuthResponse,
    AuthUser,
    SignUpCredentials
} from "./auth-types"


export async function signIn(
    credentials: LoginCredentials
): Promise<AuthResponse>
{
    try
    {
        const response = await fetch("/api/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(credentials),
            credentials: "include"
        });

        const data = await response.json();

        if (!response.ok)
        {
            return { success: false, error: data.error };
        }

        return { success: true, user: data.user };
    } catch (error)
    {
        console.log("Login error:", error);
        return { success: false, error: "Network error. Please try again." }
    }
}


export async function signUp(
    credentials: SignUpCredentials
): Promise<AuthResponse>
{
    try
    {
        const response = await fetch("/api/signup", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(credentials),
            credentials: "include"
        });

        const data = await response.json();

        if (!response.ok)
        {
            return { success: false, error: data.error };
        }

        return { success: true, user: data.user };
    }
    catch (error)
    {
        console.log("Sinhup error: ", error)
        return { success: false, error: "Network error. Please try again." };
    }
}

export async function signOut(): Promise<AuthResponse>
{
    try
    {
        const response = await fetch("/api/logout", {
            method: "POST",
            credentials: "include"
        });

        const data = await response.json();

        if (!response.ok)
        {
            return { success: false, error: data.error }
        }

        return { success: true };
    }
    catch (error)
    {
        return { success: false, error: "Network error. Please try again." }
    }
}

export async function getCurrentUser(): Promise<AuthUser | null>
{
    try
    {
        const response = await fetch("/api/me", {
            method: "GET",
            credentials: "include"
        });

        if (!response.ok)
        {
            return null;
        }

        const data = await response.json();

        return data.user;
    }
    catch (error)
    {
        return null;
    }
}