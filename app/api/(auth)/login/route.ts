import { NextRequest, NextResponse } from "next/server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const logingSchema = z.object({
    username: z.string().min(1, "Username is required"),
    password: z.string().min(1, "Password is required")
});

export async function POST(req: NextRequest)
{
    try
    {
        const body = await req.json();

        const parsed = logingSchema.safeParse(body);
        if (!parsed.success)
        {
            return NextResponse.json(
                { error: parsed.error.flatten().fieldErrors },
                { status: 422 }
            );
        }

        const { username, password } = parsed.data;

        const user = await prisma.user.findUnique({
            where: { username },
        });

        if (!user)
        {
            return NextResponse.json(
                { error: 'Invalid username or password' },
                { status: 401 }
            );
        }

        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch)
        {
            return NextResponse.json(
                { error: 'Invalid username or password' },
                { status: 401 }
            );
        }

        const token = jwt.sign(
            { id: user.id, username: user.username },
            process.env.JWT_SECRET!,
            { expiresIn: "7d" }
        );


        const { password: _, ...userWithoutPassword } = user;

        const response = NextResponse.json(
            {
                message: "Login successful",
                user: userWithoutPassword
            },
            { status: 200 }
        );

        if (token)
        {
            response.cookies.set("auth_token", token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "strict",
                maxAge: 60 * 60 * 24 * 7,
                path: "/",
            });
        }

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