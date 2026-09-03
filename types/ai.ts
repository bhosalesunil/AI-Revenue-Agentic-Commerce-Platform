export type ToolName =
  | "searchProducts"
  | "getProductDetails"
  | "createCart"
  | "addToCart"
  | "removeFromCart"
  | "calculateCart"
  | "createCheckout"
  | "getPaymentStatus";

export interface AgentAction {
  tool: ToolName;
  input: Record<string, any>;
  output?: Record<string, any>;
  justification: string;
  status: "SUCCESS" | "FAILED";
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant" | "system" | "tool";
  content: string;
  toolCalls?: {
    name: ToolName;
    args: Record<string, any>;
  }[];
  toolResults?: {
    name: ToolName;
    result: any;
  }[];
  suggestions?: string[];
  productCards?: any[];
  upsellSuggestion?: {
    product: any;
    reason: string;
    discountedPrice?: number;
  };
  cartSummary?: any;
  createdAt?: string;
}

export interface AgentEventLog {
  id: string;
  conversationId?: string | null;
  userId?: string | null;
  eventType: string;
  toolName: string;
  input?: string | null;
  output?: string | null;
  status: string;
  amount?: number | null;
  justification?: string | null;
  createdAt: string | Date;
}
