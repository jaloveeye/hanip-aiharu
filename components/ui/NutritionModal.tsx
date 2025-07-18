interface NutritionModalProps {
  isOpen: boolean;
  onClose: () => void;
  nutrient: string;
  content: string;
}

export default function NutritionModal({
  isOpen,
  onClose,
  nutrient,
  content,
}: NutritionModalProps) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50 p-4"
      style={{ backgroundColor: "rgba(0, 0, 0, 0.3)" }}
    >
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6 relative">
        {/* 닫기 버튼 */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        {/* 제목 */}
        <div className="mb-4">
          <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
            {nutrient} 정보
          </h3>
          <div className="w-12 h-1 bg-blue-500 rounded-full mt-2"></div>
        </div>

        {/* 내용 */}
        <div className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line">
          {content}
        </div>

        {/* 하단 버튼 */}
        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
          >
            확인
          </button>
        </div>
      </div>
    </div>
  );
}
