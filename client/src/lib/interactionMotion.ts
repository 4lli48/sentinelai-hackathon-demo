export function caseFilterDelay(index: number) {
  return Math.min(Math.max(index, 0), 8) * 34;
}

export function shouldCelebrateAiRefresh(source: string | undefined) {
  return source === "Gemini AI";
}
