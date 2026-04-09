import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth/auth-service.server";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const createAppointmentSchema = z.object({
    doctorId: z.number().positive("Doctor is required"),
    appointmentDate: z.string().min(1, "Date is required"),
    appointmentTime: z.string().regex(/^\d{2}:\d{2}$/, "Invalid time format (use HH:MM)"),
    patientName: z.string().min(1, "Patient name is required"),
    patientAge: z.number().min(0).max(150, "Invalid age"),
    patientMobile: z.string().min(1, "Mobile number is required"),
});

export async function GET(req: NextRequest)
{
    const currentUser = await getCurrentUser();
    if (!currentUser)
    {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const doctorId = searchParams.get("doctorId");
    const date = searchParams.get("date");
    const status = searchParams.get("status");

    const where: any = {};

    // Doctors can only see their own appointments
    if (currentUser.role === "doctor")
    {
        where.doctorId = currentUser.id;
    }
    else if (doctorId)
    {
        where.doctorId = parseInt(doctorId);
    }

    if (date)
    {
        const targetDate = new Date(date);
        const nextDay = new Date(targetDate);
        nextDay.setDate(nextDay.getDate() + 1);
        where.appointmentDate = {
            gte: targetDate,
            lt: nextDay,
        };
    }

    if (status)
    {
        where.status = status;
    }

    const appointments = await prisma.appointment.findMany({
        where,
        include: {
            doctor: {
                select: {
                    id: true,
                    first_name: true,
                    last_name: true,
                },
            },
            patient: true,
        },
        orderBy: [
            { appointmentDate: "asc" },
            { appointmentTime: "asc" },
        ],
    });

    return NextResponse.json(appointments, { status: 200 });
}

export async function POST(req: NextRequest)
{
    const currentUser = await getCurrentUser();
    if (!currentUser)
    {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (currentUser.role !== "front_desk")
    {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const parsed = createAppointmentSchema.safeParse(body);

    if (!parsed.success)
    {
        return NextResponse.json(
            { error: parsed.error.flatten().fieldErrors },
            { status: 422 }
        );
    }

    const { doctorId, appointmentDate, appointmentTime, patientName, patientAge, patientMobile } = parsed.data;

    try
    {
        // Use transaction to ensure queue number consistency
        const appointment = await prisma.$transaction(async (tx) =>
        {
            // Find or create patient
            let patient = await tx.patient.findFirst({
                where: { mobile: patientMobile },
            });

            if (!patient)
            {
                patient = await tx.patient.create({
                    data: {
                        name: patientName,
                        age: patientAge,
                        mobile: patientMobile,
                    },
                });
            }
            else
            {
                // Update patient details if changed
                patient = await tx.patient.update({
                    where: { id: patient.id },
                    data: {
                        name: patientName,
                        age: patientAge,
                    },
                });
            }

            // Calculate queue number (per-doctor daily)
            const targetDate = new Date(appointmentDate);
            const dayStart = new Date(targetDate);
            dayStart.setHours(0, 0, 0, 0);
            const dayEnd = new Date(targetDate);
            dayEnd.setHours(23, 59, 59, 999);

            const lastAppointment = await tx.appointment.findFirst({
                where: {
                    doctorId,
                    appointmentDate: {
                        gte: dayStart,
                        lte: dayEnd,
                    },
                },
                orderBy: { queueNumber: "desc" },
                select: { queueNumber: true },
            });

            const queueNumber = (lastAppointment?.queueNumber ?? 0) + 1;

            // Create appointment
            return tx.appointment.create({
                data: {
                    queueNumber,
                    doctorId,
                    patientId: patient.id,
                    appointmentDate: new Date(appointmentDate),
                    appointmentTime,
                    createdBy: currentUser.id,
                },
                include: {
                    doctor: {
                        select: {
                            id: true,
                            first_name: true,
                            last_name: true,
                        },
                    },
                    patient: true,
                },
            });
        });

        return NextResponse.json(appointment, { status: 201 });
    }
    catch (error)
    {
        console.error("[CREATE_APPOINTMENT_ERROR]", error);
        return NextResponse.json(
            { error: "Failed to create appointment" },
            { status: 500 }
        );
    }
}
