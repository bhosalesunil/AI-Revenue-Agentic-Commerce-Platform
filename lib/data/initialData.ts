export interface MockProduct {
  id: string;
  merchantId: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  category: string;
  stock: number;
  imageUrl: string;
  rating: number;
  isActive: boolean;
}

export const INITIAL_MERCHANT = {
  id: "merch_nexus_01",
  userId: "user_merchant_01",
  storeName: "Nexus Gear & Electronics",
  description: "Official authorized dealer of next-generation tech and gaming gear.",
};

export const INITIAL_PRODUCTS: MockProduct[] = [
  {
    id: "prod_gaming_headphones",
    merchantId: "merch_nexus_01",
    name: "HyperSonic Pro Wireless Gaming Headphones",
    description: "Ultra-low 2.4GHz 15ms wireless latency, 50mm neodymium audio drivers, and AI environmental noise-canceling detachable microphone.",
    price: 1799,
    currency: "INR",
    category: "Audio",
    stock: 42,
    imageUrl: "https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=800&auto=format&fit=crop&q=80",
    rating: 4.8,
    isActive: true,
  },
  {
    id: "prod_gaming_mouse",
    merchantId: "merch_nexus_01",
    name: "ViperStrike Wireless RGB Gaming Mouse",
    description: "26,000 DPI Optical Sensor, 59g ultra-lightweight ergonomic honeycomb shell, and 80-hour battery life with PTFE glide feet.",
    price: 799,
    currency: "INR",
    category: "Gaming",
    stock: 65,
    imageUrl: "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=800&auto=format&fit=crop&q=80",
    rating: 4.7,
    isActive: true,
  },
  {
    id: "prod_mech_keyboard",
    merchantId: "merch_nexus_01",
    name: "CyberKey 75% Mechanical RGB Keyboard",
    description: "Hot-swappable custom lubricated linear switches, sound dampening foam, per-key RGB backlight, and aircraft-grade aluminum top plate.",
    price: 2499,
    currency: "INR",
    category: "Gaming",
    stock: 28,
    imageUrl: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&auto=format&fit=crop&q=80",
    rating: 4.9,
    isActive: true,
  },
  {
    id: "prod_anc_earbuds",
    merchantId: "merch_nexus_01",
    name: "AeroPod QuietMax ANC Earbuds",
    description: "Hybrid Active Noise Cancellation (-42dB), LDAC High-Res audio codec, transparency mode, and 36-hour fast charging case.",
    price: 2999,
    currency: "INR",
    category: "Audio",
    stock: 35,
    imageUrl: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800&auto=format&fit=crop&q=80",
    rating: 4.6,
    isActive: true,
  },
  {
    id: "prod_smart_watch",
    merchantId: "merch_nexus_01",
    name: "PulseFit Titan Pro Smartwatch",
    description: "1.43-inch AMOLED display with Always-On screen, SpO2 & 24/7 heart rate monitoring, titanium bezel, and 12-day battery life.",
    price: 2299,
    currency: "INR",
    category: "Wearables",
    stock: 50,
    imageUrl: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80",
    rating: 4.7,
    isActive: true,
  },
  {
    id: "prod_power_bank",
    merchantId: "merch_nexus_01",
    name: "MagCharge 10,000mAh Magnetic Power Bank",
    description: "Snap-and-charge 15W Qi2 wireless charging, 20W PD fast wired USB-C output, and built-in foldable zinc-alloy kickstand.",
    price: 1299,
    currency: "INR",
    category: "Accessories",
    stock: 80,
    imageUrl: "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=800&auto=format&fit=crop&q=80",
    rating: 4.5,
    isActive: true,
  },
  {
    id: "prod_laptop_stand",
    merchantId: "merch_nexus_01",
    name: "ErgoLift Aluminum Dual-Pivot Laptop Stand",
    description: "Heavy-duty CNC machined sandblasted aluminum, 360-degree rotating base, silicone heat-dissipation pads, supports up to 17-inch laptops.",
    price: 1199,
    currency: "INR",
    category: "Accessories",
    stock: 40,
    imageUrl: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=800&auto=format&fit=crop&q=80",
    rating: 4.8,
    isActive: true,
  },
  {
    id: "prod_desk_lamp",
    merchantId: "merch_nexus_01",
    name: "LuminaScreen Smart Monitor Light Bar",
    description: "Asymmetrical glare-free optical design, wireless desktop dial controller, auto-dimming ambient light sensor, and stepless color temperature.",
    price: 1499,
    currency: "INR",
    category: "Accessories",
    stock: 30,
    imageUrl: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=800&auto=format&fit=crop&q=80",
    rating: 4.6,
    isActive: true,
  },
];
