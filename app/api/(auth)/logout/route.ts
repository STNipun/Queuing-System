import { NextRequest, NextResponse } from "next/server";







export async function POST(req: NextRequest)
{
    try
    {
        const response = NextResponse.json(
            { success: true, message: "Logout successful" },
            { status: 200 }
        );

        response.cookies.set("auth-token", "", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 0,
            path: "/",
        });

        return response;
    }
    catch (error)
    {
        console.log(error);
        return NextResponse.json(
            { message: "Internal server error" },
            { status: 500 }
        )
    }
}