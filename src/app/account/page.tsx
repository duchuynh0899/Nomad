import type { Metadata } from "next";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { AccountClient } from "@/components/account/AccountClient";

export const metadata: Metadata = {
  title: "Tài khoản của tôi",
};

export default async function AccountPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  return <AccountClient user={session.user} />;
}