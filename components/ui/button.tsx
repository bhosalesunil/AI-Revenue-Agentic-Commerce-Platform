import * as React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger" | "agent";
  size?: "sm" | "md" | "lg" | "icon";
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", ...props }, ref) => {
    const baseStyles =
      "inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50 disabled:opacity-50 disabled:pointer-events-none rounded-xl";

    const variants = {
      primary: "bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/25 active:scale-[0.98]",
      secondary: "bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700",
      outline: "border border-slate-700 text-slate-200 hover:bg-slate-800/80 hover:text-white",
      ghost: "text-slate-300 hover:text-white hover:bg-slate-800/50",
      danger: "bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-600/25",
      agent: "bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:opacity-95 text-white shadow-lg shadow-indigo-500/25 active:scale-[0.98]",
    };

    const sizes = {
      sm: "h-8 px-3 text-xs",
      md: "h-10 px-4 text-sm",
      lg: "h-12 px-6 text-base",
      icon: "h-10 w-10 p-0",
    };

    return (
      <button
        ref={ref}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";
