import { describe, expect, it } from "vitest";
import { pageTransitionKey } from "./pageTransition";

describe("pageTransitionKey", () => {
  it("changes for a page route but remains stable when only the query changes", () => {
    expect(pageTransitionKey("/cases?decision=Manual%20Review")).toBe("/cases");
    expect(pageTransitionKey("/investigation?id=analysis-1")).toBe("/investigation");
    expect(pageTransitionKey("/analysis")).not.toBe(pageTransitionKey("/investigation"));
  });
});
