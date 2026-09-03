import React from "react";
import { DashboardSidebar } from "@/components/dashboard/Sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-[calc(100vh-4rem)]">
      <DashboardSidebar />
      <div className="flex-1 overflow-x-hidden p-6 sm:p-8">
        {children}
      </div>
    </div>
  );
}
