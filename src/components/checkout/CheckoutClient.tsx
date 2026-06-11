"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ChevronRight, ShoppingBag, Tag, Truck, CreditCard, Loader2 } from "lucide-react";
import { cn, formatPrice } from "@/lib/utils";
import { useCartStore } from "@/lib/cart-store";
import { useToast } from "@/components/ui/Toast";

// ─── Types ────────────────────────────────────────────────────────────────────

type Step = "info" | "shipping" | "payment";

interface ShippingForm {
  fullName: string;
  phone: string;
  email: string;
  province: string;
  district: string;
  ward: string;
  street: string;
  note: string;
}

interface ShippingMethod {
  id: string;
  name: string;
  description: string;
  price: number;
  estimatedDays: string;
}

interface PaymentMethod {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
}

const SHIPPING_METHODS: ShippingMethod[] = [
  {
    id: "standard",
    name: "Giao hàng tiêu chuẩn",
    description: "Giao hàng toàn quốc",
    price: 30000,
    estimatedDays: "3–5 ngày",
  },
  {
    id: "express",
    name: "Giao hàng nhanh",
    description: "Ưu tiên xử lý & vận chuyển",
    price: 50000,
    estimatedDays: "1–2 ngày",
  },
  {
    id: "free",
    name: "Miễn phí vận chuyển",
    description: "Áp dụng cho đơn từ 500.000đ",
    price: 0,
    estimatedDays: "3–5 ngày",
  },
];

const PAYMENT_METHODS: PaymentMethod[] = [
  {
    id: "cod",
    name: "Thanh toán khi nhận hàng (COD)",
    description: "Trả tiền mặt khi nhận hàng",
    icon: <Truck size={18} />,
  },
  {
    id: "bank",
    name: "Chuyển khoản ngân hàng",
    description: "Chuyển khoản qua tài khoản ngân hàng",
    icon: <CreditCard size={18} />,
  },
  {
    id: "momo",
    name: "Ví MoMo",
    description: "Thanh toán qua ví điện tử MoMo",
    icon: <span className="text-xs font-bold text-pink-600">MM</span>,
  },
  {
    id: "vnpay",
    name: "VNPay",
    description: "Thanh toán qua cổng VNPay",
    icon: <span className="text-xs font-bold text-blue-600">VN</span>,
  },
];

const STEP_LABELS: { id: Step; label: string }[] = [
  { id: "info", label: "Thông tin" },
  { id: "shipping", label: "Vận chuyển" },
  { id: "payment", label: "Thanh toán" },
];

// ─── Main Component ───────────────────────────────────────────────────────────

export function CheckoutClient() {
  const router = useRouter();
  const { items, total, clearCart } = useCartStore();
  const { toast } = useToast();

  const [step, setStep] = useState<Step>("info");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [discount, setDiscount] = useState(0);
  const [couponError, setCouponError] = useState("");

  const [form, setForm] = useState<ShippingForm>({
    fullName: "",
    phone: "",
    email: "",
    province: "",
    district: "",
    ward: "",
    street: "",
    note: "",
  });

  const [selectedShipping, setSelectedShipping] = useState<string>("standard");
  const [selectedPayment, setSelectedPayment] = useState<string>("cod");

  const shippingMethod = SHIPPING_METHODS.find((m) => m.id === selectedShipping)!;
  const subtotal = total();
  const shippingFee = shippingMethod.price;
  const grandTotal = subtotal + shippingFee - discount;

  // Redirect if cart is empty
  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <ShoppingBag size={48} className="text-muted-foreground/30 mb-4" />
        <p className="text-lg font-medium mb-2">Giỏ hàng trống</p>
        <p className="text-sm text-muted-foreground mb-6">
          Hãy thêm sản phẩm trước khi thanh toán.
        </p>
        <Link href="/shop" className="btn-primary">
          Mua sắm ngay
        </Link>
      </div>
    );
  }

  // ─── Form helpers ─────────────────────────────────────────────────────────

  const updateForm = (field: keyof ShippingForm, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const validateInfo = () => {
    const required: (keyof ShippingForm)[] = ["fullName", "phone", "email", "province", "district", "ward", "street"];
    return required.every((f) => form[f].trim() !== "");
  };

  const handleApplyCoupon = () => {
    setCouponError("");
    if (couponCode.toUpperCase() === "DWARFS10") {
      const d = Math.round(subtotal * 0.1);
      setDiscount(d);
      toast(`Áp dụng mã giảm giá thành công! Giảm ${formatPrice(d)}`, "success");
    } else if (couponCode.toUpperCase() === "FREESHIP") {
      setDiscount(shippingFee);
      toast("Áp dụng miễn phí vận chuyển thành công!", "success");
    } else {
      setCouponError("Mã giảm giá không hợp lệ hoặc đã hết hạn");
    }
  };

  const handlePlaceOrder = async () => {
    setIsSubmitting(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));
      const orderId = Math.random().toString(36).slice(2, 10).toUpperCase();
      clearCart();
      router.push(`/checkout/success?orderId=${orderId}`);
    } catch {
      toast("Có lỗi xảy ra. Vui lòng thử lại.", "error");
      setIsSubmitting(false);
    }
  };

  // ─── Step navigation ──────────────────────────────────────────────────────

  const stepIndex = STEP_LABELS.findIndex((s) => s.id === step);

  const goNext = () => {
    if (step === "info") {
      if (!validateInfo()) {
        toast("Vui lòng điền đầy đủ thông tin giao hàng", "error");
        return;
      }
      setStep("shipping");
    } else if (step === "shipping") {
      setStep("payment");
    }
  };

  const goBack = () => {
    if (step === "shipping") setStep("info");
    if (step === "payment") setStep("shipping");
  };

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="flex items-center gap-3 mb-10">
        <Link href="/" className="text-xl font-medium tracking-[0.2em] uppercase">
          Dwarfs
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
                  i < stepIndex
                    ? "bg-dwarfs-dark text-white"
                    : i === stepIndex
                    ? "bg-dwarfs-dark text-white"
                    : "bg-dwarfs-surface text-muted-foreground"
                )}
              >
                {i < stepIndex ? "✓" : i + 1}
              </div>
              <span
                className={cn(
                  "text-sm",
                  i === stepIndex ? "font-medium" : "text-muted-foreground"
                )}
              >
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

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField label="Họ và tên *">
                  <input
                    type="text"
                    value={form.fullName}
                    onChange={(e) => updateForm("fullName", e.target.value)}
                    placeholder="Nguyễn Văn A"
                    className="input-base"
                  />
                </FormField>

                <FormField label="Số điện thoại *">
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={(e) => updateForm("phone", e.target.value)}
                    placeholder="0901 234 567"
                    className="input-base"
                  />
                </FormField>

                <FormField label="Email *" className="sm:col-span-2">
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => updateForm("email", e.target.value)}
                    placeholder="email@example.com"
                    className="input-base"
                  />
                </FormField>

                <FormField label="Tỉnh / Thành phố *">
                  <select
                    value={form.province}
                    onChange={(e) => updateForm("province", e.target.value)}
                    className="input-base bg-transparent"
                  >
                    <option value="">Chọn tỉnh/thành</option>
                    <option value="hanoi">Hà Nội</option>
                    <option value="hcm">TP. Hồ Chí Minh</option>
                    <option value="danang">Đà Nẵng</option>
                    <option value="other">Tỉnh/thành khác</option>
                  </select>
                </FormField>

                <FormField label="Quận / Huyện *">
                  <input
                    type="text"
                    value={form.district}
                    onChange={(e) => updateForm("district", e.target.value)}
                    placeholder="Quận / Huyện"
                    className="input-base"
                  />
                </FormField>

                <FormField label="Phường / Xã *">
                  <input
                    type="text"
                    value={form.ward}
                    onChange={(e) => updateForm("ward", e.target.value)}
                    placeholder="Phường / Xã"
                    className="input-base"
                  />
                </FormField>

                <FormField label="Địa chỉ cụ thể *">
                  <input
                    type="text"
                    value={form.street}
                    onChange={(e) => updateForm("street", e.target.value)}
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

              <button onClick={goNext} className="btn-primary w-full sm:w-auto px-10">
                Tiếp tục → Vận chuyển
              </button>
            </div>
          )}

          {/* ── Step 2: Vận chuyển ── */}
          {step === "shipping" && (
            <div className="space-y-6 animate-fade-in">
              <h2 className="text-lg font-medium">Phương thức vận chuyển</h2>

              {/* Delivery address summary */}
              <div className="p-4 bg-dwarfs-surface text-sm space-y-1">
                <p className="font-medium">{form.fullName} · {form.phone}</p>
                <p className="text-muted-foreground">
                  {form.street}, {form.ward}, {form.district},{" "}
                  {form.province === "hanoi" ? "Hà Nội" : form.province === "hcm" ? "TP. Hồ Chí Minh" : form.province}
                </p>
                <button
                  onClick={goBack}
                  className="text-xs underline-anim text-dwarfs-dark mt-1"
                >
                  Chỉnh sửa
                </button>
              </div>

              {/* Shipping options */}
              <div className="space-y-3">
                {SHIPPING_METHODS.map((method) => {
                  const disabled = method.id === "free" && subtotal < 500000;
                  return (
                    <label
                      key={method.id}
                      className={cn(
                        "flex items-center gap-4 p-4 border cursor-pointer transition-colors",
                        selectedShipping === method.id && !disabled
                          ? "border-dwarfs-dark bg-dwarfs-surface"
                          : "border-border hover:border-dwarfs-gray",
                        disabled && "opacity-40 cursor-not-allowed"
                      )}
                    >
                      <input
                        type="radio"
                        name="shipping"
                        value={method.id}
                        checked={selectedShipping === method.id}
                        onChange={() => !disabled && setSelectedShipping(method.id)}
                        disabled={disabled}
                        className="accent-dwarfs-dark"
                      />
                      <div className="flex-1">
                        <p className="text-sm font-medium">{method.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {method.description} · {method.estimatedDays}
                        </p>
                        {disabled && (
                          <p className="text-xs text-orange-500 mt-0.5">
                            Đơn hàng tối thiểu 500.000đ
                          </p>
                        )}
                      </div>
                      <span className="text-sm font-medium">
                        {method.price === 0 ? "Miễn phí" : formatPrice(method.price)}
                      </span>
                    </label>
                  );
                })}
              </div>

              <div className="flex gap-3">
                <button onClick={goBack} className="btn-outline px-6">
                  ← Quay lại
                </button>
                <button onClick={goNext} className="btn-primary px-10">
                  Tiếp tục → Thanh toán
                </button>
              </div>
            </div>
          )}

          {/* ── Step 3: Thanh toán ── */}
          {step === "payment" && (
            <div className="space-y-6 animate-fade-in">
              <h2 className="text-lg font-medium">Phương thức thanh toán</h2>

              <div className="space-y-3">
                {PAYMENT_METHODS.map((method) => (
                  <label
                    key={method.id}
                    className={cn(
                      "flex items-center gap-4 p-4 border cursor-pointer transition-colors",
                      selectedPayment === method.id
                        ? "border-dwarfs-dark bg-dwarfs-surface"
                        : "border-border hover:border-dwarfs-gray"
                    )}
                  >
                    <input
                      type="radio"
                      name="payment"
                      value={method.id}
                      checked={selectedPayment === method.id}
                      onChange={() => setSelectedPayment(method.id)}
                      className="accent-dwarfs-dark"
                    />
                    <div className="w-8 h-8 flex items-center justify-center bg-dwarfs-surface rounded">
                      {method.icon}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{method.name}</p>
                      <p className="text-xs text-muted-foreground">{method.description}</p>
                    </div>
                  </label>
                ))}
              </div>

              {/* Bank transfer details */}
              {selectedPayment === "bank" && (
                <div className="p-4 bg-dwarfs-surface text-sm space-y-2 border-l-2 border-dwarfs-dark animate-fade-in">
                  <p className="font-medium">Thông tin chuyển khoản</p>
                  <p>Ngân hàng: <span className="font-medium">Vietcombank</span></p>
                  <p>Số tài khoản: <span className="font-medium">1234 5678 9012</span></p>
                  <p>Chủ tài khoản: <span className="font-medium">DWARFS CO., LTD</span></p>
                  <p className="text-muted-foreground text-xs mt-2">
                    Nội dung chuyển khoản: Họ tên + SĐT của bạn
                  </p>
                </div>
              )}

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
                <Link href="/dieu-khoan-su-dung" className="underline-anim">điều khoản sử dụng</Link>{" "}
                và{" "}
                <Link href="/chinh-sach-bao-mat" className="underline-anim">chính sách bảo mật</Link>{" "}
                của Dwarfs.
              </p>
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
                          alt={item.product.images[0].alt}
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
                    <p className="text-xs font-medium leading-tight line-clamp-2">
                      {item.product.name}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {item.variant.size} · {item.variant.color.name}
                    </p>
                  </div>
                  <span className="text-xs font-medium flex-none">
                    {formatPrice(item.product.price * item.quantity)}
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
                    onChange={(e) => { setCouponCode(e.target.value.toUpperCase()); setCouponError(""); }}
                    placeholder="Mã giảm giá"
                    className="input-base pl-8 py-2 text-xs uppercase"
                  />
                </div>
                <button
                  onClick={handleApplyCoupon}
                  disabled={!couponCode}
                  className="btn-outline px-3 py-2 text-xs disabled:opacity-40"
                >
                  Áp dụng
                </button>
              </div>
              {couponError && (
                <p className="text-xs text-red-500">{couponError}</p>
              )}
              {discount > 0 && (
                <p className="text-xs text-green-600">✓ Đã áp dụng mã giảm giá</p>
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
                <span>
                  {shippingFee === 0 ? (
                    <span className="text-green-600">Miễn phí</span>
                  ) : (
                    formatPrice(shippingFee)
                  )}
                </span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Giảm giá</span>
                  <span>-{formatPrice(discount)}</span>
                </div>
              )}
              <div className="flex justify-between font-medium text-base border-t border-border pt-3 mt-2">
                <span>Tổng cộng</span>
                <span>{formatPrice(grandTotal)}</span>
              </div>
              <p className="text-xs text-muted-foreground">
                (Đã bao gồm VAT nếu có)
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
      <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
        {label}
      </label>
      {children}
    </div>
  );
}
