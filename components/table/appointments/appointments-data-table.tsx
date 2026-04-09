"use client";

import { useMemo, useState } from "react";
import { DataTable } from "@/components/table/data-table";
import { appointmentColumns, type AppointmentRow } from "./columns";
import { CreateAppointmentForm } from "@/components/ui/custom_ui/CreateAppointmentForm";
import { UpdateAppointmentForm } from "@/components/ui/custom_ui/UpdateAppointmentForm";
import { AppointmentDetailsView } from "@/components/ui/custom_ui/AppointmentDetailsView";
import { AppModal } from "@/components/ui/custom_ui/AppModal";
import { ConfirmActionDialog } from "@/components/ui/custom_ui/ConfirmActionDialog";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

type AppointmentsDataTableProps = {
    appointments: AppointmentRow[];
};

export function AppointmentsDataTable({ appointments }: AppointmentsDataTableProps)
{
    const router = useRouter();
    const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
    const [openCreateModal, setOpenCreateModal] = useState(false);
    const [viewingAppointment, setViewingAppointment] = useState<AppointmentRow | null>(null);
    const [editingAppointment, setEditingAppointment] = useState<AppointmentRow | null>(null);
    const [cancellingAppointment, setCancellingAppointment] = useState<AppointmentRow | null>(null);
    const [isCancelling, setIsCancelling] = useState(false);

    const pageCount = useMemo(() =>
    {
        return Math.max(1, Math.ceil(appointments.length / pagination.pageSize));
    }, [appointments.length, pagination.pageSize]);

    async function handleCancelAppointment()
    {
        if (!cancellingAppointment)
        {
            return;
        }

        setIsCancelling(true);

        try
        {
            const response = await fetch(`/api/appointments/${cancellingAppointment.id}`, {
                method: "DELETE",
            });

            const data = await response.json();
            if (!response.ok)
            {
                toast.error(data.error ?? "Failed to cancel appointment");
                return;
            }

            toast.success("Appointment cancelled successfully");
            setCancellingAppointment(null);
            router.refresh();
        }
        catch (error)
        {
            console.error("[CANCEL_APPOINTMENT_ERROR]", error);
            toast.error("Unexpected error while cancelling appointment");
        }
        finally
        {
            setIsCancelling(false);
        }
    }

    return (
        <>
            <DataTable
                columns={appointmentColumns}
                data={appointments}
                totalRows={appointments.length}
                pageCount={pageCount}
                isLoading={false}
                tableClassName="h-auto"
                filterColumn="patient.name"
                pagination={pagination}
                onPaginationChange={setPagination}
                onAdd={() => setOpenCreateModal(true)}
                onEdit={(appointment) => setEditingAppointment(appointment)}
                onView={(appointment) => setViewingAppointment(appointment)}
                addButtonLabel="Add New Appointment"
                meta={{
                    onView: (appointment: AppointmentRow) => setViewingAppointment(appointment),
                    onEdit: (appointment: AppointmentRow) => setEditingAppointment(appointment),
                    onCancel: (appointment: AppointmentRow) => setCancellingAppointment(appointment),
                }}
            />

            <AppModal
                open={openCreateModal}
                onClose={() => setOpenCreateModal(false)}
                title="Add New Appointment"
                description="Schedule a patient appointment with a doctor."
                maxWidthClassName="max-w-xl"
            >
                <CreateAppointmentForm onSuccess={() => setOpenCreateModal(false)} />
            </AppModal>

            <AppModal
                open={Boolean(viewingAppointment)}
                onClose={() => setViewingAppointment(null)}
                title="Appointment Details"
                description="View appointment information."
                maxWidthClassName="max-w-lg"
            >
                {viewingAppointment && <AppointmentDetailsView appointment={viewingAppointment} />}
            </AppModal>

            <AppModal
                open={Boolean(editingAppointment)}
                onClose={() => setEditingAppointment(null)}
                title="Update Appointment"
                description="Edit appointment details."
                maxWidthClassName="max-w-xl"
            >
                {editingAppointment && (
                    <UpdateAppointmentForm
                        appointment={editingAppointment}
                        onSuccess={() => setEditingAppointment(null)}
                    />
                )}
            </AppModal>

            <ConfirmActionDialog
                open={Boolean(cancellingAppointment)}
                onClose={() => setCancellingAppointment(null)}
                onConfirm={handleCancelAppointment}
                title="Cancel Appointment"
                description={cancellingAppointment
                    ? `This will cancel the appointment for ${cancellingAppointment.patient.name}.`
                    : "This action cannot be undone."}
                confirmLabel="Cancel Appointment"
                isLoading={isCancelling}
            />
        </>
    );
}
