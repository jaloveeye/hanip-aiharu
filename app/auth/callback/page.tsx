"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AuthCallback() {
  const router = useRouter();

  useEffect(() => {
    // Supabase가 세션을 처리할 시간을 주고, 홈 또는 원하는 경로로 이동
    const handleAuth = async () => {
      // 필요시 추가 처리(예: 유저 정보 fetch)
      router.replace("/");
    };
    handleAuth();
  }, [router]);

  return <div>로그인 처리 중...</div>;
}
