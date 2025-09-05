"use client";

interface AlternativeFoodsProps {
  alternatives: Record<string, string[]>;
  className?: string;
}

import { NUTRITION_GUIDE } from "@/lib/utils/dadGuide";

export default function AlternativeFoods({
  alternatives,
  className = "",
}: AlternativeFoodsProps) {
  if (Object.keys(alternatives).length === 0) {
    return null;
  }

  return (
    <div
      className={`bg-white dark:bg-gray-900 rounded-lg shadow p-4 ${className}`}
    >
      <h4 className="text-sm font-bold text-blue-600 dark:text-blue-400 mb-3 text-center">
        💡 부족한 영양소 보충 방법
      </h4>
      <div className="space-y-3">
        {Object.entries(alternatives).map(([nutrient, foods]) => (
          <div
            key={nutrient}
            className="border border-gray-200 dark:border-gray-700 rounded-lg p-3"
          >
            <h5 className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2">
              {nutrient} 보충 음식
            </h5>
            <div className="flex flex-wrap gap-2">
              {foods.map((food, index) => (
                <span
                  key={index}
                  className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 rounded-full"
                >
                  {food}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
      {(() => {
        const nutrients = Object.keys(alternatives);
        const tips = nutrients
          .map((n) => NUTRITION_GUIDE[n]?.dailyTip)
          .filter(Boolean) as string[];
        if (tips.length === 0) return null;
        const combined = tips.slice(0, 2).join(" · ");
        return (
          <div className="mt-3 p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
            <p className="text-xs text-yellow-800 dark:text-yellow-200 text-center">
              💡 팁: {combined}
            </p>
          </div>
        );
      })()}
    </div>
  );
}
