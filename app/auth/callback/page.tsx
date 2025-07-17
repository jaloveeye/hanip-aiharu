"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Loading from "@/components/ui/Loading";

export default function AuthCallback() {
  const router = useRouter();

  useEffect(() => {
    const handleAuth = async () => {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      router.replace("/");
    };
    handleAuth();
  }, [router]);

  return <Loading message="로그인 처리 중..." />;
}
