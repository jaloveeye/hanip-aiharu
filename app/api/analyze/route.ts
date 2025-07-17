import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabaseServerClient";
import type { SupabaseClient } from "@supabase/supabase-js";
import { getTodayString } from "@/lib/utils";
import OpenAI from "openai";

export type AnalyzeResponse =
  | { error: string }
  | { duplicate: true; message: string }
  | ({ duplicate: false } & {
      meal: string;
      result: string;
    });

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

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

// OpenAI Vision(이미지) → 식재료/섭취량 추출
async function callOpenAIVision(imageBase64: string): Promise<string> {
  const systemPrompt = "당신은 식사 영양사입니다.";
  const userPrompt = `다음 식단 사진을 분석해서 아래 기준에 따라 결과를 요약해줘. 설명, 표, 마크다운 등은 포함하지 마.\n\n1. 사진 속 식재료를 항목별로 정확히 추출해줘 (예: 밥, 계란프라이, 동그랑땡, 김치, 나물 등)\n2. 각 식재료의 대략적인 섭취량을 추정해줘 (예: 밥 반 공기, 계란 2개 등)\n식사는 7세 여아 기준입니다. 사진을 기반으로 최대한 정확하게 분석해주세요.`;
  console.log("[OpenAI Vision 호출 진입]", {
    systemPrompt,
    userPrompt,
    imageBase64Length: imageBase64.length,
  });
  try {
    const chat = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        {
          role: "user",
          content: [
            { type: "text", text: userPrompt },
            {
              type: "image_url",
              image_url: { url: `data:image/jpeg;base64,${imageBase64}` },
            },
          ],
        },
      ],
      temperature: 0.7,
    });
    console.log(
      "[OpenAI Vision 응답]",
      chat.choices[0].message.content?.trim()
    );
    return chat.choices[0].message.content?.trim() || "";
  } catch (e) {
    console.error("[OpenAI Vision 에러]", e);
    throw e;
  }
}

// OpenAI 텍스트 분석
async function callOpenAIText(meal: string): Promise<string> {
  const systemPrompt =
    "당신은 아동 식사 영양사입니다. 아래 식단이 초등학교 1학년(7세) 여아의 아침 식사로 적절한지 평가해주세요.";
  const userPrompt = `다음 기준에 따라 결과를 요약해줘. 설명, 표, 마크다운 등은 포함하지 마.\n\n1. 식단에 포함된 식재료와 음식명을 항목별로 정리해줘 (예: 밥, 계란프라이, 동그랑땡, 김치, 나물 등)\n2. 각 식재료의 대략적인 섭취량을 추정해줘 (예: 밥 반 공기, 계란 2개 등)\n3. 전체 식사의 열량(kcal), 주요 영양소(탄수화물, 단백질, 지방, 식이섬유, 칼슘, 철분, 비타민 A, C, D, 나트륨)를 요약표로 정리해줘\n4. 초등학교 1학년(7세) 기준 1일 권장 섭취량과 비교해서 %로 보여줘\n5. 부족한 영양소나 과잉된 항목이 있다면 따로 표시해줘\n6. 식단의 장점과 개선이 필요한 점을 요약해줘\n7. 내일 아침 추천 식단도 제안해줘 (부족했던 영양소를 보완할 수 있게)\n\n식사는 7세 여아 기준입니다. 반드시 위 기준을 모두 반영해서 분석해주세요.\n\n식단: ${meal}`;
  console.log("[OpenAI 텍스트 호출 진입]", { systemPrompt, userPrompt, meal });
  try {
    const chat = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.7,
    });
    console.log(
      "[OpenAI 텍스트 응답]",
      chat.choices[0].message.content?.trim()
    );
    return chat.choices[0].message.content?.trim() || "";
  } catch (e) {
    console.error("[OpenAI 텍스트 에러]", e);
    throw e;
  }
}

export async function POST(req: Request): Promise<Response> {
  console.log("[API] /api/analyze POST 진입");
  let body;
  try {
    body = await req.json();
  } catch (e) {
    console.error("[API] /api/analyze JSON 파싱 에러", e);
    return NextResponse.json({
      duplicate: false,
      meal: "",
      result:
        "요청 데이터가 올바른 JSON 형식이 아닙니다. (프론트엔드에서 JSON.stringify로 body를 보내야 합니다)",
    });
  }
  try {
    const { meal, imageBase64 } = body;
    console.log("[API] /api/analyze 요청 파라미터", {
      meal,
      imageBase64Length: imageBase64 ? imageBase64.length : 0,
    });

    // SSR용 Supabase 클라이언트로 인증 세션 기반 user_id, email 추출
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);
    let user_id: string | null = null;
    let email: string | null = null;
    try {
      const { data } = await supabase.auth.getUser();
      user_id = data.user?.id ?? null;
      email = data.user?.email ?? null;
    } catch (e) {
      console.error("[API] /api/analyze 인증 정보 추출 에러", e);
    }

    if (!user_id || !email) {
      console.log("[API] /api/analyze 인증 실패");
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
      meal,
      analyzed_at
    );
    if (selectError) {
      console.error("[API] /api/analyze DB 조회 오류", selectError);
      return NextResponse.json(
        { error: "DB 조회 오류" } satisfies AnalyzeResponse,
        { status: 500 }
      );
    }
    if (exists) {
      console.log("[API] /api/analyze 중복 분석 차단");
      return NextResponse.json({
        duplicate: true,
        message: "이미 분석된 식단입니다.",
      } satisfies AnalyzeResponse);
    }

    // OpenAI 호출
    let analysisText = "";
    if (imageBase64) {
      // 1. 사진에서 식재료/섭취량 추출
      const foodSummary = await callOpenAIVision(imageBase64);
      // 2. 추출된 식재료/섭취량을 텍스트로 넣어 OpenAI 텍스트 분석
      analysisText = await callOpenAIText(foodSummary);
    } else {
      // 텍스트 입력 → 바로 OpenAI 텍스트 분석
      analysisText = await callOpenAIText(meal);
    }
    console.log("[API] /api/analyze 최종 분석 결과", analysisText);

    // 분석 결과 DB 저장
    const { error: insertError } = await supabase
      .from("member_meal_analysis")
      .insert([
        {
          user_id,
          meal_text: meal,
          result: analysisText,
          analyzed_at,
          source_type: imageBase64 ? "image" : "text",
          email,
        },
      ]);
    if (insertError) {
      console.error("[API] /api/analyze DB 저장 오류", insertError);
      return NextResponse.json(
        { error: "DB 저장 오류" } satisfies AnalyzeResponse,
        { status: 500 }
      );
    }

    // 최종 응답: 전체 결과만 반환
    return NextResponse.json({
      duplicate: false,
      meal: meal,
      result: analysisText,
    });
  } catch (e) {
    console.error("[API] /api/analyze 전체 에러", e);
    return NextResponse.json({
      duplicate: false,
      meal: "",
      result: "식단 분석 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.",
    });
  }
}
