import type { ReactNode } from "react";
import { redirect } from "next/navigation";

import PortalShell from "@/components/layout/portal-shell";
import { getCurrentUser } from "@/lib/auth/session";

type PortalLayoutProps = {
  children: ReactNode;
};

export default async function PortalLayout({
  children,
}: PortalLayoutProps) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <PortalShell
      fullName={user.fullName}
      role={user.role}
    >
      {children}
    </PortalShell>
  );
}