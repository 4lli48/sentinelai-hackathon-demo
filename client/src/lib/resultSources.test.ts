import { describe, expect, it } from "vitest";
import { summarizeResultSources } from "./resultSources";

const result = (id: string) => ({ id }) as never;

describe("summarizeResultSources", () => {
  it("keeps durable history separate from browser-only results while returning a deduplicated list", () => {
    const summary = summarizeResultSources([result("fresh"), result("saved")], [result("saved"), result("older")]);
    expect(summary.persisted).toBe(2);
    expect(summary.sessionOnly).toBe(1);
    expect(summary.unified.map(item => item.id)).toEqual(["fresh", "saved", "older"]);
  });
});
