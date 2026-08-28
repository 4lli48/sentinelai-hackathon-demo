import { describe, expect, it } from "vitest";
import type { AnalysisResult } from "@shared/sentinel";
import { decisionResultCount, mergeDecisionResults } from "./persistentResults";

const result = (id: string) => ({ id } as AnalysisResult);

describe("mergeDecisionResults", () => {
  it("keeps the current session first and avoids duplicate persisted records", () => {
    expect(mergeDecisionResults([result("live")], [result("live"), result("stored")]).map(item => item.id)).toEqual(["live", "stored"]);
  });

  it("prefers the persisted report when the same decision exists in session history", () => {
    const session = { id: "same", report: { analysis: "session report" } } as AnalysisResult;
    const persisted = { id: "same", report: { analysis: "persistent report" } } as AnalysisResult;
    expect(mergeDecisionResults([session], [persisted])[0].report.analysis).toBe("persistent report");
  });

  it("counts durable records instead of showing only the current browser session", () => {
    expect(decisionResultCount([result("live-1"), result("live-2")], [result("live-1"), result("stored-1"), result("stored-2")])).toBe(4);
  });
});
