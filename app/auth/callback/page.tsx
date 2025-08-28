"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function AuthCallbackPage() {
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading"
  );
  const [message, setMessage] = useState("");
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // OAuth callback 처리
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();

        if (error) {
          setStatus("error");
          setMessage("인증 처리 중 오류가 발생했습니다.");
          return;
        }

        if (session) {
          setStatus("success");
          setMessage("로그인 성공! 잠시 후 메인 페이지로 이동합니다.");

          // 1.5초 후 메인 페이지로 리다이렉트
          setTimeout(() => {
            router.push("/");
          }, 1500);
        } else {
          setStatus("error");
          setMessage("로그인 세션을 찾을 수 없습니다.");
        }
      } catch {
        setStatus("error");
        setMessage("예상치 못한 오류가 발생했습니다.");
      }
    };

    handleAuthCallback();
  }, [supabase.auth, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-neutral-50 via-blue-50 to-indigo-50">
      <div className="text-center">
        {status === "loading" && (
          <>
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-lg text-neutral-700">로그인 처리 중...</p>
          </>
        )}

        {status === "success" && (
          <>
            <div className="text-green-500 text-4xl mb-4">✓</div>
            <p className="text-lg text-neutral-700">{message}</p>
          </>
        )}

        {status === "error" && (
          <>
            <div className="text-red-500 text-4xl mb-4">✗</div>
            <p className="text-lg text-neutral-700">{message}</p>
            <button
              onClick={() => (window.location.href = "/")}
              className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              메인 페이지로 이동
            </button>
          </>
        )}
      </div>
    </div>
  );
}
