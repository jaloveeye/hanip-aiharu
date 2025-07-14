"use client";
import { Button } from "@/components/ui/Button";
import useUser from "@/lib/useUser";

export default function UserStatus() {
  const { user, loading, logout } = useUser();

  if (loading) {
    return <span className="text-sm text-gray-400">로딩 중...</span>;
  }

  if (user) {
    return (
      <>
        <span className="text-sm text-gray-700 dark:text-gray-100">
          {user.user_metadata?.name || user.email} 님 환영합니다!
        </span>
        <Button variant="secondary" size="sm" className="ml-2" onClick={logout}>
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
