function required(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env var: ${name}`);
  return v;
}

export const envServer = {
  get SUPABASE_SERVICE_ROLE_KEY() {
    return required("SUPABASE_SERVICE_ROLE_KEY");
  },
  get FOXYCART_STORE_DOMAIN() {
    return required("FOXYCART_STORE_DOMAIN");
  },
  get FOXYCART_WEBHOOK_SECRET() {
    return required("FOXYCART_WEBHOOK_SECRET");
  },
  get FOXYCART_STORE_SECRET() {
    return required("FOXYCART_STORE_SECRET");
  },
  get SITE_URL() {
    return process.env.SITE_URL;
  },
};

