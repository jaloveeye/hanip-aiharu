"use client";

import useUser from "@/lib/useUser";
import { useEffect, useState } from "react";
import { createBrowserClient } from "@supabase/ssr";
import Loading from "@/components/ui/Loading";
import { parseActualNutrition } from "@/lib/utils/analysisParser";
import Link from "next/link";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Bar,
  PieChart,
  Pie,
  Cell,
  ComposedChart,
} from "recharts";

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

interface NutritionData {
  date: string;
  열량: number;
  단백질: number;
  지방: number;
  탄수화물: number;
  식이섬유: number;
  칼슘: number;
  철분: number;
  "비타민 A": number;
  "비타민 C": number;
  "비타민 D": number;
  나트륨: number;
  권장량: number;
}

interface CompletionRate {
  name: string;
  실제: number;
  권장: number;
  충족률: number;
  color: string;
}

// 7세 아동(여아) 1일 권장 영양소 섭취량
const DAILY_RECOMMENDED: Record<string, number> = {
  열량: 1700,
  단백질: 37.5,
  지방: 50,
  탄수화물: 120,
  식이섬유: 10,
  칼슘: 500,
  철분: 7.5,
  "비타민 A": 500,
  "비타민 C": 40,
  "비타민 D": 5,
  나트륨: 1400,
};

// 한끼 권장 영양소 섭취량 (일일 권장량의 1/3)
const RECOMMENDED: Record<string, number> = {
  열량: Math.round(DAILY_RECOMMENDED.열량 / 3),
  단백질: Math.round((DAILY_RECOMMENDED.단백질 / 3) * 10) / 10,
  지방: Math.round((DAILY_RECOMMENDED.지방 / 3) * 10) / 10,
  탄수화물: Math.round((DAILY_RECOMMENDED.탄수화물 / 3) * 10) / 10,
  식이섬유: Math.round((DAILY_RECOMMENDED.식이섬유 / 3) * 10) / 10,
  칼슘: Math.round(DAILY_RECOMMENDED.칼슘 / 3),
  철분: Math.round((DAILY_RECOMMENDED.철분 / 3) * 10) / 10,
  "비타민 A": Math.round(DAILY_RECOMMENDED["비타민 A"] / 3),
  "비타민 C": Math.round((DAILY_RECOMMENDED["비타민 C"] / 3) * 10) / 10,
  "비타민 D": Math.round((DAILY_RECOMMENDED["비타민 D"] / 3) * 10) / 10,
  나트륨: Math.round(DAILY_RECOMMENDED.나트륨 / 3),
};

// 각 영양소별 고유 색상
const NUTRIENT_COLORS: Record<string, string> = {
  열량: "#ef4444", // 빨간색
  단백질: "#3b82f6", // 파란색
  지방: "#f59e0b", // 주황색
  탄수화물: "#10b981", // 초록색
  식이섬유: "#8b5cf6", // 보라색
  칼슘: "#06b6d4", // 청록색
  철분: "#f97316", // 주황색
  "비타민 A": "#fbbf24", // 노란색
  "비타민 C": "#84cc16", // 연두색
  "비타민 D": "#a855f7", // 자주색
  나트륨: "#ec4899", // 분홍색
};

export default function MealTrackingPage() {
  const { user, loading } = useUser();
  const [results, setResults] = useState<AnalysisResult[]>([]);
  const [nutritionData, setNutritionData] = useState<NutritionData[]>([]);
  const [completionRates, setCompletionRates] = useState<CompletionRate[]>([]);
  const [fetching, setFetching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedNutrient, setSelectedNutrient] = useState<string>("열량");

  useEffect(() => {
    if (!user) return;
    setFetching(true);
    setError(null);
    (async () => {
      try {
        // 최근 7일 데이터 조회
        const since = new Date();
        since.setDate(since.getDate() - 6);
        const sinceStr = since.toISOString().slice(0, 10);

        const { data, error } = await supabase
          .from("member_meal_analysis")
          .select("id, meal_text, result, analyzed_at, source_type")
          .eq("user_id", user.id)
          .gte("analyzed_at", sinceStr)
          .order("analyzed_at", { ascending: true });

        if (error) {
          setError("분석 결과를 불러오는 데 실패했습니다.");
        } else if (data) {
          setResults(data as AnalysisResult[]);

          // 영양소 데이터 처리
          const nutritionDataArray: NutritionData[] = data.map((result) => {
            const actual = parseActualNutrition(result.result);
            return {
              date: result.analyzed_at.slice(5), // MM-DD 형식
              열량: actual.열량 || 0,
              단백질: actual.단백질 || 0,
              지방: actual.지방 || 0,
              탄수화물: actual.탄수화물 || 0,
              식이섬유: actual.식이섬유 || 0,
              칼슘: actual.칼슘 || 0,
              철분: actual.철분 || 0,
              "비타민 A": actual["비타민 A"] || 0,
              "비타민 C": actual["비타민 C"] || 0,
              "비타민 D": actual["비타민 D"] || 0,
              나트륨: actual.나트륨 || 0,
              권장량: RECOMMENDED[selectedNutrient] || 0,
            };
          });

          setNutritionData(nutritionDataArray);

          // 충족률 계산 (최근 7일 평균)
          if (nutritionDataArray.length > 0) {
            const averages = Object.keys(RECOMMENDED).map((nutrient) => {
              const total = nutritionDataArray.reduce(
                (sum, day) =>
                  sum + (day[nutrient as keyof NutritionData] as number),
                0
              );
              const average = total / nutritionDataArray.length;
              const rate = Math.round((average / RECOMMENDED[nutrient]) * 100);

              console.log(
                `${nutrient}: 총합=${total}, 평균=${average}, 권장량=${RECOMMENDED[nutrient]}, 충족률=${rate}%`
              );

              return {
                name: nutrient,
                실제: average,
                권장: RECOMMENDED[nutrient],
                충족률: rate,
                color: NUTRIENT_COLORS[nutrient],
              };
            });

            console.log("충족률 데이터:", averages);
            setCompletionRates(averages);
          }
        }
      } catch {
        setError("데이터 처리 중 오류가 발생했습니다.");
      } finally {
        setFetching(false);
      }
    })();
  }, [user, selectedNutrient]);

  if (loading || fetching) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loading message="성장 데이터를 불러오는 중..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-red-500 text-center">
          <p className="text-lg font-semibold mb-2">오류가 발생했습니다</p>
          <p className="text-sm">{error}</p>
        </div>
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg font-semibold mb-2">
            아직 분석 데이터가 없습니다
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            식단을 분석하면 성장 그래프를 확인할 수 있습니다.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 dark:from-gray-900 dark:via-black dark:to-gray-800">
      <div className="bg-white/90 dark:bg-gray-900/90 rounded-2xl shadow-xl p-8 w-full max-w-6xl flex flex-col items-center border border-gray-100 dark:border-gray-800">
        {/* 네비게이션 버튼 */}
        <div className="self-start mb-4">
          <Link
            href="/meal"
            className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200 text-sm font-medium"
          >
            ← 식단 분석하기
          </Link>
        </div>

        <h1 className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-6 text-center">
          📈 영양소 성장 트래킹
        </h1>

        {/* 영양소 선택 */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            영양소 선택:
          </label>
          <select
            value={selectedNutrient}
            onChange={(e) => setSelectedNutrient(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {Object.keys(RECOMMENDED).map((nutrient) => (
              <option key={nutrient} value={nutrient}>
                {nutrient}
              </option>
            ))}
          </select>
        </div>

        {/* 영양소 변화 그래프 */}
        <div className="w-full mb-8">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2 text-center">
            {selectedNutrient} 한끼 섭취량 변화 (최근 7일)
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 text-center mb-4">
            ※ 한끼 권장량 = 일일 권장량 ÷ 3 (예: 열량 567kcal = 1700kcal ÷ 3)
          </p>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={nutritionData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="date" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#ffffff",
                    border: "1px solid #e5e7eb",
                    borderRadius: "8px",
                    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey={selectedNutrient}
                  stroke={NUTRIENT_COLORS[selectedNutrient]}
                  strokeWidth={3}
                  dot={{
                    fill: NUTRIENT_COLORS[selectedNutrient],
                    strokeWidth: 2,
                    r: 6,
                  }}
                  activeDot={{ r: 8, fill: NUTRIENT_COLORS[selectedNutrient] }}
                />
                <Line
                  type="monotone"
                  dataKey="권장량"
                  stroke="#10b981"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 영양소별 충족률 차트 */}
        <div className="w-full mb-8">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2 text-center">
            영양소별 한끼 권장량 대비 충족률 (7일 평균)
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 text-center mb-4">
            ※ 각 영양소의 일일 권장량을 3으로 나누어 한끼 기준으로 계산
          </p>
          <div className="h-96">
            {completionRates.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart
                  data={completionRates}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="name" stroke="#6b7280" />
                  <YAxis stroke="#6b7280" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#ffffff",
                      border: "1px solid #e5e7eb",
                      borderRadius: "8px",
                      boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                    }}
                  />
                  <Legend />
                  <Bar
                    dataKey="실제"
                    fill="#3b82f6"
                    radius={[4, 4, 0, 0]}
                    name="실제 섭취량"
                  >
                    {completionRates.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                  <Line
                    type="monotone"
                    dataKey="권장"
                    stroke="#10b981"
                    strokeWidth={3}
                    strokeDasharray="5 5"
                    dot={{
                      fill: "#10b981",
                      strokeWidth: 2,
                      r: 4,
                    }}
                    name="권장량"
                  />
                </ComposedChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-500">
                <p>
                  충족률 데이터를 불러오는 중... (데이터 개수:{" "}
                  {completionRates.length})
                </p>
              </div>
            )}
          </div>
        </div>

        {/* 영양소 균형 파이 차트 */}
        <div className="w-full">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4 text-center">
            영양소 균형 분포
          </h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={completionRates}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, 충족률 }) => `${name}: ${충족률}%`}
                  outerRadius={60}
                  fill="#f59e0b"
                  dataKey="충족률"
                >
                  {completionRates.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#ffffff",
                    border: "1px solid #e5e7eb",
                    borderRadius: "8px",
                    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 인사이트 */}
        <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800 w-full">
          <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-200 mb-2">
            💡 이번 주 한끼 영양소 인사이트
          </h3>
          <p className="text-xs text-blue-600 dark:text-blue-300 mb-3">
            ※ 최근 7일 한끼 평균 기준으로 분석 (일일 권장량 ÷ 3)
          </p>
          <div className="space-y-2 text-sm text-blue-700 dark:text-blue-300">
            {completionRates.length > 0 && (
              <>
                {completionRates
                  .filter((rate) => rate.충족률 < 80)
                  .slice(0, 3)
                  .map((rate) => (
                    <p key={rate.name}>
                      🔴 <strong>{rate.name}</strong> 한끼 평균 섭취가
                      부족합니다 ({rate.충족률}%)
                    </p>
                  ))}
                {completionRates
                  .filter((rate) => rate.충족률 >= 80 && rate.충족률 <= 120)
                  .slice(0, 3)
                  .map((rate) => (
                    <p key={rate.name}>
                      🟢 <strong>{rate.name}</strong> 한끼 평균 섭취가
                      적절합니다 ({rate.충족률}%)
                    </p>
                  ))}
                {completionRates
                  .filter((rate) => rate.충족률 > 120)
                  .slice(0, 3)
                  .map((rate) => (
                    <p key={rate.name}>
                      🟡 <strong>{rate.name}</strong> 한끼 평균 섭취가
                      과잉입니다 ({rate.충족률}%)
                    </p>
                  ))}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
