import { useState } from "react";
import { NUTRITION_COLOR_MAP } from "@/lib/utils";

interface UseAnalyzeMealProps {
  showPopup: (msg: string) => void;
}

export default function useAnalyzeMeal({ showPopup }: UseAnalyzeMealProps) {
  const [input, setInput] = useState("");
  const [result, setResult] = useState<null | {
    meal: string;
    nutrition: {
      label: string;
      value: number;
      unit?: string;
      color?: string;
    }[];
    lack: string[];
    recommend: string[];
  }>(null);
  const [analyzing, setAnalyzing] = useState(false);

  const handleAnalyze = async (image?: File | null) => {
    setAnalyzing(true);
    setResult(null);
    try {
      const formData = new FormData();
      if (input.trim()) formData.append("text", input.trim());
      if (image) formData.append("image", image);
      const res = await fetch("/api/analyze", {
        method: "POST",
        body: formData,
        credentials: "include",
      });
      const data = await res.json();
      if (data.duplicate) {
        showPopup(data.message || "이미 분석된 식단입니다.");
        return;
      }
      setResult({
        ...data,
        nutrition: (
          data.nutrition as { label: string; value: number; unit?: string }[]
        ).map((n) => ({ ...n, color: NUTRITION_COLOR_MAP[n.label] ?? "#ddd" })),
      });
    } catch {
      showPopup("분석 중 오류가 발생했습니다.");
    } finally {
      setAnalyzing(false);
    }
  };

  return { input, setInput, result, setResult, analyzing, handleAnalyze };
}
