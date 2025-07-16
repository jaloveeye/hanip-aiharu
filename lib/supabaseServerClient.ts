import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

// TODO: Supabase 빌드 경고(Critical dependency: the request of a dependency is an expression)는
// @supabase/realtime-js의 dynamic import 때문이며, 실제 서비스에는 영향이 없으나
// 공식문서(https://github.com/supabase/supabase-js/issues/619) 참고하여 추후 next-transpile-modules 등으로 해결 가능

// export const createSupabaseServerClient = (
//   cookieStore: Awaited<ReturnType<typeof cookies>>
// ) => {
//   const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
//   const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
//   if (!url || !key) {
//     throw new Error(
//       "[Supabase] 환경변수(NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY)가 누락되었습니다. .env 파일을 확인하세요."
//     );
//   }
//   return createServerClient(url, key, {
//     cookies: {
//       async getAll() {
//         const all = Object.keys(cookieStore).map((name) => ({
//           name,
//           value: cookieStore.get(name)?.value ?? "",
//         }));
//         return all;
//       },
//       setAll() {}, // noop
//     },
//   });
// };

export function createClient(cookieStore: Awaited<ReturnType<typeof cookies>>) {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
      },
    }
  );
}
