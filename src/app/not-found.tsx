import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <p className="text-xs font-medium tracking-[0.3em] uppercase text-muted-foreground mb-4">
        404
      </p>
      <h1 className="text-3xl font-medium mb-4">Không tìm thấy trang</h1>
      <p className="text-muted-foreground mb-8 max-w-sm">
        Trang bạn đang tìm không tồn tại hoặc đã bị di chuyển.
      </p>
      <Link href="/" className="btn-primary">
        Về trang chủ
      </Link>
    </div>
  );
}
