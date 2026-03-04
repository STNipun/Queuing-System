import { useState, useEffect, useCallback, useRef } from "react";

export type UseResendCooldownOptions = {
    cooldownTime?: number; // seconds
    storageKey?: string;
};

type UseResendCooldownReturn = {
    cooldown: number;
    isOnCooldown: boolean;
    startCooldown: () => void;
    resetCooldown: () => void;
    formatTime: (seconds: number) => string;
};

export function useResendCooldown(
    options: UseResendCooldownOptions = {}
): UseResendCooldownReturn
{
    const { cooldownTime = 60, storageKey = "resend-cooldown" } = options;

    // Value init before render to avoid any UI flicker
    const [cooldown, setCooldown] = useState(() =>
    {
        //if rendering on server, return 0
        if (typeof window === "undefined") return 0;

        const stored = localStorage.getItem(storageKey);
        if (!stored) return 0;

        const expiresAt = Number(stored);
        const remaining = Math.floor((expiresAt - Date.now()) / 1000);
        if (remaining <= 0)
        {
            localStorage.removeItem(storageKey);
        }
        return remaining > 0 ? remaining : 0;
    });

    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    // Countdown timer
    useEffect(() =>
    {
        if (cooldown <= 0)
        {
            if (intervalRef.current)
            {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
            return;
        }

        if (intervalRef.current) return;

        intervalRef.current = setInterval(() =>
        {
            setCooldown((prev) =>
            {
                if (prev <= 1)
                {
                    localStorage.removeItem(storageKey);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () =>
        {
            if (intervalRef.current)
            {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
        };
    }, [cooldown, storageKey]);

    // Start / restart cooldown
    const startCooldown = useCallback(() =>
    {
        const expiresAt = Date.now() + cooldownTime * 1000;
        localStorage.setItem(storageKey, expiresAt.toString());
        setCooldown(cooldownTime);
    }, [cooldownTime, storageKey]);

    const resetCooldown = useCallback(() =>
    {
        localStorage.removeItem(storageKey);
        setCooldown(0);
    }, [storageKey]);

    const formatTime = useCallback((seconds: number) =>
    {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s.toString().padStart(2, "0")}`;
    }, []);

    return {
        cooldown,
        isOnCooldown: cooldown > 0,
        startCooldown,
        resetCooldown,
        formatTime,
    };
}
