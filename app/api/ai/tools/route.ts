import { NextResponse } from "next/server";
import { AGENT_TOOLS } from "@/lib/ai/tools";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { toolName, args, conversationId, userId } = body;

    const tool = AGENT_TOOLS[toolName];
    if (!tool) {
      return NextResponse.json(
        { success: false, error: `Tool ${toolName} not found. Available: ${Object.keys(AGENT_TOOLS).join(", ")}` },
        { status: 404 }
      );
    }

    const result = await tool.execute(args || {}, { conversationId, userId });
    return NextResponse.json({ success: true, toolName, result });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
