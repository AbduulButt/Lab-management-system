import DataManagementSection from "@/components/settings/data-management-section";
import { requireAdmin } from "@/lib/auth/authorization";

export default async function SettingsPage() {
    await requireAdmin();

    return (
        <div className="space-y-6">
            <section>
                <h2 className="text-2xl font-bold text-slate-900">
                    Settings
                </h2>

                <p className="mt-2 text-slate-500">
                    Laboratory information, logo, report settings
                    and database management will be managed here.
                </p>
            </section>

            <DataManagementSection />
        </div>
    );
}