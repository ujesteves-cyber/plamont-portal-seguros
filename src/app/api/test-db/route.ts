import { NextResponse } from "next/server";

export async function GET() {
  try {
    const url = process.env.DATABASE_URL;
    if (!url) {
      return NextResponse.json({ error: "DATABASE_URL not set" });
    }

    // Show connection string (masked password)
    const masked = url.replace(/:[^@]+@/, ":***@");

    const postgres = (await import("postgres")).default;
    const sql = postgres(url, { prepare: false });

    const result = await sql`SELECT id, email, role, is_approved FROM users LIMIT 5`;
    await sql.end();

    return NextResponse.json({ ok: true, connection: masked, users: result });
  } catch (err: any) {
    return NextResponse.json({
      ok: false,
      error: err.message,
      code: err.code,
      stack: err.stack?.split("\n").slice(0, 3),
    });
  }
}
