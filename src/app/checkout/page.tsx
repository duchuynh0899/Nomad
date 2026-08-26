import { CheckoutClient } from "@/components/checkout/CheckoutClient";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Thanh toán",
};

export default function CheckoutPage() {
  return <CheckoutClient />;
}
