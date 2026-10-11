import { redirect } from "next/navigation";

import { UserRole } from "@/generated/prisma/client";
import { getCurrentUser } from "@/lib/auth/session";

export async function requireAuthenticatedUser() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return user;
}

export async function requireAdmin() {
  const user = await requireAuthenticatedUser();

  if (user.role !== UserRole.ADMIN) {
    redirect("/portal/dashboard");
  }

  return user;
}

export async function requireRole(
  allowedRoles: UserRole[],
) {
  const user = await requireAuthenticatedUser();

  if (!allowedRoles.includes(user.role)) {
    redirect("/portal/dashboard");
  }

  return user;
}