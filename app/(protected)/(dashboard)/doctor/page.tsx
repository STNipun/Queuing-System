"use client";

import { useEffect, useState, useCallback } from "react";
import { DataTable } from "@/components/table/data-table";
import { columns, Patient } from "./table/columns";
import { ClipboardList, Pencil, X } from "lucide-react";
import { DiagnosisCard, PatientVisitData } from "@/components/ui/custom_ui/DiagnosisCard";
import { EditVisitForm } from "@/components/ui/custom_ui/EditVisitForm";
import { useRole } from "@/lib/auth/user-context";

interface PatientVisitResponse
{
    data: Patient[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

export default function DoctorPage()
{
    const role = useRole();

    const [visitData, setVisitData] = useState<PatientVisitResponse>({
        data: [],
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0,
    });
    const [isLoading, setIsLoading] = useState(true);
    const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });

    // ── Slide-over state ──────────────────────────────────────────────────────
    const [selectedVisit, setSelectedVisit] = useState<PatientVisitData | null>(null);
    const [panelMode, setPanelMode] = useState<"view" | "edit">("view");

    const fetchVisits = useCallback(async (page: number, limit: number) =>
    {
        setIsLoading(true);
        try
        {
            const res = await fetch(`/api/patient/visit?page=${page}&limit=${limit}`);
            const json: PatientVisitResponse = await res.json();
            setVisitData(json);
        }
        catch (err)
        {
            console.error("Failed to fetch patient visits:", err);
        }
        finally
        {
            setIsLoading(false);
        }
    }, []);

    useEffect(() =>
    {
        fetchVisits(pagination.pageIndex + 1, pagination.pageSize);
    }, [pagination, fetchVisits]);

    // First pending / in-progress visit for the top card
    const activeVisit = visitData.data.find(
        (v) => v.status === "pending" || v.status === "in-progress"
    ) as PatientVisitData | undefined;

    const handleViewRow = (row: Patient) =>
    {
        setSelectedVisit(row as PatientVisitData);
        setPanelMode("view");
    };

    const handleClosePanel = () =>
    {
        setSelectedVisit(null);
        setPanelMode("view");
    };

    /** After a successful PATCH, refresh the local list + update the open card */
    const handleUpdateSuccess = (updated: PatientVisitData) =>
    {
        // Update the selected visit shown in the panel
        setSelectedVisit(updated);
        setPanelMode("view");

        // Patch the table row in-place so we don't have to re-fetch
        setVisitData((prev) => ({
            ...prev,
            data: prev.data.map((v) =>
                v.id === updated.id ? (updated as unknown as Patient) : v
            ),
        }));
    };

    return (
        <div className="px-6 lg:px-10 py-6 space-y-8">
            {/* ── Page heading ── */}
            <div>
                <h2 className="text-2xl font-bold tracking-tight bg-gradient-to-br from-blue-800 to-indigo-500 bg-clip-text text-transparent dark:from-blue-400 dark:to-violet-400">
                    Doctor Dashboard
                </h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                    Overview of today&apos;s activity and full patient history.
                </p>
            </div>

            {/* ── Active visit Diagnosis Card ── */}
            {activeVisit ? (
                <DiagnosisCard
                    visitData={activeVisit}
                    onPrescription={() => { }}
                    onHistory={() => { }}
                    onLabOrders={() => { }}
                />
            ) : (
                !isLoading && (
                    <div className="rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 p-8 text-center text-slate-400 dark:text-slate-500 text-sm">
                        No active consultation at the moment.
                    </div>
                )
            )}

            {/* ── Patient History Table ── */}
            <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl rounded-2xl border border-black/[0.07] dark:border-white/[0.06] shadow-sm p-6">
                <div className="flex items-center gap-3 mb-5">
                    <div className="size-9 rounded-xl flex items-center justify-center bg-gradient-to-br from-blue-800 to-indigo-500 shadow">
                        <ClipboardList className="size-5 text-white" strokeWidth={1.8} />
                    </div>
                    <div>
                        <h3 className="font-bold text-slate-800 dark:text-slate-100 leading-tight">
                            Patient History
                        </h3>
                        <p className="text-xs text-slate-400">
                            All visits — searchable, filterable &amp; sortable
                        </p>
                    </div>
                </div>

                <DataTable
                    columns={columns}
                    data={visitData.data}
                    totalRows={visitData.total}
                    pageCount={visitData.totalPages}
                    isLoading={isLoading}
                    manualPagination={true}
                    filterColumn="patientName"
                    dropdownColumn="status"
                    dropdownOptions={["pending", "completed", "in-progress"]}
                    pagination={pagination}
                    onPaginationChange={setPagination}
                    onView={handleViewRow}
                />
            </div>

            {/* ── Slide-over panel ── */}
            {selectedVisit && (
                <>
                    {/* Backdrop */}
                    <div
                        className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
                        onClick={handleClosePanel}
                    />

                    {/* Panel */}
                    <div className="fixed right-0 top-0 z-50 h-full w-full max-w-lg overflow-y-auto bg-[#161b26] shadow-2xl border-l border-white/[0.08] flex flex-col">

                        {/* Panel header */}
                        <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.08] shrink-0">
                            <p className="text-sm font-semibold text-slate-200">
                                {panelMode === "view" ? "Patient Record" : "Edit Record"}
                            </p>

                            <div className="flex items-center gap-2">
                                {/* Edit / View toggle */}
                                {panelMode === "view" ? (
                                    <button
                                        onClick={() => setPanelMode("edit")}
                                        className="flex items-center gap-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/40 border border-emerald-500/30 px-3 py-1.5 text-xs font-semibold text-emerald-400 transition-colors"
                                        title="Edit this record"
                                    >
                                        <Pencil className="size-3.5" />
                                        Edit
                                    </button>
                                ) : (
                                    <button
                                        onClick={() => setPanelMode("view")}
                                        className="rounded-lg bg-slate-700/50 hover:bg-slate-700 border border-white/10 px-3 py-1.5 text-xs font-semibold text-slate-300 transition-colors"
                                    >
                                        View
                                    </button>
                                )}

                                {/* Close */}
                                <button
                                    onClick={handleClosePanel}
                                    className="rounded-lg p-1.5 text-slate-400 hover:bg-white/10 hover:text-white transition-colors"
                                    aria-label="Close panel"
                                >
                                    <X className="size-5" />
                                </button>
                            </div>
                        </div>

                        {/* Panel body */}
                        <div className="p-5 flex-1">
                            {panelMode === "view" ? (
                                <DiagnosisCard
                                    visitData={selectedVisit}
                                    className="rounded-xl"
                                    onPrescription={() => { }}
                                    onHistory={() => { }}
                                    onLabOrders={() => { }}
                                />
                            ) : (
                                <EditVisitForm
                                    visitData={selectedVisit}
                                    role={role}
                                    onSuccess={handleUpdateSuccess}
                                    onCancel={() => setPanelMode("view")}
                                />
                            )}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}