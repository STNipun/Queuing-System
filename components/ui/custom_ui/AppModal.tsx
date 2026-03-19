"use client";

import { ReactNode } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

type AppModalProps = {
    open: boolean;
    onClose: () => void;
    title: string;
    description?: string;
    maxWidthClassName?: string;
    children: ReactNode;
};

export function AppModal({
    open,
    onClose,
    title,
    description,
    maxWidthClassName = "max-w-2xl",
    children,
}: AppModalProps)
{
    if (!open)
    {
        return null;
    }

    return (
        <div
            className="fixed inset-0 z-50 bg-black/30 backdrop-blur p-4 flex items-center justify-center overflow-y-auto"
            onClick={onClose}
        >
            <div
                className={`w-full ${maxWidthClassName} my-auto`}
                onClick={(event) => event.stopPropagation()}
            >
                <div className="rounded-2xl border border-black/[0.07] bg-white/80 backdrop-blur-xl shadow-xl dark:bg-slate-900/80 dark:border-white/8 overflow-hidden">
                    <div className="flex items-start justify-between gap-3 px-5 py-4 border-b border-black/6 dark:border-white/8">
                        <div>
                            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">{title}</h3>
                            {description && (
                                <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">{description}</p>
                            )}
                        </div>

                        <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={onClose}
                            aria-label="Close modal"
                        >
                            <X className="size-4" />
                        </Button>
                    </div>

                    <div className="px-5 py-5">
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
}