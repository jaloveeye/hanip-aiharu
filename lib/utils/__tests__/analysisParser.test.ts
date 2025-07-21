import {
  parseActualNutrition,
  parseLackExcess,
  parseRecommend,
} from "../analysisParser";

describe("analysisParser", () => {
  describe("parseActualNutrition", () => {
    it("정상적인 영양소 데이터를 파싱해야 한다", () => {
      const result = `
3. 전체 식사의 열량 및 영양소 분석
- 열량: 약 567kcal
- 단백질: 약 25.3g
- 지방: 약 18.7g
- 탄수화물: 약 78.2g
- 식이섬유: 약 8.5g
- 칼슘: 약 320mg
- 철분: 약 4.2mg
- 비타민 A: 약 450㎍RE
- 비타민 C: 약 35mg
- 비타민 D: 약 2.1㎍
- 나트륨: 약 850mg

4. 영양소 평가
`;

      const actual = parseActualNutrition(result);

      expect(actual).toEqual({
        열량: 567,
        단백질: 25.3,
        지방: 18.7,
        탄수화물: 78.2,
        식이섬유: 8.5,
        칼슘: 320,
        철분: 4.2,
        "비타민 A": 450,
        "비타민 C": 35,
        "비타민 D": 2.1,
        나트륨: 850,
      });
    });

    it("빈 결과에 대해 빈 객체를 반환해야 한다", () => {
      const result = "분석 결과가 없습니다.";
      const actual = parseActualNutrition(result);
      expect(actual).toEqual({});
    });

    it("일부 영양소만 있는 경우에도 파싱해야 한다", () => {
      const result = `
3. 전체 식사의 열량 및 영양소 분석
- 열량: 약 400kcal
- 단백질: 약 15g

4. 영양소 평가
`;

      const actual = parseActualNutrition(result);

      expect(actual).toEqual({
        열량: 400,
        단백질: 15,
      });
    });

    it("다양한 단위를 처리해야 한다", () => {
      const result = `
3. 전체 식사의 열량 및 영양소 분석
- 열량: 567kcal
- 단백질: 25.3g
- 비타민 A: 450㎍RE
- 비타민 D: 2.1㎍

4. 영양소 평가
`;

      const actual = parseActualNutrition(result);

      expect(actual).toEqual({
        열량: 567,
        단백질: 25.3,
        "비타민 A": 450,
        "비타민 D": 2.1,
      });
    });
  });

  describe("parseLackExcess", () => {
    it("부족한 영양소와 과잉 항목을 파싱해야 한다", () => {
      const result = `
5. 부족한 영양소 및 과잉 항목:
- 부족한 영양소: 철분, 비타민 D
- 과잉된 항목: 나트륨

6. 개선 방안
`;

      const { lack, excess } = parseLackExcess(result);

      expect(lack).toBe("철분, 비타민 D");
      expect(excess).toBe("나트륨");
    });

    it("다른 형태의 부족/과잉 블록을 파싱해야 한다", () => {
      const result = `
5. 부족하거나 과잉된 항목:
- 부족: 칼슘, 비타민 C
- 과잉: 지방

6. 개선 방안
`;

      const { lack, excess } = parseLackExcess(result);

      expect(lack).toBe("칼슘, 비타민 C");
      expect(excess).toBe("지방");
    });

    it("개별 패턴으로도 파싱해야 한다", () => {
      const result = `
분석 결과입니다.
부족한 영양소: 철분, 비타민 D
과잉된 항목: 나트륨
추천 식단입니다.
`;

      const { lack, excess } = parseLackExcess(result);

      expect(lack).toBe("철분, 비타민 D");
      expect(excess).toBe("나트륨");
    });

    it("부족/과잉 정보가 없으면 빈 문자열을 반환해야 한다", () => {
      const result = "분석 결과가 없습니다.";
      const { lack, excess } = parseLackExcess(result);

      expect(lack).toBe("");
      expect(excess).toBe("");
    });
  });

  describe("parseRecommend", () => {
    it("추천 식단을 파싱해야 한다", () => {
      const result = `
7. 내일 아침 추천 식단
- 현미밥 1공기
- 된장국 1그릇
- 구운 연어 1토막
- 시금치 나물 반 그릇
- 김치 반 그릇
`;

      const recommend = parseRecommend(result);

      expect(recommend).toEqual([
        "현미밥 1공기",
        "된장국 1그릇",
        "구운 연어 1토막",
        "시금치 나물 반 그릇",
        "김치 반 그릇",
      ]);
    });

    it("다른 형태의 추천 식단도 파싱해야 한다", () => {
      const result = `
추천 식단
• 현미밥 1공기
• 된장국 1그릇
• 구운 연어 1토막
`;

      const recommend = parseRecommend(result);

      expect(recommend).toEqual([
        "현미밥 1공기",
        "된장국 1그릇",
        "구운 연어 1토막",
      ]);
    });

    it("추천 식단이 없으면 빈 배열을 반환해야 한다", () => {
      const result = "분석 결과가 없습니다.";
      const recommend = parseRecommend(result);

      expect(recommend).toEqual([]);
    });

    it("추천 식단 블록이 있지만 항목이 없으면 빈 배열을 반환해야 한다", () => {
      const result = `
추천 식단
추천할 식단이 없습니다.
`;

      const recommend = parseRecommend(result);

      expect(recommend).toEqual([]);
    });
  });

  describe("실제 데이터 파싱", () => {
    it("7월 21일 실제 데이터를 파싱해야 한다", () => {
      const result = `1. 식재료 및 음식명: 바나나, 당근, 닭가슴살, 우유, 견과류 믹스(아몬드, 캐슈넛, 호두, 건조 베리 등), 작은 과자
2. 섭취량: 바나나 1개, 당근 3~4조각, 닭가슴살 1조각, 우유 반 컵, 견과류 믹스 한 줌, 작은 과자 2개
3. 열량 및 영양소 요약:
   - 열량: 약 300~350kcal
   - 탄수화물: 약 45g
   - 단백질: 약 15g
   - 지방: 약 10g
   - 식이섬유: 약 5g
   - 칼슘: 약 150mg
   - 철분: 약 2mg
   - 비타민 A: 약 200μg
   - 비타민 C: 약 10mg
   - 비타민 D: 약 1μg
   - 나트륨: 약 200mg
4. 1일 권장 섭취량 대비(%):
   - 열량: 20%
   - 탄수화물: 30%
   - 단백질: 25%
   - 지방: 15%
   - 식이섬유: 25%
   - 칼슘: 20%
   - 철분: 20%
   - 비타민 A: 25%
   - 비타민 C: 25%
   - 비타민 D: 10%
   - 나트륨: 15%
5. 부족한 영양소: 비타민 D
6. 식단의 장점: 다양한 식재료 포함으로 균형 잡힌 영양 제공, 식이섬유 및 비타민 C 풍부
   개선이 필요한 점: 비타민 D가 부족하므로 이를 보충할 필요 있음
7. 내일 아침 추천 식단: 오트밀(우유와 섞어 조리), 삶은 계란 1개, 오렌지 주스 한 잔, 비타민 D 강화 시리얼 한 컵, 블루베리 약간`;

      const actual = parseActualNutrition(result);
      const { lack, excess } = parseLackExcess(result);
      const recommend = parseRecommend(result);

      // 영양소 파싱 확인
      expect(actual["열량"]).toBe(300);
      expect(actual["탄수화물"]).toBe(45);
      expect(actual["단백질"]).toBe(15);
      expect(actual["지방"]).toBe(10);

      // 부족/과잉 파싱 확인
      expect(lack).toBe("비타민 D");
      expect(excess).toBe("");

      // 추천 식단 파싱 확인
      expect(recommend).toEqual([
        "오트밀(우유와 섞어 조리)",
        "삶은 계란 1개",
        "오렌지 주스 한 잔",
        "비타민 D 강화 시리얼 한 컵",
        "블루베리 약간",
      ]);
    });
  });
});
