import { requireRole } from "@/lib/auth/auth-service.server";
import { prisma } from "@/lib/prisma";
import { AppointmentsDataTable } from "@/components/table/appointments/appointments-data-table";
import { CalendarDays, CalendarCheck, CalendarX, ArrowLeft, ArrowRight } from "lucide-react";
import { PatientCountCard } from "@/components/ui/custom_ui/PatientCountCard";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default async function AppointmentsPage()
{
    await requireRole(["front_desk"]);

    // Get today's date range
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Fetch today's appointments
    const appointments = await prisma.appointment.findMany({
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
            { queueNumber: "asc" },
        ],
    });

    // Calculate stats for today
    const todayAppointments = appointments.filter(
        (apt) =>
        {
            const aptDate = new Date(apt.appointmentDate);
            return aptDate >= today && aptDate < tomorrow;
        }
    );

    const totalToday = todayAppointments.length;
    const scheduledToday = todayAppointments.filter((apt) => apt.status === "scheduled").length;
    const completedToday = todayAppointments.filter((apt) => apt.status === "completed").length;
    const cancelledToday = todayAppointments.filter((apt) => apt.status === "cancelled").length;

    return (
        <div className="px-10 py-5">
            <Link href="/front-desk">
                    <Button variant="ghost" size="sm" className="bg-linear-to-br from-blue-800 to-indigo-500 text-white rounded-md inline-flex items-center px-3 py-1 mb-4 transition-colors duration-200 hover:from-blue-900 hover:to-indigo-600">
                        <ArrowLeft className="m-0 h-4 w-4" />
                        Back to Dashboard
                    </Button>
                </Link>
            {/* Stats Cards */}
            <div className="px-6 mt-2 mb-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <PatientCountCard
                    count={totalToday}
                    label="Total Appointments Today"
                    className="border-2 border-blue-500"
                >
                    <CalendarDays className="size-7 text-white" strokeWidth={1.8} />
                </PatientCountCard>

                <PatientCountCard
                    count={scheduledToday}
                    label="Scheduled"
                    className="border-2 border-indigo-500"
                >
                    <CalendarCheck className="size-7 text-white" strokeWidth={1.8} />
                </PatientCountCard>

                <PatientCountCard
                    count={completedToday}
                    label="Completed"
                    className="border-2 border-green-500"
                >
                    <CalendarCheck className="size-7 text-white" strokeWidth={1.8} />
                </PatientCountCard>

                <PatientCountCard
                    count={cancelledToday}
                    label="Cancelled"
                    className="border-2 border-red-500"
                >
                    <CalendarX className="size-7 text-white" strokeWidth={1.8} />
                </PatientCountCard>
            </div>

            {/* Appointments Table */}
            <div className="px-6">
                
                <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-4">
                    All Appointments
                </h2>
                <AppointmentsDataTable appointments={appointments} />
            </div>
        </div>
    );
}
