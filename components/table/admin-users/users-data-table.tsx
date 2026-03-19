"use client";

import { useMemo, useState } from "react";
import { DataTable } from "@/components/table/data-table";
import { adminUserColumns, type AdminUserRow } from "./columns";
import { AdminCreateUserForm } from "@/components/ui/custom_ui/AdminCreateUserForm";
import { AppModal } from "@/components/ui/custom_ui/AppModal";
import { AdminUpdateUserForm } from "@/components/ui/custom_ui/AdminUpdateUserForm";
import { ConfirmActionDialog } from "@/components/ui/custom_ui/ConfirmActionDialog";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { AdminUserDetailsView } from "@/components/ui/custom_ui/AdminUserDetailsView";

type UsersDataTableProps = {
    users: AdminUserRow[];
};

export function UsersDataTable({ users }: UsersDataTableProps)
{
    const router = useRouter();
    const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
    const [openCreateModal, setOpenCreateModal] = useState(false);
    const [viewingUser, setViewingUser] = useState<AdminUserRow | null>(null);
    const [editingUser, setEditingUser] = useState<AdminUserRow | null>(null);
    const [deletingUser, setDeletingUser] = useState<AdminUserRow | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const pageCount = useMemo(() =>
    {
        return Math.max(1, Math.ceil(users.length / pagination.pageSize));
    }, [users.length, pagination.pageSize]);

    async function handleDeleteUser()
    {
        if (!deletingUser)
        {
            return;
        }

        setIsDeleting(true);

        try
        {
            const response = await fetch(`/api/users/${deletingUser.id}`, {
                method: "DELETE",
            });

            const data = await response.json();
            if (!response.ok)
            {
                toast.error(data.error ?? "Failed to delete user");
                return;
            }

            toast.success("User deleted successfully");
            setDeletingUser(null);
            router.refresh();
        }
        catch (error)
        {
            console.error("[ADMIN_DELETE_USER_ERROR]", error);
            toast.error("Unexpected error while deleting user");
        }
        finally
        {
            setIsDeleting(false);
        }
    }

    return (
        <>
            <DataTable
                columns={adminUserColumns}
                data={users}
                totalRows={users.length}
                pageCount={pageCount}
                isLoading={false}
                tableClassName="h-auto"
                filterColumn="username"
                dropdownColumn="role"
                dropdownOptions={["admin", "doctor", "front_desk", "user"]}
                pagination={pagination}
                onPaginationChange={setPagination}
                onAdd={() => setOpenCreateModal(true)}
                onEdit={(user) => setEditingUser(user)}
                onDelete={(user) => setDeletingUser(user)}
                addButtonLabel="Add New User"
                onView={(user) => setViewingUser(user)}
            />

            <AppModal
                open={openCreateModal}
                onClose={() => setOpenCreateModal(false)}
                title="Add New User"
                description="Create a staff account and assign a role."
                maxWidthClassName="max-w-xl"
            >
                <AdminCreateUserForm onSuccess={() => setOpenCreateModal(false)} />
            </AppModal>

            <AppModal
                open={Boolean(viewingUser)}
                onClose={() => setViewingUser(null)}
                title="User Details"
                description="Read-only account information."
                maxWidthClassName="max-w-lg"
            >
                {viewingUser && <AdminUserDetailsView user={viewingUser} />}
            </AppModal>

            <AppModal
                open={Boolean(editingUser)}
                onClose={() => setEditingUser(null)}
                title="Update User"
                description="Edit account details and role."
                maxWidthClassName="max-w-xl"
            >
                {editingUser && (
                    <AdminUpdateUserForm
                        user={editingUser}
                        onSuccess={() => setEditingUser(null)}
                    />
                )}
            </AppModal>

            <ConfirmActionDialog
                open={Boolean(deletingUser)}
                onClose={() => setDeletingUser(null)}
                onConfirm={handleDeleteUser}
                title="Delete User"
                description={deletingUser
                    ? `This will permanently delete ${deletingUser.username}.`
                    : "This action cannot be undone."}
                confirmLabel="Delete"
                isLoading={isDeleting}
            />
        </>
    );
}