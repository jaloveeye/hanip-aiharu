"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AuthCallback() {
  const router = useRouter();

  useEffect(() => {
    // Supabase가 세션을 처리할 시간을 주고, 홈 또는 원하는 경로로 이동
    const handleAuth = async () => {
      // 1초 대기 (세션 쿠키가 완전히 저장될 때까지)
      await new Promise((resolve) => setTimeout(resolve, 1000));
      router.replace("/");
    };
    handleAuth();
  }, [router]);

  return <div>로그인 처리 중...</div>;
}
