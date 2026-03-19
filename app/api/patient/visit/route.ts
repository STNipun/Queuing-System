import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth/auth-service.server";
import { NextResponse, NextRequest } from "next/server";

export async function GET(req: NextRequest)
{
    try
    {
        const currentUser = await getCurrentUser();
        if (!currentUser)
        {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);

        const page = Number(searchParams.get("page")) || 1;
        const limit = Number(searchParams.get("limit")) || 10;

        const skip = (page - 1) * limit;

        const [patientVisits, total] = await Promise.all([
            prisma.patientVisit.findMany({
                skip,
                take: limit,
                orderBy: {
                    createdAt: "desc"
                }
            }),
            prisma.patientVisit.count(),
        ]);

        return NextResponse.json(
            {
                data: patientVisits,
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
            { status: 200 }
        )
    }
    catch (error)
    {
        console.error("Error fetching patient visits:", error);
        return NextResponse.json({ error: "Failed to fetch patient visits" }, { status: 500 });
    }
}

export async function POST(req: NextRequest)
{
    try
    {
        const currentUser = await getCurrentUser();
        if (!currentUser)
        {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();

        // Determine if it's an array (bulk) or single object
        const visitsArray = Array.isArray(body) ? body : [body];

        // Validate each visit
        const requiredFields = [
            "patientName",
            "age",
            "gender",
            "visitDate",
            "visitTime",
            "visitType",
            "diagnosis",
            "prescription",
            "status",
            "notes",
        ];

        for (const visit of visitsArray)
        {
            for (const field of requiredFields)
            {
                if (visit[field] === undefined || visit[field] === null)
                {
                    return NextResponse.json({ error: `${field} is required` }, { status: 400 });
                }
            }
        }

        // Map data with correct types
        const visitsData = visitsArray.map((visit) => ({
            patientName: String(visit.patientName),
            age: Number(visit.age),
            gender: String(visit.gender),
            visitDate: new Date(visit.visitDate),
            visitTime: String(visit.visitTime),
            visitType: String(visit.visitType),
            diagnosis: String(visit.diagnosis),
            prescription: String(visit.prescription),
            status: String(visit.status),
            notes: String(visit.notes),
        }));

        // Bulk insert
        const createdVisits = await prisma.patientVisit.createMany({
            data: visitsData,
            skipDuplicates: true, // optional
        });

        return NextResponse.json({ inserted: createdVisits.count }, { status: 200 });
    } catch (error)
    {
        console.error(error);
        return NextResponse.json({ error: "Invalid request body or database error" }, { status: 500 });
    }
}