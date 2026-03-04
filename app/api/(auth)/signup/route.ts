import { NextRequest, NextResponse } from "next/server";
import { prisma } from '@/lib/prisma';
import bcrypt from "bcryptjs";
import { z } from "zod";

const registerSchema = z.object({
    first_name: z.string().min(1, "First name is required"),
    last_name: z.string().min(1, "Last name is required"),
    username: z.string().min(1, "Username is required"),
    password: z.string().min(1, "Password is required")
});


export async function POST(req: NextRequest)
{
    try
    {
        const body = await req.json();

        const parsed = registerSchema.safeParse(body)

        if (!parsed.success)
        {
            return NextResponse.json(
                { error: parsed.error.flatten().fieldErrors },
                { status: 422 }
            )
        }

        const { first_name, last_name, username, password } = parsed.data;

        if (!first_name || !last_name || !username || !password)
        {
            return NextResponse.json(
                { message: "All fields are required" },
                { status: 400 }
            )
        }

        if (password.length < 8)
        {
            return NextResponse.json(
                { message: "password must be at least 8 characters." },
                { status: 400 }
            )
        }

        const existingUser = await prisma.user.findUnique({
            where: { username },
        });

        if (existingUser)
        {
            return NextResponse.json(
                { message: "Email is already in use." },
                { status: 409 }
            )
        }

        const hashedPassword = await bcrypt.hash(password, 12);

        const user = await prisma.user.create({
            data: {
                first_name,
                last_name,
                username,
                password: hashedPassword
            }
        });

        return NextResponse.json(
            {
                message: "User registered successfully",
                user: {
                    id: user.id,
                    username: user.username,
                    displayName: `${user.first_name} ${user.last_name}`,
                    usernameVerified: true
                }
            },
            { status: 201 }
        )
    } catch (error)
    {
        console.error('[REGISTER_ERROR]', error);
        return NextResponse.json(
            { message: "Internal server error" },
            { status: 500 }
        )
    }
}