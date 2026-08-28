import { describe, expect, it } from "vitest";
import { themeFromStorage } from "./ThemeContext";

describe("theme preference", () => {
  it("accepts only persisted light or dark choices and otherwise uses the supplied default", () => {
    expect(themeFromStorage("dark")).toBe("dark");
    expect(themeFromStorage("light")).toBe("light");
    expect(themeFromStorage("unexpected", "dark")).toBe("dark");
  });
});
