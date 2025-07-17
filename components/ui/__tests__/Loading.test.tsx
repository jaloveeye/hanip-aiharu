import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import Loading from "../Loading";

describe("Loading 컴포넌트", () => {
  it("스피너(svg)가 렌더링된다", () => {
    render(<Loading />);
    expect(screen.getByRole("img", { hidden: true })).toBeInTheDocument();
  });

  it("message prop이 있을 때 메시지가 렌더링된다", () => {
    render(<Loading message="로딩 중..." />);
    expect(screen.getByText("로딩 중...")).toBeInTheDocument();
  });

  it("message prop이 없으면 메시지가 렌더링되지 않는다", () => {
    render(<Loading />);
    expect(screen.queryByText("로딩 중...")).toBeNull();
  });
});
