import type { Config } from "@netlify/functions";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { db } from "../../db/index.js";
import { users } from "../../db/schema.js";
import { json, formParams, field, serverError } from "../../lib/http.js";

export default async (req: Request) => {
  if (req.method !== "POST") {
    return json({ success: false, message: "Only POST requests are allowed." }, 405);
  }

  try {
    const params = await formParams(req);
    const action = params.get("action");

    if (action === "REGISTER") {
      const fullName = field(params, "fullName");
      const studentId = field(params, "studentId");
      const email = field(params, "email").toLowerCase();
      const password = params.get("password") || "";

      if (!fullName || !studentId || !email || !password) {
        return json({ success: false, message: "Please fill in all required fields." }, 400);
      }

      const [existing] = await db.select({ id: users.id }).from(users).where(eq(users.email, email)).limit(1);
      if (existing) {
        return json({ success: false, message: "An account with this email already exists." }, 409);
      }

      await db.insert(users).values({
        fullName,
        studentId,
        email,
        phone: field(params, "phone"),
        department: field(params, "department"),
        course: field(params, "course"),
        semester: field(params, "semester"),
        password: await bcrypt.hash(password, 10),
        role: "STUDENT",
      });

      return json({ success: true, message: "Registration successful." });
    }

    if (action === "LOGIN") {
      const email = field(params, "email").toLowerCase();
      const password = params.get("password") || "";

      if (!email || !password) {
        return json({ success: false, message: "Email and password are required." }, 400);
      }

      const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);
      if (!user || !(await bcrypt.compare(password, user.password))) {
        return json({ success: false, message: "Invalid email or password." }, 401);
      }

      return json({
        success: true,
        message: "Login successful.",
        userId: user.id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
      });
    }

    return json({ success: false, message: "Invalid action." }, 400);
  } catch (error) {
    return serverError("AUTH", error);
  }
};

export const config: Config = {
  path: "/AuthServlet",
};
