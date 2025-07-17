import { useState } from "react";

interface UseAnalyzeMealProps {
  showPopup: (msg: string) => void;
  router: { push: (path: string) => void };
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!file) {
      console.warn("[DEBUG] fileToBase64: file is null or undefined");
      resolve("");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const base64 = result.split(",")[1] || "";
      console.log(
        "[DEBUG] fileToBase64 result length:",
        base64.length,
        base64.slice(0, 30)
      );
      resolve(base64);
    };
    reader.onerror = (e) => {
      console.error("[DEBUG] fileToBase64 error", e);
      reject(e);
    };
    reader.readAsDataURL(file);
  });
}

export default function useAnalyzeMeal({
  showPopup,
  router,
}: UseAnalyzeMealProps) {
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
    if (!image && !input.trim()) {
      showPopup("식단 텍스트 또는 이미지를 입력해 주세요.");
      return;
    }
    setAnalyzing(true);
    setResult(null);
    try {
      let imageBase64;
      if (image) {
        imageBase64 = await fileToBase64(image);
        console.log(
          "[DEBUG] handleAnalyze imageBase64 length:",
          imageBase64?.length,
          imageBase64?.slice(0, 30)
        );
      }
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          meal: image ? "" : input.trim(),
          imageBase64,
        }),
      });
      const data = await res.json();
      if (data.duplicate) {
        showPopup(data.message || "이미 분석된 식단입니다.");
        return;
      }
      // 분석 성공 시 결과 페이지로 이동
      router.push("/meal/analysis");
    } catch {
      showPopup("분석 요청 중 오류가 발생했습니다.");
    } finally {
      setAnalyzing(false);
    }
  };

  return { input, setInput, result, setResult, analyzing, handleAnalyze };
}
