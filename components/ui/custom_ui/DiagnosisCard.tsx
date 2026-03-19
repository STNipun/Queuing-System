"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { ExternalLink } from "lucide-react";

// ─── DB-shaped type (mirrors PatientVisit Prisma model) ───────────────────────

export interface PatientVisitData
{
  id: string;
  patientName: string;
  age: number;
  gender: string;
  visitDate: string | Date;
  visitTime?: string;
  visitType?: string;
  diagnosis: string;        // comma-separated diagnoses, e.g. "Hypertension (I10), Elevated LDL"
  prescription?: string;
  status: string;
  notes?: string;
  allergies?: string | null;
  bloodType?: string | null;
  gp?: string | null;
}

// ─── Display-layer types ──────────────────────────────────────────────────────

export interface DiagnosisTag
{
  label: string;
  /** "confirmed" | "review" | "warning" – drives the pill colour */
  type?: "confirmed" | "review" | "warning";
}

export interface VitalStat
{
  value: string;
  unit: string;
  label: string;
  /** "red" | "amber" | "green" – drives the value colour */
  color?: "red" | "amber" | "green";
}

export interface DiagnosisCardProps
{
  // ── convenience: pass a DB row and everything is auto-mapped ──
  visitData?: PatientVisitData;

  // ── or supply every prop individually (static / custom use) ──
  name?: string;
  patientId?: string;
  dob?: string;
  gender?: string;
  statusLabel?: string;
  allergies?: string;
  bloodType?: string;
  lastVisit?: string;
  gp?: string;
  diagnosisTags?: DiagnosisTag[];
  vitals?: VitalStat[];
  note?: string;

  // ── action callbacks ──
  onPrescription?: () => void;
  onHistory?: () => void;
  onLabOrders?: () => void;

  className?: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getInitials(name: string): string
{
  return name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

function formatDate(d: string | Date): string
{
  const date = typeof d === "string" ? new Date(d) : d;
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

/** Split "Hypertension (I10), Palpitations — under review, Elevated LDL" into typed tags */
function parseDiagnosisTags(raw: string): DiagnosisTag[]
{
  return raw.split(",").map((part) =>
  {
    const label = part.trim();
    let type: DiagnosisTag["type"] = "confirmed";
    if (/under review|review|pending/i.test(label)) type = "review";
    else if (/elevated|high|abnormal|warning/i.test(label)) type = "warning";
    return { label, type };
  });
}

const tagStyles: Record<NonNullable<DiagnosisTag["type"]>, string> = {
  confirmed: "border border-cyan-400 text-cyan-300 bg-cyan-400/10",
  review: "border border-amber-400 text-amber-300 bg-amber-400/10",
  warning: "border border-rose-400 text-rose-300 bg-rose-400/10",
};

const vitalColors: Record<NonNullable<VitalStat["color"]>, string> = {
  red: "text-rose-400",
  amber: "text-amber-400",
  green: "text-green-400",
};

// ─── Component ────────────────────────────────────────────────────────────────

export function DiagnosisCard({
  visitData,
  name: nameProp,
  patientId: patientIdProp,
  dob: dobProp,
  gender: genderProp,
  statusLabel: statusLabelProp,
  allergies: allergiesProp,
  bloodType: bloodTypeProp,
  lastVisit: lastVisitProp,
  gp: gpProp,
  diagnosisTags: diagnosisTagsProp,
  vitals,
  note: noteProp,
  onPrescription,
  onHistory,
  onLabOrders,
  className,
}: DiagnosisCardProps)
{
  // ── auto-map visitData → display values ──
  const name = visitData?.patientName ?? nameProp ?? "Unknown";
  const patientId = visitData?.id ?? patientIdProp ?? "";
  const dob = visitData
    ? `${visitData.age} yrs`
    : (dobProp ?? "—");
  const gender = visitData?.gender ?? genderProp ?? "—";
  const statusLabel = visitData
    ? visitData.status.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
    : (statusLabelProp ?? "In consultation");
  const allergies = visitData?.allergies ?? allergiesProp ?? "—";
  const bloodType = visitData?.bloodType ?? bloodTypeProp ?? "—";
  const lastVisit = visitData
    ? formatDate(visitData.visitDate)
    : (lastVisitProp ?? "—");
  const gp = visitData?.gp ?? gpProp ?? "—";
  const note = visitData?.notes ?? noteProp;
  const diagnosisTags = visitData
    ? parseDiagnosisTags(visitData.diagnosis)
    : (diagnosisTagsProp ?? []);

  const statusColorClass =
    visitData?.status === "in-progress" || visitData?.status === "pending"
      ? "bg-emerald-500"
      : "bg-slate-500";

  return (
    <div
      className={cn(
        "rounded-2xl overflow-hidden bg-[#1e2330] text-slate-100 border border-white/[0.08] shadow-xl w-full",
        className
      )}
    >
      {/* ── Header ── */}
      <div className="flex items-center justify-between gap-4 px-5 py-4 bg-emerald-900/30 border-b border-white/[0.07]">
        <div className="flex items-center gap-3.5">
          <div className="size-11 rounded-full bg-emerald-600 flex items-center justify-center text-white font-bold text-sm shrink-0">
            {getInitials(name)}
          </div>
          <div>
            <p className="font-bold text-base leading-tight">{name}</p>
            <p className="text-xs text-emerald-400 mt-0.5">
              {patientId && <span>{patientId}&nbsp;·&nbsp;</span>}
              {dob}&nbsp;·&nbsp;{gender}
            </p>
          </div>
        </div>
        <span className={cn("shrink-0 rounded-full text-white text-xs font-semibold px-3.5 py-1.5", statusColorClass)}>
          {statusLabel}
        </span>
      </div>

      {/* ── Info grid ── */}
      <div className="grid grid-cols-2 gap-x-6 gap-y-4 px-5 py-4 border-b border-white/[0.07]">
        {[
          { label: "Allergies", value: allergies },
          { label: "Blood Type", value: bloodType },
          { label: "Last Visit", value: lastVisit },
          { label: "GP", value: gp },
        ].map(({ label, value }) => (
          <div key={label}>
            <p className="text-[10px] font-semibold tracking-widest text-slate-400 uppercase mb-0.5">
              {label}
            </p>
            <p className="text-sm font-semibold">{value}</p>
          </div>
        ))}
      </div>

      {/* ── Chief Complaint & Diagnosis ── */}
      {diagnosisTags.length > 0 && (
        <div className="px-5 py-4 border-b border-white/[0.07]">
          <p className="text-[10px] font-semibold tracking-widest text-slate-400 uppercase mb-2.5">
            Chief Complaint &amp; Diagnosis
          </p>
          <div className="flex flex-wrap gap-2">
            {diagnosisTags.map((tag, i) => (
              <span
                key={i}
                className={cn(
                  "rounded-full px-3 py-1 text-xs font-medium",
                  tagStyles[tag.type ?? "confirmed"]
                )}
              >
                {tag.label}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* ── Vitals ── */}
      {vitals && vitals.length > 0 && (
        <div className="grid grid-cols-3 gap-px border-b border-white/[0.07]">
          {vitals.map((v, i) => (
            <div
              key={i}
              className="flex flex-col items-center justify-center py-4 px-2 bg-[#1a1f2b]"
            >
              <span className={cn("text-2xl font-bold tabular-nums leading-none", vitalColors[v.color ?? "amber"])}>
                {v.value}
              </span>
              <span className="text-[11px] text-slate-400 mt-1">{v.unit}</span>
              <span className="text-[11px] text-slate-400">{v.label}</span>
            </div>
          ))}
        </div>
      )}

      {/* ── Clinical Note ── */}
      {note && (
        <div className="px-5 py-4 border-b border-white/[0.07]">
          <div className="flex gap-3">
            <div className="w-1 rounded-full bg-emerald-500 shrink-0" />
            <p className="text-sm text-slate-300 leading-relaxed">{note}</p>
          </div>
        </div>
      )}

      {/* ── Prescription (if available from DB) ── */}
      {visitData?.prescription && (
        <div className="px-5 py-4 border-b border-white/[0.07]">
          <p className="text-[10px] font-semibold tracking-widest text-slate-400 uppercase mb-1">
            Prescription
          </p>
          <p className="text-sm text-slate-300">{visitData.prescription}</p>
        </div>
      )}

      {/* ── Action Buttons ── */}
      <div className="flex items-center gap-3 px-5 py-4">
        {[
          { label: "Prescription", onClick: onPrescription },
          { label: "History", onClick: onHistory },
          { label: "Lab orders", onClick: onLabOrders },
        ].map(({ label, onClick }) => (
          <button
            key={label}
            onClick={onClick}
            className="flex items-center gap-1.5 rounded-lg border border-white/20 bg-white/5 hover:bg-white/10 active:scale-95 transition-all duration-150 px-4 py-2 text-sm font-medium text-slate-200"
          >
            {label}
            <ExternalLink className="size-3.5 opacity-60" />
          </button>
        ))}
      </div>
    </div>
  );
}
