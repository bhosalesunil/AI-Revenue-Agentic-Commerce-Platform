export const SUPPORTED_CURRENCIES = [
  "INR",
  "USD",
  "EUR",
  "GBP",
  "CAD",
  "AUD",
  "SGD",
  "AED",
  "JPY",
] as const;

export type SupportedCurrency = (typeof SUPPORTED_CURRENCIES)[number];

export interface StoreSettings {
  id: string;
  merchantId: string;
  brandName: string;
  currency: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SettingsStatus {
  razorpay: {
    configured: boolean;
    mode: "test" | "live" | "not_configured";
    keyIdMasked: string | null;
  };
  database: {
    connected: boolean;
    provider: string;
  };
  ai: {
    configured: boolean;
    provider: string;
    model: string;
    hasApiKey: boolean;
  };
}
