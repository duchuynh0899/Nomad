import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "@/styles/globals.css";
import { Header } from "@/components/layout/Header";
import { CouponBanner } from "@/components/layout/CouponBanner";
import { Footer } from "@/components/layout/Footer";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { ToastProvider } from "@/components/ui/Toast";
import { Providers } from "./providers";
import { SITE_URL, SITE_NAME, jsonLdScriptProps } from "@/lib/seo";

const inter = Inter({
  subsets: ["latin", "vietnamese"],
  variable: "--font-sans",
  display: "swap",
});

// Trang tĩnh (home, login, policy...) dùng chung layout này — revalidate định kỳ để
// danh mục/sản phẩm mới từ backend không bị "đứng hình" mãi sau lần build gần nhất.
export const revalidate = 60;

const TITLE = "Nomad – Quần nam basic, dễ phối, dễ mặc";
const DESCRIPTION =
  "Nomad chuyên quần nam form basic và áo sơ mi tối giản — thiết kế đơn giản, hiện đại, dễ ứng dụng, chất liệu bền cho nhịp sống hằng ngày.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    template: "%s | Nomad",
    default: TITLE,
  },
  description: DESCRIPTION,
  keywords: [
    "quần nam",
    "quần nam basic",
    "áo sơ mi nam",
    "thời trang nam tối giản",
    "menswear basic",
    "Nomad",
  ],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "vi_VN",
    siteName: SITE_NAME,
    title: TITLE,
    description: DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
  },
  robots: {
    index: true,
    follow: true,
  },
};

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: SITE_NAME,
  url: SITE_URL,
};

const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: SITE_NAME,
  url: SITE_URL,
  potentialAction: {
    "@type": "SearchAction",
    target: `${SITE_URL}/shop?q={search_term_string}`,
    "query-input": "required name=search_term_string",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        <script {...jsonLdScriptProps(organizationJsonLd)} />
        <script {...jsonLdScriptProps(websiteJsonLd)} />
        <Providers>
          <ToastProvider>
            <div className="flex min-h-screen flex-col">
              <CouponBanner />
              <Header />
              <main className="flex-1">{children}</main>
              <Footer />
            </div>
            <CartDrawer />
          </ToastProvider>
        </Providers>
      </body>
    </html>
  );
}
