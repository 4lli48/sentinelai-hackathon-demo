import { describe, expect, it } from "vitest";
import { filterCaseRecords } from "./caseFilters";

const cases = [
  { id: "safe", decision: "Approve" as const, riskLevel: "Low" as const },
  { id: "verify", decision: "Additional Verification" as const, riskLevel: "Medium" as const },
  { id: "review", decision: "Manual Review" as const, riskLevel: "Critical" as const },
];

describe("case filters", () => {
  it("keeps all records when filters are unset", () => {
    expect(filterCaseRecords(cases, { decision: "all", risk: "all" }).map(item => item.id)).toEqual(["safe", "verify", "review"]);
  });

  it("intersects decision and risk selections", () => {
    expect(filterCaseRecords(cases, { decision: "Manual Review", risk: "Critical" }).map(item => item.id)).toEqual(["review"]);
    expect(filterCaseRecords(cases, { decision: "Manual Review", risk: "Medium" })).toEqual([]);
  });
});
