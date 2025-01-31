import { createServer, Server } from "http";
import request from "supertest";
import handler from "@/app/api/auth/register/route"; // Pastikan path ini sesuai dengan struktur proyek Anda

describe("Registration API", () => {
  let server: Server;  // Menambahkan tipe untuk server

  beforeAll(() => {
    server = createServer((req, res) => {
      handler(req, res);  // Menjalankan handler API Next.js langsung
    });
    server.listen(3000);
  });

  afterAll(() => {
    server.close();
  });

  it("should register a new user", async () => {
    const response = await request(server)
      .post("/api/auth/register")
      .send({
        email: "test@example.com",
        username: "testuser",
        password: "password123",
      });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty("message", "User created successfully");
    expect(response.body).toHaveProperty("userId");
  });

  it("should return 400 for invalid input", async () => {
    const response = await request(server)
      .post("/api/auth/register")
      .send({
        email: "invalid-email",
        username: "te",
        password: "short",
      });

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty("message", "Invalid input");
    expect(response.body).toHaveProperty("errors");
  });
});
