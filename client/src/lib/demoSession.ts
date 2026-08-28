export const DEMO_RESULTS_STORAGE_KEY = "sentinelai-hackathon-results";

export function clearDemoResults(storage: Pick<Storage, "removeItem">) {
  storage.removeItem(DEMO_RESULTS_STORAGE_KEY);
}
