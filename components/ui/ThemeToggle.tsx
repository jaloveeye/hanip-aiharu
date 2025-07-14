"use client";
import { useLayoutEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import SunIcon from "@/components/ui/SunIcon";
import MoonIcon from "@/components/ui/MoonIcon";

export default function ThemeToggle() {
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useLayoutEffect(() => {
    const isDark = document.documentElement.classList.contains("dark");
    setTheme(isDark ? "dark" : "light");
  }, []);

  const setThemeValue = (nextTheme: "light" | "dark") => {
    document.documentElement.classList.toggle("dark", nextTheme === "dark");
    document.cookie = `theme=${nextTheme}; path=/; max-age=31536000`;
    setTheme(nextTheme);
  };

  const toggleTheme = () => {
    setThemeValue(theme === "dark" ? "light" : "dark");
  };

  return (
    <Button
      type="button"
      variant="secondary"
      size="sm"
      className="ml-2 flex items-center justify-center"
      onClick={toggleTheme}
      aria-label="테마 전환"
      title={theme === "dark" ? "라이트 모드로 전환" : "다크 모드로 전환"}
    >
      {theme === "dark" ? <SunIcon /> : <MoonIcon />}
    </Button>
  );
}
