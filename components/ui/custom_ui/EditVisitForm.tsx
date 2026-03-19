"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { Loader2, Save } from "lucide-react";
import { PatientVisitData } from "./DiagnosisCard";
import { toast } from "sonner";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface EditVisitFormProps
{
    /** The current visit data to pre-populate the form */
    visitData: PatientVisitData;
    /** Caller's role – determines which field-set is shown */
    role: string | null;
    /** Called with the refreshed visit after a successful save */
    onSuccess: (updated: PatientVisitData) => void;
    /** Called when the user cancels */
    onCancel: () => void;
    className?: string;
}

// ─── Shared field wrapper ─────────────────────────────────────────────────────

function Field({ label, children }: { label: string; children: React.ReactNode })
{
    return (
        <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-semibold tracking-widest text-slate-400 uppercase">
                {label}
            </label>
            {children}
        </div>
    );
}

const inputCls =
    "w-full rounded-lg bg-white/5 border border-white/10 text-slate-100 text-sm px-3 py-2 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/60 transition-colors";
const textareaCls = cn(inputCls, "resize-none min-h-[80px]");

// ─── Component ────────────────────────────────────────────────────────────────

export function EditVisitForm({
    visitData,
    role,
    onSuccess,
    onCancel,
    className,
}: EditVisitFormProps)
{
    const isDoctor = role === "doctor";
    const [saving, setSaving] = useState(false);

    // ── Doctor form state ─────────────────────────────────────────────────────
    const [status, setStatus] = useState(visitData.status ?? "pending");
    const [diagnosis, setDiagnosis] = useState(visitData.diagnosis ?? "");
    const [prescription, setPrescription] = useState(visitData.prescription ?? "");
    const [notes, setNotes] = useState(visitData.notes ?? "");

    // ── Admin / front-desk form state ─────────────────────────────────────────
    const [patientName, setPatientName] = useState(visitData.patientName ?? "");
    const [age, setAge] = useState(String(visitData.age ?? ""));
    const [gender, setGender] = useState(visitData.gender ?? "");
    const rawDate = visitData.visitDate
        ? new Date(visitData.visitDate).toISOString().slice(0, 10)
        : "";
    const [visitDate, setVisitDate] = useState(rawDate);
    const [visitTime, setVisitTime] = useState(visitData.visitTime ?? "");
    const [visitType, setVisitType] = useState(visitData.visitType ?? "");
    const [allergies, setAllergies] = useState(visitData.allergies ?? "");
    const [bloodType, setBloodType] = useState(visitData.bloodType ?? "");
    const [gp, setGp] = useState(visitData.gp ?? "");

    // ── Submit ────────────────────────────────────────────────────────────────

    async function handleSubmit(e: React.FormEvent)
    {
        e.preventDefault();
        setSaving(true);

        try
        {
            const payload = isDoctor
                ? { status, diagnosis, prescription, notes }
                : { patientName, age: Number(age), gender, visitDate, visitTime, visitType, allergies, bloodType, gp };

            const res = await fetch(`/api/patient/visit/${visitData.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            if (!res.ok)
            {
                const err = await res.json();
                toast.error(err.error ?? "Update failed");
                return;
            }

            const updated: PatientVisitData = await res.json();
            toast.success("Patient record updated");
            onSuccess(updated);
        }
        catch (err)
        {
            console.error(err);
            toast.error("Something went wrong");
        }
        finally
        {
            setSaving(false);
        }
    }

    return (
        <form
            onSubmit={handleSubmit}
            className={cn("flex flex-col gap-5", className)}
        >
            {/* ── Section header ── */}
            <div className="px-1">
                <p className="text-xs font-semibold text-slate-300">
                    {isDoctor ? "Update Clinical Information" : "Update Patient Details"}
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                    {isDoctor
                        ? "Only diagnosis-related fields are editable for your role."
                        : "Only patient & scheduling details are editable for your role."}
                </p>
            </div>

            {/* ── Doctor fields ── */}
            {isDoctor && (
                <>
                    <Field label="Status">
                        <select
                            value={status}
                            onChange={(e) => setStatus(e.target.value)}
                            className={inputCls}
                        >
                            <option value="pending">Pending</option>
                            <option value="in-progress">In Progress</option>
                            <option value="completed">Completed</option>
                        </select>
                    </Field>

                    <Field label="Diagnosis">
                        <textarea
                            value={diagnosis}
                            onChange={(e) => setDiagnosis(e.target.value)}
                            placeholder="e.g. Hypertension (I10), Elevated LDL"
                            className={textareaCls}
                            rows={3}
                        />
                        <p className="text-[10px] text-slate-500">
                            Separate multiple diagnoses with a comma.
                        </p>
                    </Field>

                    <Field label="Prescription">
                        <textarea
                            value={prescription}
                            onChange={(e) => setPrescription(e.target.value)}
                            placeholder="e.g. Amlodipine 5mg once daily"
                            className={textareaCls}
                            rows={3}
                        />
                    </Field>

                    <Field label="Clinical Notes">
                        <textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="Additional observations or instructions…"
                            className={textareaCls}
                            rows={4}
                        />
                    </Field>
                </>
            )}

            {/* ── Admin / Front-desk fields ── */}
            {!isDoctor && (
                <>
                    <Field label="Patient Name">
                        <input
                            type="text"
                            value={patientName}
                            onChange={(e) => setPatientName(e.target.value)}
                            className={inputCls}
                        />
                    </Field>

                    <div className="grid grid-cols-2 gap-4">
                        <Field label="Age">
                            <input
                                type="number"
                                min={0}
                                max={150}
                                value={age}
                                onChange={(e) => setAge(e.target.value)}
                                className={inputCls}
                            />
                        </Field>

                        <Field label="Gender">
                            <select
                                value={gender}
                                onChange={(e) => setGender(e.target.value)}
                                className={inputCls}
                            >
                                <option value="">Select…</option>
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                                <option value="Other">Other</option>
                            </select>
                        </Field>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <Field label="Visit Date">
                            <input
                                type="date"
                                value={visitDate}
                                onChange={(e) => setVisitDate(e.target.value)}
                                className={inputCls}
                            />
                        </Field>

                        <Field label="Visit Time">
                            <input
                                type="time"
                                value={visitTime}
                                onChange={(e) => setVisitTime(e.target.value)}
                                className={inputCls}
                            />
                        </Field>
                    </div>

                    <Field label="Visit Type">
                        <input
                            type="text"
                            value={visitType}
                            onChange={(e) => setVisitType(e.target.value)}
                            className={inputCls}
                            placeholder="e.g. consultation, follow-up"
                        />
                    </Field>

                    <div className="grid grid-cols-2 gap-4">
                        <Field label="Allergies">
                            <input
                                type="text"
                                value={allergies}
                                onChange={(e) => setAllergies(e.target.value)}
                                className={inputCls}
                                placeholder="e.g. Penicillin"
                            />
                        </Field>

                        <Field label="Blood Type">
                            <input
                                type="text"
                                value={bloodType}
                                onChange={(e) => setBloodType(e.target.value)}
                                className={inputCls}
                                placeholder="e.g. O+"
                            />
                        </Field>
                    </div>

                    <Field label="GP">
                        <input
                            type="text"
                            value={gp}
                            onChange={(e) => setGp(e.target.value)}
                            className={inputCls}
                            placeholder="e.g. Dr. M. Perera"
                        />
                    </Field>
                </>
            )}

            {/* ── Actions ── */}
            <div className="flex items-center gap-3 pt-1">
                <button
                    type="submit"
                    disabled={saving}
                    className="flex items-center gap-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 active:scale-95 transition-all duration-150 px-5 py-2 text-sm font-semibold text-white"
                >
                    {saving
                        ? <Loader2 className="size-4 animate-spin" />
                        : <Save className="size-4" />
                    }
                    {saving ? "Saving…" : "Save changes"}
                </button>

                <button
                    type="button"
                    onClick={onCancel}
                    disabled={saving}
                    className="rounded-lg border border-white/20 bg-white/5 hover:bg-white/10 active:scale-95 transition-all duration-150 px-5 py-2 text-sm font-medium text-slate-300"
                >
                    Cancel
                </button>
            </div>
        </form>
    );
}
