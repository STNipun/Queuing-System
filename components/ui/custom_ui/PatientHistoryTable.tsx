'use client';

import * as React from "react";
import {
    ColumnDef,
    ColumnFiltersState,
    SortingState,
    VisibilityState,
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    useReactTable,
    FilterFn,
    Row,
} from "@tanstack/react-table";
import {
    ArrowUpDown,
    ArrowUp,
    ArrowDown,
    Search,
    CalendarRange,
    X,
    Eye,
    SlidersHorizontal,
    CheckCircle2,
    Clock,
    AlertCircle,
    XCircle,
    FlaskConical,
    Stethoscope,
    Pill,
    User,
    ChevronLeft,
    ChevronRight,
    ChevronsLeft,
    ChevronsRight,
} from "lucide-react";

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────
export type VisitStatus = "completed" | "pending" | "cancelled" | "in-progress";
export type VisitType = "consultation" | "follow-up" | "lab" | "procedure";

export interface PatientVisit
{
    id: string;
    patientName: string;
    age: number;
    gender: "Male" | "Female" | "Other";
    visitDate: string;
    visitTime: string;
    visitType: VisitType;
    diagnosis: string;
    prescription: string;
    status: VisitStatus;
    notes?: string;
}

// ─────────────────────────────────────────────
// Config maps
// ─────────────────────────────────────────────
const statusConfig: Record<VisitStatus, { label: string; icon: React.ElementType; classes: string }> = {
    completed:    { label: "Completed",   icon: CheckCircle2, classes: "bg-emerald-50 text-emerald-700 ring-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:ring-emerald-800" },
    pending:      { label: "Pending",     icon: Clock,        classes: "bg-amber-50 text-amber-700 ring-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:ring-amber-800" },
    "in-progress":{ label: "In Progress", icon: AlertCircle,  classes: "bg-blue-50 text-blue-700 ring-blue-200 dark:bg-blue-950/40 dark:text-blue-400 dark:ring-blue-800" },
    cancelled:    { label: "Cancelled",   icon: XCircle,      classes: "bg-red-50 text-red-700 ring-red-200 dark:bg-red-950/40 dark:text-red-400 dark:ring-red-800" },
};

const visitTypeConfig: Record<VisitType, { label: string; icon: React.ElementType; classes: string }> = {
    consultation: { label: "Consultation", icon: Stethoscope,  classes: "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300" },
    "follow-up":  { label: "Follow-Up",    icon: User,         classes: "bg-violet-50 text-violet-700 dark:bg-violet-950/40 dark:text-violet-300" },
    lab:          { label: "Lab",          icon: FlaskConical, classes: "bg-cyan-50 text-cyan-700 dark:bg-cyan-950/40 dark:text-cyan-300" },
    procedure:    { label: "Procedure",    icon: Pill,         classes: "bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300" },
};

// ─────────────────────────────────────────────
// Small badge components
// ─────────────────────────────────────────────
function StatusBadge({ status }: { status: VisitStatus })
{
    const cfg = statusConfig[status];
    const Icon = cfg.icon;
    return (
        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ring-1 ring-inset whitespace-nowrap ${cfg.classes}`}>
            <Icon className="size-3" />
            {cfg.label}
        </span>
    );
}

function TypeBadge({ type }: { type: VisitType })
{
    const cfg = visitTypeConfig[type];
    const Icon = cfg.icon;
    return (
        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-medium whitespace-nowrap ${cfg.classes}`}>
            <Icon className="size-3" />
            {cfg.label}
        </span>
    );
}

// ─────────────────────────────────────────────
// Sortable column header helper
// ─────────────────────────────────────────────
function SortableHeader({ column, children }: { column: any; children: React.ReactNode })
{
    const sorted = column.getIsSorted();
    return (
        <button
            onClick={() => column.toggleSorting(sorted === "asc")}
            className="inline-flex items-center gap-1 group"
        >
            {children}
            {sorted === "asc"  ? <ArrowUp   className="size-3.5 opacity-80" /> :
             sorted === "desc" ? <ArrowDown className="size-3.5 opacity-80" /> :
                                 <ArrowUpDown className="size-3.5 opacity-30 group-hover:opacity-60 transition-opacity" />}
        </button>
    );
}

// ─────────────────────────────────────────────
// Detail modal
// ─────────────────────────────────────────────
function DetailModal({ visit, onClose }: { visit: PatientVisit; onClose: () => void })
{
    // Close on Escape
    React.useEffect(() =>
    {
        const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
        document.addEventListener("keydown", handler);
        return () => document.removeEventListener("keydown", handler);
    }, [onClose]);

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
            onClick={(e) => e.target === e.currentTarget && onClose()}
        >
            <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-black/[0.07] dark:border-white/[0.08] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-blue-800 to-indigo-500">
                    <div>
                        <h2 className="text-lg font-bold text-white">{visit.patientName}</h2>
                        <p className="text-sm text-blue-100">
                            {visit.age} yrs • {visit.gender} •{" "}
                            {new Date(visit.visitDate).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })} at {visit.visitTime}
                        </p>
                    </div>
                    <button onClick={onClose} className="size-8 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors">
                        <X className="size-4" />
                    </button>
                </div>
                <div className="px-6 py-5 space-y-4">
                    <div className="flex gap-3 flex-wrap">
                        <TypeBadge type={visit.visitType} />
                        <StatusBadge status={visit.status} />
                    </div>
                    {[
                        { label: "Diagnosis",    value: visit.diagnosis },
                        { label: "Prescription", value: visit.prescription },
                        ...(visit.notes ? [{ label: "Notes", value: visit.notes }] : []),
                    ].map(({ label, value }) => (
                        <div key={label}>
                            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500 mb-0.5">{label}</p>
                            <p className="text-sm text-slate-700 dark:text-slate-200">{value}</p>
                        </div>
                    ))}
                </div>
                <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/50 flex justify-end">
                    <button onClick={onClose} className="px-5 py-2 rounded-xl text-sm font-semibold bg-gradient-to-r from-blue-800 to-indigo-500 text-white shadow hover:opacity-90 transition-opacity">
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}

// ─────────────────────────────────────────────
// Custom global filter fn – searches name/diagnosis/prescription
// ─────────────────────────────────────────────
const globalSearchFn: FilterFn<PatientVisit> = (row, _columnId, filterValue: string) =>
{
    const q = filterValue.toLowerCase();
    return (
        row.original.patientName.toLowerCase().includes(q) ||
        row.original.diagnosis.toLowerCase().includes(q) ||
        row.original.prescription.toLowerCase().includes(q)
    );
};
globalSearchFn.autoRemove = (val: string) => !val;

// ─────────────────────────────────────────────
// Column definitions
// ─────────────────────────────────────────────
function buildColumns(onView: (v: PatientVisit) => void): ColumnDef<PatientVisit>[]
{
    return [
        // Patient
        {
            id: "patientName",
            accessorKey: "patientName",
            header: ({ column }) => <SortableHeader column={column}>Patient</SortableHeader>,
            cell: ({ row }) =>
            {
                const v = row.original;
                const initials = v.patientName.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase();
                return (
                    <div className="flex items-center gap-3">
                        <div className="size-9 shrink-0 rounded-full bg-gradient-to-br from-blue-800 to-indigo-500 text-white text-xs font-bold flex items-center justify-center shadow-sm">
                            {initials}
                        </div>
                        <div>
                            <p className="font-semibold text-slate-800 dark:text-slate-100 whitespace-nowrap">{v.patientName}</p>
                            <p className="text-xs text-slate-400">{v.age} yrs • {v.gender}</p>
                        </div>
                    </div>
                );
            },
            filterFn: "includesString",
            enableHiding: false,
        },

        // Date
        {
            id: "visitDate",
            accessorKey: "visitDate",
            header: ({ column }) => <SortableHeader column={column}>Date / Time</SortableHeader>,
            cell: ({ row }) =>
            {
                const v = row.original;
                return (
                    <div className="whitespace-nowrap">
                        <p className="font-medium text-slate-700 dark:text-slate-200">
                            {new Date(v.visitDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                        </p>
                        <p className="text-xs text-slate-400">{v.visitTime}</p>
                    </div>
                );
            },
        },

        // Visit Type
        {
            id: "visitType",
            accessorKey: "visitType",
            header: ({ column }) => <SortableHeader column={column}>Type</SortableHeader>,
            cell: ({ row }) => <TypeBadge type={row.original.visitType} />,
        },

        // Diagnosis
        {
            id: "diagnosis",
            accessorKey: "diagnosis",
            header: "Diagnosis",
            cell: ({ row }) => (
                <p className="max-w-[200px] truncate text-slate-600 dark:text-slate-300">{row.original.diagnosis}</p>
            ),
        },

        // Status
        {
            id: "status",
            accessorKey: "status",
            header: ({ column }) => <SortableHeader column={column}>Status</SortableHeader>,
            cell: ({ row }) => <StatusBadge status={row.original.status} />,
            filterFn: (row, _id, value) => value === "all" || row.original.status === value,
        },

        // Actions
        {
            id: "actions",
            enableHiding: false,
            enableSorting: false,
            cell: ({ row }) => (
                <button
                    onClick={() => onView(row.original)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 transition-colors"
                >
                    <Eye className="size-3.5" />
                    View
                </button>
            ),
        },
    ];
}

// ─────────────────────────────────────────────
// Pagination bar
// ─────────────────────────────────────────────
function PaginationBar({ table }: { table: ReturnType<typeof useReactTable<PatientVisit>> })
{
    return (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-4">
            {/* Record count */}
            <p className="text-xs text-slate-400 order-2 sm:order-1">
                Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()} •{" "}
                {table.getFilteredRowModel().rows.length} record{table.getFilteredRowModel().rows.length !== 1 ? "s" : ""}
            </p>

            <div className="flex items-center gap-2 order-1 sm:order-2">
                {/* Page size */}
                <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-500 hidden sm:block">Rows</span>
                    <Select
                        value={String(table.getState().pagination.pageSize)}
                        onValueChange={(v) => table.setPageSize(Number(v))}
                    >
                        <SelectTrigger className="h-8 w-16 text-xs rounded-lg border-black/[0.09] dark:border-white/[0.09]">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {[5, 8, 10, 20].map(n => (
                                <SelectItem key={n} value={String(n)} className="text-xs">{n}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {/* Nav buttons */}
                <div className="flex gap-1">
                    {[
                        { icon: ChevronsLeft,  action: () => table.setPageIndex(0),            disabled: !table.getCanPreviousPage(), label: "First" },
                        { icon: ChevronLeft,   action: () => table.previousPage(),              disabled: !table.getCanPreviousPage(), label: "Prev"  },
                        { icon: ChevronRight,  action: () => table.nextPage(),                  disabled: !table.getCanNextPage(),     label: "Next"  },
                        { icon: ChevronsRight, action: () => table.setPageIndex(table.getPageCount() - 1), disabled: !table.getCanNextPage(), label: "Last" },
                    ].map(({ icon: Icon, action, disabled, label }) => (
                        <button
                            key={label}
                            onClick={action}
                            disabled={disabled}
                            title={label}
                            className="size-8 flex items-center justify-center rounded-lg border border-black/[0.09] dark:border-white/[0.09] disabled:opacity-35 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors text-slate-600 dark:text-slate-300"
                        >
                            <Icon className="size-3.5" />
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}

// ─────────────────────────────────────────────
// Main exported component
// ─────────────────────────────────────────────
const STATUS_OPTIONS: Array<"all" | VisitStatus> = ["all", "completed", "pending", "in-progress", "cancelled"];

interface PatientHistoryTableProps { visits: PatientVisit[] }

export function PatientHistoryTable({ visits }: PatientHistoryTableProps)
{
    const [selectedVisit, setSelectedVisit] = React.useState<PatientVisit | null>(null);

    // Filter state
    const [globalFilter,  setGlobalFilter]  = React.useState("");
    const [statusFilter,  setStatusFilter]  = React.useState<"all" | VisitStatus>("all");
    const [dateFrom,      setDateFrom]      = React.useState("");
    const [dateTo,        setDateTo]        = React.useState("");

    // TanStack state
    const [sorting,           setSorting]           = React.useState<SortingState>([{ id: "visitDate", desc: true }]);
    const [columnFilters,     setColumnFilters]     = React.useState<ColumnFiltersState>([]);
    const [columnVisibility,  setColumnVisibility]  = React.useState<VisibilityState>({});

    const hasActiveFilters = globalFilter !== "" || statusFilter !== "all" || dateFrom !== "" || dateTo !== "";

    const clearAll = () =>
    {
        setGlobalFilter("");
        setStatusFilter("all");
        setDateFrom("");
        setDateTo("");
        setColumnFilters([]);
        table.setPageIndex(0);
    };

    // Apply date + status filters as a pre-filtered data array so TanStack
    // handles the rest (sort / paginate / column-filter) on top.
    const filteredData = React.useMemo(() =>
    {
        return visits.filter(v =>
        {
            if (statusFilter !== "all" && v.status !== statusFilter) return false;
            if (dateFrom && v.visitDate < dateFrom) return false;
            if (dateTo   && v.visitDate > dateTo)   return false;
            return true;
        });
    }, [visits, statusFilter, dateFrom, dateTo]);

    const columns = React.useMemo(() => buildColumns(setSelectedVisit), []);

    const table = useReactTable({
        data: filteredData,
        columns,
        state: { sorting, columnFilters, columnVisibility, globalFilter },
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        onColumnVisibilityChange: setColumnVisibility,
        onGlobalFilterChange: setGlobalFilter,
        globalFilterFn: globalSearchFn,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        initialState: { pagination: { pageSize: 8 } },
    });

    return (
        <>
            {/* ── Controls ── */}
            <div className="flex flex-col gap-3 mb-4">

                {/* Row 1: Search + column visibility */}
                <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400 pointer-events-none" />
                        <input
                            type="text"
                            placeholder="Search patient, diagnosis…"
                            value={globalFilter}
                            onChange={e => { setGlobalFilter(e.target.value); table.setPageIndex(0); }}
                            className="w-full pl-9 pr-4 py-2.5 text-sm rounded-xl border border-black/[0.09] dark:border-white/[0.09] bg-white/80 dark:bg-slate-900/70 backdrop-blur focus:outline-none focus:ring-2 focus:ring-indigo-400/60 dark:text-slate-100 transition"
                        />
                    </div>

                    {/* Column-visibility toggle */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" className="gap-2 rounded-xl border-black/[0.09] dark:border-white/[0.09] bg-white/70 dark:bg-slate-800/70 text-slate-600 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/20">
                                <SlidersHorizontal className="size-4" />
                                <span className="hidden sm:inline text-sm">Columns</span>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-44">
                            <DropdownMenuLabel className="text-xs text-slate-400 font-normal">Toggle columns</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            {table.getAllColumns()
                                .filter(col => col.getCanHide())
                                .map(col => (
                                    <DropdownMenuCheckboxItem
                                        key={col.id}
                                        className="capitalize text-sm"
                                        checked={col.getIsVisible()}
                                        onCheckedChange={v => col.toggleVisibility(!!v)}
                                    >
                                        {col.id.replace(/([A-Z])/g, " $1")}
                                    </DropdownMenuCheckboxItem>
                                ))
                            }
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>

                {/* Row 2: Status pills */}
                <div className="flex gap-1.5 flex-wrap">
                    {STATUS_OPTIONS.map(s => (
                        <button
                            key={s}
                            onClick={() => { setStatusFilter(s); table.setPageIndex(0); }}
                            className={`px-3 py-2 rounded-xl text-xs font-semibold capitalize transition-all
                                ${statusFilter === s
                                    ? "bg-gradient-to-r from-blue-800 to-indigo-500 text-white shadow"
                                    : "bg-white/70 dark:bg-slate-800/70 text-slate-500 dark:text-slate-400 border border-black/[0.08] dark:border-white/[0.08] hover:bg-indigo-50 dark:hover:bg-indigo-900/20"
                                }`}
                        >
                            {s === "all" ? "All" : statusConfig[s].label}
                        </button>
                    ))}
                </div>

                {/* Row 3: Date range + clear-all */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                    <div className="flex items-center gap-2 flex-wrap">
                        <CalendarRange className="size-4 text-slate-400 shrink-0" />
                        <span className="text-xs font-medium text-slate-500 dark:text-slate-400">From</span>
                        <input
                            type="date"
                            value={dateFrom}
                            max={dateTo || undefined}
                            onChange={e => { setDateFrom(e.target.value); table.setPageIndex(0); }}
                            className="px-3 py-2 text-sm rounded-xl border border-black/[0.09] dark:border-white/[0.09] bg-white/80 dark:bg-slate-900/70 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-400/60 transition cursor-pointer"
                        />
                        <span className="text-xs font-medium text-slate-500 dark:text-slate-400">To</span>
                        <input
                            type="date"
                            value={dateTo}
                            min={dateFrom || undefined}
                            onChange={e => { setDateTo(e.target.value); table.setPageIndex(0); }}
                            className="px-3 py-2 text-sm rounded-xl border border-black/[0.09] dark:border-white/[0.09] bg-white/80 dark:bg-slate-900/70 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-400/60 transition cursor-pointer"
                        />
                        {(dateFrom || dateTo) && (
                            <button
                                onClick={() => { setDateFrom(""); setDateTo(""); table.setPageIndex(0); }}
                                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                            >
                                <X className="size-3" /> Clear dates
                            </button>
                        )}
                    </div>

                    {hasActiveFilters && (
                        <button
                            onClick={clearAll}
                            className="ml-auto inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30 hover:bg-red-100 dark:hover:bg-red-900/40 ring-1 ring-red-200 dark:ring-red-800 transition-colors"
                        >
                            <X className="size-3" />
                            Clear all filters
                        </button>
                    )}
                </div>

            </div>

            {/* ── TanStack Table ── */}
            <div className="overflow-x-auto rounded-2xl border border-black/[0.07] dark:border-white/[0.07] shadow-sm">
                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map(headerGroup => (
                            <TableRow key={headerGroup.id} className="bg-gradient-to-r from-blue-800/90 to-indigo-500/90 hover:from-blue-800/90 hover:to-indigo-500/90 border-none">
                                {headerGroup.headers.map(header => (
                                    <TableHead
                                        key={header.id}
                                        className="text-white text-xs font-semibold uppercase tracking-wider py-3.5 select-none whitespace-nowrap"
                                    >
                                        {header.isPlaceholder
                                            ? null
                                            : flexRender(header.column.columnDef.header, header.getContext())}
                                    </TableHead>
                                ))}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {table.getRowModel().rows.length > 0
                            ? table.getRowModel().rows.map((row, idx) => (
                                <TableRow
                                    key={row.id}
                                    className={`transition-colors hover:bg-indigo-50/60 dark:hover:bg-indigo-900/20 border-black/[0.04] dark:border-white/[0.04]
                                        ${idx % 2 === 0 ? "bg-white/60 dark:bg-slate-900/50" : "bg-slate-50/60 dark:bg-slate-800/40"}`}
                                >
                                    {row.getVisibleCells().map(cell => (
                                        <TableCell key={cell.id} className="py-3.5">
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                            : (
                                <TableRow>
                                    <TableCell colSpan={columns.length} className="py-16 text-center text-slate-400 dark:text-slate-600">
                                        <User className="size-10 mx-auto mb-2 opacity-30" />
                                        No patients found
                                    </TableCell>
                                </TableRow>
                            )
                        }
                    </TableBody>
                </Table>
            </div>

            {/* ── Pagination ── */}
            <PaginationBar table={table} />

            {/* ── Detail Modal ── */}
            {selectedVisit && <DetailModal visit={selectedVisit} onClose={() => setSelectedVisit(null)} />}
        </>
    );
}
