

interface PatientCountCardProps
{
    label?: string;
    count: number;
    className?: string;
    children: React.ReactNode;
}

export function PatientCountCard({
    label = "",
    count,
    className = "",
    children
}: PatientCountCardProps)
{
    return (
        <div className={`relative overflow-hidden rounded-2xl p-6 flex items-center gap-5 bg-white/70 backdrop-blur-xl border border-black/[0.07] shadow-[0_4px_24px_rgba(99,102,241,0.10)] transition-all duration-200 hover:shadow-[0_8px_32px_rgba(99,102,241,0.18)] hover:-translate-y-0.5 dark:bg-slate-900/70 dark:border-white/[0.06] ${className}`}>
            {/* Background glow blob */}
            <div
                aria-hidden="true"
                className="absolute -top-6 -right-6 size-28 rounded-full bg-gradient-to-br from-blue-600 to-indigo-500 opacity-10 blur-2xl pointer-events-none"
            />

            {/* Icon */}
            <div className="shrink-0 size-14 rounded-xl flex items-center justify-center bg-gradient-to-br from-blue-800 to-indigo-500 shadow-[0_4px_14px_rgba(99,102,241,0.35)]">
                {children}
            </div>

            {/* Text */}
            <div className="flex flex-col gap-0.5 min-w-0">
                <span className="text-4xl font-bold tabular-nums tracking-tight bg-gradient-to-br from-blue-800 to-indigo-500 bg-clip-text text-transparent dark:from-blue-400 dark:to-violet-400">
                    {count}
                </span>
                <span className="text-sm font-medium text-slate-500 dark:text-slate-400 truncate">
                    {label}
                </span>
            </div>
        </div>
    );
}
