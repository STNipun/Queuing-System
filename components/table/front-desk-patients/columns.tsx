"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Eye, Pencil, Trash2 } from "lucide-react";

const capitalizeFirstLetter = (value: string) =>
{
    const trimmed = value.trim();
    if (!trimmed)
    {
        return "-";
    }

    return trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
};

export type PatientRegisterRow = {
    id: number;
    firstName: string;
    lastName: string;
    age: number;
    gender: string;
    contactPhone?: string | null;
    email?: string | null;
    bloodType?: string | null;
    allergies?: string | null;
    gp?: string | null;
};

export const patientRegisterColumns: ColumnDef<PatientRegisterRow>[] = [
    {
        accessorKey: "firstName",
        header: "First Name",
        cell: ({ getValue }) =>
        {
            const firstName = getValue() as string;
            return capitalizeFirstLetter(firstName);
        },
    },
    {
        accessorKey: "lastName",
        header: "Last Name",
        cell: ({ getValue }) =>
        {
            const lastName = getValue() as string;
            return capitalizeFirstLetter(lastName);
        },
    },
    {
        accessorKey: "age",
        header: "Age",
    },
    {
        accessorKey: "gender",
        header: "Gender",
        cell: ({ getValue }) =>
        {
            const gender = getValue() as string;
            return capitalizeFirstLetter(gender);
        },
    },
    {
        accessorKey: "contactPhone",
        header: "Contact Phone",
        cell: ({ getValue }) =>
        {
            const phone = getValue() as string | null;
            return phone || "-";
        },
    },
    {
        accessorKey: "email",
        header: "Email",
        cell: ({ getValue }) =>
        {
            const email = getValue() as string | null;
            return email || "-";
        },
    },
    {
        accessorKey: "bloodType",
        header: "Blood Type",
        cell: ({ getValue }) =>
        {
            const bloodType = getValue() as string | null;
            return bloodType || "-";
        },
    },
    {
        id: "actions",
        header: "Actions",
        cell: ({ row, table }) =>
        {
            const meta = table.options.meta as {
                onView?: (patient: PatientRegisterRow) => void;
                onEdit?: (patient: PatientRegisterRow) => void;
                onDelete?: (patient: PatientRegisterRow) => void;
            };

            return (
                <div className="flex items-center gap-1.5">
                    <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => meta?.onView?.(row.original)}
                        title="View patient"
                        className="border-2 w-10 hover:bg-blue-100"
                    >
                        <Eye className="size-4 text-blue-600" />
                    </Button>

                    <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => meta?.onEdit?.(row.original)}
                        title="Edit patient"
                        className="border-2 w-10 hover:bg-indigo-100"
                    >
                        <Pencil className="size-4 text-indigo-600" />
                    </Button>

                    <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => meta?.onDelete?.(row.original)}
                        title="Delete patient"
                        className="border-2 w-10 hover:bg-red-100"
                    >
                        <Trash2 className="size-4 text-red-500" />
                    </Button>
                </div>
            );
        },
    },
];
