"use client";

import { useEffect, useMemo, useState } from "react";
import { cn } from "@/lib/utils";

// Dữ liệu địa giới hành chính VN (3 cấp: Tỉnh/Thành > Quận/Huyện > Phường/Xã) từ API công khai
// provinces.open-api.vn — bản "v1" (không tiền tố /v2/), vẫn giữ cấu trúc 3 cấp cũ dù thực tế
// hành chính hiện nay đã gộp còn 2 cấp (không còn Quận/Huyện). Dùng bản cũ theo yêu cầu để form
// vẫn có đủ 3 trường Tỉnh/Quận/Phường như trước.
const API_BASE = "https://provinces.open-api.vn/api";

interface Division {
  code: number;
  name: string;
}

async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) throw new Error("Không tải được dữ liệu địa giới hành chính");
  return res.json() as Promise<T>;
}

interface VietnamAddressSelectsProps {
  province: string;
  district: string;
  ward: string;
  onChange: (next: { province: string; district: string; ward: string }) => void;
  /** Có hiện label phía trên mỗi select không — mặc định có. */
  showLabels?: boolean;
  selectClassName?: string;
  provinceWrapperClassName?: string;
  districtWrapperClassName?: string;
  wardWrapperClassName?: string;
}

export function VietnamAddressSelects({
  province,
  district,
  ward,
  onChange,
  showLabels = true,
  selectClassName = "input-base",
  provinceWrapperClassName,
  districtWrapperClassName,
  wardWrapperClassName,
}: VietnamAddressSelectsProps) {
  const [provinces, setProvinces] = useState<Division[]>([]);
  const [districts, setDistricts] = useState<Division[]>([]);
  const [wards, setWards] = useState<Division[]>([]);
  // Ghi nhớ districts/wards đã tải xong ứng với code cha nào — nhờ vậy suy ra được trạng thái
  // loading/hiển thị thuần bằng so sánh, không cần setState "loading = true" ngay trong effect.
  const [districtsLoadedFor, setDistrictsLoadedFor] = useState<number | null>(null);
  const [wardsLoadedFor, setWardsLoadedFor] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetchJson<Division[]>(`${API_BASE}/p/`)
      .then((data) => {
        if (!cancelled) setProvinces(data);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  // provinceCode/districtCode luôn được suy ra từ tên đã chọn (props) + danh sách đã tải —
  // không giữ state riêng, tránh lệch giữa giá trị hiển thị và giá trị điều khiển từ ngoài.
  const provinceCode = useMemo(
    () => provinces.find((p) => p.name === province)?.code ?? null,
    [provinces, province]
  );
  const districtCode = useMemo(
    () => districts.find((d) => d.name === district)?.code ?? null,
    [districts, district]
  );
  const wardCode = useMemo(() => wards.find((w) => w.name === ward)?.code ?? "", [wards, ward]);

  useEffect(() => {
    if (provinceCode === null) return;
    let cancelled = false;
    fetchJson<{ districts: Division[] }>(`${API_BASE}/p/${provinceCode}?depth=2`)
      .then((data) => {
        if (cancelled) return;
        setDistricts(data.districts);
        setDistrictsLoadedFor(provinceCode);
      })
      .catch(() => {
        if (cancelled) return;
        setDistricts([]);
        setDistrictsLoadedFor(provinceCode);
      });
    return () => {
      cancelled = true;
    };
  }, [provinceCode]);

  useEffect(() => {
    if (districtCode === null) return;
    let cancelled = false;
    fetchJson<{ wards: Division[] }>(`${API_BASE}/d/${districtCode}?depth=2`)
      .then((data) => {
        if (cancelled) return;
        setWards(data.wards);
        setWardsLoadedFor(districtCode);
      })
      .catch(() => {
        if (cancelled) return;
        setWards([]);
        setWardsLoadedFor(districtCode);
      });
    return () => {
      cancelled = true;
    };
  }, [districtCode]);

  // Chỉ hiện danh sách khi nó thực sự khớp với cha hiện tại (tránh nháy dữ liệu cũ khi vừa đổi
  // province/district) — đồng thời suy ra trạng thái loading, không cần state "loading" riêng.
  const loadingDistricts = provinceCode !== null && districtsLoadedFor !== provinceCode;
  const visibleDistricts = provinceCode !== null && districtsLoadedFor === provinceCode ? districts : [];
  const loadingWards = districtCode !== null && wardsLoadedFor !== districtCode;
  const visibleWards = districtCode !== null && wardsLoadedFor === districtCode ? wards : [];

  const handleProvinceChange = (value: string) => {
    const found = provinces.find((p) => String(p.code) === value);
    onChange({ province: found?.name ?? "", district: "", ward: "" });
  };

  const handleDistrictChange = (value: string) => {
    const found = visibleDistricts.find((d) => String(d.code) === value);
    onChange({ province, district: found?.name ?? "", ward: "" });
  };

  const handleWardChange = (value: string) => {
    const found = visibleWards.find((w) => String(w.code) === value);
    onChange({ province, district, ward: found?.name ?? "" });
  };

  const labelClass = "text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1.5 block";

  return (
    <>
      <div className={provinceWrapperClassName}>
        {showLabels && <label className={labelClass}>Tỉnh / Thành phố *</label>}
        <select
          value={provinceCode ?? ""}
          onChange={(e) => handleProvinceChange(e.target.value)}
          required
          className={cn(selectClassName)}
        >
          <option value="">Chọn Tỉnh/Thành phố</option>
          {provinces.map((p) => (
            <option key={p.code} value={p.code}>
              {p.name}
            </option>
          ))}
        </select>
      </div>

      <div className={districtWrapperClassName}>
        {showLabels && <label className={labelClass}>Quận / Huyện *</label>}
        <select
          value={districtCode ?? ""}
          onChange={(e) => handleDistrictChange(e.target.value)}
          disabled={provinceCode === null || loadingDistricts}
          required
          className={cn(selectClassName, "disabled:opacity-50")}
        >
          <option value="">{loadingDistricts ? "Đang tải..." : "Chọn Quận/Huyện"}</option>
          {visibleDistricts.map((d) => (
            <option key={d.code} value={d.code}>
              {d.name}
            </option>
          ))}
        </select>
      </div>

      <div className={wardWrapperClassName}>
        {showLabels && <label className={labelClass}>Phường / Xã *</label>}
        <select
          value={wardCode}
          onChange={(e) => handleWardChange(e.target.value)}
          disabled={districtCode === null || loadingWards}
          required
          className={cn(selectClassName, "disabled:opacity-50")}
        >
          <option value="">{loadingWards ? "Đang tải..." : "Chọn Phường/Xã"}</option>
          {visibleWards.map((w) => (
            <option key={w.code} value={w.code}>
              {w.name}
            </option>
          ))}
        </select>
      </div>
    </>
  );
}
