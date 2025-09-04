"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import Loading from "@/components/ui/Loading";

const supabase = createClient();

export default function AuthPage() {
  const [loading, setLoading] = useState(false);

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: { access_type: "offline", prompt: "consent" },
        },
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-green-50 dark:from-gray-900 dark:via-black dark:to-gray-800">
      {loading && (
        <div className="fixed inset-0 bg-black/40 flex flex-col items-center justify-center z-50">
          <Loading message="잠시만요..." />
        </div>
      )}
      <div className="bg-white/90 dark:bg-gray-900/90 rounded-2xl shadow-xl p-8 w-full max-w-md flex flex-col items-center border border-gray-100 dark:border-gray-800">
        {/* 로고/앱명 */}
        <div className="mb-6 flex flex-col items-center">
          <span className="text-base font-semibold text-gray-400 dark:text-gray-500 mb-1 tracking-widest">
            아이하루
          </span>
          <span className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">
            한입
          </span>
          <span className="text-sm text-gray-500 dark:text-gray-300 text-center">
            아침 식단을 쉽고 똑똑하게 관리하세요
          </span>
        </div>
        {/* 구분선 */}
        <div className="w-full h-px bg-gray-200 dark:bg-gray-700 my-6" />
        {/* 구글 로그인 버튼 */}
        <Button
          type="button"
          variant="primary"
          size="md"
          className="w-full flex items-center justify-center gap-2 bg-[#4285F4] hover:bg-[#357ae8] dark:bg-[#4285F4] dark:hover:bg-[#357ae8] text-white font-semibold text-base py-3 rounded-lg shadow-lg transition-all duration-200 hover:shadow-xl"
          onClick={handleGoogleLogin}
          disabled={loading}
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 48 48"
            className="mr-2"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <g clipPath="url(#clip0_17_40)">
              <path
                d="M44.5 20H24V28.5H36.9C35.5 33.1 31.2 36.5 24 36.5C16.5 36.5 10.5 30.5 10.5 23C10.5 15.5 16.5 9.5 24 9.5C27.2 9.5 29.9 10.6 32 12.5L37.6 7C34.1 3.8 29.4 2 24 2C12.9 2 4 10.9 4 23C4 35.1 12.9 44 24 44C34.6 44 43.5 35.5 43.5 23C43.5 21.7 43.4 20.8 43.2 20H44.5Z"
                fill="#FFC107"
              />
              <path
                d="M6.3 14.7L12.5 19.2C14.2 15.2 18.7 12 24 12C27.2 12 29.9 13.1 32 15L37.6 9.5C34.1 6.3 29.4 4.5 24 4.5C16.5 4.5 10.5 10.5 10.5 18C10.5 19.2 10.7 20.3 11 21.3L6.3 14.7Z"
                fill="#FF3D00"
              />
              <path
                d="M24 44C31.2 44 36.5 40.6 36.9 36.5L29.2 30.5C27.5 31.5 25.5 32 24 32C18.7 32 14.2 28.8 12.5 24.8L6.3 29.3C10.7 36.1 16.5 44 24 44Z"
                fill="#4CAF50"
              />
              <path
                d="M44.5 20H43.2V20H24V28.5H36.9C36.3 30.5 35.1 32.2 33.3 33.3C33.3 33.3 33.3 33.3 33.3 33.3L40.1 38.7C43.1 35.9 44.5 31.7 44.5 27.5C44.5 25.7 44.5 23.9 44.5 20Z"
                fill="#1976D2"
              />
            </g>
            <defs>
              <clipPath id="clip0_17_40">
                <rect
                  width="40.5"
                  height="40.5"
                  fill="white"
                  transform="translate(4 2)"
                />
              </clipPath>
            </defs>
          </svg>
          Google로 로그인
        </Button>
      </div>
    </div>
  );
}
