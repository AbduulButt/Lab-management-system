import { Bell, CalendarDays, UserRound } from "lucide-react";

type PortalHeaderProps = {
    fullName: string;
    role: string;
};

function formatRole(role: string): string {
    return role
        .toLowerCase()
        .split("_")
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(" ");
}

export default function PortalHeader({
    fullName,
    role,
}: PortalHeaderProps) {
    const formattedDate = new Intl.DateTimeFormat("en-PK", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    }).format(new Date());

    return (
        <header className="sticky top-0 z-20 flex h-20 items-center justify-between border-b border-slate-200 bg-white px-8">
            <div>
                <h1 className="text-xl font-semibold text-slate-900">
                    Lab Management System
                </h1>

                <div className="mt-1 flex items-center gap-2 text-sm text-slate-500">
                    <CalendarDays className="h-4 w-4" />
                    <span>{formattedDate}</span>
                </div>
            </div>

            <div className="flex items-center gap-4">
                <button
                    type="button"
                    aria-label="Notifications"
                    className="relative rounded-lg border border-slate-200 p-2.5 text-slate-600 transition hover:bg-slate-100"
                >
                    <Bell className="h-5 w-5" />
                </button>

                <div className="flex items-center gap-3 border-l border-slate-200 pl-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-700">
                        <UserRound className="h-5 w-5" />
                    </div>

                    <div>
                        <p className="text-sm font-semibold text-slate-900">
                            {fullName}
                        </p>

                        <p className="text-xs text-slate-500">
                            {formatRole(role)}
                        </p>
                    </div>
                </div>
            </div>
        </header>
    );
}