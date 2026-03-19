import { requireRole } from "@/lib/auth/auth-service.server";

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode;
})
{
    await requireRole(["admin"]);

    return children;
}
