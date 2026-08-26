import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { adminGetShippingSettings } from "@/lib/api/settings";
import { ShippingSettingsForm } from "@/components/admin/ShippingSettingsForm";

export default async function ShippingSettingsPage() {
  const session = await getServerSession(authOptions);
  const accessToken = session?.accessToken as string;
  const settings = await adminGetShippingSettings(accessToken);

  return (
    <div>
      <h1 className="text-xl font-medium mb-8">Cấu hình phí vận chuyển</h1>
      <ShippingSettingsForm initialData={settings} />
    </div>
  );
}
