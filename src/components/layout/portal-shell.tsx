"use client";

import { useState } from "react";

import AnimatedMedicalBackground from "@/components/layout/animated-medical-background";
import PortalHeader from "@/components/layout/portal-header";
import PortalSidebar from "@/components/layout/portal-sidebar";

type PortalShellProps = {
  children: React.ReactNode;
  fullName: string;

  role:
    | "ADMIN"
    | "RECEPTIONIST"
    | "TECHNICIAN";
};

export default function PortalShell({
  children,
  fullName,
  role,
}: PortalShellProps) {
  const [sidebarCollapsed, setSidebarCollapsed] =
    useState(false);

  return (
    <div className="relative min-h-screen overflow-x-hidden">
      <AnimatedMedicalBackground />

      <PortalSidebar
        collapsed={sidebarCollapsed}
        onToggle={() =>
          setSidebarCollapsed(
            (current) => !current,
          )
        }
        role={role}
      />

      <div
        className={`relative z-10 min-h-screen transition-all duration-300 ease-in-out ${
          sidebarCollapsed
            ? "ml-20"
            : "ml-64"
        }`}
      >
        <PortalHeader
          fullName={fullName}
          role={role}
        />

        <main className="relative p-8">
          {children}
        </main>
      </div>
    </div>
  );
}