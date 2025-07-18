import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabaseServerClient";
import { cookies } from "next/headers";

interface StatusResponse {
  success: boolean;
  checked?: boolean;
  message?: string;
}

export async function GET(
  req: NextRequest
): Promise<NextResponse<StatusResponse>> {
  console.log("[API] /api/recommendation/status GET 진입");

  try {
    const { searchParams } = new URL(req.url);
    const analysis_id = searchParams.get("analysis_id");

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
      console.error("[API] /api/recommendation/status 인증 정보 추출 에러", e);
    }

    if (!user_id) {
      console.log("[API] /api/recommendation/status 인증 실패");
      return NextResponse.json(
        { success: false, message: "로그인이 필요합니다." },
        { status: 401 }
      );
    }

    // 추천 식단 체크 상태 조회 (checked 컬럼이 없으므로 임시로 false 반환)
    const { data, error } = await supabase
      .from("recommendations")
      .select("id")
      .eq("analysis_id", analysis_id)
      .eq("user_id", user_id)
      .maybeSingle();

    if (error) {
      console.error("[API] /api/recommendation/status DB 조회 오류", error);
      return NextResponse.json(
        { success: false, message: "체크 상태 조회에 실패했습니다." },
        { status: 500 }
      );
    }

    if (!data) {
      console.log("[API] /api/recommendation/status 추천 식단 없음", {
        analysis_id,
        user_id,
      });
      return NextResponse.json(
        { success: false, message: "해당 분석의 추천 식단이 없습니다." },
        { status: 404 }
      );
    }

    console.log("[API] /api/recommendation/status 성공", {
      analysis_id,
      checked: false, // 임시로 false 반환
    });

    return NextResponse.json({
      success: true,
      checked: false, // 임시로 false 반환
    });
  } catch (e) {
    console.error("[API] /api/recommendation/status 전체 에러", e);
    return NextResponse.json(
      { success: false, message: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
