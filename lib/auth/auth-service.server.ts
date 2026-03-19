"use server";

import { cookies } from "next/headers";
import { AuthUser } from "./auth-types";
import { redirect } from "next/navigation";
import { authProvider } from "./auth-provider";

export async function getCurrentUser(): Promise<AuthUser | null>
{
    try
    {
        const cookieStore = await cookies();
        const token = cookieStore.get("auth-token")?.value;

        if (!token)
        {
            return null;
        }

        const result = await authProvider.verifyToken(token);
        return result.user ?? null;
    } catch (error)
    {
        console.error("Get current user error", error);
        return null;
    }
}

export async function requireAuth(): Promise<AuthUser>
{
    const user = await getCurrentUser();
    if (!user)
    {
        redirect("/login");
    }
    return user!;
}

/** Redirect users to their own dashboard based on their role. */
function getRoleDashboard(role: string | undefined): string
{
    switch (role)
    {
        case "doctor": return "/doctor";
        case "front_desk": return "/fornt-desk";
        default: return "/";
    }
}

/**
 * Require that the current user has one of the specified roles.
 * If not, they are redirected to their own role-appropriate dashboard.
 */
export async function requireRole(allowedRoles: string[]): Promise<AuthUser>
{
    const user = await requireAuth();
    if (!user.role || !allowedRoles.includes(user.role))
    {
        redirect(getRoleDashboard(user.role));
    }
    return user;
}

export async function requireVerifiedEmail(): Promise<AuthUser>
{
    const user = await getCurrentUser();
    if (!user?.emailVerified)
    {
        redirect("/verify-email");
    }
    return user!;
}
