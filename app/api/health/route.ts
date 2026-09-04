import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { isRazorpayConfigured } from "@/lib/razorpay";

export const dynamic = "force-dynamic";

export async function GET() {
  const startTime = Date.now();
  let dbStatus = "connected";
  let productCount = 0;
  let inStockCount = 0;

  try {
    const products = await prisma.product.findMany({
      select: { id: true, stock: true, isActive: true },
    });
    productCount = products.length;
    inStockCount = products.filter((p) => p.isActive && p.stock > 0).length;
  } catch (err) {
    dbStatus = "degraded";
  }

  const responseTimeMs = Date.now() - startTime;

  return NextResponse.json(
    {
      status: dbStatus === "connected" ? "healthy" : "degraded",
      timestamp: new Date().toISOString(),
      uptime_seconds: Math.floor(process.uptime()),
      version: "1.0.0",
      components: {
        database: {
          provider: "PostgreSQL 18",
          status: dbStatus,
          responseTimeMs,
        },
        catalog: {
          status: productCount > 0 ? "available" : "empty",
          totalProducts: productCount,
          activeInStockProducts: inStockCount,
        },
        payment: {
          gateway: "Razorpay",
          mode: isRazorpayConfigured() ? "test-mode" : "not-configured",
          status: "ready",
        },
        agentic_commerce: {
          catalogEndpoint: "/api/ai-catalog",
          status: "active",
          schemaVersion: "1.0",
        },
      },
    },
    {
      status: dbStatus === "connected" ? 200 : 503,
      headers: {
        "Cache-Control": "no-store",
      },
    }
  );
}
