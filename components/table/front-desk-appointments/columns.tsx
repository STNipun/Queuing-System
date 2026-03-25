"use client";

import { ColumnDef } from "@tanstack/react-table";

const capitalizeFirstLetter = (value: string) =>
{
    const trimmed = value.trim();
    if (!trimmed)
    {
        return "-";
    }

    return trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
};

export type AppointmentRow = {
    id: number;
    appointmentNumber: string;
    patientName: string;
    contactPhone: string;
    email?: string | null;
    appointmentDate: string | Date;
    appointmentTime: string;
    reason?: string | null;
    status: string;
};

export const appointmentColumns: ColumnDef<AppointmentRow>[] = [
    {
        accessorKey: "appointmentNumber",
        header: "Appointment #",
    },
    {
        accessorKey: "patientName",
        header: "Patient Name",
        cell: ({ getValue }) =>
        {
            return capitalizeFirstLetter(getValue() as string);
        },
    },
    {
        accessorKey: "contactPhone",
        header: "Contact Phone",
    },
    {
        accessorKey: "appointmentDate",
        header: "Date",
        cell: ({ getValue }) =>
        {
            const value = getValue() as string | Date;
            const date = new Date(value);
            return isNaN(date.getTime()) ? "-" : date.toLocaleDateString();
        },
    },
    {
        accessorKey: "appointmentTime",
        header: "Time",
    },
    {
        accessorKey: "status",
        header: "Status",
        cell: ({ getValue }) =>
        {
            return capitalizeFirstLetter((getValue() as string) ?? "");
        },
    },
];
