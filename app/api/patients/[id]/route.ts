import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth/auth-service.server";

const normalizeOptionalText = (value: unknown) =>
{
    if (value === undefined || value === null)
    {
        return null;
    }

    if (typeof value !== "string")
    {
        return value;
    }

    const normalized = value.trim().toLowerCase();
    return normalized === "" ? null : normalized;
};

const updatePatientSchema = z.object({
    firstName: z.string().trim().min(1, "First name is required").transform((value) => value.toLowerCase()),
    lastName: z.string().trim().min(1, "Last name is required").transform((value) => value.toLowerCase()),
    age: z.number().int().positive("Age must be a positive number"),
    gender: z.string().trim().min(1, "Gender is required").transform((value) => value.toLowerCase()),
    contactPhone: z.preprocess(normalizeOptionalText, z.string().nullable()),
    email: z.preprocess(normalizeOptionalText, z.string().email().nullable()),
});

export async function PATCH(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
)
{
    try
    {
        const currentUser = await getCurrentUser();
        if (!currentUser)
        {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;
        const patientId = parseInt(id, 10);
        if (isNaN(patientId))
        {
            return NextResponse.json(
                { error: "Invalid patient ID" },
                { status: 400 }
            );
        }

        const body = await req.json();
        const parsed = updatePatientSchema.safeParse(body);

        if (!parsed.success)
        {
            return NextResponse.json(
                { error: "Invalid request data", details: parsed.error.flatten() },
                { status: 422 }
            );
        }

        const patient = await prisma.patient.update({
            where: { id: patientId },
            data: parsed.data,
        });

        return NextResponse.json(
            { success: true, message: "Patient updated successfully", patient },
            { status: 200 }
        );
    }
    catch (error: any)
    {
        console.error("Error updating patient:", error);

        if (error.code === "P2025")
        {
            return NextResponse.json(
                { error: "Patient not found" },
                { status: 404 }
            );
        }

        return NextResponse.json(
            { error: "Failed to update patient" },
            { status: 500 }
        );
    }
}

export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
)
{
    try
    {
        const currentUser = await getCurrentUser();
        if (!currentUser)
        {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;
        const patientId = parseInt(id, 10);
        if (isNaN(patientId))
        {
            return NextResponse.json(
                { error: "Invalid patient ID" },
                { status: 400 }
            );
        }

        const patient = await prisma.patient.delete({
            where: { id: patientId },
        });

        return NextResponse.json(
            { success: true, message: "Patient deleted successfully", patient },
            { status: 200 }
        );
    }
    catch (error: any)
    {
        console.error("Error deleting patient:", error);

        if (error.code === "P2025")
        {
            return NextResponse.json(
                { error: "Patient not found" },
                { status: 404 }
            );
        }

        return NextResponse.json(
            { error: "Failed to delete patient" },
            { status: 500 }
        );
    }
}
