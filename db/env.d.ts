declare namespace Cloudflare {
  interface Env {
    DB: D1Database;
    FILES: R2Bucket;
    SITE_URL?: string;
    MOMO_PARTNER_CODE?: string;
    MOMO_ACCESS_KEY?: string;
    MOMO_SECRET_KEY?: string;
    MOVA_ADMIN_EMAIL?: string;
  }
}
