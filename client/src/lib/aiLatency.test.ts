import { describe, expect, it } from "vitest";
import { averageAiLatency, formatAiLatency, formatAiSessionAverage } from "./aiLatency";

describe("AI latency formatting", () => {
  it("formats sub-ten-second durations with one decimal in both languages", () => {
    expect(formatAiLatency(1240, "ar")).toBe("مدة المعالجة: 1.2 ث");
    expect(formatAiLatency(1240, "en")).toBe("Processed in 1.2s");
  });

  it("clamps invalid negative durations and rounds long durations", () => {
    expect(formatAiLatency(-20, "ar")).toBe("مدة المعالجة: 0.0 ث");
    expect(formatAiLatency(11320, "en")).toBe("Processed in 11s");
  });

  it("averages only measured, valid session responses", () => {
    expect(averageAiLatency([1000, undefined, -20, 3000])).toBe(2000);
    expect(averageAiLatency([undefined])).toBeNull();
    expect(formatAiSessionAverage(2000, "ar")).toBe("متوسط الجلسة: 2.0 ث");
    expect(formatAiSessionAverage(null, "en")).toBe("Session average: —");
  });
});
