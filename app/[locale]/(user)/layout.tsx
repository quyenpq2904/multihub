"use client";

import NavBar from "@/components/layout/NavBar";
import { useRouter } from "@/i18n/navigation";
import { useProfile } from "@/lib/hooks/useProfile";
import React from "react";

export default function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen xl:flex">
      <div className={`flex-1 transition-all duration-300 ease-in-out`}>
        <NavBar />
        <div className="p-4 mx-auto md:p-6">{children}</div>
      </div>
    </div>
  );
}
