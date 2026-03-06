"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  LayoutDashboard,
  Car,
  Users,
  FileText,
  CreditCard,
  Wrench,
  LogOut,
  BarChart2,
} from "lucide-react";



const navItems = [
  { href: "/dashboard",  label: "Dashboard",  icon: LayoutDashboard },
  { href: "/cars",       label: "Cars",        icon: Car },
  { href: "/customers",  label: "Customers",   icon: Users },
  { href: "/rentals",    label: "Rentals",     icon: FileText },
  { href: "/payments",   label: "Payments",    icon: CreditCard },
  { href: "/maintenance",label: "Maintenance", icon: Wrench },
  { href: "/reports", label: "Reports", icon: BarChart2 },
];

export function Sidebar({ user }: { user: any }) {
  const pathname = usePathname();

  return (
    <div className="w-64 bg-gray-900 text-white flex flex-col h-screen sticky top-0">
      {/* Logo */}
      <div className="p-6 border-b border-gray-700">
        <div className="text-2xl font-bold">🚗 CarRental</div>
        <div className="text-gray-400 text-sm mt-1">ERP System</div>
      </div>

      {/* Nav Links */}
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                isActive
                  ? "bg-blue-600 text-white"
                  : "text-gray-400 hover:bg-gray-800 hover:text-white"
              }`}
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* User + Logout */}
      <div className="p-4 border-t border-gray-700">
        <div className="flex items-center gap-3 mb-3 px-4">
          <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-sm font-bold">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="text-sm font-medium">{user?.name}</div>
            <div className="text-xs text-gray-400">{(user as any)?.role}</div>
          </div>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="flex items-center gap-3 px-4 py-2 w-full text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
        >
          <LogOut className="w-5 h-5" />
          Sign Out
        </button>
      </div>
    </div>
  );
}