import { describe, expect, it } from "vitest";
import { operationForId, operationQuery } from "./operationSelection";

describe("operation selection", () => {
  it("selects a recorded operation by its URL-safe id", () => {
    const results = [{ id: "decision alpha" }, { id: "decision-beta" }] as any[];
    expect(operationForId(results, "decision-beta")?.id).toBe("decision-beta");
    expect(operationForId(results, "missing")).toBeUndefined();
    expect(operationQuery("decision alpha")).toBe("?id=decision%20alpha");
  });
});
