"use server";

import { createSupabaseServer, getSessionUser } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

async function requireUserId() {
  const user = await getSessionUser();
  if (!user) redirect("/login?returnTo=/account/shipping");
  return user.id;
}

async function clearOtherDefaults(userId: string) {
  const supabase = await createSupabaseServer();
  const { error } = await supabase
    .from("shipping_addresses")
    .update({ is_default: false })
    .eq("user_id", userId);
  if (error) throw new Error(error.message);
}

export async function createShippingAddress(formData: FormData) {
  const userId = await requireUserId();
  const supabase = await createSupabaseServer();

  const isDefault = formData.get("is_default") === "on";

  if (isDefault) {
    await clearOtherDefaults(userId);
  }

  const { error } = await supabase.from("shipping_addresses").insert({
    user_id: userId,
    label: String(formData.get("label") ?? "").trim() || null,
    first_name: String(formData.get("first_name") ?? "").trim() || null,
    last_name: String(formData.get("last_name") ?? "").trim() || null,
    company: String(formData.get("company") ?? "").trim() || null,
    address1: String(formData.get("address1") ?? "").trim(),
    address2: String(formData.get("address2") ?? "").trim() || null,
    city: String(formData.get("city") ?? "").trim(),
    region: String(formData.get("region") ?? "").trim() || null,
    postal_code: String(formData.get("postal_code") ?? "").trim(),
    country: String(formData.get("country") ?? "US").trim() || "US",
    phone: String(formData.get("phone") ?? "").trim() || null,
    is_default: isDefault,
  });

  if (error) throw new Error(error.message);
  revalidatePath("/account/shipping");
}

export async function updateShippingAddress(formData: FormData) {
  const userId = await requireUserId();
  const id = String(formData.get("id") ?? "");
  if (!id) throw new Error("Missing address id");

  const supabase = await createSupabaseServer();
  const isDefault = formData.get("is_default") === "on";

  if (isDefault) {
    await clearOtherDefaults(userId);
  }

  const { error } = await supabase
    .from("shipping_addresses")
    .update({
      label: String(formData.get("label") ?? "").trim() || null,
      first_name: String(formData.get("first_name") ?? "").trim() || null,
      last_name: String(formData.get("last_name") ?? "").trim() || null,
      company: String(formData.get("company") ?? "").trim() || null,
      address1: String(formData.get("address1") ?? "").trim(),
      address2: String(formData.get("address2") ?? "").trim() || null,
      city: String(formData.get("city") ?? "").trim(),
      region: String(formData.get("region") ?? "").trim() || null,
      postal_code: String(formData.get("postal_code") ?? "").trim(),
      country: String(formData.get("country") ?? "US").trim() || "US",
      phone: String(formData.get("phone") ?? "").trim() || null,
      is_default: isDefault,
    })
    .eq("id", id)
    .eq("user_id", userId);

  if (error) throw new Error(error.message);
  revalidatePath("/account/shipping");
}

export async function deleteShippingAddress(formData: FormData) {
  const userId = await requireUserId();
  const id = String(formData.get("id") ?? "");
  if (!id) throw new Error("Missing address id");

  const supabase = await createSupabaseServer();
  const { error } = await supabase
    .from("shipping_addresses")
    .delete()
    .eq("id", id)
    .eq("user_id", userId);

  if (error) throw new Error(error.message);
  revalidatePath("/account/shipping");
}

export async function setDefaultShippingAddress(formData: FormData) {
  const userId = await requireUserId();
  const id = String(formData.get("id") ?? "");
  if (!id) throw new Error("Missing address id");

  await clearOtherDefaults(userId);
  const supabase = await createSupabaseServer();
  const { error } = await supabase
    .from("shipping_addresses")
    .update({ is_default: true })
    .eq("id", id)
    .eq("user_id", userId);

  if (error) throw new Error(error.message);
  revalidatePath("/account/shipping");
}
