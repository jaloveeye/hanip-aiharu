"use client";

import { supabase } from "@/lib/supabaseClient";

export default function AuthPage() {
  const handleGoogleLogin = async () => {
    await supabase.auth.signInWithOAuth({ provider: "google" });
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <h1>로그인</h1>
      <button
        onClick={handleGoogleLogin}
        style={{
          padding: "12px 24px",
          fontSize: "16px",
          borderRadius: "8px",
          border: "none",
          background: "#4285F4",
          color: "white",
          cursor: "pointer",
          marginTop: "24px",
        }}
      >
        Google로 로그인
      </button>
    </div>
  );
}
