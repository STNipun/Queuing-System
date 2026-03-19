import { NextRequest, NextResponse } from "next/server";

import { z } from "zod";
import { authProvider } from "@/lib/auth/auth-provider";
import { checkRateLimit, getClientIdentifier } from "@/lib/security/rate-limit";

const loginSchema = z.object({
    username: z.string().min(1, "Username is required"),
    password: z.string().min(1, "Password is required")
});

export async function POST(req: NextRequest)
{
    try
    {
        const body = await req.json();

        const parsed = loginSchema.safeParse(body);
        if (!parsed.success)
        {
            return NextResponse.json(
                { error: parsed.error.flatten().fieldErrors },
                { status: 422 }
            );
        }

        const { username, password } = parsed.data;
        const identifier = getClientIdentifier(req, username);

        const rateLimitResult = await checkRateLimit({
            namespace: "auth:login",
            identifier,
            limit: 5,
            window: "10 m",
        });

        if (!rateLimitResult.success)
        {
            const retryAfterSeconds = Math.max(1, Math.ceil((rateLimitResult.reset - Date.now()) / 1000));
            return NextResponse.json(
                { error: "Too many login attempts. Please try again later." },
                {
                    status: 429,
                    headers: { "Retry-After": String(retryAfterSeconds) },
                }
            );
        }

        const result = await authProvider.signIn(username, password);
        if (!result.success || !result.user || !result.token)
        {
            return NextResponse.json(
                { error: result.error ?? "Invalid username or password" },
                { status: 401 }
            );
        }

        const response = NextResponse.json(
            {
                message: "Login successful",
                user: result.user
            },
            { status: 200 }
        );

        response.cookies.set("auth-token", result.token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 60 * 60 * 24 * 7,
            path: "/",
        });

        return response;
    } catch (error)
    {
        console.log(error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        )
    }
}