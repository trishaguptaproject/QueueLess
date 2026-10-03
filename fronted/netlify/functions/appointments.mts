import type { Config } from "@netlify/functions";
import { desc } from "drizzle-orm";
import { db } from "../../db/index.js";
import { appointments } from "../../db/schema.js";
import { json, formParams, field, serverError } from "../../lib/http.js";

export default async (req: Request) => {
  try {
    if (req.method === "GET") {
      return json(await db.select().from(appointments).orderBy(desc(appointments.id)));
    }

    if (req.method === "POST") {
      const params = await formParams(req);
      const studentName = field(params, "studentName");
      const serviceName = field(params, "serviceName");
      const appointmentDate = field(params, "appointmentDate");
      const appointmentTime = field(params, "appointmentTime");

      if (!studentName || !serviceName || !/^\d{4}-\d{2}-\d{2}$/.test(appointmentDate) || !appointmentTime) {
        return json({ success: false, message: "Please fill in all required fields." }, 400);
      }

      await db.insert(appointments).values({
        studentName,
        serviceName,
        appointmentDate,
        appointmentTime,
        reason: field(params, "reason"),
      });
      return json({ success: true, message: "Appointment booked successfully." });
    }

    return json({ success: false, message: "Method not allowed." }, 405);
  } catch (error) {
    return serverError("APPOINTMENT", error);
  }
};

export const config: Config = {
  path: "/AppointmentServlet",
};
