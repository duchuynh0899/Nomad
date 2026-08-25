"use client";

import { useState } from "react";
import { Download, Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/Toast";
import { useAuthFetch } from "@/lib/api/auth-fetch";
import { adminExportOrdersCsv } from "@/lib/api/orders";
import type { ListOrdersParams } from "@/types/api";

export function ExportOrdersCsvButton({ filters }: { filters: ListOrdersParams }) {
  const { toast } = useToast();
  const { authFetch } = useAuthFetch();
  const [loading, setLoading] = useState(false);

  const handleExport = async () => {
    setLoading(true);
    try {
      const blob = await authFetch((token) => adminExportOrdersCsv(token, filters));
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `don-hang-${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch {
      toast("Xuất CSV thất bại, thử lại sau", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button onClick={handleExport} disabled={loading} className="btn-outline flex items-center gap-2 text-sm">
      {loading ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
      Xuất CSV
    </button>
  );
}
