import { describe, expect, it } from "vitest";
import { operationQuickLinksFor } from "./OperationQuickLinks";

describe("روابط الوصول السريع للعملية", () => {
  it("تحافظ على معرّف العملية نفسه في القرار والتحقيق والحالات", () => {
    const links = operationQuickLinksFor("TX-001", "ar");
    expect(links.map(link => link.href)).toEqual([
      "/operations?view=decision&id=TX-001",
      "/operations?view=investigation&id=TX-001",
      "/operations?view=cases&id=TX-001",
    ]);
  });

  it("يعرض الحالات والتنبيهات كخانة واحدة فقط", () => {
    const links = operationQuickLinksFor("TX-001", "ar");
    expect(links).toHaveLength(3);
    expect(links[2]?.label).toBe("الحالات والتنبيهات");
  });

  it("يوفر تلميحًا يشرح وظيفة كل رابط من دون تغيير وجهته", () => {
    const links = operationQuickLinksFor("TX-001", "ar");
    expect(links.map(link => link.tooltip)).toEqual([
      "يفتح ملخص القرار لهذه المعاملة.",
      "يفتح ملف التحقيق لهذه المعاملة.",
      "يفتح الحالات والتنبيهات المتعلقة بهذه المعاملة.",
    ]);
  });
});
