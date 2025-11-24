"use client";

import Link from "next/link";
import { Home, Users, FileText, Settings } from "lucide-react";

export default function Sidebar() {
  const menuItems = [
    { title: "Dashboard", href: "/Dashboard", icon: Home },
    { title: "Leads", href: "/Leads", icon: Users },
    { title: "Propostas", href: "/Propostas", icon: FileText },
    { title: "Configurações", href: "/Config", icon: Settings },
  ];

  return (
    <div className="w-64 bg-gray-800 text-white min-h-screen flex flex-col p-4">
      <div className="text-2xl font-bold mb-6">CRM Rizon</div>
      <nav className="flex-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.title}
              href={item.href}
              className="flex items-center gap-2 px-4 py-2 rounded hover:bg-gray-700 transition-colors"
            >
              <Icon className="w-5 h-5" />
              {item.title}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
