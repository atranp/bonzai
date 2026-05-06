import crypto from "node:crypto";
import { envServer } from "@/lib/env.server";
import { absoluteUrl } from "@/lib/site";

export function centsToFoxyPrice(cents: number) {
  return (cents / 100).toFixed(2);
}

function escapeHtmlCompat(input: string) {
  // FoxyCart's docs reference PHP htmlspecialchars(…, ENT_COMPAT).
  // We mimic the relevant behavior for deterministic HMAC input.
  return input
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function foxyHmac(valueToSign: string) {
  return crypto
    .createHmac("sha256", envServer.FOXYCART_STORE_SECRET)
    .update(valueToSign)
    .digest("hex");
}

function signedParamName(paramName: string, paramValue: string, productCode: string) {
  // Signature input: {code}{name}{value} (value is NOT URL-encoded)
  // https://docs.foxycart.com/v/2.0/hmac_validation
  const signingString = escapeHtmlCompat(`${productCode}${paramName}${paramValue}`);
  const sig = foxyHmac(signingString);
  return `${paramName}||${sig}`;
}

function signedUrlKey(
  prefix: string | null,
  paramName: string,
  paramValue: string,
  productCode: string,
) {
  // If using numeric prefixes like "2:name", Foxy requires generating the hash
  // without the "2:" part. So we sign "name" but emit "2:name||<sig>".
  const signed = signedParamName(paramName, paramValue, productCode);
  return prefix ? `${prefix}:${signed}` : signed;
}

export function buildFoxyCartUrl(input: {
  name: string;
  code: string;
  priceCents: number;
  quantity: number;
  orderRef: string;
  userId: string;
}) {
  const base = new URL(`https://${envServer.FOXYCART_STORE_DOMAIN}/cart`);
  const price = centsToFoxyPrice(input.priceCents);
  const quantity = String(input.quantity);

  base.searchParams.set(
    signedUrlKey(null, "name", input.name, input.code),
    input.name,
  );
  base.searchParams.set(
    signedUrlKey(null, "code", input.code, input.code),
    input.code,
  );
  base.searchParams.set(signedUrlKey(null, "price", price, input.code), price);
  base.searchParams.set(
    signedUrlKey(null, "quantity", quantity, input.code),
    quantity,
  );
  base.searchParams.set(
    signedUrlKey(null, "custom_order_ref", input.orderRef, input.code),
    input.orderRef,
  );
  base.searchParams.set(
    signedUrlKey(null, "custom_user_id", input.userId, input.code),
    input.userId,
  );

  // Per FoxyCart docs, "redirect" is excluded from validation/hashing.
  base.searchParams.set(
    "redirect",
    absoluteUrl(`/checkout/return?ref=${encodeURIComponent(input.orderRef)}`),
  );

  return base.toString();
}

export function buildFoxyCartUrlMulti(input: {
  items: Array<{
    name: string;
    code: string;
    priceCents: number;
    quantity: number;
  }>;
  orderRef: string;
  userId: string;
}) {
  const base = new URL(`https://${envServer.FOXYCART_STORE_DOMAIN}/cart`);

  input.items.forEach((item, idx) => {
    const prefix = String(idx + 1);
    const price = centsToFoxyPrice(item.priceCents);
    const quantity = String(item.quantity);

    base.searchParams.set(
      signedUrlKey(prefix, "name", item.name, item.code),
      item.name,
    );
    base.searchParams.set(
      signedUrlKey(prefix, "code", item.code, item.code),
      item.code,
    );
    base.searchParams.set(signedUrlKey(prefix, "price", price, item.code), price);
    base.searchParams.set(
      signedUrlKey(prefix, "quantity", quantity, item.code),
      quantity,
    );

    // Attach custom fields to each item so the webhook can find them regardless
    // of which item Foxy chooses to treat as "primary".
    base.searchParams.set(
      signedUrlKey(prefix, "custom_order_ref", input.orderRef, item.code),
      input.orderRef,
    );
    base.searchParams.set(
      signedUrlKey(prefix, "custom_user_id", input.userId, item.code),
      input.userId,
    );
  });

  if (envServer.SITE_URL) {
    // no-op; kept for backward compatibility in case envServer.SITE_URL is relied on elsewhere
  }

  base.searchParams.set(
    "redirect",
    absoluteUrl(`/checkout/return?ref=${encodeURIComponent(input.orderRef)}`),
  );

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

