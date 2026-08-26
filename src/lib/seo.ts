// lib/seo.ts — hằng số & helper dùng chung cho sitemap/robots/JSON-LD.
export const SITE_URL = (process.env.NEXTAUTH_URL ?? "http://localhost:3000").replace(/\/$/, "");
export const SITE_NAME = "Nomad";

// Render JSON-LD an toàn (chặn injection qua ký tự "<" trong dữ liệu, vd tên sản phẩm chứa "</script>").
export function jsonLdScriptProps(data: unknown) {
  return {
    type: "application/ld+json",
    dangerouslySetInnerHTML: { __html: JSON.stringify(data).replace(/</g, "\\u003c") },
  } as const;
}
