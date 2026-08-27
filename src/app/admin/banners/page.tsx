import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { adminListBanners } from "@/lib/api/banners";
import { BannerManager } from "@/components/admin/BannerManager";

export default async function AdminBannersPage() {
  const session = await getServerSession(authOptions);
  const accessToken = session?.accessToken as string;
  const banners = await adminListBanners(accessToken);

  return (
    <div>
      <h1 className="text-xl font-medium mb-8">Banner trang chủ</h1>
      <BannerManager initialBanners={banners} />
    </div>
  );
}
