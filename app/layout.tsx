import { cookies } from "next/headers";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Metadata } from "next";

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
        {children}
      </body>
    </html>
  );
}
