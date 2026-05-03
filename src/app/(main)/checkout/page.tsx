// src/app/(main)/checkout/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { CreditCard, Truck, ShieldCheck, Loader2, ChevronRight } from "lucide-react";
import { useCartStore } from "../../../stores/cart.store";
import { useAuthStore } from "../../../stores/auth.store";
import { orderService } from "../../../services/order.service";
import { paymentService } from "../../../services/payment.service";
import { userService } from "../../../services/user.service";
import { QUERY_KEYS } from "../../../constants/queryKeys";
import Link from "next/link";
import { ROUTES } from "../../../constants/routes";

type PaymentMethod = "STRIPE" | "COD";

export default function CheckoutPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { items, cart, clearCart } = useCartStore();
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("STRIPE");
  const [selectedAddressId, setSelectedAddressId] = useState<string>("");

  const { data: addressData } = useQuery({
    queryKey: [QUERY_KEYS.ADDRESSES],
    queryFn: () => userService.getAddresses(),
    enabled: !!user,
  });

  const addresses = addressData?.data ?? [];

  const subtotal = cart?.subtotal ?? items.reduce((acc, i) => acc + i.price * i.quantity, 0);
  const shipping = subtotal > 50 ? 0 : 5.99;
  const tax = subtotal * 0.08;
  const total = subtotal + shipping + tax;

  const { mutate: placeOrder, isPending } = useMutation({
    mutationFn: async () => {
      if (!selectedAddressId) throw new Error("Please select a delivery address");

      const orderRes = await orderService.create({
        addressId: selectedAddressId,
        paymentMethod,
        items: items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
      });

      const orderId = orderRes.data._id;

      if (paymentMethod === "STRIPE") {
        const sessionRes = await paymentService.createSession({ orderId });
        window.location.href = sessionRes.data.url;
      } else {
        clearCart();
        router.push(`/checkout/success?orderId=${orderId}`);
      }
    },
    onError: (err: any) => {
      toast.error(err?.message ?? err?.response?.data?.message ?? "Failed to place order");
    },
  });

  if (!user) {
    return (
      <div className="max-w-lg mx-auto px-4 py-20 text-center">
        <p className="text-base font-semibold mb-4" style={{ color: "var(--color-text-primary)" }}>
          Please login to checkout
        </p>
        <Link
          href={ROUTES.LOGIN}
          className="inline-flex h-11 px-6 rounded-xl text-sm font-bold text-white items-center justify-center"
          style={{ backgroundColor: "#ef4a23" }}
        >
          Sign In
        </Link>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="max-w-lg mx-auto px-4 py-20 text-center">
        <p className="text-base font-semibold mb-4" style={{ color: "var(--color-text-primary)" }}>
          Your cart is empty
        </p>
        <Link href={ROUTES.PRODUCTS} className="text-sm font-medium hover:underline" style={{ color: "#ef4a23" }}>
          ← Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-[1440px] mx-auto px-4 md:px-6 py-8">
      <h1 className="text-2xl font-black mb-8" style={{ color: "var(--color-text-primary)" }}>
        Checkout
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* left — address + payment */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          {/* delivery address */}
          <div
            className="rounded-2xl p-6"
            style={{
              backgroundColor: "var(--color-background-primary)",
              border: "0.5px solid var(--color-border-tertiary)",
            }}
          >
            <div className="flex items-center gap-2 mb-5">
              <Truck size={18} style={{ color: "#ef4a23" }} />
              <h2 className="text-base font-bold" style={{ color: "var(--color-text-primary)" }}>
                Delivery Address
              </h2>
            </div>

            {addresses.length === 0 ? (
              <div className="text-center py-6">
                <p className="text-sm mb-3" style={{ color: "var(--color-text-tertiary)" }}>
                  No saved addresses found.
                </p>
                <Link
                  href="/user/addresses"
                  className="text-sm font-semibold hover:underline"
                  style={{ color: "#ef4a23" }}
                >
                  + Add an address
                </Link>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {addresses.map((addr: any) => (
                  <label
                    key={addr._id}
                    className="flex items-start gap-3 p-4 rounded-xl cursor-pointer transition-all"
                    style={{
                      border: selectedAddressId === addr._id
                        ? "1.5px solid #ef4a23"
                        : "1px solid var(--color-border-secondary)",
                      backgroundColor: selectedAddressId === addr._id
                        ? "rgba(239,74,35,0.04)"
                        : "transparent",
                    }}
                  >
                    <input
                      type="radio"
                      name="address"
                      value={addr._id}
                      checked={selectedAddressId === addr._id}
                      onChange={() => setSelectedAddressId(addr._id)}
                      className="mt-1 accent-[#ef4a23]"
                    />
                    <div>
                      <p className="text-sm font-semibold" style={{ color: "var(--color-text-primary)" }}>
                        {addr.label ?? addr.fullName}
                        {addr.isDefault && (
                          <span
                            className="ml-2 text-xs px-2 py-0.5 rounded-full font-medium"
                            style={{ backgroundColor: "rgba(239,74,35,0.1)", color: "#ef4a23" }}
                          >
                            Default
                          </span>
                        )}
                      </p>
                      <p className="text-xs mt-0.5" style={{ color: "var(--color-text-secondary)" }}>
                        {addr.street}, {addr.city}, {addr.state} {addr.zip}
                      </p>
                      <p className="text-xs" style={{ color: "var(--color-text-tertiary)" }}>
                        {addr.phone}
                      </p>
                    </div>
                  </label>
                ))}
                <Link
                  href="/user/addresses"
                  className="text-xs font-medium mt-1 hover:underline"
                  style={{ color: "#ef4a23" }}
                >
                  + Add new address
                </Link>
              </div>
            )}
          </div>

          {/* payment method */}
          <div
            className="rounded-2xl p-6"
            style={{
              backgroundColor: "var(--color-background-primary)",
              border: "0.5px solid var(--color-border-tertiary)",
            }}
          >
            <div className="flex items-center gap-2 mb-5">
              <CreditCard size={18} style={{ color: "#ef4a23" }} />
              <h2 className="text-base font-bold" style={{ color: "var(--color-text-primary)" }}>
                Payment Method
              </h2>
            </div>

            <div className="flex flex-col gap-3">
              {[
                { value: "STRIPE", label: "Credit / Debit Card", sub: "Powered by Stripe — Secure & fast" },
                { value: "COD", label: "Cash on Delivery", sub: "Pay when your order arrives" },
              ].map((method) => (
                <label
                  key={method.value}
                  className="flex items-start gap-3 p-4 rounded-xl cursor-pointer transition-all"
                  style={{
                    border: paymentMethod === method.value
                      ? "1.5px solid #ef4a23"
                      : "1px solid var(--color-border-secondary)",
                    backgroundColor: paymentMethod === method.value
                      ? "rgba(239,74,35,0.04)"
                      : "transparent",
                  }}
                >
                  <input
                    type="radio"
                    name="payment"
                    value={method.value}
                    checked={paymentMethod === method.value}
                    onChange={() => setPaymentMethod(method.value as PaymentMethod)}
                    className="mt-1 accent-[#ef4a23]"
                  />
                  <div>
                    <p className="text-sm font-semibold" style={{ color: "var(--color-text-primary)" }}>
                      {method.label}
                    </p>
                    <p className="text-xs mt-0.5" style={{ color: "var(--color-text-tertiary)" }}>
                      {method.sub}
                    </p>
                  </div>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* right — order summary */}
        <div
          className="flex flex-col gap-5 p-6 rounded-2xl h-fit sticky top-24"
          style={{
            backgroundColor: "var(--color-background-primary)",
            border: "0.5px solid var(--color-border-tertiary)",
          }}
        >
          <h2 className="text-base font-bold" style={{ color: "var(--color-text-primary)" }}>
            Order Summary
          </h2>

          {/* items */}
          <div className="flex flex-col gap-3">
            {items.map((item) => (
              <div key={item._id} className="flex items-center gap-3">
                <div
                  className="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0"
                  style={{ backgroundColor: "var(--color-background-secondary)" }}
                >
                  {item.thumbnail && (
                    <img src={item.thumbnail} alt={item.name} className="w-full h-full object-cover" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium truncate" style={{ color: "var(--color-text-primary)" }}>
                    {item.name}
                  </p>
                  <p className="text-xs" style={{ color: "var(--color-text-tertiary)" }}>
                    Qty: {item.quantity}
                  </p>
                </div>
                <span className="text-xs font-bold flex-shrink-0" style={{ color: "var(--color-text-primary)" }}>
                  ${(item.price * item.quantity).toFixed(2)}
                </span>
              </div>
            ))}
          </div>

          <div className="h-px" style={{ backgroundColor: "var(--color-border-tertiary)" }} />

          {/* price breakdown */}
          <div className="flex flex-col gap-2.5">
            {[
              { label: "Subtotal", value: `$${subtotal.toFixed(2)}` },
              { label: "Shipping", value: shipping === 0 ? "FREE" : `$${shipping.toFixed(2)}` },
              { label: "Tax (8%)", value: `$${tax.toFixed(2)}` },
            ].map((row) => (
              <div key={row.label} className="flex items-center justify-between">
                <span className="text-sm" style={{ color: "var(--color-text-secondary)" }}>{row.label}</span>
                <span className="text-sm font-medium" style={{ color: "var(--color-text-primary)" }}>{row.value}</span>
              </div>
            ))}
          </div>

          <div className="h-px" style={{ backgroundColor: "var(--color-border-tertiary)" }} />

          <div className="flex items-center justify-between">
            <span className="text-base font-black" style={{ color: "var(--color-text-primary)" }}>Total</span>
            <span className="text-2xl font-black" style={{ color: "#ef4a23" }}>${total.toFixed(2)}</span>
          </div>

          {/* secure badge */}
          <div
            className="flex items-center gap-2 px-3 py-2 rounded-xl"
            style={{ backgroundColor: "rgba(34,197,94,0.07)", border: "0.5px solid rgba(34,197,94,0.2)" }}
          >
            <ShieldCheck size={14} className="text-green-500 flex-shrink-0" />
            <span className="text-xs text-green-600">Your payment is 100% secure</span>
          </div>

          {/* place order */}
          <button
            onClick={() => placeOrder()}
            disabled={isPending || !selectedAddressId}
            className="w-full h-12 rounded-xl text-sm font-bold text-white flex items-center justify-center gap-2 transition-opacity hover:opacity-85 disabled:opacity-40 disabled:cursor-not-allowed"
            style={{ backgroundColor: "#ef4a23" }}
          >
            {isPending ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <>
                Place Order
                <ChevronRight size={16} />
              </>
            )}
          </button>

          {!selectedAddressId && (
            <p className="text-xs text-center" style={{ color: "#f02757" }}>
              Please select a delivery address
            </p>
          )}
        </div>
      </div>
    </div>
  );
}