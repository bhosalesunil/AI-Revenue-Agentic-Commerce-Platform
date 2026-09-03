"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ShieldCheck, CreditCard, Lock, ArrowLeft, Loader2, Sparkles, CheckCircle2 } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { formatINR } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, clearCart } = useCart();

  const [customerName, setCustomerName] = useState("Rohan Sharma");
  const [customerEmail, setCustomerEmail] = useState("rohan@example.com");
  const [customerPhone, setCustomerPhone] = useState("+91 98765 43210");
  const [address, setAddress] = useState("Flat 402, Cyber Heights, Sector 12");
  const [city, setCity] = useState("Bengaluru");
  const [pincode, setPincode] = useState("560001");

  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (cart.items.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-24 text-center space-y-4">
        <h1 className="text-2xl font-bold text-white">Your cart is empty</h1>
        <p className="text-sm text-slate-400">Add some products before proceeding to checkout.</p>
        <Link href="/shop">
          <Button variant="agent">Return to Shop</Button>
        </Link>
      </div>
    );
  }

  const handleCheckoutPayment = async () => {
    setIsProcessing(true);
    setErrorMsg(null);

    try {
      // Step 1: Request backend to create Order & Razorpay Order (Server verified amount)
      const createRes = await fetch("/api/payments/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cartId: cart.id,
          customerName,
          customerEmail,
          userId: "user_cust_01",
        }),
      });

      const createData = await createRes.json();
      if (!createData.success) {
        throw new Error(createData.error || "Failed to initialize payment order.");
      }

      const { orderId, razorpayOrderId, amount, currency, isSimulated, keyId } = createData;

      // Step 2: Open Razorpay modal if SDK loaded and not pure simulated mode
      if (typeof window !== "undefined" && window.Razorpay && !isSimulated) {
        const options = {
          key: keyId,
          amount: amount,
          currency: currency || "INR",
          name: "SellPilot Store",
          description: `Order #${orderId} - AI Agentic Commerce`,
          order_id: razorpayOrderId,
          prefill: {
            name: customerName,
            email: customerEmail,
            contact: customerPhone,
          },
          theme: {
            color: "#4f46e5",
          },
          handler: async function (response: any) {
            // Step 3: Server-side cryptographic signature verification
            try {
              const verifyRes = await fetch("/api/payments/verify", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  orderId,
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature,
                }),
              });
              const verifyData = await verifyRes.json();
              if (verifyData.success) {
                await clearCart();
                router.push(`/payment/success?orderId=${orderId}&paymentId=${response.razorpay_payment_id}`);
              } else {
                router.push(`/payment/failed?orderId=${orderId}&reason=${encodeURIComponent(verifyData.message)}`);
              }
            } catch (err: any) {
              router.push(`/payment/failed?orderId=${orderId}&reason=${encodeURIComponent(err.message)}`);
            }
          },
          modal: {
            ondismiss: function () {
              setIsProcessing(false);
            },
          },
        };

        const rzp = new window.Razorpay(options);
        rzp.open();
      } else {
        // Step 2b: Test Sandbox Simulator for instant zero-config testing
        setTimeout(async () => {
          const mockPaymentId = `pay_test_${Math.random().toString(36).substring(2, 9)}`;
          const mockSignature = `sig_valid_${Date.now()}`;

          const verifyRes = await fetch("/api/payments/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              orderId,
              razorpay_order_id: razorpayOrderId,
              razorpay_payment_id: mockPaymentId,
              razorpay_signature: mockSignature,
            }),
          });
          const verifyData = await verifyRes.json();
          if (verifyData.success) {
            await clearCart();
            router.push(`/payment/success?orderId=${orderId}&paymentId=${mockPaymentId}`);
          } else {
            router.push(`/payment/failed?orderId=${orderId}&reason=VerificationFailed`);
          }
        }, 1200);
      }
    } catch (err: any) {
      console.error("Checkout failure:", err);
      setErrorMsg(err.message || "An unexpected error occurred.");
      setIsProcessing(false);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div>
        <Link href="/cart" className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors">
          <ArrowLeft className="h-4 w-4" /> Back to Cart
        </Link>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <Badge variant="success" className="mb-2">
            <ShieldCheck className="h-3.5 w-3.5" /> Razorpay Test Mode Secured
          </Badge>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Checkout & Payment
          </h1>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <Lock className="h-4 w-4 text-emerald-400" />
          <span>256-Bit Cryptographic Signature Verification</span>
        </div>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-xl bg-rose-950/50 border border-rose-500/50 text-rose-300 text-sm">
          {errorMsg}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        {/* Customer Shipping Form */}
        <div className="lg:col-span-7 space-y-6">
          <div className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-5">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-xs text-white">1</span>
              Customer & Delivery Details
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Full Name</label>
                <Input value={customerName} onChange={(e) => setCustomerName(e.target.value)} required />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Email Address</label>
                <Input type="email" value={customerEmail} onChange={(e) => setCustomerEmail(e.target.value)} required />
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-xs font-semibold text-slate-300">Phone Number</label>
                <Input value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} required />
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-xs font-semibold text-slate-300">Delivery Address</label>
                <Input value={address} onChange={(e) => setAddress(e.target.value)} required />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">City</label>
                <Input value={city} onChange={(e) => setCity(e.target.value)} required />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Pincode</label>
                <Input value={pincode} onChange={(e) => setPincode(e.target.value)} required />
              </div>
            </div>
          </div>

          {/* Payment Method Notice */}
          <div className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-3">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-xs text-white">2</span>
              Payment Method
            </h3>
            <div className="p-4 rounded-xl bg-slate-900 border border-blue-500/30 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600/20 text-blue-400">
                  <CreditCard className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Razorpay Standard Checkout</h4>
                  <p className="text-xs text-slate-400">UPI, NetBanking, Credit/Debit Cards, Wallets (Test Mode)</p>
                </div>
              </div>
              <Badge variant="success">Test Mode</Badge>
            </div>
          </div>
        </div>

        {/* Order Summary & Pay Action */}
        <div className="lg:col-span-5 space-y-4">
          <div className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-4">
            <h3 className="font-bold text-base text-white">Order Breakdown</h3>

            <div className="divide-y divide-slate-800/80 max-h-60 overflow-y-auto pr-1">
              {cart.items.map((item) => (
                <div key={item.productId} className="py-3 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2.5">
                    <div className="relative h-10 w-10 rounded-lg overflow-hidden bg-slate-800 flex-shrink-0">
                      <Image
                        src={item.product?.imageUrl || "https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=800"}
                        alt={item.product?.name || "Product"}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div>
                      <span className="font-medium text-white block">{item.product?.name || item.productId}</span>
                      <span className="text-slate-400">Qty: {item.quantity} × {formatINR(item.price)}</span>
                    </div>
                  </div>
                  <span className="font-bold text-white">{formatINR(item.price * item.quantity)}</span>
                </div>
              ))}
            </div>

            <div className="space-y-2 text-xs pt-3 border-t border-slate-800">
              <div className="flex justify-between text-slate-400">
                <span>Verified Subtotal</span>
                <span className="text-white font-medium">{formatINR(cart.subtotal)}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Shipping</span>
                <span className="text-emerald-400 font-medium">Free</span>
              </div>
              <div className="flex justify-between text-base font-bold text-white pt-2 border-t border-slate-800">
                <span>Total Payable</span>
                <span className="text-2xl text-blue-400">{formatINR(cart.total)}</span>
              </div>
            </div>

            <Button
              variant="agent"
              size="lg"
              onClick={handleCheckoutPayment}
              disabled={isProcessing}
              className="w-full flex items-center justify-center gap-2 mt-4"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" /> Verifying with Razorpay...
                </>
              ) : (
                <>
                  <Lock className="h-4 w-4" /> Pay {formatINR(cart.total)} (Test Mode)
                </>
              )}
            </Button>

            <p className="text-[11px] text-center text-slate-500 leading-tight pt-1">
              No real money will be charged. This invokes Razorpay test credentials and server-side HMAC signature verification.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
