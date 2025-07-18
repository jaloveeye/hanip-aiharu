"use client";

import { PositiveFeedback } from "@/lib/utils/dadGuide";

interface PositiveFeedbackProps {
  feedback: PositiveFeedback;
  className?: string;
}

export default function PositiveFeedbackCard({
  feedback,
  className = "",
}: PositiveFeedbackProps) {
  return (
    <div
      className={`bg-gradient-to-r from-blue-50 to-green-50 dark:from-blue-900/20 dark:to-green-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800 ${className}`}
    >
      <div className="flex items-center gap-3">
        <div className="text-2xl">{feedback.emoji}</div>
        <div className="flex-1">
          <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
            {feedback.message}
          </p>
        </div>
      </div>
    </div>
  );
}

// 카테고리별 아이콘
export const categoryIcons = {
  growth: "🌱",
  nutrition: "🥗",
  effort: "💪",
};

// 카테고리별 배경 색상
export const categoryColors = {
  growth: "from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20",
  nutrition:
    "from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20",
  effort:
    "from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20",
};
