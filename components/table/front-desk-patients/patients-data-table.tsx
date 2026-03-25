"use client";

import { useMemo, useState } from "react";
import { DataTable } from "@/components/table/data-table";
import { patientRegisterColumns, type PatientRegisterRow } from "./columns";
import { AppModal } from "@/components/ui/custom_ui/AppModal";
import { ConfirmActionDialog } from "@/components/ui/custom_ui/ConfirmActionDialog";
import { AddPatientForm } from "@/components/ui/custom_ui/AddPatientForm";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

type FrontDeskPatientsDataTableProps = {
    patients: PatientRegisterRow[];
};

function DetailRow({ label, value }: { label: string; value: string | number })
{
    return (
        <div className="rounded-lg border border-slate-200 dark:border-slate-700 px-3 py-2">
            <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">{label}</p>
            <p className="border-2 border-slate-300 dark:border-slate-600 h-auto rounded-md pl-3 pt-2 pb-2 text-sm font-medium text-slate-700 dark:text-slate-100 mt-0.5">{value}</p>
        </div>
    );
}

export function FrontDeskPatientsDataTable({ patients }: FrontDeskPatientsDataTableProps)
{
    const router = useRouter();
    const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
    const [openCreateModal, setOpenCreateModal] = useState(false);
    const [editingPatient, setEditingPatient] = useState<PatientRegisterRow | null>(null);
    const [viewingPatient, setViewingPatient] = useState<PatientRegisterRow | null>(null);
    const [deletingPatient, setDeletingPatient] = useState<PatientRegisterRow | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const pageCount = useMemo(() =>
    {
        return Math.max(1, Math.ceil(patients.length / pagination.pageSize));
    }, [patients.length, pagination.pageSize]);

    const handleDeletePatient = async () =>
    {
        if (!deletingPatient)
        {
            return;
        }

        setIsDeleting(true);

        try
        {
            const response = await fetch(`/api/patients/${deletingPatient.id}`, {
                method: "DELETE",
            });

            const data = await response.json();
            if (!response.ok)
            {
                toast.error(data.error ?? "Failed to delete patient");
                return;
            }

            toast.success("Patient deleted successfully");
            setDeletingPatient(null);
            router.refresh();
        }
        catch (error)
        {
            console.error("[DELETE_PATIENT_ERROR]", error);
            toast.error("Unexpected error while deleting patient");
        }
        finally
        {
            setIsDeleting(false);
        }
    };

    return (
        <>
            <DataTable
                columns={patientRegisterColumns}
                data={patients}
                totalRows={patients.length}
                pageCount={pageCount}
                isLoading={false}
                tableClassName="h-auto"
                filterColumn="firstName"
                dropdownColumn="gender"
                dropdownOptions={["Male", "Female", "Other"]}
                pagination={pagination}
                onPaginationChange={setPagination}
                onAdd={() => setOpenCreateModal(true)}
                onView={(patient) => setViewingPatient(patient)}
                onEdit={(patient) => setEditingPatient(patient)}
                onDelete={(patient) => setDeletingPatient(patient)}
                addButtonLabel="Add Patient"
            />

            <AppModal
                open={openCreateModal}
                onClose={() => setOpenCreateModal(false)}
                title="Add New Patient"
                description="Register a new patient in the system."
                maxWidthClassName="max-w-2xl"
            >
                <AddPatientForm onSuccess={() => setOpenCreateModal(false)} />
            </AppModal>

            <AppModal
                open={Boolean(editingPatient)}
                onClose={() => setEditingPatient(null)}
                title="Update Patient"
                description="Update personal details for this patient."
                maxWidthClassName="max-w-2xl"
            >
                {editingPatient && (
                    <AddPatientForm
                        key={editingPatient.id}
                        mode="edit"
                        patientId={editingPatient.id}
                        initialValues={{
                            firstName: editingPatient.firstName,
                            lastName: editingPatient.lastName,
                            age: editingPatient.age,
                            gender: editingPatient.gender,
                            contactPhone: editingPatient.contactPhone,
                            email: editingPatient.email,
                        }}
                        onSuccess={() => setEditingPatient(null)}
                    />
                )}
            </AppModal>

            <AppModal
                open={Boolean(viewingPatient)}
                onClose={() => setViewingPatient(null)}
                title="Patient Details"
                description="Patient information from the register."
                maxWidthClassName="max-w-2xl"
            >
                {viewingPatient && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <DetailRow label="ID" value={viewingPatient.id} />
                        <DetailRow label="First Name" value={viewingPatient.firstName.charAt(0).toUpperCase() + viewingPatient.firstName.slice(1)} />
                        <DetailRow label="Last Name" value={viewingPatient.lastName.charAt(0).toUpperCase() + viewingPatient.lastName.slice(1)} />
                        <DetailRow label="Age" value={viewingPatient.age} />
                        <DetailRow label="Gender" value={viewingPatient.gender.charAt(0).toUpperCase() + viewingPatient.gender.slice(1)} />
                        <DetailRow label="Contact Phone" value={viewingPatient.contactPhone || "-"} />
                        <DetailRow label="Email" value={viewingPatient.email || "-"} />
                        <DetailRow label="Blood Type" value={viewingPatient.bloodType || "-"} />
                        <DetailRow label="Allergies" value={viewingPatient.allergies || "-"} />
                        <DetailRow label="GP" value={viewingPatient.gp || "-"} />
                    </div>
                )}
            </AppModal>

            <ConfirmActionDialog
                open={Boolean(deletingPatient)}
                onClose={() => setDeletingPatient(null)}
                onConfirm={handleDeletePatient}
                title="Delete Patient"
                description={deletingPatient
                    ? `This will permanently delete ${deletingPatient.firstName} ${deletingPatient.lastName} from the patient register.`
                    : "This action cannot be undone."}
                confirmLabel="Delete"
                isLoading={isDeleting}
            />
        </>
    );
}
