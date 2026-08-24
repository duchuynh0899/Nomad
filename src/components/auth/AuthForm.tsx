"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/Toast";
import { SocialButtons } from "./SocialButtons";

interface AuthFormProps {
  mode: "login" | "register";
}

export function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const isRegister = mode === "register";

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Vui lòng nhập đầy đủ thông tin");
      return;
    }
    if (isRegister) {
      if (!name.trim()) {
        setError("Vui lòng nhập họ tên");
        return;
      }
      if (password.length < 6) {
        setError("Mật khẩu phải có ít nhất 6 ký tự");
        return;
      }
      if (password !== confirmPassword) {
        setError("Mật khẩu xác nhận không khớp");
        return;
      }
      if (!agreeTerms) {
        setError("Vui lòng đồng ý với điều khoản sử dụng");
        return;
      }
    }

    setLoading(true);
    try {
      if (isRegister) {
        // TODO: gọi API tạo tài khoản thật
        const res = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, email, password }),
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.message || "Đăng ký thất bại");
        }
        toast("Đăng ký thành công! Đang đăng nhập...", "success");
      }

      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("Email hoặc mật khẩu không đúng");
        setLoading(false);
        return;
      }

      router.push("/");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Có lỗi xảy ra");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-sm mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-medium tracking-tight">
          {isRegister ? "Tạo tài khoản" : "Đăng nhập"}
        </h1>
        <p className="text-sm text-muted-foreground mt-2">
          {isRegister
            ? "Đăng ký để nhận voucher độc quyền và theo dõi đơn hàng"
            : "Chào mừng bạn quay lại Nomad"}
        </p>
      </div>

      <SocialButtons />

      <div className="flex items-center gap-3 my-6">
        <div className="flex-1 h-px bg-border" />
        <span className="text-xs text-muted-foreground">hoặc</span>
        <div className="flex-1 h-px bg-border" />
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {isRegister && (
          <div>
            <label className="text-xs font-medium tracking-widest uppercase mb-2 block">
              Họ tên
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border border-border px-3 py-2.5 text-sm focus:outline-none focus:border-dwarfs-dark"
              placeholder="Nguyễn Văn A"
            />
          </div>
        )}

        <div>
          <label className="text-xs font-medium tracking-widest uppercase mb-2 block">
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border border-border px-3 py-2.5 text-sm focus:outline-none focus:border-dwarfs-dark"
            placeholder="ban@email.com"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-medium tracking-widest uppercase">
              Mật khẩu
            </label>
            {!isRegister && (
              <Link href="/quen-mat-khau" className="text-xs text-muted-foreground underline-anim">
                Quên mật khẩu?
              </Link>
            )}
          </div>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-border px-3 py-2.5 text-sm pr-10 focus:outline-none focus:border-dwarfs-dark"
              placeholder="••••••••"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        {isRegister && (
          <div>
            <label className="text-xs font-medium tracking-widest uppercase mb-2 block">
              Xác nhận mật khẩu
            </label>
            <input
              type={showPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full border border-border px-3 py-2.5 text-sm focus:outline-none focus:border-dwarfs-dark"
              placeholder="••••••••"
            />
          </div>
        )}

        {isRegister && (
          <label className="flex items-start gap-2.5 text-xs text-muted-foreground">
            <input
              type="checkbox"
              checked={agreeTerms}
              onChange={(e) => setAgreeTerms(e.target.checked)}
              className="mt-0.5"
            />
            <span>
              Tôi đồng ý với{" "}
              <Link href="/dieu-khoan" className="underline-anim text-foreground">
                Điều khoản sử dụng
              </Link>{" "}
              và{" "}
              <Link href="/chinh-sach-bao-mat" className="underline-anim text-foreground">
                Chính sách bảo mật
              </Link>
            </span>
          </label>
        )}

        {error && <p className="text-xs text-red-500">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className={cn("btn-primary w-full", loading && "opacity-60 cursor-not-allowed")}
        >
          {loading ? "Đang xử lý..." : isRegister ? "Đăng ký" : "Đăng nhập"}
        </button>
      </form>

      <p className="text-center text-sm text-muted-foreground mt-6">
        {isRegister ? (
          <>
            Đã có tài khoản?{" "}
            <Link href="/login" className="text-foreground font-medium underline-anim">
              Đăng nhập
            </Link>
          </>
        ) : (
          <>
            Chưa có tài khoản?{" "}
            <Link href="/register" className="text-foreground font-medium underline-anim">
              Đăng ký ngay
            </Link>
          </>
        )}
      </p>
    </div>
  );
}