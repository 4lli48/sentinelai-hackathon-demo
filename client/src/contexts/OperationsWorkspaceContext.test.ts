import { describe, expect, it } from "vitest";
import { operationsWorkspaceHref } from "./OperationsWorkspaceContext";

describe("operations workspace navigation", () => {
  it("keeps the selected view and operation identifier together", () => {
    expect(operationsWorkspaceHref("investigation", "abc 123")).toBe("/operations?view=investigation&id=abc+123");
    expect(operationsWorkspaceHref("decision")).toBe("/operations?view=decision");
  });

  it("uses the cases section without inventing an operation identifier", () => {
    expect(operationsWorkspaceHref("cases")).toBe("/operations?view=cases");
  });
});
