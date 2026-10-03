import type { Config } from "@netlify/functions";
import { and, asc, eq } from "drizzle-orm";
import { db } from "../../db/index.js";
import { counters, queue } from "../../db/schema.js";
import { json, formParams, field, serverError } from "../../lib/http.js";

export default async (req: Request) => {
  try {
    if (req.method === "GET") {
      return json(await db.select().from(counters).orderBy(asc(counters.id)));
    }

    if (req.method !== "POST") {
      return json({ success: false, message: "Method not allowed." }, 405);
    }

    const params = await formParams(req);
    const action = params.get("action");
    const counterId = Number(params.get("counterId"));

    const [counter] = await db.select().from(counters).where(eq(counters.id, counterId)).limit(1);
    if (!counter) {
      return json({ success: false, message: "Counter not found." }, 404);
    }

    if (action === "ASSIGN") {
      const token = field(params, "token").toUpperCase();
      if (counter.status !== "ACTIVE") {
        return json({ success: false, message: "Counter is inactive." });
      }
      if (counter.currentToken) {
        return json({ success: false, message: `${counter.counterName} already has token ${counter.currentToken}.` });
      }
      const [entry] = await db
        .select()
        .from(queue)
        .where(and(eq(queue.tokenNumber, token), eq(queue.status, "CALLED")))
        .limit(1);
      if (!entry) {
        return json({ success: false, message: `Token ${token} is not in CALLED status.` });
      }
      await db.update(counters).set({ currentToken: token }).where(eq(counters.id, counterId));
      return json({ success: true, message: `Token ${token} assigned to ${counter.counterName}.` });
    }

    if (action === "START_SERVING" || action === "COMPLETE") {
      if (!counter.currentToken) {
        return json({ success: false, message: "No token assigned to this counter." });
      }
      if (action === "START_SERVING") {
        await db.update(queue).set({ status: "SERVING" }).where(eq(queue.tokenNumber, counter.currentToken));
        return json({ success: true, message: `Serving token ${counter.currentToken}.` });
      }
      await db.update(queue).set({ status: "COMPLETED" }).where(eq(queue.tokenNumber, counter.currentToken));
      await db.update(counters).set({ currentToken: null }).where(eq(counters.id, counterId));
      return json({ success: true, message: `Token ${counter.currentToken} completed.` });
    }

    if (action === "TOGGLE") {
      const status = counter.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";
      await db.update(counters).set({ status }).where(eq(counters.id, counterId));
      return json({ success: true, message: `${counter.counterName} is now ${status}.` });
    }

    return json({ success: false, message: "Invalid action." }, 400);
  } catch (error) {
    return serverError("COUNTER", error);
  }
};

export const config: Config = {
  path: "/CounterServlet",
};
