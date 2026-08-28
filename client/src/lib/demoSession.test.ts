import { describe, expect, it } from "vitest";
import { clearDemoResults, DEMO_RESULTS_STORAGE_KEY } from "./demoSession";

describe("demo session reset", () => {
  it("clears only locally stored demo results", () => {
    const removed: string[] = [];
    clearDemoResults({ removeItem: key => removed.push(key) });
    expect(removed).toEqual([DEMO_RESULTS_STORAGE_KEY]);
  });
});
