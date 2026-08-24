import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "@/styles/globals.css";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { ToastProvider } from "@/components/ui/Toast";
import { Providers } from "./providers";

const inter = Inter({
  subsets: ["latin", "vietnamese"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    template: "%s | Nomad",
    default: "%s | Nomad – Thời trang tối giản",
  },
  description:
    "Bộ sưu tập áo và quần %s | Nomad – thiết kế tối giản, chất liệu cao cấp, phù hợp cho phong cách sống hiện đại.",
  keywords: ["thời trang", "áo", "quần", "minimalist", "%s | Nomad"],
  openGraph: {
    type: "website",
    locale: "vi_VN",
    url: "https://%s | Nomad.vn",
    siteName: "%s | Nomad",
    title: "%s | Nomad – Thời trang tối giản",
    description:
      "Bộ sưu tập áo và quần %s | Nomad – thiết kế tối giản, chất liệu cao cấp.",
  },
  robots: {
    index: true,
    follow: true,
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
        <Providers>
          <ToastProvider>
            <div className="flex min-h-screen flex-col">
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
