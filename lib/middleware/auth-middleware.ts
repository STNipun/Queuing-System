import { NextRequest, NextResponse } from "next/server";

export function authMiddleware(req: NextRequest)
{

    const token = req.cookies.get("auth-token")?.value;
    const pathname = req.nextUrl.pathname;

    const PUBLIC_ROUTES = ["/login", "/signup"];
    const isPublic = PUBLIC_ROUTES.some(
        route => pathname === route || pathname.startsWith(`${route}/`)
    );

    // Not logging in -> redirect
    if (!token && isPublic)
    {
        return NextResponse.redirect(new URL("/login", req.url));
    }

    // Already logged in -> redirect to dashboard
    if (token && (pathname.startsWith("/login") || pathname.startsWith("/signup")))
    {
        return NextResponse.redirect(new URL("/dashboard", req.url));
    }
}