"use client";

import {
  ClipboardList,
  FileClock,
  FileText,
  FlaskConical,
  LayoutDashboard,
  LogOut,
  PanelLeftClose,
  PanelLeftOpen,
  Settings,
  TestTubeDiagonal,
  Users,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

type SidebarItem = {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
};

type PortalSidebarProps = {
  collapsed: boolean;
  onToggle: () => void;
  role: "ADMIN" | "RECEPTIONIST" | "TECHNICIAN";
};

const mainMenuItems: SidebarItem[] = [
  {
    label: "Dashboard",
    href: "/portal/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Sample Collection",
    href: "/portal/sample-collection",
    icon: TestTubeDiagonal,
  },
  {
    label: "Reports",
    href: "/portal/reports",
    icon: FileText,
  },
  {
    label: "Pending Reports",
    href: "/portal/pending-reports",
    icon: FileClock,
  },
  {
    label: "Test Management",
    href: "/portal/tests",
    icon: FlaskConical,
  },
];

const administrationItems: SidebarItem[] = [
  {
    label: "User Management",
    href: "/portal/users",
    icon: Users,
  },
  {
    label: "Settings",
    href: "/portal/settings",
    icon: Settings,
  },
];

function SidebarLink({
  item,
  pathname,
  collapsed,
}: {
  item: SidebarItem;
  pathname: string;
  collapsed: boolean;
}) {
  const Icon = item.icon;

  const isActive =
    pathname === item.href ||
    pathname.startsWith(`${item.href}/`);

  return (
    <Link
      href={item.href}
      title={collapsed ? item.label : undefined}
      aria-label={collapsed ? item.label : undefined}
      className={`group relative flex items-center overflow-hidden rounded-xl py-3 text-sm font-medium transition-all duration-300 ${collapsed
        ? "justify-center px-3"
        : "gap-3 px-4"
        } ${isActive
          ? "bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-lg shadow-blue-950/30"
          : "text-slate-300 hover:bg-white/10 hover:text-white hover:shadow-md"
        }`}
    >
      <Icon className="relative z-10 h-5 w-5 shrink-0 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3" />

      <span
        className={`relative z-10 overflow-hidden whitespace-nowrap transition-all duration-300 ${collapsed
          ? "w-0 opacity-0"
          : "w-auto opacity-100"
          }`}
      >
        {item.label}
      </span>
    </Link>
  );
}

export default function PortalSidebar({
  collapsed,
  onToggle,
  role,
}: PortalSidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const isAdmin = role === "ADMIN";

  const visibleMainMenuItems =
    mainMenuItems.filter((item) => {
      if (item.href === "/portal/tests") {
        return isAdmin;
      }

      return true;
    });

  const visibleAdministrationItems =
    administrationItems.filter((item) => {
      if (item.href === "/portal/users") {
        return isAdmin;
      }

      return true;
    });

  async function handleLogout() {
    await fetch("/api/auth/logout", {
      method: "POST",
    });

    router.push("/login");
    router.refresh();
  }

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-40 flex flex-col overflow-hidden bg-gradient-to-b from-slate-950 via-slate-900 to-blue-950 text-white shadow-2xl shadow-slate-950/40 transition-all duration-300 ease-in-out ${collapsed ? "w-20" : "w-64"
        }`}
    >
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="sidebar-glow sidebar-glow-one" />
        <div className="sidebar-glow sidebar-glow-two" />

        <div className="absolute left-4 top-28 h-16 w-16 animate-medical-float opacity-20">
          <FlaskConical className="h-16 w-16 text-cyan-300" />
        </div>

        <div className="absolute bottom-32 right-3 h-14 w-14 animate-medical-drift opacity-15">
          <TestTubeDiagonal className="h-14 w-14 text-blue-300" />
        </div>
      </div>

      <button
        type="button"
        onClick={onToggle}
        aria-label={
          collapsed
            ? "Expand sidebar"
            : "Collapse sidebar"
        }
        title={
          collapsed
            ? "Expand sidebar"
            : "Collapse sidebar"
        }
        className="absolute -right-5 top-5 z-50 flex h-10 w-10 items-center justify-center rounded-full border-4 border-slate-100 bg-gradient-to-br from-blue-600 to-cyan-500 text-white shadow-lg shadow-blue-500/30 transition duration-200 hover:scale-110 hover:from-blue-700 hover:to-cyan-600 active:scale-95"
      >
        {collapsed ? (
          <PanelLeftOpen className="h-5 w-5" />
        ) : (
          <PanelLeftClose className="h-5 w-5" />
        )}
      </button>

      <div
        className={`relative z-10 flex h-20 items-center border-b border-white/10 transition-all duration-300 ${collapsed
          ? "justify-center px-3"
          : "px-6"
          }`}
      >
        <div
          className={`flex items-center ${collapsed
            ? "justify-center"
            : "gap-3"
            }`}
        >
          <div className="sidebar-logo-glow flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 shadow-lg shadow-blue-500/30">
            <ClipboardList className="h-6 w-6" />
          </div>

          <div
            className={`overflow-hidden whitespace-nowrap transition-all duration-300 ${collapsed
              ? "w-0 opacity-0"
              : "w-40 opacity-100"
              }`}
          >
            <p className="bg-gradient-to-r from-white to-cyan-200 bg-clip-text text-lg font-bold text-transparent">
              Life Care Lab
            </p>

            <p className="text-xs text-slate-400">
              Management System
            </p>
          </div>
        </div>
      </div>

      <nav
        className={`relative z-10 flex-1 overflow-y-auto py-6 transition-all duration-300 ${collapsed ? "px-3" : "px-4"
          }`}
      >
        <p
          className={`mb-3 overflow-hidden whitespace-nowrap text-xs font-semibold uppercase tracking-wider text-slate-500 transition-all duration-300 ${collapsed
            ? "h-0 px-0 opacity-0"
            : "h-auto px-4 opacity-100"
            }`}
        >
          Main Menu
        </p>

        <div className="space-y-1">
          {visibleMainMenuItems.map((item) =>  (
            <SidebarLink
              key={item.href}
              item={item}
              pathname={pathname}
              collapsed={collapsed}
            />
          ))}
        </div>

        <p
          className={`mb-3 overflow-hidden whitespace-nowrap text-xs font-semibold uppercase tracking-wider text-slate-500 transition-all duration-300 ${collapsed
            ? "mt-3 h-0 px-0 opacity-0"
            : "mt-8 h-auto px-4 opacity-100"
            }`}
        >
          Administration
        </p>

        <div className="space-y-1">
          {visibleAdministrationItems.map((item) => (
            <SidebarLink
              key={item.href}
              item={item}
              pathname={pathname}
              collapsed={collapsed}
            />
          ))}
        </div>
      </nav>

      <div
        className={`relative z-10 border-t border-white/10 transition-all duration-300 ${collapsed ? "p-3" : "p-4"
          }`}
      >
        <button
          type="button"
          onClick={handleLogout}
          title={collapsed ? "Logout" : undefined}
          aria-label={collapsed ? "Logout" : undefined}
          className={`group flex w-full items-center rounded-xl py-3 text-sm font-medium text-slate-300 transition-all duration-300 hover:bg-red-500/10 hover:text-red-300 ${collapsed
            ? "justify-center px-3"
            : "gap-3 px-4"
            }`}
        >
          <LogOut className="h-5 w-5 shrink-0 transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-6" />

          <span
            className={`overflow-hidden whitespace-nowrap transition-all duration-300 ${collapsed
              ? "w-0 opacity-0"
              : "w-auto opacity-100"
              }`}
          >
            Logout
          </span>
        </button>
      </div>
    </aside>
  );
}