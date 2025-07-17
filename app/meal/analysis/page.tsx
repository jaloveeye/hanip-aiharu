"use client";

import useUser from "@/lib/useUser";
import { useEffect, useState } from "react";
import { createBrowserClient } from "@supabase/ssr";
import Loading from "@/components/ui/Loading";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey);

interface AnalysisResult {
  meal: string;
  result: string;
  analyzed_at: string;
  source_type: string;
}

export default function MealAnalysisPage() {
  const { user, loading } = useUser();
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [fetching, setFetching] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
        .limit(1)
        .single();
      if (error) {
        setError("분석 결과를 불러오는 데 실패했습니다.");
      } else if (data) {
        setResult({
          meal: data.meal_text,
          result: data.result,
          analyzed_at: data.analyzed_at,
          source_type: data.source_type,
        });
      } else {
        setError("분석 결과가 없습니다.");
      }
      setFetching(false);
    })();
  }, [user]);

  if (loading || fetching)
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loading message="분석 결과를 불러오는 중..." />
      </div>
    );

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 dark:from-gray-900 dark:via-black dark:to-gray-800">
      <div className="bg-white/90 dark:bg-gray-900/90 rounded-2xl shadow-xl p-8 w-full max-w-md flex flex-col items-center border border-gray-100 dark:border-gray-800">
        <h1 className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-4 text-center">
          식단 분석 결과
        </h1>
        {error && (
          <div className="text-red-500 dark:text-red-300 text-center mb-2">
            {error}
          </div>
        )}
        {result && (
          <div className="w-full flex flex-col items-center mt-2">
            <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">
              분석된 식단:{" "}
              <span className="font-semibold text-gray-700 dark:text-gray-200">
                {result.meal.replace(/^사진 속 식재료:\s*/, "")}
              </span>
            </div>
            <div className="text-xs text-gray-400 dark:text-gray-500 mb-2">
              분석 일시:{" "}
              {new Date(result.analyzed_at)
                .toLocaleDateString("ko-KR", {
                  year: "numeric",
                  month: "2-digit",
                  day: "2-digit",
                })
                .replace(/\./g, ".")
                .replace(/\s/g, "")}
            </div>
            <div className="whitespace-pre-line text-gray-800 dark:text-gray-100 text-sm mt-2">
              {result.result}
            </div>
          </div>
        )}
        {!result && (
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
      </div>
    </div>
  );
}
