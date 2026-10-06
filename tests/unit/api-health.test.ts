import { describe, expect, it, vi } from "vitest";
import { GET } from "@/app/api/health/route";
import { prisma } from "@/lib/db";

vi.mock("@/lib/db", () => ({
  prisma: {
    $queryRaw: vi.fn(),
  },
}));

describe("API Health Route Unit Tests", () => {
  it("returns 200 OK with status: ok when database is healthy", async () => {
    vi.mocked(prisma.$queryRaw).mockResolvedValueOnce([{ "?column?": 1 }]);

    const response = await GET();
    expect(response.status).toBe(200);

    const data = await response.json();
    expect(data.status).toBe("ok");
    expect(data.database).toBe("ok");
    expect(typeof data.latencyMs).toBe("number");
    expect(typeof data.timestamp).toBe("string");
  });

  it("returns 503 Service Unavailable with status: degraded when database query throws", async () => {
    vi.mocked(prisma.$queryRaw).mockRejectedValueOnce(new Error("Connection refused"));

    const response = await GET();
    expect(response.status).toBe(503);

    const data = await response.json();
    expect(data.status).toBe("degraded");
    expect(data.database).toBe("error");
    expect(typeof data.latencyMs).toBe("number");
    expect(typeof data.timestamp).toBe("string");
  });
});
