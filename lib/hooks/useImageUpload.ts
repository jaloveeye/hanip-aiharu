import { useState } from "react";

interface AnalyzeResult {
  meal: string;
  nutrition: { label: string; value: number; unit?: string; color?: string }[];
  lack: string[];
  recommend: string[];
}

interface UseImageUploadProps {
  setResult: (r: AnalyzeResult | null) => void;
}

export default function useImageUpload({ setResult }: UseImageUploadProps) {
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setImage(file);
    setResult(null);
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => setImagePreview(ev.target?.result as string);
      reader.readAsDataURL(file);
    } else {
      setImagePreview(null);
    }
  };

  return { image, setImage, imagePreview, handleImageChange };
}
