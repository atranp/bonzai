import { createSupabaseService } from "@/lib/supabase/service";

export type OrderItem = {
  id: string;
  product_id: string | null;
  name_snapshot: string;
  price_cents: number;
  qty: number;
  line_total_cents: number;
};

export type Order = {
  id: string;
  order_ref: string;
  status: string;
  email: string | null;
  subtotal_cents: number;
  shipping_cents: number;
  tax_cents: number;
  total_cents: number;
  currency: string;
  shipping_address: unknown | null;
  foxy_transaction_id: string | null;
  created_at: string;
  order_items?: OrderItem[];
};

export async function getOrderByRef(orderRef: string): Promise<Order | null> {
  const supabase = createSupabaseService();
  const { data, error } = await supabase
    .from("orders")
    .select(
      "id,order_ref,status,email,subtotal_cents,shipping_cents,tax_cents,total_cents,currency,shipping_address,foxy_transaction_id,created_at,order_items(id,product_id,name_snapshot,price_cents,qty,line_total_cents)",
    )
    .eq("order_ref", orderRef)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return (data ?? null) as Order | null;
}

