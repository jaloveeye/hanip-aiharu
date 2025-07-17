"use client";

import useUser from "@/lib/useUser";
import { useEffect, useState, useRef, useCallback } from "react";
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

// 부족/과잉 영양소 파싱 함수 (대시보드와 동일)
function parseLackExcess(result: string) {
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
  return { lack, excess };
}

// 추천 식단 파싱 함수
function parseRecommend(result: string) {
  // 7. 내일 아침 추천 식단 또는 추천 식단 블록 추출
  const match = result.match(
    /(추천 식단|내일 아침 추천 식단)[^\n]*\n([\s\S]+)/
  );
  if (match) {
    const block = match[2];
    // - 또는 •로 시작하는 항목만 추출
    const items = block
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.startsWith("-") || line.startsWith("•"))
      .map((line) => line.replace(/^[-•]\s*/, "").replace(/^[-•]/, ""))
      .filter(Boolean);
    return items;
  }
  return [];
}

export default function MealAnalysisPage() {
  const { user, loading } = useUser();
  const [results, setResults] = useState<AnalysisResult[]>([]);
  const [fetching, setFetching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0);
  const loader = useRef<HTMLDivElement | null>(null);
  const [openIndexes, setOpenIndexes] = useState<Set<number>>(new Set());

  // 최초/페이지 변경 시 데이터 fetch
  useEffect(() => {
    if (!user) return;
    setFetching(true);
    setError(null);
    (async () => {
      const { data, error } = await supabase
        .from("member_meal_analysis")
        .select("meal_text, result, analyzed_at, source_type")
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
    if (loader.current) observer.observe(loader.current);
    return () => {
      if (loader.current) observer.unobserve(loader.current);
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
                      const mealText = result.meal_text.replace(
                        /^사진 속 식재료:\s*/,
                        ""
                      );
                      const items = mealText
                        .split(/\n|,|\s*\d+\.\s*/)
                        .map((s) => s.trim())
                        .filter(
                          (s) => s && s.length > 0 && s !== "사진 속 식재료"
                        );
                      return items.map((item, idx) => (
                        <span
                          key={idx}
                          className="bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-100 text-xs px-2 py-0.5 rounded-full mr-1 mb-1"
                        >
                          {item}
                        </span>
                      ));
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
                      const { lack, excess } = parseLackExcess(result.result);
                      // 부족/과잉 영양소를 리스트로 분리
                      const lackList = lack
                        .split(",")
                        .map((s) => s.trim())
                        .filter(Boolean);
                      const excessList = excess
                        .split(",")
                        .map((s) => s.trim())
                        .filter(Boolean);
                      return Object.keys(RECOMMENDED).map((label, idx) => {
                        const actualValue = actual[label] ?? null;
                        const recommended = RECOMMENDED[label];
                        const percent =
                          actualValue && recommended
                            ? Math.round((actualValue / recommended) * 100)
                            : null;
                        // 색상 결정
                        let barColor = "bg-blue-400";
                        if (lackList.includes(label))
                          barColor = "bg-yellow-400";
                        if (excessList.includes(label)) barColor = "bg-red-400";
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
                      });
                    })()}
                  </div>
                </div>
                {/* 3. 부족/과잉 영양소 */}
                <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-4 mb-4">
                  {(() => {
                    const { lack, excess } = parseLackExcess(result.result);
                    return (
                      <>
                        <div className="mb-1 text-sm">
                          <span className="font-semibold text-red-500 dark:text-red-300">
                            부족한 영양소:
                          </span>{" "}
                          {lack || "없음"}
                        </div>
                        <div className="mb-1 text-sm">
                          <span className="font-semibold text-yellow-600 dark:text-yellow-300">
                            과잉된 영양소:
                          </span>{" "}
                          {excess || "없음"}
                        </div>
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
      </div>
    </div>
  );
}
