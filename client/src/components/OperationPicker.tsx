import type { AnalysisResult } from "@shared/sentinel";
import { ArrowRight, FileSearch, Search, ShieldCheck } from "lucide-react";
import { Link } from "wouter";
import { countryLabel, decisionLabel, riskLabel, riskTone, sar } from "@/lib/sentinelUi";
import { operationQuery } from "@/lib/operationSelection";
import { filterOperationDirectory } from "@/lib/operationSearch";
import { useState } from "react";
import { OperationQuickLinks } from "./OperationQuickLinks";

export function OperationPicker({ results, locale, destination, investigation = false }: { results: AnalysisResult[]; locale: "ar" | "en"; destination: string; investigation?: boolean }) {
  const isAr = locale === "ar";
  const [query, setQuery] = useState("");
  const [customerId, setCustomerId] = useState("");
  const [destinationCountry, setDestinationCountry] = useState("");
  const visibleResults = filterOperationDirectory(results, { query, customerId, destinationCountry });
  const manualCases = results.filter(result => result.decision !== "Approve").length;
  const customers = Array.from(new Map(results.map(result => [result.snapshot.customer.id, result.snapshot.customer])).values());
  const countries = Array.from(new Set(results.map(result => result.snapshot.transaction.destinationCountry))).sort();
  const screenLabel = investigation ? (isAr ? "قائمة ملفات المراجعة" : "REVIEW FILE QUEUE") : (isAr ? "سجل العمليات المحفوظة" : "STORED OPERATION REGISTRY");
  const screenTitle = investigation ? (isAr ? "اختر ملفًا لبدء المراجعة" : "Choose a file to begin review") : (isAr ? "اختر عملية لفتح ملخصها" : "Choose an operation to open its brief");
  const destinationFor = (id: string) => `${destination}${destination.includes("?") ? `&id=${encodeURIComponent(id)}` : operationQuery(id)}`;
  return <section className={`operation-registry ${investigation ? "investigation-registry" : "decision-registry"}`}>
    <header className="registry-masthead"><div className="registry-icon"><FileSearch size={21} /></div><div><p>{screenLabel}</p><h2>{screenTitle}</h2><span>{isAr ? "كل صف هو لقطة محفوظة مستقلة؛ افتح السجل المناسب دون تغيير بياناته." : "Each row is an independent stored snapshot; open the appropriate record without changing it."}</span></div></header>
    <div className="registry-metrics"><div><span>{isAr ? "السجلات المتاحة" : "Available records"}</span><b>{results.length.toString().padStart(2, "0")}</b></div><div><span>{isAr ? "تحتاج مراجعة" : "Need review"}</span><b>{manualCases.toString().padStart(2, "0")}</b></div><div><span>{isAr ? "نوع المساحة" : "Workspace"}</span><b>{investigation ? (isAr ? "تحقيق" : "Review") : (isAr ? "قرار" : "Decision")}</b></div></div>
    <div className="registry-ledger"><div className="registry-search"><Search size={16} /><label className="sr-only" htmlFor={`operation-search-${destination}`}>{isAr ? "البحث بالاسم أو رقم اللقطة" : "Search by name or snapshot ID"}</label><input id={`operation-search-${destination}`} value={query} onChange={event => setQuery(event.target.value)} placeholder={isAr ? "ابحث بالاسم أو رقم اللقطة…" : "Search name or snapshot ID…"} /><span>{isAr ? `${visibleResults.length} نتيجة` : `${visibleResults.length} results`}</span></div><div className="registry-directory-filters"><label>{isAr ? "العميل" : "Customer"}<select value={customerId} onChange={event => setCustomerId(event.target.value)}><option value="">{isAr ? "كل العملاء" : "All customers"}</option>{customers.map(customer => <option value={customer.id} key={customer.id}>{isAr ? customer.nameAr : customer.name}</option>)}</select></label><label>{isAr ? "بلد الوجهة" : "Destination"}<select value={destinationCountry} onChange={event => setDestinationCountry(event.target.value)}><option value="">{isAr ? "كل الوجهات" : "All destinations"}</option>{countries.map(country => <option value={country} key={country}>{countryLabel(country, locale)}</option>)}</select></label></div><div className="registry-columns"><span>{isAr ? "المرجع" : "REF"}</span><span>{isAr ? "العملية" : "OPERATION"}</span><span>{isAr ? "النتيجة" : "OUTCOME"}</span><span>{isAr ? "الأقسام" : "SECTIONS"}</span></div>{visibleResults.length ? visibleResults.map((result, index) => <article className="registry-entry" key={result.id}><Link className="registry-entry-main" href={destinationFor(result.id)}><div className="registry-reference"><b>{String(index + 1).padStart(2, "0")}</b><span>{result.snapshot.snapshotId.slice(-6)}</span></div><div className="registry-operation"><b>{isAr ? result.snapshot.customer.nameAr : result.snapshot.customer.name}</b><p>{sar(result.snapshot.transaction.amount, locale)} · {countryLabel(result.snapshot.transaction.destinationCountry, locale)}</p><small>{result.snapshot.transaction.beneficiaryName}</small></div><div className="registry-outcome"><span className={`level-pill ${riskTone(result.riskLevel)}`}>{riskLabel(result.riskLevel, locale)}</span><b>{decisionLabel(result.decision, locale)}</b></div><ArrowRight size={18} /></Link><OperationQuickLinks id={result.id} locale={locale} /></article>) : <div className="registry-search-empty">{isAr ? "لا توجد عملية مطابقة للفلاتر الحالية." : "No operation matches the current filters."}</div>}</div>
    <footer className="registry-footer"><ShieldCheck size={16} /><span>{isAr ? "الاختيار يفتح لقطة القراءة فقط؛ القرار المعروض يصدر من القواعد وتوصية الذكاء ضمن الحواجز." : "Selection opens a read-only snapshot; the displayed outcome combines rules and AI recommendation within guardrails."}</span></footer>
  </section>;
}
