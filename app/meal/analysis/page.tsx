"use client";

import useUser from "@/lib/useUser";
import { useEffect, useState, useRef, useCallback } from "react";
import { createBrowserClient } from "@supabase/ssr";
import Loading from "@/components/ui/Loading";
import {
  parseActualNutrition,
  parseRecommend,
} from "@/lib/utils/analysisParser";
import FAQ from "@/components/ui/FAQ";
import AlternativeFoods from "@/components/ui/AlternativeFoods";
import NutritionModal from "@/components/ui/NutritionModal";
import RecommendationCheck from "@/components/ui/RecommendationCheck";
import {
  getNutritionTooltip,
  getAlternativeFoods,
  FAQ_ITEMS,
  DAD_GUIDE_MESSAGES,
} from "@/lib/utils/dadGuide";
import { useRouter } from "next/navigation";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey);

interface AnalysisResult {
  id: number;
  meal_text: string;
  result: string;
  analyzed_at: string;
  source_type: string;
}

const PAGE_SIZE = 5;

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

export default function MealAnalysisPage() {
  const { user, loading } = useUser();
  const router = useRouter();
  const [results, setResults] = useState<AnalysisResult[]>([]);
  const [fetching, setFetching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0);
  const loader = useRef<HTMLDivElement | null>(null);
  const [openIndexes, setOpenIndexes] = useState<Set<number>>(new Set());
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    nutrient: string;
    content: string;
  }>({
    isOpen: false,
    nutrient: "",
    content: "",
  });

  // 최초/페이지 변경 시 데이터 fetch
  useEffect(() => {
    if (!user) return;
    setFetching(true);
    setError(null);
    (async () => {
      const { data, error } = await supabase
        .from("member_meal_analysis")
        .select("id, meal_text, result, analyzed_at, source_type")
        .eq("user_id", user.id)
        .order("analyzed_at", { ascending: false })
        .range(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE - 1);
      if (error) {
        setError("분석 결과를 불러오는 데 실패했습니다.");
      } else if (data) {
        if (page === 0) {
          setResults(data as AnalysisResult[]);
        } else {
          setResults((prev) => [...prev, ...(data as AnalysisResult[])]);
        }
        if (data.length < PAGE_SIZE) setHasMore(false);
      }
      setFetching(false);
    })();
  }, [user, page]);

  // 인피니티 스크롤 IntersectionObserver
  const handleObserver = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const target = entries[0];
      if (target.isIntersecting && hasMore && !fetching) {
        setPage((prev) => prev + 1);
      }
    },
    [hasMore, fetching]
  );

  useEffect(() => {
    const option = { root: null, rootMargin: "20px", threshold: 1.0 };
    const observer = new window.IntersectionObserver(handleObserver, option);
    const currentLoader = loader.current;
    if (currentLoader) observer.observe(currentLoader);
    return () => {
      if (currentLoader) observer.unobserve(currentLoader);
    };
  }, [handleObserver]);

  if (loading && results.length === 0)
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loading message="분석 결과를 불러오는 중..." />
      </div>
    );

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 dark:from-gray-900 dark:via-black dark:to-gray-800">
      <div className="bg-white/90 dark:bg-gray-900/90 rounded-2xl shadow-xl p-8 w-full max-w-2xl flex flex-col items-center border border-gray-100 dark:border-gray-800">
        {/* 상단 네비게이션 버튼 */}
        <div className="w-full mb-4 flex justify-between items-center">
          <button
            onClick={() => router.push("/meal")}
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded-lg shadow transition-colors"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
              />
            </svg>
            새 식단 분석
          </button>
        </div>

        {/* 아빠를 위한 친절한 안내 메시지 */}
        <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800 w-full">
          <p className="text-sm text-blue-800 dark:text-blue-200 text-center">
            {DAD_GUIDE_MESSAGES.encouragement}
          </p>
          <p className="text-xs text-blue-600 dark:text-blue-300 text-center mt-2">
            💡 새로운 식단을 분석하면 이전 추천 식단이 자동으로 체크됩니다!
          </p>
        </div>

        <h1 className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-4 text-center">
          식단 분석 결과
        </h1>
        {error && (
          <div className="text-red-500 dark:text-red-300 text-center mb-2">
            {error}
          </div>
        )}
        {results.length === 0 && !fetching && (
          <div className="flex flex-col items-center gap-4 mt-4">
            <div className="text-gray-500 dark:text-gray-400 text-center">
              식단 분석 결과가 없습니다. 식단을 분석하세요.
            </div>
            <a
              href="/meal"
              className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded shadow transition"
            >
              식단 분석하러 가기
            </a>
          </div>
        )}
        {results.length > 0 && (
          <div className="w-full mt-2">
            {results.map((result, i) => (
              <div key={i} className="mb-10">
                {/* 1. 날짜 + 입력 식단 */}
                <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-4 mb-4 flex flex-col gap-2">
                  <div className="font-semibold text-blue-700 dark:text-blue-300">
                    {new Date(result.analyzed_at)
                      .toLocaleDateString("ko-KR", {
                        year: "numeric",
                        month: "2-digit",
                        day: "2-digit",
                      })
                      .replace(/\./g, ".")
                      .replace(/\s/g, "")}
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {(() => {
                      // 새로운 형식: "2. 섭취량: 바나나 1개, 당근 몇 조각, 우유 한 잔, 견과류 믹스 한 줌"
                      const resultText = result.result;
                      const mealText = result.meal_text;

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
                            className="bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-100 text-xs px-2 py-0.5 rounded-full mr-1 mb-1"
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
                            className="bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-100 text-xs px-2 py-0.5 rounded-full mr-1 mb-1"
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
                              className="bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-100 text-xs px-2 py-0.5 rounded-full mr-1 mb-1"
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
                            className="bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-100 text-xs px-2 py-0.5 rounded-full mr-1 mb-1"
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
                            className="bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-100 text-xs px-2 py-0.5 rounded-full mr-1 mb-1"
                          >
                            {item}
                          </span>
                        ));
                      }

                      return null;
                    })()}
                  </div>
                </div>
                {/* 2. 주요 영양소 */}
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg shadow p-4 mb-4">
                  <div className="font-bold text-gray-700 dark:text-gray-200 mb-1">
                    주요 영양소 (권장량: 7세 아동(여아) 1일 기준)
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {(() => {
                      const actual = parseActualNutrition(result.result);
                      // 권장량 대비로 부족/과잉 산출 (LLM 결과 보정)
                      const LACK_THRESHOLD = 0.8; // 80% 미만이면 부족
                      const DEFAULT_EXCESS_THRESHOLD = 1.2; // 120% 초과면 과잉
                      const SODIUM_EXCESS_THRESHOLD = 1.0; // 나트륨은 권장량 초과 즉시 과잉
                      const lackList: string[] = [];
                      const excessList: string[] = [];
                      Object.keys(RECOMMENDED).forEach((key) => {
                        const actualValue = actual[key];
                        const recommended = RECOMMENDED[key];
                        if (typeof actualValue !== "number" || !recommended)
                          return;
                        const percent = actualValue / recommended;
                        if (percent < LACK_THRESHOLD) {
                          lackList.push(key);
                        } else {
                          const threshold =
                            key === "나트륨"
                              ? SODIUM_EXCESS_THRESHOLD
                              : DEFAULT_EXCESS_THRESHOLD;
                          if (percent > threshold) {
                            excessList.push(key);
                          }
                        }
                      });
                      return Object.keys(RECOMMENDED).map((label, idx) => {
                        const actualValue = actual[label] ?? null;
                        const recommended = RECOMMENDED[label];
                        const percent =
                          actualValue && recommended
                            ? Math.round((actualValue / recommended) * 100)
                            : null;
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
                            <div className="flex items-center gap-1 mb-1">
                              <div className="text-xs text-gray-500 dark:text-gray-400">
                                {label}
                              </div>
                              <button
                                onClick={() =>
                                  setModalState({
                                    isOpen: true,
                                    nutrient: label,
                                    content: getNutritionTooltip(label),
                                  })
                                }
                                className="text-gray-400 hover:text-blue-500 transition-colors"
                                title={`${label} 정보 보기`}
                              >
                                <svg
                                  className="w-3 h-3"
                                  fill="currentColor"
                                  viewBox="0 0 20 20"
                                >
                                  <path
                                    fillRule="evenodd"
                                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z"
                                    clipRule="evenodd"
                                  />
                                </svg>
                              </button>
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
                      });
                    })()}
                  </div>
                </div>
                {/* 3. 부족/과잉 영양소 */}
                <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-4 mb-4">
                  {(() => {
                    const actual = parseActualNutrition(result.result);
                    const LACK_THRESHOLD = 0.8;
                    const DEFAULT_EXCESS_THRESHOLD = 1.2;
                    const SODIUM_EXCESS_THRESHOLD = 1.0;
                    const lackList: string[] = [];
                    const excessList: string[] = [];
                    Object.keys(RECOMMENDED).forEach((key) => {
                      const actualValue = actual[key];
                      const recommended = RECOMMENDED[key];
                      if (typeof actualValue !== "number" || !recommended)
                        return;
                      const percent = actualValue / recommended;
                      if (percent < LACK_THRESHOLD) {
                        lackList.push(key);
                      } else {
                        const threshold =
                          key === "나트륨"
                            ? SODIUM_EXCESS_THRESHOLD
                            : DEFAULT_EXCESS_THRESHOLD;
                        if (percent > threshold) {
                          excessList.push(key);
                        }
                      }
                    });
                    const alternatives = getAlternativeFoods(lackList);

                    return (
                      <>
                        <div className="mb-1 text-sm">
                          <span className="font-semibold text-red-500 dark:text-red-300">
                            부족한 영양소:
                          </span>{" "}
                          {lackList.length > 0 ? lackList.join(", ") : "없음"}
                        </div>
                        <div className="mb-1 text-sm">
                          <span className="font-semibold text-yellow-600 dark:text-yellow-300">
                            과잉된 영양소:
                          </span>{" "}
                          {excessList.length > 0
                            ? excessList.join(", ")
                            : "없음"}
                        </div>
                        {/* 대체 음식 제안 */}
                        {Object.keys(alternatives).length > 0 && (
                          <div className="mt-3">
                            <AlternativeFoods alternatives={alternatives} />
                          </div>
                        )}
                      </>
                    );
                  })()}
                </div>
                {/* 4. 추천 식단 */}
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg shadow p-4 mb-4">
                  {(() => {
                    const recommend = parseRecommend(result.result);
                    return recommend.length > 0 ? (
                      <>
                        <span className="font-semibold text-blue-600 dark:text-blue-300">
                          추천 식단:
                        </span>
                        <ul className="pl-0 mt-2 space-y-1">
                          {recommend.map((item, idx) => (
                            <li
                              key={idx}
                              className="flex items-center gap-2 text-sm text-blue-800 dark:text-blue-200"
                            >
                              <span className="inline-block w-2 h-2 bg-blue-400 rounded-full" />
                              {item}
                            </li>
                          ))}
                        </ul>
                        {/* 추천 식단 체크 컴포넌트 */}
                        <RecommendationCheck
                          analysis_id={result.id}
                          recommendations={recommend}
                        />
                      </>
                    ) : (
                      <span className="text-xs text-gray-400">
                        추천 식단 정보 없음
                      </span>
                    );
                  })()}
                </div>
                {/* 5. 원본 보기(아코디언) */}
                <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-4">
                  <button
                    className="text-xs text-blue-600 dark:text-blue-300 underline mb-2 focus:outline-none cursor-pointer"
                    onClick={() => {
                      setOpenIndexes((prev) => {
                        const next = new Set(prev);
                        if (next.has(i)) next.delete(i);
                        else next.add(i);
                        return next;
                      });
                    }}
                  >
                    {openIndexes.has(i) ? "닫기" : "원본 보기"}
                  </button>
                  {openIndexes.has(i) && (
                    <div className="whitespace-pre-line text-gray-800 dark:text-gray-100 text-sm mt-2">
                      {result.result}
                    </div>
                  )}
                </div>
              </div>
            ))}
            <div ref={loader} />
            {fetching && (
              <div className="flex justify-center items-center py-4">
                <Loading message="더 불러오는 중..." />
              </div>
            )}
            {!hasMore && results.length > 0 && (
              <div className="text-center text-xs text-gray-400 py-2">
                모든 분석 결과를 확인했습니다.
              </div>
            )}
          </div>
        )}

        {/* FAQ 섹션 */}
        <div className="mt-8 w-full max-w-2xl">
          <FAQ items={FAQ_ITEMS} title="아빠를 위한 자주 묻는 질문" />
        </div>
      </div>

      {/* 영양소 정보 모달 */}
      <NutritionModal
        isOpen={modalState.isOpen}
        onClose={() =>
          setModalState({ isOpen: false, nutrient: "", content: "" })
        }
        nutrient={modalState.nutrient}
        content={modalState.content}
      />
    </div>
  );
}
