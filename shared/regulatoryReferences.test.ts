import { describe, expect, it } from "vitest";
import { demoScenarios } from "./sentinel";
import { runDeterministicAnalysis } from "../server/sentinelEngine";
import { governanceReferencesFor, regulatoryReferenceBrief, regulatoryReferencesFor } from "./regulatoryReferences";

describe("regulatory reference catalogue", () => {
  it("returns only the three official, curated sources for every report", () => {
    const result = runDeterministicAnalysis(demoScenarios.find(scenario => scenario.id === "laundering")!.input);
    const references = regulatoryReferencesFor(result, "en");
    expect(references.map(reference => reference.authority)).toEqual(["SAMA", "FATF", "SDAIA"]);
    expect(references.every(reference => reference.url.startsWith("https://"))).toBe(true);
    expect(references.find(reference => reference.authority === "SAMA")?.url).toContain("rulebook.sama.gov.sa");
    expect(references.find(reference => reference.authority === "FATF")?.url).toContain("fatf-gafi.org/en/topics/fatf-recommendations");
    expect(references.find(reference => reference.authority === "SDAIA")?.url).toBe("https://sdaia.gov.sa/ar/Research/Pages/NOSF.aspx");
    expect(references.find(reference => reference.authority === "SDAIA")?.titleAr).toBe("الإطار الوطني للمعايير المهنية للبيانات والذكاء الاصطناعي");
    expect(references.find(reference => reference.authority === "SAMA")?.context).toContain("High-risk destination");
  });

  it("keeps the AI grounding brief human-readable and Arabic-capable", () => {
    const result = runDeterministicAnalysis(demoScenarios.find(scenario => scenario.id === "verify")!.input);
    const brief = regulatoryReferenceBrief(result, "ar");
    expect(brief).toContain("ساما");
    expect(brief).toContain("سدايا");
    expect(brief).not.toMatch(/[{}]/);
  });

  it("reuses the curated official sources for the methodology governance catalogue", () => {
    const references = governanceReferencesFor();
    expect(references.map(reference => reference.authority)).toEqual(["SAMA", "FATF", "SDAIA"]);
    expect(references.every(reference => reference.url.startsWith("https://"))).toBe(true);
    expect(references.find(reference => reference.authority === "FATF")?.useAr).toContain("شفافية التحويلات");
    expect(references.find(reference => reference.authority === "SDAIA")?.boundaryEn).toContain("Promoting responsible professional practices");
  });
});

