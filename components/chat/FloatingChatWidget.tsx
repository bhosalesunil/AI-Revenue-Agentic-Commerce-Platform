"use client";

import React, { useState } from "react";
import { Sparkles, X, Bot } from "lucide-react";
import { ChatWindow } from "./ChatWindow";

export const FloatingChatWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {isOpen ? (
        <div className="flex flex-col items-end">
          <button
            onClick={() => setIsOpen(false)}
            className="mb-2 flex h-8 w-8 items-center justify-center rounded-full bg-slate-800 text-slate-300 hover:text-white border border-slate-700 shadow-lg"
            aria-label="Close Assistant"
          >
            <X className="h-4 w-4" />
          </button>
          <ChatWindow />
        </div>
      ) : (
        <button
          onClick={() => setIsOpen(true)}
          className="group relative flex items-center gap-2.5 rounded-full bg-gradient-to-r from-blue-600 via-indigo-600 to-pink-500 p-3.5 sm:px-5 sm:py-3 text-white shadow-xl shadow-indigo-600/30 hover:scale-105 active:scale-95 transition-all"
          aria-label="Open AI Shopping Assistant"
        >
          <div className="relative">
            <Bot className="h-5 w-5 text-white" />
            <span className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full bg-emerald-400 ring-2 ring-indigo-600 animate-pulse" />
          </div>
          <span className="hidden sm:inline font-semibold text-sm tracking-tight flex items-center gap-1.5">
            Ask AI Shopper
            <Sparkles className="h-3.5 w-3.5 text-pink-300" />
          </span>
        </button>
      )}
    </div>
  );
};
