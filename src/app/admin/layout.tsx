"use client";

import React, { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    // Client-side authentication check
    const checkAuth = () => {
      const session = localStorage.getItem("franley_admin_session");
      if (!session && pathname !== "/admin/login") {
        setIsAuthenticated(false);
        router.replace("/admin/login");
      } else {
        setIsAuthenticated(true);
      }
    };

    checkAuth();

    // Listen to changes in localStorage (optional)
    window.addEventListener("storage", checkAuth);
    return () => window.removeEventListener("storage", checkAuth);
  }, [pathname, router]);

  // Loading state while checking authentication
  if (isAuthenticated === null && pathname !== "/admin/login") {
    return (
      <div className="w-screen h-screen bg-slate-50 flex items-center justify-center text-slate-400 font-inter">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-[#7b0323]/20 border-t-[#7b0323] rounded-full animate-spin" />
          <span className="text-[10px] font-bold tracking-widest uppercase text-slate-400">
            Verifying Admin Session...
          </span>
        </div>
      </div>
    );
  }

  // Let login page render without sidebar
  if (pathname === "/admin/login") {
    return <div className="bg-slate-50 min-h-screen text-slate-900">{children}</div>;
  }

  // Admin Dashboard base wrapper
  return (
    <div className="w-screen h-screen bg-slate-50 text-slate-800 font-inter select-none flex overflow-hidden relative">
      {/* Background ambient glow */}
      <div className="absolute top-[-10%] right-[10%] w-[500px] h-[500px] rounded-full blur-[150px] opacity-40 pointer-events-none bg-radial from-[#7b0323]/10 to-transparent" />
      <div className="absolute bottom-[-10%] left-[10%] w-[500px] h-[500px] rounded-full blur-[150px] opacity-30 pointer-events-none bg-radial from-emerald-100/40 to-transparent" />
      
      <div className="relative z-10 w-full h-full flex overflow-hidden">
        {children}
      </div>
    </div>
  );
}
