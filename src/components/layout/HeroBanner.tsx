import Link from "next/link";

export function HeroBanner() {
  return (
    <section className="relative min-h-[70vh] overflow-hidden mb-10">
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1696967648017-8a8d41bef9e8')"}}
      />

      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-black/40" />

      {/* Content */}
      <div className="relative z-10 mx-auto flex min-h-[80vh] max-w-7xl items-center px-4 sm:px-6 lg:px-8">
        <div className="max-w-xl text-white">
          <p className="mb-4 text-xs font-medium tracking-[0.3em] uppercase text-white/70">
            Quần nam basic
          </p>

          <h1 className="text-5xl md:text-6xl lg:text-7xl font-light leading-tight">
            Đơn giản.
            <br />
            <span
              className="font-normal"
              style={{
                fontFamily: "var(--font-display, Georgia, serif)",
              }}
            >
              Dễ mặc mỗi ngày.
            </span>
          </h1>

          <p className="mt-6 max-w-md text-base text-white/80 leading-relaxed">
            Quần nam form basic cùng áo sơ mi tối giản — ít lựa chọn nhưng món nào cũng dễ phối,
            dễ mặc, hợp với nhịp sống hiện đại. Chất liệu bền, thiết kế không lỗi mốt theo thời gian.
          </p>

          <div className="mt-8 flex flex-col gap-4 sm:flex-row">
            <Link
              href="/shop"
              className="inline-flex items-center justify-center bg-white px-8 py-3 text-sm font-medium text-black transition hover:bg-white/90"
            >
              Xem quần nam
            </Link>

            <Link
              href="/shop?filter=new"
              className="inline-flex items-center justify-center border border-white px-8 py-3 text-sm font-medium text-white transition hover:bg-white hover:text-black"
            >
              Hàng mới về
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
