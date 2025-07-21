"use client";

import useUser from "@/lib/useUser";
import { useEffect, useState } from "react";
import { createBrowserClient } from "@supabase/ssr";
import Loading from "@/components/ui/Loading";
import {
  parseActualNutrition,
  parseLackExcess,
} from "@/lib/utils/analysisParser";

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
              const parsed = parseLackExcess(r.result);
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
                      // 새로운 형식: "2. 섭취량: 바나나 1개, 당근 몇 조각, 우유 한 잔, 견과류 믹스 한 줌"
                      const resultText = r.result;
                      const mealText = r.meal_text;

                      // 1. result에서 새로운 형식의 섭취량 추출
                      const newFormatMatch = resultText.match(
                        /2\.\s*섭취량:\s*([^\n]+)/
                      );
                      if (newFormatMatch) {
                        const quantities = newFormatMatch[1]
                          .split(",")
                          .map((item) => item.trim())
                          .filter(Boolean);

                        return quantities.map((item, idx) => (
                          <span
                            key={idx}
                            className="bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200 text-xs px-2 py-0.5 rounded-full mr-1 mb-1"
                          >
                            {item}
                          </span>
                        ));
                      }

                      // 2. meal_text에서 새로운 형식의 섭취량 추출
                      const mealTextMatch = mealText.match(
                        /2\.\s*섭취량:\s*([^\n]+)/
                      );
                      if (mealTextMatch) {
                        const quantities = mealTextMatch[1]
                          .split(",")
                          .map((item) => item.trim())
                          .filter(Boolean);

                        return quantities.map((item, idx) => (
                          <span
                            key={idx}
                            className="bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200 text-xs px-2 py-0.5 rounded-full mr-1 mb-1"
                          >
                            {item}
                          </span>
                        ));
                      }

                      // 3. 기존 형식 처리 (호환성 유지)
                      if (mealText.includes("섭취량:")) {
                        const quantitiesMatch = mealText.match(
                          /2\.\s*섭취량:\s*\n([\s\S]+?)(?=\n\n|$)/
                        );
                        if (quantitiesMatch) {
                          const quantities = quantitiesMatch[1]
                            .split("\n")
                            .map((line) => line.trim())
                            .filter(
                              (line) =>
                                line.startsWith("-") || line.startsWith("•")
                            )
                            .map((line) => line.replace(/^[-•]\s*/, ""))
                            .filter(Boolean);

                          return quantities.map((item, idx) => (
                            <span
                              key={idx}
                              className="bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200 text-xs px-2 py-0.5 rounded-full mr-1 mb-1"
                            >
                              {item}
                            </span>
                          ));
                        }
                      }

                      // 4. "사진 속 식재료:" 형태 처리
                      if (mealText.includes("사진 속 식재료:")) {
                        const items = mealText
                          .replace(/^사진 속 식재료:\s*\n/, "")
                          .split(/\n/)
                          .map((line) => line.trim())
                          .filter((line) => line.match(/^\d+\.\s+/))
                          .map((line) => {
                            const match = line.match(
                              /^\d+\.\s+([^:]+):\s*(.+)$/
                            );
                            return match
                              ? `${match[1].trim()}: ${match[2].trim()}`
                              : line.replace(/^\d+\.\s+/, "");
                          })
                          .filter(Boolean);

                        return items.map((item, idx) => (
                          <span
                            key={idx}
                            className="bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200 text-xs px-2 py-0.5 rounded-full mr-1 mb-1"
                          >
                            {item}
                          </span>
                        ));
                      }

                      // 5. 기존 result에서 섭취량 정보 추출
                      const quantitiesMatch = resultText.match(
                        /2\.\s*섭취량:\s*\n([\s\S]+?)\n\s*3\.\s*전체/
                      );
                      if (quantitiesMatch) {
                        const quantities = quantitiesMatch[1]
                          .split("\n")
                          .map((line) => line.trim())
                          .filter(
                            (line) =>
                              line.startsWith("-") || line.startsWith("•")
                          )
                          .map((line) => line.replace(/^[-•]\s*/, ""))
                          .filter(Boolean);

                        return quantities.map((item, idx) => (
                          <span
                            key={idx}
                            className="bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200 text-xs px-2 py-0.5 rounded-full mr-1 mb-1"
                          >
                            {item}
                          </span>
                        ));
                      }

                      return null;
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

                        // 부족/과잉 영양소 정보 활용
                        const { lack, excess } = parseLackExcess(r.result);
                        const lackList = lack
                          .split(",")
                          .map((s) => s.trim())
                          .filter(Boolean);
                        const excessList = excess
                          .split(",")
                          .map((s) => s.trim())
                          .filter(Boolean);

                        // 색상 결정 - 타이틀 색상과 매칭
                        let barColor = "bg-blue-400";
                        if (lackList.includes(label)) barColor = "bg-red-400"; // 부족한 영양소: 빨간색 (타이틀과 동일)
                        if (excessList.includes(label))
                          barColor = "bg-yellow-400"; // 과잉된 영양소: 노란색 (타이틀과 동일)

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
                                className={`h-3 rounded ${barColor}`}
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
