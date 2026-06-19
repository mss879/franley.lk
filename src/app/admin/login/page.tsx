"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg(null);

    // Short timeout for realistic loading visual feel
    await new Promise((r) => setTimeout(r, 800));

    try {
      // Try Supabase Auth if configured
      if (supabase) {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          throw error;
        }

        if (data.session) {
          // Ensure that the logged in email is exactly the admin email
          if (data.session.user.email !== "admin@franley.lk") {
            await supabase.auth.signOut();
            throw new Error("Access denied: This email is not authorized as administrator.");
          }

          localStorage.setItem(
            "franley_admin_session",
            JSON.stringify({ email, token: data.session.access_token, mode: "supabase" })
          );
          router.push("/admin");
          return;
        }
      } else {
        throw new Error("Database services are currently unconfigured. Authentication is unavailable.");
      }

      setErrorMsg("Invalid email or password.");
    } catch (err: any) {
      setErrorMsg(err.message || "An authentication error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-screen h-screen flex items-center justify-center font-inter px-6 relative bg-slate-50 text-slate-800 select-none">
      {/* Background ambient glow */}
      <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] rounded-full blur-[130px] opacity-40 bg-radial from-[#7b0323]/20 to-transparent pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full blur-[130px] opacity-40 bg-radial from-emerald-100/40 to-transparent pointer-events-none" />

      <div className="w-full max-w-md bg-white border border-slate-200/80 rounded-[2.5rem] p-8 md:p-10 shadow-[0_15px_50px_-10px_rgba(15,23,42,0.06)] relative overflow-hidden">
        {/* Border Top Accent Line */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#7b0323] via-fuchsia-500 to-emerald-500" />

        <div className="flex flex-col items-center text-center mb-8">
          <img src="/franley_logo_no_text_transparent.png" alt="Logo" className="w-32 h-8 object-contain mb-6" />
          <h2 className="text-xl md:text-2xl font-black font-inter tracking-tight text-slate-900">
            ADMIN SYSTEM LOGIN
          </h2>
          <p className="text-[10px] text-slate-400 font-extrabold tracking-widest uppercase mt-1">
            Franley Control Panel
          </p>
        </div>

        {errorMsg && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-xs font-semibold px-4 py-3 rounded-2xl mb-6 text-center animate-pulse">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleLogin} className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <label className="text-[9px] font-black tracking-widest text-slate-400 uppercase ml-1">
              Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g., admin@franley.lk"
              className="bg-slate-50 border border-slate-200 focus:border-[#7b0323]/80 focus:bg-white focus:shadow-[0_0_10px_rgba(123,3,35,0.05)] rounded-2xl px-4 py-3.5 text-xs md:text-sm font-semibold text-slate-900 placeholder-slate-400 focus:outline-none transition-all"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-[9px] font-black tracking-widest text-slate-400 uppercase ml-1">
              Secret Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              className="bg-slate-50 border border-slate-200 focus:border-[#7b0323]/80 focus:bg-white focus:shadow-[0_0_10px_rgba(123,3,35,0.05)] rounded-2xl px-4 py-3.5 text-xs md:text-sm font-semibold text-slate-900 placeholder-slate-400 focus:outline-none transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-slate-900 hover:bg-slate-800 text-white text-xs font-black tracking-widest py-4 rounded-full mt-2 shadow-md hover:scale-[1.01] active:scale-95 transition-all cursor-pointer disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed flex items-center justify-center gap-2 border-0"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-slate-400 border-t-white rounded-full animate-spin" />
                VERIFYING...
              </>
            ) : (
              "ACCESS CONTROL PANEL"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
