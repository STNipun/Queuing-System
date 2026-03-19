'use client';

import { createContext, useContext, ReactNode } from "react";
import { AuthUser } from "./auth-types";

const UserContext = createContext<AuthUser | null>(null);

type UseProviderProps = {
    user: AuthUser | null;
    children: ReactNode;
};

export function UserProvider({ user, children }: UseProviderProps)
{
    return <UserContext.Provider value={user}>{children}</UserContext.Provider>
}

// Hook to access the current authenticated user.
// Throws if no user is available.
export function useUser(): AuthUser
{
    const user = useContext(UserContext);

    if (user === null)
    {
        throw new Error(
            "useUser must be used within a UserProvider with a non-null user"
        );
    }

    return user;
}

// Hook to access the current user or null if not authenticated.
export function useOptionalUser(): AuthUser | null
{
    return useContext(UserContext);
}

// Hook to access the current user's role, or null if not authenticated.
export function useRole(): string | null
{
    const user = useContext(UserContext);
    return user?.role ?? null;
}
