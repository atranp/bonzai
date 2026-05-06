import { NextResponse } from "next/server";
import { createSupabaseServer } from "@/lib/supabase/server";

async function readBody(request: Request): Promise<Record<string, unknown> | null> {
  const ct = request.headers.get("content-type") ?? "";
  if (ct.includes("application/json")) {
    try {
      const j = (await request.json()) as unknown;
      return j && typeof j === "object" ? (j as Record<string, unknown>) : null;
    } catch {
      return null;
    }
  }

  if (ct.includes("application/x-www-form-urlencoded") || ct.includes("multipart/form-data")) {
    try {
      const fd = await request.formData();
      const out: Record<string, unknown> = {};
      for (const [k, v] of fd.entries()) out[k] = v;
      return out;
    } catch {
      return null;
    }
  }

  // Best-effort fallback.
  try {
    const j = (await request.json()) as unknown;
    return j && typeof j === "object" ? (j as Record<string, unknown>) : null;
  } catch {
    return null;
  }
}

export async function POST(request: Request) {
  const supabase = await createSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const body = await readBody(request);
  if (!body) return NextResponse.json({ error: "invalid_body" }, { status: 400 });

  const id =
    typeof body.id === "string"
      ? body.id
      : "";
  const qtyRaw =
    typeof body.qty === "number"
      ? body.qty
      : typeof body.qty === "string"
        ? Number(body.qty)
        : 1;
  const qty = Math.max(1, Math.min(99, Math.floor(qtyRaw || 1)));

  if (!id) {
    return NextResponse.json({ error: "missing_id" }, { status: 400 });
  }

  const { error } = await supabase
    .from("cart_items")
    .update({ qty })
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // If coming from a form submission, send them back to /cart.
  if ((request.headers.get("accept") ?? "").includes("text/html")) {
    return NextResponse.redirect(new URL("/cart", request.url), 303);
  }

  return NextResponse.json({ ok: true });
}

