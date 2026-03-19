'use client';

import { useEffect, useState } from "react";
import { useOptionalUser } from "@/lib/auth/user-context";
import { useAuth } from "@/hook/useAuth";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { LogOut } from "lucide-react";

// ──────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────
interface HeaderBarProps
{
  /** Page / section title shown in the left area */
  children: React.ReactNode;
}

// ──────────────────────────────────────────────
// Helper – generate avatar initials
// ──────────────────────────────────────────────
function getInitials(displayName: string | null, username: string | null): string
{
  const name = displayName ?? username ?? "U";
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2)
  {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

// ──────────────────────────────────────────────
// Helper – live clock
// ──────────────────────────────────────────────
function useLiveClock()
{
  // Start as null so the server renders nothing — avoids hydration mismatch
  // with the live time value which changes every second.
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() =>
  {
    setNow(new Date()); // populate immediately on mount
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  return now;
}

// ──────────────────────────────────────────────
// Main component
// ──────────────────────────────────────────────
export function HeaderBar({ children }: HeaderBarProps)
{
  const user = useOptionalUser();
  const now = useLiveClock();
  const { logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () =>
  {
    try
    {
      const result = await logout();
      if (result.success)
      {
        toast.success("Logged out successfully");
        router.push("/login");
      } else
      {
        toast.error(result.error || "Failed to logout");
      }
    } catch (error)
    {
      toast.error("An error occurred while logging out");
      console.error(error);
    }
  };

  const formattedDate = now?.toLocaleDateString("en-US", {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
  }) ?? "";

  const formattedTime = now?.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }) ?? "";

  const displayName = user?.displayName ?? user?.username ?? "Guest";
  const initials = getInitials(user?.displayName ?? null, user?.username ?? null);

  return (
    <header className="flex items-center justify-between px-7 h-16 gap-6 bg-white/70 backdrop-blur-xl border-b border-black/[0.07] shadow-sm sticky top-0 z-50 dark:bg-slate-900/80 dark:border-white/[0.06]">

      {/* ── Left: Page title ── */}
      <div className="flex items-center gap-2">
        <h1 className="m-0 leading-none text-[1.35rem] font-bold tracking-tight bg-gradient-to-br from-blue-800 to-indigo-500 bg-clip-text text-transparent dark:from-blue-400 dark:to-violet-400">
          {children}
        </h1>
      </div>

      {/* ── Right: date / time + avatar ── */}
      <div className="flex items-center gap-4 shrink-0">

        {/* Date & Time */}
        <div className="hidden sm:flex flex-col items-end gap-px leading-none">
          <span className="text-xs font-medium tracking-wide text-slate-500 dark:text-slate-400">
            {formattedDate}
          </span>
          <span className="text-sm font-semibold tabular-nums tracking-wide text-slate-700 dark:text-slate-200">
            {formattedTime}
          </span>
        </div>

        {/* Divider */}
        <div aria-hidden="true" className="w-px h-8 rounded-full bg-black/10 dark:bg-white/10" />

        {/* Profile */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <div
              title={displayName}
              className="group flex items-center gap-2.5 cursor-pointer px-3 py-1.5 rounded-full transition-colors duration-150 hover:bg-indigo-500/[0.08] dark:hover:bg-indigo-500/[0.15]"
            >
              {/* Avatar */}
              <div
                aria-label={`Avatar of ${displayName}`}
                className="size-9 shrink-0 rounded-full bg-gradient-to-br from-blue-800 to-indigo-500 text-white text-xs font-bold tracking-wider flex items-center justify-center shadow-[0_2px_8px_rgba(99,102,241,0.35)] transition-all duration-150 group-hover:shadow-[0_4px_14px_rgba(99,102,241,0.45)] group-hover:scale-105"
              >
                {initials}
              </div>

              {/* Username */}
              <span className="hidden sm:block text-sm font-semibold text-slate-800 dark:text-slate-100 max-w-[140px] truncate">
                {displayName}
              </span>
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem disabled className="flex flex-col items-start py-2">
              <span className="text-xs text-slate-500 dark:text-slate-400">{user?.username}</span>
              <span className="text-sm font-semibold text-slate-700 dark:text-slate-200 capitalize">
                {user?.role?.replace(/_/g, ' ')}
              </span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={handleLogout}
              className="flex items-center gap-2 font-bold text-red-600 dark:text-red-400 cursor-pointer hover:bg-red-50 dark:hover:bg-red-950/20"
            >
              <LogOut className="h-4 w-4" strokeWidth="3" />
              <span>Logout</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

      </div>
    </header>
  );
}
