import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"

// GET /api/waste-types/search?query=... - Search waste types
export async function GET(request: NextRequest) {
  try {
    // Ambil query parameter dari URL
    const { searchParams } = new URL(request.url)
    const query = searchParams.get("query")?.trim() || ""

    // Jika query kosong, return semua waste type (bisa diubah jika ingin behavior berbeda)
    const wasteTypes = await db.wastetype.findMany({
      where: {
        OR: [
          { name: { contains: query } },
          { description: { contains: query } },
        ],
      },
      orderBy: { updatedAt: "desc" },
    })
    

    return NextResponse.json(wasteTypes, { status: 200 })
  } catch (error) {
    console.error("Error searching waste types:", error)
    return NextResponse.json({ error: "Failed to search waste types" }, { status: 500 })
  }
}
