import type { Config } from "@netlify/functions";
import { eq } from "drizzle-orm";
import { db } from "../../db/index.js";
import { queue } from "../../db/schema.js";
import { formParams, field } from "../../lib/http.js";

// accounts.html submits a plain HTML form here to join the Accounts Office queue.
export default async (req: Request) => {
  if (req.method !== "POST") {
    return Response.redirect(new URL("/accounts.html", req.url), 303);
  }

  const studentName = field(await formParams(req), "student_name");
  if (!studentName) {
    return page("Missing name", "<p>Please enter your name to join the queue.</p>");
  }

  try {
    const [entry] = await db
      .insert(queue)
      .values({ studentName, serviceName: "Accounts Office", tokenNumber: `TMP-${crypto.randomUUID()}` })
      .returning({ id: queue.id });

    const token = "A" + String(entry.id).padStart(3, "0");
    await db.update(queue).set({ tokenNumber: token }).where(eq(queue.id, entry.id));

    return page(
      "You're in the queue",
      `<p>${escapeHtml(studentName)}, your token number is</p>
       <div class="token">${token}</div>
       <p><a href="/track.html">Track your position</a> · <a href="/accounts.html">Back to Accounts Office</a></p>`
    );
  } catch (error) {
    console.error("QUEUE ERROR:", error);
    return page("Something went wrong", "<p>Unable to join the queue. Please try again.</p>", 500);
  }
};

function page(title: string, body: string, status = 200) {
  const html = `<!DOCTYPE html>
<html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${title} | QueueLess</title>
<style>
  body { font-family: system-ui, sans-serif; background: #f4f7f6; display: grid; place-items: center; min-height: 100vh; margin: 0; }
  main { background: #fff; padding: 40px; border-radius: 16px; box-shadow: 0 10px 30px rgba(0,0,0,.08); text-align: center; max-width: 420px; }
  .token { font-size: 56px; font-weight: 800; color: #16806f; margin: 16px 0; }
  a { color: #16806f; }
</style></head>
<body><main><h1>${title}</h1>${body}</main></body></html>`;
  return new Response(html, { status, headers: { "Content-Type": "text/html; charset=utf-8" } });
}

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" })[c]!);
}

export const config: Config = {
  path: "/QueueServlet",
};
