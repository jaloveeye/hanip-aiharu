"use client";

import { useState } from "react";

interface TooltipProps {
  children: React.ReactNode;
  content: string;
  position?: "top" | "bottom" | "left" | "right";
  className?: string;
  forcePosition?: "top" | "bottom" | "left" | "right";
}

export default function Tooltip({
  children,
  content,
  position = "top",
  className = "",
  forcePosition,
}: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState(position);

  const positionClasses = {
    top: "bottom-full left-1/2 transform -translate-x-1/2 mb-2",
    bottom: "top-full left-1/2 transform -translate-x-1/2 mt-2",
    left: "right-full top-1/2 transform -translate-y-1/2 mr-2",
    right: "left-full top-1/2 transform -translate-y-1/2 ml-2",
  };

  const actualPosition = forcePosition || tooltipPosition;

  const handleMouseEnter = () => {
    setIsVisible(true);
    // 툴팁이 화면을 벗어나는지 확인하고 위치 조정
    setTimeout(() => {
      const tooltipElement = document.querySelector(
        "[data-tooltip]"
      ) as HTMLElement;
      if (tooltipElement) {
        const rect = tooltipElement.getBoundingClientRect();
        const viewportWidth = window.innerWidth;

        if (rect.left < 0) {
          // 왼쪽으로 벗어나면 오른쪽으로 이동
          setTooltipPosition("right");
        } else if (rect.right > viewportWidth) {
          // 오른쪽으로 벗어나면 왼쪽으로 이동
          setTooltipPosition("left");
        } else {
          setTooltipPosition(position);
        }
      }
    }, 0);
  };

  return (
    <div
      className={`relative inline-block ${className}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}
      {isVisible && (
        <div
          data-tooltip
          className={`absolute z-50 px-5 py-4 text-sm text-gray-800 bg-white border border-gray-200 rounded-xl shadow-2xl min-w-[300px] max-w-lg ${positionClasses[actualPosition]}`}
        >
          <div className="whitespace-pre-line leading-relaxed">{content}</div>
          <div
            className={`absolute w-2 h-2 bg-white border-l border-t border-gray-200 transform rotate-45 ${
              actualPosition === "top"
                ? "top-full left-1/2 -translate-x-1/2 -mt-1"
                : actualPosition === "bottom"
                ? "bottom-full left-1/2 -translate-x-1/2 -mb-1"
                : actualPosition === "left"
                ? "left-full top-1/2 -translate-y-1/2 -ml-1"
                : "right-full top-1/2 -translate-y-1/2 -mr-1"
            }`}
          />
        </div>
      )}
    </div>
  );
}
