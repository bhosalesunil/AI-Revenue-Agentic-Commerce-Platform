export interface MerchantAnalytics {
  revenue: {
    total: number;
    aiAssisted: number;
    aiUpsell: number;
    organic: number;
    currency: string;
    growthPercent: number;
  };
  orders: {
    total: number;
    completed: number;
    pending: number;
    cancelled: number;
  };
  conversionRate: {
    overall: number; // e.g. 12.4%
    aiAssisted: number; // e.g. 28.6%
    withoutAi: number; // e.g. 4.2%
  };
  averageOrderValue: {
    overall: number;
    aiAssisted: number;
    standard: number;
  };
  recentEvents: {
    id: string;
    time: string;
    action: string;
    toolName: string;
    status: string;
    detail: string;
  }[];
  revenueChart: {
    date: string;
    total: number;
    aiRevenue: number;
  }[];
}
