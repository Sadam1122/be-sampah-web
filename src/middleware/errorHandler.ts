import type { Request, Response, NextFunction } from "express"

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack)
  res.status(500).json({ error: "Something went wrong!" })
}

export default errorHandler

