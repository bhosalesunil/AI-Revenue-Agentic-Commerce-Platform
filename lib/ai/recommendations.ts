import { store } from "../data/store";
import { MockProduct } from "../data/initialData";

export interface UpsellRecommendation {
  product: MockProduct;
  reason: string;
  source: "AI_UPSELL" | "CART_CROSS_SELL" | "AFFINITY";
  originalPrice: number;
  discountedPrice?: number;
}

// Product affinity mapping
const AFFINITY_RULES: Record<string, { targetCategory?: string; targetId?: string; reason: string }> = {
  prod_gaming_headphones: {
    targetId: "prod_gaming_mouse",
    reason: "Frequently paired with low-latency gaming headsets. 68% of gamers bundle these for complete desktop control.",
  },
  prod_mech_keyboard: {
    targetId: "prod_gaming_mouse",
    reason: "Complete your cyber battle-station setup with synchronizable RGB lighting.",
  },
  prod_smart_watch: {
    targetId: "prod_anc_earbuds",
    reason: "Pairs seamlessly with fitness tracking for workout music without your phone.",
  },
  prod_laptop_stand: {
    targetId: "prod_desk_lamp",
    reason: "Customers upgrading their desk ergonomics frequently add the glare-free monitor light bar.",
  },
  prod_anc_earbuds: {
    targetId: "prod_power_bank",
    reason: "Never run out of battery on travels with snap-and-charge magnetic power.",
  },
};

export async function getUpsellForProduct(productId: string): Promise<UpsellRecommendation | null> {
  const rule = AFFINITY_RULES[productId];
  if (rule?.targetId) {
    const targetProduct = await store.getProductById(rule.targetId);
    if (targetProduct) {
      return {
        product: targetProduct,
        reason: rule.reason,
        source: "AI_UPSELL",
        originalPrice: targetProduct.price,
      };
    }
  }

  // Fallback to related product from complementary category
  const allProducts = await store.getProducts();
  const candidate = allProducts.find(p => p.id !== productId && (p.category === "Accessories" || p.category === "Gaming"));
  if (candidate) {
    return {
      product: candidate,
      reason: "Popular companion accessory selected for you.",
      source: "AFFINITY",
      originalPrice: candidate.price,
    };
  }

  return null;
}
