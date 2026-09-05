import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";
import { CartProvider } from "@/context/CartContext";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { FloatingChatWidget } from "@/components/chat/FloatingChatWidget";

export const metadata: Metadata = {
  title: "SellPilot — AI Revenue & Agentic Commerce Platform",
  description: "Next-generation agentic commerce infrastructure with bounded AI tool execution, Razorpay checkout, explainable recommendations, and merchant revenue analytics.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className="min-h-screen flex flex-col bg-slate-950 text-slate-100 antialiased selection:bg-blue-600 selection:text-white" suppressHydrationWarning>
        <CartProvider>
          <Navbar />
          <main className="flex-1">
            {children}
          </main>
          <Footer />
          <CartDrawer />
          <FloatingChatWidget />
        </CartProvider>
        {/* Razorpay Standard Checkout Script */}
        <Script
          src="https://checkout.razorpay.com/v1/checkout.js"
          strategy="lazyOnload"
        />
      </body>
    </html>
  );
}
