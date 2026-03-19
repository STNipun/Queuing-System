import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { NextRequest } from "next/server";

type RateLimitWindow = `${number} s` | `${number} m` | `${number} h`;

type RateLimitOptions = {
    namespace: string;
    identifier: string;
    limit: number;
    window: RateLimitWindow;
};

type RateLimitResult = {
    success: boolean;
    limit: number;
    remaining: number;
    reset: number;
};

type LocalCounter = {
    count: number;
    reset: number;
};

const localRateStore = new Map<string, LocalCounter>();
const limiterCache = new Map<string, Ratelimit>();

function parseWindowToMs(window: RateLimitWindow): number
{
    const [valueRaw, unit] = window.split(" ");
    const value = Number(valueRaw);

    if (unit === "s") return value * 1000;
    if (unit === "m") return value * 60 * 1000;
    return value * 60 * 60 * 1000;
}

function getUpstashLimiter(limit: number, window: RateLimitWindow): Ratelimit | null
{
    const url = process.env.UPSTASH_REDIS_REST_URL;
    const token = process.env.UPSTASH_REDIS_REST_TOKEN;

    if (!url || !token)
    {
        return null;
    }

    const cacheKey = `${limit}:${window}`;
    const cached = limiterCache.get(cacheKey);
    if (cached)
    {
        return cached;
    }

    const redis = new Redis({ url, token });
    const limiter = new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(limit, window),
        prefix: "clinic-auth",
        analytics: true,
    });

    limiterCache.set(cacheKey, limiter);
    return limiter;
}

function limitWithLocalStore(key: string, limit: number, window: RateLimitWindow): RateLimitResult
{
    const now = Date.now();
    const duration = parseWindowToMs(window);
    const existing = localRateStore.get(key);

    if (!existing || now >= existing.reset)
    {
        const reset = now + duration;
        localRateStore.set(key, { count: 1, reset });
        return {
            success: true,
            limit,
            remaining: limit - 1,
            reset,
        };
    }

    existing.count += 1;
    localRateStore.set(key, existing);

    return {
        success: existing.count <= limit,
        limit,
        remaining: Math.max(0, limit - existing.count),
        reset: existing.reset,
    };
}

export function getClientIdentifier(req: NextRequest, userHint?: string): string
{
    const forwardedFor = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
    const realIp = req.headers.get("x-real-ip")?.trim();
    const ip = forwardedFor || realIp || "unknown";

    if (!userHint)
    {
        return ip;
    }

    return `${ip}:${userHint.trim().toLowerCase()}`;
}

export async function checkRateLimit(options: RateLimitOptions): Promise<RateLimitResult>
{
    const { namespace, identifier, limit, window } = options;
    const key = `${namespace}:${identifier}`;

    const upstashLimiter = getUpstashLimiter(limit, window);
    if (upstashLimiter)
    {
        const result = await upstashLimiter.limit(key);

        return {
            success: result.success,
            limit: result.limit,
            remaining: result.remaining,
            reset: result.reset,
        };
    }

    return limitWithLocalStore(key, limit, window);
}