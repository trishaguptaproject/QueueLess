// Shared helpers for the servlet-compatible functions.

export const MINUTES_PER_STUDENT = 5;

export function json(data: unknown, status = 200) {
  return Response.json(data, { status });
}

// The pages post application/x-www-form-urlencoded bodies, like the old servlets expected.
export async function formParams(req: Request) {
  return new URLSearchParams(await req.text());
}

export function field(params: URLSearchParams, name: string) {
  return (params.get(name) || "").trim();
}

export function serverError(label: string, error: unknown) {
  console.error(`${label} ERROR:`, error);
  return json({ success: false, message: "Server error. Please try again later." }, 500);
}
