"use client";

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Button } from "@/components/ui/Button";
import { useRouter } from "next/navigation";
import type { User } from '@supabase/supabase-js';

function ChartIllustration() {
  return (
    <svg width="120" height="120" viewBox="0 0 120 120" className="mb-4">
      <circle cx="60" cy="60" r="54" fill="#f3f4f6" />
      <path
        d="M60 6 a54 54 0 0 1 46.8 27"
        fill="none"
        stroke="#60a5fa"
        strokeWidth="12"
      />
      <path
        d="M106.8 33 a54 54 0 0 1 -21.6 73.8"
        fill="none"
        stroke="#34d399"
        strokeWidth="12"
      />
      <path
        d="M85.2 106.8 a54 54 0 1 1 -54-93.6"
        fill="none"
        stroke="#fbbf24"
        strokeWidth="12"
      />
      <circle cx="60" cy="60" r="36" fill="#fff" />
      <text
        x="60"
        y="66"
        textAnchor="middle"
        fontSize="18"
        fill="#374151"
        fontWeight="bold"
      >
        AI
      </text>
    </svg>
  );
}

export default function Home() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const getUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        setUser(user);
      } catch (error) {
        console.error('Error fetching user:', error);
      } finally {
        setLoading(false);
      }
    };

    getUser();

    // Auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null);
      }
    );

    return () => subscription.unsubscribe();
  }, [supabase.auth]);

  const handleStartAnalysis = () => {
    if (user) {
      router.push('/meal');
    } else {
      router.push('/auth');
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-green-50 dark:from-gray-900 dark:via-black dark:to-gray-800">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-lg text-neutral-700">로딩 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-green-50 dark:from-gray-900 dark:via-black dark:to-gray-800">
      <div className="bg-white/90 dark:bg-gray-900/90 rounded-2xl shadow-xl p-8 w-full max-w-md flex flex-col items-center border border-gray-100 dark:border-gray-800">
        <ChartIllustration />
        
        {user ? (
          // 로그인된 사용자용 콘텐츠
          <>
            <h1 className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-2 text-center">
              안녕하세요, {user.user_metadata?.full_name || user.email}님!
            </h1>
            <p className="text-gray-600 dark:text-gray-300 text-center mb-6">
              오늘도 자녀의 건강한 아침 식단을 관리해보세요.
              <br />
              AI가 영양소를 분석하고 맞춤형 추천을 제공합니다.
            </p>
            <Button
              type="button"
              variant="primary"
              size="md"
              className="w-full flex items-center justify-center gap-2 bg-[#4285F4] hover:bg-[#357ae8] dark:bg-[#4285F4] dark:hover:bg-[#357ae8] text-white font-semibold text-base py-2 rounded-lg shadow"
              onClick={handleStartAnalysis}
            >
              AI 식단 분석 시작하기
            </Button>
          </>
        ) : (
          // 비로그인 사용자용 콘텐츠
          <>
            <h1 className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-2 text-center">
              아빠를 위한 아침 식단 분석 서비스
            </h1>
            <p className="text-gray-600 dark:text-gray-300 text-center mb-6">
              초보 아빠도 쉽게 자녀의 식단을 기록하고, AI로 영양소를 분석해
              부족/과잉 영양소와 추천 식단을 한눈에 확인하세요.
              <br />
              성장 그래프, 맞춤 안내, 커뮤니티 등 다양한 기능이 준비되어 있습니다.
            </p>
            <Button
              type="button"
              variant="primary"
              size="md"
              className="w-full flex items-center justify-center gap-2 bg-[#4285F4] hover:bg-[#357ae8] dark:bg-[#4285F4] dark:hover:bg-[#357ae8] text-white font-semibold text-base py-2 rounded-lg shadow"
              onClick={handleStartAnalysis}
            >
              지금 시작하기
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
