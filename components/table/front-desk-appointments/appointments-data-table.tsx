"use client";

import { useMemo, useState } from "react";
import { DataTable } from "@/components/table/data-table";
import { appointmentColumns, type AppointmentRow } from "./columns";
import { AppModal } from "@/components/ui/custom_ui/AppModal";
import { AddAppointmentForm } from "@/components/ui/custom_ui/AddAppointmentForm";

type FrontDeskAppointmentsDataTableProps = {
    appointments: AppointmentRow[];
};

export function FrontDeskAppointmentsDataTable({ appointments }: FrontDeskAppointmentsDataTableProps)
{
    const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
    const [openCreateModal, setOpenCreateModal] = useState(false);

    const pageCount = useMemo(() =>
    {
        return Math.max(1, Math.ceil(appointments.length / pagination.pageSize));
    }, [appointments.length, pagination.pageSize]);

    return (
        <>
            <DataTable
                columns={appointmentColumns}
                data={appointments}
                totalRows={appointments.length}
                pageCount={pageCount}
                isLoading={false}
                tableClassName="h-auto"
                filterColumn="patientName"
                dropdownColumn="status"
                dropdownOptions={["scheduled", "completed", "cancelled"]}
                pagination={pagination}
                onPaginationChange={setPagination}
                onAdd={() => setOpenCreateModal(true)}
                addButtonLabel="Add Appointment"
            />

            <AppModal
                open={openCreateModal}
                onClose={() => setOpenCreateModal(false)}
                title="Schedule Doctor Appointment"
                description="Capture patient details and schedule an appointment."
                maxWidthClassName="max-w-2xl"
            >
                <AddAppointmentForm onSuccess={() => setOpenCreateModal(false)} />
            </AppModal>
        </>
    );
}
