"use client";

import { useEffect, useState } from "react";
import Script from "next/script";

// SDK nhúng của PayOS (khác @payos/node ở backend) — chỉ load qua <script>, không có trên npm,
// nên khai báo global thủ công. Tài liệu: https://payos.vn (mục "Nhúng cổng thanh toán").
interface PayOSEmbeddedInstance {
  open: () => void;
  exit: () => void;
}

interface PayOSEmbeddedConfig {
  RETURN_URL: string;
  ELEMENT_ID: string;
  CHECKOUT_URL: string;
  embedded: boolean;
  onSuccess?: (event: unknown) => void;
  onCancel?: (event: unknown) => void;
  onExit?: (event: unknown) => void;
}

declare global {
  interface Window {
    PayOSCheckout?: {
      usePayOS: (config: PayOSEmbeddedConfig) => PayOSEmbeddedInstance;
    };
  }
}

const ELEMENT_ID = "payos-embedded-checkout";

interface PayosEmbeddedCheckoutProps {
  checkoutUrl: string;
  returnUrl: string;
  onSuccess: () => void;
  onCancel?: () => void;
}

export function PayosEmbeddedCheckout({
  checkoutUrl,
  returnUrl,
  onSuccess,
  onCancel,
}: PayosEmbeddedCheckoutProps) {
  const [scriptLoaded, setScriptLoaded] = useState(false);

  useEffect(() => {
    if (!scriptLoaded || !window.PayOSCheckout) return;
    const instance = window.PayOSCheckout.usePayOS({
      RETURN_URL: returnUrl,
      ELEMENT_ID,
      CHECKOUT_URL: checkoutUrl,
      embedded: true,
      onSuccess: () => onSuccess(),
      onCancel: () => onCancel?.(),
    });
    instance.open();
    return () => instance.exit();
  }, [scriptLoaded, checkoutUrl, returnUrl, onSuccess, onCancel]);

  return (
    <>
      <Script
        src="https://cdn.payos.vn/payos-checkout/v1/stable/payos-initialize.js"
        strategy="afterInteractive"
        onLoad={() => setScriptLoaded(true)}
      />
      <div id={ELEMENT_ID} className="min-h-[350px]" />
    </>
  );
}
