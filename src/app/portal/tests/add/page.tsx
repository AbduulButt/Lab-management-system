import TestForm from "@/components/forms/test-form";
import { requireAdmin } from "@/lib/auth/authorization";

export default async function AddTestPage() {
  await requireAdmin();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">
          Add New Test
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          Add test details, price and report paragraph.
        </p>
      </div>

      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <TestForm />
      </section>
    </div>
  );
}