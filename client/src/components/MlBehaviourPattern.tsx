import { Activity, CircleDot, TrendingUp } from "lucide-react";
import { buildMlPattern, valueToY } from "@/lib/mlPattern";
import { sar } from "@/lib/sentinelUi";

export function MlBehaviourPattern({ averageAmount, transactionCount, currentAmount, locale }: { averageAmount: number; transactionCount: number; currentAmount: number; locale: "ar" | "en" }) {
  const isAr = locale === "ar";
  const pattern = buildMlPattern({ averageAmount, transactionCount, currentAmount });
  const width = 460;
  const left = 32;
  const right = 428;
  const points = pattern.history.map((amount, index) => ({ x: left + (index / Math.max(1, pattern.history.length - 1)) * (right - left - 38), y: valueToY(amount, pattern.min, pattern.max), amount }));
  const line = points.map(point => `${point.x},${point.y}`).join(" ");
  const currentX = right;
  const currentY = valueToY(currentAmount, pattern.min, pattern.max);
  const lowerY = valueToY(pattern.lower, pattern.min, pattern.max);
  const upperY = valueToY(pattern.upper, pattern.min, pattern.max);
  const safeTop = Math.min(lowerY, upperY);
  const safeHeight = Math.abs(lowerY - upperY);
  return <section className="ml-pattern" aria-label={isAr ? "نمط سلوك العميل لتحليل الشذوذ والاستدلال المحلي" : "Customer behaviour pattern for anomaly detection and Local AI inference"}>
    <div className="ml-pattern-head"><div><span><Activity size={14} />{isAr ? "نمط سلوك العميل" : "CUSTOMER BEHAVIOUR PATTERN"}</span><b>{isAr ? "النطاق المرجعي مقابل العملية الحالية" : "Reference band vs current transfer"}</b></div><span className={pattern.isOutside ? "pattern-status outlier" : "pattern-status within"}>{pattern.isOutside ? (isAr ? "خارج النطاق" : "OUTSIDE BAND") : (isAr ? "ضمن النطاق" : "WITHIN BAND")}</span></div>
    <div className="ml-chart-wrap"><svg viewBox={`0 0 ${width} 170`} role="img"><defs><linearGradient id="pattern-fill" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="#58a47f" stopOpacity=".24" /><stop offset="1" stopColor="#58a47f" stopOpacity=".04" /></linearGradient></defs><rect className="ml-chart-band" x="24" y={safeTop} width="412" height={safeHeight} rx="7" /><line className="ml-chart-grid" x1="24" x2="436" y1={upperY} y2={upperY} /><line className="ml-chart-grid" x1="24" x2="436" y1={lowerY} y2={lowerY} /><polyline className="ml-chart-line" points={line} /><path className="ml-chart-area" d={`M ${points[0].x} 154 L ${line.replaceAll(" ", " L ")} L ${points[points.length - 1].x} 154 Z`} /><line className="ml-current-guide" x1={currentX} x2={currentX} y1="18" y2="154" /><circle className="ml-current-dot" cx={currentX} cy={currentY} r="7" /><circle className="ml-current-core" cx={currentX} cy={currentY} r="3" /><text className="ml-axis-label" x="26" y={upperY - 5}>{isAr ? "الحد الأعلى" : "UPPER BAND"}</text><text className="ml-axis-label" x="26" y={lowerY + 13}>{isAr ? "الحد الأدنى" : "LOWER BAND"}</text><text className="ml-axis-label current-label" x={currentX - 42} y={Math.max(14, currentY - 12)}>{isAr ? "الحالي" : "CURRENT"}</text></svg></div>
    <div className="ml-pattern-metrics"><div><span>{isAr ? "المتوسط المرجعي" : "Reference average"}</span><b>{sar(averageAmount, locale)}</b></div><div><span>{isAr ? "النطاق المعتاد" : "Expected band"}</span><b>{sar(pattern.lower, locale)} — {sar(pattern.upper, locale)}</b></div><div><span>{isAr ? "العملية الحالية" : "Current transfer"}</span><b>{sar(currentAmount, locale)}</b></div></div>
    <div className="ml-pattern-footer"><TrendingUp size={14} /><span>{isAr ? `انحراف المبلغ ${pattern.deviationRatio.toFixed(1)}× عن المتوسط المرجعي. يغذي هذا المؤشر نموذج الذكاء المحلي ضمن مسار تقييم المخاطر الموحد.` : `Amount deviates ${pattern.deviationRatio.toFixed(1)}× from the reference average. This signal feeds the custom Local AI model within the unified risk assessment pipeline.`}</span></div>
  </section>;
}
