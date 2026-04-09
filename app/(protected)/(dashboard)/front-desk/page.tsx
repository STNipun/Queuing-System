import { requireRole } from "@/lib/auth/auth-service.server";
import { prisma } from "@/lib/prisma";
import { PatientCountCard } from "@/components/ui/custom_ui/PatientCountCard";
import { CalendarDays, CalendarCheck, ArrowRight } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function FrontDeskPage()
{
    await requireRole(["front_desk"]);

    // Get today's date range
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Fetch today's appointments count
    const totalAppointments = await prisma.appointment.count({
        where: {
            appointmentDate: {
                gte: today,
                lt: tomorrow,
            },
        },
    });

    const scheduledAppointments = await prisma.appointment.count({
        where: {
            appointmentDate: {
                gte: today,
                lt: tomorrow,
            },
            status: "scheduled",
        },
    });

    // Fetch recent appointments (last 5)
    const recentAppointments = await prisma.appointment.findMany({
        where: {
            appointmentDate: {
                gte: today,
                lt: tomorrow,
            },
        },
        include: {
            doctor: {
                select: {
                    first_name: true,
                    last_name: true,
                },
            },
            patient: {
                select: {
                    name: true,
                },
            },
        },
        orderBy: [
            { appointmentDate: "asc" },
        ],
        take: 5,
    });

    return (
        <div className="px-10 py-5">
            {/* Stats Cards */}
            <div className="px-6 mt-2 mb-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <PatientCountCard
                    count={totalAppointments}
                    label="Total Appointments Today"
                    className="border-2 border-blue-500"
                >
                    <CalendarDays className="size-7 text-white" strokeWidth={1.8} />
                </PatientCountCard>

                <PatientCountCard
                    count={scheduledAppointments}
                    label="Scheduled Appointments"
                    className="border-2 border-indigo-500"
                >
                    <CalendarCheck className="size-7 text-white" strokeWidth={1.8} />
                </PatientCountCard>
            </div>

            {/* Quick Links */}
            <div className="px-6 mb-6">
                <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
                    <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-4">
                        Quick Actions
                    </h2>
                    <div className="flex flex-wrap gap-3">
                        <Button asChild className="bg-linear-to-br from-blue-800 to-indigo-500 text-white rounded-md inline-flex items-center px-3 py-1 mb-4 transition-colors duration-200 hover:from-blue-900 hover:to-indigo-600">
                            <Link href="/front-desk/appointments">
                                <CalendarDays className="mr-2 h-4 w-4" />
                                View All Appointments
                            </Link>
                        </Button>
                    </div>
                </div>
            </div>

            {/* Recent Appointments */}
            <div className="px-6">
                <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100">
                            Today's Appointments
                        </h2>
                        {/* <Link href="/front-desk/appointments">
                            <Button variant="ghost" size="sm">
                                View All
                                <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                        </Link> */}
                        <Button className="bg-linear-to-br from-blue-800 to-indigo-500 text-white rounded-md inline-flex items-center px-3 py-1 mb-4 transition-colors duration-200 hover:from-blue-900 hover:to-indigo-600">
                            <Link href="/front-desk/appointments" className="flex items-center gap-1 ">
                                View All
                                <ArrowRight className="ml-1 h-4 w-4" />
                            </Link>
                        </Button>
                    </div>

                    {recentAppointments.length === 0 ? (
                        <p className="text-sm text-slate-500 dark:text-slate-400 text-center py-8">
                            No appointments scheduled for today
                        </p>
                    ) : (
                        <div className="space-y-3">
                            {recentAppointments.map((appointment) => (
                                <div
                                    key={appointment.id}
                                    className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-900/50 rounded-lg border border-slate-200 dark:border-slate-700"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="flex items-center justify-center w-12 h-12 bg-linear-to-br from-blue-200 to-indigo-200 dark:bg-blue-900/30 rounded-lg">
                                            <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
                                                #{appointment.queueNumber}
                                            </span>
                                        </div>
                                        <div>
                                            <div className="font-medium text-slate-800 dark:text-slate-100">
                                                {appointment.patient.name}
                                            </div>
                                            <div className="text-sm text-slate-500 dark:text-slate-400">
                                                Dr. {appointment.doctor.first_name} {appointment.doctor.last_name} • {appointment.appointmentTime}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-sm">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${appointment.status === "scheduled"
                                                ? "bg-linear-to-br from-blue-100 to-indigo-100 text-blue-800 dark:from-blue-900/30 dark:to-indigo-900/30 dark:text-blue-300"
                                                : appointment.status === "completed"
                                                    ? "bg-linear-to-br from-green-100 to-green-100 text-green-800 dark:from-green-900/30 dark:to-green-900/30 dark:text-green-300"
                                                    : "bg-linear-to-br from-red-100 to-red-100 text-red-800 dark:from-red-900/30 dark:to-red-900/30 dark:text-red-300"
                                            }`}>
                                            {appointment.status}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
