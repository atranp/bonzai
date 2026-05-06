import crypto from "node:crypto";
import { envServer } from "@/lib/env.server";

export function centsToFoxyPrice(cents: number) {
  return (cents / 100).toFixed(2);
}

export function buildFoxyCartUrl(input: {
  name: string;
  code: string;
  priceCents: number;
  quantity: number;
  orderRef: string;
}) {
  const base = new URL(`https://${envServer.FOXYCART_STORE_DOMAIN}/cart`);
  base.searchParams.set("name", input.name);
  base.searchParams.set("code", input.code);
  base.searchParams.set("price", centsToFoxyPrice(input.priceCents));
  base.searchParams.set("quantity", String(input.quantity));
  base.searchParams.set("custom_order_ref", input.orderRef);

  if (envServer.SITE_URL) {
    base.searchParams.set("redirect", `${envServer.SITE_URL}/checkout/return?ref=${encodeURIComponent(input.orderRef)}`);
  }

  return base.toString();
}

export function verifyFoxyWebhookSignature(rawBody: string, signatureHeader: string) {
  const expected = crypto
    .createHmac("sha256", envServer.FOXYCART_WEBHOOK_SECRET)
    .update(rawBody)
    .digest("hex");

  const a = Buffer.from(expected, "utf8");
  const b = Buffer.from(signatureHeader, "utf8");
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

