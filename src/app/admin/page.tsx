import { Package, ShoppingBag, Users, DollarSign } from "lucide-react";
import { formatPrice } from "@/lib/utils";

// TODO: thay bằng query DB thật
const STATS = {
  revenue: 45890000,
  orders: 128,
  products: 64,
  customers: 312,
};

export default function AdminDashboard() {
  const cards = [
    { label: "Doanh thu tháng này", value: formatPrice(STATS.revenue), icon: DollarSign },
    { label: "Đơn hàng", value: STATS.orders, icon: ShoppingBag },
    { label: "Sản phẩm", value: STATS.products, icon: Package },
    { label: "Khách hàng", value: STATS.customers, icon: Users },
  ];

  return (
    <div>
      <h1 className="text-xl font-medium mb-8">Tổng quan</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.label} className="bg-white border border-border p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-muted-foreground">{card.label}</span>
                <Icon size={16} className="text-muted-foreground" />
              </div>
              <p className="text-2xl font-medium">{card.value}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}