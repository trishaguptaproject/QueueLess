import type { Config } from "@netlify/functions";
import { asc, eq, ne } from "drizzle-orm";
import { db } from "../../db/index.js";
import { queue } from "../../db/schema.js";
import { json, formParams, serverError } from "../../lib/http.js";

// Each action moves the oldest entry in one status to the next status.
const TRANSITIONS: Record<string, { from: string; to: string; empty: string; done: string }> = {
  CALL_NEXT: { from: "WAITING", to: "CALLED", empty: "No students are waiting.", done: "called" },
  START_SERVING: { from: "CALLED", to: "SERVING", empty: "No called student to serve.", done: "is now being served" },
  COMPLETE: { from: "SERVING", to: "COMPLETED", empty: "No student is being served.", done: "completed" },
};

export default async (req: Request) => {
  try {
    if (req.method === "GET") {
      const rows = await db.select().from(queue).where(ne(queue.status, "COMPLETED")).orderBy(asc(queue.id));

      // admin.html and admin-login.html read different field names, so include both.
      return json(
        rows.map((row) => ({
          id: row.id,
          token: row.tokenNumber,
          studentName: row.studentName,
          student: row.studentName,
          serviceName: row.serviceName,
          service: row.serviceName,
          status: row.status,
          joinedAt: row.joinedAt ? row.joinedAt.toLocaleString("en-IN") : "",
        }))
      );
    }

    if (req.method === "POST") {
      const action = (await formParams(req)).get("action") || "";
      const transition = TRANSITIONS[action];
      if (!transition) {
        return json({ success: false, message: "Invalid action." }, 400);
      }

      const [next] = await db
        .select()
        .from(queue)
        .where(eq(queue.status, transition.from))
        .orderBy(asc(queue.id))
        .limit(1);
      if (!next) {
        return json({ success: false, message: transition.empty });
      }

      await db.update(queue).set({ status: transition.to }).where(eq(queue.id, next.id));
      return json({ success: true, message: `Token ${next.tokenNumber} ${transition.done}.` });
    }

    return json({ success: false, message: "Method not allowed." }, 405);
  } catch (error) {
    return serverError("ADMIN QUEUE", error);
  }
};

export const config: Config = {
  path: "/AdminQueueServlet",
};
