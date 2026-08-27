"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ChevronRight, ShoppingBag, Tag, Truck, Loader2, Banknote, QrCode, Check } from "lucide-react";
import { cn, formatPrice } from "@/lib/utils";
import { VietnamAddressSelects } from "@/components/shared/VietnamAddressSelects";
import { useCartStore } from "@/lib/cart-store";
import { useToast } from "@/components/ui/Toast";
import { useAuthFetch } from "@/lib/api/auth-fetch";
import { createOrder } from "@/lib/api/orders";
import { createAddress, listMyAddresses } from "@/lib/api/addresses";
import { validateCoupon } from "@/lib/api/coupons";
import { ApiError } from "@/lib/api/http";
import { PayosEmbeddedCheckout } from "./PayosEmbeddedCheckout";
import type { Address, PaymentMethod, ShippingAddress } from "@/types";

const PAYMENT_METHODS: { id: PaymentMethod; label: string; description: string; icon: React.ReactNode }[] = [
  {
    id: "cod",
    label: "Thanh toán khi nhận hàng (COD)",
    description: "Trả tiền mặt khi nhận hàng.",
    icon: <Banknote size={18} />,
  },
  {
    id: "payos",
    label: "Thanh toán online (PayOS)",
    description: "Quét QR hoặc thanh toán qua ngân hàng/ví điện tử — chuyển sang trang PayOS an toàn.",
    icon: <QrCode size={18} />,
  },
];

type Step = "info" | "review";

const STEP_LABELS: { id: Step; label: string }[] = [
  { id: "info", label: "Thông tin giao hàng" },
  { id: "review", label: "Xác nhận & đặt hàng" },
];

export function CheckoutClient() {
  const router = useRouter();
  const { items, total, clearCart } = useCartStore();
  const { toast } = useToast();
  const { authFetch, accessToken } = useAuthFetch();

  const [step, setStep] = useState<Step>("info");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discount: number } | null>(null);
  const [couponError, setCouponError] = useState("");
  const [couponChecking, setCouponChecking] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cod");
  const [placedOrderId, setPlacedOrderId] = useState<string | null>(null);
  const [payosCheckoutUrl, setPayosCheckoutUrl] = useState<string | null>(null);

  const [form, setForm] = useState<ShippingAddress & { note: string }>({
    recipientName: "",
    phone: "",
    province: "",
    district: "",
    ward: "",
    addressLine: "",
    note: "",
  });

  const [savedAddresses, setSavedAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [saveAddress, setSaveAddress] = useState(false);

  const applySavedAddress = (address: Address) => {
    setSelectedAddressId(address._id);
    setForm((prev) => ({
      ...prev,
      recipientName: address.recipientName,
      phone: address.phone,
      province: address.province,
      district: address.district,
      ward: address.ward,
      addressLine: address.addressLine,
    }));
  };

  const useNewAddress = () => {
    setSelectedAddressId(null);
    setForm((prev) => ({
      ...prev,
      recipientName: "",
      phone: "",
      province: "",
      district: "",
      ward: "",
      addressLine: "",
    }));
  };

  useEffect(() => {
    if (!accessToken) return;
    authFetch((token) => listMyAddresses(token))
      .then((list) => {
        setSavedAddresses(list);
        const preferred = list.find((a) => a.isDefault) ?? list[0];
        if (preferred) applySavedAddress(preferred);
      })
      .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accessToken]);

  const subtotal = total();
  const discount = appliedCoupon?.discount ?? 0;

  // Redirect if cart is empty
  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <ShoppingBag size={48} className="text-muted-foreground/30 mb-4" />
        <p className="text-lg font-medium mb-2">Giỏ hàng trống</p>
        <p className="text-sm text-muted-foreground mb-6">Hãy thêm sản phẩm trước khi thanh toán.</p>
        <Link href="/shop" className="btn-primary">
          Mua sắm ngay
        </Link>
      </div>
    );
  }

  const updateForm = (field: keyof typeof form, value: string) => {
    if (field !== "note") setSelectedAddressId(null);
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const validateInfo = () => {
    const required: (keyof ShippingAddress)[] = [
      "recipientName",
      "phone",
      "province",
      "district",
      "ward",
      "addressLine",
    ];
    return required.every((f) => form[f].trim() !== "");
  };

  const handleApplyCoupon = async () => {
    setCouponError("");
    setCouponChecking(true);
    try {
      const res = await validateCoupon(couponCode.trim().toUpperCase(), subtotal);
      setAppliedCoupon({ code: res.code, discount: res.discount });
      toast(`Áp dụng mã giảm giá thành công! Giảm ${formatPrice(res.discount)}`, "success");
    } catch (err) {
      setAppliedCoupon(null);
      setCouponError(err instanceof ApiError ? err.message : "Mã giảm giá không hợp lệ");
    } finally {
      setCouponChecking(false);
    }
  };

  const handlePlaceOrder = async () => {
    // Phòng trường hợp item giỏ hàng cũ (lưu từ trước khi FE vá variant.id từ variant._id)
    // lọt qua bước tự vá ở cart-store — chặn sớm thay vì gửi variantId undefined lên BE (lỗi 400).
    const invalidItem = items.find((i) => !i.variant.id && !i.variant._id);
    if (invalidItem) {
      toast(
        `Sản phẩm "${invalidItem.product.name}" trong giỏ hàng bị thiếu thông tin biến thể — vui lòng xoá và thêm lại sản phẩm này.`,
        "error"
      );
      return;
    }

    setIsSubmitting(true);
    try {
      const { recipientName, phone, province, district, ward, addressLine } = form;
      const order = await authFetch((token) =>
        createOrder(token, {
          items: items.map((i) => ({
            productId: i.product._id,
            variantId: (i.variant.id ?? i.variant._id) as string,
            quantity: i.quantity,
          })),
          shippingAddress: { recipientName, phone, province, district, ward, addressLine },
          note: form.note || undefined,
          couponCode: appliedCoupon?.code,
          paymentMethod,
        })
      );
      clearCart();

      if (saveAddress && selectedAddressId === null) {
        authFetch((token) => createAddress(token, { recipientName, phone, province, district, ward, addressLine })).catch(
          () => {}
        );
      }

      if (order.paymentMethod === "payos" && order.payment?.checkoutUrl) {
        // Nhúng cổng thanh toán ngay tại trang thay vì chuyển hẳn sang PayOS — webhook vẫn là nơi
        // xác nhận đã thanh toán thật sự, onSuccess ở đây chỉ để điều hướng UX.
        setPlacedOrderId(order._id);
        setPayosCheckoutUrl(order.payment.checkoutUrl);
        setIsSubmitting(false);
        return;
      }

      if (order.paymentMethod === "payos" && !order.payment) {
        toast("Đơn hàng đã được tạo nhưng chưa tạo được link thanh toán. Bạn có thể thử lại ở trang đơn hàng.", "info");
      }

      router.push(`/checkout/success?orderId=${order._id}`);
    } catch (err) {
      const message =
        err instanceof ApiError
          ? err.message
          : "Có lỗi xảy ra khi đặt hàng. Vui lòng thử lại.";
      toast(message, "error");
      setIsSubmitting(false);
    }
  };

  const stepIndex = STEP_LABELS.findIndex((s) => s.id === step);

  const goNext = () => {
    if (step === "info") {
      if (!validateInfo()) {
        toast("Vui lòng điền đầy đủ thông tin giao hàng", "error");
        return;
      }
      setStep("review");
    }
  };

  const goBack = () => {
    if (step === "review") setStep("info");
  };

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="flex items-center gap-3 mb-10">
        <Link href="/" className="text-xl font-medium tracking-[0.2em] uppercase">
          Nomad
        </Link>
        <span className="text-muted-foreground/40">/</span>
        <span className="text-sm text-muted-foreground">Thanh toán</span>
      </div>

      {/* Stepper */}
      <div className="flex items-center gap-2 mb-10">
        {STEP_LABELS.map((s, i) => (
          <div key={s.id} className="flex items-center gap-2">
            <div className="flex items-center gap-2">
              <div
                className={cn(
                  "w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium transition-colors",
                  i <= stepIndex ? "bg-dwarfs-dark text-white" : "bg-dwarfs-surface text-muted-foreground"
                )}
              >
                {i < stepIndex ? "✓" : i + 1}
              </div>
              <span className={cn("text-sm", i === stepIndex ? "font-medium" : "text-muted-foreground")}>
                {s.label}
              </span>
            </div>
            {i < STEP_LABELS.length - 1 && (
              <ChevronRight size={14} className="text-muted-foreground/40 mx-1" />
            )}
          </div>
        ))}
      </div>

      {/* Layout: Form + Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-10">
        {/* Left: Steps */}
        <div>
          {/* ── Step 1: Thông tin ── */}
          {step === "info" && (
            <div className="space-y-6 animate-fade-in">
              <h2 className="text-lg font-medium">Thông tin giao hàng</h2>

              {savedAddresses.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
                    Sổ địa chỉ
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {savedAddresses.map((address) => (
                      <button
                        key={address._id}
                        type="button"
                        onClick={() => applySavedAddress(address)}
                        className={cn(
                          "flex items-center gap-2 border px-3 py-2 text-xs text-left transition-colors max-w-xs",
                          selectedAddressId === address._id
                            ? "border-dwarfs-dark bg-dwarfs-surface"
                            : "border-border hover:border-dwarfs-gray"
                        )}
                      >
                        {selectedAddressId === address._id && <Check size={12} className="flex-none" />}
                        <span className="truncate">
                          <span className="font-medium">{address.recipientName}</span> ·{" "}
                          {address.addressLine}, {address.ward}
                        </span>
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={useNewAddress}
                      className={cn(
                        "border px-3 py-2 text-xs transition-colors",
                        selectedAddressId === null
                          ? "border-dwarfs-dark bg-dwarfs-surface"
                          : "border-border hover:border-dwarfs-gray"
                      )}
                    >
                      + Địa chỉ khác
                    </button>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField label="Họ và tên *">
                  <input
                    type="text"
                    value={form.recipientName}
                    onChange={(e) => updateForm("recipientName", e.target.value)}
                    placeholder="Nguyễn Văn A"
                    className="input-base"
                  />
                </FormField>

                <FormField label="Số điện thoại *">
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={(e) => updateForm("phone", e.target.value)}
                    placeholder="0901234567"
                    className="input-base"
                  />
                </FormField>

                <VietnamAddressSelects
                  province={form.province}
                  district={form.district}
                  ward={form.ward}
                  onChange={(next) => {
                    setSelectedAddressId(null);
                    setForm((prev) => ({ ...prev, ...next }));
                  }}
                  provinceWrapperClassName="sm:col-span-2"
                />

                <FormField label="Địa chỉ cụ thể *" className="sm:col-span-2">
                  <input
                    type="text"
                    value={form.addressLine}
                    onChange={(e) => updateForm("addressLine", e.target.value)}
                    placeholder="Số nhà, tên đường..."
                    className="input-base"
                  />
                </FormField>

                <FormField label="Ghi chú đơn hàng" className="sm:col-span-2">
                  <textarea
                    value={form.note}
                    onChange={(e) => updateForm("note", e.target.value)}
                    placeholder="Ghi chú cho người giao hàng (nếu có)..."
                    rows={3}
                    className="input-base resize-none"
                  />
                </FormField>
              </div>

              {accessToken && selectedAddressId === null && (
                <label className="flex items-center gap-2 text-sm text-muted-foreground">
                  <input
                    type="checkbox"
                    checked={saveAddress}
                    onChange={(e) => setSaveAddress(e.target.checked)}
                  />
                  Lưu địa chỉ này vào sổ địa chỉ cho lần sau
                </label>
              )}

              <button onClick={goNext} className="btn-primary w-full sm:w-auto px-10">
                Tiếp tục → Xác nhận
              </button>
            </div>
          )}

          {/* ── Step 2: Xác nhận & đặt hàng ── */}
          {step === "review" && (
            <div className="space-y-6 animate-fade-in">
              <h2 className="text-lg font-medium">Xác nhận đơn hàng</h2>

              <div className="p-4 bg-dwarfs-surface text-sm space-y-1">
                <p className="font-medium">
                  {form.recipientName} · {form.phone}
                </p>
                <p className="text-muted-foreground">
                  {form.addressLine}, {form.ward}, {form.district}, {form.province}
                </p>
                <button onClick={goBack} className="text-xs underline-anim text-dwarfs-dark mt-1">
                  Chỉnh sửa
                </button>
              </div>

              {payosCheckoutUrl && placedOrderId ? (
                <div className="space-y-3">
                  <p className="text-xs font-medium tracking-widest uppercase text-muted-foreground">
                    Quét mã hoặc thanh toán qua ngân hàng/ví điện tử
                  </p>
                  <div className="border border-border p-2">
                    <PayosEmbeddedCheckout
                      checkoutUrl={payosCheckoutUrl}
                      returnUrl={`${window.location.origin}/orders/${placedOrderId}/payment-result?status=success`}
                      onSuccess={() => router.push(`/orders/${placedOrderId}/payment-result?status=success`)}
                      onCancel={() => router.push(`/orders/${placedOrderId}/payment-result?status=cancel`)}
                    />
                  </div>
                  <button
                    onClick={() => router.push(`/orders/${placedOrderId}/payment-result?status=cancel`)}
                    className="text-xs underline-anim text-muted-foreground"
                  >
                    Huỷ, thanh toán sau
                  </button>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-3 p-4 border border-border">
                    <Truck size={18} className="text-muted-foreground flex-none" />
                    <p className="text-sm text-muted-foreground">
                      Phí vận chuyển được tính tự động theo khu vực giao hàng và hiển thị ở tổng đơn hàng sau
                      khi đặt hàng thành công.
                    </p>
                  </div>

                  <div className="space-y-3">
                    <p className="text-xs font-medium tracking-widest uppercase text-muted-foreground">
                      Phương thức thanh toán
                    </p>
                    {PAYMENT_METHODS.map((method) => (
                      <label
                        key={method.id}
                        className={cn(
                          "flex items-center gap-4 p-4 border cursor-pointer transition-colors",
                          paymentMethod === method.id
                            ? "border-dwarfs-dark bg-dwarfs-surface"
                            : "border-border hover:border-dwarfs-gray"
                        )}
                      >
                        <input
                          type="radio"
                          name="paymentMethod"
                          value={method.id}
                          checked={paymentMethod === method.id}
                          onChange={() => setPaymentMethod(method.id)}
                          className="accent-dwarfs-dark"
                        />
                        <div className="w-8 h-8 flex items-center justify-center bg-dwarfs-surface rounded flex-none">
                          {method.icon}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">{method.label}</p>
                          <p className="text-xs text-muted-foreground">{method.description}</p>
                        </div>
                      </label>
                    ))}
                  </div>

                  <div className="flex gap-3">
                    <button onClick={goBack} className="btn-outline px-6">
                      ← Quay lại
                    </button>
                    <button
                      onClick={handlePlaceOrder}
                      disabled={isSubmitting}
                      className={cn(
                        "btn-primary flex items-center gap-2 px-10",
                        isSubmitting && "opacity-70 cursor-not-allowed"
                      )}
                    >
                      {isSubmitting && <Loader2 size={16} className="animate-spin" />}
                      {isSubmitting ? "Đang xử lý..." : "Đặt hàng"}
                    </button>
                  </div>

                  <p className="text-xs text-muted-foreground">
                    Bằng cách đặt hàng, bạn đồng ý với{" "}
                    <Link href="/dieu-khoan-su-dung" className="underline-anim">
                      điều khoản sử dụng
                    </Link>{" "}
                    và{" "}
                    <Link href="/chinh-sach-bao-mat" className="underline-anim">
                      chính sách bảo mật
                    </Link>{" "}
                    của Nomad.
                  </p>
                </>
              )}
            </div>
          )}
        </div>

        {/* Right: Order Summary */}
        <div>
          <div className="border border-border p-6 space-y-5 sticky top-20">
            <h2 className="text-sm font-medium tracking-widest uppercase">
              Đơn hàng ({items.length} sản phẩm)
            </h2>

            {/* Items */}
            <ul className="space-y-4 max-h-60 overflow-y-auto scrollbar-hide">
              {items.map((item) => (
                <li key={item.id} className="flex gap-3">
                  <div className="relative flex-none">
                    <div className="w-14 h-[74px] bg-dwarfs-surface overflow-hidden">
                      {item.product.images[0] && (
                        <Image
                          src={item.product.images[0].url}
                          alt={item.product.images[0].alt ?? item.product.name}
                          width={56}
                          height={74}
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>
                    <span className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-dwarfs-dark text-white text-[10px] flex items-center justify-center">
                      {item.quantity}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium leading-tight line-clamp-2">{item.product.name}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {item.variant.size} · {item.color.name}
                    </p>
                  </div>
                  <span className="text-xs font-medium flex-none">
                    {formatPrice(item.product.effectivePrice * item.quantity)}
                  </span>
                </li>
              ))}
            </ul>

            <div className="border-t border-border pt-4 space-y-2">
              {/* Coupon */}
              <div className="flex gap-2">
                <div className="flex-1 relative">
                  <Tag size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => {
                      setCouponCode(e.target.value.toUpperCase());
                      setCouponError("");
                    }}
                    placeholder="Mã giảm giá"
                    className="input-base pl-8 py-2 text-xs uppercase"
                  />
                </div>
                <button
                  onClick={handleApplyCoupon}
                  disabled={!couponCode || couponChecking}
                  className="btn-outline px-3 py-2 text-xs disabled:opacity-40"
                >
                  {couponChecking ? "..." : "Áp dụng"}
                </button>
              </div>
              {couponError && <p className="text-xs text-red-500">{couponError}</p>}
              {appliedCoupon && (
                <p className="text-xs text-green-600">✓ Đã áp dụng mã {appliedCoupon.code}</p>
              )}
            </div>

            {/* Totals */}
            <div className="border-t border-border pt-4 space-y-2 text-sm">
              <div className="flex justify-between text-muted-foreground">
                <span>Tạm tính</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Phí vận chuyển</span>
                <span>Tính khi đặt hàng</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Giảm giá</span>
                  <span>-{formatPrice(discount)}</span>
                </div>
              )}
              <div className="flex justify-between font-medium text-base border-t border-border pt-3 mt-2">
                <span>Tạm tính sau giảm giá</span>
                <span>{formatPrice(subtotal - discount)}</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Tổng cộng chính xác (đã gồm phí ship) hiển thị sau khi đặt hàng thành công.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Helper component ─────────────────────────────────────────────────────────

function FormField({
  label,
  children,
  className,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{label}</label>
      {children}
    </div>
  );
}
