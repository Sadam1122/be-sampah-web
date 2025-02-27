import { NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import { z } from "zod"

const prisma = new PrismaClient()

// Skema validasi pengumpulan sampah
const pengumpulanSampahSchema = z.object({
  berat: z.number().positive(),
  rt: z.string().min(1).max(3),
  rw: z.string().min(1).max(3),
  jenisSampah: z.string().max(50),
  poin: z.number().int().nonnegative(),
  username: z.string(),
})

// Handler GET
export async function GET(req: Request) {
  try {
    const url = new URL(req.url)
    const desaId = url.searchParams.get("desaId")
    const userRole = req.headers.get("x-user-role")

    if (userRole === "SUPERADMIN") {
      const pengumpulanSampah = await prisma.pengumpulansampah.findMany({
        orderBy: { waktu: "desc" },
      })
      return NextResponse.json(pengumpulanSampah)
    }

    if (!desaId) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 403 })
    }

    const pengumpulanSampah = await prisma.pengumpulansampah.findMany({
      where: { desaId },
      orderBy: { waktu: "desc" },
    })

    return NextResponse.json(pengumpulanSampah)
  } catch (error) {
    console.error("GET Error:", error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}

// Handler POST
export async function POST(request: Request) {
  try {
    const body = await request.json()
    console.log("Received body:", body) // Debugging

    const validatedData = pengumpulanSampahSchema.parse(body)
    const { username, berat, rt, rw, jenisSampah, poin } = validatedData

    const user = await prisma.user.findUnique({
      where: { username },
      select: { id: true, desaId: true },
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    if (!user.desaId) {
      return NextResponse.json({ error: "User does not have an associated desa" }, { status: 400 })
    }

    const newPengumpulanSampah = await prisma.pengumpulansampah.create({
      data: {
        id: crypto.randomUUID(),
        berat,
        rt,
        rw,
        jenisSampah,
        poin,
        desaId: user.desaId,
        userId: user.id,
      },
    });
    

    console.log("Created Data:", newPengumpulanSampah) // Debugging

    return NextResponse.json(newPengumpulanSampah, { status: 201 })
  } catch (error) {
    console.error("POST Error:", error)

    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 })
    }

    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}
