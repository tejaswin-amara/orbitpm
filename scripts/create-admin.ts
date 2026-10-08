import { auth } from "@/lib/auth";
import "dotenv/config";

const email = process.env.ADMIN_EMAIL;
const username = process.env.ADMIN_USERNAME;
const password = process.env.ADMIN_PASSWORD;
const name = process.env.ADMIN_NAME ?? "OrbitPM Admin";

if (!email || !username || !password) {
  throw new Error(
    "Set ADMIN_EMAIL, ADMIN_USERNAME, and ADMIN_PASSWORD before running admin:create.",
  );
}

if (password.length < 10) {
  throw new Error("ADMIN_PASSWORD must be at least 10 characters.");
}

const result = await auth.api.createUser({
  body: {
    email,
    password,
    name,
    role: "admin",
    data: {
      username,
      displayUsername: username,
    },
  },
});

if (result.error) {
  throw new Error(result.error.message);
}

console.log(`Admin account ready: ${result.user.email} (${username})`);
