import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import "dotenv/config";

const connectionString = process.env.DATABASE_URL ?? "";
const adapter = new PrismaPg({ connectionString, max: 3 });
const prisma = new PrismaClient({ adapter });

async function main(): Promise<void> {
  const email = process.env.SEED_USER_EMAIL;
  if (!email) {
    console.log("No SEED_USER_EMAIL set; nothing to seed.");
    return;
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    console.log(`No Better Auth user found for ${email}; sign up first, then run the seed again.`);
    return;
  }

  const project = await prisma.project.upsert({
    where: { slug: "website-relaunch" },
    update: {},
    create: {
      creatorId: user.id,
      name: "Website Relaunch",
      slug: "website-relaunch",
      description: "A seeded project for testing the Kanban workflow.",
      status: "ACTIVE",
    },
  });

  const tasks = [
    { title: "Confirm launch scope", priority: "HIGH" as const, status: "TODO" as const },
    { title: "Build landing page", priority: "MEDIUM" as const, status: "IN_PROGRESS" as const },
    { title: "Accessibility pass", priority: "HIGH" as const, status: "REVIEW" as const },
    { title: "Production smoke test", priority: "URGENT" as const, status: "DONE" as const },
  ];

  for (const task of tasks) {
    await prisma.task.upsert({
      where: { id: `${project.id}-${task.title.toLowerCase().replaceAll(" ", "-")}` },
      update: task,
      create: {
        id: `${project.id}-${task.title.toLowerCase().replaceAll(" ", "-")}`,
        projectId: project.id,
        assigneeId: user.id,
        ...task,
      },
    });
  }
}

main()
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
