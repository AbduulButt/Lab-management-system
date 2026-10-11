import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth/authorization";

export default async function TestsPage() {
  await requireAdmin();

  // existing Prisma/database code stays here
}