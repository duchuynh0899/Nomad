import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { adminListCoupons } from "@/lib/api/coupons";
import { CouponForm } from "@/components/admin/CouponForm";

export default async function EditCouponPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  const accessToken = session?.accessToken as string;

  const { items: coupons } = await adminListCoupons(accessToken, { limit: 100 });
  const coupon = coupons.find((c) => c._id === id);
  if (!coupon) notFound();

  return (
    <div>
      <h1 className="text-xl font-medium mb-8">Sửa mã giảm giá</h1>
      <CouponForm initialData={coupon} />
    </div>
  );
}
