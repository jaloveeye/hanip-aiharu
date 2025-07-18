"use client";

import { useState, useEffect } from "react";

interface RecommendationCheckProps {
  analysis_id: number;
  recommendations: string[];
  initialChecked?: boolean;
  onCheckChange?: (checked: boolean) => void;
}

export default function RecommendationCheck({
  analysis_id,
  recommendations,
  initialChecked = false,
  onCheckChange,
}: RecommendationCheckProps) {
  const [checked, setChecked] = useState(initialChecked);
  const [updating, setUpdating] = useState(false);
  const [loading, setLoading] = useState(true);

  // 컴포넌트 마운트 시 체크 상태 가져오기
  useEffect(() => {
    const fetchCheckStatus = async () => {
      try {
        const response = await fetch(
          `/api/recommendation/status?analysis_id=${analysis_id}`
        );
        const data = await response.json();
        if (data.success) {
          setChecked(data.checked || false);
        }
      } catch (error) {
        console.error("체크 상태 조회 중 오류:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCheckStatus();
  }, [analysis_id]);

  const handleCheck = async () => {
    if (updating) return;

    setUpdating(true);
    try {
      const response = await fetch("/api/recommendation/check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          analysis_id,
          checked: !checked,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setChecked(!checked);
        onCheckChange?.(!checked);
      } else {
        console.error("체크 상태 업데이트 실패:", data.message);
      }
    } catch (error) {
      console.error("체크 상태 업데이트 중 오류:", error);
    } finally {
      setUpdating(false);
    }
  };

  if (recommendations.length === 0) {
    return null;
  }

  if (loading) {
    return (
      <div className="bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800 p-4 mb-4">
        <div className="flex items-center justify-center">
          <div className="w-4 h-4 border-2 border-green-400 border-t-transparent rounded-full animate-spin" />
          <span className="ml-2 text-sm text-green-700 dark:text-green-300">
            체크 상태 확인 중...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800 p-4 mb-4">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-bold text-green-700 dark:text-green-300">
          💡 추천 식단 체크
        </h4>
        <button
          onClick={handleCheck}
          disabled={updating}
          className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium transition-colors ${
            checked
              ? "bg-green-600 text-white hover:bg-green-700"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
          }`}
        >
          {updating ? (
            <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
          ) : checked ? (
            <>
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
              체크됨
            </>
          ) : (
            <>
              <svg
                className="w-3 h-3"
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
              체크하기
            </>
          )}
        </button>
      </div>

      <div className="space-y-2">
        {recommendations.map((item, idx) => (
          <div
            key={idx}
            className={`flex items-center gap-2 text-sm ${
              checked
                ? "text-green-700 dark:text-green-300 line-through opacity-75"
                : "text-gray-700 dark:text-gray-300"
            }`}
          >
            <span className="inline-block w-2 h-2 bg-green-400 rounded-full" />
            {item}
          </div>
        ))}
      </div>

      {checked && (
        <div className="mt-3 p-2 bg-green-100 dark:bg-green-800/30 rounded-lg border border-green-200 dark:border-green-700">
          <p className="text-xs text-green-800 dark:text-green-200 text-center">
            🎉 훌륭해요! 추천 식단을 실천하셨네요. 아이의 영양 섭취가 더욱
            균형잡힐 거예요!
          </p>
          <p className="text-xs text-green-600 dark:text-green-400 text-center mt-1">
            💡 새로운 식단을 분석하면 이전 추천이 자동으로 체크됩니다.
          </p>
        </div>
      )}
    </div>
  );
}
