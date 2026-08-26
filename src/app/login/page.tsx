// app/dang-nhap/page.tsx
import type { Metadata } from "next";
import { AuthForm } from "@/components/auth/AuthForm";

export const metadata: Metadata = {
  title: "Đăng nhập",
};

export default function LoginPage() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <AuthForm mode="login" />
    </div>
  );
}