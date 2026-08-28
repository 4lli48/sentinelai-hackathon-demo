import type { AnalysisResult } from "@shared/sentinel";

function normalized(value: string) {
  return value.normalize("NFKD").replace(/[\u064B-\u065F]/g, "").toLocaleLowerCase().trim();
}

export function filterOperationRecords(results: AnalysisResult[], query: string) {
  const term = normalized(query);
  if (!term) return results;
  return results.filter(result => [
    result.snapshot.customer.name,
    result.snapshot.customer.nameAr,
    result.snapshot.snapshotId,
  ].some(value => normalized(value).includes(term)));
}

export type OperationDirectoryFilters = { query: string; customerId: string; destinationCountry: string };

export function filterOperationDirectory(results: AnalysisResult[], filters: OperationDirectoryFilters) {
  return filterOperationRecords(results, filters.query).filter(result => (
    (!filters.customerId || result.snapshot.customer.id === filters.customerId)
    && (!filters.destinationCountry || result.snapshot.transaction.destinationCountry === filters.destinationCountry)
  ));
}
