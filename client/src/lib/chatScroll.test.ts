import { describe, expect, it } from "vitest";
import { chatScrollBehavior } from "./chatScroll";

describe("chat scroll behaviour", () => {
  it("keeps the first message instant", () => {
    expect(chatScrollBehavior(1, false)).toBe("auto");
  });

  it("uses smooth scrolling only when the user has not reduced motion", () => {
    expect(chatScrollBehavior(3, false)).toBe("smooth");
    expect(chatScrollBehavior(3, true)).toBe("auto");
  });
});
