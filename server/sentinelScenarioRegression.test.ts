import { describe, expect, it } from "vitest";
import { demoScenarios, type CustomerProfile } from "../shared/sentinel";
import { runDeterministicAnalysis } from "./sentinelEngine";

const profiles: Record<string, CustomerProfile> = {
  ahmed: {
    id: "ahmed",
    name: "Ahmed Al-Otaibi",
    nameAr: "أحمد العتيبي",
    averageAmount: 3200,
    transactionCount: 47,
    usualCountries: ["Saudi Arabia", "UAE"],
    trustedBeneficiaries: ["Sara Al-Mutairi"],
    usualHours: [9, 18],
    priorRisk: false,
  },
  noura: {
    id: "noura",
    name: "Noura Al-Dosari",
    nameAr: "نورة الدوسري",
    averageAmount: 5800,
    transactionCount: 23,
    usualCountries: ["Saudi Arabia", "Philippines", "UK"],
    trustedBeneficiaries: ["Maria Santos"],
    usualHours: [11, 21],
    priorRisk: false,
  },
};

describe("demo scenario regressions", () => {
  it("keeps the cross-border and behaviour change scenario out of Approve with Additional Verification", () => {
    const scenario = demoScenarios.find(item => item.id === "verify")!;
    const result = runDeterministicAnalysis(scenario.input, profiles.noura);

    expect(result.decision).toBe("Additional Verification");
    expect(result.score).toBe(55);
    expect(result.factors.map(factor => factor.id)).toEqual(["international-threshold", "behaviour"]);
  });

  it("keeps the suspicious website scenario materially isolated to the website policy", () => {
    const scenario = demoScenarios.find(item => item.id === "website")!;
    const result = runDeterministicAnalysis(scenario.input, profiles.ahmed);

    expect(result.decision).toBe("Manual Review");
    expect(result.score).toBe(35);
    expect(result.factors.map(factor => factor.id)).toEqual(["website-high-risk", "website-override"]);
  });
});
