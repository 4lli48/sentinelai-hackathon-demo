import { describe, expect, it } from "vitest";
import { filterOperationDirectory, filterOperationRecords } from "./operationSearch";
import type { AnalysisResult } from "@shared/sentinel";

const records = [
  { snapshot: { customer: { id: "noura", name: "Noura Al-Dosari", nameAr: "نورة الدوسري" }, transaction: { destinationCountry: "Philippines" }, snapshotId: "snap-NO123" } },
  { snapshot: { customer: { id: "khalid", name: "Khalid Al-Shahri", nameAr: "خالد الشهري" }, transaction: { destinationCountry: "Saudi Arabia" }, snapshotId: "snap-KH456" } },
] as AnalysisResult[];

describe("filterOperationRecords", () => {
  it("finds records by either customer name or snapshot identifier", () => {
    expect(filterOperationRecords(records, "noura")).toHaveLength(1);
    expect(filterOperationRecords(records, "خالد")).toHaveLength(1);
    expect(filterOperationRecords(records, "KH456")).toHaveLength(1);
  });
});

describe("filterOperationDirectory", () => {
  it("combines customer and destination filters with instant name and snapshot search", () => {
    expect(filterOperationDirectory(records, { query: "", customerId: "noura", destinationCountry: "Philippines" })).toHaveLength(1);
    expect(filterOperationDirectory(records, { query: "", customerId: "noura", destinationCountry: "Saudi Arabia" })).toHaveLength(0);
    expect(filterOperationDirectory(records, { query: "KH456", customerId: "khalid", destinationCountry: "Saudi Arabia" })).toHaveLength(1);
  });
});
