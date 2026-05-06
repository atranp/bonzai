import { createSupabaseServer } from "@/lib/supabase/server";
import type { Order } from "@/lib/orders";

export async function listMyOrders(): Promise<Order[]> {
  const supabase = await createSupabaseServer();
  const { data, error } = await supabase
    .from("orders")
    .select(
      "id,order_ref,status,email,subtotal_cents,shipping_cents,tax_cents,total_cents,currency,shipping_address,payment_summary,foxy_transaction_id,created_at,order_items(id,product_id,name_snapshot,price_cents,qty,line_total_cents)",
    )
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []) as Order[];
}