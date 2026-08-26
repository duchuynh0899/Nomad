import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRight, Ruler, Info } from "lucide-react";

export const metadata: Metadata = {
  title: "Hướng dẫn chọn size",
  description: "Bảng size quần nam và áo sơ mi nam tham khảo — cách đo vòng eo, dài quần, vòng ngực để chọn đúng size.",
};

const PANTS_SIZES = [
  { size: "28", waist: "70–72", hip: "94–96", length: "98" },
  { size: "29", waist: "73–75", hip: "97–99", length: "99" },
  { size: "30", waist: "76–78", hip: "100–102", length: "100" },
  { size: "31", waist: "79–81", hip: "103–105", length: "101" },
  { size: "32", waist: "82–84", hip: "106–108", length: "102" },
  { size: "33", waist: "85–87", hip: "109–111", length: "103" },
  { size: "34", waist: "88–90", hip: "112–114", length: "104" },
];

const SHIRT_SIZES = [
  { size: "S", chest: "88–92", shoulder: "44–45", length: "70" },
  { size: "M", chest: "93–97", shoulder: "46–47", length: "72" },
  { size: "L", chest: "98–102", shoulder: "48–49", length: "74" },
  { size: "XL", chest: "103–107", shoulder: "50–51", length: "76" },
];

export default function SizeGuidePage() {
  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-12">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-xs text-muted-foreground mb-10">
        <Link href="/" className="hover:text-foreground underline-anim">
          Trang chủ
        </Link>
        <ChevronRight size={12} />
        <span className="text-foreground">Hướng dẫn chọn size</span>
      </nav>

      {/* Hero */}
      <div className="mb-12 border-b border-border pb-10">
        <p className="text-xs font-medium tracking-[0.3em] uppercase text-muted-foreground mb-3">
          Hướng dẫn
        </p>
        <h1 className="text-3xl sm:text-4xl font-medium tracking-tight mb-4">Hướng dẫn chọn size</h1>
        <p className="text-muted-foreground leading-relaxed max-w-2xl">
          Quần nam Nomad theo form basic, dễ mặc — chọn đúng size theo số đo cơ thể sẽ giúp bạn mặc thoải
          mái và lên form đẹp nhất. Bảng dưới đây là số đo tham khảo chung; mỗi sản phẩm có thể lệch nhẹ
          tuỳ kiểu dáng, vui lòng xem thêm mô tả chi tiết ở từng sản phẩm.
        </p>
      </div>

      {/* Cách đo */}
      <section className="mb-14">
        <h2 className="text-lg font-medium mb-6 flex items-center gap-2">
          <Ruler size={20} />
          Cách đo số đo cơ thể
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="border border-border p-5">
            <p className="font-medium text-sm mb-2">Vòng eo</p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Đo quanh eo tại vị trí nhỏ nhất (thường ngang rốn), thước đo ôm vừa sát, không kéo căng.
            </p>
          </div>
          <div className="border border-border p-5">
            <p className="font-medium text-sm mb-2">Dài quần</p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Đo từ đường chần lưng quần xuống gấu quần, đo dọc theo bên ngoài chân.
            </p>
          </div>
          <div className="border border-border p-5">
            <p className="font-medium text-sm mb-2">Vòng ngực (áo sơ mi)</p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Đo quanh phần ngực rộng nhất, thước đo ngang qua hai đầu núm ti, giữ thước song song mặt đất.
            </p>
          </div>
          <div className="border border-border p-5">
            <p className="font-medium text-sm mb-2">Vòng vai</p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Đo từ đầu vai trái sang đầu vai phải, đo ngang qua sau lưng.
            </p>
          </div>
        </div>
      </section>

      {/* Bảng size quần */}
      <section className="mb-14">
        <h2 className="text-lg font-medium mb-6">Bảng size quần nam (cm)</h2>
        <div className="border border-border overflow-x-auto">
          <table className="w-full text-sm min-w-[480px]">
            <thead>
              <tr className="bg-dwarfs-surface">
                <th className="text-left px-5 py-3 font-medium">Size</th>
                <th className="text-left px-5 py-3 font-medium">Vòng eo</th>
                <th className="text-left px-5 py-3 font-medium">Vòng mông</th>
                <th className="text-left px-5 py-3 font-medium">Dài quần</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {PANTS_SIZES.map((row) => (
                <tr key={row.size}>
                  <td className="px-5 py-3.5 font-medium">{row.size}</td>
                  <td className="px-5 py-3.5 text-muted-foreground">{row.waist} cm</td>
                  <td className="px-5 py-3.5 text-muted-foreground">{row.hip} cm</td>
                  <td className="px-5 py-3.5 text-muted-foreground">{row.length} cm</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Bảng size áo sơ mi */}
      <section className="mb-14">
        <h2 className="text-lg font-medium mb-6">Bảng size áo sơ mi nam (cm)</h2>
        <div className="border border-border overflow-x-auto">
          <table className="w-full text-sm min-w-[480px]">
            <thead>
              <tr className="bg-dwarfs-surface">
                <th className="text-left px-5 py-3 font-medium">Size</th>
                <th className="text-left px-5 py-3 font-medium">Vòng ngực</th>
                <th className="text-left px-5 py-3 font-medium">Vòng vai</th>
                <th className="text-left px-5 py-3 font-medium">Dài áo</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {SHIRT_SIZES.map((row) => (
                <tr key={row.size}>
                  <td className="px-5 py-3.5 font-medium">{row.size}</td>
                  <td className="px-5 py-3.5 text-muted-foreground">{row.chest} cm</td>
                  <td className="px-5 py-3.5 text-muted-foreground">{row.shoulder} cm</td>
                  <td className="px-5 py-3.5 text-muted-foreground">{row.length} cm</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Note */}
      <section className="mb-14">
        <div className="flex items-start gap-3 p-5 bg-dwarfs-surface border-l-2 border-border text-sm text-muted-foreground leading-relaxed">
          <Info size={18} className="flex-none mt-0.5" />
          <p>
            Số đo trên mang tính tham khảo, có thể chênh lệch 1–2cm tuỳ kiểu dáng (slimfit, regular,
            relaxed...). Nếu số đo của bạn nằm giữa 2 size, nên chọn size lớn hơn để thoải mái hơn khi mặc.
            Còn phân vân, hãy liên hệ với Nomad qua trang{" "}
            <Link href="/policy" className="underline-anim text-foreground">
              Chính sách đổi trả
            </Link>{" "}
            để được tư vấn trước khi đặt hàng.
          </p>
        </div>
      </section>
    </div>
  );
}
