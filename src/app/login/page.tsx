import { ClipboardList } from "lucide-react";
import { redirect } from "next/navigation";

import LoginForm from "@/components/forms/login-form";
import { getCurrentUser } from "@/lib/auth/session";

export default async function LoginPage() {
    const user = await getCurrentUser();

    if (user) {
        redirect("/portal/dashboard");
    }

    return (
        <main className="flex min-h-screen bg-slate-100">
            <section className="hidden w-1/2 items-center justify-center bg-slate-900 p-12 lg:flex">
                <div className="max-w-lg text-white">
                    <div className="mb-8 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-600">
                        <ClipboardList className="h-9 w-9" />
                    </div>

                    <h1 className="text-4xl font-bold leading-tight">
                        Life Care Lab Management System
                    </h1>

                    <p className="mt-5 text-lg leading-8 text-slate-300">
                        Manage patients, sample collections, test results and laboratory
                        reports from one secure offline system.
                    </p>
                </div>
            </section>

            <section className="flex w-full items-center justify-center p-6 lg:w-1/2">
                <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-lg">
                    <div className="mb-8">
                        <h2 className="text-3xl font-bold text-slate-900">
                            Welcome back
                        </h2>

                        <p className="mt-2 text-slate-500">
                            Enter your staff credentials to continue.
                        </p>
                    </div>

                    <LoginForm />
                </div>
            </section>
        </main>
    );
}