import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth/auth-service.server";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const updateAppointmentSchema = z.object({
    doctorId: z.number().positive("Doctor is required").optional(),
    appointmentDate: z.string().min(1, "Date is required").optional(),
    appointmentTime: z.string().regex(/^\d{2}:\d{2}$/, "Invalid time format (use HH:MM)").optional(),
    patientName: z.string().min(1, "Patient name is required").optional(),
    patientAge: z.number().min(0).max(150, "Invalid age").optional(),
    patientMobile: z.string().min(1, "Mobile number is required").optional(),
    status: z.enum(["scheduled", "completed", "cancelled"]).optional(),
});

async function requireFrontDesk()
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
    return null;
}

export async function PATCH(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
)
{
    const authError = await requireFrontDesk();
    if (authError) return authError;

    const { id } = await params;

    const body = await req.json();
    const parsed = updateAppointmentSchema.safeParse(body);

    if (!parsed.success)
    {
        return NextResponse.json(
            { error: parsed.error.flatten().fieldErrors },
            { status: 422 }
        );
    }

    try
    {
        const { doctorId, appointmentDate, appointmentTime, patientName, patientAge, patientMobile, status } = parsed.data;

        const appointment = await prisma.$transaction(async (tx) =>
        {
            // Get current appointment
            const existing = await tx.appointment.findUnique({
                where: { id },
                include: { patient: true },
            });

            if (!existing)
            {
                throw new Error("Appointment not found");
            }

            // Update patient if info changed
            if (patientName || patientAge || patientMobile)
            {
                await tx.patient.update({
                    where: { id: existing.patientId },
                    data: {
                        ...(patientName && { name: patientName }),
                        ...(patientAge && { age: patientAge }),
                        ...(patientMobile && { mobile: patientMobile }),
                    },
                });
            }

            // Update appointment
            const updateData: any = {};
            if (doctorId) updateData.doctorId = doctorId;
            if (appointmentDate) updateData.appointmentDate = new Date(appointmentDate);
            if (appointmentTime) updateData.appointmentTime = appointmentTime;
            if (status) updateData.status = status;

            return tx.appointment.update({
                where: { id },
                data: updateData,
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

        return NextResponse.json(appointment, { status: 200 });
    }
    catch (error)
    {
        console.error("[UPDATE_APPOINTMENT_ERROR]", error);
        return NextResponse.json(
            { error: "Failed to update appointment" },
            { status: 500 }
        );
    }
}

export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
)
{
    const authError = await requireFrontDesk();
    if (authError) return authError;

    const { id } = await params;

    try
    {
        // Soft delete by setting status to cancelled
        const appointment = await prisma.appointment.update({
            where: { id },
            data: { status: "cancelled" },
        });

        return NextResponse.json(
            { message: "Appointment cancelled successfully", appointment },
            { status: 200 }
        );
    }
    catch (error)
    {
        console.error("[DELETE_APPOINTMENT_ERROR]", error);
        return NextResponse.json(
            { error: "Failed to cancel appointment" },
            { status: 500 }
        );
    }
}
