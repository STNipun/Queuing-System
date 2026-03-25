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

const createPatientSchema = z.object({
    firstName: z.string().trim().min(1, "First name is required").transform((value) => value.toLowerCase()),
    lastName: z.string().trim().min(1, "Last name is required").transform((value) => value.toLowerCase()),
    age: z.number().int().positive("Age must be a positive number"),
    gender: z.string().trim().min(1, "Gender is required").transform((value) => value.toLowerCase()),
    contactPhone: z.preprocess(normalizeOptionalText, z.string().nullable()),
    email: z.preprocess(normalizeOptionalText, z.string().email().nullable()),
    allergies: z.preprocess(normalizeOptionalText, z.string().nullable()),
    bloodType: z.preprocess(normalizeOptionalText, z.string().nullable()),
    gp: z.preprocess(normalizeOptionalText, z.string().nullable()),
    notes: z.preprocess(normalizeOptionalText, z.string().nullable()),
});

export async function POST(req: NextRequest)
{
    try
    {
        const currentUser = await getCurrentUser();
        if (!currentUser)
        {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const parsed = createPatientSchema.safeParse(body);

        if (!parsed.success)
        {
            return NextResponse.json(
                { error: "Invalid request data", details: parsed.error.flatten() },
                { status: 422 }
            );
        }

        const patient = await prisma.patient.create({
            data: parsed.data,
        });

        return NextResponse.json(patient, { status: 201 });
    }
    catch (error)
    {
        console.error("Error creating patient:", error);
        return NextResponse.json(
            { error: "Failed to create patient" },
            { status: 500 }
        );
    }
}

export async function GET(req: NextRequest)
{
    try
    {
        const currentUser = await getCurrentUser();
        if (!currentUser)
        {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const patients = await prisma.patient.findMany({
            orderBy: { createdAt: "desc" },
        });

        return NextResponse.json(patients, { status: 200 });
    }
    catch (error)
    {
        console.error("Error fetching patients:", error);
        return NextResponse.json(
            { error: "Failed to fetch patients" },
            { status: 500 }
        );
    }
}
