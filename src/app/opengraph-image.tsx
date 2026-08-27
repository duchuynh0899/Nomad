import { ImageResponse } from "next/og";

// Ảnh chia sẻ mặc định (og:image, và twitter:image qua fallback chuẩn của Twitter khi
// không có twitter-image riêng) cho mọi trang không tự set ảnh riêng — trang chủ, /shop,
// policy... Trang sản phẩm/danh mục vẫn override bằng ảnh thật của họ qua generateMetadata.
// Chỉ dùng chữ Latin không dấu (NOMAD + tagline tiếng Anh) vì next/og không có sẵn font
// hỗ trợ dấu tiếng Việt trong dự án này.
export const alt = "Nomad — Menswear essentials";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#1A1A1A",
          color: "#FAFAFA",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            fontSize: 120,
            fontWeight: 500,
            letterSpacing: 24,
            paddingLeft: 24,
          }}
        >
          NOMAD
        </div>
        <div
          style={{
            marginTop: 28,
            fontSize: 28,
            letterSpacing: 6,
            color: "#D8D8D6",
            textTransform: "uppercase",
          }}
        >
          Menswear Essentials
        </div>
      </div>
    ),
    { ...size }
  );
}
