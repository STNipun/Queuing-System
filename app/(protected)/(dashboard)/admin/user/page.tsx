import { requireRole } from "@/lib/auth/auth-service.server";
import { redirect } from "next/navigation";

export default async function AdminUserRedirectPage()
{
    await requireRole(["admin"]);
    redirect("/admin/users");
}
