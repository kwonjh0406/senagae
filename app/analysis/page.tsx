import { AppHeader } from "../components/AppHeader";
import { StockAnalysisClient } from "./StockAnalysisClient";
import { analyzeStock } from "@/lib/stock-analysis/engine";
import type { AnalyzeResponse } from "@/lib/stock-analysis/types";

export default async function AnalysisPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const symbol = typeof params.symbol === "string" ? params.symbol : "";
  let initialAnalysis: AnalyzeResponse | null = null;
  let initialMessage = symbol ? "분석을 준비 중입니다." : "종목을 입력하면 진입 점수를 계산합니다.";

  if (symbol) {
    try {
      initialAnalysis = await analyzeStock(symbol, "60D");
      initialMessage = `${initialAnalysis.name} 분석이 완료됐습니다.`;
    } catch (error) {
      initialMessage = error instanceof Error ? error.message : "분석에 실패했습니다.";
    }
  }

  return (
    <main className="guide-page analysis-page">
      <AppHeader active="analysis" />
      <StockAnalysisClient
        initialAnalysis={initialAnalysis}
        initialMessage={initialMessage}
        initialSymbol={symbol}
      />
    </main>
  );
}
