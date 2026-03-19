import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth/auth-service.server";

const updateUserSchema = z.object({
    first_name: z.string().min(1, "First name is required"),
    last_name: z.string().min(1, "Last name is required"),
    username: z.string().min(1, "Username is required"),
    role: z.enum(["admin", "doctor", "front_desk", "user"]),
});

async function requireAdmin()
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

    return null;
}

export async function PATCH(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
)
{
    const authError = await requireAdmin();
    if (authError) return authError;

    try
    {
        const { id } = await params;
        const numericId = Number(id);

        if (Number.isNaN(numericId))
        {
            return NextResponse.json({ error: "Invalid user id" }, { status: 400 });
        }

        const body = await req.json();
        const parsed = updateUserSchema.safeParse(body);
        if (!parsed.success)
        {
            return NextResponse.json(
                { error: parsed.error.flatten().fieldErrors },
                { status: 422 }
            );
        }

        const payload = parsed.data;

        const existing = await prisma.user.findUnique({ where: { id: numericId } });
        if (!existing)
        {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        const usernameTaken = await prisma.user.findFirst({
            where: {
                username: payload.username,
                NOT: { id: numericId },
            },
            select: { id: true },
        });

        if (usernameTaken)
        {
            return NextResponse.json(
                { error: "This username is already taken" },
                { status: 409 }
            );
        }

        const updated = await prisma.user.update({
            where: { id: numericId },
            data: payload,
            select: {
                id: true,
                first_name: true,
                last_name: true,
                username: true,
                role: true,
            },
        });

        return NextResponse.json(updated, { status: 200 });
    }
    catch (error)
    {
        console.error("[PATCH_USER_ERROR]", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
)
{
    const authError = await requireAdmin();
    if (authError) return authError;

    try
    {
        const { id } = await params;
        const numericId = Number(id);

        if (Number.isNaN(numericId))
        {
            return NextResponse.json({ error: "Invalid user id" }, { status: 400 });
        }

        const currentUser = await getCurrentUser();
        if (currentUser?.uid === String(numericId))
        {
            return NextResponse.json(
                { error: "You cannot delete your own account" },
                { status: 400 }
            );
        }

        const existing = await prisma.user.findUnique({ where: { id: numericId } });
        if (!existing)
        {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        await prisma.user.delete({ where: { id: numericId } });

        return NextResponse.json({ success: true }, { status: 200 });
    }
    catch (error)
    {
        console.error("[DELETE_USER_ERROR]", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}