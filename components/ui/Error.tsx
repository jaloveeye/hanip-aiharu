import React from "react";

interface ErrorProps {
  message: string;
  onRetry?: () => void;
}

const Error: React.FC<ErrorProps> = ({ message, onRetry }) => (
  <div className="flex flex-col items-center justify-center p-6 bg-red-50 rounded-md border border-red-200 text-red-700">
    <span className="mb-2 font-semibold">{message}</span>
    {onRetry && (
      <button
        onClick={onRetry}
        className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
      >
        다시 시도
      </button>
    )}
  </div>
);

export default Error;
