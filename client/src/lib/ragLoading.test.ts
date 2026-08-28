import { describe, expect, it } from "vitest";
import { ragLoadingSteps } from "./ragLoading";

describe("ragLoadingSteps", () => {
  it("exposes the fixed snapshot, retrieval, and grounded-response stages", () => {
    expect(ragLoadingSteps("ar").map(step => step.id)).toEqual(["snapshot", "retrieval", "response"]);
    expect(ragLoadingSteps("en")[1].label).toContain("references");
  });
});
