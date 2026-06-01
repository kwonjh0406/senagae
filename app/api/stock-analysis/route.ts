import { NextRequest } from "next/server";
import { analyzeStock } from "@/lib/stock-analysis/engine";
import type { TrendMode } from "@/lib/stock-analysis/types";

export async function GET(request: NextRequest) {
  const symbol = request.nextUrl.searchParams.get("symbol");
  const modeParam = request.nextUrl.searchParams.get("mode");
  const mode: TrendMode = modeParam === "20D" ? "20D" : "60D";

  if (!symbol) {
    return Response.json({ message: "종목명 또는 티커를 입력해주세요." }, { status: 400 });
  }

  try {
    const result = await analyzeStock(symbol, mode);
    return Response.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "종목 분석 중 문제가 생겼습니다.";
    return Response.json({ message }, { status: 400 });
  }
}
