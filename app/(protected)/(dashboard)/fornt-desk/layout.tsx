import { requireRole } from "@/lib/auth/auth-service.server";

export default async function FrontDeskLayout({
    children,
}: {
    children: React.ReactNode;
})
{
    await requireRole(["front_desk"]);

    return children;
}
