import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabaseServerClient";
import type { SupabaseClient } from "@supabase/supabase-js";
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
  const systemPrompt =
    "당신은 식사 영양사입니다. 정확하고 일관된 형식으로 응답해주세요.";
  const userPrompt = `다음 식단 사진을 분석해서 아래 형식에 정확히 맞춰서 응답해주세요.

응답 형식:
1. 식재료: [식재료1, 식재료2, 식재료3, ...]
2. 섭취량: [식재료1] [수량], [식재료2] [수량], [식재료3] [수량], ...

예시:
1. 식재료: 밥, 계란프라이, 동그랑땡, 김치, 나물
2. 섭취량: 밥 반 공기, 계란 2개, 동그랑땡 3개, 김치 반 그릇, 나물 반 그릇

식사는 7세 여아 기준입니다. 사진을 기반으로 최대한 정확하게 분석해주세요.`;
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
      temperature: 0.3,
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
    "당신은 아동 식사 영양사입니다. 정확하고 일관된 형식으로 응답해주세요.";
  const userPrompt = `다음 식단을 분석해서 아래 형식에 정확히 맞춰서 응답해주세요.

응답 형식:
1. 식재료: [식재료1, 식재료2, 식재료3, ...]
2. 섭취량: [식재료1] [수량], [식재료2] [수량], [식재료3] [수량], ...
3. 영양소 분석:
   - 열량: [숫자]kcal
   - 탄수화물: [숫자]g
   - 단백질: [숫자]g
   - 지방: [숫자]g
   - 식이섬유: [숫자]g
   - 칼슘: [숫자]mg
   - 철분: [숫자]mg
   - 비타민 A: [숫자]μg
   - 비타민 C: [숫자]mg
   - 비타민 D: [숫자]μg
   - 나트륨: [숫자]mg
4. 권장량 대비 (%):
   - 열량: [숫자]%
   - 탄수화물: [숫자]%
   - 단백질: [숫자]%
   - 지방: [숫자]%
   - 식이섬유: [숫자]%
   - 칼슘: [숫자]%
   - 철분: [숫자]%
   - 비타민 A: [숫자]%
   - 비타민 C: [숫자]%
   - 비타민 D: [숫자]%
   - 나트륨: [숫자]%
5. 부족한 영양소: [부족한 영양소명] (없으면 "없음")
6. 과잉된 영양소: [과잉된 영양소명] (없으면 "없음")
7. 추천 식단: [추천 음식1], [추천 음식2], [추천 음식3], ...

식사는 7세 여아 기준입니다. 반드시 위 형식을 정확히 지켜서 응답해주세요.

식단: ${meal}`;
  console.log("[OpenAI 텍스트 호출 진입]", { systemPrompt, userPrompt, meal });
  try {
    const chat = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.3,
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

// 서울(UTC+9) 기준 오늘 날짜 YYYY-MM-DD 반환
function getSeoulTodayString() {
  const now = new Date();
  // UTC+9로 변환
  const seoul = new Date(now.getTime() + 9 * 60 * 60 * 1000);
  return seoul.toISOString().slice(0, 10);
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

    // 서울 기준 오늘 날짜
    const analyzed_at = getSeoulTodayString();
    // 하루 n번 제한 (기본 1)
    const N = 1;
    const { count, error: countError } = await supabase
      .from("member_meal_analysis")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user_id)
      .eq("analyzed_at", analyzed_at);
    if (countError) {
      console.error("[API] /api/analyze DB count 오류", countError);
      return NextResponse.json(
        { error: "DB 조회 오류" } satisfies AnalyzeResponse,
        { status: 500 }
      );
    }
    if ((count ?? 0) >= N) {
      return NextResponse.json({
        duplicate: true,
        message: `오늘은 이미 ${N}번 분석하셨습니다. 내일 다시 시도해 주세요.`,
      } satisfies AnalyzeResponse);
    }

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
    let mealTextForInsert = meal;
    if (imageBase64) {
      // 1. 사진에서 식재료/섭취량 추출
      const foodSummary = await callOpenAIVision(imageBase64);
      // 2. 추출된 식재료/섭취량을 텍스트로 넣어 OpenAI 텍스트 분석
      analysisText = await callOpenAIText(foodSummary);
      mealTextForInsert = foodSummary;
    } else {
      // 텍스트 입력 → 바로 OpenAI 텍스트 분석
      analysisText = await callOpenAIText(meal);
    }
    console.log("[API] /api/analyze 최종 분석 결과", analysisText);

    // 분석 결과 DB 저장 (insert 후 id 반환)
    const { data: analysisInsertData, error: insertError } = await supabase
      .from("member_meal_analysis")
      .insert([
        {
          user_id,
          meal_text: mealTextForInsert,
          result: analysisText,
          analyzed_at,
          source_type: imageBase64 ? "image" : "text",
          email,
        },
      ])
      .select("id")
      .single();
    if (insertError) {
      console.error("[API] /api/analyze DB 저장 오류", insertError);
      return NextResponse.json(
        { error: "DB 저장 오류" } satisfies AnalyzeResponse,
        { status: 500 }
      );
    }
    const analysis_id = analysisInsertData?.id;

    // 추천 식단(ingredients) 추출 및 저장
    let ingredients = "";

    // 1. 새로운 형식: "7. 추천 식단: [달걀 요리], [시금치 무침], [오렌지 주스]"
    const newFormatMatch = analysisText.match(/7\.\s*추천 식단:\s*([^\n]+)/);
    if (newFormatMatch) {
      const items = newFormatMatch[1]
        .split(",")
        .map((item) => item.trim())
        .map((item) => item.replace(/^\[|\]$/g, "")) // 대괄호 제거
        .filter(Boolean);
      ingredients = items.join(",");
    } else {
      // 2. 기존 형식 처리 (호환성 유지)
      const recommendBlockMatch = analysisText.match(
        /(추천 식단|내일 아침 추천 식단)[^\n]*\n([\s\S]+)/
      );
      if (recommendBlockMatch) {
        const block = recommendBlockMatch[2];
        // 각 줄에서 '- ' 또는 '• '로 시작하는 항목만 추출
        const lines = block.split("\n");
        const items = lines
          .map((line) => line.trim())
          .filter((line) => line.startsWith("-") || line.startsWith("•"))
          .map((line) => line.replace(/^[-•]\s*/, "").replace(/^[-•]/, ""))
          .filter(Boolean);
        ingredients = items.join(",");
      }
    }

    if (ingredients && analysis_id) {
      const { error: recError } = await supabase
        .from("recommendations")
        .insert([
          {
            user_id,
            analysis_id,
            date: analyzed_at,
            ingredients,
            content: ingredients, // content에도 값 저장
          },
        ]);
      if (recError) {
        console.error("[API] /api/analyze 추천식단 저장 오류", recError);
      } else {
        console.log("[API] /api/analyze 추천식단 저장 성공", { ingredients });
      }
    } else {
      console.log("[API] /api/analyze 추천식단 없음", {
        ingredients,
        analysis_id,
      });
    }

    // 새로운 분석 시 이전 추천 식단 자동 체크 (checked 컬럼이 없으므로 임시로 비활성화)
    // TODO: 데이터베이스에 checked 컬럼 추가 후 자동 체크 기능 활성화
    console.log(
      "[API] /api/analyze 자동 체크 기능 임시 비활성화 (checked 컬럼 없음)"
    );

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
