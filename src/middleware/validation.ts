import type { Request, Response, NextFunction } from "express"
import { z } from "zod"

// Skema validasi untuk data pengumpulan sampah
const pengumpulanSampahSchema = z.object({
  berat: z.number().positive(),
  namaPemilik: z.string().max(100),
  rt: z.string().length(3), // Validasi RT
  rw: z.string().length(3), // Validasi RW
  desa: z.string().max(100),
  jenisSampah: z.string().max(50),
  poin: z.number().int().nonnegative(),
})

export const validatePengumpulanSampah = (req: Request, res: Response, next: NextFunction) => {
  try {
    // Validasi input dengan menggunakan Zod
    pengumpulanSampahSchema.parse(req.body)
    next() // Lanjutkan ke handler berikutnya jika validasi berhasil
  } catch (error) {
    // Tangani kesalahan validasi dan kirimkan respons error
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: error.errors })
    } else {
      res.status(400).json({ error: "Invalid input" })
    }
  }
}
