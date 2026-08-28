export function formatAiLatency(milliseconds: number, locale: "ar" | "en") {
  const seconds = Math.max(0, milliseconds) / 1000;
  const display = seconds >= 10 ? seconds.toFixed(0) : seconds.toFixed(1);
  return locale === "ar" ? `مدة المعالجة: ${display} ث` : `Processed in ${display}s`;
}

export function averageAiLatency(values: Array<number | undefined>) {
  const measured = values.filter((value): value is number => typeof value === "number" && Number.isFinite(value) && value >= 0);
  if (!measured.length) return null;
  return measured.reduce((total, value) => total + value, 0) / measured.length;
}

export function formatAiSessionAverage(milliseconds: number | null, locale: "ar" | "en") {
  if (milliseconds === null) return locale === "ar" ? "متوسط الجلسة: —" : "Session average: —";
  const seconds = milliseconds / 1000;
  const display = seconds >= 10 ? seconds.toFixed(0) : seconds.toFixed(1);
  return locale === "ar" ? `متوسط الجلسة: ${display} ث` : `Session average: ${display}s`;
}
