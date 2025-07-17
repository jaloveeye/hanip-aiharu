// 영양소별 색상 매핑 등 모든 주석 삭제
export const NUTRITION_COLOR_MAP: Record<string, string> = {
  탄수화물: "#60a5fa",
  단백질: "#34d399",
  지방: "#fbbf24",
  섬유질: "#a78bfa",
};

// 오늘 날짜(YYYY-MM-DD) 반환
export function getTodayString() {
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, "0");
  const dd = String(today.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}
