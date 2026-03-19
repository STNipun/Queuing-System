import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth/auth-service.server";
import { NextResponse } from "next/server";

export async function GET()
{
    const currentUser = await getCurrentUser();
    if (!currentUser)
    {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (currentUser.role !== "admin")
    {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const users = await prisma.user.findMany({
        select: {
            id: true,
            username: true,
            first_name: true,
            last_name: true,
            role: true,
        },
    });

    return NextResponse.json(users, { status: 200 });
}