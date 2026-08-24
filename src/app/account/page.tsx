import type { Metadata } from "next";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { AccountClient } from "@/components/account/AccountClient";
import { log } from "console";

export const metadata: Metadata = {
  title: "Tài khoản của tôi | Nomad",
};

export default async function AccountPage() {
  const session = await getServerSession(authOptions);

  console.log(session);
  

//   if (!session) {
//     redirect("/login");
//   }

  return <AccountClient user={session?.user} />;
}