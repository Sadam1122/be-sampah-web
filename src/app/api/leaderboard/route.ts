import { NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export async function GET() {
  try {
    const leaderboard = await prisma.leaderboard.findMany({
      orderBy: { totalPoin: "desc" },
      take: 10,
    })
    return NextResponse.json(leaderboard)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}

