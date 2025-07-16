import React, { useEffect } from "react";

interface PopupProps {
  open: boolean;
  message: string;
  onClose: () => void;
  type?: "info" | "error" | "success" | "warning";
  autoCloseMs?: number;
}

const TYPE_STYLES: Record<string, string> = {
  info: "bg-blue-500",
  error: "bg-red-500",
  success: "bg-green-500",
  warning: "bg-yellow-500 text-gray-900",
};

const Popup: React.FC<PopupProps> = ({
  open,
  message,
  onClose,
  type = "info",
  autoCloseMs,
}) => {
  useEffect(() => {
    if (open && autoCloseMs) {
      const timer = setTimeout(onClose, autoCloseMs);
      return () => clearTimeout(timer);
    }
  }, [open, autoCloseMs, onClose]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6 min-w-[260px] max-w-xs flex flex-col items-center">
        <div className="text-base text-gray-800 dark:text-gray-100 mb-4 text-center whitespace-pre-line">
          {message}
        </div>
        <button
          className={`mt-2 px-4 py-2 rounded text-white font-semibold focus:outline-none ${TYPE_STYLES[type]}`}
          onClick={onClose}
        >
          닫기
        </button>
      </div>
    </div>
  );
};

export default Popup;
