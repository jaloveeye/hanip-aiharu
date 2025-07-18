import {
  getNutritionTooltip,
  getRandomPositiveFeedback,
  getAlternativeFoods,
  NUTRITION_GUIDE,
  POSITIVE_FEEDBACKS,
  ALTERNATIVE_FOODS,
  DAD_GUIDE_MESSAGES,
  FAQ_ITEMS,
} from "../dadGuide";

describe("dadGuide", () => {
  describe("getNutritionTooltip", () => {
    it("존재하는 영양소에 대한 툴팁을 반환해야 한다", () => {
      const tooltip = getNutritionTooltip("단백질");

      expect(tooltip).toContain(
        "아이의 근육과 뼈를 튼튼하게 만들어주는 영양소예요"
      );
      expect(tooltip).toContain("주요 음식: 달걀, 닭고기");
      expect(tooltip).toContain("팁: 달걀 1개나 생선 한 토막으로 충분해요!");
    });

    it("존재하지 않는 영양소에 대해 기본 메시지를 반환해야 한다", () => {
      const tooltip = getNutritionTooltip("존재하지않는영양소");

      expect(tooltip).toBe("존재하지않는영양소에 대한 정보입니다.");
    });

    it("다양한 영양소에 대한 툴팁을 반환해야 한다", () => {
      const vitaminCTooltip = getNutritionTooltip("비타민 C");

      expect(vitaminCTooltip).toContain(
        "아이의 면역력을 높이고 상처 치유를 돕는 비타민이에요"
      );
      expect(vitaminCTooltip).toContain("주요 음식: 오렌지, 키위");
    });
  });

  describe("getRandomPositiveFeedback", () => {
    it("긍정적 피드백을 반환해야 한다", () => {
      const feedback = getRandomPositiveFeedback();

      expect(feedback).toHaveProperty("message");
      expect(feedback).toHaveProperty("emoji");
      expect(feedback).toHaveProperty("category");
      expect(["growth", "nutrition", "effort"]).toContain(feedback.category);
    });

    it("여러 번 호출해도 유효한 피드백을 반환해야 한다", () => {
      const feedbacks = [];
      for (let i = 0; i < 10; i++) {
        feedbacks.push(getRandomPositiveFeedback());
      }

      feedbacks.forEach((feedback) => {
        expect(feedback).toHaveProperty("message");
        expect(feedback).toHaveProperty("emoji");
        expect(feedback).toHaveProperty("category");
      });
    });
  });

  describe("getAlternativeFoods", () => {
    it("부족한 영양소에 대한 대체 음식을 반환해야 한다", () => {
      const alternatives = getAlternativeFoods(["단백질", "칼슘"]);

      expect(alternatives).toHaveProperty("단백질");
      expect(alternatives).toHaveProperty("칼슘");
      expect(alternatives.단백질).toContain("달걀 1개");
      expect(alternatives.칼슘).toContain("우유 한 잔");
    });

    it("존재하지 않는 영양소는 무시해야 한다", () => {
      const alternatives = getAlternativeFoods([
        "단백질",
        "존재하지않는영양소",
      ]);

      expect(alternatives).toHaveProperty("단백질");
      expect(alternatives).not.toHaveProperty("존재하지않는영양소");
    });

    it("빈 배열에 대해 빈 객체를 반환해야 한다", () => {
      const alternatives = getAlternativeFoods([]);

      expect(alternatives).toEqual({});
    });
  });

  describe("NUTRITION_GUIDE", () => {
    it("모든 영양소 정보가 올바른 구조를 가져야 한다", () => {
      Object.values(NUTRITION_GUIDE).forEach((info) => {
        expect(info).toHaveProperty("name");
        expect(info).toHaveProperty("description");
        expect(info).toHaveProperty("importance");
        expect(info).toHaveProperty("foodSources");
        expect(info).toHaveProperty("dailyTip");
        expect(Array.isArray(info.foodSources)).toBe(true);
      });
    });

    it("주요 영양소들이 포함되어야 한다", () => {
      const expectedNutrients = ["단백질", "지방", "탄수화물", "칼슘", "철분"];

      expectedNutrients.forEach((nutrient) => {
        expect(NUTRITION_GUIDE).toHaveProperty(nutrient);
      });
    });
  });

  describe("POSITIVE_FEEDBACKS", () => {
    it("모든 피드백이 올바른 구조를 가져야 한다", () => {
      POSITIVE_FEEDBACKS.forEach((feedback) => {
        expect(feedback).toHaveProperty("message");
        expect(feedback).toHaveProperty("emoji");
        expect(feedback).toHaveProperty("category");
        expect(["growth", "nutrition", "effort"]).toContain(feedback.category);
      });
    });

    it("최소 하나의 피드백이 있어야 한다", () => {
      expect(POSITIVE_FEEDBACKS.length).toBeGreaterThan(0);
    });
  });

  describe("ALTERNATIVE_FOODS", () => {
    it("모든 영양소에 대한 대체 음식이 있어야 한다", () => {
      const nutrients = ["단백질", "지방", "탄수화물", "칼슘", "철분"];

      nutrients.forEach((nutrient) => {
        expect(ALTERNATIVE_FOODS).toHaveProperty(nutrient);
        expect(Array.isArray(ALTERNATIVE_FOODS[nutrient])).toBe(true);
        expect(ALTERNATIVE_FOODS[nutrient].length).toBeGreaterThan(0);
      });
    });
  });

  describe("DAD_GUIDE_MESSAGES", () => {
    it("모든 메시지가 있어야 한다", () => {
      const expectedKeys = [
        "welcome",
        "nutrition_balance",
        "small_steps",
        "encouragement",
        "tips",
      ];

      expectedKeys.forEach((key) => {
        expect(DAD_GUIDE_MESSAGES).toHaveProperty(key);
        expect(
          typeof DAD_GUIDE_MESSAGES[key as keyof typeof DAD_GUIDE_MESSAGES]
        ).toBe("string");
        expect(
          DAD_GUIDE_MESSAGES[key as keyof typeof DAD_GUIDE_MESSAGES].length
        ).toBeGreaterThan(0);
      });
    });
  });

  describe("FAQ_ITEMS", () => {
    it("모든 FAQ 항목이 올바른 구조를 가져야 한다", () => {
      FAQ_ITEMS.forEach((item) => {
        expect(item).toHaveProperty("question");
        expect(item).toHaveProperty("answer");
        expect(typeof item.question).toBe("string");
        expect(typeof item.answer).toBe("string");
        expect(item.question.length).toBeGreaterThan(0);
        expect(item.answer.length).toBeGreaterThan(0);
      });
    });

    it("최소 하나의 FAQ가 있어야 한다", () => {
      expect(FAQ_ITEMS.length).toBeGreaterThan(0);
    });
  });
});
