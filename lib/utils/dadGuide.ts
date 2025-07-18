// 아빠를 위한 맞춤형 안내 메시지와 영양소 정보

export interface NutritionInfo {
  name: string;
  description: string;
  importance: string;
  foodSources: string[];
  dailyTip: string;
}

export interface PositiveFeedback {
  message: string;
  emoji: string;
  category: "growth" | "nutrition" | "effort";
}

// 영양소별 상세 정보 (아빠가 이해하기 쉽게 설명)
export const NUTRITION_GUIDE: Record<string, NutritionInfo> = {
  단백질: {
    name: "단백질",
    description: "아이의 근육과 뼈를 튼튼하게 만들어주는 영양소예요",
    importance: "성장기 아이에게 가장 중요한 영양소 중 하나입니다",
    foodSources: ["달걀", "닭고기", "생선", "두부", "콩", "우유"],
    dailyTip: "달걀 1개나 생선 한 토막으로 충분해요!",
  },
  지방: {
    name: "지방",
    description: "아이의 뇌 발달과 에너지 공급에 필요한 영양소예요",
    importance: "뇌의 60%는 지방으로 구성되어 있어요",
    foodSources: ["견과류", "아보카도", "올리브오일", "연어", "계란 노른자"],
    dailyTip: "견과류 한 줌이나 올리브오일 한 스푼으로 충분해요",
  },
  탄수화물: {
    name: "탄수화물",
    description: "아이의 활동 에너지를 공급하는 주요 영양소예요",
    importance: "뇌와 근육의 주요 에너지원입니다",
    foodSources: ["쌀", "빵", "감자", "고구마", "과일", "채소"],
    dailyTip: "현미나 잡곡밥이 더 좋아요",
  },
  칼슘: {
    name: "칼슘",
    description: "아이의 뼈와 치아를 튼튼하게 만들어주는 미네랄이에요",
    importance: "성장기 아이의 뼈 발달에 필수적입니다",
    foodSources: ["우유", "요거트", "치즈", "두부", "멸치", "브로콜리"],
    dailyTip: "우유 한 잔으로 하루 칼슘의 1/3을 섭취할 수 있어요",
  },
  철분: {
    name: "철분",
    description: "아이의 혈액을 만들고 산소를 운반하는 미네랄이에요",
    importance: "빈혈 예방과 두뇌 발달에 중요합니다",
    foodSources: ["붉은 고기", "시금치", "콩", "견과류", "달걀 노른자"],
    dailyTip: "비타민C와 함께 먹으면 흡수가 더 잘 돼요",
  },
  "비타민 A": {
    name: "비타민 A",
    description: "아이의 시력과 면역력을 키워주는 비타민이에요",
    importance: "눈 건강과 감염 예방에 필수적입니다",
    foodSources: ["당근", "고구마", "시금치", "브로콜리", "달걀 노른자"],
    dailyTip: "당근 한 개나 고구마 반 개로 충분해요",
  },
  "비타민 C": {
    name: "비타민 C",
    description: "아이의 면역력을 높이고 상처 치유를 돕는 비타민이에요",
    importance: "감기 예방과 콜라겐 생성에 중요합니다",
    foodSources: ["오렌지", "키위", "딸기", "브로콜리", "피망", "토마토"],
    dailyTip: "신선한 과일 하나로 충분해요",
  },
  "비타민 D": {
    name: "비타민 D",
    description: "아이의 뼈 건강과 면역력을 돕는 '햇빛 비타민'이에요",
    importance: "칼슘 흡수를 돕고 면역력 강화에 중요합니다",
    foodSources: ["연어", "고등어", "달걀 노른자", "우유", "버섯"],
    dailyTip: "하루 10-15분 햇빛 쬐기로 충분해요",
  },
  식이섬유: {
    name: "식이섬유",
    description: "아이의 소화를 돕고 배변을 원활하게 하는 영양소예요",
    importance: "장 건강과 변비 예방에 중요합니다",
    foodSources: ["현미", "채소", "과일", "콩", "견과류", "고구마"],
    dailyTip: "채소 한 접시나 과일 하나로 충분해요",
  },
};

// 긍정적 피드백 메시지
export const POSITIVE_FEEDBACKS: PositiveFeedback[] = [
  {
    message: "아이의 건강한 성장을 위해 노력하는 멋진 아빠예요! 🌟",
    emoji: "🌟",
    category: "effort",
  },
  {
    message: "영양소를 고려한 식단은 아이의 미래를 밝게 만들어요! ✨",
    emoji: "✨",
    category: "nutrition",
  },
  {
    message: "아이의 성장을 지켜보는 것만으로도 큰 의미가 있어요! 🌱",
    emoji: "🌱",
    category: "growth",
  },
  {
    message: "하루 한 끼씩 차근차근, 아이가 건강하게 자라나고 있어요! 💪",
    emoji: "💪",
    category: "growth",
  },
  {
    message: "영양 균형을 생각하는 아빠의 마음이 아이에게 전해져요! ❤️",
    emoji: "❤️",
    category: "nutrition",
  },
  {
    message: "아이의 건강한 식습관을 만들어가는 멋진 여정이에요! 🎯",
    emoji: "🎯",
    category: "effort",
  },
];

// 아빠를 위한 친절한 안내 메시지
export const DAD_GUIDE_MESSAGES = {
  welcome: "아이의 건강한 성장을 함께 만들어가는 멋진 아빠예요! 😊",
  nutrition_balance: "영양 균형은 하루아침에 되는 게 아니라 꾸준함이 중요해요",
  small_steps: "작은 변화부터 시작해서 아이와 함께 성장해보세요",
  encouragement: "아이의 건강한 미래를 위해 노력하는 당신이 자랑스러워요!",
  tips: "영양소 설명에 마우스를 올려보시면 더 자세한 정보를 볼 수 있어요",
};

// 대체 음식 제안 (부족한 영양소별)
export const ALTERNATIVE_FOODS: Record<string, string[]> = {
  단백질: ["달걀 1개", "두부 반 모", "생선 한 토막", "닭가슴살 50g"],
  지방: ["견과류 한 줌", "아보카도 1/4개", "올리브오일 1스푼"],
  탄수화물: ["현미밥 한 공기", "고구마 반 개", "바나나 1개"],
  칼슘: ["우유 한 잔", "요거트 한 컵", "치즈 한 조각"],
  철분: ["시금치 한 접시", "붉은 고기 50g", "콩 한 컵"],
  "비타민 A": ["당근 한 개", "고구마 반 개", "브로콜리 한 접시"],
  "비타민 C": ["오렌지 1개", "키위 1개", "딸기 10개"],
  "비타민 D": ["연어 한 토막", "달걀 2개", "햇빛 10분"],
  식이섬유: ["현미밥 한 공기", "채소 한 접시", "과일 1개"],
};

// FAQ (자주 묻는 질문)
export const FAQ_ITEMS = [
  {
    question: "아이가 채소를 싫어해요. 어떻게 해야 할까요?",
    answer:
      "처음에는 작은 양부터 시작해서 점진적으로 늘려보세요. 채소를 예쁘게 썰어서 모양을 만들어주거나, 아이가 좋아하는 음식과 함께 섞어서 먹여보세요. 강요하지 말고 긍정적으로 격려해주세요!",
  },
  {
    question: "영양소가 부족하다고 나오는데 걱정해야 할까요?",
    answer:
      "하루 한 끼만으로는 부족할 수 있어요. 점심, 저녁 식사에서 보충하면 되니까 너무 걱정하지 마세요. 꾸준히 영양을 고려한 식단을 만들어주시면 됩니다!",
  },
  {
    question: "아이가 편식이 심해요. 어떻게 해야 할까요?",
    answer:
      "아이는 새로운 음식을 여러 번 접해야 익숙해져요. 같은 음식을 다양한 방법으로 조리해보고, 아이와 함께 요리하는 것도 좋은 방법이에요. 인내심을 가지고 천천히 도전해보세요!",
  },
  {
    question: "영양소 설명이 어려워요. 쉽게 이해할 수 있는 방법이 있나요?",
    answer:
      "각 영양소에 마우스를 올려보시면 아빠가 이해하기 쉽게 설명해드려요! 복잡한 수치보다는 '아이의 뼈를 튼튼하게 해준다' 같은 실용적인 설명을 드릴게요.",
  },
  {
    question: "아이가 음식을 잘 안 먹어요. 어떻게 해야 할까요?",
    answer:
      "아이의 식욕은 날마다 달라질 수 있어요. 강요하지 말고, 아이가 배고플 때 자연스럽게 먹도록 해주세요. 식사 시간을 규칙적으로 만들고, 아이와 함께 식사하는 분위기를 만들어보세요!",
  },
];

// 영양소별 툴팁 메시지 생성
export function getNutritionTooltip(nutritionName: string): string {
  const info = NUTRITION_GUIDE[nutritionName];
  if (!info) return `${nutritionName}에 대한 정보입니다.`;

  return `${info.description}\n\n주요 음식: ${info.foodSources
    .slice(0, 2)
    .join(", ")}\n\n팁: ${info.dailyTip}`;
}

// 랜덤 긍정적 피드백 선택
export function getRandomPositiveFeedback(): PositiveFeedback {
  return POSITIVE_FEEDBACKS[
    Math.floor(Math.random() * POSITIVE_FEEDBACKS.length)
  ];
}

// 부족한 영양소에 대한 대체 음식 제안
export function getAlternativeFoods(
  lackNutrients: string[]
): Record<string, string[]> {
  const alternatives: Record<string, string[]> = {};

  lackNutrients.forEach((nutrient) => {
    const foods = ALTERNATIVE_FOODS[nutrient];
    if (foods) {
      alternatives[nutrient] = foods;
    }
  });

  return alternatives;
}
