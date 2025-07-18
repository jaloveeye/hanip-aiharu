import { render, screen, fireEvent } from "@testing-library/react";
import NutritionModal from "../NutritionModal";

describe("NutritionModal", () => {
  const defaultProps = {
    isOpen: true,
    onClose: jest.fn(),
    nutrient: "단백질",
    content:
      "단백질은 아이의 근육과 뼈를 튼튼하게 만들어주는 영양소예요.\n\n주요 음식: 달걀, 닭고기\n\n팁: 달걀 1개나 생선 한 토막으로 충분해요!",
  };

  it("모달이 열려있을 때 렌더링되어야 한다", () => {
    render(<NutritionModal {...defaultProps} />);

    expect(screen.getByText("단백질 정보")).toBeInTheDocument();
    expect(
      screen.getByText(
        /단백질은 아이의 근육과 뼈를 튼튼하게 만들어주는 영양소예요/
      )
    ).toBeInTheDocument();
    expect(screen.getByText(/주요 음식: 달걀, 닭고기/)).toBeInTheDocument();
    expect(
      screen.getByText(/팁: 달걀 1개나 생선 한 토막으로 충분해요/)
    ).toBeInTheDocument();
  });

  it("모달이 닫혀있을 때 렌더링되지 않아야 한다", () => {
    render(<NutritionModal {...defaultProps} isOpen={false} />);

    expect(screen.queryByText("단백질 정보")).not.toBeInTheDocument();
  });

  it("확인 버튼을 클릭하면 onClose가 호출되어야 한다", () => {
    const onClose = jest.fn();
    render(<NutritionModal {...defaultProps} onClose={onClose} />);

    const closeButton = screen.getByRole("button", { name: /확인/i });
    fireEvent.click(closeButton);

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("X 버튼을 클릭하면 onClose가 호출되어야 한다", () => {
    const onClose = jest.fn();
    render(<NutritionModal {...defaultProps} onClose={onClose} />);

    // 모든 버튼을 찾아서 첫 번째 버튼(X 버튼)을 클릭
    const buttons = screen.getAllByRole("button");
    fireEvent.click(buttons[0]);

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("다양한 영양소 정보를 표시해야 한다", () => {
    const props = {
      ...defaultProps,
      nutrient: "비타민 C",
      content:
        "비타민 C는 아이의 면역력을 높이고 상처 치유를 돕는 비타민이에요.\n\n주요 음식: 오렌지, 키위\n\n팁: 신선한 과일 하나로 충분해요",
    };

    render(<NutritionModal {...props} />);

    expect(screen.getByText("비타민 C 정보")).toBeInTheDocument();
    expect(
      screen.getByText(
        /비타민 C는 아이의 면역력을 높이고 상처 치유를 돕는 비타민이에요/
      )
    ).toBeInTheDocument();
    expect(screen.getByText(/주요 음식: 오렌지, 키위/)).toBeInTheDocument();
  });

  it("줄바꿈이 포함된 내용을 올바르게 표시해야 한다", () => {
    const props = {
      ...defaultProps,
      content: "첫 번째 줄\n두 번째 줄\n세 번째 줄",
    };

    render(<NutritionModal {...props} />);

    expect(screen.getByText(/첫 번째 줄/)).toBeInTheDocument();
    expect(screen.getByText(/두 번째 줄/)).toBeInTheDocument();
    expect(screen.getByText(/세 번째 줄/)).toBeInTheDocument();
  });

  it("확인 버튼이 있어야 한다", () => {
    render(<NutritionModal {...defaultProps} />);

    expect(screen.getByRole("button", { name: /확인/i })).toBeInTheDocument();
  });
});
