import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { authProvider } from "@/lib/auth/auth-provider";
import { getCurrentUser } from "@/lib/auth/auth-service.server";
import { checkRateLimit, getClientIdentifier } from "@/lib/security/rate-limit";

const registerSchema = z.object({
    first_name: z.string().min(1, "First name is required"),
    last_name: z.string().min(1, "Last name is required"),
    username: z.string().min(1, "Username is required"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    role: z.enum(["admin", "doctor", "front_desk", "user"]).optional(),
});


export async function POST(req: NextRequest)
{
    try
    {
        const currentUser = await getCurrentUser();
        if (!currentUser)
        {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        if (currentUser.role !== "admin")
        {
            return NextResponse.json(
                { error: "Forbidden" },
                { status: 403 }
            );
        }

        const body = await req.json();

        const parsed = registerSchema.safeParse(body);

        if (!parsed.success)
        {
            return NextResponse.json(
                { error: parsed.error.flatten().fieldErrors },
                { status: 422 }
            );
        }

        const { first_name, last_name, username, password, role } = parsed.data;
        const identifier = getClientIdentifier(req, username);

        const rateLimitResult = await checkRateLimit({
            namespace: "auth:signup",
            identifier,
            limit: 5,
            window: "15 m",
        });

        if (!rateLimitResult.success)
        {
            return NextResponse.json(
                { error: "Too many account creation attempts. Please try again later." },
                { status: 429 }
            );
        }

        const result = await authProvider.signUp(
            username,
            password,
            first_name,
            last_name,
            role
        );

        if (!result.success || !result.user)
        {
            return NextResponse.json(
                { error: result.error ?? "Unable to create user" },
                { status: 400 }
            );
        }

        return NextResponse.json(
            {
                message: "User registered successfully",
                user: {
                    uid: result.user.uid,
                    username: result.user.username,
                    displayName: result.user.displayName,
                    role: result.user.role,
                }
            },
            { status: 201 }
        );
    } catch (error)
    {
        console.error('[REGISTER_ERROR]', error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}