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

    if (!["front_desk", "admin"].includes(currentUser.role))
    {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const doctors = await prisma.user.findMany({
        where: { role: "doctor" },
        select: {
            id: true,
            first_name: true,
            last_name: true,
            username: true,
        },
        orderBy: { first_name: "asc" },
    });

    return NextResponse.json(doctors, { status: 200 });
}
