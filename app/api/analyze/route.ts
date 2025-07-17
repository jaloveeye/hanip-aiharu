import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabaseServerClient";
import type { SupabaseClient } from "@supabase/supabase-js";
import { getTodayString } from "@/lib/utils";

// API 응답 타입 정의
export type AnalyzeResponse =
  | { error: string }
  | { duplicate: true; message: string }
  | ({ duplicate: false } & {
      meal: string;
      nutrition: {
        label: string;
        value: number;
        unit?: string;
        color?: string;
      }[];
      lack: string[];
      recommend: string[];
    });

// 중복 체크 함수
async function checkDuplicate(
  supabase: SupabaseClient,
  user_id: string,
  meal: string,
  analyzed_at: string
) {
  const { data, error } = await supabase
    .from("member_meal_analysis")
    .select("id")
    .eq("user_id", user_id)
    .eq("meal_text", meal)
    .eq("analyzed_at", analyzed_at)
    .maybeSingle();
  return { exists: !!data, error };
}

// insert 함수
async function insertMealAnalysis(
  supabase: SupabaseClient,
  {
    user_id,
    email,
    meal,
    result,
    analyzed_at,
  }: {
    user_id: string;
    email: string;
    meal: string;
    result: string;
    analyzed_at: string;
  }
) {
  return await supabase.from("member_meal_analysis").insert([
    {
      user_id,
      email,
      meal_text: meal,
      result,
      source_type: "text",
      analyzed_at,
    },
  ]);
}

export async function POST(): Promise<Response> {
  // 더미 데이터
  const dummy = {
    meal: "시리얼, 견관류 1봉, 포도 10알",
    nutrition: [
      { label: "탄수화물", value: 60, unit: "%" },
      { label: "단백질", value: 20, unit: "%" },
      { label: "지방", value: 15, unit: "%" },
      { label: "섬유질", value: 5, unit: "%" },
    ],
    lack: ["단백질", "섬유질"],
    recommend: ["달걀", "두부", "채소"],
  };

  // SSR용 Supabase 클라이언트로 인증 세션 기반 user_id, email 추출
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  let user_id: string | null = null;
  let email: string | null = null;
  try {
    const { data } = await supabase.auth.getUser();
    user_id = data.user?.id ?? null;
    email = data.user?.email ?? null;
  } catch {
    // 인증 예외 처리
  }

  if (!user_id || !email) {
    return NextResponse.json(
      { error: "로그인이 필요합니다." } satisfies AnalyzeResponse,
      { status: 401 }
    );
  }

  const analyzed_at = getTodayString();
  // 중복 체크
  const { exists, error: selectError } = await checkDuplicate(
    supabase,
    user_id,
    dummy.meal,
    analyzed_at
  );
  if (selectError) {
    return NextResponse.json(
      { error: "DB 조회 오류" } satisfies AnalyzeResponse,
      { status: 500 }
    );
  }
  if (exists) {
    return NextResponse.json({
      duplicate: true,
      message: "이미 분석된 식단입니다.",
    } satisfies AnalyzeResponse);
  }

  // insert
  const { error } = await insertMealAnalysis(supabase, {
    user_id,
    email,
    meal: dummy.meal,
    result: JSON.stringify(dummy),
    analyzed_at,
  });
  if (error) {
    return NextResponse.json(
      { error: "DB 저장 오류" } satisfies AnalyzeResponse,
      { status: 500 }
    );
  }

  return NextResponse.json({
    duplicate: false,
    ...dummy,
  } satisfies AnalyzeResponse);
}
