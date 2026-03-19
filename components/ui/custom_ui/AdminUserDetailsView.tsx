import { AdminUserRow } from "@/components/table/admin-users/columns";

type AdminUserDetailsViewProps = {
    user: AdminUserRow;
};

function formatRole(role: string): string
{
    if (role === "front_desk") return "Front Desk";
    return role.charAt(0).toUpperCase() + role.slice(1);
}

export function AdminUserDetailsView({ user }: AdminUserDetailsViewProps)
{
    const detailRows = [
        { label: "User ID", value: String(user.id) },
        { label: "First Name", value: user.first_name },
        { label: "Last Name", value: user.last_name },
        { label: "Username", value: user.username },
        { label: "Role", value: formatRole(user.role) },
    ];

    return (
        <div className="space-y-3">
            {detailRows.map((row) => (
                <div
                    key={row.label}
                    className="flex flex-col rounded-lg border border-black/8 dark:border-white/10 bg-white/65 dark:bg-slate-900/45 px-4 py-3"
                >
                    <p className="border-b border-gray-200 dark:border-gray-600 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                        {row.label}
                    </p>
                    <p className="pt-2 pl-4 text-sm font-medium text-slate-900 dark:text-slate-100 mt-1">
                        {row.value}
                    </p>
                </div>
            ))}
        </div>
    );
}