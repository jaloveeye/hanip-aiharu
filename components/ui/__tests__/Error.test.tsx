import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import Error from "../Error";
import "@testing-library/jest-dom";

describe("Error 컴포넌트", () => {
  it("에러 메시지가 정상적으로 렌더링된다", () => {
    render(<Error message="에러 발생!" />);
    expect(screen.getByText("에러 발생!")).toBeInTheDocument();
  });

  it("onRetry prop이 있을 때 버튼이 렌더링되고 클릭 시 핸들러가 호출된다", () => {
    const onRetry = jest.fn();
    render(<Error message="에러 발생!" onRetry={onRetry} />);
    const button = screen.getByRole("button", { name: /다시 시도/i });
    expect(button).toBeInTheDocument();
    fireEvent.click(button);
    expect(onRetry).toHaveBeenCalled();
  });

  it("onRetry prop이 없으면 버튼이 렌더링되지 않는다", () => {
    render(<Error message="에러 발생!" />);
    expect(screen.queryByRole("button", { name: /다시 시도/i })).toBeNull();
  });
});
