import { trpc } from "@/lib/trpc";
import { countryLabel, decisionLabel, riskLabel, riskTone, sar } from "@/lib/sentinelUi";
import { ChevronRight, Clock3, History, LoaderCircle } from "lucide-react";
import { Link } from "wouter";

export function CustomerPreviousAnalyses({ customerId, currentAnalysisId, locale }: { customerId: string; currentAnalysisId: string; locale: "ar" | "en" }) {
  const isAr = locale === "ar";
  const history = trpc.sentinel.customerAnalysisHistory.useQuery({ customerId }, { enabled: Boolean(customerId) });
  const analyses = (history.data ?? []).filter(analysis => analysis.id !== currentAnalysisId);

  return <section className="customer-prior-analyses" aria-labelledby="customer-prior-analyses-title">
    <div className="prior-analysis-head">
      <div><span className="section-index">09</span><h3 id="customer-prior-analyses-title"><History size={17} />{isAr ? "تحليلات SentinelAI السابقة" : "Previous SentinelAI analyses"}</h3></div>
      <span>{isAr ? `${analyses.length} عملية محفوظة` : `${analyses.length} saved analyses`}</span>
    </div>
    <p>{isAr ? "سجل مراجعة منفصل للعمليات المحفوظة لهذا العميل. لا يغيّر خط الأساس المعتمد أو القرار الحالي." : "A separate review record of this customer's saved operations. It does not alter the approved baseline or current decision."}</p>
    {history.isLoading ? <div className="prior-analysis-loading"><LoaderCircle className="spin" size={16} />{isAr ? "جارٍ تحميل السجل المحفوظ…" : "Loading saved history…"}</div> : analyses.length ? <div className="prior-analysis-list">{analyses.map(analysis => <Link key={analysis.id} className="prior-analysis-row" href={`/analysis?id=${encodeURIComponent(analysis.id)}`}><span className={`prior-analysis-score ${riskTone(analysis.riskLevel)}`}>{analysis.score}</span><div><b>{sar(analysis.snapshot.transaction.amount, locale)} · {countryLabel(analysis.snapshot.transaction.destinationCountry, locale)}</b><span><Clock3 size={13} />{new Date(analysis.snapshot.transaction.submittedAt).toLocaleString(isAr ? "ar-SA" : "en-SA", { dateStyle: "medium", timeStyle: "short" })}</span></div><div className="prior-analysis-status"><b>{decisionLabel(analysis.decision, locale)}</b><span>{riskLabel(analysis.riskLevel, locale)}</span></div><ChevronRight size={16} /></Link>)}</div> : <div className="prior-analysis-empty">{isAr ? "لا توجد تحليلات SentinelAI محفوظة أخرى لهذا العميل حتى الآن." : "No other saved SentinelAI analyses are available for this customer yet."}</div>}
  </section>;
}
