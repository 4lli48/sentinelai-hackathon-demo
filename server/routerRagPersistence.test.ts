import { describe, expect, it } from "vitest";
import { ragTransactionReference } from "./routers";

describe("معرف حفظ أثر RAG", () => {
  it("يستخدم معرف العملية المرجعي الظاهر في لقطة القرار بدل معرف الصف الداخلي", () => {
    expect(ragTransactionReference({ id: "legacy-decision-42" })).toBe("legacy-decision-42");
  });
});
