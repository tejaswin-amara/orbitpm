import { beforeEach, describe, expect, it, vi } from "vitest";
import { POST as postComment } from "@/app/api/projects/[projectId]/comments/route";
import {
  DELETE as deleteProject,
  GET as getProjectDetail,
  PATCH as patchProject,
} from "@/app/api/projects/[projectId]/route";
import {
  GET as getProjectTasks,
  POST as postProjectTasks,
} from "@/app/api/projects/[projectId]/tasks/route";
import { POST as createProject, GET as getProjects } from "@/app/api/projects/route";
import { DELETE as deleteTask, PATCH as patchTask } from "@/app/api/tasks/[taskId]/route";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";

vi.mock("@/lib/session", () => ({
  getSession: vi.fn(),
}));

vi.mock("@/lib/db", () => ({
  prisma: {
    project: {
      findMany: vi.fn(),
      findFirst: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    task: {
      findMany: vi.fn(),
      findFirst: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    comment: {
      create: vi.fn(),
    },
    user: {
      findUnique: vi.fn(),
    },
    activityEvent: {
      create: vi.fn(),
    },
  },
}));

type SessionData = NonNullable<Awaited<ReturnType<typeof getSession>>>;

const testSession: SessionData = {
  user: {
    id: "user-123",
    email: "tester@origins.internal",
    name: "Tester",
    createdAt: new Date(),
    updatedAt: new Date(),
    emailVerified: true,
  },
  session: {
    id: "sess-1",
    userId: "user-123",
    token: "token-abc",
    expiresAt: new Date(Date.now() + 86400000),
    createdAt: new Date(),
    updatedAt: new Date(),
  },
};

describe("API Route Handlers Unit Tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Authentication Protection (401 Unauthorized)", () => {
    beforeEach(() => {
      vi.mocked(getSession).mockResolvedValue(null);
    });

    it("GET /api/projects rejects unauthenticated request with 401", async () => {
      const res = await getProjects();
      expect(res.status).toBe(401);
      const data = await res.json();
      expect(data.error).toBe("Unauthorized");
    });

    it("POST /api/projects rejects unauthenticated request with 401", async () => {
      const req = new Request("http://localhost/api/projects", {
        method: "POST",
        body: JSON.stringify({ name: "Secret Project" }),
      });
      const res = await createProject(req);
      expect(res.status).toBe(401);
    });

    it("GET /api/projects/:id rejects unauthenticated request with 401", async () => {
      const req = new Request("http://localhost/api/projects/proj-1");
      const res = await getProjectDetail(req, {
        params: Promise.resolve({ projectId: "proj-1" }),
      });
      expect(res.status).toBe(401);
    });

    it("GET /api/projects/:id/tasks rejects unauthenticated request with 401", async () => {
      const req = new Request("http://localhost/api/projects/proj-1/tasks");
      const res = await getProjectTasks(req, {
        params: Promise.resolve({ projectId: "proj-1" }),
      });
      expect(res.status).toBe(401);
    });

    it("PATCH /api/tasks/:id rejects unauthenticated request with 401", async () => {
      const req = new Request("http://localhost/api/tasks/task-1", {
        method: "PATCH",
        body: JSON.stringify({ status: "DONE" }),
      });
      const res = await patchTask(req, { params: Promise.resolve({ taskId: "task-1" }) });
      expect(res.status).toBe(401);
    });

    it("POST /api/projects/:id/comments rejects unauthenticated request with 401", async () => {
      const req = new Request("http://localhost/api/projects/proj-1/comments", {
        method: "POST",
        body: JSON.stringify({ body: "Unauthorized comment" }),
      });
      const res = await postComment(req, {
        params: Promise.resolve({ projectId: "proj-1" }),
      });
      expect(res.status).toBe(401);
    });
  });

  describe("Validation Errors (422 Unprocessable Entity)", () => {
    beforeEach(() => {
      vi.mocked(getSession).mockResolvedValue(testSession);
    });

    it("POST /api/projects rejects invalid name with 422", async () => {
      const req = new Request("http://localhost/api/projects", {
        method: "POST",
        body: JSON.stringify({ name: "X" }), // too short
      });
      const res = await createProject(req);
      expect(res.status).toBe(422);
    });

    it("POST /api/projects/:id/tasks rejects missing title with 422", async () => {
      vi.mocked(prisma.project.findFirst).mockResolvedValueOnce({
        id: "proj-1",
      } as unknown as Awaited<ReturnType<typeof prisma.project.findFirst>>);
      const req = new Request("http://localhost/api/projects/proj-1/tasks", {
        method: "POST",
        body: JSON.stringify({ title: "" }),
      });
      const res = await postProjectTasks(req, {
        params: Promise.resolve({ projectId: "proj-1" }),
      });
      expect(res.status).toBe(422);
    });

    it("POST /api/projects/:id/comments rejects empty body with 422", async () => {
      vi.mocked(prisma.project.findFirst).mockResolvedValueOnce({
        id: "proj-1",
      } as unknown as Awaited<ReturnType<typeof prisma.project.findFirst>>);
      const req = new Request("http://localhost/api/projects/proj-1/comments", {
        method: "POST",
        body: JSON.stringify({ body: "" }),
      });
      const res = await postComment(req, {
        params: Promise.resolve({ projectId: "proj-1" }),
      });
      expect(res.status).toBe(422);
    });
  });

  describe("Resource Not Found (404 Not Found)", () => {
    beforeEach(() => {
      vi.mocked(getSession).mockResolvedValue(testSession);
    });

    it("GET /api/projects/:id returns 404 when project does not exist", async () => {
      vi.mocked(prisma.project.findFirst).mockResolvedValueOnce(null);
      const req = new Request("http://localhost/api/projects/nonexistent");
      const res = await getProjectDetail(req, {
        params: Promise.resolve({ projectId: "nonexistent" }),
      });
      expect(res.status).toBe(404);
      const data = await res.json();
      expect(data.error).toBe("Project not found");
    });

    it("DELETE /api/tasks/:id returns 404 when task does not exist", async () => {
      vi.mocked(prisma.task.findFirst).mockResolvedValueOnce(null);
      const req = new Request("http://localhost/api/tasks/nonexistent", { method: "DELETE" });
      const res = await deleteTask(req, { params: Promise.resolve({ taskId: "nonexistent" }) });
      expect(res.status).toBe(404);
    });
  });

  describe("Successful CRUD Operations", () => {
    beforeEach(() => {
      vi.mocked(getSession).mockResolvedValue(testSession);
    });

    it("GET /api/projects returns list of projects", async () => {
      const mockProjects = [
        { id: "p1", name: "Alpha", _count: { tasks: 5 } },
        { id: "p2", name: "Beta", _count: { tasks: 2 } },
      ];
      vi.mocked(prisma.project.findMany).mockResolvedValueOnce(
        mockProjects as unknown as Awaited<ReturnType<typeof prisma.project.findMany>>,
      );

      const res = await getProjects();
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.projects).toHaveLength(2);
      expect(data.projects[0].name).toBe("Alpha");
    });

    it("POST /api/projects creates a project and returns 201", async () => {
      const created = {
        id: "p-new",
        name: "Telemetry Pipeline",
        creatorId: "user-123",
        slug: "telemetry-pipeline-12345678",
      };
      vi.mocked(prisma.project.create).mockResolvedValueOnce(
        created as unknown as Awaited<ReturnType<typeof prisma.project.create>>,
      );
      vi.mocked(prisma.activityEvent.create).mockResolvedValueOnce(
        {} as unknown as Awaited<ReturnType<typeof prisma.activityEvent.create>>,
      );

      const req = new Request("http://localhost/api/projects", {
        method: "POST",
        body: JSON.stringify({ name: "Telemetry Pipeline" }),
      });
      const res = await createProject(req);
      expect(res.status).toBe(201);
      const data = await res.json();
      expect(data.project.name).toBe("Telemetry Pipeline");
      expect(prisma.project.create).toHaveBeenCalled();
    });

    it("PATCH /api/projects/:id rejects non-owner mutation with 403", async () => {
      vi.mocked(prisma.project.findUnique).mockResolvedValueOnce({
        id: "p-owned-by-someone-else",
        creatorId: "user-other",
      } as unknown as Awaited<ReturnType<typeof prisma.project.findUnique>>);

      const req = new Request("http://localhost/api/projects/p-owned-by-someone-else", {
        method: "PATCH",
        body: JSON.stringify({ status: "ARCHIVED" }),
      });
      const res = await patchProject(req, {
        params: Promise.resolve({ projectId: "p-owned-by-someone-else" }),
      });

      expect(res.status).toBe(403);
      expect(prisma.project.update).not.toHaveBeenCalled();
    });

    it("DELETE /api/projects/:id rejects non-owner mutation with 403", async () => {
      vi.mocked(prisma.project.findUnique).mockResolvedValueOnce({
        id: "p-owned-by-someone-else",
        creatorId: "user-other",
      } as unknown as Awaited<ReturnType<typeof prisma.project.findUnique>>);

      const req = new Request("http://localhost/api/projects/p-owned-by-someone-else", {
        method: "DELETE",
      });
      const res = await deleteProject(req, {
        params: Promise.resolve({ projectId: "p-owned-by-someone-else" }),
      });

      expect(res.status).toBe(403);
      expect(prisma.project.delete).not.toHaveBeenCalled();
    });

    it("PATCH /api/projects/:id allows an admin to mutate another user's project", async () => {
      vi.mocked(prisma.project.findUnique).mockResolvedValueOnce({
        id: "p-admin",
        creatorId: "user-other",
      } as unknown as Awaited<ReturnType<typeof prisma.project.findUnique>>);
      vi.mocked(prisma.user.findUnique).mockResolvedValueOnce({
        role: "ADMIN",
      } as unknown as Awaited<ReturnType<typeof prisma.user.findUnique>>);
      vi.mocked(prisma.project.update).mockResolvedValueOnce({
        id: "p-admin",
        status: "ARCHIVED",
      } as unknown as Awaited<ReturnType<typeof prisma.project.update>>);
      vi.mocked(prisma.activityEvent.create).mockResolvedValueOnce(
        {} as unknown as Awaited<ReturnType<typeof prisma.activityEvent.create>>,
      );

      const req = new Request("http://localhost/api/projects/p-admin", {
        method: "PATCH",
        body: JSON.stringify({ status: "ARCHIVED" }),
      });
      const res = await patchProject(req, {
        params: Promise.resolve({ projectId: "p-admin" }),
      });

      expect(res.status).toBe(200);
      expect(prisma.project.update).toHaveBeenCalled();
    });

    it("DELETE /api/projects/:id deletes project and returns 204", async () => {
      vi.mocked(prisma.project.findUnique).mockResolvedValueOnce({
        id: "p-del",
        creatorId: "user-123",
      } as unknown as Awaited<ReturnType<typeof prisma.project.findUnique>>);
      vi.mocked(prisma.project.delete).mockResolvedValueOnce(
        {} as unknown as Awaited<ReturnType<typeof prisma.project.delete>>,
      );
      vi.mocked(prisma.activityEvent.create).mockResolvedValueOnce(
        {} as unknown as Awaited<ReturnType<typeof prisma.activityEvent.create>>,
      );

      const req = new Request("http://localhost/api/projects/p-del", { method: "DELETE" });
      const res = await deleteProject(req, {
        params: Promise.resolve({ projectId: "p-del" }),
      });
      expect(res.status).toBe(204);
      expect(prisma.project.delete).toHaveBeenCalledWith({ where: { id: "p-del" } });
    });
  });
});
