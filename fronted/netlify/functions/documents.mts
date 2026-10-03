import type { Config } from "@netlify/functions";
import { desc } from "drizzle-orm";
import { db } from "../../db/index.js";
import { documentRequests } from "../../db/schema.js";
import { json, formParams, field, serverError } from "../../lib/http.js";

export default async (req: Request) => {
  try {
    if (req.method === "GET") {
      return json(await db.select().from(documentRequests).orderBy(desc(documentRequests.id)));
    }

    if (req.method === "POST") {
      const params = await formParams(req);
      const studentName = field(params, "studentName");
      const documentType = field(params, "documentType");

      if (!studentName || !documentType) {
        return json({ success: false, message: "Please fill in all required fields." }, 400);
      }

      await db.insert(documentRequests).values({ studentName, documentType, purpose: field(params, "purpose") });
      return json({ success: true, message: "Document request submitted successfully." });
    }

    return json({ success: false, message: "Method not allowed." }, 405);
  } catch (error) {
    return serverError("DOCUMENT REQUEST", error);
  }
};

export const config: Config = {
  path: "/DocumentRequestServlet",
};
