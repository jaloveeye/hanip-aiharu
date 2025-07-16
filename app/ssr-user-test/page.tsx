import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabaseServerClient";

export default async function SsrUserTestPage() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const { data, error } = await supabase.auth.getUser();

  if (error || !data?.user) {
    // 로그인 안 된 경우 로그인 페이지로 리다이렉트
    redirect("/auth");
  }

  return (
    <div style={{ padding: 32 }}>
      <h1>SSR User Test</h1>
      <pre>{JSON.stringify(data.user, null, 2)}</pre>
    </div>
  );
}
