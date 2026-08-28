import { nanoid } from "nanoid";
import type { AnalysisResult, AuditStage, CustomerProfile, Decision, DecisionSnapshot, InvestigationReport, MlSignal, RiskFactor, RiskLevel, TransactionInput, WebsiteAssessment } from "../shared/sentinel";
import { customers } from "../shared/sentinel";
import { regulatoryReferencesFor } from "../shared/regulatoryReferences";
import { pendingCompositeDecision } from "./compositeDecision";

const HIGH_RISK_COUNTRIES = new Set(["High-risk jurisdiction", "Iran", "North Korea"]);
const TRUSTED_DOMAINS = new Set(["alrajhibank.com.sa", "google.com", "gov.sa"]);
const AR_DESTINATIONS: Record<string, string> = { "Saudi Arabia": "المملكة العربية السعودية", "High-risk jurisdiction": "ولاية عالية المخاطر", Philippines: "الفلبين", Pakistan: "باكستان", UAE: "الإمارات العربية المتحدة", India: "الهند", Turkey: "تركيا" };
const AR_RISK_LEVELS: Record<RiskLevel, string> = { Low: "منخفضة", Medium: "متوسطة", High: "مرتفعة", Critical: "حرجة" };
const AR_DECISIONS: Record<Decision, string> = { Approve: "موافقة", "Additional Verification": "تحقق إضافي", "Temporary Hold": "إيقاف مؤقت", "Manual Review": "مراجعة يدوية" };

function seededRandom(seed: number) {
  let value = seed >>> 0;
  return () => {
    value = (value * 1664525 + 1013904223) >>> 0;
    return value / 4294967296;
  };
}

type ForestNode = { size: number; feature?: number; split?: number; left?: ForestNode; right?: ForestNode };
const rng = seededRandom(20260813);
const normalBaseline = Array.from({ length: 256 }, () => [
  0.18 + rng() * 0.55,
  rng() > 0.92 ? 1 : 0,
  rng() > 0.85 ? 1 : 0,
  rng() > 0.98 ? 1 : 0,
  0.25 + rng() * 0.35,
]);

function buildTree(rows: number[][], depth: number, maxDepth: number): ForestNode {
  if (rows.length <= 1 || depth >= maxDepth) return { size: rows.length };
  const feature = Math.floor(rng() * 5);
  const values = rows.map(row => row[feature]);
  const min = Math.min(...values);
  const max = Math.max(...values);
  if (min === max) return { size: rows.length };
  const split = min + (max - min) * rng();
  const leftRows = rows.filter(row => row[feature] < split);
  const rightRows = rows.filter(row => row[feature] >= split);
  if (!leftRows.length || !rightRows.length) return { size: rows.length };
  return { size: rows.length, feature, split, left: buildTree(leftRows, depth + 1, maxDepth), right: buildTree(rightRows, depth + 1, maxDepth) };
}

const forest = Array.from({ length: 48 }, () => {
  const sample = Array.from({ length: 96 }, () => normalBaseline[Math.floor(rng() * normalBaseline.length)]);
  return buildTree(sample, 0, 8);
});

function c(n: number) {
  if (n <= 1) return 0;
  return 2 * (Math.log(n - 1) + 0.5772156649) - 2 * (n - 1) / n;
}

function pathLength(vector: number[], node: ForestNode, depth = 0): number {
  if (!node.left || !node.right || node.feature === undefined || node.split === undefined) return depth + c(node.size);
  return vector[node.feature] < node.split ? pathLength(vector, node.left, depth + 1) : pathLength(vector, node.right, depth + 1);
}

function websiteAssessment(domain?: string): WebsiteAssessment | undefined {
  if (!domain) return undefined;
  const clean = domain.toLowerCase().replace(/^https?:\/\//, "").replace(/\/$/, "");
  const indicators: WebsiteAssessment["indicators"] = [];
  if (!/^([a-z0-9-]+\.)+[a-z]{2,}$/i.test(clean)) indicators.push({ label: "Malformed domain", labelAr: "نطاق غير صالح", points: 100 });
  if (/secure|support|verify|login/.test(clean)) indicators.push({ label: "Credential-harvesting keyword", labelAr: "كلمة مرتبطة بالتصيد", points: 20 });
  if ((clean.match(/-/g) || []).length >= 2) indicators.push({ label: "Multiple hyphens", labelAr: "شرطات متعددة", points: 15 });
  if (/rajhi|bank/.test(clean) && !TRUSTED_DOMAINS.has(clean)) indicators.push({ label: "Financial brand mimicry", labelAr: "تقليد علامة مالية", points: 25 });
  if (TRUSTED_DOMAINS.has(clean)) indicators.push({ label: "Trusted reference domain", labelAr: "نطاق مرجعي موثوق", points: 0 });
  const score = indicators.reduce((sum, indicator) => sum + indicator.points, 0);
  const classification = score >= 35 ? "High Risk" : score > 0 ? "Needs Review" : "Trusted";
  return { domain: clean, classification, score, indicators, mandatoryOverride: classification === "High Risk" };
}

function makeSignal(snapshot: DecisionSnapshot): MlSignal {
  const ratio = Math.min(snapshot.derived.amountToAverageRatio / 8, 1);
  const hour = new Date(snapshot.transaction.submittedAt).getHours();
  const hourAnomaly = hour < snapshot.customer.usualHours[0] || hour > snapshot.customer.usualHours[1] ? 1 : 0;
  const vector = [ratio, snapshot.derived.newCountry ? 1 : 0, snapshot.derived.newBeneficiary ? 1 : 0, HIGH_RISK_COUNTRIES.has(snapshot.transaction.destinationCountry) ? 1 : 0, hourAnomaly];
  const averagePath = forest.reduce((sum, tree) => sum + pathLength(vector, tree), 0) / forest.length;
  const raw = 2 ** (-averagePath / c(96));
  const score = Math.min(99, Math.max(1, Math.round(raw * 100)));
  const level = score >= 70 ? "High" : score >= 45 ? "Elevated" : "Routine";
  const signals = [
    ratio > 0.25 ? "amount-to-baseline deviation" : "amount pattern near baseline",
    snapshot.derived.newCountry ? "new destination corridor" : "known destination corridor",
    snapshot.derived.newBeneficiary ? "new beneficiary relationship" : "known beneficiary relationship",
    hourAnomaly ? "unusual submission hour" : "usual submission hour",
  ];
  return {
    score,
    level,
    method: "Isolation Forest",
    advisory: true,
    explanation: `Synthetic-demo Isolation Forest marked this transaction ${level.toLowerCase()} for anomaly distance. This behavioural signal is evidence considered by the AI recommendation within the rule safety floor and mandatory policy controls.`,
    explanationAr: `صنف نموذج Isolation Forest التجريبي هذه المعاملة بإشارة شذوذ ${level === "High" ? "مرتفعة" : level === "Elevated" ? "متوسطة" : "اعتيادية"}. تمثل إشارة السلوك دليلًا تنظر فيه توصية الذكاء الاصطناعي ضمن حد القواعد وضوابط السياسة الإلزامية.`,
    featureSignals: signals,
  };
}

function fallbackReport(result: Omit<AnalysisResult, "report">, locale: "en" | "ar" = "en"): InvestigationReport {
  const isAr = locale === "ar";
  const evidence = result.factors.length ? result.factors.map(factor => isAr ? `${factor.titleAr}: ${factor.evidenceAr}` : `${factor.title}: ${factor.evidence}`) : [isAr ? "لم تُفعّل أي عوامل مخاطر حتمية مادية." : "No material deterministic risk factors were triggered."];
  const action = result.decision === "Approve" ? (isAr ? "متابعة الرصد الاعتيادي." : "Proceed with routine monitoring.") : result.decision === "Additional Verification" ? (isAr ? "طلب معلومات داعمة قبل الإجراء." : "Request supporting information before release.") : (isAr ? "إحالة الحالة إلى مراجع بشري." : "Route the case to a human reviewer.");
  return {
    source: "Deterministic fallback",
    completion: "model",
    locale,
    evidence,
    analysis: isAr
      ? `تعذرت توصية الذكاء الاصطناعي الحية؛ لذلك يبقى تقييم القواعد «${AR_DECISIONS[result.ruleAssessment.decision]}» بمستوى مخاطر ${AR_RISK_LEVELS[result.ruleAssessment.riskLevel]} ودرجة ${result.ruleAssessment.score}/100 هو حد الأمان التشغيلي. ${result.factors.length ? `سجّل المحرك ${result.factors.length} عوامل، وتظهر أدلتها التفصيلية في ملف القضية.` : "لم يسجل المحرك عوامل مخاطر مادية."}${result.policyOverrideAr ? ` كما طُبق تجاوز السياسة: ${result.policyOverrideAr}` : ""} إشارة السلوك بدرجة ${result.mlSignal.score}/100: ${result.mlSignal.explanationAr}`
      : `The live AI recommendation was unavailable, so the rule assessment of ${result.ruleAssessment.decision} at ${result.ruleAssessment.riskLevel} risk and ${result.ruleAssessment.score}/100 remains the operational safety floor. ${result.factors.length ? `${result.factors.length} rule factors are recorded with detailed evidence in the case file.` : "No material rule factors were triggered."}${result.policyOverride ? ` The policy override applied was: ${result.policyOverride}` : ""} The ${result.mlSignal.score}/100 behaviour signal: ${result.mlSignal.explanation}`,
    references: regulatoryReferencesFor(result, locale),
    actions: [action],
  };
}

function addFactor(factors: RiskFactor[], item: RiskFactor) {
  factors.push(item);
}

function riskLevelFor(score: number): RiskLevel {
  if (score >= 81) return "Critical";
  if (score >= 61) return "High";
  if (score >= 31) return "Medium";
  return "Low";
}

function decisionFor(score: number): Decision {
  if (score >= 81) return "Manual Review";
  if (score >= 61) return "Temporary Hold";
  if (score >= 31) return "Additional Verification";
  return "Approve";
}

export function runDeterministicAnalysis(input: TransactionInput, persistentCustomer?: CustomerProfile): Omit<AnalysisResult, "report"> {
  const customer = persistentCustomer ?? customers.find(item => item.id === input.customerId);
  if (!customer) throw new Error(`Unknown SentinelAI customer profile: ${input.customerId}`);
  const submittedAt = input.submittedAt ?? new Date().toISOString();
  const ratio = customer.transactionCount === 0 ? 0 : Number((input.amount / customer.averageAmount).toFixed(2));
  const newBeneficiary = !customer.trustedBeneficiaries.map(name => name.toLowerCase()).includes(input.beneficiaryName.toLowerCase());
  const newCountry = !customer.usualCountries.includes(input.destinationCountry);
  const hour = new Date(submittedAt).getHours();
  const snapshot: DecisionSnapshot = {
    snapshotId: nanoid(12),
    frozenAt: submittedAt,
    customer: { ...customer, usualCountries: [...customer.usualCountries], trustedBeneficiaries: [...customer.trustedBeneficiaries] },
    transaction: { ...input, submittedAt },
    derived: {
      amountToAverageRatio: ratio,
      newBeneficiary,
      newCountry,
      noHistoricalBaseline: customer.transactionCount === 0,
      outsideUsualHours: hour < customer.usualHours[0] || hour > customer.usualHours[1],
    },
  };
  const factors: RiskFactor[] = [];
  const audit: AuditStage[] = [];
  const stage = (code: string, label: string, labelAr: string, detail: string, detailAr: string) => audit.push({ index: audit.length + 1, code, label, labelAr, detail, detailAr });
  stage("INTAKE", "Intake validation", "التحقق من الإدخال", "Required transaction fields are complete.", "حقول التحويل المطلوبة مكتملة.");
  stage("SNAPSHOT", "Context snapshot frozen", "تثبيت لقطة السياق", `Snapshot ${snapshot.snapshotId} captured before scoring.`, `تم تثبيت اللقطة ${snapshot.snapshotId} قبل احتساب الدرجة.`);
  stage("CUSTOMER", "Customer profile", "ملف العميل", `${customer.name} has ${customer.transactionCount} prior demo transfers.`, `لدى ${customer.nameAr} عدد ${customer.transactionCount} من التحويلات التجريبية السابقة.`);
  stage("BASELINE", "Baseline comparison", "مقارنة خط الأساس", customer.transactionCount ? `Amount is ${ratio}x the historical average.` : "No historical baseline is available.", customer.transactionCount ? `المبلغ يساوي ${ratio}× من المتوسط التاريخي.` : "لا يتوفر خط أساس تاريخي.");
  let score = 0;
  if (customer.priorRisk) {
    score += 15;
    addFactor(factors, { id: "prior-risk", title: "Prior risk history", titleAr: "سجل مخاطر سابق", points: 15, category: "Customer", evidence: "Customer profile contains prior-risk flags.", evidenceAr: "يحتوي ملف العميل على مؤشرات مخاطر سابقة." });
  }
  stage("AMOUNT", "Amount policy", "سياسة المبلغ", "Amount rules evaluated against the frozen baseline.", "تم تقييم قواعد المبلغ مقابل خط الأساس المثبّت.");
  if (snapshot.derived.noHistoricalBaseline && input.amount > 50000) {
    score += 20;
    addFactor(factors, { id: "unestablished-amount", title: "Large unestablished transfer", titleAr: "تحويل كبير بلا سجل سابق", points: 20, category: "Transaction", evidence: "New customer with a transfer above 50,000 SAR.", evidenceAr: "عميل جديد مع تحويل يتجاوز 50,000 ريال." });
  } else if (ratio > 3) {
    score += 20;
    addFactor(factors, { id: "amount-deviation", title: ratio > 10 ? "Extreme amount deviation" : "Large amount deviation", titleAr: ratio > 10 ? "انحراف مبلغ شديد" : "انحراف مبلغ كبير", points: 20, category: "Transaction", evidence: `Amount is ${ratio}x the frozen customer baseline.`, evidenceAr: `المبلغ يساوي ${ratio}× من خط أساس العميل المثبّت.` });
  }
  stage("DESTINATION", "Destination corridor", "ممر الوجهة", `Destination: ${input.destinationCountry}.`, `الوجهة: ${AR_DESTINATIONS[input.destinationCountry] ?? input.destinationCountry}.`);
  if (HIGH_RISK_COUNTRIES.has(input.destinationCountry)) {
    score += 35;
    addFactor(factors, { id: "high-risk-country", title: "High-risk destination", titleAr: "وجهة عالية المخاطر", points: 35, category: "Transaction", evidence: "Destination appears in the demo high-risk corridor list.", evidenceAr: "تظهر الوجهة ضمن قائمة الممرات عالية المخاطر في بيئة العرض." });
  }
  if (input.transactionType === "International Transfer" && input.amount > 5000) {
    score += 35;
    addFactor(factors, { id: "international-threshold", title: "International transfer threshold", titleAr: "حد التحويل الدولي", points: 35, category: "Transaction", evidence: "Cross-border amount exceeds the demo 5,000 SAR policy threshold.", evidenceAr: "يتجاوز مبلغ التحويل العابر للحدود حد سياسة العرض البالغ 5,000 ريال." });
  }
  stage("BENEFICIARY", "Beneficiary relationship", "علاقة المستفيد", newBeneficiary ? "No prior beneficiary relationship found." : "Prior beneficiary relationship confirmed.", newBeneficiary ? "لا توجد علاقة سابقة مع المستفيد." : "تم تأكيد علاقة سابقة مع المستفيد.");
  if (newBeneficiary) {
    score += 15;
    addFactor(factors, { id: "new-beneficiary", title: "New beneficiary", titleAr: "مستفيد جديد", points: 15, category: "Beneficiary", evidence: "Beneficiary is not present in the frozen trusted-beneficiary list.", evidenceAr: "المستفيد غير موجود في قائمة المستفيدين الموثوقين ضمن اللقطة المثبّتة." });
  }
  const website = websiteAssessment(input.websiteDomain);
  stage("WEBSITE", "Website intelligence", "تحليل الموقع", website ? `${website.classification}: ${website.domain}.` : "No merchant domain submitted.", website ? `${website.classification}: ${website.domain}.` : "لم يتم إدخال نطاق للتاجر.");
  if (website?.classification === "Needs Review") {
    score += 20;
    addFactor(factors, { id: "website-review", title: "Website needs review", titleAr: "موقع يحتاج مراجعة", points: 20, category: "Website", evidence: "Domain has no trusted-reference evidence in the demo registry.", evidenceAr: "لا يملك النطاق دليلاً مرجعيًا موثوقًا في سجل بيئة العرض." });
  }
  if (website?.classification === "High Risk") {
    score += 35;
    addFactor(factors, { id: "website-high-risk", title: "High-risk website signals", titleAr: "إشارات موقع عالية المخاطر", points: 35, category: "Website", evidence: website.indicators.map(item => item.label).join(", "), evidenceAr: website.indicators.map(item => item.labelAr).join("، ") });
  }
  stage("BEHAVIOUR", "Behaviour deviation", "انحراف السلوك", newCountry || (!snapshot.derived.noHistoricalBaseline && ratio > 2) ? "Material deviation identified." : "No material deviation identified.", newCountry || (!snapshot.derived.noHistoricalBaseline && ratio > 2) ? "تم رصد انحراف مادي." : "لم يتم رصد انحراف مادي.");
  if (!snapshot.derived.noHistoricalBaseline && (newCountry || ratio > 2)) {
    score += 20;
    addFactor(factors, { id: "behaviour", title: "Behaviour deviation", titleAr: "انحراف سلوكي", points: 20, category: "Behaviour", evidence: newCountry ? "Destination is outside the frozen country baseline." : `Amount is ${ratio}x the frozen baseline.`, evidenceAr: newCountry ? "الوجهة خارج خط أساس البلدان المثبّت." : `المبلغ يساوي ${ratio}× من خط الأساس المثبّت.` });
  }
  stage("COMPOSITION", "Multi-signal composition", "تجميع الإشارات", "Policy checks whether multiple independent indicators co-occur.", "تتحقق السياسة من تزامن عدة مؤشرات مستقلة.");
  if (factors.length >= 3 && score > 45) {
    score += 10;
    addFactor(factors, { id: "multi-signal", title: "Multi-signal escalation", titleAr: "تصعيد تجمّع إشارات", points: 10, category: "Policy", evidence: "Three or more deterministic factors are active above the policy composition threshold.", evidenceAr: "توجد ثلاثة عوامل حتمية أو أكثر فوق حد التجميع في السياسة." });
  }
  const mlSignal = makeSignal(snapshot);
  stage("ML", "ML early-warning signal", "إشارة ML مبكرة", `Isolation Forest advisory score: ${mlSignal.score}/100. It does not influence the decision.`, `درجة إشارة Isolation Forest الاستشارية: ${mlSignal.score}/100. لا تؤثر في القرار.`);
  score = Math.min(100, Math.max(0, score));
  let decision = decisionFor(score);
  let policyOverride: string | undefined;
  let policyOverrideAr: string | undefined;
  if (website?.classification === "Needs Review" && decision === "Approve") {
    decision = "Additional Verification";
    policyOverride = "Needs Review website policy requires additional verification.";
    policyOverrideAr = "سياسة الموقع الذي يحتاج مراجعة تفرض تحققًا إضافيًا.";
  }
  if (website?.mandatoryOverride) {
    decision = "Manual Review";
    policyOverride = "High Risk website policy requires manual review and cannot be bypassed.";
    policyOverrideAr = "سياسة الموقع عالي المخاطر تفرض مراجعة يدوية ولا يمكن تجاوزها.";
    addFactor(factors, { id: "website-override", title: "Mandatory website policy override", titleAr: "تجاوز إلزامي لسياسة الموقع", points: 0, category: "Policy", evidence: "High Risk website classification is an immutable manual-review trigger.", evidenceAr: "تصنيف الموقع عالي المخاطر هو سبب ثابت للمراجعة اليدوية." });
  }
  const riskLevel = riskLevelFor(score);
  stage("DECISION", "Deterministic decision", "القرار الحتمي", `${riskLevel} risk; ${decision}.`, `مخاطر ${AR_RISK_LEVELS[riskLevel]}; القرار: ${AR_DECISIONS[decision]}.`);
  const alertCreated = decision === "Temporary Hold" || decision === "Manual Review" || score >= 61;
  const severity: "Medium" | "High" | "Critical" | undefined = score >= 81 ? "Critical" : score >= 61 ? "High" : score >= 31 ? "Medium" : undefined;
  stage("CASE", "Alert and case handling", "التنبيه والقضية", alertCreated ? `${severity} alert and review case opened.` : decision === "Additional Verification" ? "Verification case opened without an alert." : "No alert or case is required.", alertCreated ? `تم فتح تنبيه ${severity} وقضية مراجعة.` : decision === "Additional Verification" ? "تم فتح حالة تحقق من دون تنبيه." : "لا يلزم تنبيه أو قضية.");
  stage("ARTIFACT", "Explainable artifact ready", "جاهزية ملف التفسير", "Snapshot, factors, audit trail, and advisory signal are ready for investigation.", "لقطة القرار والعوامل وسجل التدقيق والإشارة الاستشارية جاهزة للتحقيق.");
  const ruleAssessment = { score, riskLevel, decision };
  const base = {
    id: nanoid(14), snapshot, score, riskLevel, decision, ruleAssessment, compositeDecision: pendingCompositeDecision(ruleAssessment), policyOverride, policyOverrideAr, factors, website, mlSignal, audit,
    alert: { created: alertCreated, severity },
    case: { created: decision !== "Approve", status: decision === "Approve" ? "Not required" as const : "Open" as const },
  };
  return base;
}

export function deterministicReport(result: Omit<AnalysisResult, "report">, locale: "en" | "ar" = "en") {
  return fallbackReport(result, locale);
}
