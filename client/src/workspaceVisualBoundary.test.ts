import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("الفصل البصري لمساحتي العمل", () => {
  const stylesheet = readFileSync(new URL("./index.css", import.meta.url), "utf8");

  it("يحافظ على معاملة القرار كموجز تنفيذي والتحقيق كملف قضية مع وحدة محادثة مستقلة", () => {
    expect(stylesheet).toContain("Decision review: an executive risk brief");
    expect(stylesheet).toContain("Investigation: a dossier and a dedicated analyst console");
    expect(stylesheet).toContain(".investigation-grid .investigator-chat-panel{position:sticky");
    expect(stylesheet).toContain(".analysis-grid>.right-analysis{gap:14px");
  });
});
