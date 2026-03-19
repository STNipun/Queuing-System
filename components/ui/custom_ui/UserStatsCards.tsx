import { PatientCountCard } from "@/components/ui/custom_ui/PatientCountCard";
import { ShieldCheck, Stethoscope, UserRound, Users } from "lucide-react";

type UserStats = {
    allUsers: number;
    doctors: number;
    frontDesk: number;
    admins: number;
};

type UserStatsCardsProps = {
    stats: UserStats;
};

export function UserStatsCards({ stats }: UserStatsCardsProps)
{
    return (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <PatientCountCard count={stats.allUsers} label="Total Users" className="border-2 border-blue-500">
                <Users className="size-7 text-white" strokeWidth={1.8} />
            </PatientCountCard>

            <PatientCountCard count={stats.doctors} label="Doctors" className="border-2 border-blue-500">
                <Stethoscope className="size-7 text-white" strokeWidth={1.8} />
            </PatientCountCard>

            <PatientCountCard count={stats.frontDesk} label="Front Desk" className="border-2 border-blue-500">
                <UserRound className="size-7 text-white" strokeWidth={1.8} />
            </PatientCountCard>

            <PatientCountCard count={stats.admins} label="Admins" className="border-2 border-blue-500">
                <ShieldCheck className="size-7 text-white" strokeWidth={1.8} />
            </PatientCountCard>
        </div>
    );
}