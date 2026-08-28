import { describe, expect, it } from "vitest";
import { countryLabel, decisionAssessmentExplanation, mlLevelLabel } from "./sentinelUi";

describe("countryLabel", () => {
  it("renders Turkey in Arabic when Arabic is active", () => {
    expect(countryLabel("Turkey", "ar")).toBe("تركيا");
    expect(countryLabel("Turkey", "en")).toBe("Turkey");
  });
});

describe("decisionAssessmentExplanation", () => {
  it("updates historical advisory wording without changing the analytical finding", () => {
    expect(decisionAssessmentExplanation("صنف النموذج المعاملة بإشارة متوسطة. الإشارة استشارية فقط ولا تغيّر قرار محرك القواعد.", "ar")).toBe("صنف النموذج المعاملة بإشارة متوسطة. تدعم الإشارة قراءة المخاطر داخل الملف.");
    expect(decisionAssessmentExplanation("The signal is advisory only and does not change the rule engine decision.", "en")).toBe("The signal supports risk reading within the file.");
  });

  it("uses the behaviour-assessment label when normalizing historical wording", () => {
    expect(decisionAssessmentExplanation("إشارة استشارية", "ar")).toBe("إشارة تقييم السلوك");
    expect(decisionAssessmentExplanation("Advisory signal", "en")).toBe("behaviour assessment signal");
  });
});

describe("mlLevelLabel", () => {
  it("uses the unified behaviour levels in Arabic and English", () => {
    expect(mlLevelLabel("Routine", "ar")).toBe("سلوك اعتيادي");
    expect(mlLevelLabel("Elevated", "ar")).toBe("سلوك متوسط");
    expect(mlLevelLabel("High", "ar")).toBe("سلوك مرتفع");
    expect(mlLevelLabel("Elevated", "en")).toBe("Elevated behaviour");
  });
});
