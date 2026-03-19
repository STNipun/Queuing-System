import { requireRole } from "@/lib/auth/auth-service.server";
import { PatientCountCard } from "@/components/ui/custom_ui/PatientCountCard";
import { Users } from "lucide-react";

export default async function FrontDeskPage()
{
    await requireRole(["front_desk", "admin"]);

    // TODO: replace with real DB query, e.g. prisma.patient.count({ where: { date: today } })
    const patientCount = 0;

    return (
        <div className="px-10 py-5">
            {/* ── Stats row ── */}
            <div className="px-6 mt-2 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <PatientCountCard count={patientCount} label="Total Patients Today" className="border-2 border-blue-500">
                    <Users className="size-7 text-white" strokeWidth={1.8} />
                </PatientCountCard>
            </div>
        </div>
    );
}
