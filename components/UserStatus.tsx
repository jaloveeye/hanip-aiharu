"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import type { User } from "@supabase/supabase-js";
import { Button } from "@/components/ui/Button";

export default function UserStatus() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data.user);
    };
    getUser();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  if (user) {
    return (
      <>
        <span className="text-sm text-gray-700 dark:text-gray-100">
          {user.user_metadata?.name || user.email} 님 환영합니다!
        </span>
        <Button
          variant="secondary"
          size="sm"
          className="ml-2"
          onClick={handleLogout}
        >
          로그아웃
        </Button>
      </>
    );
  }

  return (
    <>
      <span className="text-sm text-gray-400">로그인되지 않음</span>
      <Button
        variant="primary"
        size="sm"
        className="ml-2"
        onClick={() => (window.location.href = "/auth")}
      >
        로그인
      </Button>
    </>
  );
}
