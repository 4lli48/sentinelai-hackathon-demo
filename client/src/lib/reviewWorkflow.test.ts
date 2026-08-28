import { describe, expect, it } from "vitest";
import { reviewPriority, reviewTimeline } from "./reviewWorkflow";

const result = (riskLevel: "Medium" | "High" | "Critical", decision: "Additional Verification" | "Temporary Hold" | "Manual Review") => ({
  riskLevel,
  decision,
  alert: { created: true },
  case: { created: true },
  report: { source: "Gemini AI" },
  snapshot: { frozenAt: "2026-08-18T00:00:00.000Z" },
}) as never;

describe("review workflow", () => {
  it("derives a human-review priority without changing any decision field", () => {
    expect(reviewPriority(result("Critical", "Manual Review")).key).toBe("immediate");
    expect(reviewPriority(result("High", "Temporary Hold")).key).toBe("priority");
    expect(reviewPriority(result("Medium", "Additional Verification")).key).toBe("routine");
  });

  it("places reviewer session actions after the immutable decision record", () => {
    const timeline = reviewTimeline(result("Critical", "Manual Review"), [{ kind: "escalated", note: "Escalated for demo", recordedAt: Date.parse("2026-08-18T01:00:00.000Z") }]);
    expect(timeline.at(-1)?.kind).toBe("reviewer");
    expect(timeline.some(item => item.kind === "decision")).toBe(true);
  });
});
