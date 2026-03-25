import { requireRole } from "@/lib/auth/auth-service.server";
import { PatientCountCard } from "@/components/ui/custom_ui/PatientCountCard";
import { FrontDeskPatientsDataTable } from "@/components/table/front-desk-patients/patients-data-table";
import { FrontDeskAppointmentsDataTable } from "@/components/table/front-desk-appointments/appointments-data-table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { prisma } from "@/lib/prisma";
import { CalendarClock, Users } from "lucide-react";

export default async function FrontDeskPage()
{
    await requireRole(["front_desk"]);

    const patients = await prisma.patient.findMany({
        orderBy: {
            createdAt: "desc",
        },
    });

    const appointments = await prisma.appointment.findMany({
        orderBy: {
            createdAt: "desc",
        },
    });

    const patientCount = patients.length;

    return (
        <div className="px-6 lg:px-10 py-6 space-y-8">
            {/* ── Stats row ── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <PatientCountCard count={patientCount} label="Total Patients" className="border-2 border-blue-500">
                    <Users className="size-7 text-white" strokeWidth={1.8} />
                </PatientCountCard>
            </div>

            <Card className="py-4">
                <CardHeader className="px-4 pb-2">
                    <CardTitle className="text-base">Patient Register</CardTitle>
                </CardHeader>

                <CardContent className="px-4 pt-0">
                    <FrontDeskPatientsDataTable patients={patients} />
                </CardContent>
            </Card>

            <Card className="py-4">
                <CardHeader className="px-4 pb-2">
                    <div className="flex items-center gap-2">
                        <CalendarClock className="size-4 text-indigo-500" />
                        <CardTitle className="text-base">Doctor Appointments</CardTitle>
                    </div>
                </CardHeader>

                <CardContent className="px-4 pt-0">
                    <FrontDeskAppointmentsDataTable appointments={appointments} />
                </CardContent>
            </Card>
        </div>
    );
}
