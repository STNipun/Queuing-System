import { getCurrentUser } from "@/lib/auth/auth-service.server";
import { NextResponse } from "next/server";

export async function GET()
{
    try
    {
        const user = await getCurrentUser();
        if (!user)
        {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        return NextResponse.json({ user }, { status: 200 });
    }
    catch (error)
    {
        console.error("[GET_ME_ERROR]", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
