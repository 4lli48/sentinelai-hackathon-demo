import { describe, expect, it } from "vitest";
import { liveAnalysisStages, liveStageAt } from "./liveAnalysis";

describe("live analysis stages", () => {
  it("keeps a visible six-stage path from context freezing to the decision snapshot", () => {
    expect(liveAnalysisStages).toHaveLength(6);
    expect(liveStageAt(0).id).toBe("snapshot");
    expect(liveStageAt(999).id).toBe("artifact");
  });
});
