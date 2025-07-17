"use client";

import useUser from "@/lib/useUser";
import { useEffect, useState } from "react";
import { createBrowserClient } from "@supabase/ssr";
import Loading from "@/components/ui/Loading";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey);

interface AnalysisResult {
  meal_text: string;
  result: string;
  analyzed_at: string;
  source_type: string;
}

// 7세 아동(여아) 1일 권장 영양소 섭취량 (단위: 표기)
const RECOMMENDED: Record<string, number> = {
  열량: 1700, // kcal
  단백질: 37.5, // g (35~40 평균)
  지방: 50, // g
  탄수화물: 120, // g
  식이섬유: 10, // g
  칼슘: 500, // mg
  철분: 7.5, // mg (7~8 평균)
  "비타민 A": 500, // ㎍RE
  "비타민 C": 40, // mg
  "비타민 D": 5, // ㎍
  나트륨: 1400, // mg 이하
};

export default function MealDashboardPage() {
  const { user, loading } = useUser();
  const [results, setResults] = useState<AnalysisResult[]>([]);
  const [fetching, setFetching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    setFetching(true);
    setError(null);
    (async () => {
      const since = new Date();
      since.setDate(since.getDate() - 6); // 최근 7일(오늘 포함)
      const sinceStr = since.toISOString().slice(0, 10);
      const { data, error } = await supabase
        .from("member_meal_analysis")
        .select("meal_text, result, analyzed_at, source_type")
        .eq("user_id", user.id)
        .gte("analyzed_at", sinceStr)
        .order("analyzed_at", { ascending: false });
      if (error) {
        setError("분석 결과를 불러오는 데 실패했습니다.");
      } else if (data) {
        setResults(data as AnalysisResult[]);
      }
      setFetching(false);
    })();
  }, [user]);

  // 간단 파싱: result에서 영양소 요약표(3번)와 부족/과잉(5번) 추출
  function parseNutrition(result: string) {
    // 3. 전체 식사의 열량과 주요 영양소 요약표
    const nutrition: { label: string; value: string }[] = [];
    const match = result.match(
      /3[.\)]?\s*전체 식사의 열량[^\n]*\n([\s\S]+?)\n\s*4[.\)]/
    );
    if (match) {
      const lines = match[1].split("\n");
      for (const line of lines) {
        const m = line.match(/-\s*([^:]+):\s*([^\n]+)/);
        if (m) nutrition.push({ label: m[1].trim(), value: m[2].trim() });
      }
    }
    // 5. 부족/과잉 영양소
    let lack = "",
      excess = "";
    // 5. 부족한 영양소 및 과잉 항목 블록 파싱
    const block5 = result.match(
      /5[.\)]?\s*부족한 영양소 및 과잉 항목:([\s\S]+?)(\n\s*6[.\)]|$)/
    );
    if (block5) {
      const block = block5[1];
      const lackMatch = block.match(/-\s*부족[:：]?\s*([^\n]+)/);
      if (lackMatch) lack = lackMatch[1].trim();
      const excessMatch = block.match(/-\s*과잉[:：]?\s*([^\n]+)/);
      if (excessMatch) excess = excessMatch[1].trim();
    } else {
      const lackMatch = result.match(/부족한 영양소[:：]?\s*([^\n]+)/);
      if (lackMatch) lack = lackMatch[1].trim();
      const excessMatch = result.match(/과잉된 항목[:：]?\s*([^\n]+)/);
      if (excessMatch) excess = excessMatch[1].trim();
    }
    return { nutrition, lack, excess };
  }

  // 영양소별 실제 섭취량 파싱 (숫자만 추출)
  function parseActualNutrition(result: string) {
    const actual: { [key: string]: number } = {};
    const match = result.match(
      /3[.\)]?\s*전체 식사의 열량[^\n]*\n([\s\S]+?)\n\s*4[.\)]/
    );
    if (match) {
      const lines = match[1].split("\n");
      for (const line of lines) {
        const m = line.match(
          /-\s*([^:]+):\s*약?\s*([\d\.]+)([a-zA-Zㄱ-ㅎ가-힣㎍RE]*)/
        );
        if (m) {
          const label = m[1].trim();
          const value = parseFloat(m[2]);
          actual[label] = value;
        }
      }
    }
    return actual;
  }

  if (loading || fetching)
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loading message="대시보드 데이터를 불러오는 중..." />
      </div>
    );

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 dark:from-gray-900 dark:via-black dark:to-gray-800">
      <div className="bg-white/90 dark:bg-gray-900/90 rounded-2xl shadow-xl p-8 w-full max-w-2xl flex flex-col items-center border border-gray-100 dark:border-gray-800">
        <h1 className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-4 text-center">
          최근 1주일 식단 대시보드
        </h1>
        <div className="text-xs text-gray-500 dark:text-gray-400 mb-4 text-center">
          권장량은 7세 아동(여아) <b>1일 기준</b>입니다.
        </div>
        {error && (
          <div className="text-red-500 dark:text-red-300 text-center mb-2">
            {error}
          </div>
        )}
        {results.length === 0 && (
          <div className="text-gray-500 dark:text-gray-400 text-center">
            최근 1주일간 분석된 식단이 없습니다.
          </div>
        )}
        {results.length > 0 && (
          <div className="w-full mt-2">
            {results.map((r, i) => {
              const parsed = parseNutrition(r.result);
              const actual = parseActualNutrition(r.result);
              return (
                <div
                  key={i}
                  className="mb-6 p-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800"
                >
                  <div className="flex flex-row justify-between items-center mb-2">
                    <div className="font-semibold text-blue-700 dark:text-blue-300">
                      {new Date(r.analyzed_at)
                        .toLocaleDateString("ko-KR", {
                          year: "numeric",
                          month: "2-digit",
                          day: "2-digit",
                        })
                        .replace(/\./g, ".")
                        .replace(/\s/g, "")}
                    </div>
                  </div>
                  {/* 분석된 식단 태그를 날짜 아래에, 단위 포함 */}
                  <div className="flex flex-wrap gap-1 mb-2">
                    {(() => {
                      // 식재료 파싱: 1. 떡: 약 7조각\n2. 소시지: 약 5개 ...
                      const mealText = r.meal_text.replace(
                        /^사진 속 식재료:\s*/,
                        ""
                      );
                      // 1. 떡: 약 7조각\n2. 소시지: 약 5개 ...
                      const items = mealText
                        .split(/\n|,|\s*\d+\.\s*/)
                        .map((s) => s.trim())
                        .filter(
                          (s) => s && s.length > 0 && s !== "사진 속 식재료"
                        );
                      return items.map((item, idx) => (
                        <span
                          key={idx}
                          className="bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200 text-xs px-2 py-0.5 rounded-full mr-1 mb-1"
                        >
                          {item}
                        </span>
                      ));
                    })()}
                  </div>
                  <div className="mb-2">
                    <div className="font-bold text-gray-700 dark:text-gray-200 mb-1">
                      주요 영양소 (권장량: 7세 아동(여아) 1일 기준)
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {Object.keys(RECOMMENDED).map((label, idx) => {
                        const actualValue = actual[label] ?? null;
                        const recommended = RECOMMENDED[label];
                        let percent =
                          actualValue && recommended
                            ? Math.round((actualValue / recommended) * 100)
                            : null;
                        if (label === "나트륨" && actualValue && recommended) {
                          percent = Math.round(
                            (actualValue / recommended) * 100
                          );
                        }
                        return (
                          <div
                            key={idx}
                            className="flex flex-col items-center w-28"
                          >
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              {label}
                            </div>
                            <div className="w-full h-3 bg-gray-200 dark:bg-gray-700 rounded">
                              <div
                                className={`h-3 rounded ${
                                  percent !== null && percent >= 100
                                    ? "bg-red-400"
                                    : "bg-blue-400"
                                }`}
                                style={{
                                  width:
                                    percent !== null
                                      ? Math.min(percent, 100) + "%"
                                      : "0%",
                                }}
                              />
                            </div>
                            <div className="text-xs text-gray-700 dark:text-gray-100">
                              {actualValue !== null
                                ? `${actualValue}${
                                    label === "열량"
                                      ? "kcal"
                                      : label === "비타민 A"
                                      ? "㎍RE"
                                      : label === "비타민 D"
                                      ? "㎍"
                                      : label === "칼슘" || label === "나트륨"
                                      ? "mg"
                                      : label === "비타민 C"
                                      ? "mg"
                                      : label === "철분"
                                      ? "mg"
                                      : label === "식이섬유"
                                      ? "g"
                                      : label === "단백질"
                                      ? "g"
                                      : label === "지방"
                                      ? "g"
                                      : label === "탄수화물"
                                      ? "g"
                                      : ""
                                  }`
                                : "-"}
                              <span className="ml-1 text-xs text-gray-400">
                                /{recommended}
                                {label === "열량"
                                  ? "kcal"
                                  : label === "비타민 A"
                                  ? "㎍RE"
                                  : label === "비타민 D"
                                  ? "㎍"
                                  : label === "칼슘" || label === "나트륨"
                                  ? "mg"
                                  : label === "비타민 C"
                                  ? "mg"
                                  : label === "철분"
                                  ? "mg"
                                  : label === "식이섬유"
                                  ? "g"
                                  : label === "단백질"
                                  ? "g"
                                  : label === "지방"
                                  ? "g"
                                  : label === "탄수화물"
                                  ? "g"
                                  : ""}
                              </span>
                              {percent !== null && (
                                <span className="ml-1 text-xs text-blue-500">
                                  ({percent}%)
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  <div className="mb-1 text-sm">
                    <span className="font-semibold text-red-500 dark:text-red-300">
                      부족한 영양소:
                    </span>{" "}
                    {parsed.lack || "없음"}
                  </div>
                  <div className="mb-1 text-sm">
                    <span className="font-semibold text-yellow-600 dark:text-yellow-300">
                      과잉된 영양소:
                    </span>{" "}
                    {parsed.excess || "없음"}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
