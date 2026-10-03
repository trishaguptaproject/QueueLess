import type { Config } from "@netlify/functions";
import { desc } from "drizzle-orm";
import { db } from "../../db/index.js";
import { helpDeskRequests } from "../../db/schema.js";
import { json, formParams, field, serverError } from "../../lib/http.js";

export default async (req: Request) => {
  try {
    if (req.method === "GET") {
      return json(await db.select().from(helpDeskRequests).orderBy(desc(helpDeskRequests.id)));
    }

    if (req.method === "POST") {
      const params = await formParams(req);
      const studentName = field(params, "studentName");
      const subject = field(params, "subject");
      const description = field(params, "description");

      if (!studentName || !subject || !description) {
        return json({ success: false, message: "Please fill in all required fields." }, 400);
      }

      await db.insert(helpDeskRequests).values({ studentName, subject, description });
      return json({ success: true, message: "Help desk request submitted successfully." });
    }

    return json({ success: false, message: "Method not allowed." }, 405);
  } catch (error) {
    return serverError("HELP DESK", error);
  }
};

export const config: Config = {
  path: "/HelpDeskServlet",
};
