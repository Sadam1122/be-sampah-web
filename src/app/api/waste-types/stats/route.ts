import {NextResponse } from "next/server"
import { db } from "@/lib/db"

// GET /api/waste-types/stats - Get statistics about waste types
export async function GET() {
  try {
    // Get all waste types
    const wasteTypes = await db.wastetype.findMany()

    if (wasteTypes.length === 0) {
      return NextResponse.json(
        {
          totalTypes: 0,
          averagePrice: 0,
          recyclablePercentage: 0,
          hazardousCount: 0,
        },
        { status: 200 },
      )
    }

    // Calculate statistics
    const totalTypes = wasteTypes.length
    const totalPrice = wasteTypes.reduce((sum, type) => sum + type.pricePerKg.toNumber(), 0);
    const averagePrice = totalPrice / totalTypes;
    

    const recyclableCount = wasteTypes.filter((type) => type.recyclable).length
    const recyclablePercentage = (recyclableCount / totalTypes) * 100

    const hazardousCount = wasteTypes.filter((type) => type.hazardous).length

    return NextResponse.json(
      {
        totalTypes,
        averagePrice,
        recyclablePercentage,
        hazardousCount,
      },
      { status: 200 },
    )
  } catch (error) {
    console.error("Error fetching waste type statistics:", error)
    return NextResponse.json({ error: "Failed to fetch waste type statistics" }, { status: 500 })
  }
}

