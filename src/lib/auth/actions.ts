"use server";

import { createSupabaseServer } from "@/lib/supabase/server";
import { getSiteOrigin } from "@/lib/site";
import { redirect } from "next/navigation";

function safeReturnTo(raw: string | null): string {
  if (!raw || !raw.startsWith("/") || raw.startsWith("//")) return "/account";
  return raw;
}

export async function signIn(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const returnTo = safeReturnTo(String(formData.get("returnTo") ?? "/account"));

  if (!email || !password) {
    redirect(`/login?error=${encodeURIComponent("Email and password required.")}&returnTo=${encodeURIComponent(returnTo)}`);
  }

  const supabase = await createSupabaseServer();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    redirect(
      `/login?error=${encodeURIComponent(error.message)}&returnTo=${encodeURIComponent(returnTo)}`,
    );
  }

  redirect(returnTo);
}

export async function signUp(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const returnTo = safeReturnTo(String(formData.get("returnTo") ?? "/account"));

  if (!email || !password) {
    redirect(`/signup?error=${encodeURIComponent("Email and password required.")}&returnTo=${encodeURIComponent(returnTo)}`);
  }

  if (password.length < 8) {
    redirect(
      `/signup?error=${encodeURIComponent("Password must be at least 8 characters.")}&returnTo=${encodeURIComponent(returnTo)}`,
    );
  }

  const supabase = await createSupabaseServer();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${getSiteOrigin()}/login`,
    },
  });

  if (error) {
    redirect(
      `/signup?error=${encodeURIComponent(error.message)}&returnTo=${encodeURIComponent(returnTo)}`,
    );
  }

  if (!data.session) {
    redirect(
      `/login?notice=${encodeURIComponent("Check your email to confirm your account, then sign in.")}&returnTo=${encodeURIComponent(returnTo)}`,
    );
  }

  redirect(returnTo);
}
