// 새로운 형식의 영양소 파싱 (구체적인 형식 지정)
export function parseActualNutritionNew(result: string) {
  const actual: { [key: string]: number } = {};

  // "3. 영양소 분석:" 섹션 찾기
  const match = result.match(/3\. 영양소 분석:\s*\n([\s\S]+?)(?=\n4\.|$)/);
  if (match) {
    const lines = match[1].split("\n");
    for (const line of lines) {
      const m = line.match(/-\s*([^:]+):\s*([\d\.]+)([a-zA-Zㄱ-ㅎ가-힣㎍RE]*)/);
      if (m) {
        const label = m[1].trim();
        const value = parseFloat(m[2]);
        if (!isNaN(value)) {
          actual[label] = value;
        }
      }
    }
  }

  return actual;
}

// 새로운 형식의 부족/과잉 파싱
export function parseLackExcessNew(result: string) {
  let lack = "";
  let excess = "";

  // "5. 부족한 영양소:" 찾기
  const lackMatch = result.match(/5\. 부족한 영양소:\s*([^\n]+)/);
  if (lackMatch) {
    lack = lackMatch[1].trim();
    if (lack === "없음") lack = "";
  }

  // "6. 과잉된 영양소:" 찾기
  const excessMatch = result.match(/6\. 과잉된 영양소:\s*([^\n]+)/);
  if (excessMatch) {
    excess = excessMatch[1].trim();
    if (excess === "없음") excess = "";
  }

  return { lack, excess };
}

// 새로운 형식의 추천 식단 파싱
export function parseRecommendNew(result: string) {
  const match = result.match(/7\. 추천 식단:\s*([^\n]+)/);
  if (match) {
    const items = match[1]
      .split(",")
      .map((item) => item.trim())
      .map((item) => item.replace(/^\[|\]$/g, "")) // 대괄호 제거
      .filter(Boolean);
    return items;
  }
  return [];
}

// 분석 결과에서 실제 영양소 섭취량 파싱 (숫자만 추출)
export function parseActualNutrition(result: string) {
  const actual: { [key: string]: number } = {};

  // 새로운 형식 먼저 시도
  const newResult = parseActualNutritionNew(result);
  if (Object.keys(newResult).length > 0) {
    return newResult;
  }

  // 다양한 영양소 섹션 패턴 시도
  const patterns = [
    /3[.\)]?\s*전체 식사의 열량[^\n]*\n([\s\S]+?)\n\s*4[.\)]/,
    /3[.\)]?\s*열량 및 영양소 요약[^\n]*\n([\s\S]+?)\n\s*4[.\)]/,
    /3[.\)]?\s*전체 식사의 열량 및 주요 영양소[^\n]*\n([\s\S]+?)\n\s*4[.\)]/,
  ];

  let nutritionBlock = null;
  for (const pattern of patterns) {
    const match = result.match(pattern);
    if (match) {
      nutritionBlock = match[1];
      break;
    }
  }

  if (nutritionBlock) {
    const lines = nutritionBlock.split("\n");
    for (const line of lines) {
      // 다양한 영양소 형식 매칭
      const patterns = [
        /-\s*([^:]+):\s*약?\s*([\d\.]+)([a-zA-Zㄱ-ㅎ가-힣㎍RE]*)/,
        /([^:]+):\s*약?\s*([\d\.]+)([a-zA-Zㄱ-ㅎ가-힣㎍RE]*)/,
        /-\s*([^:]+):\s*([\d\.]+)([a-zA-Zㄱ-ㅎ가-힣㎍RE]*)/,
      ];

      for (const pattern of patterns) {
        const m = line.match(pattern);
        if (m) {
          const label = m[1].trim();
          const value = parseFloat(m[2]);
          if (!isNaN(value)) {
            actual[label] = value;
          }
          break;
        }
      }
    }
  }

  return actual;
}

// 부족/과잉 영양소 파싱 함수
export function parseLackExcess(result: string) {
  // 새로운 형식 먼저 시도
  const newResult = parseLackExcessNew(result);
  if (newResult.lack || newResult.excess) {
    return newResult;
  }

  let lack = "";
  let excess = "";

  // 다양한 형태의 부족/과잉 블록 패턴 시도
  const blockPatterns = [
    /5[.\)]?\s*부족한 영양소 및 과잉 항목:([\s\S]+?)(\n\s*6[.\)]|$)/,
    /5[.\)]?\s*부족하거나 과잉된 항목:([\s\S]+?)(\n\s*6[.\)]|$)/,
    /5[.\)]?\s*부족한 영양소나 과잉된 항목:([\s\S]+?)(\n\s*6[.\)]|$)/,
  ];

  let block = null;
  for (const pattern of blockPatterns) {
    const match = result.match(pattern);
    if (match) {
      block = match[1];
      break;
    }
  }

  if (block) {
    // 부족한 영양소 파싱
    const lackMatch = block.match(/-\s*부족한 영양소[:：]?\s*([^\n]+)/);
    if (lackMatch) {
      lack = lackMatch[1].trim();
    } else {
      // 다른 형태 시도
      const lackMatch2 = block.match(/-\s*부족[:：]?\s*([^\n]+)/);
      if (lackMatch2) lack = lackMatch2[1].trim();
    }

    // 과잉된 항목 파싱
    const excessMatch = block.match(/-\s*과잉된 항목[:：]?\s*([^\n]+)/);
    if (excessMatch) {
      excess = excessMatch[1].trim();
    } else {
      // 다른 형태 시도
      const excessMatch2 = block.match(/-\s*과잉[:：]?\s*([^\n]+)/);
      if (excessMatch2) excess = excessMatch2[1].trim();
    }
  } else {
    // 블록을 찾지 못한 경우 개별 패턴으로 시도
    const individualPatterns = [
      /5[.\)]?\s*부족한 영양소[:：]?\s*([^\n]+)/,
      /5[.\)]?\s*부족하거나 과잉된 항목[^\n]*\n[^\n]*-\s*부족한 영양소[:：]?\s*([^\n]+)/,
      /부족한 영양소[:：]?\s*([^\n]+)/,
    ];

    for (const pattern of individualPatterns) {
      const lackMatch = result.match(pattern);
      if (lackMatch) {
        lack = lackMatch[1].trim();
        break;
      }
    }

    const excessPatterns = [
      /5[.\)]?\s*과잉된 항목[:：]?\s*([^\n]+)/,
      /5[.\)]?\s*부족하거나 과잉된 항목[^\n]*\n[^\n]*-\s*과잉된 항목[:：]?\s*([^\n]+)/,
      /과잉된 항목[:：]?\s*([^\n]+)/,
    ];

    for (const pattern of excessPatterns) {
      const excessMatch = result.match(pattern);
      if (excessMatch) {
        excess = excessMatch[1].trim();
        break;
      }
    }
  }

  return { lack, excess };
}

// 추천 식단 파싱 함수
export function parseRecommend(result: string) {
  // 새로운 형식 먼저 시도
  const newResult = parseRecommendNew(result);
  if (newResult.length > 0) {
    return newResult;
  }

  // 다양한 추천 식단 패턴 시도
  const patterns = [
    {
      pattern: /7[.\)]?\s*내일 아침 추천 식단[^\n]*\n([\s\S]+?)(\n\s*$|$)/,
      groupIndex: 1,
    },
    {
      pattern: /7[.\)]?\s*내일 아침 추천 식단[^\n]*\n([\s\S]+)/,
      groupIndex: 1,
    },
    {
      pattern: /7[.\)]?\s*내일 아침 추천 식단[^\n]*:([\s\S]+)/,
      groupIndex: 1,
    },
    {
      pattern: /(추천 식단|내일 아침 추천 식단)[^\n]*\n([\s\S]+)/,
      groupIndex: 2,
    },
    {
      pattern: /(추천 식단|내일 아침 추천 식단)[^\n]*([\s\S]+)/,
      groupIndex: 2,
    },
  ];

  let block = null;
  for (const { pattern, groupIndex } of patterns) {
    const match = result.match(pattern);
    if (match) {
      block = match[groupIndex];
      break;
    }
  }

  if (block) {
    // - 또는 •로 시작하는 항목만 추출
    let items = block
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.startsWith("-") || line.startsWith("•"))
      .map((line) => line.replace(/^[-•]\s*/, "").replace(/^[-•]/, ""))
      .filter(Boolean);

    // 항목이 없으면 콤마로 구분된 형식 시도
    if (items.length === 0) {
      const commaSeparated = block.trim();
      if (commaSeparated && commaSeparated.includes(",")) {
        items = commaSeparated
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean);
      }
    }

    return items;
  }
  return [];
}
