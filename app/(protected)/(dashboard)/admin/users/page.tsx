import { requireRole } from "@/lib/auth/auth-service.server";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UserStatsCards } from "@/components/ui/custom_ui/UserStatsCards";
import { UsersDataTable } from "@/components/table/admin-users/users-data-table";

export default async function AdminUsersPage()
{
    await requireRole(["admin"]);

    const users = await prisma.user.findMany({
        select: {
            id: true,
            username: true,
            first_name: true,
            last_name: true,
            role: true,
        },
        orderBy: {
            id: "desc",
        },
    });

    const totals = {
        allUsers: users.length,
        doctors: users.filter((user) => user.role === "doctor").length,
        frontDesk: users.filter((user) => user.role === "front_desk").length,
        admins: users.filter((user) => user.role === "admin").length,
    };

    return (
        <div className="px-6 lg:px-10 py-6 space-y-8">
            <div>
                <h2 className="text-2xl font-bold tracking-tight">Admin Dashboard</h2>
                <p className="text-sm text-slate-500 mt-1">
                    User overview and staff account management.
                </p>
            </div>

            <UserStatsCards stats={totals} />

            <Card className="py-4">
                <CardHeader className="px-4 pb-2">
                    <CardTitle className="text-base">Users</CardTitle>
                </CardHeader>

                <CardContent className="px-4 pt-0">
                    <UsersDataTable users={users} />
                </CardContent>
            </Card>
        </div>
    );
}
