"use client";

import { Button } from "@/components/ui/button";
import { AppModal } from "@/components/ui/custom_ui/AppModal";

type ConfirmActionDialogProps = {
    open: boolean;
    onClose: () => void;
    onConfirm: () => Promise<void> | void;
    title: string;
    description: string;
    confirmLabel?: string;
    cancelLabel?: string;
    isLoading?: boolean;
};

export function ConfirmActionDialog({
    open,
    onClose,
    onConfirm,
    title,
    description,
    confirmLabel = "Confirm",
    cancelLabel = "Cancel",
    isLoading = false,
}: ConfirmActionDialogProps)
{
    return (
        <AppModal
            open={open}
            onClose={onClose}
            title={title}
            description={description}
            maxWidthClassName="max-w-md"
        >
            <div className="flex items-center justify-end gap-2">
                <Button
                    type="button"
                    variant="outline"
                    onClick={onClose}
                    disabled={isLoading}
                >
                    {cancelLabel}
                </Button>

                <Button
                    type="button"
                    variant="destructive"
                    onClick={onConfirm}
                    disabled={isLoading}
                >
                    {isLoading ? "Please wait..." : confirmLabel}
                </Button>
            </div>
        </AppModal>
    );
}