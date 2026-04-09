"use client";

import { useState, useEffect } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Loader2, User, Phone, Calendar, Clock } from "lucide-react";
import { toast } from "sonner";
import CInput from "@/components/ui/custom_ui/CInput";
import { useRouter } from "next/navigation";

const createAppointmentSchema = z.object({
    doctorId: z.coerce.number().positive("Doctor is required"),
    appointmentDate: z.string().min(1, "Date is required"),
    appointmentTime: z.string().regex(/^\d{2}:\d{2}$/, "Invalid time format"),
    patientName: z.string().min(1, "Patient name is required"),
    patientAge: z.coerce.number().min(0).max(150, "Invalid age"),
    patientMobile: z.string().min(1, "Mobile number is required"),
});

type CreateAppointmentFormValues = z.infer<typeof createAppointmentSchema>;

type Doctor = {
    id: number;
    first_name: string;
    last_name: string;
    username: string;
};

type CreateAppointmentFormProps = {
    onSuccess?: () => void;
};

// Generate time slots from 09:00 to 17:00 in 30-minute intervals
const generateTimeSlots = () =>
{
    const slots = [];
    for (let hour = 9; hour <= 17; hour++)
    {
        slots.push(`${hour.toString().padStart(2, "0")}:00`);
        if (hour < 17)
        {
            slots.push(`${hour.toString().padStart(2, "0")}:30`);
        }
    }
    return slots;
};

const TIME_SLOTS = generateTimeSlots();

export function CreateAppointmentForm({ onSuccess }: CreateAppointmentFormProps)
{
    const router = useRouter();
    const [isSaving, setIsSaving] = useState(false);
    const [doctors, setDoctors] = useState<Doctor[]>([]);
    const [isLoadingDoctors, setIsLoadingDoctors] = useState(true);

    const form = useForm<CreateAppointmentFormValues>({
        resolver: zodResolver(createAppointmentSchema),
        defaultValues: {
            patientName: "",
            patientAge: 0,
            patientMobile: "",
            appointmentDate: new Date().toISOString().split("T")[0],
            appointmentTime: "09:00",
        },
    });

    useEffect(() =>
    {
        async function fetchDoctors()
        {
            try
            {
                const response = await fetch("/api/doctors");
                if (!response.ok)
                {
                    throw new Error("Failed to fetch doctors");
                }
                const data = await response.json();
                setDoctors(data);
            }
            catch (error)
            {
                console.error("[FETCH_DOCTORS_ERROR]", error);
                toast.error("Failed to load doctors");
            }
            finally
            {
                setIsLoadingDoctors(false);
            }
        }

        fetchDoctors();
    }, []);

    const onSubmit: SubmitHandler<CreateAppointmentFormValues> = async (values) =>
    {
        setIsSaving(true);

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
                toast.error(data.error || "Failed to create appointment");
                return;
            }

            toast.success(`Appointment created! Queue Number: ${data.queueNumber}`);
            form.reset({
                patientName: "",
                patientAge: 0,
                patientMobile: "",
                appointmentDate: new Date().toISOString().split("T")[0],
                appointmentTime: "09:00",
            });

            onSuccess?.();
            router.refresh();
        }
        catch (error)
        {
            console.error("[CREATE_APPOINTMENT_ERROR]", error);
            toast.error("Unexpected error while creating appointment");
        }
        finally
        {
            setIsSaving(false);
        }
    };

    const today = new Date().toISOString().split("T")[0];

    return (
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            <div className="space-y-2">
                <label htmlFor="doctorId" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    Doctor
                </label>
                <select
                    id="doctorId"
                    className="w-full h-10 rounded-md border border-black/12 dark:border-white/12 bg-white/70 dark:bg-slate-900/50 px-3 text-sm"
                    disabled={isSaving || isLoadingDoctors}
                    {...form.register("doctorId")}
                >
                    <option value="">Select a doctor</option>
                    {doctors.map((doctor) => (
                        <option key={doctor.id} value={doctor.id}>
                            Dr. {doctor.first_name} {doctor.last_name}
                        </option>
                    ))}
                </select>
                {form.formState.errors.doctorId && (
                    <p className="text-sm text-red-500">{form.formState.errors.doctorId.message}</p>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <label htmlFor="appointmentDate" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                        Date
                    </label>
                    <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <input
                            id="appointmentDate"
                            type="date"
                            min={today}
                            className="w-full h-10 rounded-md border border-black/12 dark:border-white/12 bg-white/70 dark:bg-slate-900/50 pl-10 pr-3 text-sm"
                            disabled={isSaving}
                            {...form.register("appointmentDate")}
                        />
                    </div>
                    {form.formState.errors.appointmentDate && (
                        <p className="text-sm text-red-500">{form.formState.errors.appointmentDate.message}</p>
                    )}
                </div>

                <div className="space-y-2">
                    <label htmlFor="appointmentTime" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                        Time
                    </label>
                    <div className="relative">
                        <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <select
                            id="appointmentTime"
                            className="w-full h-10 rounded-md border border-black/12 dark:border-white/12 bg-white/70 dark:bg-slate-900/50 pl-10 pr-3 text-sm"
                            disabled={isSaving}
                            {...form.register("appointmentTime")}
                        >
                            {TIME_SLOTS.map((slot) => (
                                <option key={slot} value={slot}>
                                    {slot}
                                </option>
                            ))}
                        </select>
                    </div>
                    {form.formState.errors.appointmentTime && (
                        <p className="text-sm text-red-500">{form.formState.errors.appointmentTime.message}</p>
                    )}
                </div>
            </div>

            <CInput
                control={form.control}
                name="patientName"
                label="Patient Name"
                placeholder="Enter patient name"
                type="text"
                icon={User}
                disabled={isSaving}
                className="w-full"
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <CInput
                    control={form.control}
                    name="patientAge"
                    label="Age"
                    placeholder="Enter age"
                    type="number"
                    icon={User}
                    disabled={isSaving}
                    className="w-full"
                />

                <CInput
                    control={form.control}
                    name="patientMobile"
                    label="Mobile Number"
                    placeholder="Enter mobile number"
                    type="text"
                    icon={Phone}
                    disabled={isSaving}
                    className="w-full"
                />
            </div>

            <div className="pt-1 flex items-center justify-end">
                <Button
                    type="submit"
                    disabled={isSaving || isLoadingDoctors}
                    className="min-w-42.5 bg-linear-to-br from-blue-800 to-indigo-500 hover:from-blue-700 hover:to-indigo-400 text-white"
                >
                    {isSaving ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Creating appointment...
                        </>
                    ) : (
                        "Create appointment"
                    )}
                </Button>
            </div>
        </form>
    );
}
