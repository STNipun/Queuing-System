import { prisma } from "@/lib/prisma";
import { NextResponse, NextRequest } from "next/server";
import { getCurrentUser } from "@/lib/auth/auth-service.server";

// Fields each role is allowed to modify
const DOCTOR_FIELDS = new Set(["diagnosis", "prescription", "notes", "status"]);
const ADMIN_FIELDS = new Set([
    "patientName", "age", "gender", "visitDate",
    "visitTime", "visitType", "allergies", "bloodType", "gp",
]);

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
)
{
    try
    {
        const user = await getCurrentUser();
        if (!user)
        {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;

        const visit = await prisma.patientVisit.findUnique({ where: { id } });

        if (!visit)
        {
            return NextResponse.json({ error: "Visit not found" }, { status: 404 });
        }

        return NextResponse.json(visit, { status: 200 });
    }
    catch (error)
    {
        console.error("Error fetching patient visit:", error);
        return NextResponse.json({ error: "Failed to fetch patient visit" }, { status: 500 });
    }
}

export async function PATCH(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
)
{
    try
    {
        // ── Auth ──────────────────────────────────────────────────────────────
        const user = await getCurrentUser();
        if (!user)
        {
            return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
        }

        const { id } = await params;
        const body: Record<string, unknown> = await req.json();

        // ── Determine allowed fields by role ──────────────────────────────────
        const isDoctor = user.role === "doctor";
        const allowedFields = isDoctor ? DOCTOR_FIELDS : ADMIN_FIELDS;

        // Keep only the keys the caller's role is permitted to change
        const safeData: Record<string, unknown> = {};
        for (const [key, value] of Object.entries(body))
        {
            if (allowedFields.has(key))
            {
                safeData[key] = value;
            }
        }

        if (Object.keys(safeData).length === 0)
        {
            return NextResponse.json(
                { error: "No permitted fields provided for your role" },
                { status: 400 }
            );
        }

        // ── Coerce types ──────────────────────────────────────────────────────
        if (safeData.age !== undefined) safeData.age = Number(safeData.age);
        if (safeData.visitDate !== undefined) safeData.visitDate = new Date(safeData.visitDate as string);

        // ── Write ─────────────────────────────────────────────────────────────
        const updated = await prisma.patientVisit.update({
            where: { id },
            data: safeData,
        });

        return NextResponse.json(updated, { status: 200 });
    }
    catch (error)
    {
        console.error("Error updating patient visit:", error);
        return NextResponse.json({ error: "Failed to update patient visit" }, { status: 500 });
    }
}
