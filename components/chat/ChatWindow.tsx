"use client";

import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Bot, Send, User, Sparkles, ShoppingBag, ArrowRight, Shield, Check, X } from "lucide-react";
import { ChatMessage } from "@/types/ai";
import { formatINR } from "@/lib/utils";
import { useCart } from "@/context/CartContext";
import { Button } from "@/components/ui/button";

interface ChatWindowProps {
  initialMessage?: string;
  isFullPage?: boolean;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({ initialMessage, isFullPage = false }) => {
  const { addToCart, setIsCartOpen } = useCart();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      content: "Hello! I am your SellPilot AI shopping assistant. What are you looking to buy today?",
      suggestions: [
        "I need wireless headphones under ₹3000 for gaming",
        "Best mechanical keyboards",
        "Show me smart watches",
      ],
      createdAt: new Date().toISOString(),
    }
  ]);
  const [inputValue, setInputValue] = useState(initialMessage || "");
  const [isLoading, setIsLoading] = useState(false);
  const [addedItemIds, setAddedItemIds] = useState<Record<string, boolean>>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || inputValue;
    if (!text.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: `usr_${Date.now()}`,
      role: "user",
      content: text,
      createdAt: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userMsg]);
    setInputValue("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          cartId: "default_cart",
          conversationId: "conv_live",
          previousMessages: messages,
        }),
      });

      const data = await res.json();
      if (data.success && data.response) {
        setMessages(prev => [...prev, data.response]);
      } else {
        setMessages(prev => [
          ...prev,
          {
            id: `err_${Date.now()}`,
            role: "assistant",
            content: "I ran into a temporary hiccup processing that request. Please try again.",
            createdAt: new Date().toISOString(),
          }
        ]);
      }
    } catch (err) {
      console.error("Chat error:", err);
      setMessages(prev => [
        ...prev,
        {
          id: `err_${Date.now()}`,
          role: "assistant",
          content: "Network connectivity issue. Please ensure the server is active.",
          createdAt: new Date().toISOString(),
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddToCart = async (product: any) => {
    await addToCart(product.id, 1);
    setAddedItemIds(prev => ({ ...prev, [product.id]: true }));

    // Send agent event for conversational continuum
    handleSendMessage(`add_to_cart:${product.id}`);
  };

  return (
    <div className={`flex flex-col bg-slate-950 border border-slate-800/80 rounded-2xl overflow-hidden shadow-2xl ${isFullPage ? "h-[80vh] w-full" : "h-[560px] w-[380px] sm:w-[420px]"}`}>
      {/* Header */}
      <div className="px-5 py-3.5 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 shadow-md">
            <Bot className="h-4 w-4 text-white" />
            <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-emerald-400 ring-2 ring-slate-950 animate-pulse" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
              SellPilot AI Agent
              <span className="text-[10px] bg-indigo-500/20 text-indigo-300 px-1.5 py-0.2 rounded border border-indigo-500/30">
                Active
              </span>
            </h3>
            <p className="text-[11px] text-slate-400">Autonomous shopping & upsell engine</p>
          </div>
        </div>

        <span className="flex items-center gap-1 text-[11px] text-emerald-400 font-medium">
          <Shield className="h-3.5 w-3.5" /> Gated Guard
        </span>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex flex-col ${msg.role === "user" ? "items-end" : "items-start"}`}>
            <div className={`flex gap-2.5 max-w-[90%] ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
              {/* Avatar */}
              <div className={`h-7 w-7 rounded-lg flex items-center justify-center flex-shrink-0 text-xs font-semibold ${
                msg.role === "user" ? "bg-blue-600 text-white" : "bg-gradient-to-tr from-indigo-500 to-pink-500 text-white shadow-sm"
              }`}>
                {msg.role === "user" ? <User className="h-3.5 w-3.5" /> : <Bot className="h-3.5 w-3.5" />}
              </div>

              {/* Message Bubble */}
              <div className="space-y-3">
                <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                  msg.role === "user"
                    ? "bg-blue-600 text-white rounded-tr-none shadow-md"
                    : "bg-slate-900 border border-slate-800/80 text-slate-100 rounded-tl-none"
                }`}>
                  <p className="whitespace-pre-line">{msg.content}</p>

                  {/* Tool Call Tag for Explainability */}
                  {msg.toolCalls && msg.toolCalls.length > 0 && (
                    <div className="mt-2.5 pt-2 border-t border-slate-800 flex flex-wrap gap-1.5">
                      {msg.toolCalls.map((tc, idx) => (
                        <span key={idx} className="text-[10px] font-mono text-indigo-300 bg-indigo-950/60 px-2 py-0.5 rounded border border-indigo-800/60 flex items-center gap-1">
                          <Sparkles className="h-2.5 w-2.5 text-pink-400" />
                          tool: {tc.name}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Embedded Product Cards */}
                {msg.productCards && msg.productCards.length > 0 && (
                  <div className="grid grid-cols-1 gap-2.5 w-full mt-2">
                    <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                      Recommended for you
                    </span>
                    {msg.productCards.map((product) => (
                      <div
                        key={product.id}
                        className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 transition-colors"
                      >
                        <div className="relative h-14 w-14 rounded-lg overflow-hidden flex-shrink-0 bg-slate-800">
                          <Image
                            src={product.imageUrl || "https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=800"}
                            alt={product.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-xs font-semibold text-white truncate">{product.name}</h4>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-xs font-bold text-white">{formatINR(product.price)}</span>
                            <span className="text-[10px] text-amber-400">★ {product.rating}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5 flex-shrink-0">
                          <Button
                            size="sm"
                            variant={addedItemIds[product.id] ? "secondary" : "agent"}
                            onClick={() => handleAddToCart(product)}
                            className="h-7 px-2.5 text-xs"
                          >
                            {addedItemIds[product.id] ? (
                              <Check className="h-3 w-3 text-emerald-400" />
                            ) : (
                              "Add"
                            )}
                          </Button>
                          <Link href={`/products/${product.id}`} className="text-slate-400 hover:text-white p-1">
                            <ArrowRight className="h-3.5 w-3.5" />
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Upsell Prompt Card with [Add] and [No Thanks] */}
                {msg.upsellSuggestion && (
                  <div className="p-3.5 rounded-xl bg-gradient-to-br from-indigo-950/60 to-purple-950/40 border border-indigo-500/30 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-indigo-300 flex items-center gap-1">
                        <Sparkles className="h-3.5 w-3.5 text-pink-400" /> Smart Companion Suggestion
                      </span>
                      <span className="text-xs font-bold text-emerald-400">
                        {formatINR(msg.upsellSuggestion.product.price)}
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 leading-tight">
                      {msg.upsellSuggestion.reason}
                    </p>
                    <div className="flex items-center gap-2 pt-1">
                      <Button
                        size="sm"
                        variant="agent"
                        onClick={() => handleAddToCart(msg.upsellSuggestion!.product)}
                        className="text-xs h-7 px-3 flex-1"
                      >
                        Add {msg.upsellSuggestion.product.name.split(" ")[0]} ({formatINR(msg.upsellSuggestion.product.price)})
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleSendMessage("No thanks, proceed with my cart")}
                        className="text-xs h-7 px-2 text-slate-400 hover:text-white"
                      >
                        No Thanks
                      </Button>
                    </div>
                  </div>
                )}

                {/* Cart Summary & Checkout Trigger in Chat */}
                {msg.cartSummary?.readyForCheckout && (
                  <div className="p-3.5 rounded-xl bg-blue-950/40 border border-blue-500/30 flex items-center justify-between gap-3">
                    <div>
                      <span className="text-xs text-slate-400 block">Verified Payable Total</span>
                      <span className="text-base font-bold text-white">{formatINR(msg.cartSummary.total)}</span>
                    </div>
                    <Link href="/checkout">
                      <Button size="sm" variant="primary" className="text-xs h-8 px-4 flex items-center gap-1.5">
                        <ShoppingBag className="h-3.5 w-3.5" /> Open Checkout
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Action Suggestion Pills */}
            {msg.suggestions && msg.suggestions.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2 ml-9">
                {msg.suggestions.map((sug, i) => (
                  <button
                    key={i}
                    onClick={() => handleSendMessage(sug)}
                    className="text-[11px] font-medium text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-800 px-2.5 py-1 rounded-full transition-all active:scale-95"
                  >
                    {sug}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}

        {isLoading && (
          <div className="flex items-center gap-2.5 ml-1 text-xs text-indigo-400 animate-pulse">
            <Bot className="h-4 w-4" />
            <span>AI is querying catalog & calculating security bounds...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Box */}
      <div className="p-3.5 bg-slate-900/90 border-t border-slate-800">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Search audio, ask for upsells, request checkout..."
            className="flex-1 bg-slate-950/80 text-sm text-white placeholder:text-slate-500 rounded-xl px-4 py-2.5 border border-slate-800 focus:outline-none focus:border-indigo-500 transition-colors"
          />
          <Button
            type="submit"
            variant="agent"
            size="icon"
            disabled={!inputValue.trim() || isLoading}
            className="h-10 w-10 flex-shrink-0"
            aria-label="Send query to AI"
          >
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  );
};
