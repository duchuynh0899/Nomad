"use client";

import { useEffect, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/Toast";

const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
const FACEBOOK_APP_ID = process.env.NEXT_PUBLIC_FACEBOOK_APP_ID;

// Google Identity Services + Facebook Login JS SDK — chỉ khai báo tối thiểu phần mình dùng.
declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string;
            callback: (response: { credential: string }) => void;
          }) => void;
          prompt: (momentListener?: (notification: { isNotDisplayed?: () => boolean }) => void) => void;
        };
      };
    };
    fbAsyncInit?: () => void;
    FB?: {
      init: (config: { appId: string; version: string; cookie?: boolean; xfbml?: boolean }) => void;
      login: (
        callback: (response: { authResponse?: { accessToken: string } }) => void,
        options: { scope: string }
      ) => void;
    };
  }
}

function loadScriptOnce(src: string, id: string) {
  if (document.getElementById(id)) return;
  const script = document.createElement("script");
  script.id = id;
  script.src = src;
  script.async = true;
  script.defer = true;
  document.body.appendChild(script);
}

export function SocialButtons() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState<"google" | "facebook" | null>(null);

  useEffect(() => {
    if (GOOGLE_CLIENT_ID) {
      loadScriptOnce("https://accounts.google.com/gsi/client", "google-identity-sdk");
    }
    if (FACEBOOK_APP_ID) {
      window.fbAsyncInit = () => {
        window.FB?.init({ appId: FACEBOOK_APP_ID, version: "v19.0", cookie: true, xfbml: false });
      };
      loadScriptOnce("https://connect.facebook.net/vi_VN/sdk.js", "facebook-jssdk");
    }
  }, []);

  const afterSignIn = async (result: { error?: string | null } | undefined, provider: string) => {
    if (result?.error) {
      toast(
        provider === "google"
          ? "Đăng nhập Google thất bại. Vui lòng thử lại hoặc dùng email/mật khẩu."
          : "Đăng nhập Facebook thất bại — có thể bạn chưa cấp quyền email. Vui lòng thử lại.",
        "error"
      );
      return;
    }
    router.push("/");
    router.refresh();
  };

  const handleGoogle = () => {
    if (!GOOGLE_CLIENT_ID || !window.google) {
      toast("Đăng nhập Google chưa được cấu hình.", "error");
      return;
    }
    setLoading("google");
    window.google.accounts.id.initialize({
      client_id: GOOGLE_CLIENT_ID,
      callback: async (response) => {
        try {
          const result = await signIn("google-idtoken", { idToken: response.credential, redirect: false });
          await afterSignIn(result ?? undefined, "google");
        } finally {
          setLoading(null);
        }
      },
    });
    window.google.accounts.id.prompt(() => setLoading(null));
  };

  const handleFacebook = () => {
    if (!FACEBOOK_APP_ID || !window.FB) {
      toast("Đăng nhập Facebook chưa được cấu hình.", "error");
      return;
    }
    setLoading("facebook");
    window.FB.login(
      async (response) => {
        try {
          if (!response.authResponse?.accessToken) {
            toast("Bạn cần cấp quyền email để đăng nhập bằng Facebook.", "error");
            return;
          }
          const result = await signIn("facebook-accesstoken", {
            accessToken: response.authResponse.accessToken,
            redirect: false,
          });
          await afterSignIn(result ?? undefined, "facebook");
        } finally {
          setLoading(null);
        }
      },
      { scope: "email" }
    );
  };

  return (
    <div className="space-y-2.5">
      <button
        onClick={handleGoogle}
        disabled={loading !== null}
        className="w-full flex items-center justify-center gap-3 border border-border px-4 py-2.5 text-sm font-medium hover:bg-dwarfs-surface transition-colors disabled:opacity-60"
      >
        <svg width="16" height="16" viewBox="0 0 24 24">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.99.66-2.26 1.06-3.71 1.06-2.86 0-5.29-1.93-6.15-4.53H2.18v2.85A11 11 0 0 0 12 23z"/>
          <path fill="#FBBC05" d="M5.85 14.1a6.6 6.6 0 0 1 0-4.2V7.05H2.18a11 11 0 0 0 0 9.9l3.67-2.85z"/>
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1a11 11 0 0 0-9.82 6.05l3.67 2.85C6.71 7.31 9.14 5.38 12 5.38z"/>
        </svg>
        {loading === "google" ? "Đang xử lý..." : "Tiếp tục với Google"}
      </button>

      <button
        onClick={handleFacebook}
        disabled={loading !== null}
        className="w-full flex items-center justify-center gap-3 bg-[#1877F2] text-white px-4 py-2.5 text-sm font-medium hover:bg-[#1666d8] transition-colors disabled:opacity-60"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
          <path d="M22 12a10 10 0 1 0-11.56 9.88v-6.99H7.9V12h2.54V9.8c0-2.5 1.49-3.89 3.78-3.89 1.1 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56V12h2.78l-.44 2.89h-2.34v6.99A10 10 0 0 0 22 12z"/>
        </svg>
        {loading === "facebook" ? "Đang xử lý..." : "Tiếp tục với Facebook"}
      </button>
    </div>
  );
}
