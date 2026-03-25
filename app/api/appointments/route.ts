import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth/auth-service.server";

const buildAppointmentNumber = () =>
{
    const now = new Date();
    const yy = String(now.getFullYear()).slice(-2);
    const mm = String(now.getMonth() + 1).padStart(2, "0");
    const dd = String(now.getDate()).padStart(2, "0");
    const randomPart = Math.floor(1000 + Math.random() * 9000);
    return `APT-${yy}${mm}${dd}-${randomPart}`;
};

const createAppointmentSchema = z.object({
    patientName: z.string().trim().min(1, "Patient name is required"),
    contactPhone: z.string().trim().min(1, "Contact phone is required"),
    email: z.string().trim().email("Invalid email").optional().or(z.literal("")),
    appointmentDate: z.string().min(1, "Appointment date is required"),
    appointmentTime: z.string().trim().min(1, "Appointment time is required"),
    reason: z.string().trim().optional().or(z.literal("")),
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
        const parsed = createAppointmentSchema.safeParse(body);

        if (!parsed.success)
        {
            return NextResponse.json(
                { error: "Invalid request data", details: parsed.error.flatten() },
                { status: 422 }
            );
        }

        let appointment = null;

        for (let attempt = 0; attempt < 5; attempt++)
        {
            try
            {
                appointment = await prisma.appointment.create({
                    data: {
                        appointmentNumber: buildAppointmentNumber(),
                        patientName: parsed.data.patientName.trim().toLowerCase(),
                        contactPhone: parsed.data.contactPhone.trim().toLowerCase(),
                        email: parsed.data.email ? parsed.data.email.trim().toLowerCase() : null,
                        appointmentDate: new Date(parsed.data.appointmentDate),
                        appointmentTime: parsed.data.appointmentTime.trim().toLowerCase(),
                        reason: parsed.data.reason ? parsed.data.reason.trim().toLowerCase() : null,
                        status: "scheduled",
                    },
                });
                break;
            }
            catch (error: any)
            {
                // Retry only when generated appointment number collides with unique constraint.
                if (error?.code === "P2002" && attempt < 4)
                {
                    continue;
                }
                throw error;
            }
        }

        if (!appointment)
        {
            throw new Error("Failed to generate a unique appointment number");
        }

        return NextResponse.json(appointment, { status: 201 });
    }
    catch (error)
    {
        console.error("Error creating appointment:", error);
        return NextResponse.json({ error: "Failed to create appointment" }, { status: 500 });
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

        const appointments = await prisma.appointment.findMany({
            orderBy: { createdAt: "desc" },
        });

        return NextResponse.json(appointments, { status: 200 });
    }
    catch (error)
    {
        console.error("Error fetching appointments:", error);
        return NextResponse.json({ error: "Failed to fetch appointments" }, { status: 500 });
    }
}
