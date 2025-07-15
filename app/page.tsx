"use client";

import useUser from "@/lib/useUser";
import { Button } from "@/components/ui/Button";
import { useState } from "react";

function ChartIllustration() {
  // 원형 차트 스타일 SVG (영양소 예시)
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
  // 간단한 원형 차트 SVG (각 영양소별 비율)
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

export default function Home() {
  const { user, loading } = useUser();
  const [input, setInput] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [result, setResult] = useState<null | {
    nutrition: { label: string; value: number; color: string }[];
    advice: string;
  }>(null);
  const [analyzing, setAnalyzing] = useState(false);

  // 이미지 업로드 핸들러
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setImage(file);
    setResult(null);
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => setImagePreview(ev.target?.result as string);
      reader.readAsDataURL(file);
    } else {
      setImagePreview(null);
    }
  };

  if (loading) return null;
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

  // 로그인된 경우: 식단 입력/분석/차트 UI
  const dummyData = [
    { label: "탄수화물", value: 60, color: "#60a5fa" },
    { label: "단백질", value: 20, color: "#34d399" },
    { label: "지방", value: 15, color: "#fbbf24" },
    { label: "섬유질", value: 5, color: "#a78bfa" },
  ];
  const dummyAdvice = image
    ? "이미지에서 식단을 분석했습니다. 단백질과 섬유질이 부족합니다. 달걀, 두부, 채소를 추가해보세요!"
    : "단백질과 섬유질이 부족합니다. 달걀, 두부, 채소를 추가해보세요!";

  const handleAnalyze = async () => {
    setAnalyzing(true);
    // 실제 API 연동 전까지 더미 데이터 사용
    setTimeout(() => {
      setResult({ nutrition: dummyData, advice: dummyAdvice });
      setAnalyzing(false);
    }, 1200);
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center py-8 px-2 bg-gradient-to-br from-blue-50 via-white to-green-50 dark:from-gray-900 dark:via-black dark:to-gray-800">
      <div className="bg-white/90 dark:bg-gray-900/90 rounded-2xl shadow-xl p-8 w-full max-w-md flex flex-col items-center border border-gray-100 dark:border-gray-800">
        <h2 className="text-xl font-bold text-blue-600 dark:text-blue-400 mb-4 text-center">
          아침 식단을 입력(텍스트 또는 사진)하고
          <br />
          AI 분석 결과를 확인하세요
        </h2>
        <input
          type="text"
          className="w-full mb-2 px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-400"
          placeholder="예: 계란, 토스트, 우유"
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
            setResult(null);
          }}
          disabled={analyzing}
        />
        <label className="w-full flex flex-col items-center justify-center cursor-pointer mb-4">
          <span className="text-xs text-gray-500 dark:text-gray-400 mb-1">
            또는 사진 업로드
          </span>
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleImageChange}
            disabled={analyzing}
          />
          <div className="w-full h-28 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-200 dark:border-gray-700 mt-1">
            {imagePreview ? (
              <img
                src={imagePreview}
                alt="업로드 미리보기"
                className="max-h-24 max-w-full object-contain rounded"
              />
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
          onClick={handleAnalyze}
          disabled={analyzing || (!input.trim() && !image)}
        >
          {analyzing ? (
            <svg
              className="animate-spin mr-2 h-5 w-5 text-white align-middle self-center flex-shrink-0"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
                fill="none"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
              />
            </svg>
          ) : null}
          {analyzing ? "분석 중..." : "분석하기"}
        </Button>
        {result && (
          <div className="w-full flex flex-col items-center mt-2">
            <DummyNutritionChart data={result.nutrition} />
            <div className="flex flex-wrap justify-center gap-2 mb-2">
              {result.nutrition.map((n) => (
                <span
                  key={n.label}
                  className="text-xs px-2 py-1 rounded-full"
                  style={{ background: n.color, color: "#fff", opacity: 0.85 }}
                >
                  {n.label}: {n.value}%
                </span>
              ))}
            </div>
            <div className="text-sm text-gray-700 dark:text-gray-200 text-center font-medium mt-2">
              {result.advice}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
