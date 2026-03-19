"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Eye, Pencil, Trash2 } from "lucide-react";

export type AdminUserRow = {
    id: number;
    first_name: string;
    last_name: string;
    username: string;
    role: string;
};

function formatRole(role: string): string
{
    if (role === "front_desk") return "Front Desk";
    return role.charAt(0).toUpperCase() + role.slice(1);
}

function rolePillClass(role: string): string
{
    if (role === "admin") return "bg-indigo-100 text-indigo-700";
    if (role === "doctor") return "bg-emerald-100 text-emerald-700";
    if (role === "front_desk") return "bg-amber-100 text-amber-700";
    return "bg-slate-100 text-slate-700";
}

export const adminUserColumns: ColumnDef<AdminUserRow>[] = [
    {
        accessorKey: "id",
        header: "ID",
    },
    {
        id: "fullName",
        header: "Name",
        cell: ({ row }) => `${row.original.first_name} ${row.original.last_name}`,
    },
    {
        accessorKey: "username",
        header: "Username",
    },
    {
        accessorKey: "role",
        header: "Role",
        cell: ({ getValue }) =>
        {
            const role = String(getValue());
            return (
                <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${rolePillClass(role)}`}>
                    {formatRole(role)}
                </span>
            );
        },
    },
    {
        id: "actions",
        header: "Actions",
        cell: ({ row, table }) =>
        {
            const meta = table.options.meta as {
                onView?: (user: AdminUserRow) => void;
                onEdit?: (user: AdminUserRow) => void;
                onDelete?: (user: AdminUserRow) => void;
            };

            return (
                <div className="flex items-center gap-1.5">
                    <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => meta?.onView?.(row.original)}
                        title="View user"
                        className="border-2 w-10 hover:bg-blue-100"
                    >
                        <Eye className="size-4 text-blue-600" />
                    </Button>

                    <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => meta?.onEdit?.(row.original)}
                        title="Edit user"
                        className="border-2 w-10 hover:bg-indigo-100"
                    >
                        <Pencil className="size-4 text-indigo-600" />
                    </Button>

                    <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => meta?.onDelete?.(row.original)}
                        title="Delete user"
                        className="border-2 w-10 hover:bg-red-100"
                    >
                        <Trash2 className="size-4 text-red-500" />
                    </Button>
                </div>
            );
        },
    },
];