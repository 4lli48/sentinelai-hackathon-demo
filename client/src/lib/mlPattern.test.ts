import { describe, expect, it } from "vitest";
import { buildMlPattern } from "./mlPattern";

describe("ML behaviour pattern", () => {
  it("keeps a routine amount inside the derived customer band", () => {
    const pattern = buildMlPattern({ averageAmount: 4200, transactionCount: 12, currentAmount: 1800 });
    expect(pattern.isOutside).toBe(false);
    expect(pattern.history).toHaveLength(12);
  });

  it("shows material behaviour change outside the expected band", () => {
    const pattern = buildMlPattern({ averageAmount: 8900, transactionCount: 31, currentAmount: 49000 });
    expect(pattern.isOutside).toBe(true);
    expect(pattern.deviationRatio).toBeGreaterThan(5);
  });
});
