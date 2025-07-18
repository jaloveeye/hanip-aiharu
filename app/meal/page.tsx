"use client";

import useUser from "@/lib/useUser";
import { Button } from "@/components/ui/Button";
import Popup from "@/components/ui/Popup";
import usePopup from "@/lib/hooks/usePopup";
import useAnalyzeMeal from "@/lib/hooks/useAnalyzeMeal";
import useImageUpload from "@/lib/hooks/useImageUpload";
import Loading from "@/components/ui/Loading";
import Image from "next/image";
import { useRef, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";
import NutritionModal from "@/components/ui/NutritionModal";
import {
  DAD_GUIDE_MESSAGES,
  getRandomPositiveFeedback,
  getNutritionTooltip,
} from "@/lib/utils/dadGuide";
import PositiveFeedbackCard from "@/components/ui/PositiveFeedback";

function ChartIllustration() {
  return (
    <svg width="120" height="120" viewBox="0 0 120 120" className="mb-4">
      <circle cx="60" cy="60" r="54" fill="#f3f4f6" />
      <path
        d="M60 6 a54 54 0 0 1 46.8 27"
        fill="none"
        stroke="#60a5fa"
        strokeWidth="12"
      />
      <path
        d="M106.8 33 a54 54 0 0 1 -21.6 73.8"
        fill="none"
        stroke="#34d399"
        strokeWidth="12"
      />
      <path
        d="M85.2 106.8 a54 54 0 1 1 -54-93.6"
        fill="none"
        stroke="#fbbf24"
        strokeWidth="12"
      />
      <circle cx="60" cy="60" r="36" fill="#fff" />
      <text
        x="60"
        y="66"
        textAnchor="middle"
        fontSize="18"
        fill="#374151"
        fontWeight="bold"
      >
        AI
      </text>
    </svg>
  );
}

function DummyNutritionChart({
  data,
}: {
  data: { label: string; value: number; color: string }[];
}) {
  const total = data.reduce((sum, d) => sum + d.value, 0);
  let startAngle = 0;
  const center = 60,
    radius = 54,
    stroke = 16;
  return (
    <svg width="120" height="120" viewBox="0 0 120 120" className="mb-2">
      {data.map((d) => {
        const angle = (d.value / total) * 360;
        const endAngle = startAngle + angle;
        const largeArc = angle > 180 ? 1 : 0;
        const x1 =
          center + radius * Math.cos((Math.PI * (startAngle - 90)) / 180);
        const y1 =
          center + radius * Math.sin((Math.PI * (startAngle - 90)) / 180);
        const x2 =
          center + radius * Math.cos((Math.PI * (endAngle - 90)) / 180);
        const y2 =
          center + radius * Math.sin((Math.PI * (endAngle - 90)) / 180);
        const path = `M${center},${center} L${x1},${y1} A${radius},${radius} 0 ${largeArc} 1 ${x2},${y2} Z`;
        startAngle += angle;
        return (
          <path key={d.label} d={path} fill={d.color} fillOpacity={0.85} />
        );
      })}
      <circle cx={center} cy={center} r={radius - stroke} fill="#fff" />
      <text
        x={center}
        y={center + 6}
        textAnchor="middle"
        fontSize="18"
        fill="#374151"
        fontWeight="bold"
      >
        분석
      </text>
    </svg>
  );
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey);

function getSeoulTodayString() {
  const now = new Date();
  const seoul = new Date(now.getTime() + 9 * 60 * 60 * 1000);
  return seoul.toISOString().slice(0, 10);
}

export default function MealPage() {
  const { user, loading } = useUser();
  const { popup, showPopup, closePopup } = usePopup();
  const router = useRouter();
  const { input, setInput, result, setResult, analyzing, handleAnalyze } =
    useAnalyzeMeal({ showPopup, router });
  const { image, imagePreview, handleImageChange } = useImageUpload({
    setResult,
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 오늘 분석 기록 fetch
  const [todayAnalyzed, setTodayAnalyzed] = useState<boolean | null>(null);

  // 영양소 모달 상태
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    nutrient: string;
    content: string;
  }>({
    isOpen: false,
    nutrient: "",
    content: "",
  });
  useEffect(() => {
    if (!user) return;
    const fetchToday = async () => {
      const today = getSeoulTodayString();
      const { data, error } = await supabase
        .from("member_meal_analysis")
        .select("id")
        .eq("user_id", user.id)
        .eq("analyzed_at", today);
      if (error) {
        setTodayAnalyzed(false); // 에러 시 입력 UI 노출
      } else {
        setTodayAnalyzed((data?.length ?? 0) > 0);
      }
    };
    fetchToday();
  }, [user]);

  if (loading || todayAnalyzed === null)
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loading message="사용자 정보를 불러오는 중..." />
      </div>
    );
  if (!user) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-green-50 dark:from-gray-900 dark:via-black dark:to-gray-800">
        <div className="bg-white/90 dark:bg-gray-900/90 rounded-2xl shadow-xl p-8 w-full max-w-md flex flex-col items-center border border-gray-100 dark:border-gray-800">
          <ChartIllustration />
          <h1 className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-2 text-center">
            식단을 분석하고
            <br />
            차트로 시각화해드립니다
          </h1>
          <p className="text-gray-600 dark:text-gray-300 text-center mb-6">
            아침 식단을 입력하면 AI가 영양소를 분석하고,
            <br />
            부족한 영양소와 추천 식단을
            <br />
            차트로 한눈에 보여줍니다.
          </p>
          <Button
            type="button"
            variant="primary"
            size="md"
            className="w-full flex items-center justify-center gap-2 bg-[#4285F4] hover:bg-[#357ae8] dark:bg-[#4285F4] dark:hover:bg-[#357ae8] text-white font-semibold text-base py-2 rounded-lg shadow"
            onClick={() => (window.location.href = "/auth")}
          >
            {/* 로그인 아이콘 (문/자물쇠/사용자 중 하나, 여기서는 문 형태) */}
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="mr-2"
              xmlns="http://www.w3.org/2000/svg"
            >
              <rect
                x="3"
                y="2"
                width="14"
                height="20"
                rx="2"
                fill="none"
                stroke="currentColor"
              />
              <path d="M16 6h1a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-1" />
              <circle cx="8.5" cy="12" r="1.5" />
            </svg>
            로그인하러 가기
          </Button>
        </div>
      </div>
    );
  }

  // 오늘 분석 기록이 있으면 버튼만 노출
  if (todayAnalyzed) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center py-8 px-2 bg-gradient-to-br from-blue-50 via-white to-green-50 dark:from-gray-900 dark:via-black dark:to-gray-800">
        <div className="bg-white/90 dark:bg-gray-900/90 rounded-2xl shadow-xl p-8 w-full max-w-md flex flex-col items-center border border-gray-100 dark:border-gray-800">
          <h2 className="text-xl font-bold text-blue-600 dark:text-blue-400 mb-4 text-center">
            오늘은 이미 식단 분석을 완료하셨습니다
          </h2>
          <div className="flex gap-2 w-full">
            <Button
              type="button"
              variant="primary"
              size="md"
              className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-base py-2 rounded-lg shadow"
              onClick={() => router.push("/meal/analysis")}
            >
              오늘 분석한 내용 보기
            </Button>
            <Button
              type="button"
              variant="secondary"
              size="md"
              className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold text-base py-2 rounded-lg shadow"
              onClick={() => router.push("/meal/tracking")}
            >
              성장 트래킹
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <Popup open={popup.open} message={popup.message} onClose={closePopup} />
      <div className="flex-1 flex flex-col items-center justify-center py-8 px-2 bg-gradient-to-br from-blue-50 via-white to-green-50 dark:from-gray-900 dark:via-black dark:to-gray-800">
        <div className="bg-white/90 dark:bg-gray-900/90 rounded-2xl shadow-xl p-8 w-full max-w-md flex flex-col items-center border border-gray-100 dark:border-gray-800">
          {/* 아빠를 위한 친절한 안내 메시지 */}
          <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <p className="text-sm text-blue-800 dark:text-blue-200 text-center">
              {DAD_GUIDE_MESSAGES.welcome}
            </p>
          </div>

          <h2 className="text-xl font-bold text-blue-600 dark:text-blue-400 mb-4 text-center">
            자녀의 아침 식단을 입력(텍스트 또는 사진)하고
            <br />
            AI 분석 결과를 확인하세요
          </h2>

          {/* 영양소 툴팁 안내 */}
          <div className="mb-4 p-2 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
            <p className="text-xs text-green-800 dark:text-green-200 text-center">
              💡 영양소 설명에 마우스를 올려보시면 더 자세한 정보를 볼 수
              있어요!
            </p>
          </div>
          <div className="relative w-full mb-2">
            <input
              type="text"
              className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="예: 달걀, 토스트, 우유"
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                setResult(null);
              }}
              disabled={!!image}
            />
            {input && (
              <button
                type="button"
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                onClick={() => setInput("")}
                tabIndex={-1}
              >
                ×
              </button>
            )}
          </div>
          <label className="w-full flex flex-col items-center justify-center cursor-pointer mb-4 relative">
            <span className="text-xs text-gray-500 dark:text-gray-400 mb-1">
              또는 사진 업로드
            </span>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageChange}
              disabled={!!input}
            />
            <div className="w-full h-28 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-200 dark:border-gray-700 mt-1 relative">
              {imagePreview ? (
                <>
                  <Image
                    src={imagePreview}
                    alt="업로드 미리보기"
                    width={200}
                    height={96}
                    className="max-h-24 max-w-full object-contain rounded"
                  />
                  <button
                    type="button"
                    className="absolute right-2 top-2 bg-white/80 dark:bg-gray-900/80 rounded-full p-1 text-gray-500 hover:text-red-500 shadow"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      if (fileInputRef.current) fileInputRef.current.value = "";
                      handleImageChange({
                        target: { files: null },
                      } as unknown as React.ChangeEvent<HTMLInputElement>);
                    }}
                    tabIndex={-1}
                  >
                    ×
                  </button>
                </>
              ) : (
                <span className="text-gray-400 dark:text-gray-600 text-sm">
                  이미지 파일을 선택하세요
                </span>
              )}
            </div>
          </label>
          <Button
            type="button"
            variant="primary"
            size="md"
            className="w-full mb-6 flex flex-row items-center justify-center"
            onClick={() => handleAnalyze(image)}
            disabled={analyzing || (!input.trim() && !image)}
          >
            {analyzing ? (
              <span className="flex flex-row items-center gap-2">
                <Loading colorClassName="text-white" />
                분석 중...
              </span>
            ) : (
              "분석하기"
            )}
          </Button>
          {result && (
            <div className="w-full flex flex-col items-center mt-2">
              {/* 긍정적 피드백 */}
              <div className="w-full mb-4">
                <PositiveFeedbackCard feedback={getRandomPositiveFeedback()} />
              </div>

              <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                분석된 식단:{" "}
                <span className="font-semibold text-gray-700 dark:text-gray-200">
                  {result.meal}
                </span>
              </div>
              {/* 주요 영양소 바 차트 */}
              <DummyNutritionChart
                data={result.nutrition.map((n) => ({
                  label: n.label,
                  value: n.value,
                  color: n.color || "#60a5fa",
                }))}
              />
              {/* 부족/과잉/추천 식단 */}
              <div className="flex flex-wrap justify-center gap-2 mb-2">
                {result.nutrition.map((n) => {
                  const color = n.color || "#60a5fa";
                  return (
                    <div key={n.label} className="flex items-center gap-1">
                      <span
                        className="text-xs px-2 py-1 rounded-full"
                        style={{
                          background: color,
                          color: "#fff",
                          opacity: 0.85,
                        }}
                      >
                        {n.label}: {n.value}
                      </span>
                      <button
                        onClick={() =>
                          setModalState({
                            isOpen: true,
                            nutrient: n.label,
                            content: getNutritionTooltip(n.label),
                          })
                        }
                        className="text-gray-400 hover:text-blue-500 transition-colors"
                        title={`${n.label} 정보 보기`}
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
                  );
                })}
              </div>
              <div className="text-sm text-red-500 dark:text-red-300 text-center font-medium mt-2">
                부족한 영양소:{" "}
                {result.lack.length ? result.lack.join(", ") : "없음"}
              </div>
              <div className="text-sm text-yellow-600 dark:text-yellow-300 text-center font-medium mt-1">
                과잉된 영양소: {/* result에 과잉 정보가 있다면 여기에 추가 */}
                {/* 예시: result.excess ? result.excess.join(", ") : "없음" */}
                없음
              </div>
              <div className="text-sm text-blue-600 dark:text-blue-300 text-center font-medium mt-1">
                추천 식단:{" "}
                {result.recommend.length ? result.recommend.join(", ") : "-"}
              </div>
            </div>
          )}
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
    </>
  );
}
