import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "세상에 나쁜 개미는 없다",
  description: "친근한 통합 주식 플랫폼 세나개",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ko"
      className="h-full antialiased"
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
