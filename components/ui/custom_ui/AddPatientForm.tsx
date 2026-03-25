"use client";

import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import CInput from "@/components/ui/custom_ui/CInput";
import { Field, FieldContent, FieldError, FieldLabel } from "@/components/ui/field";
import
{
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

const patientFormSchema = z.object({
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
    age: z.string().min(1, "Age is required").regex(/^\d+$/, "Age must be a positive number"),
    gender: z.string().min(1, "Gender is required"),
    contactPhone: z.string().optional().nullable(),
    email: z.string().email().optional().or(z.literal("")),
});

type PatientFormType = z.infer<typeof patientFormSchema>;

interface PatientFormProps
{
    onSuccess?: () => void;
    mode?: "create" | "edit";
    patientId?: number;
    initialValues?: {
        firstName?: string;
        lastName?: string;
        age?: string | number;
        gender?: string;
        contactPhone?: string | null;
        email?: string | null;
    };
}

export function AddPatientForm({ onSuccess, mode = "create", patientId, initialValues }: PatientFormProps)
{
    const isEditMode = mode === "edit";

    const form = useForm<PatientFormType>({
        resolver: zodResolver(patientFormSchema),
        defaultValues: {
            firstName: initialValues?.firstName ?? "",
            lastName: initialValues?.lastName ?? "",
            age: initialValues?.age !== undefined && initialValues?.age !== null ? String(initialValues.age) : "",
            gender: initialValues?.gender ?? "",
            contactPhone: initialValues?.contactPhone ?? "",
            email: initialValues?.email ?? "",
        },
    });

    const { isSubmitting } = form.formState;
    const router = useRouter();

    const onSubmit = async (values: PatientFormType) =>
    {
        try
        {
            const payload = {
                firstName: values.firstName,
                lastName: values.lastName,
                age: Number(values.age),
                gender: values.gender,
                contactPhone: values.contactPhone,
                email: values.email,
            };

            const endpoint = isEditMode && patientId ? `/api/patients/${patientId}` : "/api/patients";
            const method = isEditMode ? "PATCH" : "POST";

            const response = await fetch(endpoint, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            const data = await response.json();

            if (!response.ok)
            {
                toast.error(data.error || "Failed to create patient");
                return;
            }

            toast.success(isEditMode ? "Patient updated successfully" : "Patient created successfully");
            if (!isEditMode)
            {
                form.reset();
            }
            router.refresh();
            onSuccess?.();
        }
        catch (error)
        {
            console.error("Error creating patient:", error);
            toast.error("An error occurred while creating patient");
        }
    };

    return (
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <CInput
                    control={form.control}
                    name="firstName"
                    label="First Name"
                    placeholder="Enter first name"
                    type="text"
                    className=" bg-white/50 focus-within:bg-white"
                />
                <CInput
                    control={form.control}
                    name="lastName"
                    label="Last Name"
                    placeholder="Enter last name"
                    type="text"
                    className=" bg-white/50 focus-within:bg-white"
                />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <CInput
                    control={form.control}
                    name="age"
                    label="Age"
                    placeholder="Enter age"
                    type="number"
                    className=" bg-white/50 focus-within:bg-white"
                />
                <Controller
                    control={form.control}
                    name="gender"
                    render={({ field, fieldState: { error } }) => (
                        <Field>
                            <FieldLabel>Gender</FieldLabel>
                            <FieldContent>
                                <Select
                                    value={field.value ?? ""}
                                    onValueChange={field.onChange}
                                >
                                    <SelectTrigger className="w-full" aria-invalid={!!error}>
                                        <SelectValue placeholder="Select gender"
                                            className=" bg-white/50 focus-within:bg-white" />
                                    </SelectTrigger>
                                    <SelectContent
                                        className=" bg-white/50 focus-within:bg-white">
                                        <SelectItem value="Male"
                                            className=" bg-white/50 focus-within:bg-white">Male</SelectItem>
                                        <SelectItem value="Female"
                                            className=" bg-white/50 focus-within:bg-white">Female</SelectItem>
                                        <SelectItem value="Other"
                                            className=" bg-white/50 focus-within:bg-white">Other</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FieldError errors={error ? [error] : undefined} />
                            </FieldContent>
                        </Field>
                    )}
                />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <CInput
                    control={form.control}
                    name="contactPhone"
                    label="Contact Phone"
                    placeholder="Enter phone number (optional)"
                    type="text"
                    className=" bg-white/50 focus-within:bg-white"
                />
                <CInput
                    control={form.control}
                    name="email"
                    label="Email"
                    placeholder="Enter email (optional)"
                    type="email"
                    className=" bg-white/50 focus-within:bg-white"
                />
            </div>

            <Button type="submit" disabled={isSubmitting} className="w-full bg-linear-to-br from-blue-800 to-indigo-500 hover:from-blue-700 hover:to-indigo-400 hover:text-black text-white">
                {isSubmitting ? (isEditMode ? "Updating..." : "Creating...") : (isEditMode ? "Update Patient" : "Add Patient")}
            </Button>
        </form>
    );
}
