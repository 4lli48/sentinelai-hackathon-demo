import { describe, expect, it } from "vitest";
import { demoScenarios } from "@shared/sentinel";
import { destinations, draftForScenario, isDraftReady, newManualDraft } from "./bankIntake";

describe("bank intake draft", () => {
  it("starts a manual transfer with no required fields selected", () => {
    const draft = newManualDraft();
    expect(draft.customerId).toBe("");
    expect(draft.amount).toBe(0);
    expect(draft.destinationCountry).toBe("");
    expect(draft.beneficiaryName).toBe("");
    expect(draft.transactionType).toBe("");
    expect(isDraftReady(draft)).toBe(false);
  });

  it("contains the prescribed demo destinations with Arabic Turkey localisation", () => {
    expect(destinations.map(item => item.value)).toEqual(expect.arrayContaining(["Saudi Arabia", "Turkey", "High-risk jurisdiction"]));
    expect(destinations.find(item => item.value === "Turkey")?.ar).toBe("تركيا");
  });

  it("enables analysis only after all required manual selections are present", () => {
    const complete = { ...newManualDraft(), customerId: "layan", amount: 49000, destinationCountry: "Turkey", beneficiaryName: "New Electronics LLC", transactionType: "Merchant Payment" as const };
    expect(isDraftReady(complete)).toBe(true);
  });

  it("loads scenario inputs directly into the manual draft", () => {
    const scenario = { customerId: "noura", amount: 12000, currency: "SAR", destinationCountry: "Philippines", beneficiaryName: "Maria Santos", transactionType: "International Transfer" as const };
    expect(draftForScenario(scenario)).toEqual(scenario);
  });

  it("يقبل كل مجموعات بيانات السيناريوهات الأربعة عند إدخالها يدويًا في الحقول المطلوبة", () => {
    for (const scenario of demoScenarios) {
      const manualDraft = {
        ...newManualDraft(),
        customerId: scenario.input.customerId,
        amount: scenario.input.amount,
        destinationCountry: scenario.input.destinationCountry,
        beneficiaryName: scenario.input.beneficiaryName,
        transactionType: scenario.input.transactionType,
        websiteDomain: scenario.input.websiteDomain,
      };
      expect(isDraftReady(manualDraft), scenario.id).toBe(true);
    }
  });
});
