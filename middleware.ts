import { NextRequest, NextResponse } from "next/server";
import { authMiddleware } from "@/lib/middleware/auth-middleware";
import { compose } from "@/lib/middleware/compose";

const handler = compose([authMiddleware]);

export function middleware(req: NextRequest)
{
    return handler(req) ?? NextResponse.next();
}

export const config = {
    matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};