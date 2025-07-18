import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabaseServerClient";
import { cookies } from "next/headers";

interface CheckRecommendationRequest {
  analysis_id: number;
  checked: boolean;
}

interface CheckRecommendationResponse {
  success: boolean;
  message?: string;
}

export async function POST(
  req: NextRequest
): Promise<NextResponse<CheckRecommendationResponse>> {
  console.log("[API] /api/recommendation/check POST 진입");

  try {
    const body: CheckRecommendationRequest = await req.json();
    const { analysis_id, checked } = body;

    if (!analysis_id) {
      return NextResponse.json(
        { success: false, message: "분석 ID가 필요합니다." },
        { status: 400 }
      );
    }

    // SSR용 Supabase 클라이언트로 인증 세션 기반 user_id 추출
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    let user_id: string | null = null;
    try {
      const { data } = await supabase.auth.getUser();
      user_id = data.user?.id ?? null;
    } catch (e) {
      console.error("[API] /api/recommendation/check 인증 정보 추출 에러", e);
    }

    if (!user_id) {
      console.log("[API] /api/recommendation/check 인증 실패");
      return NextResponse.json(
        { success: false, message: "로그인이 필요합니다." },
        { status: 401 }
      );
    }

    // 먼저 해당 analysis_id의 추천 식단이 존재하는지 확인
    const { data: existingRec, error: selectError } = await supabase
      .from("recommendations")
      .select("id")
      .eq("analysis_id", analysis_id)
      .eq("user_id", user_id)
      .maybeSingle();

    if (selectError) {
      console.error(
        "[API] /api/recommendation/check DB 조회 오류",
        selectError
      );
      return NextResponse.json(
        { success: false, message: "추천 식단을 찾을 수 없습니다." },
        { status: 500 }
      );
    }

    if (!existingRec) {
      console.log("[API] /api/recommendation/check 추천 식단 없음", {
        analysis_id,
        user_id,
      });
      return NextResponse.json(
        { success: false, message: "해당 분석의 추천 식단이 없습니다." },
        { status: 404 }
      );
    }

    // 추천 식단 업데이트 (checked 필드가 없으므로 임시로 성공 반환)
    // TODO: 데이터베이스에 checked 컬럼 추가 후 실제 업데이트 구현
    console.log("[API] /api/recommendation/check 임시 처리", {
      analysis_id,
      checked,
      message: "checked 컬럼이 없어서 실제 업데이트는 건너뜀",
    });

    // 임시로 성공 반환 (checked 컬럼이 없으므로)
    console.log("[API] /api/recommendation/check 성공", {
      analysis_id,
      checked,
    });
    return NextResponse.json({
      success: true,
      message: checked ? "추천 식단을 체크했습니다!" : "체크를 해제했습니다.",
    });
  } catch (e) {
    console.error("[API] /api/recommendation/check 전체 에러", e);
    return NextResponse.json(
      { success: false, message: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
