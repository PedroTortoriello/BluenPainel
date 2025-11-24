"use client";

import { Bell, UserCircle } from "lucide-react";

export default function Navbar() {
  return (
    <div className="h-16 bg-white shadow flex items-center justify-between px-4">
      <div className="text-lg font-semibold">Dashboard</div>
      <div className="flex items-center gap-4">
        <Bell className="w-5 h-5 text-gray-600 cursor-pointer" />
        <UserCircle className="w-6 h-6 text-gray-600 cursor-pointer" />
      </div>
    </div>
  );
}
