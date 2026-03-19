import type { NextRequest, NextResponse } from "next/server";

export type MiddlewareFn = (req: NextRequest) => NextResponse | void;

export function compose(middlewares: MiddlewareFn[])
{
    return (req: NextRequest): NextResponse | void =>
    {
        for (const middleware of middlewares)
        {
            const result = middleware(req);
            if (result) return result;
        }
        return;
    };
}