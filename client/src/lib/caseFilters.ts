export type CaseDecisionFilter = "all" | "Approve" | "Additional Verification" | "Manual Review" | "Temporary Hold";
export type CaseRiskFilter = "all" | "Low" | "Medium" | "High" | "Critical";

export function filterCaseRecords<T extends { decision: CaseDecisionFilter; riskLevel: CaseRiskFilter }>(
  records: T[],
  filters: { decision: CaseDecisionFilter; risk: CaseRiskFilter },
) {
  return records.filter(record =>
    (filters.decision === "all" || record.decision === filters.decision)
    && (filters.risk === "all" || record.riskLevel === filters.risk),
  );
}
