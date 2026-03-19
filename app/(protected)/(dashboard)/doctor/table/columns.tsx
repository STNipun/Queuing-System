"use client"

import { Checkbox } from "@/components/ui/checkbox"
import { ColumnDef } from "@tanstack/react-table"
import { Eye } from "lucide-react"
import { Button } from "@/components/ui/button"

export type Patient = {
    id: string
    patientName: string
    age?: number
    gender: string
    visitDate: string
    visitTime: string
    visitType?: string
    diagnosis: string
    prescription: string
    status: string
    notes?: string
    allergies?: string | null
    bloodType?: string | null
    gp?: string | null
}

export const columns: ColumnDef<Patient>[] = [

    {
        id: "select",
        header: ({ table }) => (
            <>
                <Checkbox
                    className="h-4 w-4"
                    checked={
                        table.getIsAllPageRowsSelected() || (
                            table.getIsSomePageRowsSelected() && 'indeterminate'
                        )
                    }
                    onCheckedChange={(value) => table.toggleAllPageRowsSelected}
                    aria-label="Select all"
                />
            </>
        ),
        cell: ({ row }) => (
            <Checkbox
                checked={row.getIsSelected()}
                onCheckedChange={(value) => row.toggleSelected(!!value)}
                aria-label="Select row"
            />
        )
    },
    {
        accessorKey: "patientName",
        header: "Patient Name",
    },
    {
        accessorKey: "gender",
        header: "Gender",
    },
    {
        accessorKey: "visitDate",
        header: "Visit Date",
        cell: ({ getValue }) =>
        {
            const raw = getValue() as string;
            return new Date(raw).toLocaleDateString("en-GB", {
                day: "2-digit",
                month: "short",
                year: "numeric",
            });
        },
    },
    {
        accessorKey: "visitTime",
        header: "Visit Time",
    },
    {
        accessorKey: "diagnosis",
        header: "Diagnosis",
        cell: ({ getValue }) =>
        {
            const v = getValue() as string;
            // Show first diagnosis tag only – truncate the rest
            const first = v.split(",")[0].trim();
            return (
                <span title={v} className="truncate max-w-[16ch] inline-block">
                    {first}
                </span>
            );
        },
    },
    {
        accessorKey: "status",
        header: "Status",
        cell: ({ getValue }) =>
        {
            const status = getValue() as string;
            const colorMap: Record<string, string> = {
                pending:     "bg-amber-100 text-amber-700",
                "in-progress": "bg-blue-100 text-blue-700",
                completed:   "bg-green-100 text-green-700",
            };
            return (
                <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${colorMap[status] ?? "bg-slate-100 text-slate-700"}`}>
                    {status.replace(/-/g, " ").replace(/\b\w/g, c => c.toUpperCase())}
                </span>
            );
        },
    },
    {
        id: "actions",
        header: "",
        cell: ({ row, table }) =>
        {
            const meta = (table.options.meta as any);
            return (
                <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 hover:bg-indigo-50"
                    onClick={() => meta?.onView?.(row.original)}
                    title="View patient"
                >
                    <Eye className="h-4 w-4 text-indigo-500" />
                </Button>
            );
        }
    },
]