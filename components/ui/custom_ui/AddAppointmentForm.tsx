"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Field, FieldContent, FieldError, FieldLabel } from "@/components/ui/field";

const appointmentFormSchema = z.object({
    patientName: z.string().min(1, "Patient name is required"),
    contactPhone: z.string().min(1, "Contact phone is required"),
    email: z.string().email("Invalid email").optional().or(z.literal("")),
    appointmentDate: z.string().min(1, "Appointment date is required"),
    appointmentTime: z.string().min(1, "Appointment time is required"),
    reason: z.string().optional().or(z.literal("")),
});

type AppointmentFormType = z.infer<typeof appointmentFormSchema>;

type AddAppointmentFormProps = {
    onSuccess?: () => void;
};

export function AddAppointmentForm({ onSuccess }: AddAppointmentFormProps)
{
    const router = useRouter();

    const form = useForm<AppointmentFormType>({
        resolver: zodResolver(appointmentFormSchema),
        defaultValues: {
            patientName: "",
            contactPhone: "",
            email: "",
            appointmentDate: "",
            appointmentTime: "",
            reason: "",
        },
    });

    const { isSubmitting } = form.formState;

    const onSubmit = async (values: AppointmentFormType) =>
    {
        try
        {
            const response = await fetch("/api/appointments", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(values),
            });

            const data = await response.json();

            if (!response.ok)
            {
                toast.error(data.error ?? "Failed to create appointment");
                return;
            }

            toast.success(`Appointment scheduled: ${data.appointmentNumber ?? data.id}`);
            form.reset();
            router.refresh();
            onSuccess?.();
        }
        catch (error)
        {
            console.error("[CREATE_APPOINTMENT_ERROR]", error);
            toast.error("Unexpected error while creating appointment");
        }
    };

    return (
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field>
                    <FieldLabel>Patient Name</FieldLabel>
                    <FieldContent>
                        <Input
                            {...form.register("patientName")}
                            placeholder="Enter patient name"
                            aria-invalid={!!form.formState.errors.patientName}
                        />
                        <FieldError errors={form.formState.errors.patientName ? [form.formState.errors.patientName] : undefined} />
                    </FieldContent>
                </Field>

                <Field>
                    <FieldLabel>Contact Phone</FieldLabel>
                    <FieldContent>
                        <Input
                            {...form.register("contactPhone")}
                            placeholder="Enter phone number"
                            aria-invalid={!!form.formState.errors.contactPhone}
                        />
                        <FieldError errors={form.formState.errors.contactPhone ? [form.formState.errors.contactPhone] : undefined} />
                    </FieldContent>
                </Field>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field>
                    <FieldLabel>Appointment Date</FieldLabel>
                    <FieldContent>
                        <Input
                            type="date"
                            {...form.register("appointmentDate")}
                            aria-invalid={!!form.formState.errors.appointmentDate}
                        />
                        <FieldError errors={form.formState.errors.appointmentDate ? [form.formState.errors.appointmentDate] : undefined} />
                    </FieldContent>
                </Field>

                <Field>
                    <FieldLabel>Appointment Time</FieldLabel>
                    <FieldContent>
                        <Input
                            type="time"
                            {...form.register("appointmentTime")}
                            aria-invalid={!!form.formState.errors.appointmentTime}
                        />
                        <FieldError errors={form.formState.errors.appointmentTime ? [form.formState.errors.appointmentTime] : undefined} />
                    </FieldContent>
                </Field>
            </div>

            <Field>
                <FieldLabel>Email (Optional)</FieldLabel>
                <FieldContent>
                    <Input
                        type="email"
                        {...form.register("email")}
                        placeholder="Enter email"
                        aria-invalid={!!form.formState.errors.email}
                    />
                    <FieldError errors={form.formState.errors.email ? [form.formState.errors.email] : undefined} />
                </FieldContent>
            </Field>

            <Field>
                <FieldLabel>Reason (Optional)</FieldLabel>
                <FieldContent>
                    <Textarea
                        {...form.register("reason")}
                        placeholder="Add appointment reason"
                        aria-invalid={!!form.formState.errors.reason}
                    />
                    <FieldError errors={form.formState.errors.reason ? [form.formState.errors.reason] : undefined} />
                </FieldContent>
            </Field>

            <Button type="submit" disabled={isSubmitting} className="w-full">
                {isSubmitting ? "Scheduling..." : "Schedule Appointment"}
            </Button>
        </form>
    );
}
