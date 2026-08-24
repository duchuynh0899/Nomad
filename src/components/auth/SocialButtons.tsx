"use client";

import { signIn } from "next-auth/react";

export function SocialButtons() {
  return (
    <div className="space-y-2.5">
      <button
        onClick={() => signIn("google", { callbackUrl: "/" })}
        className="w-full flex items-center justify-center gap-3 border border-border px-4 py-2.5 text-sm font-medium hover:bg-dwarfs-surface transition-colors"
      >
        <svg width="16" height="16" viewBox="0 0 24 24">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.99.66-2.26 1.06-3.71 1.06-2.86 0-5.29-1.93-6.15-4.53H2.18v2.85A11 11 0 0 0 12 23z"/>
          <path fill="#FBBC05" d="M5.85 14.1a6.6 6.6 0 0 1 0-4.2V7.05H2.18a11 11 0 0 0 0 9.9l3.67-2.85z"/>
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1a11 11 0 0 0-9.82 6.05l3.67 2.85C6.71 7.31 9.14 5.38 12 5.38z"/>
        </svg>
        Tiếp tục với Google
      </button>

      <button
        onClick={() => signIn("facebook", { callbackUrl: "/" })}
        className="w-full flex items-center justify-center gap-3 bg-[#1877F2] text-white px-4 py-2.5 text-sm font-medium hover:bg-[#1666d8] transition-colors"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
          <path d="M22 12a10 10 0 1 0-11.56 9.88v-6.99H7.9V12h2.54V9.8c0-2.5 1.49-3.89 3.78-3.89 1.1 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56V12h2.78l-.44 2.89h-2.34v6.99A10 10 0 0 0 22 12z"/>
        </svg>
        Tiếp tục với Facebook
      </button>
    </div>
  );
}