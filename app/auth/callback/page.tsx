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
          setMessage("로그인 성공! 잠시 후 식단 분석 페이지로 이동합니다.");

          // 즉시 meal 페이지로 리다이렉트 (로딩 화면 없이)
          router.push("/meal");
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-green-50 dark:from-gray-900 dark:via-black dark:to-gray-800">
      <div className="bg-white/90 dark:bg-gray-900/90 rounded-2xl shadow-xl p-8 w-full max-w-md flex flex-col items-center border border-gray-100 dark:border-gray-800">
        {status === "loading" && (
          <>
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-lg text-neutral-700 dark:text-neutral-300">
              잠시만요...
            </p>
          </>
        )}

        {status === "success" && (
          <>
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-6">
                <div className="text-green-600 dark:text-green-400 text-3xl font-bold">
                  ✓
                </div>
              </div>
              <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-3 text-center">
                로그인 성공!
              </h2>
              <p className="text-base text-gray-600 dark:text-gray-300 text-center leading-relaxed">
                잠시 후 식단 분석 페이지로 이동합니다.
              </p>
            </div>
          </>
        )}

        {status === "error" && (
          <>
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mb-6">
                <div className="text-red-600 dark:text-red-400 text-3xl font-bold">
                  ✗
                </div>
              </div>
              <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-3 text-center">
                로그인 실패
              </h2>
              <p className="text-base text-gray-600 dark:text-gray-300 text-center leading-relaxed mb-6">
                {message}
              </p>
              <button
                onClick={() => (window.location.href = "/meal")}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200 font-medium shadow-lg hover:shadow-xl"
              >
                식단 분석 페이지로 이동
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
