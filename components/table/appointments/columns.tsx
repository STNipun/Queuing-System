"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Eye, Pencil, Ban } from "lucide-react";

export type AppointmentRow = {
    id: string;
    queueNumber: number;
    appointmentDate: Date | string;
    appointmentTime: string;
    status: string;
    createdAt: Date | string;
    doctorId: number;
    doctor: {
        id: number;
        first_name: string;
        last_name: string;
    };
    patient: {
        id: number;
        name: string;
        age: number;
        mobile: string;
    };
};

const getStatusBadge = (status: string) =>
{
    const styles: Record<string, string> = {
        scheduled: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
        completed: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
        cancelled: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
    };

    return (
        <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${styles[status] || styles.scheduled}`}>
            {status}
        </span>
    );
};

const formatDate = (date: Date | string) =>
{
    const d = typeof date === "string" ? new Date(date) : date;
    return d.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
};

export const appointmentColumns: ColumnDef<AppointmentRow>[] = [
    {
        accessorKey: "queueNumber",
        header: "Queue #",
        cell: ({ row }) => (
            <div className="font-bold text-blue-600 dark:text-blue-400">
                #{row.getValue("queueNumber")}
            </div>
        ),
    },
    {
        id: "patient.name",
        accessorKey: "patient.name",
        header: "Patient Name",
        cell: ({ row }) => (
            <div className="font-medium">{row.original.patient.name}</div>
        ),
    },
    {
        accessorKey: "patient.age",
        header: "Age",
        cell: ({ row }) => (
            <div>{row.original.patient.age}</div>
        ),
    },
    {
        accessorKey: "patient.mobile",
        header: "Mobile",
        cell: ({ row }) => (
            <div className="font-mono text-sm">{row.original.patient.mobile}</div>
        ),
    },
    {
        accessorKey: "doctor",
        header: "Doctor",
        cell: ({ row }) => (
            <div>
                Dr. {row.original.doctor.first_name} {row.original.doctor.last_name}
            </div>
        ),
    },
    {
        accessorKey: "appointmentDate",
        header: "Date",
        cell: ({ row }) => (
            <div>{formatDate(row.getValue("appointmentDate"))}</div>
        ),
    },
    {
        accessorKey: "appointmentTime",
        header: "Time",
        cell: ({ row }) => (
            <div className="font-mono">{row.getValue("appointmentTime")}</div>
        ),
    },
    {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => getStatusBadge(row.getValue("status")),
    },
    {
        id: "actions",
        header: "Actions",
        cell: ({ row, table }) =>
        {
            const meta = table.options.meta as any;

            return (
                <div className="flex items-center gap-2">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => meta?.onView?.(row.original)}
                        className="h-8 w-8 p-0"
                    >
                        <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => meta?.onEdit?.(row.original)}
                        className="h-8 w-8 p-0"
                        disabled={row.original.status === "cancelled"}
                    >
                        <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => meta?.onCancel?.(row.original)}
                        className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950"
                        disabled={row.original.status === "cancelled"}
                    >
                        <Ban className="h-4 w-4" />
                    </Button>
                </div>
            );
        },
    },
];
