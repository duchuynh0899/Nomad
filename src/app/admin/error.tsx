"use client";

import Link from "next/link";

export default function AdminError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <p className="text-xs font-medium tracking-[0.3em] uppercase text-muted-foreground mb-4">Lỗi</p>
      <h1 className="text-3xl font-medium mb-4">Không tải được trang</h1>
      <p className="text-muted-foreground mb-8 max-w-sm">
        Có thể phiên đăng nhập đã hết hạn hoặc có lỗi tạm thời. Thử lại hoặc đăng nhập lại.
      </p>
      <div className="flex items-center gap-4">
        <button onClick={() => reset()} className="btn-primary">
          Thử lại
        </button>
        <Link href="/login" className="underline-anim text-sm">
          Đăng nhập lại
        </Link>
      </div>
    </div>
  );
}
