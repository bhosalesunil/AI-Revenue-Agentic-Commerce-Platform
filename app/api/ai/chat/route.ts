import { NextResponse } from "next/server";
import { processAgentConversation } from "@/lib/ai/agent";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { message, cartId, conversationId, userId, previousMessages } = body;

    if (!message || typeof message !== "string") {
      return NextResponse.json({ success: false, error: "message string is required" }, { status: 400 });
    }

    const response = await processAgentConversation({
      message,
      cartId,
      conversationId,
      userId,
      previousMessages,
    });

    return NextResponse.json({ success: true, response });
  } catch (error: any) {
    console.error("AI Chat route error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
