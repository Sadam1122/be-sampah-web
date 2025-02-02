import type { Request, Response, NextFunction } from "express"
import { z } from "zod"

const pengumpulanSampahSchema = z.object({
  berat: z.number().positive(),
  namaPemilik: z.string().max(100),
  rt: z.string().length(3),
  rw: z.string().length(3),
  desa: z.string().max(100),
  jenisSampah: z.string().max(50),
  poin: z.number().int().nonnegative(),
})

export const validatePengumpulanSampah = (req: Request, res: Response, next: NextFunction) => {
  try {
    pengumpulanSampahSchema.parse(req.body)
    next()
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: error.errors })
    } else {
      res.status(400).json({ error: "Invalid input" })
    }
  }
}

