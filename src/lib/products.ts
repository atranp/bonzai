import { cache } from "react";
import { createSupabaseAnon } from "@/lib/supabase/anon";

export type Product = {
  id: string;
  slug: string;
  name: string;
  subtitle: string | null;
  description_md: string;
  price_cents: number;
  currency: string;
  foxy_code: string;
  image_url: string | null;
  meta: Record<string, unknown>;
};

export async function listActiveProducts(): Promise<Product[]> {
  const supabase = createSupabaseAnon();
  const { data, error } = await supabase
    .from("products")
    .select(
      "id,slug,name,subtitle,description_md,price_cents,currency,foxy_code,image_url,meta",
    )
    .eq("active", true)
    .order("name", { ascending: true });

  if (error) throw new Error(error.message);
  return (data ?? []) as Product[];
}

async function loadProductBySlug(slug: string): Promise<Product | null> {
  const supabase = createSupabaseAnon();
  const { data, error } = await supabase
    .from("products")
    .select(
      "id,slug,name,subtitle,description_md,price_cents,currency,foxy_code,image_url,meta",
    )
    .eq("slug", slug)
    .eq("active", true)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return (data ?? null) as Product | null;
}

/** Dedupe within a single render (generateMetadata + page). */
export const getProductBySlug = cache(loadProductBySlug);

