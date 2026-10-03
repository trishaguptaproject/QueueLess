import type { Config } from "@netlify/functions";
import { desc, eq, count } from "drizzle-orm";
import { db } from "../../db/index.js";
import { queue } from "../../db/schema.js";
import { json, MINUTES_PER_STUDENT, serverError } from "../../lib/http.js";

export default async () => {
  try {
    const [waiting] = await db.select({ value: count() }).from(queue).where(eq(queue.status, "WAITING"));
    const [latest] = await db.select({ token: queue.tokenNumber }).from(queue).orderBy(desc(queue.id)).limit(1);
    const waitingCount = waiting.value;

    return json({
      success: true,
      waitingCount,
      latestToken: latest?.token || "--",
      estimatedWait: waitingCount * MINUTES_PER_STUDENT,
      queueLoad: waitingCount >= 10 ? "HIGH" : waitingCount >= 5 ? "MEDIUM" : "LOW",
    });
  } catch (error) {
    return serverError("QUEUE STATUS", error);
  }
};

export const config: Config = {
  path: "/QueueStatusServlet",
};
