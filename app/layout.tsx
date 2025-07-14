import { cookies } from "next/headers";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Metadata } from "next";
import UserStatus from "@/components/UserStatus";
import ThemeToggle from "@/components/ui/ThemeToggle";

export const metadata: Metadata = {
  title: "아침 식단 영양소 분석",
  description: "아침 식단을 분석해 부족한 영양소와 추천 식단을 안내합니다.",
};

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const theme = cookieStore.get("theme")?.value;
  const isNotSettingTheme = theme === undefined || theme === null;
  const isDarkTheme = theme === "dark";

  return (
    <html
      lang="ko"
      className={isNotSettingTheme ? "" : `${isDarkTheme ? "dark" : ""}`}
      suppressHydrationWarning
    >
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-white dark:bg-black`}
      >
        <div className="min-h-screen flex flex-col">
          <header className="w-full flex justify-end items-center px-4 py-2 gap-2 border-b border-gray-100 dark:border-gray-800 sticky top-0 bg-white/80 dark:bg-black/80 backdrop-blur z-10">
            <UserStatus />
            <ThemeToggle />
          </header>
          <main className="flex-1 flex flex-col">{children}</main>
          <footer className="w-full text-center text-xs text-gray-400 dark:text-gray-500 py-4 border-t border-gray-100 dark:border-gray-800">
            © 2024 아이하루. All rights reserved. | 문의: jaloveeye@gmail.com
          </footer>
        </div>
      </body>
    </html>
  );
}
