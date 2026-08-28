export type Locale = "en" | "ar";
export type Decision = "Approve" | "Additional Verification" | "Temporary Hold" | "Manual Review";
export type RiskLevel = "Low" | "Medium" | "High" | "Critical";
export type WebsiteClass = "Trusted" | "Needs Review" | "High Risk";

export type CustomerProfile = {
  id: string;
  name: string;
  nameAr: string;
  averageAmount: number;
  transactionCount: number;
  usualCountries: string[];
  trustedBeneficiaries: string[];
  usualHours: [number, number];
  priorRisk: boolean;
};

export type TransactionInput = {
  customerId: string;
  amount: number;
  currency: "SAR";
  destinationCountry: string;
  beneficiaryName: string;
  transactionType: "Local Transfer" | "International Transfer" | "Merchant Payment" | "Personal Transfer";
  websiteDomain?: string;
  submittedAt?: string;
};

export type RiskFactor = {
  id: string;
  title: string;
  titleAr: string;
  points: number;
  category: "Customer" | "Transaction" | "Beneficiary" | "Website" | "Behaviour" | "Policy";
  evidence: string;
  evidenceAr: string;
};

export type AuditStage = {
  index: number;
  code: string;
  label: string;
  labelAr: string;
  detail: string;
  detailAr: string;
};

export type WebsiteAssessment = {
  domain: string;
  classification: WebsiteClass;
  score: number;
  indicators: { label: string; labelAr: string; points: number }[];
  mandatoryOverride: boolean;
};

export type MlSignal = {
  score: number;
  level: "Routine" | "Elevated" | "High";
  method: "Isolation Forest";
  advisory: true;
  explanation: string;
  explanationAr: string;
  featureSignals: string[];
};

export type DecisionSnapshot = {
  snapshotId: string;
  frozenAt: string;
  customer: CustomerProfile;
  transaction: TransactionInput & { submittedAt: string };
  derived: {
    amountToAverageRatio: number;
    newBeneficiary: boolean;
    newCountry: boolean;
    noHistoricalBaseline: boolean;
    outsideUsualHours: boolean;
  };
};

export type InvestigationReport = {
  source: "Gemini AI" | "Local AI" | "Deterministic fallback";
  completion?: "model" | "deterministic-completion";
  locale: Locale;
  evidence: string[];
  analysis: string;
  references: RegulatoryReference[];
  actions: string[];
  rag?: import("./rag").RagGrounding;
  aiRecommendation?: AiDecisionRecommendation;
};

export type RuleAssessment = {
  score: number;
  riskLevel: RiskLevel;
  decision: Decision;
};

export type AiDecisionRecommendation = {
  availability: "available" | "unavailable";
  decision: Decision;
  riskLevel: RiskLevel;
  score: number;
  confidence: number;
  rationale: string;
  reviewItems: string[];
};

export type CompositeDecision = {
  ruleAssessment: RuleAssessment;
  finalScore: number;
  finalRiskLevel: RiskLevel;
  finalDecision: Decision;
  outcome: "awaiting_ai" | "aligned" | "ai_escalated" | "rule_guardrail" | "policy_guardrail" | "ai_unavailable";
  rationale: string;
  rationaleAr: string;
};

export type RegulatoryReference = {
  id: "sama-aml-ctf" | "fatf-rba" | "sdaia-ai-ethics";
  authority: "SAMA" | "FATF" | "SDAIA";
  authorityAr: "ساما" | "FATF" | "سدايا";
  title: string;
  titleAr: string;
  url: string;
  context: string;
  contextAr: string;
};

export type AnalysisResult = {
  id: string;
  snapshot: DecisionSnapshot;
  score: number;
  riskLevel: RiskLevel;
  decision: Decision;
  ruleAssessment: RuleAssessment;
  compositeDecision: CompositeDecision;
  aiRecommendation?: AiDecisionRecommendation;
  policyOverride?: string;
  policyOverrideAr?: string;
  factors: RiskFactor[];
  website?: WebsiteAssessment;
  mlSignal: MlSignal;
  audit: AuditStage[];
  alert: { created: boolean; severity?: "Medium" | "High" | "Critical" };
  case: { created: boolean; status: "Not required" | "Open" };
  report: InvestigationReport;
};

/** Older persisted demo records predate composite decisions. Read them as a
 * rule-floor outcome until they are refreshed, rather than failing the UI. */
export function ruleAssessmentFor(result: Pick<AnalysisResult, "score" | "riskLevel" | "decision"> & Partial<Pick<AnalysisResult, "ruleAssessment">>): RuleAssessment {
  return result.ruleAssessment ?? { score: result.score, riskLevel: result.riskLevel, decision: result.decision };
}

export function compositeDecisionFor(result: Pick<AnalysisResult, "score" | "riskLevel" | "decision"> & Partial<Pick<AnalysisResult, "ruleAssessment" | "compositeDecision">>): CompositeDecision {
  const ruleAssessment = ruleAssessmentFor(result);
  return result.compositeDecision ?? {
    ruleAssessment,
    finalScore: result.score,
    finalRiskLevel: result.riskLevel,
    finalDecision: result.decision,
    outcome: "ai_unavailable",
    rationale: "This record predates an available AI decision recommendation, so the rule assessment remains in force.",
    rationaleAr: "يسبق هذا السجل توفر توصية قرار من الذكاء الاصطناعي، لذلك يبقى تقييم القواعد نافذًا.",
  };
}

export const customers: CustomerProfile[] = [
  {
    id: "ahmed",
    name: "Ahmed Al-Otaibi",
    nameAr: "أحمد العتيبي",
    averageAmount: 3200,
    transactionCount: 47,
    usualCountries: ["Saudi Arabia", "UAE"],
    trustedBeneficiaries: ["Sara Al-Mutairi"],
    usualHours: [9, 18],
    priorRisk: false,
  },
  {
    id: "noura",
    name: "Noura Al-Dosari",
    nameAr: "نورة الدوسري",
    averageAmount: 5800,
    transactionCount: 23,
    usualCountries: ["Saudi Arabia", "Philippines", "UK"],
    trustedBeneficiaries: ["Maria Santos"],
    usualHours: [11, 21],
    priorRisk: false,
  },
  {
    id: "khalid",
    name: "Khalid Al-Shahri",
    nameAr: "خالد الشهري",
    averageAmount: 4100,
    transactionCount: 18,
    usualCountries: ["Saudi Arabia", "Pakistan"],
    trustedBeneficiaries: [],
    usualHours: [9, 18],
    priorRisk: false,
  },
  {
    id: "mohammed",
    name: "Mohammed Al-Ghamdi",
    nameAr: "محمد الغامدي",
    averageAmount: 12000,
    transactionCount: 9,
    usualCountries: ["Saudi Arabia", "UAE", "Turkey"],
    trustedBeneficiaries: [],
    usualHours: [8, 17],
    priorRisk: true,
  },
  {
    id: "layan",
    name: "Layan Al-Harbi",
    nameAr: "ليان الحربي",
    averageAmount: 8900,
    transactionCount: 31,
    usualCountries: ["Saudi Arabia", "US", "UK"],
    trustedBeneficiaries: ["Bright Market KSA"],
    usualHours: [8, 22],
    priorRisk: false,
  },
];

/** Fixed demo midday ensures every replay has the same advisory ML signal. */
const DEMO_REFERENCE_TIME = "2026-08-13T12:00:00.000Z";

export const demoScenarios: Array<{ id: string; title: string; titleAr: string; description: string; input: TransactionInput }> = [
  {
    id: "safe",
    title: "Routine local transfer",
    titleAr: "تحويل محلي اعتيادي",
    description: "Known beneficiary, usual country, and low-value amount.",
    input: { customerId: "ahmed", amount: 1800, currency: "SAR", destinationCountry: "Saudi Arabia", beneficiaryName: "Sara Al-Mutairi", transactionType: "Local Transfer", submittedAt: DEMO_REFERENCE_TIME },
  },
  {
    id: "verify",
    title: "International transfer with customer behaviour change",
    titleAr: "تحويل دولي مع تغيّر نمط العميل",
    description: "International transfer threshold and behaviour deviation.",
    input: { customerId: "noura", amount: 12000, currency: "SAR", destinationCountry: "Philippines", beneficiaryName: "Maria Santos", transactionType: "International Transfer", submittedAt: DEMO_REFERENCE_TIME },
  },
  {
    id: "website",
    title: "Suspicious merchant domain",
    titleAr: "موقع تاجر مشبوه",
    description: "A mandatory policy override is applied for a high-risk domain.",
    input: { customerId: "ahmed", amount: 3200, currency: "SAR", destinationCountry: "Saudi Arabia", beneficiaryName: "Sara Al-Mutairi", transactionType: "Merchant Payment", websiteDomain: "alrajh-sa-secure.com", submittedAt: DEMO_REFERENCE_TIME },
  },
  {
    id: "laundering",
    title: "New beneficiary with composite AML signal",
    titleAr: "مستفيد جديد مع إشارة غسل أموال مركبة",
    description: "Prior-risk profile, high-risk corridor, new beneficiary, and material deviation.",
    input: { customerId: "mohammed", amount: 74000, currency: "SAR", destinationCountry: "High-risk jurisdiction", beneficiaryName: "Global Trade FZE", transactionType: "International Transfer", submittedAt: DEMO_REFERENCE_TIME },
  },
];
