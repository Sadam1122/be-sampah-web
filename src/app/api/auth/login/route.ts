import type { NextRequest } from "next/server"
import { AuthController } from "../../../../controllers/authController"

const authController = new AuthController()

export async function POST(req: NextRequest) {
  return authController.login(req)
}
