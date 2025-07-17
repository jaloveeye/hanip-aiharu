// 분석 결과에서 실제 영양소 섭취량 파싱 (숫자만 추출)
export function parseActualNutrition(result: string) {
  const actual: { [key: string]: number } = {};
  const match = result.match(
    /3[.\)]?\s*전체 식사의 열량[^\n]*\n([\s\S]+?)\n\s*4[.\)]/
  );
  if (match) {
    const lines = match[1].split("\n");
    for (const line of lines) {
      const m = line.match(
        /-\s*([^:]+):\s*약?\s*([\d\.]+)([a-zA-Zㄱ-ㅎ가-힣㎍RE]*)/
      );
      if (m) {
        const label = m[1].trim();
        const value = parseFloat(m[2]);
        actual[label] = value;
      }
    }
  }
  return actual;
}

// 부족/과잉 영양소 파싱 함수
export function parseLackExcess(result: string) {
  let lack = "",
    excess = "";
  // 5. 부족한 영양소 및 과잉 항목 블록 파싱
  const block5 = result.match(
    /5[.\)]?\s*부족한 영양소 및 과잉 항목:([\s\S]+?)(\n\s*6[.\)]|$)/
  );
  if (block5) {
    const block = block5[1];
    const lackMatch = block.match(/-\s*부족[:：]?\s*([^\n]+)/);
    if (lackMatch) lack = lackMatch[1].trim();
    const excessMatch = block.match(/-\s*과잉[:：]?\s*([^\n]+)/);
    if (excessMatch) excess = excessMatch[1].trim();
  } else {
    const lackMatch = result.match(/부족한 영양소[:：]?\s*([^\n]+)/);
    if (lackMatch) lack = lackMatch[1].trim();
    const excessMatch = result.match(/과잉된 항목[:：]?\s*([^\n]+)/);
    if (excessMatch) excess = excessMatch[1].trim();
  }
  return { lack, excess };
}

// 추천 식단 파싱 함수
export function parseRecommend(result: string) {
  // 7. 내일 아침 추천 식단 또는 추천 식단 블록 추출
  const match = result.match(
    /(추천 식단|내일 아침 추천 식단)[^\n]*\n([\s\S]+)/
  );
  if (match) {
    const block = match[2];
    // - 또는 •로 시작하는 항목만 추출
    const items = block
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.startsWith("-") || line.startsWith("•"))
      .map((line) => line.replace(/^[-•]\s*/, "").replace(/^[-•]/, ""))
      .filter(Boolean);
    return items;
  }
  return [];
}
