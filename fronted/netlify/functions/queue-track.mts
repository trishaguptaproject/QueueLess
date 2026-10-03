import type { Config } from "@netlify/functions";
import { and, eq, lt, count } from "drizzle-orm";
import { db } from "../../db/index.js";
import { queue } from "../../db/schema.js";
import { json, MINUTES_PER_STUDENT, serverError } from "../../lib/http.js";

export default async (req: Request) => {
  const token = (new URL(req.url).searchParams.get("token") || "").trim().toUpperCase();
  if (!token) {
    return json({ success: false, error: "Please enter your token number.", message: "Please enter your token number." });
  }

  try {
    const [entry] = await db.select().from(queue).where(eq(queue.tokenNumber, token)).limit(1);
    if (!entry) {
      return json({ success: false, error: "Token not found.", message: "Token not found." });
    }

    let peopleAhead = 0;
    if (entry.status === "WAITING") {
      const [row] = await db
        .select({ value: count() })
        .from(queue)
        .where(and(eq(queue.status, "WAITING"), lt(queue.id, entry.id)));
      peopleAhead = row.value;
    }

    return json({
      success: true,
      token: entry.tokenNumber,
      studentName: entry.studentName,
      serviceName: entry.serviceName,
      status: entry.status,
      peopleAhead,
      estimatedWait: peopleAhead * MINUTES_PER_STUDENT,
    });
  } catch (error) {
    return serverError("QUEUE TRACK", error);
  }
};

export const config: Config = {
  path: ["/QueueTrackServlet", "/TrackQueueServlet"],
};
