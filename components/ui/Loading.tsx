import React from "react";

interface LoadingProps {
  message?: string;
  colorClassName?: string;
}

const Loading: React.FC<LoadingProps> = ({ message, colorClassName }) => {
  return (
    <div className="flex flex-col items-center justify-center">
      <svg
        role="img"
        className={`animate-spin h-8 w-8 mb-2 drop-shadow-lg ${
          colorClassName || "text-blue-600 dark:text-blue-400"
        }`}
        fill="none"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-75"
          d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
          fill="currentColor"
        />
      </svg>
      {message && (
        <span className="text-sm text-blue-600 dark:text-blue-400 text-center font-medium mt-1">
          {message}
        </span>
      )}
    </div>
  );
};

export default Loading;
