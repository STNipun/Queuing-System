import { requireRole } from "@/lib/auth/auth-service.server";

export default async function DoctorLayout({
    children,
}: {
    children: React.ReactNode;
})
{
    await requireRole(["doctor"]);

    return children;
}
