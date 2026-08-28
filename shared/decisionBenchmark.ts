import type { CustomerProfile, Decision, RiskLevel, TransactionInput } from "./sentinel";
import { runDeterministicAnalysis } from "../server/sentinelEngine";

export const DECISION_BENCHMARK_VERSION = "1.0.0";
export const BENCHMARK_TOTAL_CASES = 240;
export const BENCHMARK_EVALUATION_TIME = "2026-08-13T12:00:00.000Z";

export type BenchmarkCategoryId =
  | "standard_normal"
  | "additional_verification"
  | "mandatory_policy"
  | "compound_aml"
  | "policy_boundary";

export type BenchmarkCategoryInfo = {
  id: BenchmarkCategoryId;
  nameEn: string;
  nameAr: string;
  descriptionEn: string;
  descriptionAr: string;
  targetCount: number;
};

export const BENCHMARK_CATEGORIES: Record<BenchmarkCategoryId, BenchmarkCategoryInfo> = {
  standard_normal: {
    id: "standard_normal",
    nameEn: "Standard & Routine",
    nameAr: "حالات اعتيادية وطبيعية",
    descriptionEn: "Routine transactions within regular customer baseline and trusted counterparty patterns.",
    descriptionAr: "معاملات اعتيادية ضمن خط الأساس المعتاد للعميل ونمط المستفيدين الموثوقين.",
    targetCount: 60,
  },
  additional_verification: {
    id: "additional_verification",
    nameEn: "Additional Verification",
    nameAr: "تحقق إضافي مشدد",
    descriptionEn: "Transactions exhibiting single moderate anomalies or cross-border thresholds.",
    descriptionAr: "معاملات تُظهر انحرافًا معتدلاً مفردًا أو تجاوزًا لحدود التحويل الدولي.",
    targetCount: 50,
  },
  mandatory_policy: {
    id: "mandatory_policy",
    nameEn: "Mandatory Policy Overrides",
    nameAr: "سياسات إلزامية قطعية",
    descriptionEn: "Interactions triggering immutable policy guardrails such as high-risk domain intelligence.",
    descriptionAr: "معاملات تُفعل حواجز سياسة غير قابلة للتجاوز مثل استخبارات النطاقات عالية المخاطر.",
    targetCount: 40,
  },
  compound_aml: {
    id: "compound_aml",
    nameEn: "Compound AML Risks",
    nameAr: "مخاطر AML مركبة",
    descriptionEn: "High-risk jurisdictions, prior customer risk flags, and multi-signal risk compositions.",
    descriptionAr: "ممرات عالية المخاطر وسوابق اشتباه وتراكم متعدد لإشارات غسل الأموال.",
    targetCount: 50,
  },
  policy_boundary: {
    id: "policy_boundary",
    nameEn: "Policy Boundary Cases",
    nameAr: "حالات حدودية للسياسة",
    descriptionEn: "Precision test cases at exact rule thresholds, baseline multiples, and amount floors.",
    descriptionAr: "حالات اختبار دقيقة عند العتبات الحدية للقواعد ومضاعفات خط الأساس وحدود المبالغ.",
    targetCount: 40,
  },
};

export type BenchmarkCase = {
  id: string;
  category: BenchmarkCategoryId;
  titleEn: string;
  titleAr: string;
  descriptionEn: string;
  descriptionAr: string;
  expectedDecision: Decision;
  expectedRiskLevel: RiskLevel;
  customer: CustomerProfile;
  input: TransactionInput;
};

export type BenchmarkCaseResult = {
  caseId: string;
  category: BenchmarkCategoryId;
  titleEn: string;
  titleAr: string;
  descriptionEn: string;
  descriptionAr: string;
  expectedDecision: Decision;
  actualDecision: Decision;
  expectedRiskLevel: RiskLevel;
  actualRiskLevel: RiskLevel;
  rulesScore: number;
  behaviorScore: number;
  behaviorLevel: "Routine" | "Elevated" | "High";
  matched: boolean;
  factorsCount: number;
  factorsTriggeredEn: string[];
  factorsTriggeredAr: string[];
  policyOverride?: string;
  policyOverrideAr?: string;
  amount: number;
  destinationCountry: string;
};

export type BenchmarkCategoryStat = {
  total: number;
  matched: number;
  agreementPct: number;
  nameEn: string;
  nameAr: string;
  descriptionEn: string;
  descriptionAr: string;
};

export type BenchmarkMetrics = {
  totalCases: number;
  matchedCases: number;
  decisionPolicyAgreement: number;
  requiredReviewCapture: number;
  unneededEscalation: number;
  categoryBreakdown: Record<BenchmarkCategoryId, BenchmarkCategoryStat>;
};

export type BenchmarkSampleCase = {
  id: string;
  category: BenchmarkCategoryId;
  categoryNameEn: string;
  categoryNameAr: string;
  titleEn: string;
  titleAr: string;
  descriptionEn: string;
  descriptionAr: string;
  expectedDecision: Decision;
  engineDecision: Decision;
  rulesScore: number;
  behaviorScore: number;
  behaviorLevel: "Routine" | "Elevated" | "High";
  matched: boolean;
  factorsTriggeredEn: string[];
  factorsTriggeredAr: string[];
  policyOverride?: string;
  policyOverrideAr?: string;
  amount: number;
  destinationCountry: string;
};

export type DecisionBenchmarkReport = {
  version: string;
  badge: { ar: string; en: string };
  title: { ar: string; en: string };
  explanation: { ar: string; en: string };
  disclaimer: { ar: string; en: string };
  evaluatedAt: string;
  metrics: BenchmarkMetrics;
  sampleCases: BenchmarkSampleCase[];
};

export const BENCHMARK_CASES: BenchmarkCase[] = [
  {
    "id": "BENCH-001",
    "category": "standard_normal",
    "titleEn": "Routine local transaction #1 (Personal Transfer)",
    "titleAr": "عملية اعتيادية رقم 1 (تحويل محلي)",
    "descriptionEn": "Normal amount within profile baseline, trusted beneficiary, and standard corridor.",
    "descriptionAr": "مبلغ اعتيادي ضمن خط الأساس للعميل ومستفيد موثوق وممر اعتيادي.",
    "expectedDecision": "Approve",
    "expectedRiskLevel": "Low",
    "customer": {
      "id": "bench-std-001",
      "name": "Ahmed Al-Otaibi",
      "nameAr": "أحمد العتيبي",
      "averageAmount": 3170,
      "transactionCount": 26,
      "usualCountries": [
        "Saudi Arabia",
        "UAE"
      ],
      "trustedBeneficiaries": [
        "Sara Al-Mutairi",
        "Sara Al-Mutairi"
      ],
      "usualHours": [
        8,
        22
      ],
      "priorRisk": false
    },
    "input": {
      "customerId": "bench-std-001",
      "amount": 729,
      "currency": "SAR",
      "destinationCountry": "Saudi Arabia",
      "beneficiaryName": "Sara Al-Mutairi",
      "transactionType": "Personal Transfer",
      "submittedAt": "2026-08-13T12:00:00.000Z"
    }
  },
  {
    "id": "BENCH-002",
    "category": "standard_normal",
    "titleEn": "Routine local transaction #2 (Local Transfer)",
    "titleAr": "عملية اعتيادية رقم 2 (تحويل محلي)",
    "descriptionEn": "Normal amount within profile baseline, trusted beneficiary, and standard corridor.",
    "descriptionAr": "مبلغ اعتيادي ضمن خط الأساس للعميل ومستفيد موثوق وممر اعتيادي.",
    "expectedDecision": "Approve",
    "expectedRiskLevel": "Low",
    "customer": {
      "id": "bench-std-002",
      "name": "Noura Al-Dosari",
      "nameAr": "نورة الدوسري",
      "averageAmount": 3340,
      "transactionCount": 27,
      "usualCountries": [
        "Saudi Arabia",
        "UAE"
      ],
      "trustedBeneficiaries": [
        "Bright Market KSA",
        "Sara Al-Mutairi"
      ],
      "usualHours": [
        8,
        22
      ],
      "priorRisk": false
    },
    "input": {
      "customerId": "bench-std-002",
      "amount": 1035,
      "currency": "SAR",
      "destinationCountry": "Saudi Arabia",
      "beneficiaryName": "Bright Market KSA",
      "transactionType": "Local Transfer",
      "submittedAt": "2026-08-13T12:00:00.000Z"
    }
  },
  {
    "id": "BENCH-003",
    "category": "standard_normal",
    "titleEn": "Routine local transaction #3 (Merchant Payment)",
    "titleAr": "عملية اعتيادية رقم 3 (دفع تاجر)",
    "descriptionEn": "Normal amount within profile baseline, trusted beneficiary, and standard corridor.",
    "descriptionAr": "مبلغ اعتيادي ضمن خط الأساس للعميل ومستفيد موثوق وممر اعتيادي.",
    "expectedDecision": "Approve",
    "expectedRiskLevel": "Low",
    "customer": {
      "id": "bench-std-003",
      "name": "Layan Al-Harbi",
      "nameAr": "ليان الحربي",
      "averageAmount": 3510,
      "transactionCount": 28,
      "usualCountries": [
        "Saudi Arabia",
        "UAE"
      ],
      "trustedBeneficiaries": [
        "Tariq Al-Nasser",
        "Sara Al-Mutairi"
      ],
      "usualHours": [
        8,
        22
      ],
      "priorRisk": false
    },
    "input": {
      "customerId": "bench-std-003",
      "amount": 1368,
      "currency": "SAR",
      "destinationCountry": "Saudi Arabia",
      "beneficiaryName": "Tariq Al-Nasser",
      "transactionType": "Merchant Payment",
      "websiteDomain": "alrajhibank.com.sa",
      "submittedAt": "2026-08-13T12:00:00.000Z"
    }
  },
  {
    "id": "BENCH-004",
    "category": "standard_normal",
    "titleEn": "Routine local transaction #4 (Local Transfer)",
    "titleAr": "عملية اعتيادية رقم 4 (تحويل محلي)",
    "descriptionEn": "Normal amount within profile baseline, trusted beneficiary, and standard corridor.",
    "descriptionAr": "مبلغ اعتيادي ضمن خط الأساس للعميل ومستفيد موثوق وممر اعتيادي.",
    "expectedDecision": "Approve",
    "expectedRiskLevel": "Low",
    "customer": {
      "id": "bench-std-004",
      "name": "Fahad Al-Qahtani",
      "nameAr": "فهد القحطاني",
      "averageAmount": 3680,
      "transactionCount": 29,
      "usualCountries": [
        "Saudi Arabia",
        "UAE"
      ],
      "trustedBeneficiaries": [
        "Hala Al-Otaibi",
        "Sara Al-Mutairi"
      ],
      "usualHours": [
        8,
        22
      ],
      "priorRisk": false
    },
    "input": {
      "customerId": "bench-std-004",
      "amount": 1729,
      "currency": "SAR",
      "destinationCountry": "Saudi Arabia",
      "beneficiaryName": "Hala Al-Otaibi",
      "transactionType": "Local Transfer",
      "submittedAt": "2026-08-13T12:00:00.000Z"
    }
  },
  {
    "id": "BENCH-005",
    "category": "standard_normal",
    "titleEn": "Routine local transaction #5 (Personal Transfer)",
    "titleAr": "عملية اعتيادية رقم 5 (تحويل محلي)",
    "descriptionEn": "Normal amount within profile baseline, trusted beneficiary, and standard corridor.",
    "descriptionAr": "مبلغ اعتيادي ضمن خط الأساس للعميل ومستفيد موثوق وممر اعتيادي.",
    "expectedDecision": "Approve",
    "expectedRiskLevel": "Low",
    "customer": {
      "id": "bench-std-005",
      "name": "Reem Al-Ghamdi",
      "nameAr": "ريم الغامدي",
      "averageAmount": 3850,
      "transactionCount": 30,
      "usualCountries": [
        "Saudi Arabia",
        "UAE"
      ],
      "trustedBeneficiaries": [
        "Al-Inma Utility",
        "Sara Al-Mutairi"
      ],
      "usualHours": [
        8,
        22
      ],
      "priorRisk": false
    },
    "input": {
      "customerId": "bench-std-005",
      "amount": 2117,
      "currency": "SAR",
      "destinationCountry": "Saudi Arabia",
      "beneficiaryName": "Al-Inma Utility",
      "transactionType": "Personal Transfer",
      "submittedAt": "2026-08-13T12:00:00.000Z"
    }
  },
  {
    "id": "BENCH-006",
    "category": "standard_normal",
    "titleEn": "Routine local transaction #6 (Merchant Payment)",
    "titleAr": "عملية اعتيادية رقم 6 (دفع تاجر)",
    "descriptionEn": "Normal amount within profile baseline, trusted beneficiary, and standard corridor.",
    "descriptionAr": "مبلغ اعتيادي ضمن خط الأساس للعميل ومستفيد موثوق وممر اعتيادي.",
    "expectedDecision": "Approve",
    "expectedRiskLevel": "Low",
    "customer": {
      "id": "bench-std-006",
      "name": "Saud Al-Shammari",
      "nameAr": "سعود الشمري",
      "averageAmount": 4020,
      "transactionCount": 31,
      "usualCountries": [
        "Saudi Arabia",
        "UAE"
      ],
      "trustedBeneficiaries": [
        "Saudi Telecom STC",
        "Sara Al-Mutairi"
      ],
      "usualHours": [
        8,
        22
      ],
      "priorRisk": false
    },
    "input": {
      "customerId": "bench-std-006",
      "amount": 2532,
      "currency": "SAR",
      "destinationCountry": "Saudi Arabia",
      "beneficiaryName": "Saudi Telecom STC",
      "transactionType": "Merchant Payment",
      "websiteDomain": "alrajhibank.com.sa",
      "submittedAt": "2026-08-13T12:00:00.000Z"
    }
  },
  {
    "id": "BENCH-007",
    "category": "standard_normal",
    "titleEn": "Routine local transaction #7 (Personal Transfer)",
    "titleAr": "عملية اعتيادية رقم 7 (تحويل محلي)",
    "descriptionEn": "Normal amount within profile baseline, trusted beneficiary, and standard corridor.",
    "descriptionAr": "مبلغ اعتيادي ضمن خط الأساس للعميل ومستفيد موثوق وممر اعتيادي.",
    "expectedDecision": "Approve",
    "expectedRiskLevel": "Low",
    "customer": {
      "id": "bench-std-007",
      "name": "Ahmed Al-Otaibi",
      "nameAr": "أحمد العتيبي",
      "averageAmount": 4190,
      "transactionCount": 32,
      "usualCountries": [
        "Saudi Arabia",
        "UAE"
      ],
      "trustedBeneficiaries": [
        "Jarir Bookstore",
        "Sara Al-Mutairi"
      ],
      "usualHours": [
        8,
        22
      ],
      "priorRisk": false
    },
    "input": {
      "customerId": "bench-std-007",
      "amount": 2974,
      "currency": "SAR",
      "destinationCountry": "Saudi Arabia",
      "beneficiaryName": "Jarir Bookstore",
      "transactionType": "Personal Transfer",
      "submittedAt": "2026-08-13T12:00:00.000Z"
    }
  },
  {
    "id": "BENCH-008",
    "category": "standard_normal",
    "titleEn": "Routine local transaction #8 (Local Transfer)",
    "titleAr": "عملية اعتيادية رقم 8 (تحويل محلي)",
    "descriptionEn": "Normal amount within profile baseline, trusted beneficiary, and standard corridor.",
    "descriptionAr": "مبلغ اعتيادي ضمن خط الأساس للعميل ومستفيد موثوق وممر اعتيادي.",
    "expectedDecision": "Approve",
    "expectedRiskLevel": "Low",
    "customer": {
      "id": "bench-std-008",
      "name": "Noura Al-Dosari",
      "nameAr": "نورة الدوسري",
      "averageAmount": 4360,
      "transactionCount": 33,
      "usualCountries": [
        "Saudi Arabia",
        "UAE"
      ],
      "trustedBeneficiaries": [
        "Tamimi Markets",
        "Sara Al-Mutairi"
      ],
      "usualHours": [
        8,
        22
      ],
      "priorRisk": false
    },
    "input": {
      "customerId": "bench-std-008",
      "amount": 3444,
      "currency": "SAR",
      "destinationCountry": "Saudi Arabia",
      "beneficiaryName": "Tamimi Markets",
      "transactionType": "Local Transfer",
      "submittedAt": "2026-08-13T12:00:00.000Z"
    }
  },
  {
    "id": "BENCH-009",
    "category": "standard_normal",
    "titleEn": "Routine local transaction #9 (Merchant Payment)",
    "titleAr": "عملية اعتيادية رقم 9 (دفع تاجر)",
    "descriptionEn": "Normal amount within profile baseline, trusted beneficiary, and standard corridor.",
    "descriptionAr": "مبلغ اعتيادي ضمن خط الأساس للعميل ومستفيد موثوق وممر اعتيادي.",
    "expectedDecision": "Approve",
    "expectedRiskLevel": "Low",
    "customer": {
      "id": "bench-std-009",
      "name": "Layan Al-Harbi",
      "nameAr": "ليان الحربي",
      "averageAmount": 4530,
      "transactionCount": 34,
      "usualCountries": [
        "Saudi Arabia",
        "UAE"
      ],
      "trustedBeneficiaries": [
        "Sara Al-Mutairi",
        "Sara Al-Mutairi"
      ],
      "usualHours": [
        8,
        22
      ],
      "priorRisk": false
    },
    "input": {
      "customerId": "bench-std-009",
      "amount": 3941,
      "currency": "SAR",
      "destinationCountry": "Saudi Arabia",
      "beneficiaryName": "Sara Al-Mutairi",
      "transactionType": "Merchant Payment",
      "websiteDomain": "alrajhibank.com.sa",
      "submittedAt": "2026-08-13T12:00:00.000Z"
    }
  },
  {
    "id": "BENCH-010",
    "category": "standard_normal",
    "titleEn": "Routine local transaction #10 (Local Transfer)",
    "titleAr": "عملية اعتيادية رقم 10 (تحويل محلي)",
    "descriptionEn": "Normal amount within profile baseline, trusted beneficiary, and standard corridor.",
    "descriptionAr": "مبلغ اعتيادي ضمن خط الأساس للعميل ومستفيد موثوق وممر اعتيادي.",
    "expectedDecision": "Approve",
    "expectedRiskLevel": "Low",
    "customer": {
      "id": "bench-std-010",
      "name": "Fahad Al-Qahtani",
      "nameAr": "فهد القحطاني",
      "averageAmount": 4700,
      "transactionCount": 35,
      "usualCountries": [
        "Saudi Arabia",
        "UAE"
      ],
      "trustedBeneficiaries": [
        "Bright Market KSA",
        "Sara Al-Mutairi"
      ],
      "usualHours": [
        8,
        22
      ],
      "priorRisk": false
    },
    "input": {
      "customerId": "bench-std-010",
      "amount": 705,
      "currency": "SAR",
      "destinationCountry": "Saudi Arabia",
      "beneficiaryName": "Bright Market KSA",
      "transactionType": "Local Transfer",
      "submittedAt": "2026-08-13T12:00:00.000Z"
    }
  },
  {
    "id": "BENCH-011",
    "category": "standard_normal",
    "titleEn": "Routine local transaction #11 (Personal Transfer)",
    "titleAr": "عملية اعتيادية رقم 11 (تحويل محلي)",
    "descriptionEn": "Normal amount within profile baseline, trusted beneficiary, and standard corridor.",
    "descriptionAr": "مبلغ اعتيادي ضمن خط الأساس للعميل ومستفيد موثوق وممر اعتيادي.",
    "expectedDecision": "Approve",
    "expectedRiskLevel": "Low",
    "customer": {
      "id": "bench-std-011",
      "name": "Reem Al-Ghamdi",
      "nameAr": "ريم الغامدي",
      "averageAmount": 4870,
      "transactionCount": 36,
      "usualCountries": [
        "Saudi Arabia",
        "UAE"
      ],
      "trustedBeneficiaries": [
        "Tariq Al-Nasser",
        "Sara Al-Mutairi"
      ],
      "usualHours": [
        8,
        22
      ],
      "priorRisk": false
    },
    "input": {
      "customerId": "bench-std-011",
      "amount": 1120,
      "currency": "SAR",
      "destinationCountry": "Saudi Arabia",
      "beneficiaryName": "Tariq Al-Nasser",
      "transactionType": "Personal Transfer",
      "submittedAt": "2026-08-13T12:00:00.000Z"
    }
  },
  {
    "id": "BENCH-012",
    "category": "standard_normal",
    "titleEn": "Routine local transaction #12 (Merchant Payment)",
    "titleAr": "عملية اعتيادية رقم 12 (دفع تاجر)",
    "descriptionEn": "Normal amount within profile baseline, trusted beneficiary, and standard corridor.",
    "descriptionAr": "مبلغ اعتيادي ضمن خط الأساس للعميل ومستفيد موثوق وممر اعتيادي.",
    "expectedDecision": "Approve",
    "expectedRiskLevel": "Low",
    "customer": {
      "id": "bench-std-012",
      "name": "Saud Al-Shammari",
      "nameAr": "سعود الشمري",
      "averageAmount": 5040,
      "transactionCount": 37,
      "usualCountries": [
        "Saudi Arabia",
        "UAE"
      ],
      "trustedBeneficiaries": [
        "Hala Al-Otaibi",
        "Sara Al-Mutairi"
      ],
      "usualHours": [
        8,
        22
      ],
      "priorRisk": false
    },
    "input": {
      "customerId": "bench-std-012",
      "amount": 1562,
      "currency": "SAR",
      "destinationCountry": "Saudi Arabia",
      "beneficiaryName": "Hala Al-Otaibi",
      "transactionType": "Merchant Payment",
      "websiteDomain": "alrajhibank.com.sa",
      "submittedAt": "2026-08-13T12:00:00.000Z"
    }
  },
  {
    "id": "BENCH-013",
    "category": "standard_normal",
    "titleEn": "Routine local transaction #13 (Personal Transfer)",
    "titleAr": "عملية اعتيادية رقم 13 (تحويل محلي)",
    "descriptionEn": "Normal amount within profile baseline, trusted beneficiary, and standard corridor.",
    "descriptionAr": "مبلغ اعتيادي ضمن خط الأساس للعميل ومستفيد موثوق وممر اعتيادي.",
    "expectedDecision": "Approve",
    "expectedRiskLevel": "Low",
    "customer": {
      "id": "bench-std-013",
      "name": "Ahmed Al-Otaibi",
      "nameAr": "أحمد العتيبي",
      "averageAmount": 5210,
      "transactionCount": 38,
      "usualCountries": [
        "Saudi Arabia",
        "UAE"
      ],
      "trustedBeneficiaries": [
        "Al-Inma Utility",
        "Sara Al-Mutairi"
      ],
      "usualHours": [
        8,
        22
      ],
      "priorRisk": false
    },
    "input": {
      "customerId": "bench-std-013",
      "amount": 2031,
      "currency": "SAR",
      "destinationCountry": "Saudi Arabia",
      "beneficiaryName": "Al-Inma Utility",
      "transactionType": "Personal Transfer",
      "submittedAt": "2026-08-13T12:00:00.000Z"
    }
  },
  {
    "id": "BENCH-014",
    "category": "standard_normal",
    "titleEn": "Routine local transaction #14 (Local Transfer)",
    "titleAr": "عملية اعتيادية رقم 14 (تحويل محلي)",
    "descriptionEn": "Normal amount within profile baseline, trusted beneficiary, and standard corridor.",
    "descriptionAr": "مبلغ اعتيادي ضمن خط الأساس للعميل ومستفيد موثوق وممر اعتيادي.",
    "expectedDecision": "Approve",
    "expectedRiskLevel": "Low",
    "customer": {
      "id": "bench-std-014",
      "name": "Noura Al-Dosari",
      "nameAr": "نورة الدوسري",
      "averageAmount": 5380,
      "transactionCount": 39,
      "usualCountries": [
        "Saudi Arabia",
        "UAE"
      ],
      "trustedBeneficiaries": [
        "Saudi Telecom STC",
        "Sara Al-Mutairi"
      ],
      "usualHours": [
        8,
        22
      ],
      "priorRisk": false
    },
    "input": {
      "customerId": "bench-std-014",
      "amount": 2528,
      "currency": "SAR",
      "destinationCountry": "Saudi Arabia",
      "beneficiaryName": "Saudi Telecom STC",
      "transactionType": "Local Transfer",
      "submittedAt": "2026-08-13T12:00:00.000Z"
    }
  },
  {
    "id": "BENCH-015",
    "category": "standard_normal",
    "titleEn": "Routine local transaction #15 (Merchant Payment)",
    "titleAr": "عملية اعتيادية رقم 15 (دفع تاجر)",
    "descriptionEn": "Normal amount within profile baseline, trusted beneficiary, and standard corridor.",
    "descriptionAr": "مبلغ اعتيادي ضمن خط الأساس للعميل ومستفيد موثوق وممر اعتيادي.",
    "expectedDecision": "Approve",
    "expectedRiskLevel": "Low",
    "customer": {
      "id": "bench-std-015",
      "name": "Layan Al-Harbi",
      "nameAr": "ليان الحربي",
      "averageAmount": 5550,
      "transactionCount": 40,
      "usualCountries": [
        "Saudi Arabia",
        "UAE"
      ],
      "trustedBeneficiaries": [
        "Jarir Bookstore",
        "Sara Al-Mutairi"
      ],
      "usualHours": [
        8,
        22
      ],
      "priorRisk": false
    },
    "input": {
      "customerId": "bench-std-015",
      "amount": 3052,
      "currency": "SAR",
      "destinationCountry": "Saudi Arabia",
      "beneficiaryName": "Jarir Bookstore",
      "transactionType": "Merchant Payment",
      "websiteDomain": "alrajhibank.com.sa",
      "submittedAt": "2026-08-13T12:00:00.000Z"
    }
  },
  {
    "id": "BENCH-016",
    "category": "standard_normal",
    "titleEn": "Routine local transaction #16 (Local Transfer)",
    "titleAr": "عملية اعتيادية رقم 16 (تحويل محلي)",
    "descriptionEn": "Normal amount within profile baseline, trusted beneficiary, and standard corridor.",
    "descriptionAr": "مبلغ اعتيادي ضمن خط الأساس للعميل ومستفيد موثوق وممر اعتيادي.",
    "expectedDecision": "Approve",
    "expectedRiskLevel": "Low",
    "customer": {
      "id": "bench-std-016",
      "name": "Fahad Al-Qahtani",
      "nameAr": "فهد القحطاني",
      "averageAmount": 5720,
      "transactionCount": 41,
      "usualCountries": [
        "Saudi Arabia",
        "UAE"
      ],
      "trustedBeneficiaries": [
        "Tamimi Markets",
        "Sara Al-Mutairi"
      ],
      "usualHours": [
        8,
        22
      ],
      "priorRisk": false
    },
    "input": {
      "customerId": "bench-std-016",
      "amount": 3603,
      "currency": "SAR",
      "destinationCountry": "Saudi Arabia",
      "beneficiaryName": "Tamimi Markets",
      "transactionType": "Local Transfer",
      "submittedAt": "2026-08-13T12:00:00.000Z"
    }
  },
  {
    "id": "BENCH-017",
    "category": "standard_normal",
    "titleEn": "Routine local transaction #17 (Personal Transfer)",
    "titleAr": "عملية اعتيادية رقم 17 (تحويل محلي)",
    "descriptionEn": "Normal amount within profile baseline, trusted beneficiary, and standard corridor.",
    "descriptionAr": "مبلغ اعتيادي ضمن خط الأساس للعميل ومستفيد موثوق وممر اعتيادي.",
    "expectedDecision": "Approve",
    "expectedRiskLevel": "Low",
    "customer": {
      "id": "bench-std-017",
      "name": "Reem Al-Ghamdi",
      "nameAr": "ريم الغامدي",
      "averageAmount": 5890,
      "transactionCount": 42,
      "usualCountries": [
        "Saudi Arabia",
        "UAE"
      ],
      "trustedBeneficiaries": [
        "Sara Al-Mutairi",
        "Sara Al-Mutairi"
      ],
      "usualHours": [
        8,
        22
      ],
      "priorRisk": false
    },
    "input": {
      "customerId": "bench-std-017",
      "amount": 4181,
      "currency": "SAR",
      "destinationCountry": "Saudi Arabia",
      "beneficiaryName": "Sara Al-Mutairi",
      "transactionType": "Personal Transfer",
      "submittedAt": "2026-08-13T12:00:00.000Z"
    }
  },
  {
    "id": "BENCH-018",
    "category": "standard_normal",
    "titleEn": "Routine local transaction #18 (Merchant Payment)",
    "titleAr": "عملية اعتيادية رقم 18 (دفع تاجر)",
    "descriptionEn": "Normal amount within profile baseline, trusted beneficiary, and standard corridor.",
    "descriptionAr": "مبلغ اعتيادي ضمن خط الأساس للعميل ومستفيد موثوق وممر اعتيادي.",
    "expectedDecision": "Approve",
    "expectedRiskLevel": "Low",
    "customer": {
      "id": "bench-std-018",
      "name": "Saud Al-Shammari",
      "nameAr": "سعود الشمري",
      "averageAmount": 6060,
      "transactionCount": 43,
      "usualCountries": [
        "Saudi Arabia",
        "UAE"
      ],
      "trustedBeneficiaries": [
        "Bright Market KSA",
        "Sara Al-Mutairi"
      ],
      "usualHours": [
        8,
        22
      ],
      "priorRisk": false
    },
    "input": {
      "customerId": "bench-std-018",
      "amount": 4787,
      "currency": "SAR",
      "destinationCountry": "Saudi Arabia",
      "beneficiaryName": "Bright Market KSA",
      "transactionType": "Merchant Payment",
      "websiteDomain": "alrajhibank.com.sa",
      "submittedAt": "2026-08-13T12:00:00.000Z"
    }
  },
  {
    "id": "BENCH-019",
    "category": "standard_normal",
    "titleEn": "Routine local transaction #19 (Personal Transfer)",
    "titleAr": "عملية اعتيادية رقم 19 (تحويل محلي)",
    "descriptionEn": "Normal amount within profile baseline, trusted beneficiary, and standard corridor.",
    "descriptionAr": "مبلغ اعتيادي ضمن خط الأساس للعميل ومستفيد موثوق وممر اعتيادي.",
    "expectedDecision": "Approve",
    "expectedRiskLevel": "Low",
    "customer": {
      "id": "bench-std-019",
      "name": "Ahmed Al-Otaibi",
      "nameAr": "أحمد العتيبي",
      "averageAmount": 6230,
      "transactionCount": 44,
      "usualCountries": [
        "Saudi Arabia",
        "UAE"
      ],
      "trustedBeneficiaries": [
        "Tariq Al-Nasser",
        "Sara Al-Mutairi"
      ],
      "usualHours": [
        8,
        22
      ],
      "priorRisk": false
    },
    "input": {
      "customerId": "bench-std-019",
      "amount": 5420,
      "currency": "SAR",
      "destinationCountry": "Saudi Arabia",
      "beneficiaryName": "Tariq Al-Nasser",
      "transactionType": "Personal Transfer",
      "submittedAt": "2026-08-13T12:00:00.000Z"
    }
  },
  {
    "id": "BENCH-020",
    "category": "standard_normal",
    "titleEn": "Routine local transaction #20 (Local Transfer)",
    "titleAr": "عملية اعتيادية رقم 20 (تحويل محلي)",
    "descriptionEn": "Normal amount within profile baseline, trusted beneficiary, and standard corridor.",
    "descriptionAr": "مبلغ اعتيادي ضمن خط الأساس للعميل ومستفيد موثوق وممر اعتيادي.",
    "expectedDecision": "Approve",
    "expectedRiskLevel": "Low",
    "customer": {
      "id": "bench-std-020",
      "name": "Noura Al-Dosari",
      "nameAr": "نورة الدوسري",
      "averageAmount": 6400,
      "transactionCount": 45,
      "usualCountries": [
        "Saudi Arabia",
        "UAE"
      ],
      "trustedBeneficiaries": [
        "Hala Al-Otaibi",
        "Sara Al-Mutairi"
      ],
      "usualHours": [
        8,
        22
      ],
      "priorRisk": false
    },
    "input": {
      "customerId": "bench-std-020",
      "amount": 960,
      "currency": "SAR",
      "destinationCountry": "Saudi Arabia",
      "beneficiaryName": "Hala Al-Otaibi",
      "transactionType": "Local Transfer",
      "submittedAt": "2026-08-13T12:00:00.000Z"
    }
  },
  {
    "id": "BENCH-021",
    "category": "standard_normal",
    "titleEn": "Routine local transaction #21 (Merchant Payment)",
    "titleAr": "عملية اعتيادية رقم 21 (دفع تاجر)",
    "descriptionEn": "Normal amount within profile baseline, trusted beneficiary, and standard corridor.",
    "descriptionAr": "مبلغ اعتيادي ضمن خط الأساس للعميل ومستفيد موثوق وممر اعتيادي.",
    "expectedDecision": "Approve",
    "expectedRiskLevel": "Low",
    "customer": {
      "id": "bench-std-021",
      "name": "Layan Al-Harbi",
      "nameAr": "ليان الحربي",
      "averageAmount": 6570,
      "transactionCount": 46,
      "usualCountries": [
        "Saudi Arabia",
        "UAE"
      ],
      "trustedBeneficiaries": [
        "Al-Inma Utility",
        "Sara Al-Mutairi"
      ],
      "usualHours": [
        8,
        22
      ],
      "priorRisk": false
    },
    "input": {
      "customerId": "bench-std-021",
      "amount": 1511,
      "currency": "SAR",
      "destinationCountry": "Saudi Arabia",
      "beneficiaryName": "Al-Inma Utility",
      "transactionType": "Merchant Payment",
      "websiteDomain": "alrajhibank.com.sa",
      "submittedAt": "2026-08-13T12:00:00.000Z"
    }
  },
  {
    "id": "BENCH-022",
    "category": "standard_normal",
    "titleEn": "Routine local transaction #22 (Local Transfer)",
    "titleAr": "عملية اعتيادية رقم 22 (تحويل محلي)",
    "descriptionEn": "Normal amount within profile baseline, trusted beneficiary, and standard corridor.",
    "descriptionAr": "مبلغ اعتيادي ضمن خط الأساس للعميل ومستفيد موثوق وممر اعتيادي.",
    "expectedDecision": "Approve",
    "expectedRiskLevel": "Low",
    "customer": {
      "id": "bench-std-022",
      "name": "Fahad Al-Qahtani",
      "nameAr": "فهد القحطاني",
      "averageAmount": 6740,
      "transactionCount": 47,
      "usualCountries": [
        "Saudi Arabia",
        "UAE"
      ],
      "trustedBeneficiaries": [
        "Saudi Telecom STC",
        "Sara Al-Mutairi"
      ],
      "usualHours": [
        8,
        22
      ],
      "priorRisk": false
    },
    "input": {
      "customerId": "bench-std-022",
      "amount": 2089,
      "currency": "SAR",
      "destinationCountry": "Saudi Arabia",
      "beneficiaryName": "Saudi Telecom STC",
      "transactionType": "Local Transfer",
      "submittedAt": "2026-08-13T12:00:00.000Z"
    }
  },
  {
    "id": "BENCH-023",
    "category": "standard_normal",
    "titleEn": "Routine local transaction #23 (Personal Transfer)",
    "titleAr": "عملية اعتيادية رقم 23 (تحويل محلي)",
    "descriptionEn": "Normal amount within profile baseline, trusted beneficiary, and standard corridor.",
    "descriptionAr": "مبلغ اعتيادي ضمن خط الأساس للعميل ومستفيد موثوق وممر اعتيادي.",
    "expectedDecision": "Approve",
    "expectedRiskLevel": "Low",
    "customer": {
      "id": "bench-std-023",
      "name": "Reem Al-Ghamdi",
      "nameAr": "ريم الغامدي",
      "averageAmount": 6910,
      "transactionCount": 48,
      "usualCountries": [
        "Saudi Arabia",
        "UAE"
      ],
      "trustedBeneficiaries": [
        "Jarir Bookstore",
        "Sara Al-Mutairi"
      ],
      "usualHours": [
        8,
        22
      ],
      "priorRisk": false
    },
    "input": {
      "customerId": "bench-std-023",
      "amount": 2694,
      "currency": "SAR",
      "destinationCountry": "Saudi Arabia",
      "beneficiaryName": "Jarir Bookstore",
      "transactionType": "Personal Transfer",
      "submittedAt": "2026-08-13T12:00:00.000Z"
    }
  },
  {
    "id": "BENCH-024",
    "category": "standard_normal",
    "titleEn": "Routine local transaction #24 (Merchant Payment)",
    "titleAr": "عملية اعتيادية رقم 24 (دفع تاجر)",
    "descriptionEn": "Normal amount within profile baseline, trusted beneficiary, and standard corridor.",
    "descriptionAr": "مبلغ اعتيادي ضمن خط الأساس للعميل ومستفيد موثوق وممر اعتيادي.",
    "expectedDecision": "Approve",
    "expectedRiskLevel": "Low",
    "customer": {
      "id": "bench-std-024",
      "name": "Saud Al-Shammari",
      "nameAr": "سعود الشمري",
      "averageAmount": 3080,
      "transactionCount": 49,
      "usualCountries": [
        "Saudi Arabia",
        "UAE"
      ],
      "trustedBeneficiaries": [
        "Tamimi Markets",
        "Sara Al-Mutairi"
      ],
      "usualHours": [
        8,
        22
      ],
      "priorRisk": false
    },
    "input": {
      "customerId": "bench-std-024",
      "amount": 1447,
      "currency": "SAR",
      "destinationCountry": "Saudi Arabia",
      "beneficiaryName": "Tamimi Markets",
      "transactionType": "Merchant Payment",
      "websiteDomain": "alrajhibank.com.sa",
      "submittedAt": "2026-08-13T12:00:00.000Z"
    }
  },
  {
    "id": "BENCH-025",
    "category": "standard_normal",
    "titleEn": "Routine local transaction #25 (Personal Transfer)",
    "titleAr": "عملية اعتيادية رقم 25 (تحويل محلي)",
    "descriptionEn": "Normal amount within profile baseline, trusted beneficiary, and standard corridor.",
    "descriptionAr": "مبلغ اعتيادي ضمن خط الأساس للعميل ومستفيد موثوق وممر اعتيادي.",
    "expectedDecision": "Approve",
    "expectedRiskLevel": "Low",
    "customer": {
      "id": "bench-std-025",
      "name": "Ahmed Al-Otaibi",
      "nameAr": "أحمد العتيبي",
      "averageAmount": 3250,
      "transactionCount": 50,
      "usualCountries": [
        "Saudi Arabia",
        "UAE"
      ],
      "trustedBeneficiaries": [
        "Sara Al-Mutairi",
        "Sara Al-Mutairi"
      ],
      "usualHours": [
        8,
        22
      ],
      "priorRisk": false
    },
    "input": {
      "customerId": "bench-std-025",
      "amount": 1787,
      "currency": "SAR",
      "destinationCountry": "Saudi Arabia",
      "beneficiaryName": "Sara Al-Mutairi",
      "transactionType": "Personal Transfer",
      "submittedAt": "2026-08-13T12:00:00.000Z"
    }
  },
  {
    "id": "BENCH-026",
    "category": "standard_normal",
    "titleEn": "Routine local transaction #26 (Local Transfer)",
    "titleAr": "عملية اعتيادية رقم 26 (تحويل محلي)",
    "descriptionEn": "Normal amount within profile baseline, trusted beneficiary, and standard corridor.",
    "descriptionAr": "مبلغ اعتيادي ضمن خط الأساس للعميل ومستفيد موثوق وممر اعتيادي.",
    "expectedDecision": "Approve",
    "expectedRiskLevel": "Low",
    "customer": {
      "id": "bench-std-026",
      "name": "Noura Al-Dosari",
      "nameAr": "نورة الدوسري",
      "averageAmount": 3420,
      "transactionCount": 51,
      "usualCountries": [
        "Saudi Arabia",
        "UAE"
      ],
      "trustedBeneficiaries": [
        "Bright Market KSA",
        "Sara Al-Mutairi"
      ],
      "usualHours": [
        8,
        22
      ],
      "priorRisk": false
    },
    "input": {
      "customerId": "bench-std-026",
      "amount": 2154,
      "currency": "SAR",
      "destinationCountry": "Saudi Arabia",
      "beneficiaryName": "Bright Market KSA",
      "transactionType": "Local Transfer",
      "submittedAt": "2026-08-13T12:00:00.000Z"
    }
  },
  {
    "id": "BENCH-027",
    "category": "standard_normal",
    "titleEn": "Routine local transaction #27 (Merchant Payment)",
    "titleAr": "عملية اعتيادية رقم 27 (دفع تاجر)",
    "descriptionEn": "Normal amount within profile baseline, trusted beneficiary, and standard corridor.",
    "descriptionAr": "مبلغ اعتيادي ضمن خط الأساس للعميل ومستفيد موثوق وممر اعتيادي.",
    "expectedDecision": "Approve",
    "expectedRiskLevel": "Low",
    "customer": {
      "id": "bench-std-027",
      "name": "Layan Al-Harbi",
      "nameAr": "ليان الحربي",
      "averageAmount": 3590,
      "transactionCount": 52,
      "usualCountries": [
        "Saudi Arabia",
        "UAE"
      ],
      "trustedBeneficiaries": [
        "Tariq Al-Nasser",
        "Sara Al-Mutairi"
      ],
      "usualHours": [
        8,
        22
      ],
      "priorRisk": false
    },
    "input": {
      "customerId": "bench-std-027",
      "amount": 2548,
      "currency": "SAR",
      "destinationCountry": "Saudi Arabia",
      "beneficiaryName": "Tariq Al-Nasser",
      "transactionType": "Merchant Payment",
      "websiteDomain": "alrajhibank.com.sa",
      "submittedAt": "2026-08-13T12:00:00.000Z"
    }
  },
  {
    "id": "BENCH-028",
    "category": "standard_normal",
    "titleEn": "Routine local transaction #28 (Local Transfer)",
    "titleAr": "عملية اعتيادية رقم 28 (تحويل محلي)",
    "descriptionEn": "Normal amount within profile baseline, trusted beneficiary, and standard corridor.",
    "descriptionAr": "مبلغ اعتيادي ضمن خط الأساس للعميل ومستفيد موثوق وممر اعتيادي.",
    "expectedDecision": "Approve",
    "expectedRiskLevel": "Low",
    "customer": {
      "id": "bench-std-028",
      "name": "Fahad Al-Qahtani",
      "nameAr": "فهد القحطاني",
      "averageAmount": 3760,
      "transactionCount": 53,
      "usualCountries": [
        "Saudi Arabia",
        "UAE"
      ],
      "trustedBeneficiaries": [
        "Hala Al-Otaibi",
        "Sara Al-Mutairi"
      ],
      "usualHours": [
        8,
        22
      ],
      "priorRisk": false
    },
    "input": {
      "customerId": "bench-std-028",
      "amount": 2970,
      "currency": "SAR",
      "destinationCountry": "Saudi Arabia",
      "beneficiaryName": "Hala Al-Otaibi",
      "transactionType": "Local Transfer",
      "submittedAt": "2026-08-13T12:00:00.000Z"
    }
  },
  {
    "id": "BENCH-029",
    "category": "standard_normal",
    "titleEn": "Routine local transaction #29 (Personal Transfer)",
    "titleAr": "عملية اعتيادية رقم 29 (تحويل محلي)",
    "descriptionEn": "Normal amount within profile baseline, trusted beneficiary, and standard corridor.",
    "descriptionAr": "مبلغ اعتيادي ضمن خط الأساس للعميل ومستفيد موثوق وممر اعتيادي.",
    "expectedDecision": "Approve",
    "expectedRiskLevel": "Low",
    "customer": {
      "id": "bench-std-029",
      "name": "Reem Al-Ghamdi",
      "nameAr": "ريم الغامدي",
      "averageAmount": 3930,
      "transactionCount": 54,
      "usualCountries": [
        "Saudi Arabia",
        "UAE"
      ],
      "trustedBeneficiaries": [
        "Al-Inma Utility",
        "Sara Al-Mutairi"
      ],
      "usualHours": [
        8,
        22
      ],
      "priorRisk": false
    },
    "input": {
      "customerId": "bench-std-029",
      "amount": 3419,
      "currency": "SAR",
      "destinationCountry": "Saudi Arabia",
      "beneficiaryName": "Al-Inma Utility",
      "transactionType": "Personal Transfer",
      "submittedAt": "2026-08-13T12:00:00.000Z"
    }
  },
  {
    "id": "BENCH-030",
    "category": "standard_normal",
    "titleEn": "Routine local transaction #30 (Merchant Payment)",
    "titleAr": "عملية اعتيادية رقم 30 (دفع تاجر)",
    "descriptionEn": "Normal amount within profile baseline, trusted beneficiary, and standard corridor.",
    "descriptionAr": "مبلغ اعتيادي ضمن خط الأساس للعميل ومستفيد موثوق وممر اعتيادي.",
    "expectedDecision": "Approve",
    "expectedRiskLevel": "Low",
    "customer": {
      "id": "bench-std-030",
      "name": "Saud Al-Shammari",
      "nameAr": "سعود الشمري",
      "averageAmount": 4100,
      "transactionCount": 25,
      "usualCountries": [
        "Saudi Arabia",
        "UAE"
      ],
      "trustedBeneficiaries": [
        "Saudi Telecom STC",
        "Sara Al-Mutairi"
      ],
      "usualHours": [
        8,
        22
      ],
      "priorRisk": false
    },
    "input": {
      "customerId": "bench-std-030",
      "amount": 615,
      "currency": "SAR",
      "destinationCountry": "Saudi Arabia",
      "beneficiaryName": "Saudi Telecom STC",
      "transactionType": "Merchant Payment",
      "websiteDomain": "alrajhibank.com.sa",
      "submittedAt": "2026-08-13T12:00:00.000Z"
    }
  },
  {
    "id": "BENCH-031",
    "category": "standard_normal",
    "titleEn": "Routine local transaction #31 (Personal Transfer)",
    "titleAr": "عملية اعتيادية رقم 31 (تحويل محلي)",
    "descriptionEn": "Normal amount within profile baseline, trusted beneficiary, and standard corridor.",
    "descriptionAr": "مبلغ اعتيادي ضمن خط الأساس للعميل ومستفيد موثوق وممر اعتيادي.",
    "expectedDecision": "Approve",
    "expectedRiskLevel": "Low",
    "customer": {
      "id": "bench-std-031",
      "name": "Ahmed Al-Otaibi",
      "nameAr": "أحمد العتيبي",
      "averageAmount": 4270,
      "transactionCount": 26,
      "usualCountries": [
        "Saudi Arabia",
        "UAE"
      ],
      "trustedBeneficiaries": [
        "Jarir Bookstore",
        "Sara Al-Mutairi"
      ],
      "usualHours": [
        8,
        22
      ],
      "priorRisk": false
    },
    "input": {
      "customerId": "bench-std-031",
      "amount": 982,
      "currency": "SAR",
      "destinationCountry": "Saudi Arabia",
      "beneficiaryName": "Jarir Bookstore",
      "transactionType": "Personal Transfer",
      "submittedAt": "2026-08-13T12:00:00.000Z"
    }
  },
  {
    "id": "BENCH-032",
    "category": "standard_normal",
    "titleEn": "Routine local transaction #32 (Local Transfer)",
    "titleAr": "عملية اعتيادية رقم 32 (تحويل محلي)",
    "descriptionEn": "Normal amount within profile baseline, trusted beneficiary, and standard corridor.",
    "descriptionAr": "مبلغ اعتيادي ضمن خط الأساس للعميل ومستفيد موثوق وممر اعتيادي.",
    "expectedDecision": "Approve",
    "expectedRiskLevel": "Low",
    "customer": {
      "id": "bench-std-032",
      "name": "Noura Al-Dosari",
      "nameAr": "نورة الدوسري",
      "averageAmount": 4440,
      "transactionCount": 27,
      "usualCountries": [
        "Saudi Arabia",
        "UAE"
      ],
      "trustedBeneficiaries": [
        "Tamimi Markets",
        "Sara Al-Mutairi"
      ],
      "usualHours": [
        8,
        22
      ],
      "priorRisk": false
    },
    "input": {
      "customerId": "bench-std-032",
      "amount": 1376,
      "currency": "SAR",
      "destinationCountry": "Saudi Arabia",
      "beneficiaryName": "Tamimi Markets",
      "transactionType": "Local Transfer",
      "submittedAt": "2026-08-13T12:00:00.000Z"
    }
  },
  {
    "id": "BENCH-033",
    "category": "standard_normal",
    "titleEn": "Routine local transaction #33 (Merchant Payment)",
    "titleAr": "عملية اعتيادية رقم 33 (دفع تاجر)",
    "descriptionEn": "Normal amount within profile baseline, trusted beneficiary, and standard corridor.",
    "descriptionAr": "مبلغ اعتيادي ضمن خط الأساس للعميل ومستفيد موثوق وممر اعتيادي.",
    "expectedDecision": "Approve",
    "expectedRiskLevel": "Low",
    "customer": {
      "id": "bench-std-033",
      "name": "Layan Al-Harbi",
      "nameAr": "ليان الحربي",
      "averageAmount": 4610,
      "transactionCount": 28,
      "usualCountries": [
        "Saudi Arabia",
        "UAE"
      ],
      "trustedBeneficiaries": [
        "Sara Al-Mutairi",
        "Sara Al-Mutairi"
      ],
      "usualHours": [
        8,
        22
      ],
      "priorRisk": false
    },
    "input": {
      "customerId": "bench-std-033",
      "amount": 1797,
      "currency": "SAR",
      "destinationCountry": "Saudi Arabia",
      "beneficiaryName": "Sara Al-Mutairi",
      "transactionType": "Merchant Payment",
      "websiteDomain": "alrajhibank.com.sa",
      "submittedAt": "2026-08-13T12:00:00.000Z"
    }
  },
  {
    "id": "BENCH-034",
    "category": "standard_normal",
    "titleEn": "Routine local transaction #34 (Local Transfer)",
    "titleAr": "عملية اعتيادية رقم 34 (تحويل محلي)",
    "descriptionEn": "Normal amount within profile baseline, trusted beneficiary, and standard corridor.",
    "descriptionAr": "مبلغ اعتيادي ضمن خط الأساس للعميل ومستفيد موثوق وممر اعتيادي.",
    "expectedDecision": "Approve",
    "expectedRiskLevel": "Low",
    "customer": {
      "id": "bench-std-034",
      "name": "Fahad Al-Qahtani",
      "nameAr": "فهد القحطاني",
      "averageAmount": 4780,
      "transactionCount": 29,
      "usualCountries": [
        "Saudi Arabia",
        "UAE"
      ],
      "trustedBeneficiaries": [
        "Bright Market KSA",
        "Sara Al-Mutairi"
      ],
      "usualHours": [
        8,
        22
      ],
      "priorRisk": false
    },
    "input": {
      "customerId": "bench-std-034",
      "amount": 2246,
      "currency": "SAR",
      "destinationCountry": "Saudi Arabia",
      "beneficiaryName": "Bright Market KSA",
      "transactionType": "Local Transfer",
      "submittedAt": "2026-08-13T12:00:00.000Z"
    }
  },
  {
    "id": "BENCH-035",
    "category": "standard_normal",
    "titleEn": "Routine local transaction #35 (Personal Transfer)",
    "titleAr": "عملية اعتيادية رقم 35 (تحويل محلي)",
    "descriptionEn": "Normal amount within profile baseline, trusted beneficiary, and standard corridor.",
    "descriptionAr": "مبلغ اعتيادي ضمن خط الأساس للعميل ومستفيد موثوق وممر اعتيادي.",
    "expectedDecision": "Approve",
    "expectedRiskLevel": "Low",
    "customer": {
      "id": "bench-std-035",
      "name": "Reem Al-Ghamdi",
      "nameAr": "ريم الغامدي",
      "averageAmount": 4950,
      "transactionCount": 30,
      "usualCountries": [
        "Saudi Arabia",
        "UAE"
      ],
      "trustedBeneficiaries": [
        "Tariq Al-Nasser",
        "Sara Al-Mutairi"
      ],
      "usualHours": [
        8,
        22
      ],
      "priorRisk": false
    },
    "input": {
      "customerId": "bench-std-035",
      "amount": 2722,
      "currency": "SAR",
      "destinationCountry": "Saudi Arabia",
      "beneficiaryName": "Tariq Al-Nasser",
      "transactionType": "Personal Transfer",
      "submittedAt": "2026-08-13T12:00:00.000Z"
    }
  },
  {
    "id": "BENCH-036",
    "category": "standard_normal",
    "titleEn": "Routine local transaction #36 (Merchant Payment)",
    "titleAr": "عملية اعتيادية رقم 36 (دفع تاجر)",
    "descriptionEn": "Normal amount within profile baseline, trusted beneficiary, and standard corridor.",
    "descriptionAr": "مبلغ اعتيادي ضمن خط الأساس للعميل ومستفيد موثوق وممر اعتيادي.",
    "expectedDecision": "Approve",
    "expectedRiskLevel": "Low",
    "customer": {
      "id": "bench-std-036",
      "name": "Saud Al-Shammari",
      "nameAr": "سعود الشمري",
      "averageAmount": 5120,
      "transactionCount": 31,
      "usualCountries": [
        "Saudi Arabia",
        "UAE"
      ],
      "trustedBeneficiaries": [
        "Hala Al-Otaibi",
        "Sara Al-Mutairi"
      ],
      "usualHours": [
        8,
        22
      ],
      "priorRisk": false
    },
    "input": {
      "customerId": "bench-std-036",
      "amount": 3225,
      "currency": "SAR",
      "destinationCountry": "Saudi Arabia",
      "beneficiaryName": "Hala Al-Otaibi",
      "transactionType": "Merchant Payment",
      "websiteDomain": "alrajhibank.com.sa",
      "submittedAt": "2026-08-13T12:00:00.000Z"
    }
  },
  {
    "id": "BENCH-037",
    "category": "standard_normal",
    "titleEn": "Routine local transaction #37 (Personal Transfer)",
    "titleAr": "عملية اعتيادية رقم 37 (تحويل محلي)",
    "descriptionEn": "Normal amount within profile baseline, trusted beneficiary, and standard corridor.",
    "descriptionAr": "مبلغ اعتيادي ضمن خط الأساس للعميل ومستفيد موثوق وممر اعتيادي.",
    "expectedDecision": "Approve",
    "expectedRiskLevel": "Low",
    "customer": {
      "id": "bench-std-037",
      "name": "Ahmed Al-Otaibi",
      "nameAr": "أحمد العتيبي",
      "averageAmount": 5290,
      "transactionCount": 32,
      "usualCountries": [
        "Saudi Arabia",
        "UAE"
      ],
      "trustedBeneficiaries": [
        "Al-Inma Utility",
        "Sara Al-Mutairi"
      ],
      "usualHours": [
        8,
        22
      ],
      "priorRisk": false
    },
    "input": {
      "customerId": "bench-std-037",
      "amount": 3755,
      "currency": "SAR",
      "destinationCountry": "Saudi Arabia",
      "beneficiaryName": "Al-Inma Utility",
      "transactionType": "Personal Transfer",
      "submittedAt": "2026-08-13T12:00:00.000Z"
    }
  },
  {
    "id": "BENCH-038",
    "category": "standard_normal",
    "titleEn": "Routine local transaction #38 (Local Transfer)",
    "titleAr": "عملية اعتيادية رقم 38 (تحويل محلي)",
    "descriptionEn": "Normal amount within profile baseline, trusted beneficiary, and standard corridor.",
    "descriptionAr": "مبلغ اعتيادي ضمن خط الأساس للعميل ومستفيد موثوق وممر اعتيادي.",
    "expectedDecision": "Approve",
    "expectedRiskLevel": "Low",
    "customer": {
      "id": "bench-std-038",
      "name": "Noura Al-Dosari",
      "nameAr": "نورة الدوسري",
      "averageAmount": 5460,
      "transactionCount": 33,
      "usualCountries": [
        "Saudi Arabia",
        "UAE"
      ],
      "trustedBeneficiaries": [
        "Saudi Telecom STC",
        "Sara Al-Mutairi"
      ],
      "usualHours": [
        8,
        22
      ],
      "priorRisk": false
    },
    "input": {
      "customerId": "bench-std-038",
      "amount": 4313,
      "currency": "SAR",
      "destinationCountry": "Saudi Arabia",
      "beneficiaryName": "Saudi Telecom STC",
      "transactionType": "Local Transfer",
      "submittedAt": "2026-08-13T12:00:00.000Z"
    }
  },
  {
    "id": "BENCH-039",
    "category": "standard_normal",
    "titleEn": "Routine local transaction #39 (Merchant Payment)",
    "titleAr": "عملية اعتيادية رقم 39 (دفع تاجر)",
    "descriptionEn": "Normal amount within profile baseline, trusted beneficiary, and standard corridor.",
    "descriptionAr": "مبلغ اعتيادي ضمن خط الأساس للعميل ومستفيد موثوق وممر اعتيادي.",
    "expectedDecision": "Approve",
    "expectedRiskLevel": "Low",
    "customer": {
      "id": "bench-std-039",
      "name": "Layan Al-Harbi",
      "nameAr": "ليان الحربي",
      "averageAmount": 5630,
      "transactionCount": 34,
      "usualCountries": [
        "Saudi Arabia",
        "UAE"
      ],
      "trustedBeneficiaries": [
        "Jarir Bookstore",
        "Sara Al-Mutairi"
      ],
      "usualHours": [
        8,
        22
      ],
      "priorRisk": false
    },
    "input": {
      "customerId": "bench-std-039",
      "amount": 4898,
      "currency": "SAR",
      "destinationCountry": "Saudi Arabia",
      "beneficiaryName": "Jarir Bookstore",
      "transactionType": "Merchant Payment",
      "websiteDomain": "alrajhibank.com.sa",
      "submittedAt": "2026-08-13T12:00:00.000Z"
    }
  },
  {
    "id": "BENCH-040",
    "category": "standard_normal",
    "titleEn": "Routine local transaction #40 (Local Transfer)",
    "titleAr": "عملية اعتيادية رقم 40 (تحويل محلي)",
    "descriptionEn": "Normal amount within profile baseline, trusted beneficiary, and standard corridor.",
    "descriptionAr": "مبلغ اعتيادي ضمن خط الأساس للعميل ومستفيد موثوق وممر اعتيادي.",
    "expectedDecision": "Approve",
    "expectedRiskLevel": "Low",
    "customer": {
      "id": "bench-std-040",
      "name": "Fahad Al-Qahtani",
      "nameAr": "فهد القحطاني",
      "averageAmount": 5800,
      "transactionCount": 35,
      "usualCountries": [
        "Saudi Arabia",
        "UAE"
      ],
      "trustedBeneficiaries": [
        "Tamimi Markets",
        "Sara Al-Mutairi"
      ],
      "usualHours": [
        8,
        22
      ],
      "priorRisk": false
    },
    "input": {
      "customerId": "bench-std-040",
      "amount": 870,
      "currency": "SAR",
      "destinationCountry": "Saudi Arabia",
      "beneficiaryName": "Tamimi Markets",
      "transactionType": "Local Transfer",
      "submittedAt": "2026-08-13T12:00:00.000Z"
    }
  },
  {
    "id": "BENCH-041",
    "category": "standard_normal",
    "titleEn": "Routine local transaction #41 (Personal Transfer)",
    "titleAr": "عملية اعتيادية رقم 41 (تحويل محلي)",
    "descriptionEn": "Normal amount within profile baseline, trusted beneficiary, and standard corridor.",
    "descriptionAr": "مبلغ اعتيادي ضمن خط الأساس للعميل ومستفيد موثوق وممر اعتيادي.",
    "expectedDecision": "Approve",
    "expectedRiskLevel": "Low",
    "customer": {
      "id": "bench-std-041",
      "name": "Reem Al-Ghamdi",
      "nameAr": "ريم الغامدي",
      "averageAmount": 5970,
      "transactionCount": 36,
      "usualCountries": [
        "Saudi Arabia",
        "UAE"
      ],
      "trustedBeneficiaries": [
        "Sara Al-Mutairi",
        "Sara Al-Mutairi"
      ],
      "usualHours": [
        8,
        22
      ],
      "priorRisk": false
    },
    "input": {
      "customerId": "bench-std-041",
      "amount": 1373,
      "currency": "SAR",
      "destinationCountry": "Saudi Arabia",
      "beneficiaryName": "Sara Al-Mutairi",
      "transactionType": "Personal Transfer",
      "submittedAt": "2026-08-13T12:00:00.000Z"
    }
  },
  {
    "id": "BENCH-042",
    "category": "standard_normal",
    "titleEn": "Routine local transaction #42 (Merchant Payment)",
    "titleAr": "عملية اعتيادية رقم 42 (دفع تاجر)",
    "descriptionEn": "Normal amount within profile baseline, trusted beneficiary, and standard corridor.",
    "descriptionAr": "مبلغ اعتيادي ضمن خط الأساس للعميل ومستفيد موثوق وممر اعتيادي.",
    "expectedDecision": "Approve",
    "expectedRiskLevel": "Low",
    "customer": {
      "id": "bench-std-042",
      "name": "Saud Al-Shammari",
      "nameAr": "سعود الشمري",
      "averageAmount": 6140,
      "transactionCount": 37,
      "usualCountries": [
        "Saudi Arabia",
        "UAE"
      ],
      "trustedBeneficiaries": [
        "Bright Market KSA",
        "Sara Al-Mutairi"
      ],
      "usualHours": [
        8,
        22
      ],
      "priorRisk": false
    },
    "input": {
      "customerId": "bench-std-042",
      "amount": 1903,
      "currency": "SAR",
      "destinationCountry": "Saudi Arabia",
      "beneficiaryName": "Bright Market KSA",
      "transactionType": "Merchant Payment",
      "websiteDomain": "alrajhibank.com.sa",
      "submittedAt": "2026-08-13T12:00:00.000Z"
    }
  },
  {
    "id": "BENCH-043",
    "category": "standard_normal",
    "titleEn": "Routine local transaction #43 (Personal Transfer)",
    "titleAr": "عملية اعتيادية رقم 43 (تحويل محلي)",
    "descriptionEn": "Normal amount within profile baseline, trusted beneficiary, and standard corridor.",
    "descriptionAr": "مبلغ اعتيادي ضمن خط الأساس للعميل ومستفيد موثوق وممر اعتيادي.",
    "expectedDecision": "Approve",
    "expectedRiskLevel": "Low",
    "customer": {
      "id": "bench-std-043",
      "name": "Ahmed Al-Otaibi",
      "nameAr": "أحمد العتيبي",
      "averageAmount": 6310,
      "transactionCount": 38,
      "usualCountries": [
        "Saudi Arabia",
        "UAE"
      ],
      "trustedBeneficiaries": [
        "Tariq Al-Nasser",
        "Sara Al-Mutairi"
      ],
      "usualHours": [
        8,
        22
      ],
      "priorRisk": false
    },
    "input": {
      "customerId": "bench-std-043",
      "amount": 2460,
      "currency": "SAR",
      "destinationCountry": "Saudi Arabia",
      "beneficiaryName": "Tariq Al-Nasser",
      "transactionType": "Personal Transfer",
      "submittedAt": "2026-08-13T12:00:00.000Z"
    }
  },
  {
    "id": "BENCH-044",
    "category": "standard_normal",
    "titleEn": "Routine local transaction #44 (Local Transfer)",
    "titleAr": "عملية اعتيادية رقم 44 (تحويل محلي)",
    "descriptionEn": "Normal amount within profile baseline, trusted beneficiary, and standard corridor.",
    "descriptionAr": "مبلغ اعتيادي ضمن خط الأساس للعميل ومستفيد موثوق وممر اعتيادي.",
    "expectedDecision": "Approve",
    "expectedRiskLevel": "Low",
    "customer": {
      "id": "bench-std-044",
      "name": "Noura Al-Dosari",
      "nameAr": "نورة الدوسري",
      "averageAmount": 6480,
      "transactionCount": 39,
      "usualCountries": [
        "Saudi Arabia",
        "UAE"
      ],
      "trustedBeneficiaries": [
        "Hala Al-Otaibi",
        "Sara Al-Mutairi"
      ],
      "usualHours": [
        8,
        22
      ],
      "priorRisk": false
    },
    "input": {
      "customerId": "bench-std-044",
      "amount": 3045,
      "currency": "SAR",
      "destinationCountry": "Saudi Arabia",
      "beneficiaryName": "Hala Al-Otaibi",
      "transactionType": "Local Transfer",
      "submittedAt": "2026-08-13T12:00:00.000Z"
    }
  },
  {
    "id": "BENCH-045",
    "category": "standard_normal",
    "titleEn": "Routine local transaction #45 (Merchant Payment)",
    "titleAr": "عملية اعتيادية رقم 45 (دفع تاجر)",
    "descriptionEn": "Normal amount within profile baseline, trusted beneficiary, and standard corridor.",
    "descriptionAr": "مبلغ اعتيادي ضمن خط الأساس للعميل ومستفيد موثوق وممر اعتيادي.",
    "expectedDecision": "Approve",
    "expectedRiskLevel": "Low",
    "customer": {
      "id": "bench-std-045",
      "name": "Layan Al-Harbi",
      "nameAr": "ليان الحربي",
      "averageAmount": 6650,
      "transactionCount": 40,
      "usualCountries": [
        "Saudi Arabia",
        "UAE"
      ],
      "trustedBeneficiaries": [
        "Al-Inma Utility",
        "Sara Al-Mutairi"
      ],
      "usualHours": [
        8,
        22
      ],
      "priorRisk": false
    },
    "input": {
      "customerId": "bench-std-045",
      "amount": 3657,
      "currency": "SAR",
      "destinationCountry": "Saudi Arabia",
      "beneficiaryName": "Al-Inma Utility",
      "transactionType": "Merchant Payment",
      "websiteDomain": "alrajhibank.com.sa",
      "submittedAt": "2026-08-13T12:00:00.000Z"
    }
  },
  {
    "id": "BENCH-046",
    "category": "standard_normal",
    "titleEn": "Routine local transaction #46 (Local Transfer)",
    "titleAr": "عملية اعتيادية رقم 46 (تحويل محلي)",
    "descriptionEn": "Normal amount within profile baseline, trusted beneficiary, and standard corridor.",
    "descriptionAr": "مبلغ اعتيادي ضمن خط الأساس للعميل ومستفيد موثوق وممر اعتيادي.",
    "expectedDecision": "Approve",
    "expectedRiskLevel": "Low",
    "customer": {
      "id": "bench-std-046",
      "name": "Fahad Al-Qahtani",
      "nameAr": "فهد القحطاني",
      "averageAmount": 6820,
      "transactionCount": 41,
      "usualCountries": [
        "Saudi Arabia",
        "UAE"
      ],
      "trustedBeneficiaries": [
        "Saudi Telecom STC",
        "Sara Al-Mutairi"
      ],
      "usualHours": [
        8,
        22
      ],
      "priorRisk": false
    },
    "input": {
      "customerId": "bench-std-046",
      "amount": 4296,
      "currency": "SAR",
      "destinationCountry": "Saudi Arabia",
      "beneficiaryName": "Saudi Telecom STC",
      "transactionType": "Local Transfer",
      "submittedAt": "2026-08-13T12:00:00.000Z"
    }
  },
  {
    "id": "BENCH-047",
    "category": "standard_normal",
    "titleEn": "Routine local transaction #47 (Personal Transfer)",
    "titleAr": "عملية اعتيادية رقم 47 (تحويل محلي)",
    "descriptionEn": "Normal amount within profile baseline, trusted beneficiary, and standard corridor.",
    "descriptionAr": "مبلغ اعتيادي ضمن خط الأساس للعميل ومستفيد موثوق وممر اعتيادي.",
    "expectedDecision": "Approve",
    "expectedRiskLevel": "Low",
    "customer": {
      "id": "bench-std-047",
      "name": "Reem Al-Ghamdi",
      "nameAr": "ريم الغامدي",
      "averageAmount": 6990,
      "transactionCount": 42,
      "usualCountries": [
        "Saudi Arabia",
        "UAE"
      ],
      "trustedBeneficiaries": [
        "Jarir Bookstore",
        "Sara Al-Mutairi"
      ],
      "usualHours": [
        8,
        22
      ],
      "priorRisk": false
    },
    "input": {
      "customerId": "bench-std-047",
      "amount": 4962,
      "currency": "SAR",
      "destinationCountry": "Saudi Arabia",
      "beneficiaryName": "Jarir Bookstore",
      "transactionType": "Personal Transfer",
      "submittedAt": "2026-08-13T12:00:00.000Z"
    }
  },
  {
    "id": "BENCH-048",
    "category": "standard_normal",
    "titleEn": "Routine local transaction #48 (Merchant Payment)",
    "titleAr": "عملية اعتيادية رقم 48 (دفع تاجر)",
    "descriptionEn": "Normal amount within profile baseline, trusted beneficiary, and standard corridor.",
    "descriptionAr": "مبلغ اعتيادي ضمن خط الأساس للعميل ومستفيد موثوق وممر اعتيادي.",
    "expectedDecision": "Approve",
    "expectedRiskLevel": "Low",
    "customer": {
      "id": "bench-std-048",
      "name": "Saud Al-Shammari",
      "nameAr": "سعود الشمري",
      "averageAmount": 3160,
      "transactionCount": 43,
      "usualCountries": [
        "Saudi Arabia",
        "UAE"
      ],
      "trustedBeneficiaries": [
        "Tamimi Markets",
        "Sara Al-Mutairi"
      ],
      "usualHours": [
        8,
        22
      ],
      "priorRisk": false
    },
    "input": {
      "customerId": "bench-std-048",
      "amount": 2496,
      "currency": "SAR",
      "destinationCountry": "Saudi Arabia",
      "beneficiaryName": "Tamimi Markets",
      "transactionType": "Merchant Payment",
      "websiteDomain": "alrajhibank.com.sa",
      "submittedAt": "2026-08-13T12:00:00.000Z"
    }
  },
  {
    "id": "BENCH-049",
    "category": "standard_normal",
    "titleEn": "Routine local transaction #49 (Personal Transfer)",
    "titleAr": "عملية اعتيادية رقم 49 (تحويل محلي)",
    "descriptionEn": "Normal amount within profile baseline, trusted beneficiary, and standard corridor.",
    "descriptionAr": "مبلغ اعتيادي ضمن خط الأساس للعميل ومستفيد موثوق وممر اعتيادي.",
    "expectedDecision": "Approve",
    "expectedRiskLevel": "Low",
    "customer": {
      "id": "bench-std-049",
      "name": "Ahmed Al-Otaibi",
      "nameAr": "أحمد العتيبي",
      "averageAmount": 3330,
      "transactionCount": 44,
      "usualCountries": [
        "Saudi Arabia",
        "UAE"
      ],
      "trustedBeneficiaries": [
        "Sara Al-Mutairi",
        "Sara Al-Mutairi"
      ],
      "usualHours": [
        8,
        22
      ],
      "priorRisk": false
    },
    "input": {
      "customerId": "bench-std-049",
      "amount": 2897,
      "currency": "SAR",
      "destinationCountry": "Saudi Arabia",
      "beneficiaryName": "Sara Al-Mutairi",
      "transactionType": "Personal Transfer",
      "submittedAt": "2026-08-13T12:00:00.000Z"
    }
  },
  {
    "id": "BENCH-050",
    "category": "standard_normal",
    "titleEn": "Routine local transaction #50 (Local Transfer)",
    "titleAr": "عملية اعتيادية رقم 50 (تحويل محلي)",
    "descriptionEn": "Normal amount within profile baseline, trusted beneficiary, and standard corridor.",
    "descriptionAr": "مبلغ اعتيادي ضمن خط الأساس للعميل ومستفيد موثوق وممر اعتيادي.",
    "expectedDecision": "Approve",
    "expectedRiskLevel": "Low",
    "customer": {
      "id": "bench-std-050",
      "name": "Noura Al-Dosari",
      "nameAr": "نورة الدوسري",
      "averageAmount": 3500,
      "transactionCount": 45,
      "usualCountries": [
        "Saudi Arabia",
        "UAE"
      ],
      "trustedBeneficiaries": [
        "Bright Market KSA",
        "Sara Al-Mutairi"
      ],
      "usualHours": [
        8,
        22
      ],
      "priorRisk": false
    },
    "input": {
      "customerId": "bench-std-050",
      "amount": 525,
      "currency": "SAR",
      "destinationCountry": "Saudi Arabia",
      "beneficiaryName": "Bright Market KSA",
      "transactionType": "Local Transfer",
      "submittedAt": "2026-08-13T12:00:00.000Z"
    }
  },
  {
    "id": "BENCH-051",
    "category": "standard_normal",
    "titleEn": "Routine local transaction #51 (Merchant Payment)",
    "titleAr": "عملية اعتيادية رقم 51 (دفع تاجر)",
    "descriptionEn": "Normal amount within profile baseline, trusted beneficiary, and standard corridor.",
    "descriptionAr": "مبلغ اعتيادي ضمن خط الأساس للعميل ومستفيد موثوق وممر اعتيادي.",
    "expectedDecision": "Approve",
    "expectedRiskLevel": "Low",
    "customer": {
      "id": "bench-std-051",
      "name": "Layan Al-Harbi",
      "nameAr": "ليان الحربي",
      "averageAmount": 3670,
      "transactionCount": 46,
      "usualCountries": [
        "Saudi Arabia",
        "UAE"
      ],
      "trustedBeneficiaries": [
        "Tariq Al-Nasser",
        "Sara Al-Mutairi"
      ],
      "usualHours": [
        8,
        22
      ],
      "priorRisk": false
    },
    "input": {
      "customerId": "bench-std-051",
      "amount": 844,
      "currency": "SAR",
      "destinationCountry": "Saudi Arabia",
      "beneficiaryName": "Tariq Al-Nasser",
      "transactionType": "Merchant Payment",
      "websiteDomain": "alrajhibank.com.sa",
      "submittedAt": "2026-08-13T12:00:00.000Z"
    }
  },
  {
    "id": "BENCH-052",
    "category": "standard_normal",
    "titleEn": "Routine local transaction #52 (Local Transfer)",
    "titleAr": "عملية اعتيادية رقم 52 (تحويل محلي)",
    "descriptionEn": "Normal amount within profile baseline, trusted beneficiary, and standard corridor.",
    "descriptionAr": "مبلغ اعتيادي ضمن خط الأساس للعميل ومستفيد موثوق وممر اعتيادي.",
    "expectedDecision": "Approve",
    "expectedRiskLevel": "Low",
    "customer": {
      "id": "bench-std-052",
      "name": "Fahad Al-Qahtani",
      "nameAr": "فهد القحطاني",
      "averageAmount": 3840,
      "transactionCount": 47,
      "usualCountries": [
        "Saudi Arabia",
        "UAE"
      ],
      "trustedBeneficiaries": [
        "Hala Al-Otaibi",
        "Sara Al-Mutairi"
      ],
      "usualHours": [
        8,
        22
      ],
      "priorRisk": false
    },
    "input": {
      "customerId": "bench-std-052",
      "amount": 1190,
      "currency": "SAR",
      "destinationCountry": "Saudi Arabia",
      "beneficiaryName": "Hala Al-Otaibi",
      "transactionType": "Local Transfer",
      "submittedAt": "2026-08-13T12:00:00.000Z"
    }
  },
  {
    "id": "BENCH-053",
    "category": "standard_normal",
    "titleEn": "Routine local transaction #53 (Personal Transfer)",
    "titleAr": "عملية اعتيادية رقم 53 (تحويل محلي)",
    "descriptionEn": "Normal amount within profile baseline, trusted beneficiary, and standard corridor.",
    "descriptionAr": "مبلغ اعتيادي ضمن خط الأساس للعميل ومستفيد موثوق وممر اعتيادي.",
    "expectedDecision": "Approve",
    "expectedRiskLevel": "Low",
    "customer": {
      "id": "bench-std-053",
      "name": "Reem Al-Ghamdi",
      "nameAr": "ريم الغامدي",
      "averageAmount": 4010,
      "transactionCount": 48,
      "usualCountries": [
        "Saudi Arabia",
        "UAE"
      ],
      "trustedBeneficiaries": [
        "Al-Inma Utility",
        "Sara Al-Mutairi"
      ],
      "usualHours": [
        8,
        22
      ],
      "priorRisk": false
    },
    "input": {
      "customerId": "bench-std-053",
      "amount": 1563,
      "currency": "SAR",
      "destinationCountry": "Saudi Arabia",
      "beneficiaryName": "Al-Inma Utility",
      "transactionType": "Personal Transfer",
      "submittedAt": "2026-08-13T12:00:00.000Z"
    }
  },
  {
    "id": "BENCH-054",
    "category": "standard_normal",
    "titleEn": "Routine local transaction #54 (Merchant Payment)",
    "titleAr": "عملية اعتيادية رقم 54 (دفع تاجر)",
    "descriptionEn": "Normal amount within profile baseline, trusted beneficiary, and standard corridor.",
    "descriptionAr": "مبلغ اعتيادي ضمن خط الأساس للعميل ومستفيد موثوق وممر اعتيادي.",
    "expectedDecision": "Approve",
    "expectedRiskLevel": "Low",
    "customer": {
      "id": "bench-std-054",
      "name": "Saud Al-Shammari",
      "nameAr": "سعود الشمري",
      "averageAmount": 4180,
      "transactionCount": 49,
      "usualCountries": [
        "Saudi Arabia",
        "UAE"
      ],
      "trustedBeneficiaries": [
        "Saudi Telecom STC",
        "Sara Al-Mutairi"
      ],
      "usualHours": [
        8,
        22
      ],
      "priorRisk": false
    },
    "input": {
      "customerId": "bench-std-054",
      "amount": 1964,
      "currency": "SAR",
      "destinationCountry": "Saudi Arabia",
      "beneficiaryName": "Saudi Telecom STC",
      "transactionType": "Merchant Payment",
      "websiteDomain": "alrajhibank.com.sa",
      "submittedAt": "2026-08-13T12:00:00.000Z"
    }
  },
  {
    "id": "BENCH-055",
    "category": "standard_normal",
    "titleEn": "Routine local transaction #55 (Personal Transfer)",
    "titleAr": "عملية اعتيادية رقم 55 (تحويل محلي)",
    "descriptionEn": "Normal amount within profile baseline, trusted beneficiary, and standard corridor.",
    "descriptionAr": "مبلغ اعتيادي ضمن خط الأساس للعميل ومستفيد موثوق وممر اعتيادي.",
    "expectedDecision": "Approve",
    "expectedRiskLevel": "Low",
    "customer": {
      "id": "bench-std-055",
      "name": "Ahmed Al-Otaibi",
      "nameAr": "أحمد العتيبي",
      "averageAmount": 4350,
      "transactionCount": 50,
      "usualCountries": [
        "Saudi Arabia",
        "UAE"
      ],
      "trustedBeneficiaries": [
        "Jarir Bookstore",
        "Sara Al-Mutairi"
      ],
      "usualHours": [
        8,
        22
      ],
      "priorRisk": false
    },
    "input": {
      "customerId": "bench-std-055",
      "amount": 2392,
      "currency": "SAR",
      "destinationCountry": "Saudi Arabia",
      "beneficiaryName": "Jarir Bookstore",
      "transactionType": "Personal Transfer",
      "submittedAt": "2026-08-13T12:00:00.000Z"
    }
  },
  {
    "id": "BENCH-056",
    "category": "standard_normal",
    "titleEn": "Routine local transaction #56 (Local Transfer)",
    "titleAr": "عملية اعتيادية رقم 56 (تحويل محلي)",
    "descriptionEn": "Normal amount within profile baseline, trusted beneficiary, and standard corridor.",
    "descriptionAr": "مبلغ اعتيادي ضمن خط الأساس للعميل ومستفيد موثوق وممر اعتيادي.",
    "expectedDecision": "Approve",
    "expectedRiskLevel": "Low",
    "customer": {
      "id": "bench-std-056",
      "name": "Noura Al-Dosari",
      "nameAr": "نورة الدوسري",
      "averageAmount": 4520,
      "transactionCount": 51,
      "usualCountries": [
        "Saudi Arabia",
        "UAE"
      ],
      "trustedBeneficiaries": [
        "Tamimi Markets",
        "Sara Al-Mutairi"
      ],
      "usualHours": [
        8,
        22
      ],
      "priorRisk": false
    },
    "input": {
      "customerId": "bench-std-056",
      "amount": 2847,
      "currency": "SAR",
      "destinationCountry": "Saudi Arabia",
      "beneficiaryName": "Tamimi Markets",
      "transactionType": "Local Transfer",
      "submittedAt": "2026-08-13T12:00:00.000Z"
    }
  },
  {
    "id": "BENCH-057",
    "category": "standard_normal",
    "titleEn": "Routine local transaction #57 (Merchant Payment)",
    "titleAr": "عملية اعتيادية رقم 57 (دفع تاجر)",
    "descriptionEn": "Normal amount within profile baseline, trusted beneficiary, and standard corridor.",
    "descriptionAr": "مبلغ اعتيادي ضمن خط الأساس للعميل ومستفيد موثوق وممر اعتيادي.",
    "expectedDecision": "Approve",
    "expectedRiskLevel": "Low",
    "customer": {
      "id": "bench-std-057",
      "name": "Layan Al-Harbi",
      "nameAr": "ليان الحربي",
      "averageAmount": 4690,
      "transactionCount": 52,
      "usualCountries": [
        "Saudi Arabia",
        "UAE"
      ],
      "trustedBeneficiaries": [
        "Sara Al-Mutairi",
        "Sara Al-Mutairi"
      ],
      "usualHours": [
        8,
        22
      ],
      "priorRisk": false
    },
    "input": {
      "customerId": "bench-std-057",
      "amount": 3329,
      "currency": "SAR",
      "destinationCountry": "Saudi Arabia",
      "beneficiaryName": "Sara Al-Mutairi",
      "transactionType": "Merchant Payment",
      "websiteDomain": "alrajhibank.com.sa",
      "submittedAt": "2026-08-13T12:00:00.000Z"
    }
  },
  {
    "id": "BENCH-058",
    "category": "standard_normal",
    "titleEn": "Routine local transaction #58 (Local Transfer)",
    "titleAr": "عملية اعتيادية رقم 58 (تحويل محلي)",
    "descriptionEn": "Normal amount within profile baseline, trusted beneficiary, and standard corridor.",
    "descriptionAr": "مبلغ اعتيادي ضمن خط الأساس للعميل ومستفيد موثوق وممر اعتيادي.",
    "expectedDecision": "Approve",
    "expectedRiskLevel": "Low",
    "customer": {
      "id": "bench-std-058",
      "name": "Fahad Al-Qahtani",
      "nameAr": "فهد القحطاني",
      "averageAmount": 4860,
      "transactionCount": 53,
      "usualCountries": [
        "Saudi Arabia",
        "UAE"
      ],
      "trustedBeneficiaries": [
        "Bright Market KSA",
        "Sara Al-Mutairi"
      ],
      "usualHours": [
        8,
        22
      ],
      "priorRisk": false
    },
    "input": {
      "customerId": "bench-std-058",
      "amount": 3839,
      "currency": "SAR",
      "destinationCountry": "Saudi Arabia",
      "beneficiaryName": "Bright Market KSA",
      "transactionType": "Local Transfer",
      "submittedAt": "2026-08-13T12:00:00.000Z"
    }
  },
  {
    "id": "BENCH-059",
    "category": "standard_normal",
    "titleEn": "Routine local transaction #59 (Personal Transfer)",
    "titleAr": "عملية اعتيادية رقم 59 (تحويل محلي)",
    "descriptionEn": "Normal amount within profile baseline, trusted beneficiary, and standard corridor.",
    "descriptionAr": "مبلغ اعتيادي ضمن خط الأساس للعميل ومستفيد موثوق وممر اعتيادي.",
    "expectedDecision": "Approve",
    "expectedRiskLevel": "Low",
    "customer": {
      "id": "bench-std-059",
      "name": "Reem Al-Ghamdi",
      "nameAr": "ريم الغامدي",
      "averageAmount": 5030,
      "transactionCount": 54,
      "usualCountries": [
        "Saudi Arabia",
        "UAE"
      ],
      "trustedBeneficiaries": [
        "Tariq Al-Nasser",
        "Sara Al-Mutairi"
      ],
      "usualHours": [
        8,
        22
      ],
      "priorRisk": false
    },
    "input": {
      "customerId": "bench-std-059",
      "amount": 4376,
      "currency": "SAR",
      "destinationCountry": "Saudi Arabia",
      "beneficiaryName": "Tariq Al-Nasser",
      "transactionType": "Personal Transfer",
      "submittedAt": "2026-08-13T12:00:00.000Z"
    }
  },
  {
    "id": "BENCH-060",
    "category": "standard_normal",
    "titleEn": "Routine local transaction #60 (Merchant Payment)",
    "titleAr": "عملية اعتيادية رقم 60 (دفع تاجر)",
    "descriptionEn": "Normal amount within profile baseline, trusted beneficiary, and standard corridor.",
    "descriptionAr": "مبلغ اعتيادي ضمن خط الأساس للعميل ومستفيد موثوق وممر اعتيادي.",
    "expectedDecision": "Approve",
    "expectedRiskLevel": "Low",
    "customer": {
      "id": "bench-std-060",
      "name": "Saud Al-Shammari",
      "nameAr": "سعود الشمري",
      "averageAmount": 5200,
      "transactionCount": 25,
      "usualCountries": [
        "Saudi Arabia",
        "UAE"
      ],
      "trustedBeneficiaries": [
        "Hala Al-Otaibi",
        "Sara Al-Mutairi"
      ],
      "usualHours": [
        8,
        22
      ],
      "priorRisk": false
    },
    "input": {
      "customerId": "bench-std-060",
      "amount": 780,
      "currency": "SAR",
      "destinationCountry": "Saudi Arabia",
      "beneficiaryName": "Hala Al-Otaibi",
      "transactionType": "Merchant Payment",
      "websiteDomain": "alrajhibank.com.sa",
      "submittedAt": "2026-08-13T12:00:00.000Z"
    }
  },
  {
    "id": "BENCH-061",
    "category": "additional_verification",
    "titleEn": "Cross-border transfer threshold (SAR 5,750)",
    "titleAr": "تجاوز حد التحويل الدولي (5,750 ر.س)",
    "descriptionEn": "International transaction exceeding the 5,000 SAR policy threshold with trusted beneficiary.",
    "descriptionAr": "تحويل دولي يتجاوز حد السياسة البالغ 5,000 ريال مع مستفيد معتاد.",
    "expectedDecision": "Additional Verification",
    "expectedRiskLevel": "Medium",
    "customer": {
      "id": "bench-ver-001",
      "name": "Customer 61",
      "nameAr": "عميل 61",
      "averageAmount": 4000,
      "transactionCount": 20,
      "usualCountries": [
        "Saudi Arabia",
        "Philippines"
      ],
      "trustedBeneficiaries": [
        "Maria Santos"
      ],
      "usualHours": [
        8,
        20
      ],
      "priorRisk": false
    },
    "input": {
      "customerId": "bench-ver-001",
      "amount": 5750,
      "currency": "SAR",
      "destinationCountry": "Philippines",
      "beneficiaryName": "Maria Santos",
      "transactionType": "International Transfer",
      "submittedAt": "2026-08-13T12:00:00.000Z"
    }
  },
  {
    "id": "BENCH-062",
    "category": "additional_verification",
    "titleEn": "Cross-border transfer threshold (SAR 6,000)",
    "titleAr": "تجاوز حد التحويل الدولي (6,000 ر.س)",
    "descriptionEn": "International transaction exceeding the 5,000 SAR policy threshold with trusted beneficiary.",
    "descriptionAr": "تحويل دولي يتجاوز حد السياسة البالغ 5,000 ريال مع مستفيد معتاد.",
    "expectedDecision": "Additional Verification",
    "expectedRiskLevel": "Medium",
    "customer": {
      "id": "bench-ver-002",
      "name": "Customer 62",
      "nameAr": "عميل 62",
      "averageAmount": 4000,
      "transactionCount": 20,
      "usualCountries": [
        "Saudi Arabia",
        "Philippines"
      ],
      "trustedBeneficiaries": [
        "Maria Santos"
      ],
      "usualHours": [
        8,
        20
      ],
      "priorRisk": false
    },
    "input": {
      "customerId": "bench-ver-002",
      "amount": 6000,
      "currency": "SAR",
      "destinationCountry": "Philippines",
      "beneficiaryName": "Maria Santos",
      "transactionType": "International Transfer",
      "submittedAt": "2026-08-13T12:00:00.000Z"
    }
  },
  {
    "id": "BENCH-063",
    "category": "additional_verification",
    "titleEn": "Cross-border transfer threshold (SAR 6,250)",
    "titleAr": "تجاوز حد التحويل الدولي (6,250 ر.س)",
    "descriptionEn": "International transaction exceeding the 5,000 SAR policy threshold with trusted beneficiary.",
    "descriptionAr": "تحويل دولي يتجاوز حد السياسة البالغ 5,000 ريال مع مستفيد معتاد.",
    "expectedDecision": "Additional Verification",
    "expectedRiskLevel": "Medium",
    "customer": {
      "id": "bench-ver-003",
      "name": "Customer 63",
      "nameAr": "عميل 63",
      "averageAmount": 4000,
      "transactionCount": 20,
      "usualCountries": [
        "Saudi Arabia",
        "Philippines"
      ],
      "trustedBeneficiaries": [
        "Maria Santos"
      ],
      "usualHours": [
        8,
        20
      ],
      "priorRisk": false
    },
    "input": {
      "customerId": "bench-ver-003",
      "amount": 6250,
      "currency": "SAR",
      "destinationCountry": "Philippines",
      "beneficiaryName": "Maria Santos",
      "transactionType": "International Transfer",
      "submittedAt": "2026-08-13T12:00:00.000Z"
    }
  },
  {
    "id": "BENCH-064",
    "category": "additional_verification",
    "titleEn": "Cross-border transfer threshold (SAR 6,500)",
    "titleAr": "تجاوز حد التحويل الدولي (6,500 ر.س)",
    "descriptionEn": "International transaction exceeding the 5,000 SAR policy threshold with trusted beneficiary.",
    "descriptionAr": "تحويل دولي يتجاوز حد السياسة البالغ 5,000 ريال مع مستفيد معتاد.",
    "expectedDecision": "Additional Verification",
    "expectedRiskLevel": "Medium",
    "customer": {
      "id": "bench-ver-004",
      "name": "Customer 64",
      "nameAr": "عميل 64",
      "averageAmount": 4000,
      "transactionCount": 20,
      "usualCountries": [
        "Saudi Arabia",
        "Philippines"
      ],
      "trustedBeneficiaries": [
        "Maria Santos"
      ],
      "usualHours": [
        8,
        20
      ],
      "priorRisk": false
    },
    "input": {
      "customerId": "bench-ver-004",
      "amount": 6500,
      "currency": "SAR",
      "destinationCountry": "Philippines",
      "beneficiaryName": "Maria Santos",
      "transactionType": "International Transfer",
      "submittedAt": "2026-08-13T12:00:00.000Z"
    }
  },
  {
    "id": "BENCH-065",
    "category": "additional_verification",
    "titleEn": "Cross-border transfer threshold (SAR 6,750)",
    "titleAr": "تجاوز حد التحويل الدولي (6,750 ر.س)",
    "descriptionEn": "International transaction exceeding the 5,000 SAR policy threshold with trusted beneficiary.",
    "descriptionAr": "تحويل دولي يتجاوز حد السياسة البالغ 5,000 ريال مع مستفيد معتاد.",
    "expectedDecision": "Additional Verification",
    "expectedRiskLevel": "Medium",
    "customer": {
      "id": "bench-ver-005",
      "name": "Customer 65",
      "nameAr": "عميل 65",
      "averageAmount": 4000,
      "transactionCount": 20,
      "usualCountries": [
        "Saudi Arabia",
        "Philippines"
      ],
      "trustedBeneficiaries": [
        "Maria Santos"
      ],
      "usualHours": [
        8,
        20
      ],
      "priorRisk": false
    },
    "input": {
      "customerId": "bench-ver-005",
      "amount": 6750,
      "currency": "SAR",
      "destinationCountry": "Philippines",
      "beneficiaryName": "Maria Santos",
      "transactionType": "International Transfer",
      "submittedAt": "2026-08-13T12:00:00.000Z"
    }
  },
  {
    "id": "BENCH-066",
    "category": "additional_verification",
    "titleEn": "Cross-border transfer threshold (SAR 7,000)",
    "titleAr": "تجاوز حد التحويل الدولي (7,000 ر.س)",
    "descriptionEn": "International transaction exceeding the 5,000 SAR policy threshold with trusted beneficiary.",
    "descriptionAr": "تحويل دولي يتجاوز حد السياسة البالغ 5,000 ريال مع مستفيد معتاد.",
    "expectedDecision": "Additional Verification",
    "expectedRiskLevel": "Medium",
    "customer": {
      "id": "bench-ver-006",
      "name": "Customer 66",
      "nameAr": "عميل 66",
      "averageAmount": 4000,
      "transactionCount": 20,
      "usualCountries": [
        "Saudi Arabia",
        "Philippines"
      ],
      "trustedBeneficiaries": [
        "Maria Santos"
      ],
      "usualHours": [
        8,
        20
      ],
      "priorRisk": false
    },
    "input": {
      "customerId": "bench-ver-006",
      "amount": 7000,
      "currency": "SAR",
      "destinationCountry": "Philippines",
      "beneficiaryName": "Maria Santos",
      "transactionType": "International Transfer",
      "submittedAt": "2026-08-13T12:00:00.000Z"
    }
  },
  {
    "id": "BENCH-067",
    "category": "additional_verification",
    "titleEn": "Cross-border transfer threshold (SAR 7,250)",
    "titleAr": "تجاوز حد التحويل الدولي (7,250 ر.س)",
    "descriptionEn": "International transaction exceeding the 5,000 SAR policy threshold with trusted beneficiary.",
    "descriptionAr": "تحويل دولي يتجاوز حد السياسة البالغ 5,000 ريال مع مستفيد معتاد.",
    "expectedDecision": "Additional Verification",
    "expectedRiskLevel": "Medium",
    "customer": {
      "id": "bench-ver-007",
      "name": "Customer 67",
      "nameAr": "عميل 67",
      "averageAmount": 4000,
      "transactionCount": 20,
      "usualCountries": [
        "Saudi Arabia",
        "Philippines"
      ],
      "trustedBeneficiaries": [
        "Maria Santos"
      ],
      "usualHours": [
        8,
        20
      ],
      "priorRisk": false
    },
    "input": {
      "customerId": "bench-ver-007",
      "amount": 7250,
      "currency": "SAR",
      "destinationCountry": "Philippines",
      "beneficiaryName": "Maria Santos",
      "transactionType": "International Transfer",
      "submittedAt": "2026-08-13T12:00:00.000Z"
    }
  },
  {
    "id": "BENCH-068",
    "category": "additional_verification",
    "titleEn": "Cross-border transfer threshold (SAR 7,500)",
    "titleAr": "تجاوز حد التحويل الدولي (7,500 ر.س)",
    "descriptionEn": "International transaction exceeding the 5,000 SAR policy threshold with trusted beneficiary.",
    "descriptionAr": "تحويل دولي يتجاوز حد السياسة البالغ 5,000 ريال مع مستفيد معتاد.",
    "expectedDecision": "Additional Verification",
    "expectedRiskLevel": "Medium",
    "customer": {
      "id": "bench-ver-008",
      "name": "Customer 68",
      "nameAr": "عميل 68",
      "averageAmount": 4000,
      "transactionCount": 20,
      "usualCountries": [
        "Saudi Arabia",
        "Philippines"
      ],
      "trustedBeneficiaries": [
        "Maria Santos"
      ],
      "usualHours": [
        8,
        20
      ],
      "priorRisk": false
    },
    "input": {
      "customerId": "bench-ver-008",
      "amount": 7500,
      "currency": "SAR",
      "destinationCountry": "Philippines",
      "beneficiaryName": "Maria Santos",
      "transactionType": "International Transfer",
      "submittedAt": "2026-08-13T12:00:00.000Z"
    }
  },
  {
    "id": "BENCH-069",
    "category": "additional_verification",
    "titleEn": "Cross-border transfer threshold (SAR 7,750)",
    "titleAr": "تجاوز حد التحويل الدولي (7,750 ر.س)",
    "descriptionEn": "International transaction exceeding the 5,000 SAR policy threshold with trusted beneficiary.",
    "descriptionAr": "تحويل دولي يتجاوز حد السياسة البالغ 5,000 ريال مع مستفيد معتاد.",
    "expectedDecision": "Additional Verification",
    "expectedRiskLevel": "Medium",
    "customer": {
      "id": "bench-ver-009",
      "name": "Customer 69",
      "nameAr": "عميل 69",
      "averageAmount": 4000,
      "transactionCount": 20,
      "usualCountries": [
        "Saudi Arabia",
        "Philippines"
      ],
      "trustedBeneficiaries": [
        "Maria Santos"
      ],
      "usualHours": [
        8,
        20
      ],
      "priorRisk": false
    },
    "input": {
      "customerId": "bench-ver-009",
      "amount": 7750,
      "currency": "SAR",
      "destinationCountry": "Philippines",
      "beneficiaryName": "Maria Santos",
      "transactionType": "International Transfer",
      "submittedAt": "2026-08-13T12:00:00.000Z"
    }
  },
  {
    "id": "BENCH-070",
    "category": "additional_verification",
    "titleEn": "Cross-border transfer threshold (SAR 8,000)",
    "titleAr": "تجاوز حد التحويل الدولي (8,000 ر.س)",
    "descriptionEn": "International transaction exceeding the 5,000 SAR policy threshold with trusted beneficiary.",
    "descriptionAr": "تحويل دولي يتجاوز حد السياسة البالغ 5,000 ريال مع مستفيد معتاد.",
    "expectedDecision": "Additional Verification",
    "expectedRiskLevel": "Medium",
    "customer": {
      "id": "bench-ver-010",
      "name": "Customer 70",
      "nameAr": "عميل 70",
      "averageAmount": 4000,
      "transactionCount": 20,
      "usualCountries": [
        "Saudi Arabia",
        "Philippines"
      ],
      "trustedBeneficiaries": [
        "Maria Santos"
      ],
      "usualHours": [
        8,
        20
      ],
      "priorRisk": false
    },
    "input": {
      "customerId": "bench-ver-010",
      "amount": 8000,
      "currency": "SAR",
      "destinationCountry": "Philippines",
      "beneficiaryName": "Maria Santos",
      "transactionType": "International Transfer",
      "submittedAt": "2026-08-13T12:00:00.000Z"
    }
  },
  {
    "id": "BENCH-071",
    "category": "additional_verification",
    "titleEn": "Cross-border transfer threshold (SAR 8,250)",
    "titleAr": "تجاوز حد التحويل الدولي (8,250 ر.س)",
    "descriptionEn": "International transaction exceeding the 5,000 SAR policy threshold with trusted beneficiary.",
    "descriptionAr": "تحويل دولي يتجاوز حد السياسة البالغ 5,000 ريال مع مستفيد معتاد.",
    "expectedDecision": "Additional Verification",
    "expectedRiskLevel": "Medium",
    "customer": {
      "id": "bench-ver-011",
      "name": "Customer 71",
      "nameAr": "عميل 71",
      "averageAmount": 4000,
      "transactionCount": 20,
      "usualCountries": [
        "Saudi Arabia",
        "Philippines"
      ],
      "trustedBeneficiaries": [
        "Maria Santos"
      ],
      "usualHours": [
        8,
        20
      ],
      "priorRisk": false
    },
    "input": {
      "customerId": "bench-ver-011",
      "amount": 8250,
      "currency": "SAR",
      "destinationCountry": "Philippines",
      "beneficiaryName": "Maria Santos",
      "transactionType": "International Transfer",
      "submittedAt": "2026-08-13T12:00:00.000Z"
    }
  },
  {
    "id": "BENCH-072",
    "category": "additional_verification",
    "titleEn": "Cross-border transfer threshold (SAR 8,500)",
    "titleAr": "تجاوز حد التحويل الدولي (8,500 ر.س)",
    "descriptionEn": "International transaction exceeding the 5,000 SAR policy threshold with trusted beneficiary.",
    "descriptionAr": "تحويل دولي يتجاوز حد السياسة البالغ 5,000 ريال مع مستفيد معتاد.",
    "expectedDecision": "Additional Verification",
    "expectedRiskLevel": "Medium",
    "customer": {
      "id": "bench-ver-012",
      "name": "Customer 72",
      "nameAr": "عميل 72",
      "averageAmount": 4000,
      "transactionCount": 20,
      "usualCountries": [
        "Saudi Arabia",
        "Philippines"
      ],
      "trustedBeneficiaries": [
        "Maria Santos"
      ],
      "usualHours": [
        8,
        20
      ],
      "priorRisk": false
    },
    "input": {
      "customerId": "bench-ver-012",
      "amount": 8500,
      "currency": "SAR",
      "destinationCountry": "Philippines",
      "beneficiaryName": "Maria Santos",
      "transactionType": "International Transfer",
      "submittedAt": "2026-08-13T12:00:00.000Z"
    }
  },
  {
    "id": "BENCH-073",
    "category": "additional_verification",
    "titleEn": "Cross-border transfer threshold (SAR 8,750)",
    "titleAr": "تجاوز حد التحويل الدولي (8,750 ر.س)",
    "descriptionEn": "International transaction exceeding the 5,000 SAR policy threshold with trusted beneficiary.",
    "descriptionAr": "تحويل دولي يتجاوز حد السياسة البالغ 5,000 ريال مع مستفيد معتاد.",
    "expectedDecision": "Additional Verification",
    "expectedRiskLevel": "Medium",
    "customer": {
      "id": "bench-ver-013",
      "name": "Customer 73",
      "nameAr": "عميل 73",
      "averageAmount": 4000,
      "transactionCount": 20,
      "usualCountries": [
        "Saudi Arabia",
        "Philippines"
      ],
      "trustedBeneficiaries": [
        "Maria Santos"
      ],
      "usualHours": [
        8,
        20
      ],
      "priorRisk": false
    },
    "input": {
      "customerId": "bench-ver-013",
      "amount": 8750,
      "currency": "SAR",
      "destinationCountry": "Philippines",
      "beneficiaryName": "Maria Santos",
      "transactionType": "International Transfer",
      "submittedAt": "2026-08-13T12:00:00.000Z"
    }
  },
  {
    "id": "BENCH-074",
    "category": "additional_verification",
    "titleEn": "Cross-border transfer threshold (SAR 9,000)",
    "titleAr": "تجاوز حد التحويل الدولي (9,000 ر.س)",
    "descriptionEn": "International transaction exceeding the 5,000 SAR policy threshold with trusted beneficiary.",
    "descriptionAr": "تحويل دولي يتجاوز حد السياسة البالغ 5,000 ريال مع مستفيد معتاد.",
    "expectedDecision": "Additional Verification",
    "expectedRiskLevel": "Medium",
    "customer": {
      "id": "bench-ver-014",
      "name": "Customer 74",
      "nameAr": "عميل 74",
      "averageAmount": 4000,
      "transactionCount": 20,
      "usualCountries": [
        "Saudi Arabia",
        "Philippines"
      ],
      "trustedBeneficiaries": [
        "Maria Santos"
      ],
      "usualHours": [
        8,
        20
      ],
      "priorRisk": false
    },
    "input": {
      "customerId": "bench-ver-014",
      "amount": 9000,
      "currency": "SAR",
      "destinationCountry": "Philippines",
      "beneficiaryName": "Maria Santos",
      "transactionType": "International Transfer",
      "submittedAt": "2026-08-13T12:00:00.000Z"
    }
  },
  {
    "id": "BENCH-075",
    "category": "additional_verification",
    "titleEn": "Cross-border transfer threshold (SAR 9,250)",
    "titleAr": "تجاوز حد التحويل الدولي (9,250 ر.س)",
    "descriptionEn": "International transaction exceeding the 5,000 SAR policy threshold with trusted beneficiary.",
    "descriptionAr": "تحويل دولي يتجاوز حد السياسة البالغ 5,000 ريال مع مستفيد معتاد.",
    "expectedDecision": "Additional Verification",
    "expectedRiskLevel": "Medium",
    "customer": {
      "id": "bench-ver-015",
      "name": "Customer 75",
      "nameAr": "عميل 75",
      "averageAmount": 4000,
      "transactionCount": 20,
      "usualCountries": [
        "Saudi Arabia",
        "Philippines"
      ],
      "trustedBeneficiaries": [
        "Maria Santos"
      ],
      "usualHours": [
        8,
        20
      ],
      "priorRisk": false
    },
    "input": {
      "customerId": "bench-ver-015",
      "amount": 9250,
      "currency": "SAR",
      "destinationCountry": "Philippines",
      "beneficiaryName": "Maria Santos",
      "transactionType": "International Transfer",
      "submittedAt": "2026-08-13T12:00:00.000Z"
    }
  },
  {
    "id": "BENCH-076",
    "category": "additional_verification",
    "titleEn": "Cross-border transfer threshold (SAR 9,500)",
    "titleAr": "تجاوز حد التحويل الدولي (9,500 ر.س)",
    "descriptionEn": "International transaction exceeding the 5,000 SAR policy threshold with trusted beneficiary.",
    "descriptionAr": "تحويل دولي يتجاوز حد السياسة البالغ 5,000 ريال مع مستفيد معتاد.",
    "expectedDecision": "Additional Verification",
    "expectedRiskLevel": "Medium",
    "customer": {
      "id": "bench-ver-016",
      "name": "Customer 76",
      "nameAr": "عميل 76",
      "averageAmount": 4000,
      "transactionCount": 20,
      "usualCountries": [
        "Saudi Arabia",
        "Philippines"
      ],
      "trustedBeneficiaries": [
        "Maria Santos"
      ],
      "usualHours": [
        8,
        20
      ],
      "priorRisk": false
    },
    "input": {
      "customerId": "bench-ver-016",
      "amount": 9500,
      "currency": "SAR",
      "destinationCountry": "Philippines",
      "beneficiaryName": "Maria Santos",
      "transactionType": "International Transfer",
      "submittedAt": "2026-08-13T12:00:00.000Z"
    }
  },
  {
    "id": "BENCH-077",
    "category": "additional_verification",
    "titleEn": "Cross-border transfer threshold (SAR 9,750)",
    "titleAr": "تجاوز حد التحويل الدولي (9,750 ر.س)",
    "descriptionEn": "International transaction exceeding the 5,000 SAR policy threshold with trusted beneficiary.",
    "descriptionAr": "تحويل دولي يتجاوز حد السياسة البالغ 5,000 ريال مع مستفيد معتاد.",
    "expectedDecision": "Additional Verification",
    "expectedRiskLevel": "Medium",
    "customer": {
      "id": "bench-ver-017",
      "name": "Customer 77",
      "nameAr": "عميل 77",
      "averageAmount": 4000,
      "transactionCount": 20,
      "usualCountries": [
        "Saudi Arabia",
        "Philippines"
      ],
      "trustedBeneficiaries": [
        "Maria Santos"
      ],
      "usualHours": [
        8,
        20
      ],
      "priorRisk": false
    },
    "input": {
      "customerId": "bench-ver-017",
      "amount": 9750,
      "currency": "SAR",
      "destinationCountry": "Philippines",
      "beneficiaryName": "Maria Santos",
      "transactionType": "International Transfer",
      "submittedAt": "2026-08-13T12:00:00.000Z"
    }
  },
  {
    "id": "BENCH-078",
    "category": "additional_verification",
    "titleEn": "Cross-border transfer threshold (SAR 10,000)",
    "titleAr": "تجاوز حد التحويل الدولي (10,000 ر.س)",
    "descriptionEn": "International transaction exceeding the 5,000 SAR policy threshold with trusted beneficiary.",
    "descriptionAr": "تحويل دولي يتجاوز حد السياسة البالغ 5,000 ريال مع مستفيد معتاد.",
    "expectedDecision": "Additional Verification",
    "expectedRiskLevel": "Medium",
    "customer": {
      "id": "bench-ver-018",
      "name": "Customer 78",
      "nameAr": "عميل 78",
      "averageAmount": 4000,
      "transactionCount": 20,
      "usualCountries": [
        "Saudi Arabia",
        "Philippines"
      ],
      "trustedBeneficiaries": [
        "Maria Santos"
      ],
      "usualHours": [
        8,
        20
      ],
      "priorRisk": false
    },
    "input": {
      "customerId": "bench-ver-018",
      "amount": 10000,
      "currency": "SAR",
      "destinationCountry": "Philippines",
      "beneficiaryName": "Maria Santos",
      "transactionType": "International Transfer",
      "submittedAt": "2026-08-13T12:00:00.000Z"
    }
  },
  {
    "id": "BENCH-079",
    "category": "additional_verification",
    "titleEn": "Cross-border transfer threshold (SAR 10,250)",
    "titleAr": "تجاوز حد التحويل الدولي (10,250 ر.س)",
    "descriptionEn": "International transaction exceeding the 5,000 SAR policy threshold with trusted beneficiary.",
    "descriptionAr": "تحويل دولي يتجاوز حد السياسة البالغ 5,000 ريال مع مستفيد معتاد.",
    "expectedDecision": "Additional Verification",
    "expectedRiskLevel": "Medium",
    "customer": {
      "id": "bench-ver-019",
      "name": "Customer 79",
      "nameAr": "عميل 79",
      "averageAmount": 4000,
      "transactionCount": 20,
      "usualCountries": [
        "Saudi Arabia",
        "Philippines"
      ],
      "trustedBeneficiaries": [
        "Maria Santos"
      ],
      "usualHours": [
        8,
        20
      ],
      "priorRisk": false
    },
    "input": {
      "customerId": "bench-ver-019",
      "amount": 10250,
      "currency": "SAR",
      "destinationCountry": "Philippines",
      "beneficiaryName": "Maria Santos",
      "transactionType": "International Transfer",
      "submittedAt": "2026-08-13T12:00:00.000Z"
    }
  },
  {
    "id": "BENCH-080",
    "category": "additional_verification",
    "titleEn": "Cross-border transfer threshold (SAR 10,500)",
    "titleAr": "تجاوز حد التحويل الدولي (10,500 ر.س)",
    "descriptionEn": "International transaction exceeding the 5,000 SAR policy threshold with trusted beneficiary.",
    "descriptionAr": "تحويل دولي يتجاوز حد السياسة البالغ 5,000 ريال مع مستفيد معتاد.",
    "expectedDecision": "Additional Verification",
    "expectedRiskLevel": "Medium",
    "customer": {
      "id": "bench-ver-020",
      "name": "Customer 80",
      "nameAr": "عميل 80",
      "averageAmount": 4000,
      "transactionCount": 20,
      "usualCountries": [
        "Saudi Arabia",
        "Philippines"
      ],
      "trustedBeneficiaries": [
        "Maria Santos"
      ],
      "usualHours": [
        8,
        20
      ],
      "priorRisk": false
    },
    "input": {
      "customerId": "bench-ver-020",
      "amount": 10500,
      "currency": "SAR",
      "destinationCountry": "Philippines",
      "beneficiaryName": "Maria Santos",
      "transactionType": "International Transfer",
      "submittedAt": "2026-08-13T12:00:00.000Z"
    }
  },
  {
    "id": "BENCH-081",
    "category": "additional_verification",
    "titleEn": "Amount multiple deviation (4600 SAR) + new counterparty",
    "titleAr": "انحراف مضاعف للمبلغ (4600 ر.س) مع مستفيد جديد",
    "descriptionEn": "Local transfer at 2.3x baseline average with an unconfirmed beneficiary.",
    "descriptionAr": "تحويل محلي بمعدل 2.3× من خط الأساس مع مستفيد جديد غير مثبت سابقًا.",
    "expectedDecision": "Additional Verification",
    "expectedRiskLevel": "Medium",
    "customer": {
      "id": "bench-ver-021",
      "name": "Customer 81",
      "nameAr": "عميل 81",
      "averageAmount": 2000,
      "transactionCount": 20,
      "usualCountries": [
        "Saudi Arabia"
      ],
      "trustedBeneficiaries": [
        "Old Vendor Ltd"
      ],
      "usualHours": [
        8,
        20
      ],
      "priorRisk": false
    },
    "input": {
      "customerId": "bench-ver-021",
      "amount": 4600,
      "currency": "SAR",
      "destinationCountry": "Saudi Arabia",
      "beneficiaryName": "New Supplier LLC #21",
      "transactionType": "Local Transfer",
      "submittedAt": "2026-08-13T12:00:00.000Z"
    }
  },
  {
    "id": "BENCH-082",
    "category": "additional_verification",
    "titleEn": "Amount multiple deviation (4600 SAR) + new counterparty",
    "titleAr": "انحراف مضاعف للمبلغ (4600 ر.س) مع مستفيد جديد",
    "descriptionEn": "Local transfer at 2.3x baseline average with an unconfirmed beneficiary.",
    "descriptionAr": "تحويل محلي بمعدل 2.3× من خط الأساس مع مستفيد جديد غير مثبت سابقًا.",
    "expectedDecision": "Additional Verification",
    "expectedRiskLevel": "Medium",
    "customer": {
      "id": "bench-ver-022",
      "name": "Customer 82",
      "nameAr": "عميل 82",
      "averageAmount": 2000,
      "transactionCount": 20,
      "usualCountries": [
        "Saudi Arabia"
      ],
      "trustedBeneficiaries": [
        "Old Vendor Ltd"
      ],
      "usualHours": [
        8,
        20
      ],
      "priorRisk": false
    },
    "input": {
      "customerId": "bench-ver-022",
      "amount": 4600,
      "currency": "SAR",
      "destinationCountry": "Saudi Arabia",
      "beneficiaryName": "New Supplier LLC #22",
      "transactionType": "Local Transfer",
      "submittedAt": "2026-08-13T12:00:00.000Z"
    }
  },
  {
    "id": "BENCH-083",
    "category": "additional_verification",
    "titleEn": "Amount multiple deviation (4600 SAR) + new counterparty",
    "titleAr": "انحراف مضاعف للمبلغ (4600 ر.س) مع مستفيد جديد",
    "descriptionEn": "Local transfer at 2.3x baseline average with an unconfirmed beneficiary.",
    "descriptionAr": "تحويل محلي بمعدل 2.3× من خط الأساس مع مستفيد جديد غير مثبت سابقًا.",
    "expectedDecision": "Additional Verification",
    "expectedRiskLevel": "Medium",
    "customer": {
      "id": "bench-ver-023",
      "name": "Customer 83",
      "nameAr": "عميل 83",
      "averageAmount": 2000,
      "transactionCount": 20,
      "usualCountries": [
        "Saudi Arabia"
      ],
      "trustedBeneficiaries": [
        "Old Vendor Ltd"
      ],
      "usualHours": [
        8,
        20
      ],
      "priorRisk": false
    },
    "input": {
      "customerId": "bench-ver-023",
      "amount": 4600,
      "currency": "SAR",
      "destinationCountry": "Saudi Arabia",
      "beneficiaryName": "New Supplier LLC #23",
      "transactionType": "Local Transfer",
      "submittedAt": "2026-08-13T12:00:00.000Z"
    }
  },
  {
    "id": "BENCH-084",
    "category": "additional_verification",
    "titleEn": "Amount multiple deviation (4600 SAR) + new counterparty",
    "titleAr": "انحراف مضاعف للمبلغ (4600 ر.س) مع مستفيد جديد",
    "descriptionEn": "Local transfer at 2.3x baseline average with an unconfirmed beneficiary.",
    "descriptionAr": "تحويل محلي بمعدل 2.3× من خط الأساس مع مستفيد جديد غير مثبت سابقًا.",
    "expectedDecision": "Additional Verification",
    "expectedRiskLevel": "Medium",
    "customer": {
      "id": "bench-ver-024",
      "name": "Customer 84",
      "nameAr": "عميل 84",
      "averageAmount": 2000,
      "transactionCount": 20,
      "usualCountries": [
        "Saudi Arabia"
      ],
      "trustedBeneficiaries": [
        "Old Vendor Ltd"
      ],
      "usualHours": [
        8,
        20
      ],
      "priorRisk": false
    },
    "input": {
      "customerId": "bench-ver-024",
      "amount": 4600,
      "currency": "SAR",
      "destinationCountry": "Saudi Arabia",
      "beneficiaryName": "New Supplier LLC #24",
      "transactionType": "Local Transfer",
      "submittedAt": "2026-08-13T12:00:00.000Z"
    }
  },
  {
    "id": "BENCH-085",
    "category": "additional_verification",
    "titleEn": "Amount multiple deviation (4600 SAR) + new counterparty",
    "titleAr": "انحراف مضاعف للمبلغ (4600 ر.س) مع مستفيد جديد",
    "descriptionEn": "Local transfer at 2.3x baseline average with an unconfirmed beneficiary.",
    "descriptionAr": "تحويل محلي بمعدل 2.3× من خط الأساس مع مستفيد جديد غير مثبت سابقًا.",
    "expectedDecision": "Additional Verification",
    "expectedRiskLevel": "Medium",
    "customer": {
      "id": "bench-ver-025",
      "name": "Customer 85",
      "nameAr": "عميل 85",
      "averageAmount": 2000,
      "transactionCount": 20,
      "usualCountries": [
        "Saudi Arabia"
      ],
      "trustedBeneficiaries": [
        "Old Vendor Ltd"
      ],
      "usualHours": [
        8,
        20
      ],
      "priorRisk": false
    },
    "input": {
      "customerId": "bench-ver-025",
      "amount": 4600,
      "currency": "SAR",
      "destinationCountry": "Saudi Arabia",
      "beneficiaryName": "New Supplier LLC #25",
      "transactionType": "Local Transfer",
      "submittedAt": "2026-08-13T12:00:00.000Z"
    }
  },
  {
    "id": "BENCH-086",
    "category": "additional_verification",
    "titleEn": "Amount multiple deviation (4600 SAR) + new counterparty",
    "titleAr": "انحراف مضاعف للمبلغ (4600 ر.س) مع مستفيد جديد",
    "descriptionEn": "Local transfer at 2.3x baseline average with an unconfirmed beneficiary.",
    "descriptionAr": "تحويل محلي بمعدل 2.3× من خط الأساس مع مستفيد جديد غير مثبت سابقًا.",
    "expectedDecision": "Additional Verification",
    "expectedRiskLevel": "Medium",
    "customer": {
      "id": "bench-ver-026",
      "name": "Customer 86",
      "nameAr": "عميل 86",
      "averageAmount": 2000,
      "transactionCount": 20,
      "usualCountries": [
        "Saudi Arabia"
      ],
      "trustedBeneficiaries": [
        "Old Vendor Ltd"
      ],
      "usualHours": [
        8,
        20
      ],
      "priorRisk": false
    },
    "input": {
      "customerId": "bench-ver-026",
      "amount": 4600,
      "currency": "SAR",
      "destinationCountry": "Saudi Arabia",
      "beneficiaryName": "New Supplier LLC #26",
      "transactionType": "Local Transfer",
      "submittedAt": "2026-08-13T12:00:00.000Z"
    }
  },
  {
    "id": "BENCH-087",
    "category": "additional_verification",
    "titleEn": "Amount multiple deviation (4600 SAR) + new counterparty",
    "titleAr": "انحراف مضاعف للمبلغ (4600 ر.س) مع مستفيد جديد",
    "descriptionEn": "Local transfer at 2.3x baseline average with an unconfirmed beneficiary.",
    "descriptionAr": "تحويل محلي بمعدل 2.3× من خط الأساس مع مستفيد جديد غير مثبت سابقًا.",
    "expectedDecision": "Additional Verification",
    "expectedRiskLevel": "Medium",
    "customer": {
      "id": "bench-ver-027",
      "name": "Customer 87",
      "nameAr": "عميل 87",
      "averageAmount": 2000,
      "transactionCount": 20,
      "usualCountries": [
        "Saudi Arabia"
      ],
      "trustedBeneficiaries": [
        "Old Vendor Ltd"
      ],
      "usualHours": [
        8,
        20
      ],
      "priorRisk": false
    },
    "input": {
      "customerId": "bench-ver-027",
      "amount": 4600,
      "currency": "SAR",
      "destinationCountry": "Saudi Arabia",
      "beneficiaryName": "New Supplier LLC #27",
      "transactionType": "Local Transfer",
      "submittedAt": "2026-08-13T12:00:00.000Z"
    }
  },
  {
    "id": "BENCH-088",
    "category": "additional_verification",
    "titleEn": "Amount multiple deviation (4600 SAR) + new counterparty",
    "titleAr": "انحراف مضاعف للمبلغ (4600 ر.س) مع مستفيد جديد",
    "descriptionEn": "Local transfer at 2.3x baseline average with an unconfirmed beneficiary.",
    "descriptionAr": "تحويل محلي بمعدل 2.3× من خط الأساس مع مستفيد جديد غير مثبت سابقًا.",
    "expectedDecision": "Additional Verification",
    "expectedRiskLevel": "Medium",
    "customer": {
      "id": "bench-ver-028",
      "name": "Customer 88",
      "nameAr": "عميل 88",
      "averageAmount": 2000,
      "transactionCount": 20,
      "usualCountries": [
        "Saudi Arabia"
      ],
      "trustedBeneficiaries": [
        "Old Vendor Ltd"
      ],
      "usualHours": [
        8,
        20
      ],
      "priorRisk": false
    },
    "input": {
      "customerId": "bench-ver-028",
      "amount": 4600,
      "currency": "SAR",
      "destinationCountry": "Saudi Arabia",
      "beneficiaryName": "New Supplier LLC #28",
      "transactionType": "Local Transfer",
      "submittedAt": "2026-08-13T12:00:00.000Z"
    }
  },
  {
    "id": "BENCH-089",
    "category": "additional_verification",
    "titleEn": "Amount multiple deviation (4600 SAR) + new counterparty",
    "titleAr": "انحراف مضاعف للمبلغ (4600 ر.س) مع مستفيد جديد",
    "descriptionEn": "Local transfer at 2.3x baseline average with an unconfirmed beneficiary.",
    "descriptionAr": "تحويل محلي بمعدل 2.3× من خط الأساس مع مستفيد جديد غير مثبت سابقًا.",
    "expectedDecision": "Additional Verification",
    "expectedRiskLevel": "Medium",
    "customer": {
      "id": "bench-ver-029",
      "name": "Customer 89",
      "nameAr": "عميل 89",
      "averageAmount": 2000,
      "transactionCount": 20,
      "usualCountries": [
        "Saudi Arabia"
      ],
      "trustedBeneficiaries": [
        "Old Vendor Ltd"
      ],
      "usualHours": [
        8,
        20
      ],
      "priorRisk": false
    },
    "input": {
      "customerId": "bench-ver-029",
      "amount": 4600,
      "currency": "SAR",
      "destinationCountry": "Saudi Arabia",
      "beneficiaryName": "New Supplier LLC #29",
      "transactionType": "Local Transfer",
      "submittedAt": "2026-08-13T12:00:00.000Z"
    }
  },
  {
    "id": "BENCH-090",
    "category": "additional_verification",
    "titleEn": "Amount multiple deviation (4600 SAR) + new counterparty",
    "titleAr": "انحراف مضاعف للمبلغ (4600 ر.س) مع مستفيد جديد",
    "descriptionEn": "Local transfer at 2.3x baseline average with an unconfirmed beneficiary.",
    "descriptionAr": "تحويل محلي بمعدل 2.3× من خط الأساس مع مستفيد جديد غير مثبت سابقًا.",
    "expectedDecision": "Additional Verification",
    "expectedRiskLevel": "Medium",
    "customer": {
      "id": "bench-ver-030",
      "name": "Customer 90",
      "nameAr": "عميل 90",
      "averageAmount": 2000,
      "transactionCount": 20,
      "usualCountries": [
        "Saudi Arabia"
      ],
      "trustedBeneficiaries": [
        "Old Vendor Ltd"
      ],
      "usualHours": [
        8,
        20
      ],
      "priorRisk": false
    },
    "input": {
      "customerId": "bench-ver-030",
      "amount": 4600,
      "currency": "SAR",
      "destinationCountry": "Saudi Arabia",
      "beneficiaryName": "New Supplier LLC #30",
      "transactionType": "Local Transfer",
      "submittedAt": "2026-08-13T12:00:00.000Z"
    }
  },
  {
    "id": "BENCH-091",
    "category": "additional_verification",
    "titleEn": "Amount multiple deviation (4600 SAR) + new counterparty",
    "titleAr": "انحراف مضاعف للمبلغ (4600 ر.س) مع مستفيد جديد",
    "descriptionEn": "Local transfer at 2.3x baseline average with an unconfirmed beneficiary.",
    "descriptionAr": "تحويل محلي بمعدل 2.3× من خط الأساس مع مستفيد جديد غير مثبت سابقًا.",
    "expectedDecision": "Additional Verification",
    "expectedRiskLevel": "Medium",
    "customer": {
      "id": "bench-ver-031",
      "name": "Customer 91",
      "nameAr": "عميل 91",
      "averageAmount": 2000,
      "transactionCount": 20,
      "usualCountries": [
        "Saudi Arabia"
      ],
      "trustedBeneficiaries": [
        "Old Vendor Ltd"
      ],
      "usualHours": [
        8,
        20
      ],
      "priorRisk": false
    },
    "input": {
      "customerId": "bench-ver-031",
      "amount": 4600,
      "currency": "SAR",
      "destinationCountry": "Saudi Arabia",
      "beneficiaryName": "New Supplier LLC #31",
      "transactionType": "Local Transfer",
      "submittedAt": "2026-08-13T12:00:00.000Z"
    }
  },
  {
    "id": "BENCH-092",
    "category": "additional_verification",
    "titleEn": "Amount multiple deviation (4600 SAR) + new counterparty",
    "titleAr": "انحراف مضاعف للمبلغ (4600 ر.س) مع مستفيد جديد",
    "descriptionEn": "Local transfer at 2.3x baseline average with an unconfirmed beneficiary.",
    "descriptionAr": "تحويل محلي بمعدل 2.3× من خط الأساس مع مستفيد جديد غير مثبت سابقًا.",
    "expectedDecision": "Additional Verification",
    "expectedRiskLevel": "Medium",
    "customer": {
      "id": "bench-ver-032",
      "name": "Customer 92",
      "nameAr": "عميل 92",
      "averageAmount": 2000,
      "transactionCount": 20,
      "usualCountries": [
        "Saudi Arabia"
      ],
      "trustedBeneficiaries": [
        "Old Vendor Ltd"
      ],
      "usualHours": [
        8,
        20
      ],
      "priorRisk": false
    },
    "input": {
      "customerId": "bench-ver-032",
      "amount": 4600,
      "currency": "SAR",
      "destinationCountry": "Saudi Arabia",
      "beneficiaryName": "New Supplier LLC #32",
      "transactionType": "Local Transfer",
      "submittedAt": "2026-08-13T12:00:00.000Z"
    }
  },
  {
    "id": "BENCH-093",
    "category": "additional_verification",
    "titleEn": "Amount multiple deviation (4600 SAR) + new counterparty",
    "titleAr": "انحراف مضاعف للمبلغ (4600 ر.س) مع مستفيد جديد",
    "descriptionEn": "Local transfer at 2.3x baseline average with an unconfirmed beneficiary.",
    "descriptionAr": "تحويل محلي بمعدل 2.3× من خط الأساس مع مستفيد جديد غير مثبت سابقًا.",
    "expectedDecision": "Additional Verification",
    "expectedRiskLevel": "Medium",
    "customer": {
      "id": "bench-ver-033",
      "name": "Customer 93",
      "nameAr": "عميل 93",
      "averageAmount": 2000,
      "transactionCount": 20,
      "usualCountries": [
        "Saudi Arabia"
      ],
      "trustedBeneficiaries": [
        "Old Vendor Ltd"
      ],
      "usualHours": [
        8,
        20
      ],
      "priorRisk": false
    },
    "input": {
      "customerId": "bench-ver-033",
      "amount": 4600,
      "currency": "SAR",
      "destinationCountry": "Saudi Arabia",
      "beneficiaryName": "New Supplier LLC #33",
      "transactionType": "Local Transfer",
      "submittedAt": "2026-08-13T12:00:00.000Z"
    }
  },
  {
    "id": "BENCH-094",
    "category": "additional_verification",
    "titleEn": "Amount multiple deviation (4600 SAR) + new counterparty",
    "titleAr": "انحراف مضاعف للمبلغ (4600 ر.س) مع مستفيد جديد",
    "descriptionEn": "Local transfer at 2.3x baseline average with an unconfirmed beneficiary.",
    "descriptionAr": "تحويل محلي بمعدل 2.3× من خط الأساس مع مستفيد جديد غير مثبت سابقًا.",
    "expectedDecision": "Additional Verification",
    "expectedRiskLevel": "Medium",
    "customer": {
      "id": "bench-ver-034",
      "name": "Customer 94",
      "nameAr": "عميل 94",
      "averageAmount": 2000,
      "transactionCount": 20,
      "usualCountries": [
        "Saudi Arabia"
      ],
      "trustedBeneficiaries": [
        "Old Vendor Ltd"
      ],
      "usualHours": [
        8,
        20
      ],
      "priorRisk": false
    },
    "input": {
      "customerId": "bench-ver-034",
      "amount": 4600,
      "currency": "SAR",
      "destinationCountry": "Saudi Arabia",
      "beneficiaryName": "New Supplier LLC #34",
      "transactionType": "Local Transfer",
      "submittedAt": "2026-08-13T12:00:00.000Z"
    }
  },
  {
    "id": "BENCH-095",
    "category": "additional_verification",
    "titleEn": "Amount multiple deviation (4600 SAR) + new counterparty",
    "titleAr": "انحراف مضاعف للمبلغ (4600 ر.س) مع مستفيد جديد",
    "descriptionEn": "Local transfer at 2.3x baseline average with an unconfirmed beneficiary.",
    "descriptionAr": "تحويل محلي بمعدل 2.3× من خط الأساس مع مستفيد جديد غير مثبت سابقًا.",
    "expectedDecision": "Additional Verification",
    "expectedRiskLevel": "Medium",
    "customer": {
      "id": "bench-ver-035",
      "name": "Customer 95",
      "nameAr": "عميل 95",
      "averageAmount": 2000,
      "transactionCount": 20,
      "usualCountries": [
        "Saudi Arabia"
      ],
      "trustedBeneficiaries": [
        "Old Vendor Ltd"
      ],
      "usualHours": [
        8,
        20
      ],
      "priorRisk": false
    },
    "input": {
      "customerId": "bench-ver-035",
      "amount": 4600,
      "currency": "SAR",
      "destinationCountry": "Saudi Arabia",
      "beneficiaryName": "New Supplier LLC #35",
      "transactionType": "Local Transfer",
      "submittedAt": "2026-08-13T12:00:00.000Z"
    }
  },
  {
    "id": "BENCH-096",
    "category": "additional_verification",
    "titleEn": "Unregistered merchant domain inspection (Needs Review)",
    "titleAr": "فحص نطاق متجر غير مسجل (يحتاج مراجعة)",
    "descriptionEn": "Transaction to an unverified merchant domain requiring stepped-up verification.",
    "descriptionAr": "عملية شراء عبر نطاق متجر يحتاج مراجعة ويفرض تحققًا إضافيًا.",
    "expectedDecision": "Additional Verification",
    "expectedRiskLevel": "Medium",
    "customer": {
      "id": "bench-ver-036",
      "name": "Customer 96",
      "nameAr": "عميل 96",
      "averageAmount": 3500,
      "transactionCount": 20,
      "usualCountries": [
        "Saudi Arabia"
      ],
      "trustedBeneficiaries": [
        "Merchant Store #36"
      ],
      "usualHours": [
        8,
        20
      ],
      "priorRisk": false
    },
    "input": {
      "customerId": "bench-ver-036",
      "amount": 1500,
      "currency": "SAR",
      "destinationCountry": "Saudi Arabia",
      "beneficiaryName": "Merchant Store #36",
      "transactionType": "Merchant Payment",
      "websiteDomain": "shoplogin36.com",
      "submittedAt": "2026-08-13T12:00:00.000Z"
    }
  },
  {
    "id": "BENCH-097",
    "category": "additional_verification",
    "titleEn": "Unregistered merchant domain inspection (Needs Review)",
    "titleAr": "فحص نطاق متجر غير مسجل (يحتاج مراجعة)",
    "descriptionEn": "Transaction to an unverified merchant domain requiring stepped-up verification.",
    "descriptionAr": "عملية شراء عبر نطاق متجر يحتاج مراجعة ويفرض تحققًا إضافيًا.",
    "expectedDecision": "Additional Verification",
    "expectedRiskLevel": "Medium",
    "customer": {
      "id": "bench-ver-037",
      "name": "Customer 97",
      "nameAr": "عميل 97",
      "averageAmount": 3500,
      "transactionCount": 20,
      "usualCountries": [
        "Saudi Arabia"
      ],
      "trustedBeneficiaries": [
        "Merchant Store #37"
      ],
      "usualHours": [
        8,
        20
      ],
      "priorRisk": false
    },
    "input": {
      "customerId": "bench-ver-037",
      "amount": 1500,
      "currency": "SAR",
      "destinationCountry": "Saudi Arabia",
      "beneficiaryName": "Merchant Store #37",
      "transactionType": "Merchant Payment",
      "websiteDomain": "shoplogin37.com",
      "submittedAt": "2026-08-13T12:00:00.000Z"
    }
  },
  {
    "id": "BENCH-098",
    "category": "additional_verification",
    "titleEn": "Unregistered merchant domain inspection (Needs Review)",
    "titleAr": "فحص نطاق متجر غير مسجل (يحتاج مراجعة)",
    "descriptionEn": "Transaction to an unverified merchant domain requiring stepped-up verification.",
    "descriptionAr": "عملية شراء عبر نطاق متجر يحتاج مراجعة ويفرض تحققًا إضافيًا.",
    "expectedDecision": "Additional Verification",
    "expectedRiskLevel": "Medium",
    "customer": {
      "id": "bench-ver-038",
      "name": "Customer 98",
      "nameAr": "عميل 98",
      "averageAmount": 3500,
      "transactionCount": 20,
      "usualCountries": [
        "Saudi Arabia"
      ],
      "trustedBeneficiaries": [
        "Merchant Store #38"
      ],
      "usualHours": [
        8,
        20
      ],
      "priorRisk": false
    },
    "input": {
      "customerId": "bench-ver-038",
      "amount": 1500,
      "currency": "SAR",
      "destinationCountry": "Saudi Arabia",
      "beneficiaryName": "Merchant Store #38",
      "transactionType": "Merchant Payment",
      "websiteDomain": "shoplogin38.com",
      "submittedAt": "2026-08-13T12:00:00.000Z"
    }
  },
  {
    "id": "BENCH-099",
    "category": "additional_verification",
    "titleEn": "Unregistered merchant domain inspection (Needs Review)",
    "titleAr": "فحص نطاق متجر غير مسجل (يحتاج مراجعة)",
    "descriptionEn": "Transaction to an unverified merchant domain requiring stepped-up verification.",
    "descriptionAr": "عملية شراء عبر نطاق متجر يحتاج مراجعة ويفرض تحققًا إضافيًا.",
    "expectedDecision": "Additional Verification",
    "expectedRiskLevel": "Medium",
    "customer": {
      "id": "bench-ver-039",
      "name": "Customer 99",
      "nameAr": "عميل 99",
      "averageAmount": 3500,
      "transactionCount": 20,
      "usualCountries": [
        "Saudi Arabia"
      ],
      "trustedBeneficiaries": [
        "Merchant Store #39"
      ],
      "usualHours": [
        8,
        20
      ],
      "priorRisk": false
    },
    "input": {
      "customerId": "bench-ver-039",
      "amount": 1500,
      "currency": "SAR",
      "destinationCountry": "Saudi Arabia",
      "beneficiaryName": "Merchant Store #39",
      "transactionType": "Merchant Payment",
      "websiteDomain": "shoplogin39.com",
      "submittedAt": "2026-08-13T12:00:00.000Z"
    }
  },
  {
    "id": "BENCH-100",
    "category": "additional_verification",
    "titleEn": "Unregistered merchant domain inspection (Needs Review)",
    "titleAr": "فحص نطاق متجر غير مسجل (يحتاج مراجعة)",
    "descriptionEn": "Transaction to an unverified merchant domain requiring stepped-up verification.",
    "descriptionAr": "عملية شراء عبر نطاق متجر يحتاج مراجعة ويفرض تحققًا إضافيًا.",
    "expectedDecision": "Additional Verification",
    "expectedRiskLevel": "Medium",
    "customer": {
      "id": "bench-ver-040",
      "name": "Customer 100",
      "nameAr": "عميل 100",
      "averageAmount": 3500,
      "transactionCount": 20,
      "usualCountries": [
        "Saudi Arabia"
      ],
      "trustedBeneficiaries": [
        "Merchant Store #40"
      ],
      "usualHours": [
        8,
        20
      ],
      "priorRisk": false
    },
    "input": {
      "customerId": "bench-ver-040",
      "amount": 1500,
      "currency": "SAR",
      "destinationCountry": "Saudi Arabia",
      "beneficiaryName": "Merchant Store #40",
      "transactionType": "Merchant Payment",
      "websiteDomain": "shoplogin40.com",
      "submittedAt": "2026-08-13T12:00:00.000Z"
    }
  },
  {
    "id": "BENCH-101",
    "category": "additional_verification",
    "titleEn": "Unregistered merchant domain inspection (Needs Review)",
    "titleAr": "فحص نطاق متجر غير مسجل (يحتاج مراجعة)",
    "descriptionEn": "Transaction to an unverified merchant domain requiring stepped-up verification.",
    "descriptionAr": "عملية شراء عبر نطاق متجر يحتاج مراجعة ويفرض تحققًا إضافيًا.",
    "expectedDecision": "Additional Verification",
    "expectedRiskLevel": "Medium",
    "customer": {
      "id": "bench-ver-041",
      "name": "Customer 101",
      "nameAr": "عميل 101",
      "averageAmount": 3500,
      "transactionCount": 20,
      "usualCountries": [
        "Saudi Arabia"
      ],
      "trustedBeneficiaries": [
        "Merchant Store #41"
      ],
      "usualHours": [
        8,
        20
      ],
      "priorRisk": false
    },
    "input": {
      "customerId": "bench-ver-041",
      "amount": 1500,
      "currency": "SAR",
      "destinationCountry": "Saudi Arabia",
      "beneficiaryName": "Merchant Store #41",
      "transactionType": "Merchant Payment",
      "websiteDomain": "shoplogin41.com",
      "submittedAt": "2026-08-13T12:00:00.000Z"
    }
  },
  {
    "id": "BENCH-102",
    "category": "additional_verification",
    "titleEn": "Unregistered merchant domain inspection (Needs Review)",
    "titleAr": "فحص نطاق متجر غير مسجل (يحتاج مراجعة)",
    "descriptionEn": "Transaction to an unverified merchant domain requiring stepped-up verification.",
    "descriptionAr": "عملية شراء عبر نطاق متجر يحتاج مراجعة ويفرض تحققًا إضافيًا.",
    "expectedDecision": "Additional Verification",
    "expectedRiskLevel": "Medium",
    "customer": {
      "id": "bench-ver-042",
      "name": "Customer 102",
      "nameAr": "عميل 102",
      "averageAmount": 3500,
      "transactionCount": 20,
      "usualCountries": [
        "Saudi Arabia"
      ],
      "trustedBeneficiaries": [
        "Merchant Store #42"
      ],
      "usualHours": [
        8,
        20
      ],
      "priorRisk": false
    },
    "input": {
      "customerId": "bench-ver-042",
      "amount": 1500,
      "currency": "SAR",
      "destinationCountry": "Saudi Arabia",
      "beneficiaryName": "Merchant Store #42",
      "transactionType": "Merchant Payment",
      "websiteDomain": "shoplogin42.com",
      "submittedAt": "2026-08-13T12:00:00.000Z"
    }
  },
  {
    "id": "BENCH-103",
    "category": "additional_verification",
    "titleEn": "Unregistered merchant domain inspection (Needs Review)",
    "titleAr": "فحص نطاق متجر غير مسجل (يحتاج مراجعة)",
    "descriptionEn": "Transaction to an unverified merchant domain requiring stepped-up verification.",
    "descriptionAr": "عملية شراء عبر نطاق متجر يحتاج مراجعة ويفرض تحققًا إضافيًا.",
    "expectedDecision": "Additional Verification",
    "expectedRiskLevel": "Medium",
    "customer": {
      "id": "bench-ver-043",
      "name": "Customer 103",
      "nameAr": "عميل 103",
      "averageAmount": 3500,
      "transactionCount": 20,
      "usualCountries": [
        "Saudi Arabia"
      ],
      "trustedBeneficiaries": [
        "Merchant Store #43"
      ],
      "usualHours": [
        8,
        20
      ],
      "priorRisk": false
    },
    "input": {
      "customerId": "bench-ver-043",
      "amount": 1500,
      "currency": "SAR",
      "destinationCountry": "Saudi Arabia",
      "beneficiaryName": "Merchant Store #43",
      "transactionType": "Merchant Payment",
      "websiteDomain": "shoplogin43.com",
      "submittedAt": "2026-08-13T12:00:00.000Z"
    }
  },
  {
    "id": "BENCH-104",
    "category": "additional_verification",
    "titleEn": "Unregistered merchant domain inspection (Needs Review)",
    "titleAr": "فحص نطاق متجر غير مسجل (يحتاج مراجعة)",
    "descriptionEn": "Transaction to an unverified merchant domain requiring stepped-up verification.",
    "descriptionAr": "عملية شراء عبر نطاق متجر يحتاج مراجعة ويفرض تحققًا إضافيًا.",
    "expectedDecision": "Additional Verification",
    "expectedRiskLevel": "Medium",
    "customer": {
      "id": "bench-ver-044",
      "name": "Customer 104",
      "nameAr": "عميل 104",
      "averageAmount": 3500,
      "transactionCount": 20,
      "usualCountries": [
        "Saudi Arabia"
      ],
      "trustedBeneficiaries": [
        "Merchant Store #44"
      ],
      "usualHours": [
        8,
        20
      ],
      "priorRisk": false
    },
    "input": {
      "customerId": "bench-ver-044",
      "amount": 1500,
      "currency": "SAR",
      "destinationCountry": "Saudi Arabia",
      "beneficiaryName": "Merchant Store #44",
      "transactionType": "Merchant Payment",
      "websiteDomain": "shoplogin44.com",
      "submittedAt": "2026-08-13T12:00:00.000Z"
    }
  },
  {
    "id": "BENCH-105",
    "category": "additional_verification",
    "titleEn": "Unregistered merchant domain inspection (Needs Review)",
    "titleAr": "فحص نطاق متجر غير مسجل (يحتاج مراجعة)",
    "descriptionEn": "Transaction to an unverified merchant domain requiring stepped-up verification.",
    "descriptionAr": "عملية شراء عبر نطاق متجر يحتاج مراجعة ويفرض تحققًا إضافيًا.",
    "expectedDecision": "Additional Verification",
    "expectedRiskLevel": "Medium",
    "customer": {
      "id": "bench-ver-045",
      "name": "Customer 105",
      "nameAr": "عميل 105",
      "averageAmount": 3500,
      "transactionCount": 20,
      "usualCountries": [
        "Saudi Arabia"
      ],
      "trustedBeneficiaries": [
        "Merchant Store #45"
      ],
      "usualHours": [
        8,
        20
      ],
      "priorRisk": false
    },
    "input": {
      "customerId": "bench-ver-045",
      "amount": 1500,
      "currency": "SAR",
      "destinationCountry": "Saudi Arabia",
      "beneficiaryName": "Merchant Store #45",
      "transactionType": "Merchant Payment",
      "websiteDomain": "shoplogin45.com",
      "submittedAt": "2026-08-13T12:00:00.000Z"
    }
  },
  {
    "id": "BENCH-106",
    "category": "additional_verification",
    "titleEn": "Unregistered merchant domain inspection (Needs Review)",
    "titleAr": "فحص نطاق متجر غير مسجل (يحتاج مراجعة)",
    "descriptionEn": "Transaction to an unverified merchant domain requiring stepped-up verification.",
    "descriptionAr": "عملية شراء عبر نطاق متجر يحتاج مراجعة ويفرض تحققًا إضافيًا.",
    "expectedDecision": "Additional Verification",
    "expectedRiskLevel": "Medium",
    "customer": {
      "id": "bench-ver-046",
      "name": "Customer 106",
      "nameAr": "عميل 106",
      "averageAmount": 3500,
      "transactionCount": 20,
      "usualCountries": [
        "Saudi Arabia"
      ],
      "trustedBeneficiaries": [
        "Merchant Store #46"
      ],
      "usualHours": [
        8,
        20
      ],
      "priorRisk": false
    },
    "input": {
      "customerId": "bench-ver-046",
      "amount": 1500,
      "currency": "SAR",
      "destinationCountry": "Saudi Arabia",
      "beneficiaryName": "Merchant Store #46",
      "transactionType": "Merchant Payment",
      "websiteDomain": "shoplogin46.com",
      "submittedAt": "2026-08-13T12:00:00.000Z"
    }
  },
  {
    "id": "BENCH-107",
    "category": "additional_verification",
    "titleEn": "Unregistered merchant domain inspection (Needs Review)",
    "titleAr": "فحص نطاق متجر غير مسجل (يحتاج مراجعة)",
    "descriptionEn": "Transaction to an unverified merchant domain requiring stepped-up verification.",
    "descriptionAr": "عملية شراء عبر نطاق متجر يحتاج مراجعة ويفرض تحققًا إضافيًا.",
    "expectedDecision": "Additional Verification",
    "expectedRiskLevel": "Medium",
    "customer": {
      "id": "bench-ver-047",
      "name": "Customer 107",
      "nameAr": "عميل 107",
      "averageAmount": 3500,
      "transactionCount": 20,
      "usualCountries": [
        "Saudi Arabia"
      ],
      "trustedBeneficiaries": [
        "Merchant Store #47"
      ],
      "usualHours": [
        8,
        20
      ],
      "priorRisk": false
    },
    "input": {
      "customerId": "bench-ver-047",
      "amount": 1500,
      "currency": "SAR",
      "destinationCountry": "Saudi Arabia",
      "beneficiaryName": "Merchant Store #47",
      "transactionType": "Merchant Payment",
      "websiteDomain": "shoplogin47.com",
      "submittedAt": "2026-08-13T12:00:00.000Z"
    }
  },
  {
    "id": "BENCH-108",
    "category": "additional_verification",
    "titleEn": "Unregistered merchant domain inspection (Needs Review)",
    "titleAr": "فحص نطاق متجر غير مسجل (يحتاج مراجعة)",
    "descriptionEn": "Transaction to an unverified merchant domain requiring stepped-up verification.",
    "descriptionAr": "عملية شراء عبر نطاق متجر يحتاج مراجعة ويفرض تحققًا إضافيًا.",
    "expectedDecision": "Additional Verification",
    "expectedRiskLevel": "Medium",
    "customer": {
      "id": "bench-ver-048",
      "name": "Customer 108",
      "nameAr": "عميل 108",
      "averageAmount": 3500,
      "transactionCount": 20,
      "usualCountries": [
        "Saudi Arabia"
      ],
      "trustedBeneficiaries": [
        "Merchant Store #48"
      ],
      "usualHours": [
        8,
        20
      ],
      "priorRisk": false
    },
    "input": {
      "customerId": "bench-ver-048",
      "amount": 1500,
      "currency": "SAR",
      "destinationCountry": "Saudi Arabia",
      "beneficiaryName": "Merchant Store #48",
      "transactionType": "Merchant Payment",
      "websiteDomain": "shoplogin48.com",
      "submittedAt": "2026-08-13T12:00:00.000Z"
    }
  },
  {
    "id": "BENCH-109",
    "category": "additional_verification",
    "titleEn": "Unregistered merchant domain inspection (Needs Review)",
    "titleAr": "فحص نطاق متجر غير مسجل (يحتاج مراجعة)",
    "descriptionEn": "Transaction to an unverified merchant domain requiring stepped-up verification.",
    "descriptionAr": "عملية شراء عبر نطاق متجر يحتاج مراجعة ويفرض تحققًا إضافيًا.",
    "expectedDecision": "Additional Verification",
    "expectedRiskLevel": "Medium",
    "customer": {
      "id": "bench-ver-049",
      "name": "Customer 109",
      "nameAr": "عميل 109",
      "averageAmount": 3500,
      "transactionCount": 20,
      "usualCountries": [
        "Saudi Arabia"
      ],
      "trustedBeneficiaries": [
        "Merchant Store #49"
      ],
      "usualHours": [
        8,
        20
      ],
      "priorRisk": false
    },
    "input": {
      "customerId": "bench-ver-049",
      "amount": 1500,
      "currency": "SAR",
      "destinationCountry": "Saudi Arabia",
      "beneficiaryName": "Merchant Store #49",
      "transactionType": "Merchant Payment",
      "websiteDomain": "shoplogin49.com",
      "submittedAt": "2026-08-13T12:00:00.000Z"
    }
  },
  {
    "id": "BENCH-110",
    "category": "additional_verification",
    "titleEn": "Unregistered merchant domain inspection (Needs Review)",
    "titleAr": "فحص نطاق متجر غير مسجل (يحتاج مراجعة)",
    "descriptionEn": "Transaction to an unverified merchant domain requiring stepped-up verification.",
    "descriptionAr": "عملية شراء عبر نطاق متجر يحتاج مراجعة ويفرض تحققًا إضافيًا.",
    "expectedDecision": "Additional Verification",
    "expectedRiskLevel": "Medium",
    "customer": {
      "id": "bench-ver-050",
      "name": "Customer 110",
      "nameAr": "عميل 110",
      "averageAmount": 3500,
      "transactionCount": 20,
      "usualCountries": [
        "Saudi Arabia"
      ],
      "trustedBeneficiaries": [
        "Merchant Store #50"
      ],
      "usualHours": [
        8,
        20
      ],
      "priorRisk": false
    },
    "input": {
      "customerId": "bench-ver-050",
      "amount": 1500,
      "currency": "SAR",
      "destinationCountry": "Saudi Arabia",
      "beneficiaryName": "Merchant Store #50",
      "transactionType": "Merchant Payment",
      "websiteDomain": "shoplogin50.com",
      "submittedAt": "2026-08-13T12:00:00.000Z"
    }
  },
  {
    "id": "BENCH-111",
    "category": "mandatory_policy",
    "titleEn": "High-risk domain policy override (alrajh-sa-secure.com)",
    "titleAr": "تجاوز إلزامي لسياسة نطاق عالي المخاطر (alrajh-sa-secure.com)",
    "descriptionEn": "High-risk phishing / brand-mimicry domain triggering an immutable manual review override.",
    "descriptionAr": "نطاق تصيد / انتحال علامة عالي المخاطر يُفعل تجاوز المراجعة اليدوية غير القابل للتخفيض.",
    "expectedDecision": "Manual Review",
    "expectedRiskLevel": "Medium",
    "customer": {
      "id": "bench-pol-001",
      "name": "Policy Case Customer 1",
      "nameAr": "عميل فحص السياسة 1",
      "averageAmount": 3000,
      "transactionCount": 20,
      "usualCountries": [
        "Saudi Arabia"
      ],
      "trustedBeneficiaries": [
        "Sara Al-Mutairi"
      ],
      "usualHours": [
        8,
        20
      ],
      "priorRisk": false
    },
    "input": {
      "customerId": "bench-pol-001",
      "amount": 840,
      "currency": "SAR",
      "destinationCountry": "Saudi Arabia",
      "beneficiaryName": "Sara Al-Mutairi",
      "transactionType": "Merchant Payment",
      "websiteDomain": "alrajh-sa-secure.com",
      "submittedAt": "2026-08-13T12:00:00.000Z"
    }
  },
  {
    "id": "BENCH-112",
    "category": "mandatory_policy",
    "titleEn": "High-risk domain policy override (bank-verify-portal.net)",
    "titleAr": "تجاوز إلزامي لسياسة نطاق عالي المخاطر (bank-verify-portal.net)",
    "descriptionEn": "High-risk phishing / brand-mimicry domain triggering an immutable manual review override.",
    "descriptionAr": "نطاق تصيد / انتحال علامة عالي المخاطر يُفعل تجاوز المراجعة اليدوية غير القابل للتخفيض.",
    "expectedDecision": "Manual Review",
    "expectedRiskLevel": "Medium",
    "customer": {
      "id": "bench-pol-002",
      "name": "Policy Case Customer 2",
      "nameAr": "عميل فحص السياسة 2",
      "averageAmount": 3000,
      "transactionCount": 20,
      "usualCountries": [
        "Saudi Arabia"
      ],
      "trustedBeneficiaries": [
        "Sara Al-Mutairi"
      ],
      "usualHours": [
        8,
        20
      ],
      "priorRisk": false
    },
    "input": {
      "customerId": "bench-pol-002",
      "amount": 880,
      "currency": "SAR",
      "destinationCountry": "Saudi Arabia",
      "beneficiaryName": "Sara Al-Mutairi",
      "transactionType": "Merchant Payment",
      "websiteDomain": "bank-verify-portal.net",
      "submittedAt": "2026-08-13T12:00:00.000Z"
    }
  },
  {
    "id": "BENCH-113",
    "category": "mandatory_policy",
    "titleEn": "High-risk domain policy override (rajhi-auth-center.com)",
    "titleAr": "تجاوز إلزامي لسياسة نطاق عالي المخاطر (rajhi-auth-center.com)",
    "descriptionEn": "High-risk phishing / brand-mimicry domain triggering an immutable manual review override.",
    "descriptionAr": "نطاق تصيد / انتحال علامة عالي المخاطر يُفعل تجاوز المراجعة اليدوية غير القابل للتخفيض.",
    "expectedDecision": "Manual Review",
    "expectedRiskLevel": "Medium",
    "customer": {
      "id": "bench-pol-003",
      "name": "Policy Case Customer 3",
      "nameAr": "عميل فحص السياسة 3",
      "averageAmount": 3000,
      "transactionCount": 20,
      "usualCountries": [
        "Saudi Arabia"
      ],
      "trustedBeneficiaries": [
        "Sara Al-Mutairi"
      ],
      "usualHours": [
        8,
        20
      ],
      "priorRisk": false
    },
    "input": {
      "customerId": "bench-pol-003",
      "amount": 920,
      "currency": "SAR",
      "destinationCountry": "Saudi Arabia",
      "beneficiaryName": "Sara Al-Mutairi",
      "transactionType": "Merchant Payment",
      "websiteDomain": "rajhi-auth-center.com",
      "submittedAt": "2026-08-13T12:00:00.000Z"
    }
  },
  {
    "id": "BENCH-114",
    "category": "mandatory_policy",
    "titleEn": "High-risk domain policy override (secure-login-portal-pay.org)",
    "titleAr": "تجاوز إلزامي لسياسة نطاق عالي المخاطر (secure-login-portal-pay.org)",
    "descriptionEn": "High-risk phishing / brand-mimicry domain triggering an immutable manual review override.",
    "descriptionAr": "نطاق تصيد / انتحال علامة عالي المخاطر يُفعل تجاوز المراجعة اليدوية غير القابل للتخفيض.",
    "expectedDecision": "Manual Review",
    "expectedRiskLevel": "Medium",
    "customer": {
      "id": "bench-pol-004",
      "name": "Policy Case Customer 4",
      "nameAr": "عميل فحص السياسة 4",
      "averageAmount": 3000,
      "transactionCount": 20,
      "usualCountries": [
        "Saudi Arabia"
      ],
      "trustedBeneficiaries": [
        "Sara Al-Mutairi"
      ],
      "usualHours": [
        8,
        20
      ],
      "priorRisk": false
    },
    "input": {
      "customerId": "bench-pol-004",
      "amount": 960,
      "currency": "SAR",
      "destinationCountry": "Saudi Arabia",
      "beneficiaryName": "Sara Al-Mutairi",
      "transactionType": "Merchant Payment",
      "websiteDomain": "secure-login-portal-pay.org",
      "submittedAt": "2026-08-13T12:00:00.000Z"
    }
  },
  {
    "id": "BENCH-115",
    "category": "mandatory_policy",
    "titleEn": "High-risk domain policy override (saudi-bank-portal-login.com)",
    "titleAr": "تجاوز إلزامي لسياسة نطاق عالي المخاطر (saudi-bank-portal-login.com)",
    "descriptionEn": "High-risk phishing / brand-mimicry domain triggering an immutable manual review override.",
    "descriptionAr": "نطاق تصيد / انتحال علامة عالي المخاطر يُفعل تجاوز المراجعة اليدوية غير القابل للتخفيض.",
    "expectedDecision": "Manual Review",
    "expectedRiskLevel": "Medium",
    "customer": {
      "id": "bench-pol-005",
      "name": "Policy Case Customer 5",
      "nameAr": "عميل فحص السياسة 5",
      "averageAmount": 3000,
      "transactionCount": 20,
      "usualCountries": [
        "Saudi Arabia"
      ],
      "trustedBeneficiaries": [
        "Sara Al-Mutairi"
      ],
      "usualHours": [
        8,
        20
      ],
      "priorRisk": false
    },
    "input": {
      "customerId": "bench-pol-005",
      "amount": 1000,
      "currency": "SAR",
      "destinationCountry": "Saudi Arabia",
      "beneficiaryName": "Sara Al-Mutairi",
      "transactionType": "Merchant Payment",
      "websiteDomain": "saudi-bank-portal-login.com",
      "submittedAt": "2026-08-13T12:00:00.000Z"
    }
  },
  {
    "id": "BENCH-116",
    "category": "mandatory_policy",
    "titleEn": "High-risk domain policy override (online-rajhi-support-sa.com)",
    "titleAr": "تجاوز إلزامي لسياسة نطاق عالي المخاطر (online-rajhi-support-sa.com)",
    "descriptionEn": "High-risk phishing / brand-mimicry domain triggering an immutable manual review override.",
    "descriptionAr": "نطاق تصيد / انتحال علامة عالي المخاطر يُفعل تجاوز المراجعة اليدوية غير القابل للتخفيض.",
    "expectedDecision": "Manual Review",
    "expectedRiskLevel": "Medium",
    "customer": {
      "id": "bench-pol-006",
      "name": "Policy Case Customer 6",
      "nameAr": "عميل فحص السياسة 6",
      "averageAmount": 3000,
      "transactionCount": 20,
      "usualCountries": [
        "Saudi Arabia"
      ],
      "trustedBeneficiaries": [
        "Sara Al-Mutairi"
      ],
      "usualHours": [
        8,
        20
      ],
      "priorRisk": false
    },
    "input": {
      "customerId": "bench-pol-006",
      "amount": 1040,
      "currency": "SAR",
      "destinationCountry": "Saudi Arabia",
      "beneficiaryName": "Sara Al-Mutairi",
      "transactionType": "Merchant Payment",
      "websiteDomain": "online-rajhi-support-sa.com",
      "submittedAt": "2026-08-13T12:00:00.000Z"
    }
  },
  {
    "id": "BENCH-117",
    "category": "mandatory_policy",
    "titleEn": "High-risk domain policy override (verify-bank-account-direct.net)",
    "titleAr": "تجاوز إلزامي لسياسة نطاق عالي المخاطر (verify-bank-account-direct.net)",
    "descriptionEn": "High-risk phishing / brand-mimicry domain triggering an immutable manual review override.",
    "descriptionAr": "نطاق تصيد / انتحال علامة عالي المخاطر يُفعل تجاوز المراجعة اليدوية غير القابل للتخفيض.",
    "expectedDecision": "Manual Review",
    "expectedRiskLevel": "Medium",
    "customer": {
      "id": "bench-pol-007",
      "name": "Policy Case Customer 7",
      "nameAr": "عميل فحص السياسة 7",
      "averageAmount": 3000,
      "transactionCount": 20,
      "usualCountries": [
        "Saudi Arabia"
      ],
      "trustedBeneficiaries": [
        "Sara Al-Mutairi"
      ],
      "usualHours": [
        8,
        20
      ],
      "priorRisk": false
    },
    "input": {
      "customerId": "bench-pol-007",
      "amount": 1080,
      "currency": "SAR",
      "destinationCountry": "Saudi Arabia",
      "beneficiaryName": "Sara Al-Mutairi",
      "transactionType": "Merchant Payment",
      "websiteDomain": "verify-bank-account-direct.net",
      "submittedAt": "2026-08-13T12:00:00.000Z"
    }
  },
  {
    "id": "BENCH-118",
    "category": "mandatory_policy",
    "titleEn": "High-risk domain policy override (rajhi-secure-transfer-sa.com)",
    "titleAr": "تجاوز إلزامي لسياسة نطاق عالي المخاطر (rajhi-secure-transfer-sa.com)",
    "descriptionEn": "High-risk phishing / brand-mimicry domain triggering an immutable manual review override.",
    "descriptionAr": "نطاق تصيد / انتحال علامة عالي المخاطر يُفعل تجاوز المراجعة اليدوية غير القابل للتخفيض.",
    "expectedDecision": "Manual Review",
    "expectedRiskLevel": "Medium",
    "customer": {
      "id": "bench-pol-008",
      "name": "Policy Case Customer 8",
      "nameAr": "عميل فحص السياسة 8",
      "averageAmount": 3000,
      "transactionCount": 20,
      "usualCountries": [
        "Saudi Arabia"
      ],
      "trustedBeneficiaries": [
        "Sara Al-Mutairi"
      ],
      "usualHours": [
        8,
        20
      ],
      "priorRisk": false
    },
    "input": {
      "customerId": "bench-pol-008",
      "amount": 1120,
      "currency": "SAR",
      "destinationCountry": "Saudi Arabia",
      "beneficiaryName": "Sara Al-Mutairi",
      "transactionType": "Merchant Payment",
      "websiteDomain": "rajhi-secure-transfer-sa.com",
      "submittedAt": "2026-08-13T12:00:00.000Z"
    }
  },
  {
    "id": "BENCH-119",
    "category": "mandatory_policy",
    "titleEn": "High-risk domain policy override (alrajh-sa-secure.com)",
    "titleAr": "تجاوز إلزامي لسياسة نطاق عالي المخاطر (alrajh-sa-secure.com)",
    "descriptionEn": "High-risk phishing / brand-mimicry domain triggering an immutable manual review override.",
    "descriptionAr": "نطاق تصيد / انتحال علامة عالي المخاطر يُفعل تجاوز المراجعة اليدوية غير القابل للتخفيض.",
    "expectedDecision": "Manual Review",
    "expectedRiskLevel": "Medium",
    "customer": {
      "id": "bench-pol-009",
      "name": "Policy Case Customer 9",
      "nameAr": "عميل فحص السياسة 9",
      "averageAmount": 3000,
      "transactionCount": 20,
      "usualCountries": [
        "Saudi Arabia"
      ],
      "trustedBeneficiaries": [
        "Sara Al-Mutairi"
      ],
      "usualHours": [
        8,
        20
      ],
      "priorRisk": false
    },
    "input": {
      "customerId": "bench-pol-009",
      "amount": 1160,
      "currency": "SAR",
      "destinationCountry": "Saudi Arabia",
      "beneficiaryName": "Sara Al-Mutairi",
      "transactionType": "Merchant Payment",
      "websiteDomain": "alrajh-sa-secure.com",
      "submittedAt": "2026-08-13T12:00:00.000Z"
    }
  },
  {
    "id": "BENCH-120",
    "category": "mandatory_policy",
    "titleEn": "High-risk domain policy override (bank-verify-portal.net)",
    "titleAr": "تجاوز إلزامي لسياسة نطاق عالي المخاطر (bank-verify-portal.net)",
    "descriptionEn": "High-risk phishing / brand-mimicry domain triggering an immutable manual review override.",
    "descriptionAr": "نطاق تصيد / انتحال علامة عالي المخاطر يُفعل تجاوز المراجعة اليدوية غير القابل للتخفيض.",
    "expectedDecision": "Manual Review",
    "expectedRiskLevel": "Medium",
    "customer": {
      "id": "bench-pol-010",
      "name": "Policy Case Customer 10",
      "nameAr": "عميل فحص السياسة 10",
      "averageAmount": 3000,
      "transactionCount": 20,
      "usualCountries": [
        "Saudi Arabia"
      ],
      "trustedBeneficiaries": [
        "Sara Al-Mutairi"
      ],
      "usualHours": [
        8,
        20
      ],
      "priorRisk": false
    },
    "input": {
      "customerId": "bench-pol-010",
      "amount": 1200,
      "currency": "SAR",
      "destinationCountry": "Saudi Arabia",
      "beneficiaryName": "Sara Al-Mutairi",
      "transactionType": "Merchant Payment",
      "websiteDomain": "bank-verify-portal.net",
      "submittedAt": "2026-08-13T12:00:00.000Z"
    }
  },
  {
    "id": "BENCH-121",
    "category": "mandatory_policy",
    "titleEn": "High-risk domain policy override (rajhi-auth-center.com)",
    "titleAr": "تجاوز إلزامي لسياسة نطاق عالي المخاطر (rajhi-auth-center.com)",
    "descriptionEn": "High-risk phishing / brand-mimicry domain triggering an immutable manual review override.",
    "descriptionAr": "نطاق تصيد / انتحال علامة عالي المخاطر يُفعل تجاوز المراجعة اليدوية غير القابل للتخفيض.",
    "expectedDecision": "Manual Review",
    "expectedRiskLevel": "Medium",
    "customer": {
      "id": "bench-pol-011",
      "name": "Policy Case Customer 11",
      "nameAr": "عميل فحص السياسة 11",
      "averageAmount": 3000,
      "transactionCount": 20,
      "usualCountries": [
        "Saudi Arabia"
      ],
      "trustedBeneficiaries": [
        "Sara Al-Mutairi"
      ],
      "usualHours": [
        8,
        20
      ],
      "priorRisk": false
    },
    "input": {
      "customerId": "bench-pol-011",
      "amount": 1240,
      "currency": "SAR",
      "destinationCountry": "Saudi Arabia",
      "beneficiaryName": "Sara Al-Mutairi",
      "transactionType": "Merchant Payment",
      "websiteDomain": "rajhi-auth-center.com",
      "submittedAt": "2026-08-13T12:00:00.000Z"
    }
  },
  {
    "id": "BENCH-122",
    "category": "mandatory_policy",
    "titleEn": "High-risk domain policy override (secure-login-portal-pay.org)",
    "titleAr": "تجاوز إلزامي لسياسة نطاق عالي المخاطر (secure-login-portal-pay.org)",
    "descriptionEn": "High-risk phishing / brand-mimicry domain triggering an immutable manual review override.",
    "descriptionAr": "نطاق تصيد / انتحال علامة عالي المخاطر يُفعل تجاوز المراجعة اليدوية غير القابل للتخفيض.",
    "expectedDecision": "Manual Review",
    "expectedRiskLevel": "Medium",
    "customer": {
      "id": "bench-pol-012",
      "name": "Policy Case Customer 12",
      "nameAr": "عميل فحص السياسة 12",
      "averageAmount": 3000,
      "transactionCount": 20,
      "usualCountries": [
        "Saudi Arabia"
      ],
      "trustedBeneficiaries": [
        "Sara Al-Mutairi"
      ],
      "usualHours": [
        8,
        20
      ],
      "priorRisk": false
    },
    "input": {
      "customerId": "bench-pol-012",
      "amount": 1280,
      "currency": "SAR",
      "destinationCountry": "Saudi Arabia",
      "beneficiaryName": "Sara Al-Mutairi",
      "transactionType": "Merchant Payment",
      "websiteDomain": "secure-login-portal-pay.org",
      "submittedAt": "2026-08-13T12:00:00.000Z"
    }
  },
  {
    "id": "BENCH-123",
    "category": "mandatory_policy",
    "titleEn": "High-risk domain policy override (saudi-bank-portal-login.com)",
    "titleAr": "تجاوز إلزامي لسياسة نطاق عالي المخاطر (saudi-bank-portal-login.com)",
    "descriptionEn": "High-risk phishing / brand-mimicry domain triggering an immutable manual review override.",
    "descriptionAr": "نطاق تصيد / انتحال علامة عالي المخاطر يُفعل تجاوز المراجعة اليدوية غير القابل للتخفيض.",
    "expectedDecision": "Manual Review",
    "expectedRiskLevel": "Medium",
    "customer": {
      "id": "bench-pol-013",
      "name": "Policy Case Customer 13",
      "nameAr": "عميل فحص السياسة 13",
      "averageAmount": 3000,
      "transactionCount": 20,
      "usualCountries": [
        "Saudi Arabia"
      ],
      "trustedBeneficiaries": [
        "Sara Al-Mutairi"
      ],
      "usualHours": [
        8,
        20
      ],
      "priorRisk": false
    },
    "input": {
      "customerId": "bench-pol-013",
      "amount": 1320,
      "currency": "SAR",
      "destinationCountry": "Saudi Arabia",
      "beneficiaryName": "Sara Al-Mutairi",
      "transactionType": "Merchant Payment",
      "websiteDomain": "saudi-bank-portal-login.com",
      "submittedAt": "2026-08-13T12:00:00.000Z"
    }
  },
  {
    "id": "BENCH-124",
    "category": "mandatory_policy",
    "titleEn": "High-risk domain policy override (online-rajhi-support-sa.com)",
    "titleAr": "تجاوز إلزامي لسياسة نطاق عالي المخاطر (online-rajhi-support-sa.com)",
    "descriptionEn": "High-risk phishing / brand-mimicry domain triggering an immutable manual review override.",
    "descriptionAr": "نطاق تصيد / انتحال علامة عالي المخاطر يُفعل تجاوز المراجعة اليدوية غير القابل للتخفيض.",
    "expectedDecision": "Manual Review",
    "expectedRiskLevel": "Medium",
    "customer": {
      "id": "bench-pol-014",
      "name": "Policy Case Customer 14",
      "nameAr": "عميل فحص السياسة 14",
      "averageAmount": 3000,
      "transactionCount": 20,
      "usualCountries": [
        "Saudi Arabia"
      ],
      "trustedBeneficiaries": [
        "Sara Al-Mutairi"
      ],
      "usualHours": [
        8,
        20
      ],
      "priorRisk": false
    },
    "input": {
      "customerId": "bench-pol-014",
      "amount": 1360,
      "currency": "SAR",
      "destinationCountry": "Saudi Arabia",
      "beneficiaryName": "Sara Al-Mutairi",
      "transactionType": "Merchant Payment",
      "websiteDomain": "online-rajhi-support-sa.com",
      "submittedAt": "2026-08-13T12:00:00.000Z"
    }
  },
  {
    "id": "BENCH-125",
    "category": "mandatory_policy",
    "titleEn": "High-risk domain policy override (verify-bank-account-direct.net)",
    "titleAr": "تجاوز إلزامي لسياسة نطاق عالي المخاطر (verify-bank-account-direct.net)",
    "descriptionEn": "High-risk phishing / brand-mimicry domain triggering an immutable manual review override.",
    "descriptionAr": "نطاق تصيد / انتحال علامة عالي المخاطر يُفعل تجاوز المراجعة اليدوية غير القابل للتخفيض.",
    "expectedDecision": "Manual Review",
    "expectedRiskLevel": "Medium",
    "customer": {
      "id": "bench-pol-015",
      "name": "Policy Case Customer 15",
      "nameAr": "عميل فحص السياسة 15",
      "averageAmount": 3000,
      "transactionCount": 20,
      "usualCountries": [
        "Saudi Arabia"
      ],
      "trustedBeneficiaries": [
        "Sara Al-Mutairi"
      ],
      "usualHours": [
        8,
        20
      ],
      "priorRisk": false
    },
    "input": {
      "customerId": "bench-pol-015",
      "amount": 1400,
      "currency": "SAR",
      "destinationCountry": "Saudi Arabia",
      "beneficiaryName": "Sara Al-Mutairi",
      "transactionType": "Merchant Payment",
      "websiteDomain": "verify-bank-account-direct.net",
      "submittedAt": "2026-08-13T12:00:00.000Z"
    }
  },
  {
    "id": "BENCH-126",
    "category": "mandatory_policy",
    "titleEn": "High-risk domain policy override (rajhi-secure-transfer-sa.com)",
    "titleAr": "تجاوز إلزامي لسياسة نطاق عالي المخاطر (rajhi-secure-transfer-sa.com)",
    "descriptionEn": "High-risk phishing / brand-mimicry domain triggering an immutable manual review override.",
    "descriptionAr": "نطاق تصيد / انتحال علامة عالي المخاطر يُفعل تجاوز المراجعة اليدوية غير القابل للتخفيض.",
    "expectedDecision": "Manual Review",
    "expectedRiskLevel": "Medium",
    "customer": {
      "id": "bench-pol-016",
      "name": "Policy Case Customer 16",
      "nameAr": "عميل فحص السياسة 16",
      "averageAmount": 3000,
      "transactionCount": 20,
      "usualCountries": [
        "Saudi Arabia"
      ],
      "trustedBeneficiaries": [
        "Sara Al-Mutairi"
      ],
      "usualHours": [
        8,
        20
      ],
      "priorRisk": false
    },
    "input": {
      "customerId": "bench-pol-016",
      "amount": 1440,
      "currency": "SAR",
      "destinationCountry": "Saudi Arabia",
      "beneficiaryName": "Sara Al-Mutairi",
      "transactionType": "Merchant Payment",
      "websiteDomain": "rajhi-secure-transfer-sa.com",
      "submittedAt": "2026-08-13T12:00:00.000Z"
    }
  },
  {
    "id": "BENCH-127",
    "category": "mandatory_policy",
    "titleEn": "High-risk domain policy override (alrajh-sa-secure.com)",
    "titleAr": "تجاوز إلزامي لسياسة نطاق عالي المخاطر (alrajh-sa-secure.com)",
    "descriptionEn": "High-risk phishing / brand-mimicry domain triggering an immutable manual review override.",
    "descriptionAr": "نطاق تصيد / انتحال علامة عالي المخاطر يُفعل تجاوز المراجعة اليدوية غير القابل للتخفيض.",
    "expectedDecision": "Manual Review",
    "expectedRiskLevel": "Medium",
    "customer": {
      "id": "bench-pol-017",
      "name": "Policy Case Customer 17",
      "nameAr": "عميل فحص السياسة 17",
      "averageAmount": 3000,
      "transactionCount": 20,
      "usualCountries": [
        "Saudi Arabia"
      ],
      "trustedBeneficiaries": [
        "Sara Al-Mutairi"
      ],
      "usualHours": [
        8,
        20
      ],
      "priorRisk": false
    },
    "input": {
      "customerId": "bench-pol-017",
      "amount": 1480,
      "currency": "SAR",
      "destinationCountry": "Saudi Arabia",
      "beneficiaryName": "Sara Al-Mutairi",
      "transactionType": "Merchant Payment",
      "websiteDomain": "alrajh-sa-secure.com",
      "submittedAt": "2026-08-13T12:00:00.000Z"
    }
  },
  {
    "id": "BENCH-128",
    "category": "mandatory_policy",
    "titleEn": "High-risk domain policy override (bank-verify-portal.net)",
    "titleAr": "تجاوز إلزامي لسياسة نطاق عالي المخاطر (bank-verify-portal.net)",
    "descriptionEn": "High-risk phishing / brand-mimicry domain triggering an immutable manual review override.",
    "descriptionAr": "نطاق تصيد / انتحال علامة عالي المخاطر يُفعل تجاوز المراجعة اليدوية غير القابل للتخفيض.",
    "expectedDecision": "Manual Review",
    "expectedRiskLevel": "Medium",
    "customer": {
      "id": "bench-pol-018",
      "name": "Policy Case Customer 18",
      "nameAr": "عميل فحص السياسة 18",
      "averageAmount": 3000,
      "transactionCount": 20,
      "usualCountries": [
        "Saudi Arabia"
      ],
      "trustedBeneficiaries": [
        "Sara Al-Mutairi"
      ],
      "usualHours": [
        8,
        20
      ],
      "priorRisk": false
    },
    "input": {
      "customerId": "bench-pol-018",
      "amount": 1520,
      "currency": "SAR",
      "destinationCountry": "Saudi Arabia",
      "beneficiaryName": "Sara Al-Mutairi",
      "transactionType": "Merchant Payment",
      "websiteDomain": "bank-verify-portal.net",
      "submittedAt": "2026-08-13T12:00:00.000Z"
    }
  },
  {
    "id": "BENCH-129",
    "category": "mandatory_policy",
    "titleEn": "High-risk domain policy override (rajhi-auth-center.com)",
    "titleAr": "تجاوز إلزامي لسياسة نطاق عالي المخاطر (rajhi-auth-center.com)",
    "descriptionEn": "High-risk phishing / brand-mimicry domain triggering an immutable manual review override.",
    "descriptionAr": "نطاق تصيد / انتحال علامة عالي المخاطر يُفعل تجاوز المراجعة اليدوية غير القابل للتخفيض.",
    "expectedDecision": "Manual Review",
    "expectedRiskLevel": "Medium",
    "customer": {
      "id": "bench-pol-019",
      "name": "Policy Case Customer 19",
      "nameAr": "عميل فحص السياسة 19",
      "averageAmount": 3000,
      "transactionCount": 20,
      "usualCountries": [
        "Saudi Arabia"
      ],
      "trustedBeneficiaries": [
        "Sara Al-Mutairi"
      ],
      "usualHours": [
        8,
        20
      ],
      "priorRisk": false
    },
    "input": {
      "customerId": "bench-pol-019",
      "amount": 1560,
      "currency": "SAR",
      "destinationCountry": "Saudi Arabia",
      "beneficiaryName": "Sara Al-Mutairi",
      "transactionType": "Merchant Payment",
      "websiteDomain": "rajhi-auth-center.com",
      "submittedAt": "2026-08-13T12:00:00.000Z"
    }
  },
  {
    "id": "BENCH-130",
    "category": "mandatory_policy",
    "titleEn": "High-risk domain policy override (secure-login-portal-pay.org)",
    "titleAr": "تجاوز إلزامي لسياسة نطاق عالي المخاطر (secure-login-portal-pay.org)",
    "descriptionEn": "High-risk phishing / brand-mimicry domain triggering an immutable manual review override.",
    "descriptionAr": "نطاق تصيد / انتحال علامة عالي المخاطر يُفعل تجاوز المراجعة اليدوية غير القابل للتخفيض.",
    "expectedDecision": "Manual Review",
    "expectedRiskLevel": "Medium",
    "customer": {
      "id": "bench-pol-020",
      "name": "Policy Case Customer 20",
      "nameAr": "عميل فحص السياسة 20",
      "averageAmount": 3000,
      "transactionCount": 20,
      "usualCountries": [
        "Saudi Arabia"
      ],
      "trustedBeneficiaries": [
        "Sara Al-Mutairi"
      ],
      "usualHours": [
        8,
        20
      ],
      "priorRisk": false
    },
    "input": {
      "customerId": "bench-pol-020",
      "amount": 1600,
      "currency": "SAR",
      "destinationCountry": "Saudi Arabia",
      "beneficiaryName": "Sara Al-Mutairi",
      "transactionType": "Merchant Payment",
      "websiteDomain": "secure-login-portal-pay.org",
      "submittedAt": "2026-08-13T12:00:00.000Z"
    }
  },
  {
    "id": "BENCH-131",
    "category": "mandatory_policy",
    "titleEn": "High-risk domain policy override (saudi-bank-portal-login.com)",
    "titleAr": "تجاوز إلزامي لسياسة نطاق عالي المخاطر (saudi-bank-portal-login.com)",
    "descriptionEn": "High-risk phishing / brand-mimicry domain triggering an immutable manual review override.",
    "descriptionAr": "نطاق تصيد / انتحال علامة عالي المخاطر يُفعل تجاوز المراجعة اليدوية غير القابل للتخفيض.",
    "expectedDecision": "Manual Review",
    "expectedRiskLevel": "Medium",
    "customer": {
      "id": "bench-pol-021",
      "name": "Policy Case Customer 21",
      "nameAr": "عميل فحص السياسة 21",
      "averageAmount": 3000,
      "transactionCount": 20,
      "usualCountries": [
        "Saudi Arabia"
      ],
      "trustedBeneficiaries": [
        "Sara Al-Mutairi"
      ],
      "usualHours": [
        8,
        20
      ],
      "priorRisk": false
    },
    "input": {
      "customerId": "bench-pol-021",
      "amount": 1640,
      "currency": "SAR",
      "destinationCountry": "Saudi Arabia",
      "beneficiaryName": "Sara Al-Mutairi",
      "transactionType": "Merchant Payment",
      "websiteDomain": "saudi-bank-portal-login.com",
      "submittedAt": "2026-08-13T12:00:00.000Z"
    }
  },
  {
    "id": "BENCH-132",
    "category": "mandatory_policy",
    "titleEn": "High-risk domain policy override (online-rajhi-support-sa.com)",
    "titleAr": "تجاوز إلزامي لسياسة نطاق عالي المخاطر (online-rajhi-support-sa.com)",
    "descriptionEn": "High-risk phishing / brand-mimicry domain triggering an immutable manual review override.",
    "descriptionAr": "نطاق تصيد / انتحال علامة عالي المخاطر يُفعل تجاوز المراجعة اليدوية غير القابل للتخفيض.",
    "expectedDecision": "Manual Review",
    "expectedRiskLevel": "Medium",
    "customer": {
      "id": "bench-pol-022",
      "name": "Policy Case Customer 22",
      "nameAr": "عميل فحص السياسة 22",
      "averageAmount": 3000,
      "transactionCount": 20,
      "usualCountries": [
        "Saudi Arabia"
      ],
      "trustedBeneficiaries": [
        "Sara Al-Mutairi"
      ],
      "usualHours": [
        8,
        20
      ],
      "priorRisk": false
    },
    "input": {
      "customerId": "bench-pol-022",
      "amount": 1680,
      "currency": "SAR",
      "destinationCountry": "Saudi Arabia",
      "beneficiaryName": "Sara Al-Mutairi",
      "transactionType": "Merchant Payment",
      "websiteDomain": "online-rajhi-support-sa.com",
      "submittedAt": "2026-08-13T12:00:00.000Z"
    }
  },
  {
    "id": "BENCH-133",
    "category": "mandatory_policy",
    "titleEn": "High-risk domain policy override (verify-bank-account-direct.net)",
    "titleAr": "تجاوز إلزامي لسياسة نطاق عالي المخاطر (verify-bank-account-direct.net)",
    "descriptionEn": "High-risk phishing / brand-mimicry domain triggering an immutable manual review override.",
    "descriptionAr": "نطاق تصيد / انتحال علامة عالي المخاطر يُفعل تجاوز المراجعة اليدوية غير القابل للتخفيض.",
    "expectedDecision": "Manual Review",
    "expectedRiskLevel": "Medium",
    "customer": {
      "id": "bench-pol-023",
      "name": "Policy Case Customer 23",
      "nameAr": "عميل فحص السياسة 23",
      "averageAmount": 3000,
      "transactionCount": 20,
      "usualCountries": [
        "Saudi Arabia"
      ],
      "trustedBeneficiaries": [
        "Sara Al-Mutairi"
      ],
      "usualHours": [
        8,
        20
      ],
      "priorRisk": false
    },
    "input": {
      "customerId": "bench-pol-023",
      "amount": 1720,
      "currency": "SAR",
      "destinationCountry": "Saudi Arabia",
      "beneficiaryName": "Sara Al-Mutairi",
      "transactionType": "Merchant Payment",
      "websiteDomain": "verify-bank-account-direct.net",
      "submittedAt": "2026-08-13T12:00:00.000Z"
    }
  },
  {
    "id": "BENCH-134",
    "category": "mandatory_policy",
    "titleEn": "High-risk domain policy override (rajhi-secure-transfer-sa.com)",
    "titleAr": "تجاوز إلزامي لسياسة نطاق عالي المخاطر (rajhi-secure-transfer-sa.com)",
    "descriptionEn": "High-risk phishing / brand-mimicry domain triggering an immutable manual review override.",
    "descriptionAr": "نطاق تصيد / انتحال علامة عالي المخاطر يُفعل تجاوز المراجعة اليدوية غير القابل للتخفيض.",
    "expectedDecision": "Manual Review",
    "expectedRiskLevel": "Medium",
    "customer": {
      "id": "bench-pol-024",
      "name": "Policy Case Customer 24",
      "nameAr": "عميل فحص السياسة 24",
      "averageAmount": 3000,
      "transactionCount": 20,
      "usualCountries": [
        "Saudi Arabia"
      ],
      "trustedBeneficiaries": [
        "Sara Al-Mutairi"
      ],
      "usualHours": [
        8,
        20
      ],
      "priorRisk": false
    },
    "input": {
      "customerId": "bench-pol-024",
      "amount": 1760,
      "currency": "SAR",
      "destinationCountry": "Saudi Arabia",
      "beneficiaryName": "Sara Al-Mutairi",
      "transactionType": "Merchant Payment",
      "websiteDomain": "rajhi-secure-transfer-sa.com",
      "submittedAt": "2026-08-13T12:00:00.000Z"
    }
  },
  {
    "id": "BENCH-135",
    "category": "mandatory_policy",
    "titleEn": "High-risk domain policy override (alrajh-sa-secure.com)",
    "titleAr": "تجاوز إلزامي لسياسة نطاق عالي المخاطر (alrajh-sa-secure.com)",
    "descriptionEn": "High-risk phishing / brand-mimicry domain triggering an immutable manual review override.",
    "descriptionAr": "نطاق تصيد / انتحال علامة عالي المخاطر يُفعل تجاوز المراجعة اليدوية غير القابل للتخفيض.",
    "expectedDecision": "Manual Review",
    "expectedRiskLevel": "Medium",
    "customer": {
      "id": "bench-pol-025",
      "name": "Policy Case Customer 25",
      "nameAr": "عميل فحص السياسة 25",
      "averageAmount": 3000,
      "transactionCount": 20,
      "usualCountries": [
        "Saudi Arabia"
      ],
      "trustedBeneficiaries": [
        "Sara Al-Mutairi"
      ],
      "usualHours": [
        8,
        20
      ],
      "priorRisk": false
    },
    "input": {
      "customerId": "bench-pol-025",
      "amount": 1800,
      "currency": "SAR",
      "destinationCountry": "Saudi Arabia",
      "beneficiaryName": "Sara Al-Mutairi",
      "transactionType": "Merchant Payment",
      "websiteDomain": "alrajh-sa-secure.com",
      "submittedAt": "2026-08-13T12:00:00.000Z"
    }
  },
  {
    "id": "BENCH-136",
    "category": "mandatory_policy",
    "titleEn": "High-risk domain policy override (bank-verify-portal.net)",
    "titleAr": "تجاوز إلزامي لسياسة نطاق عالي المخاطر (bank-verify-portal.net)",
    "descriptionEn": "High-risk phishing / brand-mimicry domain triggering an immutable manual review override.",
    "descriptionAr": "نطاق تصيد / انتحال علامة عالي المخاطر يُفعل تجاوز المراجعة اليدوية غير القابل للتخفيض.",
    "expectedDecision": "Manual Review",
    "expectedRiskLevel": "Medium",
    "customer": {
      "id": "bench-pol-026",
      "name": "Policy Case Customer 26",
      "nameAr": "عميل فحص السياسة 26",
      "averageAmount": 3000,
      "transactionCount": 20,
      "usualCountries": [
        "Saudi Arabia"
      ],
      "trustedBeneficiaries": [
        "Sara Al-Mutairi"
      ],
      "usualHours": [
        8,
        20
      ],
      "priorRisk": false
    },
    "input": {
      "customerId": "bench-pol-026",
      "amount": 1840,
      "currency": "SAR",
      "destinationCountry": "Saudi Arabia",
      "beneficiaryName": "Sara Al-Mutairi",
      "transactionType": "Merchant Payment",
      "websiteDomain": "bank-verify-portal.net",
      "submittedAt": "2026-08-13T12:00:00.000Z"
    }
  },
  {
    "id": "BENCH-137",
    "category": "mandatory_policy",
    "titleEn": "High-risk domain policy override (rajhi-auth-center.com)",
    "titleAr": "تجاوز إلزامي لسياسة نطاق عالي المخاطر (rajhi-auth-center.com)",
    "descriptionEn": "High-risk phishing / brand-mimicry domain triggering an immutable manual review override.",
    "descriptionAr": "نطاق تصيد / انتحال علامة عالي المخاطر يُفعل تجاوز المراجعة اليدوية غير القابل للتخفيض.",
    "expectedDecision": "Manual Review",
    "expectedRiskLevel": "Medium",
    "customer": {
      "id": "bench-pol-027",
      "name": "Policy Case Customer 27",
      "nameAr": "عميل فحص السياسة 27",
      "averageAmount": 3000,
      "transactionCount": 20,
      "usualCountries": [
        "Saudi Arabia"
      ],
      "trustedBeneficiaries": [
        "Sara Al-Mutairi"
      ],
      "usualHours": [
        8,
        20
      ],
      "priorRisk": false
    },
    "input": {
      "customerId": "bench-pol-027",
      "amount": 1880,
      "currency": "SAR",
      "destinationCountry": "Saudi Arabia",
      "beneficiaryName": "Sara Al-Mutairi",
      "transactionType": "Merchant Payment",
      "websiteDomain": "rajhi-auth-center.com",
      "submittedAt": "2026-08-13T12:00:00.000Z"
    }
  },
  {
    "id": "BENCH-138",
    "category": "mandatory_policy",
    "titleEn": "High-risk domain policy override (secure-login-portal-pay.org)",
    "titleAr": "تجاوز إلزامي لسياسة نطاق عالي المخاطر (secure-login-portal-pay.org)",
    "descriptionEn": "High-risk phishing / brand-mimicry domain triggering an immutable manual review override.",
    "descriptionAr": "نطاق تصيد / انتحال علامة عالي المخاطر يُفعل تجاوز المراجعة اليدوية غير القابل للتخفيض.",
    "expectedDecision": "Manual Review",
    "expectedRiskLevel": "Medium",
    "customer": {
      "id": "bench-pol-028",
      "name": "Policy Case Customer 28",
      "nameAr": "عميل فحص السياسة 28",
      "averageAmount": 3000,
      "transactionCount": 20,
      "usualCountries": [
        "Saudi Arabia"
      ],
      "trustedBeneficiaries": [
        "Sara Al-Mutairi"
      ],
      "usualHours": [
        8,
        20
      ],
      "priorRisk": false
    },
    "input": {
      "customerId": "bench-pol-028",
      "amount": 1920,
      "currency": "SAR",
      "destinationCountry": "Saudi Arabia",
      "beneficiaryName": "Sara Al-Mutairi",
      "transactionType": "Merchant Payment",
      "websiteDomain": "secure-login-portal-pay.org",
      "submittedAt": "2026-08-13T12:00:00.000Z"
    }
  },
  {
    "id": "BENCH-139",
    "category": "mandatory_policy",
    "titleEn": "High-risk domain policy override (saudi-bank-portal-login.com)",
    "titleAr": "تجاوز إلزامي لسياسة نطاق عالي المخاطر (saudi-bank-portal-login.com)",
    "descriptionEn": "High-risk phishing / brand-mimicry domain triggering an immutable manual review override.",
    "descriptionAr": "نطاق تصيد / انتحال علامة عالي المخاطر يُفعل تجاوز المراجعة اليدوية غير القابل للتخفيض.",
    "expectedDecision": "Manual Review",
    "expectedRiskLevel": "Medium",
    "customer": {
      "id": "bench-pol-029",
      "name": "Policy Case Customer 29",
      "nameAr": "عميل فحص السياسة 29",
      "averageAmount": 3000,
      "transactionCount": 20,
      "usualCountries": [
        "Saudi Arabia"
      ],
      "trustedBeneficiaries": [
        "Sara Al-Mutairi"
      ],
      "usualHours": [
        8,
        20
      ],
      "priorRisk": false
    },
    "input": {
      "customerId": "bench-pol-029",
      "amount": 1960,
      "currency": "SAR",
      "destinationCountry": "Saudi Arabia",
      "beneficiaryName": "Sara Al-Mutairi",
      "transactionType": "Merchant Payment",
      "websiteDomain": "saudi-bank-portal-login.com",
      "submittedAt": "2026-08-13T12:00:00.000Z"
    }
  },
  {
    "id": "BENCH-140",
    "category": "mandatory_policy",
    "titleEn": "High-risk domain policy override (online-rajhi-support-sa.com)",
    "titleAr": "تجاوز إلزامي لسياسة نطاق عالي المخاطر (online-rajhi-support-sa.com)",
    "descriptionEn": "High-risk phishing / brand-mimicry domain triggering an immutable manual review override.",
    "descriptionAr": "نطاق تصيد / انتحال علامة عالي المخاطر يُفعل تجاوز المراجعة اليدوية غير القابل للتخفيض.",
    "expectedDecision": "Manual Review",
    "expectedRiskLevel": "Medium",
    "customer": {
      "id": "bench-pol-030",
      "name": "Policy Case Customer 30",
      "nameAr": "عميل فحص السياسة 30",
      "averageAmount": 3000,
      "transactionCount": 20,
      "usualCountries": [
        "Saudi Arabia"
      ],
      "trustedBeneficiaries": [
        "Sara Al-Mutairi"
      ],
      "usualHours": [
        8,
        20
      ],
      "priorRisk": false
    },
    "input": {
      "customerId": "bench-pol-030",
      "amount": 2000,
      "currency": "SAR",
      "destinationCountry": "Saudi Arabia",
      "beneficiaryName": "Sara Al-Mutairi",
      "transactionType": "Merchant Payment",
      "websiteDomain": "online-rajhi-support-sa.com",
      "submittedAt": "2026-08-13T12:00:00.000Z"
    }
  },
  {
    "id": "BENCH-141",
    "category": "mandatory_policy",
    "titleEn": "High-risk domain policy override (verify-bank-account-direct.net)",
    "titleAr": "تجاوز إلزامي لسياسة نطاق عالي المخاطر (verify-bank-account-direct.net)",
    "descriptionEn": "High-risk phishing / brand-mimicry domain triggering an immutable manual review override.",
    "descriptionAr": "نطاق تصيد / انتحال علامة عالي المخاطر يُفعل تجاوز المراجعة اليدوية غير القابل للتخفيض.",
    "expectedDecision": "Manual Review",
    "expectedRiskLevel": "Medium",
    "customer": {
      "id": "bench-pol-031",
      "name": "Policy Case Customer 31",
      "nameAr": "عميل فحص السياسة 31",
      "averageAmount": 3000,
      "transactionCount": 20,
      "usualCountries": [
        "Saudi Arabia"
      ],
      "trustedBeneficiaries": [
        "Sara Al-Mutairi"
      ],
      "usualHours": [
        8,
        20
      ],
      "priorRisk": false
    },
    "input": {
      "customerId": "bench-pol-031",
      "amount": 2040,
      "currency": "SAR",
      "destinationCountry": "Saudi Arabia",
      "beneficiaryName": "Sara Al-Mutairi",
      "transactionType": "Merchant Payment",
      "websiteDomain": "verify-bank-account-direct.net",
      "submittedAt": "2026-08-13T12:00:00.000Z"
    }
  },
  {
    "id": "BENCH-142",
    "category": "mandatory_policy",
    "titleEn": "High-risk domain policy override (rajhi-secure-transfer-sa.com)",
    "titleAr": "تجاوز إلزامي لسياسة نطاق عالي المخاطر (rajhi-secure-transfer-sa.com)",
    "descriptionEn": "High-risk phishing / brand-mimicry domain triggering an immutable manual review override.",
    "descriptionAr": "نطاق تصيد / انتحال علامة عالي المخاطر يُفعل تجاوز المراجعة اليدوية غير القابل للتخفيض.",
    "expectedDecision": "Manual Review",
    "expectedRiskLevel": "Medium",
    "customer": {
      "id": "bench-pol-032",
      "name": "Policy Case Customer 32",
      "nameAr": "عميل فحص السياسة 32",
      "averageAmount": 3000,
      "transactionCount": 20,
      "usualCountries": [
        "Saudi Arabia"
      ],
      "trustedBeneficiaries": [
        "Sara Al-Mutairi"
      ],
      "usualHours": [
        8,
        20
      ],
      "priorRisk": false
    },
    "input": {
      "customerId": "bench-pol-032",
      "amount": 2080,
      "currency": "SAR",
      "destinationCountry": "Saudi Arabia",
      "beneficiaryName": "Sara Al-Mutairi",
      "transactionType": "Merchant Payment",
      "websiteDomain": "rajhi-secure-transfer-sa.com",
      "submittedAt": "2026-08-13T12:00:00.000Z"
    }
  },
  {
    "id": "BENCH-143",
    "category": "mandatory_policy",
    "titleEn": "High-risk domain policy override (alrajh-sa-secure.com)",
    "titleAr": "تجاوز إلزامي لسياسة نطاق عالي المخاطر (alrajh-sa-secure.com)",
    "descriptionEn": "High-risk phishing / brand-mimicry domain triggering an immutable manual review override.",
    "descriptionAr": "نطاق تصيد / انتحال علامة عالي المخاطر يُفعل تجاوز المراجعة اليدوية غير القابل للتخفيض.",
    "expectedDecision": "Manual Review",
    "expectedRiskLevel": "Medium",
    "customer": {
      "id": "bench-pol-033",
      "name": "Policy Case Customer 33",
      "nameAr": "عميل فحص السياسة 33",
      "averageAmount": 3000,
      "transactionCount": 20,
      "usualCountries": [
        "Saudi Arabia"
      ],
      "trustedBeneficiaries": [
        "Sara Al-Mutairi"
      ],
      "usualHours": [
        8,
        20
      ],
      "priorRisk": false
    },
    "input": {
      "customerId": "bench-pol-033",
      "amount": 2120,
      "currency": "SAR",
      "destinationCountry": "Saudi Arabia",
      "beneficiaryName": "Sara Al-Mutairi",
      "transactionType": "Merchant Payment",
      "websiteDomain": "alrajh-sa-secure.com",
      "submittedAt": "2026-08-13T12:00:00.000Z"
    }
  },
  {
    "id": "BENCH-144",
    "category": "mandatory_policy",
    "titleEn": "High-risk domain policy override (bank-verify-portal.net)",
    "titleAr": "تجاوز إلزامي لسياسة نطاق عالي المخاطر (bank-verify-portal.net)",
    "descriptionEn": "High-risk phishing / brand-mimicry domain triggering an immutable manual review override.",
    "descriptionAr": "نطاق تصيد / انتحال علامة عالي المخاطر يُفعل تجاوز المراجعة اليدوية غير القابل للتخفيض.",
    "expectedDecision": "Manual Review",
    "expectedRiskLevel": "Medium",
    "customer": {
      "id": "bench-pol-034",
      "name": "Policy Case Customer 34",
      "nameAr": "عميل فحص السياسة 34",
      "averageAmount": 3000,
      "transactionCount": 20,
      "usualCountries": [
        "Saudi Arabia"
      ],
      "trustedBeneficiaries": [
        "Sara Al-Mutairi"
      ],
      "usualHours": [
        8,
        20
      ],
      "priorRisk": false
    },
    "input": {
      "customerId": "bench-pol-034",
      "amount": 2160,
      "currency": "SAR",
      "destinationCountry": "Saudi Arabia",
      "beneficiaryName": "Sara Al-Mutairi",
      "transactionType": "Merchant Payment",
      "websiteDomain": "bank-verify-portal.net",
      "submittedAt": "2026-08-13T12:00:00.000Z"
    }
  },
  {
    "id": "BENCH-145",
    "category": "mandatory_policy",
    "titleEn": "High-risk domain policy override (rajhi-auth-center.com)",
    "titleAr": "تجاوز إلزامي لسياسة نطاق عالي المخاطر (rajhi-auth-center.com)",
    "descriptionEn": "High-risk phishing / brand-mimicry domain triggering an immutable manual review override.",
    "descriptionAr": "نطاق تصيد / انتحال علامة عالي المخاطر يُفعل تجاوز المراجعة اليدوية غير القابل للتخفيض.",
    "expectedDecision": "Manual Review",
    "expectedRiskLevel": "Medium",
    "customer": {
      "id": "bench-pol-035",
      "name": "Policy Case Customer 35",
      "nameAr": "عميل فحص السياسة 35",
      "averageAmount": 3000,
      "transactionCount": 20,
      "usualCountries": [
        "Saudi Arabia"
      ],
      "trustedBeneficiaries": [
        "Sara Al-Mutairi"
      ],
      "usualHours": [
        8,
        20
      ],
      "priorRisk": false
    },
    "input": {
      "customerId": "bench-pol-035",
      "amount": 2200,
      "currency": "SAR",
      "destinationCountry": "Saudi Arabia",
      "beneficiaryName": "Sara Al-Mutairi",
      "transactionType": "Merchant Payment",
      "websiteDomain": "rajhi-auth-center.com",
      "submittedAt": "2026-08-13T12:00:00.000Z"
    }
  },
  {
    "id": "BENCH-146",
    "category": "mandatory_policy",
    "titleEn": "High-risk domain policy override (secure-login-portal-pay.org)",
    "titleAr": "تجاوز إلزامي لسياسة نطاق عالي المخاطر (secure-login-portal-pay.org)",
    "descriptionEn": "High-risk phishing / brand-mimicry domain triggering an immutable manual review override.",
    "descriptionAr": "نطاق تصيد / انتحال علامة عالي المخاطر يُفعل تجاوز المراجعة اليدوية غير القابل للتخفيض.",
    "expectedDecision": "Manual Review",
    "expectedRiskLevel": "Medium",
    "customer": {
      "id": "bench-pol-036",
      "name": "Policy Case Customer 36",
      "nameAr": "عميل فحص السياسة 36",
      "averageAmount": 3000,
      "transactionCount": 20,
      "usualCountries": [
        "Saudi Arabia"
      ],
      "trustedBeneficiaries": [
        "Sara Al-Mutairi"
      ],
      "usualHours": [
        8,
        20
      ],
      "priorRisk": false
    },
    "input": {
      "customerId": "bench-pol-036",
      "amount": 2240,
      "currency": "SAR",
      "destinationCountry": "Saudi Arabia",
      "beneficiaryName": "Sara Al-Mutairi",
      "transactionType": "Merchant Payment",
      "websiteDomain": "secure-login-portal-pay.org",
      "submittedAt": "2026-08-13T12:00:00.000Z"
    }
  },
  {
    "id": "BENCH-147",
    "category": "mandatory_policy",
    "titleEn": "High-risk domain policy override (saudi-bank-portal-login.com)",
    "titleAr": "تجاوز إلزامي لسياسة نطاق عالي المخاطر (saudi-bank-portal-login.com)",
    "descriptionEn": "High-risk phishing / brand-mimicry domain triggering an immutable manual review override.",
    "descriptionAr": "نطاق تصيد / انتحال علامة عالي المخاطر يُفعل تجاوز المراجعة اليدوية غير القابل للتخفيض.",
    "expectedDecision": "Manual Review",
    "expectedRiskLevel": "Medium",
    "customer": {
      "id": "bench-pol-037",
      "name": "Policy Case Customer 37",
      "nameAr": "عميل فحص السياسة 37",
      "averageAmount": 3000,
      "transactionCount": 20,
      "usualCountries": [
        "Saudi Arabia"
      ],
      "trustedBeneficiaries": [
        "Sara Al-Mutairi"
      ],
      "usualHours": [
        8,
        20
      ],
      "priorRisk": false
    },
    "input": {
      "customerId": "bench-pol-037",
      "amount": 2280,
      "currency": "SAR",
      "destinationCountry": "Saudi Arabia",
      "beneficiaryName": "Sara Al-Mutairi",
      "transactionType": "Merchant Payment",
      "websiteDomain": "saudi-bank-portal-login.com",
      "submittedAt": "2026-08-13T12:00:00.000Z"
    }
  },
  {
    "id": "BENCH-148",
    "category": "mandatory_policy",
    "titleEn": "High-risk domain policy override (online-rajhi-support-sa.com)",
    "titleAr": "تجاوز إلزامي لسياسة نطاق عالي المخاطر (online-rajhi-support-sa.com)",
    "descriptionEn": "High-risk phishing / brand-mimicry domain triggering an immutable manual review override.",
    "descriptionAr": "نطاق تصيد / انتحال علامة عالي المخاطر يُفعل تجاوز المراجعة اليدوية غير القابل للتخفيض.",
    "expectedDecision": "Manual Review",
    "expectedRiskLevel": "Medium",
    "customer": {
      "id": "bench-pol-038",
      "name": "Policy Case Customer 38",
      "nameAr": "عميل فحص السياسة 38",
      "averageAmount": 3000,
      "transactionCount": 20,
      "usualCountries": [
        "Saudi Arabia"
      ],
      "trustedBeneficiaries": [
        "Sara Al-Mutairi"
      ],
      "usualHours": [
        8,
        20
      ],
      "priorRisk": false
    },
    "input": {
      "customerId": "bench-pol-038",
      "amount": 2320,
      "currency": "SAR",
      "destinationCountry": "Saudi Arabia",
      "beneficiaryName": "Sara Al-Mutairi",
      "transactionType": "Merchant Payment",
      "websiteDomain": "online-rajhi-support-sa.com",
      "submittedAt": "2026-08-13T12:00:00.000Z"
    }
  },
  {
    "id": "BENCH-149",
    "category": "mandatory_policy",
    "titleEn": "High-risk domain policy override (verify-bank-account-direct.net)",
    "titleAr": "تجاوز إلزامي لسياسة نطاق عالي المخاطر (verify-bank-account-direct.net)",
    "descriptionEn": "High-risk phishing / brand-mimicry domain triggering an immutable manual review override.",
    "descriptionAr": "نطاق تصيد / انتحال علامة عالي المخاطر يُفعل تجاوز المراجعة اليدوية غير القابل للتخفيض.",
    "expectedDecision": "Manual Review",
    "expectedRiskLevel": "Medium",
    "customer": {
      "id": "bench-pol-039",
      "name": "Policy Case Customer 39",
      "nameAr": "عميل فحص السياسة 39",
      "averageAmount": 3000,
      "transactionCount": 20,
      "usualCountries": [
        "Saudi Arabia"
      ],
      "trustedBeneficiaries": [
        "Sara Al-Mutairi"
      ],
      "usualHours": [
        8,
        20
      ],
      "priorRisk": false
    },
    "input": {
      "customerId": "bench-pol-039",
      "amount": 2360,
      "currency": "SAR",
      "destinationCountry": "Saudi Arabia",
      "beneficiaryName": "Sara Al-Mutairi",
      "transactionType": "Merchant Payment",
      "websiteDomain": "verify-bank-account-direct.net",
      "submittedAt": "2026-08-13T12:00:00.000Z"
    }
  },
  {
    "id": "BENCH-150",
    "category": "mandatory_policy",
    "titleEn": "High-risk domain policy override (rajhi-secure-transfer-sa.com)",
    "titleAr": "تجاوز إلزامي لسياسة نطاق عالي المخاطر (rajhi-secure-transfer-sa.com)",
    "descriptionEn": "High-risk phishing / brand-mimicry domain triggering an immutable manual review override.",
    "descriptionAr": "نطاق تصيد / انتحال علامة عالي المخاطر يُفعل تجاوز المراجعة اليدوية غير القابل للتخفيض.",
    "expectedDecision": "Manual Review",
    "expectedRiskLevel": "Medium",
    "customer": {
      "id": "bench-pol-040",
      "name": "Policy Case Customer 40",
      "nameAr": "عميل فحص السياسة 40",
      "averageAmount": 3000,
      "transactionCount": 20,
      "usualCountries": [
        "Saudi Arabia"
      ],
      "trustedBeneficiaries": [
        "Sara Al-Mutairi"
      ],
      "usualHours": [
        8,
        20
      ],
      "priorRisk": false
    },
    "input": {
      "customerId": "bench-pol-040",
      "amount": 2400,
      "currency": "SAR",
      "destinationCountry": "Saudi Arabia",
      "beneficiaryName": "Sara Al-Mutairi",
      "transactionType": "Merchant Payment",
      "websiteDomain": "rajhi-secure-transfer-sa.com",
      "submittedAt": "2026-08-13T12:00:00.000Z"
    }
  },
  {
    "id": "BENCH-151",
    "category": "compound_aml",
    "titleEn": "Compound AML: Sanctioned corridor + prior risk + multi-signal (66,200 SAR)",
    "titleAr": "مخاطر AML مركبة: ممر عالي المخاطر مع سوابق وتراكم إشارات (66,200 ر.س)",
    "descriptionEn": "High-risk jurisdiction, unexpected counterparty, and severe baseline deviation.",
    "descriptionAr": "ولاية عالية المخاطر ومستفيد غير معروف وانحراف حاد عن خط الأساس.",
    "expectedDecision": "Manual Review",
    "expectedRiskLevel": "Critical",
    "customer": {
      "id": "bench-aml-001",
      "name": "AML Subject 1",
      "nameAr": "عميل متابعة AML 1",
      "averageAmount": 8000,
      "transactionCount": 15,
      "usualCountries": [
        "Saudi Arabia",
        "UAE"
      ],
      "trustedBeneficiaries": [
        "Known Beneficiary"
      ],
      "usualHours": [
        8,
        20
      ],
      "priorRisk": true
    },
    "input": {
      "customerId": "bench-aml-001",
      "amount": 66200,
      "currency": "SAR",
      "destinationCountry": "High-risk jurisdiction",
      "beneficiaryName": "Global Shell Holdings LLC #1",
      "transactionType": "International Transfer",
      "submittedAt": "2026-08-13T12:00:00.000Z"
    }
  },
  {
    "id": "BENCH-152",
    "category": "compound_aml",
    "titleEn": "Compound AML: Sanctioned corridor + prior risk + multi-signal (67,400 SAR)",
    "titleAr": "مخاطر AML مركبة: ممر عالي المخاطر مع سوابق وتراكم إشارات (67,400 ر.س)",
    "descriptionEn": "High-risk jurisdiction, unexpected counterparty, and severe baseline deviation.",
    "descriptionAr": "ولاية عالية المخاطر ومستفيد غير معروف وانحراف حاد عن خط الأساس.",
    "expectedDecision": "Manual Review",
    "expectedRiskLevel": "Critical",
    "customer": {
      "id": "bench-aml-002",
      "name": "AML Subject 2",
      "nameAr": "عميل متابعة AML 2",
      "averageAmount": 8000,
      "transactionCount": 15,
      "usualCountries": [
        "Saudi Arabia",
        "UAE"
      ],
      "trustedBeneficiaries": [
        "Known Beneficiary"
      ],
      "usualHours": [
        8,
        20
      ],
      "priorRisk": true
    },
    "input": {
      "customerId": "bench-aml-002",
      "amount": 67400,
      "currency": "SAR",
      "destinationCountry": "High-risk jurisdiction",
      "beneficiaryName": "Global Shell Holdings LLC #2",
      "transactionType": "International Transfer",
      "submittedAt": "2026-08-13T12:00:00.000Z"
    }
  },
  {
    "id": "BENCH-153",
    "category": "compound_aml",
    "titleEn": "Compound AML: Sanctioned corridor + prior risk + multi-signal (68,600 SAR)",
    "titleAr": "مخاطر AML مركبة: ممر عالي المخاطر مع سوابق وتراكم إشارات (68,600 ر.س)",
    "descriptionEn": "High-risk jurisdiction, unexpected counterparty, and severe baseline deviation.",
    "descriptionAr": "ولاية عالية المخاطر ومستفيد غير معروف وانحراف حاد عن خط الأساس.",
    "expectedDecision": "Manual Review",
    "expectedRiskLevel": "Critical",
    "customer": {
      "id": "bench-aml-003",
      "name": "AML Subject 3",
      "nameAr": "عميل متابعة AML 3",
      "averageAmount": 8000,
      "transactionCount": 15,
      "usualCountries": [
        "Saudi Arabia",
        "UAE"
      ],
      "trustedBeneficiaries": [
        "Known Beneficiary"
      ],
      "usualHours": [
        8,
        20
      ],
      "priorRisk": true
    },
    "input": {
      "customerId": "bench-aml-003",
      "amount": 68600,
      "currency": "SAR",
      "destinationCountry": "High-risk jurisdiction",
      "beneficiaryName": "Global Shell Holdings LLC #3",
      "transactionType": "International Transfer",
      "submittedAt": "2026-08-13T12:00:00.000Z"
    }
  },
  {
    "id": "BENCH-154",
    "category": "compound_aml",
    "titleEn": "Compound AML: Sanctioned corridor + prior risk + multi-signal (69,800 SAR)",
    "titleAr": "مخاطر AML مركبة: ممر عالي المخاطر مع سوابق وتراكم إشارات (69,800 ر.س)",
    "descriptionEn": "High-risk jurisdiction, unexpected counterparty, and severe baseline deviation.",
    "descriptionAr": "ولاية عالية المخاطر ومستفيد غير معروف وانحراف حاد عن خط الأساس.",
    "expectedDecision": "Manual Review",
    "expectedRiskLevel": "Critical",
    "customer": {
      "id": "bench-aml-004",
      "name": "AML Subject 4",
      "nameAr": "عميل متابعة AML 4",
      "averageAmount": 8000,
      "transactionCount": 15,
      "usualCountries": [
        "Saudi Arabia",
        "UAE"
      ],
      "trustedBeneficiaries": [
        "Known Beneficiary"
      ],
      "usualHours": [
        8,
        20
      ],
      "priorRisk": true
    },
    "input": {
      "customerId": "bench-aml-004",
      "amount": 69800,
      "currency": "SAR",
      "destinationCountry": "High-risk jurisdiction",
      "beneficiaryName": "Global Shell Holdings LLC #4",
      "transactionType": "International Transfer",
      "submittedAt": "2026-08-13T12:00:00.000Z"
    }
  },
  {
    "id": "BENCH-155",
    "category": "compound_aml",
    "titleEn": "Compound AML: Sanctioned corridor + prior risk + multi-signal (71,000 SAR)",
    "titleAr": "مخاطر AML مركبة: ممر عالي المخاطر مع سوابق وتراكم إشارات (71,000 ر.س)",
    "descriptionEn": "High-risk jurisdiction, unexpected counterparty, and severe baseline deviation.",
    "descriptionAr": "ولاية عالية المخاطر ومستفيد غير معروف وانحراف حاد عن خط الأساس.",
    "expectedDecision": "Manual Review",
    "expectedRiskLevel": "Critical",
    "customer": {
      "id": "bench-aml-005",
      "name": "AML Subject 5",
      "nameAr": "عميل متابعة AML 5",
      "averageAmount": 8000,
      "transactionCount": 15,
      "usualCountries": [
        "Saudi Arabia",
        "UAE"
      ],
      "trustedBeneficiaries": [
        "Known Beneficiary"
      ],
      "usualHours": [
        8,
        20
      ],
      "priorRisk": true
    },
    "input": {
      "customerId": "bench-aml-005",
      "amount": 71000,
      "currency": "SAR",
      "destinationCountry": "High-risk jurisdiction",
      "beneficiaryName": "Global Shell Holdings LLC #5",
      "transactionType": "International Transfer",
      "submittedAt": "2026-08-13T12:00:00.000Z"
    }
  },
  {
    "id": "BENCH-156",
    "category": "compound_aml",
    "titleEn": "Compound AML: Sanctioned corridor + prior risk + multi-signal (72,200 SAR)",
    "titleAr": "مخاطر AML مركبة: ممر عالي المخاطر مع سوابق وتراكم إشارات (72,200 ر.س)",
    "descriptionEn": "High-risk jurisdiction, unexpected counterparty, and severe baseline deviation.",
    "descriptionAr": "ولاية عالية المخاطر ومستفيد غير معروف وانحراف حاد عن خط الأساس.",
    "expectedDecision": "Manual Review",
    "expectedRiskLevel": "Critical",
    "customer": {
      "id": "bench-aml-006",
      "name": "AML Subject 6",
      "nameAr": "عميل متابعة AML 6",
      "averageAmount": 8000,
      "transactionCount": 15,
      "usualCountries": [
        "Saudi Arabia",
        "UAE"
      ],
      "trustedBeneficiaries": [
        "Known Beneficiary"
      ],
      "usualHours": [
        8,
        20
      ],
      "priorRisk": true
    },
    "input": {
      "customerId": "bench-aml-006",
      "amount": 72200,
      "currency": "SAR",
      "destinationCountry": "High-risk jurisdiction",
      "beneficiaryName": "Global Shell Holdings LLC #6",
      "transactionType": "International Transfer",
      "submittedAt": "2026-08-13T12:00:00.000Z"
    }
  },
  {
    "id": "BENCH-157",
    "category": "compound_aml",
    "titleEn": "Compound AML: Sanctioned corridor + prior risk + multi-signal (73,400 SAR)",
    "titleAr": "مخاطر AML مركبة: ممر عالي المخاطر مع سوابق وتراكم إشارات (73,400 ر.س)",
    "descriptionEn": "High-risk jurisdiction, unexpected counterparty, and severe baseline deviation.",
    "descriptionAr": "ولاية عالية المخاطر ومستفيد غير معروف وانحراف حاد عن خط الأساس.",
    "expectedDecision": "Manual Review",
    "expectedRiskLevel": "Critical",
    "customer": {
      "id": "bench-aml-007",
      "name": "AML Subject 7",
      "nameAr": "عميل متابعة AML 7",
      "averageAmount": 8000,
      "transactionCount": 15,
      "usualCountries": [
        "Saudi Arabia",
        "UAE"
      ],
      "trustedBeneficiaries": [
        "Known Beneficiary"
      ],
      "usualHours": [
        8,
        20
      ],
      "priorRisk": true
    },
    "input": {
      "customerId": "bench-aml-007",
      "amount": 73400,
      "currency": "SAR",
      "destinationCountry": "High-risk jurisdiction",
      "beneficiaryName": "Global Shell Holdings LLC #7",
      "transactionType": "International Transfer",
      "submittedAt": "2026-08-13T12:00:00.000Z"
    }
  },
  {
    "id": "BENCH-158",
    "category": "compound_aml",
    "titleEn": "Compound AML: Sanctioned corridor + prior risk + multi-signal (74,600 SAR)",
    "titleAr": "مخاطر AML مركبة: ممر عالي المخاطر مع سوابق وتراكم إشارات (74,600 ر.س)",
    "descriptionEn": "High-risk jurisdiction, unexpected counterparty, and severe baseline deviation.",
    "descriptionAr": "ولاية عالية المخاطر ومستفيد غير معروف وانحراف حاد عن خط الأساس.",
    "expectedDecision": "Manual Review",
    "expectedRiskLevel": "Critical",
    "customer": {
      "id": "bench-aml-008",
      "name": "AML Subject 8",
      "nameAr": "عميل متابعة AML 8",
      "averageAmount": 8000,
      "transactionCount": 15,
      "usualCountries": [
        "Saudi Arabia",
        "UAE"
      ],
      "trustedBeneficiaries": [
        "Known Beneficiary"
      ],
      "usualHours": [
        8,
        20
      ],
      "priorRisk": true
    },
    "input": {
      "customerId": "bench-aml-008",
      "amount": 74600,
      "currency": "SAR",
      "destinationCountry": "High-risk jurisdiction",
      "beneficiaryName": "Global Shell Holdings LLC #8",
      "transactionType": "International Transfer",
      "submittedAt": "2026-08-13T12:00:00.000Z"
    }
  },
  {
    "id": "BENCH-159",
    "category": "compound_aml",
    "titleEn": "Compound AML: Sanctioned corridor + prior risk + multi-signal (75,800 SAR)",
    "titleAr": "مخاطر AML مركبة: ممر عالي المخاطر مع سوابق وتراكم إشارات (75,800 ر.س)",
    "descriptionEn": "High-risk jurisdiction, unexpected counterparty, and severe baseline deviation.",
    "descriptionAr": "ولاية عالية المخاطر ومستفيد غير معروف وانحراف حاد عن خط الأساس.",
    "expectedDecision": "Manual Review",
    "expectedRiskLevel": "Critical",
    "customer": {
      "id": "bench-aml-009",
      "name": "AML Subject 9",
      "nameAr": "عميل متابعة AML 9",
      "averageAmount": 8000,
      "transactionCount": 15,
      "usualCountries": [
        "Saudi Arabia",
        "UAE"
      ],
      "trustedBeneficiaries": [
        "Known Beneficiary"
      ],
      "usualHours": [
        8,
        20
      ],
      "priorRisk": true
    },
    "input": {
      "customerId": "bench-aml-009",
      "amount": 75800,
      "currency": "SAR",
      "destinationCountry": "High-risk jurisdiction",
      "beneficiaryName": "Global Shell Holdings LLC #9",
      "transactionType": "International Transfer",
      "submittedAt": "2026-08-13T12:00:00.000Z"
    }
  },
  {
    "id": "BENCH-160",
    "category": "compound_aml",
    "titleEn": "Compound AML: Sanctioned corridor + prior risk + multi-signal (77,000 SAR)",
    "titleAr": "مخاطر AML مركبة: ممر عالي المخاطر مع سوابق وتراكم إشارات (77,000 ر.س)",
    "descriptionEn": "High-risk jurisdiction, unexpected counterparty, and severe baseline deviation.",
    "descriptionAr": "ولاية عالية المخاطر ومستفيد غير معروف وانحراف حاد عن خط الأساس.",
    "expectedDecision": "Manual Review",
    "expectedRiskLevel": "Critical",
    "customer": {
      "id": "bench-aml-010",
      "name": "AML Subject 10",
      "nameAr": "عميل متابعة AML 10",
      "averageAmount": 8000,
      "transactionCount": 15,
      "usualCountries": [
        "Saudi Arabia",
        "UAE"
      ],
      "trustedBeneficiaries": [
        "Known Beneficiary"
      ],
      "usualHours": [
        8,
        20
      ],
      "priorRisk": true
    },
    "input": {
      "customerId": "bench-aml-010",
      "amount": 77000,
      "currency": "SAR",
      "destinationCountry": "High-risk jurisdiction",
      "beneficiaryName": "Global Shell Holdings LLC #10",
      "transactionType": "International Transfer",
      "submittedAt": "2026-08-13T12:00:00.000Z"
    }
  },
  {
    "id": "BENCH-161",
    "category": "compound_aml",
    "titleEn": "Compound AML: Sanctioned corridor + prior risk + multi-signal (78,200 SAR)",
    "titleAr": "مخاطر AML مركبة: ممر عالي المخاطر مع سوابق وتراكم إشارات (78,200 ر.س)",
    "descriptionEn": "High-risk jurisdiction, unexpected counterparty, and severe baseline deviation.",
    "descriptionAr": "ولاية عالية المخاطر ومستفيد غير معروف وانحراف حاد عن خط الأساس.",
    "expectedDecision": "Manual Review",
    "expectedRiskLevel": "Critical",
    "customer": {
      "id": "bench-aml-011",
      "name": "AML Subject 11",
      "nameAr": "عميل متابعة AML 11",
      "averageAmount": 8000,
      "transactionCount": 15,
      "usualCountries": [
        "Saudi Arabia",
        "UAE"
      ],
      "trustedBeneficiaries": [
        "Known Beneficiary"
      ],
      "usualHours": [
        8,
        20
      ],
      "priorRisk": true
    },
    "input": {
      "customerId": "bench-aml-011",
      "amount": 78200,
      "currency": "SAR",
      "destinationCountry": "High-risk jurisdiction",
      "beneficiaryName": "Global Shell Holdings LLC #11",
      "transactionType": "International Transfer",
      "submittedAt": "2026-08-13T12:00:00.000Z"
    }
  },
  {
    "id": "BENCH-162",
    "category": "compound_aml",
    "titleEn": "Compound AML: Sanctioned corridor + prior risk + multi-signal (79,400 SAR)",
    "titleAr": "مخاطر AML مركبة: ممر عالي المخاطر مع سوابق وتراكم إشارات (79,400 ر.س)",
    "descriptionEn": "High-risk jurisdiction, unexpected counterparty, and severe baseline deviation.",
    "descriptionAr": "ولاية عالية المخاطر ومستفيد غير معروف وانحراف حاد عن خط الأساس.",
    "expectedDecision": "Manual Review",
    "expectedRiskLevel": "Critical",
    "customer": {
      "id": "bench-aml-012",
      "name": "AML Subject 12",
      "nameAr": "عميل متابعة AML 12",
      "averageAmount": 8000,
      "transactionCount": 15,
      "usualCountries": [
        "Saudi Arabia",
        "UAE"
      ],
      "trustedBeneficiaries": [
        "Known Beneficiary"
      ],
      "usualHours": [
        8,
        20
      ],
      "priorRisk": true
    },
    "input": {
      "customerId": "bench-aml-012",
      "amount": 79400,
      "currency": "SAR",
      "destinationCountry": "High-risk jurisdiction",
      "beneficiaryName": "Global Shell Holdings LLC #12",
      "transactionType": "International Transfer",
      "submittedAt": "2026-08-13T12:00:00.000Z"
    }
  },
  {
    "id": "BENCH-163",
    "category": "compound_aml",
    "titleEn": "Compound AML: Sanctioned corridor + prior risk + multi-signal (80,600 SAR)",
    "titleAr": "مخاطر AML مركبة: ممر عالي المخاطر مع سوابق وتراكم إشارات (80,600 ر.س)",
    "descriptionEn": "High-risk jurisdiction, unexpected counterparty, and severe baseline deviation.",
    "descriptionAr": "ولاية عالية المخاطر ومستفيد غير معروف وانحراف حاد عن خط الأساس.",
    "expectedDecision": "Manual Review",
    "expectedRiskLevel": "Critical",
    "customer": {
      "id": "bench-aml-013",
      "name": "AML Subject 13",
      "nameAr": "عميل متابعة AML 13",
      "averageAmount": 8000,
      "transactionCount": 15,
      "usualCountries": [
        "Saudi Arabia",
        "UAE"
      ],
      "trustedBeneficiaries": [
        "Known Beneficiary"
      ],
      "usualHours": [
        8,
        20
      ],
      "priorRisk": true
    },
    "input": {
      "customerId": "bench-aml-013",
      "amount": 80600,
      "currency": "SAR",
      "destinationCountry": "High-risk jurisdiction",
      "beneficiaryName": "Global Shell Holdings LLC #13",
      "transactionType": "International Transfer",
      "submittedAt": "2026-08-13T12:00:00.000Z"
    }
  },
  {
    "id": "BENCH-164",
    "category": "compound_aml",
    "titleEn": "Compound AML: Sanctioned corridor + prior risk + multi-signal (81,800 SAR)",
    "titleAr": "مخاطر AML مركبة: ممر عالي المخاطر مع سوابق وتراكم إشارات (81,800 ر.س)",
    "descriptionEn": "High-risk jurisdiction, unexpected counterparty, and severe baseline deviation.",
    "descriptionAr": "ولاية عالية المخاطر ومستفيد غير معروف وانحراف حاد عن خط الأساس.",
    "expectedDecision": "Manual Review",
    "expectedRiskLevel": "Critical",
    "customer": {
      "id": "bench-aml-014",
      "name": "AML Subject 14",
      "nameAr": "عميل متابعة AML 14",
      "averageAmount": 8000,
      "transactionCount": 15,
      "usualCountries": [
        "Saudi Arabia",
        "UAE"
      ],
      "trustedBeneficiaries": [
        "Known Beneficiary"
      ],
      "usualHours": [
        8,
        20
      ],
      "priorRisk": true
    },
    "input": {
      "customerId": "bench-aml-014",
      "amount": 81800,
      "currency": "SAR",
      "destinationCountry": "High-risk jurisdiction",
      "beneficiaryName": "Global Shell Holdings LLC #14",
      "transactionType": "International Transfer",
      "submittedAt": "2026-08-13T12:00:00.000Z"
    }
  },
  {
    "id": "BENCH-165",
    "category": "compound_aml",
    "titleEn": "Compound AML: Sanctioned corridor + prior risk + multi-signal (83,000 SAR)",
    "titleAr": "مخاطر AML مركبة: ممر عالي المخاطر مع سوابق وتراكم إشارات (83,000 ر.س)",
    "descriptionEn": "High-risk jurisdiction, unexpected counterparty, and severe baseline deviation.",
    "descriptionAr": "ولاية عالية المخاطر ومستفيد غير معروف وانحراف حاد عن خط الأساس.",
    "expectedDecision": "Manual Review",
    "expectedRiskLevel": "Critical",
    "customer": {
      "id": "bench-aml-015",
      "name": "AML Subject 15",
      "nameAr": "عميل متابعة AML 15",
      "averageAmount": 8000,
      "transactionCount": 15,
      "usualCountries": [
        "Saudi Arabia",
        "UAE"
      ],
      "trustedBeneficiaries": [
        "Known Beneficiary"
      ],
      "usualHours": [
        8,
        20
      ],
      "priorRisk": true
    },
    "input": {
      "customerId": "bench-aml-015",
      "amount": 83000,
      "currency": "SAR",
      "destinationCountry": "High-risk jurisdiction",
      "beneficiaryName": "Global Shell Holdings LLC #15",
      "transactionType": "International Transfer",
      "submittedAt": "2026-08-13T12:00:00.000Z"
    }
  },
  {
    "id": "BENCH-166",
    "category": "compound_aml",
    "titleEn": "Compound AML: Sanctioned corridor + prior risk + multi-signal (84,200 SAR)",
    "titleAr": "مخاطر AML مركبة: ممر عالي المخاطر مع سوابق وتراكم إشارات (84,200 ر.س)",
    "descriptionEn": "High-risk jurisdiction, unexpected counterparty, and severe baseline deviation.",
    "descriptionAr": "ولاية عالية المخاطر ومستفيد غير معروف وانحراف حاد عن خط الأساس.",
    "expectedDecision": "Manual Review",
    "expectedRiskLevel": "Critical",
    "customer": {
      "id": "bench-aml-016",
      "name": "AML Subject 16",
      "nameAr": "عميل متابعة AML 16",
      "averageAmount": 8000,
      "transactionCount": 15,
      "usualCountries": [
        "Saudi Arabia",
        "UAE"
      ],
      "trustedBeneficiaries": [
        "Known Beneficiary"
      ],
      "usualHours": [
        8,
        20
      ],
      "priorRisk": true
    },
    "input": {
      "customerId": "bench-aml-016",
      "amount": 84200,
      "currency": "SAR",
      "destinationCountry": "High-risk jurisdiction",
      "beneficiaryName": "Global Shell Holdings LLC #16",
      "transactionType": "International Transfer",
      "submittedAt": "2026-08-13T12:00:00.000Z"
    }
  },
  {
    "id": "BENCH-167",
    "category": "compound_aml",
    "titleEn": "Compound AML: Sanctioned corridor + prior risk + multi-signal (85,400 SAR)",
    "titleAr": "مخاطر AML مركبة: ممر عالي المخاطر مع سوابق وتراكم إشارات (85,400 ر.س)",
    "descriptionEn": "High-risk jurisdiction, unexpected counterparty, and severe baseline deviation.",
    "descriptionAr": "ولاية عالية المخاطر ومستفيد غير معروف وانحراف حاد عن خط الأساس.",
    "expectedDecision": "Manual Review",
    "expectedRiskLevel": "Critical",
    "customer": {
      "id": "bench-aml-017",
      "name": "AML Subject 17",
      "nameAr": "عميل متابعة AML 17",
      "averageAmount": 8000,
      "transactionCount": 15,
      "usualCountries": [
        "Saudi Arabia",
        "UAE"
      ],
      "trustedBeneficiaries": [
        "Known Beneficiary"
      ],
      "usualHours": [
        8,
        20
      ],
      "priorRisk": true
    },
    "input": {
      "customerId": "bench-aml-017",
      "amount": 85400,
      "currency": "SAR",
      "destinationCountry": "High-risk jurisdiction",
      "beneficiaryName": "Global Shell Holdings LLC #17",
      "transactionType": "International Transfer",
      "submittedAt": "2026-08-13T12:00:00.000Z"
    }
  },
  {
    "id": "BENCH-168",
    "category": "compound_aml",
    "titleEn": "Compound AML: Sanctioned corridor + prior risk + multi-signal (86,600 SAR)",
    "titleAr": "مخاطر AML مركبة: ممر عالي المخاطر مع سوابق وتراكم إشارات (86,600 ر.س)",
    "descriptionEn": "High-risk jurisdiction, unexpected counterparty, and severe baseline deviation.",
    "descriptionAr": "ولاية عالية المخاطر ومستفيد غير معروف وانحراف حاد عن خط الأساس.",
    "expectedDecision": "Manual Review",
    "expectedRiskLevel": "Critical",
    "customer": {
      "id": "bench-aml-018",
      "name": "AML Subject 18",
      "nameAr": "عميل متابعة AML 18",
      "averageAmount": 8000,
      "transactionCount": 15,
      "usualCountries": [
        "Saudi Arabia",
        "UAE"
      ],
      "trustedBeneficiaries": [
        "Known Beneficiary"
      ],
      "usualHours": [
        8,
        20
      ],
      "priorRisk": true
    },
    "input": {
      "customerId": "bench-aml-018",
      "amount": 86600,
      "currency": "SAR",
      "destinationCountry": "High-risk jurisdiction",
      "beneficiaryName": "Global Shell Holdings LLC #18",
      "transactionType": "International Transfer",
      "submittedAt": "2026-08-13T12:00:00.000Z"
    }
  },
  {
    "id": "BENCH-169",
    "category": "compound_aml",
    "titleEn": "Compound AML: Sanctioned corridor + prior risk + multi-signal (87,800 SAR)",
    "titleAr": "مخاطر AML مركبة: ممر عالي المخاطر مع سوابق وتراكم إشارات (87,800 ر.س)",
    "descriptionEn": "High-risk jurisdiction, unexpected counterparty, and severe baseline deviation.",
    "descriptionAr": "ولاية عالية المخاطر ومستفيد غير معروف وانحراف حاد عن خط الأساس.",
    "expectedDecision": "Manual Review",
    "expectedRiskLevel": "Critical",
    "customer": {
      "id": "bench-aml-019",
      "name": "AML Subject 19",
      "nameAr": "عميل متابعة AML 19",
      "averageAmount": 8000,
      "transactionCount": 15,
      "usualCountries": [
        "Saudi Arabia",
        "UAE"
      ],
      "trustedBeneficiaries": [
        "Known Beneficiary"
      ],
      "usualHours": [
        8,
        20
      ],
      "priorRisk": true
    },
    "input": {
      "customerId": "bench-aml-019",
      "amount": 87800,
      "currency": "SAR",
      "destinationCountry": "High-risk jurisdiction",
      "beneficiaryName": "Global Shell Holdings LLC #19",
      "transactionType": "International Transfer",
      "submittedAt": "2026-08-13T12:00:00.000Z"
    }
  },
  {
    "id": "BENCH-170",
    "category": "compound_aml",
    "titleEn": "Compound AML: Sanctioned corridor + prior risk + multi-signal (89,000 SAR)",
    "titleAr": "مخاطر AML مركبة: ممر عالي المخاطر مع سوابق وتراكم إشارات (89,000 ر.س)",
    "descriptionEn": "High-risk jurisdiction, unexpected counterparty, and severe baseline deviation.",
    "descriptionAr": "ولاية عالية المخاطر ومستفيد غير معروف وانحراف حاد عن خط الأساس.",
    "expectedDecision": "Manual Review",
    "expectedRiskLevel": "Critical",
    "customer": {
      "id": "bench-aml-020",
      "name": "AML Subject 20",
      "nameAr": "عميل متابعة AML 20",
      "averageAmount": 8000,
      "transactionCount": 15,
      "usualCountries": [
        "Saudi Arabia",
        "UAE"
      ],
      "trustedBeneficiaries": [
        "Known Beneficiary"
      ],
      "usualHours": [
        8,
        20
      ],
      "priorRisk": true
    },
    "input": {
      "customerId": "bench-aml-020",
      "amount": 89000,
      "currency": "SAR",
      "destinationCountry": "High-risk jurisdiction",
      "beneficiaryName": "Global Shell Holdings LLC #20",
      "transactionType": "International Transfer",
      "submittedAt": "2026-08-13T12:00:00.000Z"
    }
  },
  {
    "id": "BENCH-171",
    "category": "compound_aml",
    "titleEn": "Compound AML: Sanctioned corridor + prior risk + multi-signal (90,200 SAR)",
    "titleAr": "مخاطر AML مركبة: ممر عالي المخاطر مع سوابق وتراكم إشارات (90,200 ر.س)",
    "descriptionEn": "High-risk jurisdiction, unexpected counterparty, and severe baseline deviation.",
    "descriptionAr": "ولاية عالية المخاطر ومستفيد غير معروف وانحراف حاد عن خط الأساس.",
    "expectedDecision": "Manual Review",
    "expectedRiskLevel": "Critical",
    "customer": {
      "id": "bench-aml-021",
      "name": "AML Subject 21",
      "nameAr": "عميل متابعة AML 21",
      "averageAmount": 8000,
      "transactionCount": 15,
      "usualCountries": [
        "Saudi Arabia",
        "UAE"
      ],
      "trustedBeneficiaries": [
        "Known Beneficiary"
      ],
      "usualHours": [
        8,
        20
      ],
      "priorRisk": true
    },
    "input": {
      "customerId": "bench-aml-021",
      "amount": 90200,
      "currency": "SAR",
      "destinationCountry": "High-risk jurisdiction",
      "beneficiaryName": "Global Shell Holdings LLC #21",
      "transactionType": "International Transfer",
      "submittedAt": "2026-08-13T12:00:00.000Z"
    }
  },
  {
    "id": "BENCH-172",
    "category": "compound_aml",
    "titleEn": "Compound AML: Sanctioned corridor + prior risk + multi-signal (91,400 SAR)",
    "titleAr": "مخاطر AML مركبة: ممر عالي المخاطر مع سوابق وتراكم إشارات (91,400 ر.س)",
    "descriptionEn": "High-risk jurisdiction, unexpected counterparty, and severe baseline deviation.",
    "descriptionAr": "ولاية عالية المخاطر ومستفيد غير معروف وانحراف حاد عن خط الأساس.",
    "expectedDecision": "Manual Review",
    "expectedRiskLevel": "Critical",
    "customer": {
      "id": "bench-aml-022",
      "name": "AML Subject 22",
      "nameAr": "عميل متابعة AML 22",
      "averageAmount": 8000,
      "transactionCount": 15,
      "usualCountries": [
        "Saudi Arabia",
        "UAE"
      ],
      "trustedBeneficiaries": [
        "Known Beneficiary"
      ],
      "usualHours": [
        8,
        20
      ],
      "priorRisk": true
    },
    "input": {
      "customerId": "bench-aml-022",
      "amount": 91400,
      "currency": "SAR",
      "destinationCountry": "High-risk jurisdiction",
      "beneficiaryName": "Global Shell Holdings LLC #22",
      "transactionType": "International Transfer",
      "submittedAt": "2026-08-13T12:00:00.000Z"
    }
  },
  {
    "id": "BENCH-173",
    "category": "compound_aml",
    "titleEn": "Compound AML: Sanctioned corridor + prior risk + multi-signal (92,600 SAR)",
    "titleAr": "مخاطر AML مركبة: ممر عالي المخاطر مع سوابق وتراكم إشارات (92,600 ر.س)",
    "descriptionEn": "High-risk jurisdiction, unexpected counterparty, and severe baseline deviation.",
    "descriptionAr": "ولاية عالية المخاطر ومستفيد غير معروف وانحراف حاد عن خط الأساس.",
    "expectedDecision": "Manual Review",
    "expectedRiskLevel": "Critical",
    "customer": {
      "id": "bench-aml-023",
      "name": "AML Subject 23",
      "nameAr": "عميل متابعة AML 23",
      "averageAmount": 8000,
      "transactionCount": 15,
      "usualCountries": [
        "Saudi Arabia",
        "UAE"
      ],
      "trustedBeneficiaries": [
        "Known Beneficiary"
      ],
      "usualHours": [
        8,
        20
      ],
      "priorRisk": true
    },
    "input": {
      "customerId": "bench-aml-023",
      "amount": 92600,
      "currency": "SAR",
      "destinationCountry": "High-risk jurisdiction",
      "beneficiaryName": "Global Shell Holdings LLC #23",
      "transactionType": "International Transfer",
      "submittedAt": "2026-08-13T12:00:00.000Z"
    }
  },
  {
    "id": "BENCH-174",
    "category": "compound_aml",
    "titleEn": "Compound AML: Sanctioned corridor + prior risk + multi-signal (93,800 SAR)",
    "titleAr": "مخاطر AML مركبة: ممر عالي المخاطر مع سوابق وتراكم إشارات (93,800 ر.س)",
    "descriptionEn": "High-risk jurisdiction, unexpected counterparty, and severe baseline deviation.",
    "descriptionAr": "ولاية عالية المخاطر ومستفيد غير معروف وانحراف حاد عن خط الأساس.",
    "expectedDecision": "Manual Review",
    "expectedRiskLevel": "Critical",
    "customer": {
      "id": "bench-aml-024",
      "name": "AML Subject 24",
      "nameAr": "عميل متابعة AML 24",
      "averageAmount": 8000,
      "transactionCount": 15,
      "usualCountries": [
        "Saudi Arabia",
        "UAE"
      ],
      "trustedBeneficiaries": [
        "Known Beneficiary"
      ],
      "usualHours": [
        8,
        20
      ],
      "priorRisk": true
    },
    "input": {
      "customerId": "bench-aml-024",
      "amount": 93800,
      "currency": "SAR",
      "destinationCountry": "High-risk jurisdiction",
      "beneficiaryName": "Global Shell Holdings LLC #24",
      "transactionType": "International Transfer",
      "submittedAt": "2026-08-13T12:00:00.000Z"
    }
  },
  {
    "id": "BENCH-175",
    "category": "compound_aml",
    "titleEn": "Compound AML: Sanctioned corridor + prior risk + multi-signal (95,000 SAR)",
    "titleAr": "مخاطر AML مركبة: ممر عالي المخاطر مع سوابق وتراكم إشارات (95,000 ر.س)",
    "descriptionEn": "High-risk jurisdiction, unexpected counterparty, and severe baseline deviation.",
    "descriptionAr": "ولاية عالية المخاطر ومستفيد غير معروف وانحراف حاد عن خط الأساس.",
    "expectedDecision": "Manual Review",
    "expectedRiskLevel": "Critical",
    "customer": {
      "id": "bench-aml-025",
      "name": "AML Subject 25",
      "nameAr": "عميل متابعة AML 25",
      "averageAmount": 8000,
      "transactionCount": 15,
      "usualCountries": [
        "Saudi Arabia",
        "UAE"
      ],
      "trustedBeneficiaries": [
        "Known Beneficiary"
      ],
      "usualHours": [
        8,
        20
      ],
      "priorRisk": true
    },
    "input": {
      "customerId": "bench-aml-025",
      "amount": 95000,
      "currency": "SAR",
      "destinationCountry": "High-risk jurisdiction",
      "beneficiaryName": "Global Shell Holdings LLC #25",
      "transactionType": "International Transfer",
      "submittedAt": "2026-08-13T12:00:00.000Z"
    }
  },
  {
    "id": "BENCH-176",
    "category": "compound_aml",
    "titleEn": "Compound AML: Sanctioned corridor + prior risk + multi-signal (96,200 SAR)",
    "titleAr": "مخاطر AML مركبة: ممر عالي المخاطر مع سوابق وتراكم إشارات (96,200 ر.س)",
    "descriptionEn": "High-risk jurisdiction, unexpected counterparty, and severe baseline deviation.",
    "descriptionAr": "ولاية عالية المخاطر ومستفيد غير معروف وانحراف حاد عن خط الأساس.",
    "expectedDecision": "Manual Review",
    "expectedRiskLevel": "Critical",
    "customer": {
      "id": "bench-aml-026",
      "name": "AML Subject 26",
      "nameAr": "عميل متابعة AML 26",
      "averageAmount": 8000,
      "transactionCount": 15,
      "usualCountries": [
        "Saudi Arabia",
        "UAE"
      ],
      "trustedBeneficiaries": [
        "Known Beneficiary"
      ],
      "usualHours": [
        8,
        20
      ],
      "priorRisk": true
    },
    "input": {
      "customerId": "bench-aml-026",
      "amount": 96200,
      "currency": "SAR",
      "destinationCountry": "High-risk jurisdiction",
      "beneficiaryName": "Global Shell Holdings LLC #26",
      "transactionType": "International Transfer",
      "submittedAt": "2026-08-13T12:00:00.000Z"
    }
  },
  {
    "id": "BENCH-177",
    "category": "compound_aml",
    "titleEn": "Compound AML: Sanctioned corridor + prior risk + multi-signal (97,400 SAR)",
    "titleAr": "مخاطر AML مركبة: ممر عالي المخاطر مع سوابق وتراكم إشارات (97,400 ر.س)",
    "descriptionEn": "High-risk jurisdiction, unexpected counterparty, and severe baseline deviation.",
    "descriptionAr": "ولاية عالية المخاطر ومستفيد غير معروف وانحراف حاد عن خط الأساس.",
    "expectedDecision": "Manual Review",
    "expectedRiskLevel": "Critical",
    "customer": {
      "id": "bench-aml-027",
      "name": "AML Subject 27",
      "nameAr": "عميل متابعة AML 27",
      "averageAmount": 8000,
      "transactionCount": 15,
      "usualCountries": [
        "Saudi Arabia",
        "UAE"
      ],
      "trustedBeneficiaries": [
        "Known Beneficiary"
      ],
      "usualHours": [
        8,
        20
      ],
      "priorRisk": true
    },
    "input": {
      "customerId": "bench-aml-027",
      "amount": 97400,
      "currency": "SAR",
      "destinationCountry": "High-risk jurisdiction",
      "beneficiaryName": "Global Shell Holdings LLC #27",
      "transactionType": "International Transfer",
      "submittedAt": "2026-08-13T12:00:00.000Z"
    }
  },
  {
    "id": "BENCH-178",
    "category": "compound_aml",
    "titleEn": "Compound AML: Sanctioned corridor + prior risk + multi-signal (98,600 SAR)",
    "titleAr": "مخاطر AML مركبة: ممر عالي المخاطر مع سوابق وتراكم إشارات (98,600 ر.س)",
    "descriptionEn": "High-risk jurisdiction, unexpected counterparty, and severe baseline deviation.",
    "descriptionAr": "ولاية عالية المخاطر ومستفيد غير معروف وانحراف حاد عن خط الأساس.",
    "expectedDecision": "Manual Review",
    "expectedRiskLevel": "Critical",
    "customer": {
      "id": "bench-aml-028",
      "name": "AML Subject 28",
      "nameAr": "عميل متابعة AML 28",
      "averageAmount": 8000,
      "transactionCount": 15,
      "usualCountries": [
        "Saudi Arabia",
        "UAE"
      ],
      "trustedBeneficiaries": [
        "Known Beneficiary"
      ],
      "usualHours": [
        8,
        20
      ],
      "priorRisk": true
    },
    "input": {
      "customerId": "bench-aml-028",
      "amount": 98600,
      "currency": "SAR",
      "destinationCountry": "High-risk jurisdiction",
      "beneficiaryName": "Global Shell Holdings LLC #28",
      "transactionType": "International Transfer",
      "submittedAt": "2026-08-13T12:00:00.000Z"
    }
  },
  {
    "id": "BENCH-179",
    "category": "compound_aml",
    "titleEn": "Compound AML: Sanctioned corridor + prior risk + multi-signal (99,800 SAR)",
    "titleAr": "مخاطر AML مركبة: ممر عالي المخاطر مع سوابق وتراكم إشارات (99,800 ر.س)",
    "descriptionEn": "High-risk jurisdiction, unexpected counterparty, and severe baseline deviation.",
    "descriptionAr": "ولاية عالية المخاطر ومستفيد غير معروف وانحراف حاد عن خط الأساس.",
    "expectedDecision": "Manual Review",
    "expectedRiskLevel": "Critical",
    "customer": {
      "id": "bench-aml-029",
      "name": "AML Subject 29",
      "nameAr": "عميل متابعة AML 29",
      "averageAmount": 8000,
      "transactionCount": 15,
      "usualCountries": [
        "Saudi Arabia",
        "UAE"
      ],
      "trustedBeneficiaries": [
        "Known Beneficiary"
      ],
      "usualHours": [
        8,
        20
      ],
      "priorRisk": true
    },
    "input": {
      "customerId": "bench-aml-029",
      "amount": 99800,
      "currency": "SAR",
      "destinationCountry": "High-risk jurisdiction",
      "beneficiaryName": "Global Shell Holdings LLC #29",
      "transactionType": "International Transfer",
      "submittedAt": "2026-08-13T12:00:00.000Z"
    }
  },
  {
    "id": "BENCH-180",
    "category": "compound_aml",
    "titleEn": "Compound AML: Sanctioned corridor + prior risk + multi-signal (101,000 SAR)",
    "titleAr": "مخاطر AML مركبة: ممر عالي المخاطر مع سوابق وتراكم إشارات (101,000 ر.س)",
    "descriptionEn": "High-risk jurisdiction, unexpected counterparty, and severe baseline deviation.",
    "descriptionAr": "ولاية عالية المخاطر ومستفيد غير معروف وانحراف حاد عن خط الأساس.",
    "expectedDecision": "Manual Review",
    "expectedRiskLevel": "Critical",
    "customer": {
      "id": "bench-aml-030",
      "name": "AML Subject 30",
      "nameAr": "عميل متابعة AML 30",
      "averageAmount": 8000,
      "transactionCount": 15,
      "usualCountries": [
        "Saudi Arabia",
        "UAE"
      ],
      "trustedBeneficiaries": [
        "Known Beneficiary"
      ],
      "usualHours": [
        8,
        20
      ],
      "priorRisk": true
    },
    "input": {
      "customerId": "bench-aml-030",
      "amount": 101000,
      "currency": "SAR",
      "destinationCountry": "High-risk jurisdiction",
      "beneficiaryName": "Global Shell Holdings LLC #30",
      "transactionType": "International Transfer",
      "submittedAt": "2026-08-13T12:00:00.000Z"
    }
  },
  {
    "id": "BENCH-181",
    "category": "compound_aml",
    "titleEn": "Compound AML: Sanctioned corridor + prior risk + multi-signal (102,200 SAR)",
    "titleAr": "مخاطر AML مركبة: ممر عالي المخاطر مع سوابق وتراكم إشارات (102,200 ر.س)",
    "descriptionEn": "High-risk jurisdiction, unexpected counterparty, and severe baseline deviation.",
    "descriptionAr": "ولاية عالية المخاطر ومستفيد غير معروف وانحراف حاد عن خط الأساس.",
    "expectedDecision": "Manual Review",
    "expectedRiskLevel": "Critical",
    "customer": {
      "id": "bench-aml-031",
      "name": "AML Subject 31",
      "nameAr": "عميل متابعة AML 31",
      "averageAmount": 8000,
      "transactionCount": 15,
      "usualCountries": [
        "Saudi Arabia",
        "UAE"
      ],
      "trustedBeneficiaries": [
        "Known Beneficiary"
      ],
      "usualHours": [
        8,
        20
      ],
      "priorRisk": true
    },
    "input": {
      "customerId": "bench-aml-031",
      "amount": 102200,
      "currency": "SAR",
      "destinationCountry": "High-risk jurisdiction",
      "beneficiaryName": "Global Shell Holdings LLC #31",
      "transactionType": "International Transfer",
      "submittedAt": "2026-08-13T12:00:00.000Z"
    }
  },
  {
    "id": "BENCH-182",
    "category": "compound_aml",
    "titleEn": "Compound AML: Sanctioned corridor + prior risk + multi-signal (103,400 SAR)",
    "titleAr": "مخاطر AML مركبة: ممر عالي المخاطر مع سوابق وتراكم إشارات (103,400 ر.س)",
    "descriptionEn": "High-risk jurisdiction, unexpected counterparty, and severe baseline deviation.",
    "descriptionAr": "ولاية عالية المخاطر ومستفيد غير معروف وانحراف حاد عن خط الأساس.",
    "expectedDecision": "Manual Review",
    "expectedRiskLevel": "Critical",
    "customer": {
      "id": "bench-aml-032",
      "name": "AML Subject 32",
      "nameAr": "عميل متابعة AML 32",
      "averageAmount": 8000,
      "transactionCount": 15,
      "usualCountries": [
        "Saudi Arabia",
        "UAE"
      ],
      "trustedBeneficiaries": [
        "Known Beneficiary"
      ],
      "usualHours": [
        8,
        20
      ],
      "priorRisk": true
    },
    "input": {
      "customerId": "bench-aml-032",
      "amount": 103400,
      "currency": "SAR",
      "destinationCountry": "High-risk jurisdiction",
      "beneficiaryName": "Global Shell Holdings LLC #32",
      "transactionType": "International Transfer",
      "submittedAt": "2026-08-13T12:00:00.000Z"
    }
  },
  {
    "id": "BENCH-183",
    "category": "compound_aml",
    "titleEn": "Compound AML: Sanctioned corridor + prior risk + multi-signal (104,600 SAR)",
    "titleAr": "مخاطر AML مركبة: ممر عالي المخاطر مع سوابق وتراكم إشارات (104,600 ر.س)",
    "descriptionEn": "High-risk jurisdiction, unexpected counterparty, and severe baseline deviation.",
    "descriptionAr": "ولاية عالية المخاطر ومستفيد غير معروف وانحراف حاد عن خط الأساس.",
    "expectedDecision": "Manual Review",
    "expectedRiskLevel": "Critical",
    "customer": {
      "id": "bench-aml-033",
      "name": "AML Subject 33",
      "nameAr": "عميل متابعة AML 33",
      "averageAmount": 8000,
      "transactionCount": 15,
      "usualCountries": [
        "Saudi Arabia",
        "UAE"
      ],
      "trustedBeneficiaries": [
        "Known Beneficiary"
      ],
      "usualHours": [
        8,
        20
      ],
      "priorRisk": true
    },
    "input": {
      "customerId": "bench-aml-033",
      "amount": 104600,
      "currency": "SAR",
      "destinationCountry": "High-risk jurisdiction",
      "beneficiaryName": "Global Shell Holdings LLC #33",
      "transactionType": "International Transfer",
      "submittedAt": "2026-08-13T12:00:00.000Z"
    }
  },
  {
    "id": "BENCH-184",
    "category": "compound_aml",
    "titleEn": "Compound AML: Sanctioned corridor + prior risk + multi-signal (105,800 SAR)",
    "titleAr": "مخاطر AML مركبة: ممر عالي المخاطر مع سوابق وتراكم إشارات (105,800 ر.س)",
    "descriptionEn": "High-risk jurisdiction, unexpected counterparty, and severe baseline deviation.",
    "descriptionAr": "ولاية عالية المخاطر ومستفيد غير معروف وانحراف حاد عن خط الأساس.",
    "expectedDecision": "Manual Review",
    "expectedRiskLevel": "Critical",
    "customer": {
      "id": "bench-aml-034",
      "name": "AML Subject 34",
      "nameAr": "عميل متابعة AML 34",
      "averageAmount": 8000,
      "transactionCount": 15,
      "usualCountries": [
        "Saudi Arabia",
        "UAE"
      ],
      "trustedBeneficiaries": [
        "Known Beneficiary"
      ],
      "usualHours": [
        8,
        20
      ],
      "priorRisk": true
    },
    "input": {
      "customerId": "bench-aml-034",
      "amount": 105800,
      "currency": "SAR",
      "destinationCountry": "High-risk jurisdiction",
      "beneficiaryName": "Global Shell Holdings LLC #34",
      "transactionType": "International Transfer",
      "submittedAt": "2026-08-13T12:00:00.000Z"
    }
  },
  {
    "id": "BENCH-185",
    "category": "compound_aml",
    "titleEn": "Compound AML: Sanctioned corridor + prior risk + multi-signal (107,000 SAR)",
    "titleAr": "مخاطر AML مركبة: ممر عالي المخاطر مع سوابق وتراكم إشارات (107,000 ر.س)",
    "descriptionEn": "High-risk jurisdiction, unexpected counterparty, and severe baseline deviation.",
    "descriptionAr": "ولاية عالية المخاطر ومستفيد غير معروف وانحراف حاد عن خط الأساس.",
    "expectedDecision": "Manual Review",
    "expectedRiskLevel": "Critical",
    "customer": {
      "id": "bench-aml-035",
      "name": "AML Subject 35",
      "nameAr": "عميل متابعة AML 35",
      "averageAmount": 8000,
      "transactionCount": 15,
      "usualCountries": [
        "Saudi Arabia",
        "UAE"
      ],
      "trustedBeneficiaries": [
        "Known Beneficiary"
      ],
      "usualHours": [
        8,
        20
      ],
      "priorRisk": true
    },
    "input": {
      "customerId": "bench-aml-035",
      "amount": 107000,
      "currency": "SAR",
      "destinationCountry": "High-risk jurisdiction",
      "beneficiaryName": "Global Shell Holdings LLC #35",
      "transactionType": "International Transfer",
      "submittedAt": "2026-08-13T12:00:00.000Z"
    }
  },
  {
    "id": "BENCH-186",
    "category": "compound_aml",
    "titleEn": "Compound AML: High-risk corridor with unvetted recipient (15,600 SAR)",
    "titleAr": "مخاطر AML مركبة: ممر عالي المخاطر مع مستفيد غير مثبت (15,600 ر.س)",
    "descriptionEn": "High-risk jurisdiction, unexpected counterparty, and severe baseline deviation.",
    "descriptionAr": "ولاية عالية المخاطر ومستفيد غير معروف وانحراف حاد عن خط الأساس.",
    "expectedDecision": "Temporary Hold",
    "expectedRiskLevel": "High",
    "customer": {
      "id": "bench-aml-036",
      "name": "AML Subject 36",
      "nameAr": "عميل متابعة AML 36",
      "averageAmount": 10000,
      "transactionCount": 15,
      "usualCountries": [
        "Saudi Arabia",
        "UAE"
      ],
      "trustedBeneficiaries": [
        "Known Beneficiary"
      ],
      "usualHours": [
        8,
        20
      ],
      "priorRisk": false
    },
    "input": {
      "customerId": "bench-aml-036",
      "amount": 15600,
      "currency": "SAR",
      "destinationCountry": "High-risk jurisdiction",
      "beneficiaryName": "Regional Trader Entity #36",
      "transactionType": "Personal Transfer",
      "submittedAt": "2026-08-13T12:00:00.000Z"
    }
  },
  {
    "id": "BENCH-187",
    "category": "compound_aml",
    "titleEn": "Compound AML: High-risk corridor with unvetted recipient (15,700 SAR)",
    "titleAr": "مخاطر AML مركبة: ممر عالي المخاطر مع مستفيد غير مثبت (15,700 ر.س)",
    "descriptionEn": "High-risk jurisdiction, unexpected counterparty, and severe baseline deviation.",
    "descriptionAr": "ولاية عالية المخاطر ومستفيد غير معروف وانحراف حاد عن خط الأساس.",
    "expectedDecision": "Temporary Hold",
    "expectedRiskLevel": "High",
    "customer": {
      "id": "bench-aml-037",
      "name": "AML Subject 37",
      "nameAr": "عميل متابعة AML 37",
      "averageAmount": 10000,
      "transactionCount": 15,
      "usualCountries": [
        "Saudi Arabia",
        "UAE"
      ],
      "trustedBeneficiaries": [
        "Known Beneficiary"
      ],
      "usualHours": [
        8,
        20
      ],
      "priorRisk": false
    },
    "input": {
      "customerId": "bench-aml-037",
      "amount": 15700,
      "currency": "SAR",
      "destinationCountry": "High-risk jurisdiction",
      "beneficiaryName": "Regional Trader Entity #37",
      "transactionType": "Personal Transfer",
      "submittedAt": "2026-08-13T12:00:00.000Z"
    }
  },
  {
    "id": "BENCH-188",
    "category": "compound_aml",
    "titleEn": "Compound AML: High-risk corridor with unvetted recipient (15,800 SAR)",
    "titleAr": "مخاطر AML مركبة: ممر عالي المخاطر مع مستفيد غير مثبت (15,800 ر.س)",
    "descriptionEn": "High-risk jurisdiction, unexpected counterparty, and severe baseline deviation.",
    "descriptionAr": "ولاية عالية المخاطر ومستفيد غير معروف وانحراف حاد عن خط الأساس.",
    "expectedDecision": "Temporary Hold",
    "expectedRiskLevel": "High",
    "customer": {
      "id": "bench-aml-038",
      "name": "AML Subject 38",
      "nameAr": "عميل متابعة AML 38",
      "averageAmount": 10000,
      "transactionCount": 15,
      "usualCountries": [
        "Saudi Arabia",
        "UAE"
      ],
      "trustedBeneficiaries": [
        "Known Beneficiary"
      ],
      "usualHours": [
        8,
        20
      ],
      "priorRisk": false
    },
    "input": {
      "customerId": "bench-aml-038",
      "amount": 15800,
      "currency": "SAR",
      "destinationCountry": "High-risk jurisdiction",
      "beneficiaryName": "Regional Trader Entity #38",
      "transactionType": "Personal Transfer",
      "submittedAt": "2026-08-13T12:00:00.000Z"
    }
  },
  {
    "id": "BENCH-189",
    "category": "compound_aml",
    "titleEn": "Compound AML: High-risk corridor with unvetted recipient (15,900 SAR)",
    "titleAr": "مخاطر AML مركبة: ممر عالي المخاطر مع مستفيد غير مثبت (15,900 ر.س)",
    "descriptionEn": "High-risk jurisdiction, unexpected counterparty, and severe baseline deviation.",
    "descriptionAr": "ولاية عالية المخاطر ومستفيد غير معروف وانحراف حاد عن خط الأساس.",
    "expectedDecision": "Temporary Hold",
    "expectedRiskLevel": "High",
    "customer": {
      "id": "bench-aml-039",
      "name": "AML Subject 39",
      "nameAr": "عميل متابعة AML 39",
      "averageAmount": 10000,
      "transactionCount": 15,
      "usualCountries": [
        "Saudi Arabia",
        "UAE"
      ],
      "trustedBeneficiaries": [
        "Known Beneficiary"
      ],
      "usualHours": [
        8,
        20
      ],
      "priorRisk": false
    },
    "input": {
      "customerId": "bench-aml-039",
      "amount": 15900,
      "currency": "SAR",
      "destinationCountry": "High-risk jurisdiction",
      "beneficiaryName": "Regional Trader Entity #39",
      "transactionType": "Personal Transfer",
      "submittedAt": "2026-08-13T12:00:00.000Z"
    }
  },
  {
    "id": "BENCH-190",
    "category": "compound_aml",
    "titleEn": "Compound AML: High-risk corridor with unvetted recipient (16,000 SAR)",
    "titleAr": "مخاطر AML مركبة: ممر عالي المخاطر مع مستفيد غير مثبت (16,000 ر.س)",
    "descriptionEn": "High-risk jurisdiction, unexpected counterparty, and severe baseline deviation.",
    "descriptionAr": "ولاية عالية المخاطر ومستفيد غير معروف وانحراف حاد عن خط الأساس.",
    "expectedDecision": "Temporary Hold",
    "expectedRiskLevel": "High",
    "customer": {
      "id": "bench-aml-040",
      "name": "AML Subject 40",
      "nameAr": "عميل متابعة AML 40",
      "averageAmount": 10000,
      "transactionCount": 15,
      "usualCountries": [
        "Saudi Arabia",
        "UAE"
      ],
      "trustedBeneficiaries": [
        "Known Beneficiary"
      ],
      "usualHours": [
        8,
        20
      ],
      "priorRisk": false
    },
    "input": {
      "customerId": "bench-aml-040",
      "amount": 16000,
      "currency": "SAR",
      "destinationCountry": "High-risk jurisdiction",
      "beneficiaryName": "Regional Trader Entity #40",
      "transactionType": "Personal Transfer",
      "submittedAt": "2026-08-13T12:00:00.000Z"
    }
  },
  {
    "id": "BENCH-191",
    "category": "compound_aml",
    "titleEn": "Compound AML: High-risk corridor with unvetted recipient (16,100 SAR)",
    "titleAr": "مخاطر AML مركبة: ممر عالي المخاطر مع مستفيد غير مثبت (16,100 ر.س)",
    "descriptionEn": "High-risk jurisdiction, unexpected counterparty, and severe baseline deviation.",
    "descriptionAr": "ولاية عالية المخاطر ومستفيد غير معروف وانحراف حاد عن خط الأساس.",
    "expectedDecision": "Temporary Hold",
    "expectedRiskLevel": "High",
    "customer": {
      "id": "bench-aml-041",
      "name": "AML Subject 41",
      "nameAr": "عميل متابعة AML 41",
      "averageAmount": 10000,
      "transactionCount": 15,
      "usualCountries": [
        "Saudi Arabia",
        "UAE"
      ],
      "trustedBeneficiaries": [
        "Known Beneficiary"
      ],
      "usualHours": [
        8,
        20
      ],
      "priorRisk": false
    },
    "input": {
      "customerId": "bench-aml-041",
      "amount": 16100,
      "currency": "SAR",
      "destinationCountry": "High-risk jurisdiction",
      "beneficiaryName": "Regional Trader Entity #41",
      "transactionType": "Personal Transfer",
      "submittedAt": "2026-08-13T12:00:00.000Z"
    }
  },
  {
    "id": "BENCH-192",
    "category": "compound_aml",
    "titleEn": "Compound AML: High-risk corridor with unvetted recipient (16,200 SAR)",
    "titleAr": "مخاطر AML مركبة: ممر عالي المخاطر مع مستفيد غير مثبت (16,200 ر.س)",
    "descriptionEn": "High-risk jurisdiction, unexpected counterparty, and severe baseline deviation.",
    "descriptionAr": "ولاية عالية المخاطر ومستفيد غير معروف وانحراف حاد عن خط الأساس.",
    "expectedDecision": "Temporary Hold",
    "expectedRiskLevel": "High",
    "customer": {
      "id": "bench-aml-042",
      "name": "AML Subject 42",
      "nameAr": "عميل متابعة AML 42",
      "averageAmount": 10000,
      "transactionCount": 15,
      "usualCountries": [
        "Saudi Arabia",
        "UAE"
      ],
      "trustedBeneficiaries": [
        "Known Beneficiary"
      ],
      "usualHours": [
        8,
        20
      ],
      "priorRisk": false
    },
    "input": {
      "customerId": "bench-aml-042",
      "amount": 16200,
      "currency": "SAR",
      "destinationCountry": "High-risk jurisdiction",
      "beneficiaryName": "Regional Trader Entity #42",
      "transactionType": "Personal Transfer",
      "submittedAt": "2026-08-13T12:00:00.000Z"
    }
  },
  {
    "id": "BENCH-193",
    "category": "compound_aml",
    "titleEn": "Compound AML: High-risk corridor with unvetted recipient (16,300 SAR)",
    "titleAr": "مخاطر AML مركبة: ممر عالي المخاطر مع مستفيد غير مثبت (16,300 ر.س)",
    "descriptionEn": "High-risk jurisdiction, unexpected counterparty, and severe baseline deviation.",
    "descriptionAr": "ولاية عالية المخاطر ومستفيد غير معروف وانحراف حاد عن خط الأساس.",
    "expectedDecision": "Temporary Hold",
    "expectedRiskLevel": "High",
    "customer": {
      "id": "bench-aml-043",
      "name": "AML Subject 43",
      "nameAr": "عميل متابعة AML 43",
      "averageAmount": 10000,
      "transactionCount": 15,
      "usualCountries": [
        "Saudi Arabia",
        "UAE"
      ],
      "trustedBeneficiaries": [
        "Known Beneficiary"
      ],
      "usualHours": [
        8,
        20
      ],
      "priorRisk": false
    },
    "input": {
      "customerId": "bench-aml-043",
      "amount": 16300,
      "currency": "SAR",
      "destinationCountry": "High-risk jurisdiction",
      "beneficiaryName": "Regional Trader Entity #43",
      "transactionType": "Personal Transfer",
      "submittedAt": "2026-08-13T12:00:00.000Z"
    }
  },
  {
    "id": "BENCH-194",
    "category": "compound_aml",
    "titleEn": "Compound AML: High-risk corridor with unvetted recipient (16,400 SAR)",
    "titleAr": "مخاطر AML مركبة: ممر عالي المخاطر مع مستفيد غير مثبت (16,400 ر.س)",
    "descriptionEn": "High-risk jurisdiction, unexpected counterparty, and severe baseline deviation.",
    "descriptionAr": "ولاية عالية المخاطر ومستفيد غير معروف وانحراف حاد عن خط الأساس.",
    "expectedDecision": "Temporary Hold",
    "expectedRiskLevel": "High",
    "customer": {
      "id": "bench-aml-044",
      "name": "AML Subject 44",
      "nameAr": "عميل متابعة AML 44",
      "averageAmount": 10000,
      "transactionCount": 15,
      "usualCountries": [
        "Saudi Arabia",
        "UAE"
      ],
      "trustedBeneficiaries": [
        "Known Beneficiary"
      ],
      "usualHours": [
        8,
        20
      ],
      "priorRisk": false
    },
    "input": {
      "customerId": "bench-aml-044",
      "amount": 16400,
      "currency": "SAR",
      "destinationCountry": "High-risk jurisdiction",
      "beneficiaryName": "Regional Trader Entity #44",
      "transactionType": "Personal Transfer",
      "submittedAt": "2026-08-13T12:00:00.000Z"
    }
  },
  {
    "id": "BENCH-195",
    "category": "compound_aml",
    "titleEn": "Compound AML: High-risk corridor with unvetted recipient (16,500 SAR)",
    "titleAr": "مخاطر AML مركبة: ممر عالي المخاطر مع مستفيد غير مثبت (16,500 ر.س)",
    "descriptionEn": "High-risk jurisdiction, unexpected counterparty, and severe baseline deviation.",
    "descriptionAr": "ولاية عالية المخاطر ومستفيد غير معروف وانحراف حاد عن خط الأساس.",
    "expectedDecision": "Temporary Hold",
    "expectedRiskLevel": "High",
    "customer": {
      "id": "bench-aml-045",
      "name": "AML Subject 45",
      "nameAr": "عميل متابعة AML 45",
      "averageAmount": 10000,
      "transactionCount": 15,
      "usualCountries": [
        "Saudi Arabia",
        "UAE"
      ],
      "trustedBeneficiaries": [
        "Known Beneficiary"
      ],
      "usualHours": [
        8,
        20
      ],
      "priorRisk": false
    },
    "input": {
      "customerId": "bench-aml-045",
      "amount": 16500,
      "currency": "SAR",
      "destinationCountry": "High-risk jurisdiction",
      "beneficiaryName": "Regional Trader Entity #45",
      "transactionType": "Personal Transfer",
      "submittedAt": "2026-08-13T12:00:00.000Z"
    }
  },
  {
    "id": "BENCH-196",
    "category": "compound_aml",
    "titleEn": "Compound AML: High-risk corridor with unvetted recipient (16,600 SAR)",
    "titleAr": "مخاطر AML مركبة: ممر عالي المخاطر مع مستفيد غير مثبت (16,600 ر.س)",
    "descriptionEn": "High-risk jurisdiction, unexpected counterparty, and severe baseline deviation.",
    "descriptionAr": "ولاية عالية المخاطر ومستفيد غير معروف وانحراف حاد عن خط الأساس.",
    "expectedDecision": "Temporary Hold",
    "expectedRiskLevel": "High",
    "customer": {
      "id": "bench-aml-046",
      "name": "AML Subject 46",
      "nameAr": "عميل متابعة AML 46",
      "averageAmount": 10000,
      "transactionCount": 15,
      "usualCountries": [
        "Saudi Arabia",
        "UAE"
      ],
      "trustedBeneficiaries": [
        "Known Beneficiary"
      ],
      "usualHours": [
        8,
        20
      ],
      "priorRisk": false
    },
    "input": {
      "customerId": "bench-aml-046",
      "amount": 16600,
      "currency": "SAR",
      "destinationCountry": "High-risk jurisdiction",
      "beneficiaryName": "Regional Trader Entity #46",
      "transactionType": "Personal Transfer",
      "submittedAt": "2026-08-13T12:00:00.000Z"
    }
  },
  {
    "id": "BENCH-197",
    "category": "compound_aml",
    "titleEn": "Compound AML: High-risk corridor with unvetted recipient (16,700 SAR)",
    "titleAr": "مخاطر AML مركبة: ممر عالي المخاطر مع مستفيد غير مثبت (16,700 ر.س)",
    "descriptionEn": "High-risk jurisdiction, unexpected counterparty, and severe baseline deviation.",
    "descriptionAr": "ولاية عالية المخاطر ومستفيد غير معروف وانحراف حاد عن خط الأساس.",
    "expectedDecision": "Temporary Hold",
    "expectedRiskLevel": "High",
    "customer": {
      "id": "bench-aml-047",
      "name": "AML Subject 47",
      "nameAr": "عميل متابعة AML 47",
      "averageAmount": 10000,
      "transactionCount": 15,
      "usualCountries": [
        "Saudi Arabia",
        "UAE"
      ],
      "trustedBeneficiaries": [
        "Known Beneficiary"
      ],
      "usualHours": [
        8,
        20
      ],
      "priorRisk": false
    },
    "input": {
      "customerId": "bench-aml-047",
      "amount": 16700,
      "currency": "SAR",
      "destinationCountry": "High-risk jurisdiction",
      "beneficiaryName": "Regional Trader Entity #47",
      "transactionType": "Personal Transfer",
      "submittedAt": "2026-08-13T12:00:00.000Z"
    }
  },
  {
    "id": "BENCH-198",
    "category": "compound_aml",
    "titleEn": "Compound AML: High-risk corridor with unvetted recipient (16,800 SAR)",
    "titleAr": "مخاطر AML مركبة: ممر عالي المخاطر مع مستفيد غير مثبت (16,800 ر.س)",
    "descriptionEn": "High-risk jurisdiction, unexpected counterparty, and severe baseline deviation.",
    "descriptionAr": "ولاية عالية المخاطر ومستفيد غير معروف وانحراف حاد عن خط الأساس.",
    "expectedDecision": "Temporary Hold",
    "expectedRiskLevel": "High",
    "customer": {
      "id": "bench-aml-048",
      "name": "AML Subject 48",
      "nameAr": "عميل متابعة AML 48",
      "averageAmount": 10000,
      "transactionCount": 15,
      "usualCountries": [
        "Saudi Arabia",
        "UAE"
      ],
      "trustedBeneficiaries": [
        "Known Beneficiary"
      ],
      "usualHours": [
        8,
        20
      ],
      "priorRisk": false
    },
    "input": {
      "customerId": "bench-aml-048",
      "amount": 16800,
      "currency": "SAR",
      "destinationCountry": "High-risk jurisdiction",
      "beneficiaryName": "Regional Trader Entity #48",
      "transactionType": "Personal Transfer",
      "submittedAt": "2026-08-13T12:00:00.000Z"
    }
  },
  {
    "id": "BENCH-199",
    "category": "compound_aml",
    "titleEn": "Compound AML: High-risk corridor with unvetted recipient (16,900 SAR)",
    "titleAr": "مخاطر AML مركبة: ممر عالي المخاطر مع مستفيد غير مثبت (16,900 ر.س)",
    "descriptionEn": "High-risk jurisdiction, unexpected counterparty, and severe baseline deviation.",
    "descriptionAr": "ولاية عالية المخاطر ومستفيد غير معروف وانحراف حاد عن خط الأساس.",
    "expectedDecision": "Temporary Hold",
    "expectedRiskLevel": "High",
    "customer": {
      "id": "bench-aml-049",
      "name": "AML Subject 49",
      "nameAr": "عميل متابعة AML 49",
      "averageAmount": 10000,
      "transactionCount": 15,
      "usualCountries": [
        "Saudi Arabia",
        "UAE"
      ],
      "trustedBeneficiaries": [
        "Known Beneficiary"
      ],
      "usualHours": [
        8,
        20
      ],
      "priorRisk": false
    },
    "input": {
      "customerId": "bench-aml-049",
      "amount": 16900,
      "currency": "SAR",
      "destinationCountry": "High-risk jurisdiction",
      "beneficiaryName": "Regional Trader Entity #49",
      "transactionType": "Personal Transfer",
      "submittedAt": "2026-08-13T12:00:00.000Z"
    }
  },
  {
    "id": "BENCH-200",
    "category": "compound_aml",
    "titleEn": "Compound AML: High-risk corridor with unvetted recipient (17,000 SAR)",
    "titleAr": "مخاطر AML مركبة: ممر عالي المخاطر مع مستفيد غير مثبت (17,000 ر.س)",
    "descriptionEn": "High-risk jurisdiction, unexpected counterparty, and severe baseline deviation.",
    "descriptionAr": "ولاية عالية المخاطر ومستفيد غير معروف وانحراف حاد عن خط الأساس.",
    "expectedDecision": "Temporary Hold",
    "expectedRiskLevel": "High",
    "customer": {
      "id": "bench-aml-050",
      "name": "AML Subject 50",
      "nameAr": "عميل متابعة AML 50",
      "averageAmount": 10000,
      "transactionCount": 15,
      "usualCountries": [
        "Saudi Arabia",
        "UAE"
      ],
      "trustedBeneficiaries": [
        "Known Beneficiary"
      ],
      "usualHours": [
        8,
        20
      ],
      "priorRisk": false
    },
    "input": {
      "customerId": "bench-aml-050",
      "amount": 17000,
      "currency": "SAR",
      "destinationCountry": "High-risk jurisdiction",
      "beneficiaryName": "Regional Trader Entity #50",
      "transactionType": "Personal Transfer",
      "submittedAt": "2026-08-13T12:00:00.000Z"
    }
  },
  {
    "id": "BENCH-201",
    "category": "policy_boundary",
    "titleEn": "Boundary sub-threshold: Amount ratio 1.90x (below 2.0x deviation)",
    "titleAr": "حالة حدودية تحت العتبة: نسبة المبلغ 1.90× (أقل من عتبة الانحراف 2.0×)",
    "descriptionEn": "Amount just beneath the 2.0x deviation threshold with trusted beneficiary.",
    "descriptionAr": "مبلغ يقع تحت عتبة انحراف 2.0× مباشرة مع مستفيد معتاد.",
    "expectedDecision": "Approve",
    "expectedRiskLevel": "Low",
    "customer": {
      "id": "bench-bnd-001",
      "name": "Boundary Subject 1",
      "nameAr": "عميل فحص الحدود 1",
      "averageAmount": 3000,
      "transactionCount": 20,
      "usualCountries": [
        "Saudi Arabia",
        "Philippines",
        "UAE"
      ],
      "trustedBeneficiaries": [
        "Sara Al-Mutairi"
      ],
      "usualHours": [
        8,
        20
      ],
      "priorRisk": false
    },
    "input": {
      "customerId": "bench-bnd-001",
      "amount": 5700,
      "currency": "SAR",
      "destinationCountry": "Saudi Arabia",
      "beneficiaryName": "Sara Al-Mutairi",
      "transactionType": "Local Transfer",
      "submittedAt": "2026-08-13T12:00:00.000Z"
    }
  },
  {
    "id": "BENCH-202",
    "category": "policy_boundary",
    "titleEn": "Boundary sub-threshold: Amount ratio 1.90x (below 2.0x deviation)",
    "titleAr": "حالة حدودية تحت العتبة: نسبة المبلغ 1.90× (أقل من عتبة الانحراف 2.0×)",
    "descriptionEn": "Amount just beneath the 2.0x deviation threshold with trusted beneficiary.",
    "descriptionAr": "مبلغ يقع تحت عتبة انحراف 2.0× مباشرة مع مستفيد معتاد.",
    "expectedDecision": "Approve",
    "expectedRiskLevel": "Low",
    "customer": {
      "id": "bench-bnd-002",
      "name": "Boundary Subject 2",
      "nameAr": "عميل فحص الحدود 2",
      "averageAmount": 3000,
      "transactionCount": 20,
      "usualCountries": [
        "Saudi Arabia",
        "Philippines",
        "UAE"
      ],
      "trustedBeneficiaries": [
        "Sara Al-Mutairi"
      ],
      "usualHours": [
        8,
        20
      ],
      "priorRisk": false
    },
    "input": {
      "customerId": "bench-bnd-002",
      "amount": 5700,
      "currency": "SAR",
      "destinationCountry": "Saudi Arabia",
      "beneficiaryName": "Sara Al-Mutairi",
      "transactionType": "Local Transfer",
      "submittedAt": "2026-08-13T12:00:00.000Z"
    }
  },
  {
    "id": "BENCH-203",
    "category": "policy_boundary",
    "titleEn": "Boundary sub-threshold: Amount ratio 1.90x (below 2.0x deviation)",
    "titleAr": "حالة حدودية تحت العتبة: نسبة المبلغ 1.90× (أقل من عتبة الانحراف 2.0×)",
    "descriptionEn": "Amount just beneath the 2.0x deviation threshold with trusted beneficiary.",
    "descriptionAr": "مبلغ يقع تحت عتبة انحراف 2.0× مباشرة مع مستفيد معتاد.",
    "expectedDecision": "Approve",
    "expectedRiskLevel": "Low",
    "customer": {
      "id": "bench-bnd-003",
      "name": "Boundary Subject 3",
      "nameAr": "عميل فحص الحدود 3",
      "averageAmount": 3000,
      "transactionCount": 20,
      "usualCountries": [
        "Saudi Arabia",
        "Philippines",
        "UAE"
      ],
      "trustedBeneficiaries": [
        "Sara Al-Mutairi"
      ],
      "usualHours": [
        8,
        20
      ],
      "priorRisk": false
    },
    "input": {
      "customerId": "bench-bnd-003",
      "amount": 5700,
      "currency": "SAR",
      "destinationCountry": "Saudi Arabia",
      "beneficiaryName": "Sara Al-Mutairi",
      "transactionType": "Local Transfer",
      "submittedAt": "2026-08-13T12:00:00.000Z"
    }
  },
  {
    "id": "BENCH-204",
    "category": "policy_boundary",
    "titleEn": "Boundary sub-threshold: Amount ratio 1.90x (below 2.0x deviation)",
    "titleAr": "حالة حدودية تحت العتبة: نسبة المبلغ 1.90× (أقل من عتبة الانحراف 2.0×)",
    "descriptionEn": "Amount just beneath the 2.0x deviation threshold with trusted beneficiary.",
    "descriptionAr": "مبلغ يقع تحت عتبة انحراف 2.0× مباشرة مع مستفيد معتاد.",
    "expectedDecision": "Approve",
    "expectedRiskLevel": "Low",
    "customer": {
      "id": "bench-bnd-004",
      "name": "Boundary Subject 4",
      "nameAr": "عميل فحص الحدود 4",
      "averageAmount": 3000,
      "transactionCount": 20,
      "usualCountries": [
        "Saudi Arabia",
        "Philippines",
        "UAE"
      ],
      "trustedBeneficiaries": [
        "Sara Al-Mutairi"
      ],
      "usualHours": [
        8,
        20
      ],
      "priorRisk": false
    },
    "input": {
      "customerId": "bench-bnd-004",
      "amount": 5700,
      "currency": "SAR",
      "destinationCountry": "Saudi Arabia",
      "beneficiaryName": "Sara Al-Mutairi",
      "transactionType": "Local Transfer",
      "submittedAt": "2026-08-13T12:00:00.000Z"
    }
  },
  {
    "id": "BENCH-205",
    "category": "policy_boundary",
    "titleEn": "Boundary sub-threshold: Amount ratio 1.90x (below 2.0x deviation)",
    "titleAr": "حالة حدودية تحت العتبة: نسبة المبلغ 1.90× (أقل من عتبة الانحراف 2.0×)",
    "descriptionEn": "Amount just beneath the 2.0x deviation threshold with trusted beneficiary.",
    "descriptionAr": "مبلغ يقع تحت عتبة انحراف 2.0× مباشرة مع مستفيد معتاد.",
    "expectedDecision": "Approve",
    "expectedRiskLevel": "Low",
    "customer": {
      "id": "bench-bnd-005",
      "name": "Boundary Subject 5",
      "nameAr": "عميل فحص الحدود 5",
      "averageAmount": 3000,
      "transactionCount": 20,
      "usualCountries": [
        "Saudi Arabia",
        "Philippines",
        "UAE"
      ],
      "trustedBeneficiaries": [
        "Sara Al-Mutairi"
      ],
      "usualHours": [
        8,
        20
      ],
      "priorRisk": false
    },
    "input": {
      "customerId": "bench-bnd-005",
      "amount": 5700,
      "currency": "SAR",
      "destinationCountry": "Saudi Arabia",
      "beneficiaryName": "Sara Al-Mutairi",
      "transactionType": "Local Transfer",
      "submittedAt": "2026-08-13T12:00:00.000Z"
    }
  },
  {
    "id": "BENCH-206",
    "category": "policy_boundary",
    "titleEn": "Boundary step-up: Amount ratio 2.10x + new beneficiary (score 35)",
    "titleAr": "حالة حدودية فوق العتبة: نسبة المبلغ 2.10× مع مستفيد جديد (درجة 35)",
    "descriptionEn": "Amount slightly exceeds 2.0x deviation paired with an unestablished counterparty.",
    "descriptionAr": "مبلغ يتجاوز عتبة 2.0× مع مستفيد غير مسجل سابقًا.",
    "expectedDecision": "Additional Verification",
    "expectedRiskLevel": "Medium",
    "customer": {
      "id": "bench-bnd-006",
      "name": "Boundary Subject 6",
      "nameAr": "عميل فحص الحدود 6",
      "averageAmount": 3000,
      "transactionCount": 20,
      "usualCountries": [
        "Saudi Arabia",
        "Philippines",
        "UAE"
      ],
      "trustedBeneficiaries": [
        "Old Vendor"
      ],
      "usualHours": [
        8,
        20
      ],
      "priorRisk": false
    },
    "input": {
      "customerId": "bench-bnd-006",
      "amount": 6300,
      "currency": "SAR",
      "destinationCountry": "Saudi Arabia",
      "beneficiaryName": "New Vendor 6",
      "transactionType": "Local Transfer",
      "submittedAt": "2026-08-13T12:00:00.000Z"
    }
  },
  {
    "id": "BENCH-207",
    "category": "policy_boundary",
    "titleEn": "Boundary step-up: Amount ratio 2.10x + new beneficiary (score 35)",
    "titleAr": "حالة حدودية فوق العتبة: نسبة المبلغ 2.10× مع مستفيد جديد (درجة 35)",
    "descriptionEn": "Amount slightly exceeds 2.0x deviation paired with an unestablished counterparty.",
    "descriptionAr": "مبلغ يتجاوز عتبة 2.0× مع مستفيد غير مسجل سابقًا.",
    "expectedDecision": "Additional Verification",
    "expectedRiskLevel": "Medium",
    "customer": {
      "id": "bench-bnd-007",
      "name": "Boundary Subject 7",
      "nameAr": "عميل فحص الحدود 7",
      "averageAmount": 3000,
      "transactionCount": 20,
      "usualCountries": [
        "Saudi Arabia",
        "Philippines",
        "UAE"
      ],
      "trustedBeneficiaries": [
        "Old Vendor"
      ],
      "usualHours": [
        8,
        20
      ],
      "priorRisk": false
    },
    "input": {
      "customerId": "bench-bnd-007",
      "amount": 6300,
      "currency": "SAR",
      "destinationCountry": "Saudi Arabia",
      "beneficiaryName": "New Vendor 7",
      "transactionType": "Local Transfer",
      "submittedAt": "2026-08-13T12:00:00.000Z"
    }
  },
  {
    "id": "BENCH-208",
    "category": "policy_boundary",
    "titleEn": "Boundary step-up: Amount ratio 2.10x + new beneficiary (score 35)",
    "titleAr": "حالة حدودية فوق العتبة: نسبة المبلغ 2.10× مع مستفيد جديد (درجة 35)",
    "descriptionEn": "Amount slightly exceeds 2.0x deviation paired with an unestablished counterparty.",
    "descriptionAr": "مبلغ يتجاوز عتبة 2.0× مع مستفيد غير مسجل سابقًا.",
    "expectedDecision": "Additional Verification",
    "expectedRiskLevel": "Medium",
    "customer": {
      "id": "bench-bnd-008",
      "name": "Boundary Subject 8",
      "nameAr": "عميل فحص الحدود 8",
      "averageAmount": 3000,
      "transactionCount": 20,
      "usualCountries": [
        "Saudi Arabia",
        "Philippines",
        "UAE"
      ],
      "trustedBeneficiaries": [
        "Old Vendor"
      ],
      "usualHours": [
        8,
        20
      ],
      "priorRisk": false
    },
    "input": {
      "customerId": "bench-bnd-008",
      "amount": 6300,
      "currency": "SAR",
      "destinationCountry": "Saudi Arabia",
      "beneficiaryName": "New Vendor 8",
      "transactionType": "Local Transfer",
      "submittedAt": "2026-08-13T12:00:00.000Z"
    }
  },
  {
    "id": "BENCH-209",
    "category": "policy_boundary",
    "titleEn": "Boundary step-up: Amount ratio 2.10x + new beneficiary (score 35)",
    "titleAr": "حالة حدودية فوق العتبة: نسبة المبلغ 2.10× مع مستفيد جديد (درجة 35)",
    "descriptionEn": "Amount slightly exceeds 2.0x deviation paired with an unestablished counterparty.",
    "descriptionAr": "مبلغ يتجاوز عتبة 2.0× مع مستفيد غير مسجل سابقًا.",
    "expectedDecision": "Additional Verification",
    "expectedRiskLevel": "Medium",
    "customer": {
      "id": "bench-bnd-009",
      "name": "Boundary Subject 9",
      "nameAr": "عميل فحص الحدود 9",
      "averageAmount": 3000,
      "transactionCount": 20,
      "usualCountries": [
        "Saudi Arabia",
        "Philippines",
        "UAE"
      ],
      "trustedBeneficiaries": [
        "Old Vendor"
      ],
      "usualHours": [
        8,
        20
      ],
      "priorRisk": false
    },
    "input": {
      "customerId": "bench-bnd-009",
      "amount": 6300,
      "currency": "SAR",
      "destinationCountry": "Saudi Arabia",
      "beneficiaryName": "New Vendor 9",
      "transactionType": "Local Transfer",
      "submittedAt": "2026-08-13T12:00:00.000Z"
    }
  },
  {
    "id": "BENCH-210",
    "category": "policy_boundary",
    "titleEn": "Boundary step-up: Amount ratio 2.10x + new beneficiary (score 35)",
    "titleAr": "حالة حدودية فوق العتبة: نسبة المبلغ 2.10× مع مستفيد جديد (درجة 35)",
    "descriptionEn": "Amount slightly exceeds 2.0x deviation paired with an unestablished counterparty.",
    "descriptionAr": "مبلغ يتجاوز عتبة 2.0× مع مستفيد غير مسجل سابقًا.",
    "expectedDecision": "Additional Verification",
    "expectedRiskLevel": "Medium",
    "customer": {
      "id": "bench-bnd-010",
      "name": "Boundary Subject 10",
      "nameAr": "عميل فحص الحدود 10",
      "averageAmount": 3000,
      "transactionCount": 20,
      "usualCountries": [
        "Saudi Arabia",
        "Philippines",
        "UAE"
      ],
      "trustedBeneficiaries": [
        "Old Vendor"
      ],
      "usualHours": [
        8,
        20
      ],
      "priorRisk": false
    },
    "input": {
      "customerId": "bench-bnd-010",
      "amount": 6300,
      "currency": "SAR",
      "destinationCountry": "Saudi Arabia",
      "beneficiaryName": "New Vendor 10",
      "transactionType": "Local Transfer",
      "submittedAt": "2026-08-13T12:00:00.000Z"
    }
  },
  {
    "id": "BENCH-211",
    "category": "policy_boundary",
    "titleEn": "Boundary sub-threshold: Cross-border transfer 4,900 SAR (below 5,000 SAR)",
    "titleAr": "حالة حدودية تحت العتبة: تحويل دولي 4,900 ر.س (تحت حد 5,000 ر.س)",
    "descriptionEn": "International transfer just under the 5,000 SAR threshold to usual country.",
    "descriptionAr": "تحويل دولي يقع تحت حد 5,000 ريال مباشرة للبلد المعتاد.",
    "expectedDecision": "Approve",
    "expectedRiskLevel": "Low",
    "customer": {
      "id": "bench-bnd-011",
      "name": "Boundary Subject 11",
      "nameAr": "عميل فحص الحدود 11",
      "averageAmount": 3000,
      "transactionCount": 20,
      "usualCountries": [
        "Saudi Arabia",
        "Philippines",
        "UAE"
      ],
      "trustedBeneficiaries": [
        "Maria Santos"
      ],
      "usualHours": [
        8,
        20
      ],
      "priorRisk": false
    },
    "input": {
      "customerId": "bench-bnd-011",
      "amount": 4900,
      "currency": "SAR",
      "destinationCountry": "Philippines",
      "beneficiaryName": "Maria Santos",
      "transactionType": "International Transfer",
      "submittedAt": "2026-08-13T12:00:00.000Z"
    }
  },
  {
    "id": "BENCH-212",
    "category": "policy_boundary",
    "titleEn": "Boundary sub-threshold: Cross-border transfer 4,900 SAR (below 5,000 SAR)",
    "titleAr": "حالة حدودية تحت العتبة: تحويل دولي 4,900 ر.س (تحت حد 5,000 ر.س)",
    "descriptionEn": "International transfer just under the 5,000 SAR threshold to usual country.",
    "descriptionAr": "تحويل دولي يقع تحت حد 5,000 ريال مباشرة للبلد المعتاد.",
    "expectedDecision": "Approve",
    "expectedRiskLevel": "Low",
    "customer": {
      "id": "bench-bnd-012",
      "name": "Boundary Subject 12",
      "nameAr": "عميل فحص الحدود 12",
      "averageAmount": 3000,
      "transactionCount": 20,
      "usualCountries": [
        "Saudi Arabia",
        "Philippines",
        "UAE"
      ],
      "trustedBeneficiaries": [
        "Maria Santos"
      ],
      "usualHours": [
        8,
        20
      ],
      "priorRisk": false
    },
    "input": {
      "customerId": "bench-bnd-012",
      "amount": 4900,
      "currency": "SAR",
      "destinationCountry": "Philippines",
      "beneficiaryName": "Maria Santos",
      "transactionType": "International Transfer",
      "submittedAt": "2026-08-13T12:00:00.000Z"
    }
  },
  {
    "id": "BENCH-213",
    "category": "policy_boundary",
    "titleEn": "Boundary sub-threshold: Cross-border transfer 4,900 SAR (below 5,000 SAR)",
    "titleAr": "حالة حدودية تحت العتبة: تحويل دولي 4,900 ر.س (تحت حد 5,000 ر.س)",
    "descriptionEn": "International transfer just under the 5,000 SAR threshold to usual country.",
    "descriptionAr": "تحويل دولي يقع تحت حد 5,000 ريال مباشرة للبلد المعتاد.",
    "expectedDecision": "Approve",
    "expectedRiskLevel": "Low",
    "customer": {
      "id": "bench-bnd-013",
      "name": "Boundary Subject 13",
      "nameAr": "عميل فحص الحدود 13",
      "averageAmount": 3000,
      "transactionCount": 20,
      "usualCountries": [
        "Saudi Arabia",
        "Philippines",
        "UAE"
      ],
      "trustedBeneficiaries": [
        "Maria Santos"
      ],
      "usualHours": [
        8,
        20
      ],
      "priorRisk": false
    },
    "input": {
      "customerId": "bench-bnd-013",
      "amount": 4900,
      "currency": "SAR",
      "destinationCountry": "Philippines",
      "beneficiaryName": "Maria Santos",
      "transactionType": "International Transfer",
      "submittedAt": "2026-08-13T12:00:00.000Z"
    }
  },
  {
    "id": "BENCH-214",
    "category": "policy_boundary",
    "titleEn": "Boundary sub-threshold: Cross-border transfer 4,900 SAR (below 5,000 SAR)",
    "titleAr": "حالة حدودية تحت العتبة: تحويل دولي 4,900 ر.س (تحت حد 5,000 ر.س)",
    "descriptionEn": "International transfer just under the 5,000 SAR threshold to usual country.",
    "descriptionAr": "تحويل دولي يقع تحت حد 5,000 ريال مباشرة للبلد المعتاد.",
    "expectedDecision": "Approve",
    "expectedRiskLevel": "Low",
    "customer": {
      "id": "bench-bnd-014",
      "name": "Boundary Subject 14",
      "nameAr": "عميل فحص الحدود 14",
      "averageAmount": 3000,
      "transactionCount": 20,
      "usualCountries": [
        "Saudi Arabia",
        "Philippines",
        "UAE"
      ],
      "trustedBeneficiaries": [
        "Maria Santos"
      ],
      "usualHours": [
        8,
        20
      ],
      "priorRisk": false
    },
    "input": {
      "customerId": "bench-bnd-014",
      "amount": 4900,
      "currency": "SAR",
      "destinationCountry": "Philippines",
      "beneficiaryName": "Maria Santos",
      "transactionType": "International Transfer",
      "submittedAt": "2026-08-13T12:00:00.000Z"
    }
  },
  {
    "id": "BENCH-215",
    "category": "policy_boundary",
    "titleEn": "Boundary sub-threshold: Cross-border transfer 4,900 SAR (below 5,000 SAR)",
    "titleAr": "حالة حدودية تحت العتبة: تحويل دولي 4,900 ر.س (تحت حد 5,000 ر.س)",
    "descriptionEn": "International transfer just under the 5,000 SAR threshold to usual country.",
    "descriptionAr": "تحويل دولي يقع تحت حد 5,000 ريال مباشرة للبلد المعتاد.",
    "expectedDecision": "Approve",
    "expectedRiskLevel": "Low",
    "customer": {
      "id": "bench-bnd-015",
      "name": "Boundary Subject 15",
      "nameAr": "عميل فحص الحدود 15",
      "averageAmount": 3000,
      "transactionCount": 20,
      "usualCountries": [
        "Saudi Arabia",
        "Philippines",
        "UAE"
      ],
      "trustedBeneficiaries": [
        "Maria Santos"
      ],
      "usualHours": [
        8,
        20
      ],
      "priorRisk": false
    },
    "input": {
      "customerId": "bench-bnd-015",
      "amount": 4900,
      "currency": "SAR",
      "destinationCountry": "Philippines",
      "beneficiaryName": "Maria Santos",
      "transactionType": "International Transfer",
      "submittedAt": "2026-08-13T12:00:00.000Z"
    }
  },
  {
    "id": "BENCH-216",
    "category": "policy_boundary",
    "titleEn": "Boundary trigger: Cross-border transfer 5,100 SAR (exceeds 5,000 SAR)",
    "titleAr": "حالة حدودية مفعلة: تحويل دولي 5,100 ر.س (يتجاوز حد 5,000 ر.س)",
    "descriptionEn": "Cross-border transfer crossing the 5,000 SAR policy trigger.",
    "descriptionAr": "تحويل دولي يتجاوز حد السياسة البالغ 5,000 ريال مباشرة.",
    "expectedDecision": "Additional Verification",
    "expectedRiskLevel": "Medium",
    "customer": {
      "id": "bench-bnd-016",
      "name": "Boundary Subject 16",
      "nameAr": "عميل فحص الحدود 16",
      "averageAmount": 3000,
      "transactionCount": 20,
      "usualCountries": [
        "Saudi Arabia",
        "Philippines",
        "UAE"
      ],
      "trustedBeneficiaries": [
        "Maria Santos"
      ],
      "usualHours": [
        8,
        20
      ],
      "priorRisk": false
    },
    "input": {
      "customerId": "bench-bnd-016",
      "amount": 5100,
      "currency": "SAR",
      "destinationCountry": "Philippines",
      "beneficiaryName": "Maria Santos",
      "transactionType": "International Transfer",
      "submittedAt": "2026-08-13T12:00:00.000Z"
    }
  },
  {
    "id": "BENCH-217",
    "category": "policy_boundary",
    "titleEn": "Boundary trigger: Cross-border transfer 5,100 SAR (exceeds 5,000 SAR)",
    "titleAr": "حالة حدودية مفعلة: تحويل دولي 5,100 ر.س (يتجاوز حد 5,000 ر.س)",
    "descriptionEn": "Cross-border transfer crossing the 5,000 SAR policy trigger.",
    "descriptionAr": "تحويل دولي يتجاوز حد السياسة البالغ 5,000 ريال مباشرة.",
    "expectedDecision": "Additional Verification",
    "expectedRiskLevel": "Medium",
    "customer": {
      "id": "bench-bnd-017",
      "name": "Boundary Subject 17",
      "nameAr": "عميل فحص الحدود 17",
      "averageAmount": 3000,
      "transactionCount": 20,
      "usualCountries": [
        "Saudi Arabia",
        "Philippines",
        "UAE"
      ],
      "trustedBeneficiaries": [
        "Maria Santos"
      ],
      "usualHours": [
        8,
        20
      ],
      "priorRisk": false
    },
    "input": {
      "customerId": "bench-bnd-017",
      "amount": 5100,
      "currency": "SAR",
      "destinationCountry": "Philippines",
      "beneficiaryName": "Maria Santos",
      "transactionType": "International Transfer",
      "submittedAt": "2026-08-13T12:00:00.000Z"
    }
  },
  {
    "id": "BENCH-218",
    "category": "policy_boundary",
    "titleEn": "Boundary trigger: Cross-border transfer 5,100 SAR (exceeds 5,000 SAR)",
    "titleAr": "حالة حدودية مفعلة: تحويل دولي 5,100 ر.س (يتجاوز حد 5,000 ر.س)",
    "descriptionEn": "Cross-border transfer crossing the 5,000 SAR policy trigger.",
    "descriptionAr": "تحويل دولي يتجاوز حد السياسة البالغ 5,000 ريال مباشرة.",
    "expectedDecision": "Additional Verification",
    "expectedRiskLevel": "Medium",
    "customer": {
      "id": "bench-bnd-018",
      "name": "Boundary Subject 18",
      "nameAr": "عميل فحص الحدود 18",
      "averageAmount": 3000,
      "transactionCount": 20,
      "usualCountries": [
        "Saudi Arabia",
        "Philippines",
        "UAE"
      ],
      "trustedBeneficiaries": [
        "Maria Santos"
      ],
      "usualHours": [
        8,
        20
      ],
      "priorRisk": false
    },
    "input": {
      "customerId": "bench-bnd-018",
      "amount": 5100,
      "currency": "SAR",
      "destinationCountry": "Philippines",
      "beneficiaryName": "Maria Santos",
      "transactionType": "International Transfer",
      "submittedAt": "2026-08-13T12:00:00.000Z"
    }
  },
  {
    "id": "BENCH-219",
    "category": "policy_boundary",
    "titleEn": "Boundary trigger: Cross-border transfer 5,100 SAR (exceeds 5,000 SAR)",
    "titleAr": "حالة حدودية مفعلة: تحويل دولي 5,100 ر.س (يتجاوز حد 5,000 ر.س)",
    "descriptionEn": "Cross-border transfer crossing the 5,000 SAR policy trigger.",
    "descriptionAr": "تحويل دولي يتجاوز حد السياسة البالغ 5,000 ريال مباشرة.",
    "expectedDecision": "Additional Verification",
    "expectedRiskLevel": "Medium",
    "customer": {
      "id": "bench-bnd-019",
      "name": "Boundary Subject 19",
      "nameAr": "عميل فحص الحدود 19",
      "averageAmount": 3000,
      "transactionCount": 20,
      "usualCountries": [
        "Saudi Arabia",
        "Philippines",
        "UAE"
      ],
      "trustedBeneficiaries": [
        "Maria Santos"
      ],
      "usualHours": [
        8,
        20
      ],
      "priorRisk": false
    },
    "input": {
      "customerId": "bench-bnd-019",
      "amount": 5100,
      "currency": "SAR",
      "destinationCountry": "Philippines",
      "beneficiaryName": "Maria Santos",
      "transactionType": "International Transfer",
      "submittedAt": "2026-08-13T12:00:00.000Z"
    }
  },
  {
    "id": "BENCH-220",
    "category": "policy_boundary",
    "titleEn": "Boundary trigger: Cross-border transfer 5,100 SAR (exceeds 5,000 SAR)",
    "titleAr": "حالة حدودية مفعلة: تحويل دولي 5,100 ر.س (يتجاوز حد 5,000 ر.س)",
    "descriptionEn": "Cross-border transfer crossing the 5,000 SAR policy trigger.",
    "descriptionAr": "تحويل دولي يتجاوز حد السياسة البالغ 5,000 ريال مباشرة.",
    "expectedDecision": "Additional Verification",
    "expectedRiskLevel": "Medium",
    "customer": {
      "id": "bench-bnd-020",
      "name": "Boundary Subject 20",
      "nameAr": "عميل فحص الحدود 20",
      "averageAmount": 3000,
      "transactionCount": 20,
      "usualCountries": [
        "Saudi Arabia",
        "Philippines",
        "UAE"
      ],
      "trustedBeneficiaries": [
        "Maria Santos"
      ],
      "usualHours": [
        8,
        20
      ],
      "priorRisk": false
    },
    "input": {
      "customerId": "bench-bnd-020",
      "amount": 5100,
      "currency": "SAR",
      "destinationCountry": "Philippines",
      "beneficiaryName": "Maria Santos",
      "transactionType": "International Transfer",
      "submittedAt": "2026-08-13T12:00:00.000Z"
    }
  },
  {
    "id": "BENCH-221",
    "category": "policy_boundary",
    "titleEn": "Score safety floor: 30 points (prior risk + new beneficiary, sub-31)",
    "titleAr": "حد أمان الدرجة: 30 نقطة (سوابق + مستفيد جديد، أقل من 31)",
    "descriptionEn": "Composite rule points total exactly 30, staying within the standard tier.",
    "descriptionAr": "مجموع نقاط القواعد يصل إلى 30 نقطة تمامًا، ويبقى ضمن فئة الموافقة.",
    "expectedDecision": "Approve",
    "expectedRiskLevel": "Low",
    "customer": {
      "id": "bench-bnd-021",
      "name": "Boundary Subject 21",
      "nameAr": "عميل فحص الحدود 21",
      "averageAmount": 5000,
      "transactionCount": 20,
      "usualCountries": [
        "Saudi Arabia",
        "Philippines",
        "UAE"
      ],
      "trustedBeneficiaries": [
        "Existing Beneficiary"
      ],
      "usualHours": [
        8,
        20
      ],
      "priorRisk": true
    },
    "input": {
      "customerId": "bench-bnd-021",
      "amount": 2000,
      "currency": "SAR",
      "destinationCountry": "Saudi Arabia",
      "beneficiaryName": "New Individual 21",
      "transactionType": "Local Transfer",
      "submittedAt": "2026-08-13T12:00:00.000Z"
    }
  },
  {
    "id": "BENCH-222",
    "category": "policy_boundary",
    "titleEn": "Score safety floor: 30 points (prior risk + new beneficiary, sub-31)",
    "titleAr": "حد أمان الدرجة: 30 نقطة (سوابق + مستفيد جديد، أقل من 31)",
    "descriptionEn": "Composite rule points total exactly 30, staying within the standard tier.",
    "descriptionAr": "مجموع نقاط القواعد يصل إلى 30 نقطة تمامًا، ويبقى ضمن فئة الموافقة.",
    "expectedDecision": "Approve",
    "expectedRiskLevel": "Low",
    "customer": {
      "id": "bench-bnd-022",
      "name": "Boundary Subject 22",
      "nameAr": "عميل فحص الحدود 22",
      "averageAmount": 5000,
      "transactionCount": 20,
      "usualCountries": [
        "Saudi Arabia",
        "Philippines",
        "UAE"
      ],
      "trustedBeneficiaries": [
        "Existing Beneficiary"
      ],
      "usualHours": [
        8,
        20
      ],
      "priorRisk": true
    },
    "input": {
      "customerId": "bench-bnd-022",
      "amount": 2000,
      "currency": "SAR",
      "destinationCountry": "Saudi Arabia",
      "beneficiaryName": "New Individual 22",
      "transactionType": "Local Transfer",
      "submittedAt": "2026-08-13T12:00:00.000Z"
    }
  },
  {
    "id": "BENCH-223",
    "category": "policy_boundary",
    "titleEn": "Score safety floor: 30 points (prior risk + new beneficiary, sub-31)",
    "titleAr": "حد أمان الدرجة: 30 نقطة (سوابق + مستفيد جديد، أقل من 31)",
    "descriptionEn": "Composite rule points total exactly 30, staying within the standard tier.",
    "descriptionAr": "مجموع نقاط القواعد يصل إلى 30 نقطة تمامًا، ويبقى ضمن فئة الموافقة.",
    "expectedDecision": "Approve",
    "expectedRiskLevel": "Low",
    "customer": {
      "id": "bench-bnd-023",
      "name": "Boundary Subject 23",
      "nameAr": "عميل فحص الحدود 23",
      "averageAmount": 5000,
      "transactionCount": 20,
      "usualCountries": [
        "Saudi Arabia",
        "Philippines",
        "UAE"
      ],
      "trustedBeneficiaries": [
        "Existing Beneficiary"
      ],
      "usualHours": [
        8,
        20
      ],
      "priorRisk": true
    },
    "input": {
      "customerId": "bench-bnd-023",
      "amount": 2000,
      "currency": "SAR",
      "destinationCountry": "Saudi Arabia",
      "beneficiaryName": "New Individual 23",
      "transactionType": "Local Transfer",
      "submittedAt": "2026-08-13T12:00:00.000Z"
    }
  },
  {
    "id": "BENCH-224",
    "category": "policy_boundary",
    "titleEn": "Score safety floor: 30 points (prior risk + new beneficiary, sub-31)",
    "titleAr": "حد أمان الدرجة: 30 نقطة (سوابق + مستفيد جديد، أقل من 31)",
    "descriptionEn": "Composite rule points total exactly 30, staying within the standard tier.",
    "descriptionAr": "مجموع نقاط القواعد يصل إلى 30 نقطة تمامًا، ويبقى ضمن فئة الموافقة.",
    "expectedDecision": "Approve",
    "expectedRiskLevel": "Low",
    "customer": {
      "id": "bench-bnd-024",
      "name": "Boundary Subject 24",
      "nameAr": "عميل فحص الحدود 24",
      "averageAmount": 5000,
      "transactionCount": 20,
      "usualCountries": [
        "Saudi Arabia",
        "Philippines",
        "UAE"
      ],
      "trustedBeneficiaries": [
        "Existing Beneficiary"
      ],
      "usualHours": [
        8,
        20
      ],
      "priorRisk": true
    },
    "input": {
      "customerId": "bench-bnd-024",
      "amount": 2000,
      "currency": "SAR",
      "destinationCountry": "Saudi Arabia",
      "beneficiaryName": "New Individual 24",
      "transactionType": "Local Transfer",
      "submittedAt": "2026-08-13T12:00:00.000Z"
    }
  },
  {
    "id": "BENCH-225",
    "category": "policy_boundary",
    "titleEn": "Score safety floor: 30 points (prior risk + new beneficiary, sub-31)",
    "titleAr": "حد أمان الدرجة: 30 نقطة (سوابق + مستفيد جديد، أقل من 31)",
    "descriptionEn": "Composite rule points total exactly 30, staying within the standard tier.",
    "descriptionAr": "مجموع نقاط القواعد يصل إلى 30 نقطة تمامًا، ويبقى ضمن فئة الموافقة.",
    "expectedDecision": "Approve",
    "expectedRiskLevel": "Low",
    "customer": {
      "id": "bench-bnd-025",
      "name": "Boundary Subject 25",
      "nameAr": "عميل فحص الحدود 25",
      "averageAmount": 5000,
      "transactionCount": 20,
      "usualCountries": [
        "Saudi Arabia",
        "Philippines",
        "UAE"
      ],
      "trustedBeneficiaries": [
        "Existing Beneficiary"
      ],
      "usualHours": [
        8,
        20
      ],
      "priorRisk": true
    },
    "input": {
      "customerId": "bench-bnd-025",
      "amount": 2000,
      "currency": "SAR",
      "destinationCountry": "Saudi Arabia",
      "beneficiaryName": "New Individual 25",
      "transactionType": "Local Transfer",
      "submittedAt": "2026-08-13T12:00:00.000Z"
    }
  },
  {
    "id": "BENCH-226",
    "category": "policy_boundary",
    "titleEn": "Score trigger: 35 points (cross-border threshold, tier shift to Additional Verification)",
    "titleAr": "تفعيل الدرجة: 35 نقطة (حد التحويل الدولي، انتقال إلى تحقق إضافي)",
    "descriptionEn": "Single factor reaches 35 points, shifting tier to Additional Verification.",
    "descriptionAr": "عامل واحد يصل إلى 35 نقطة وينقل الفئة إلى تحقق إضافي.",
    "expectedDecision": "Additional Verification",
    "expectedRiskLevel": "Medium",
    "customer": {
      "id": "bench-bnd-026",
      "name": "Boundary Subject 26",
      "nameAr": "عميل فحص الحدود 26",
      "averageAmount": 5000,
      "transactionCount": 20,
      "usualCountries": [
        "Saudi Arabia",
        "Philippines",
        "UAE"
      ],
      "trustedBeneficiaries": [
        "Maria Santos"
      ],
      "usualHours": [
        8,
        20
      ],
      "priorRisk": false
    },
    "input": {
      "customerId": "bench-bnd-026",
      "amount": 5200,
      "currency": "SAR",
      "destinationCountry": "UAE",
      "beneficiaryName": "Maria Santos",
      "transactionType": "International Transfer",
      "submittedAt": "2026-08-13T12:00:00.000Z"
    }
  },
  {
    "id": "BENCH-227",
    "category": "policy_boundary",
    "titleEn": "Score trigger: 35 points (cross-border threshold, tier shift to Additional Verification)",
    "titleAr": "تفعيل الدرجة: 35 نقطة (حد التحويل الدولي، انتقال إلى تحقق إضافي)",
    "descriptionEn": "Single factor reaches 35 points, shifting tier to Additional Verification.",
    "descriptionAr": "عامل واحد يصل إلى 35 نقطة وينقل الفئة إلى تحقق إضافي.",
    "expectedDecision": "Additional Verification",
    "expectedRiskLevel": "Medium",
    "customer": {
      "id": "bench-bnd-027",
      "name": "Boundary Subject 27",
      "nameAr": "عميل فحص الحدود 27",
      "averageAmount": 5000,
      "transactionCount": 20,
      "usualCountries": [
        "Saudi Arabia",
        "Philippines",
        "UAE"
      ],
      "trustedBeneficiaries": [
        "Maria Santos"
      ],
      "usualHours": [
        8,
        20
      ],
      "priorRisk": false
    },
    "input": {
      "customerId": "bench-bnd-027",
      "amount": 5200,
      "currency": "SAR",
      "destinationCountry": "UAE",
      "beneficiaryName": "Maria Santos",
      "transactionType": "International Transfer",
      "submittedAt": "2026-08-13T12:00:00.000Z"
    }
  },
  {
    "id": "BENCH-228",
    "category": "policy_boundary",
    "titleEn": "Score trigger: 35 points (cross-border threshold, tier shift to Additional Verification)",
    "titleAr": "تفعيل الدرجة: 35 نقطة (حد التحويل الدولي، انتقال إلى تحقق إضافي)",
    "descriptionEn": "Single factor reaches 35 points, shifting tier to Additional Verification.",
    "descriptionAr": "عامل واحد يصل إلى 35 نقطة وينقل الفئة إلى تحقق إضافي.",
    "expectedDecision": "Additional Verification",
    "expectedRiskLevel": "Medium",
    "customer": {
      "id": "bench-bnd-028",
      "name": "Boundary Subject 28",
      "nameAr": "عميل فحص الحدود 28",
      "averageAmount": 5000,
      "transactionCount": 20,
      "usualCountries": [
        "Saudi Arabia",
        "Philippines",
        "UAE"
      ],
      "trustedBeneficiaries": [
        "Maria Santos"
      ],
      "usualHours": [
        8,
        20
      ],
      "priorRisk": false
    },
    "input": {
      "customerId": "bench-bnd-028",
      "amount": 5200,
      "currency": "SAR",
      "destinationCountry": "UAE",
      "beneficiaryName": "Maria Santos",
      "transactionType": "International Transfer",
      "submittedAt": "2026-08-13T12:00:00.000Z"
    }
  },
  {
    "id": "BENCH-229",
    "category": "policy_boundary",
    "titleEn": "Score trigger: 35 points (cross-border threshold, tier shift to Additional Verification)",
    "titleAr": "تفعيل الدرجة: 35 نقطة (حد التحويل الدولي، انتقال إلى تحقق إضافي)",
    "descriptionEn": "Single factor reaches 35 points, shifting tier to Additional Verification.",
    "descriptionAr": "عامل واحد يصل إلى 35 نقطة وينقل الفئة إلى تحقق إضافي.",
    "expectedDecision": "Additional Verification",
    "expectedRiskLevel": "Medium",
    "customer": {
      "id": "bench-bnd-029",
      "name": "Boundary Subject 29",
      "nameAr": "عميل فحص الحدود 29",
      "averageAmount": 5000,
      "transactionCount": 20,
      "usualCountries": [
        "Saudi Arabia",
        "Philippines",
        "UAE"
      ],
      "trustedBeneficiaries": [
        "Maria Santos"
      ],
      "usualHours": [
        8,
        20
      ],
      "priorRisk": false
    },
    "input": {
      "customerId": "bench-bnd-029",
      "amount": 5200,
      "currency": "SAR",
      "destinationCountry": "UAE",
      "beneficiaryName": "Maria Santos",
      "transactionType": "International Transfer",
      "submittedAt": "2026-08-13T12:00:00.000Z"
    }
  },
  {
    "id": "BENCH-230",
    "category": "policy_boundary",
    "titleEn": "Score trigger: 35 points (cross-border threshold, tier shift to Additional Verification)",
    "titleAr": "تفعيل الدرجة: 35 نقطة (حد التحويل الدولي، انتقال إلى تحقق إضافي)",
    "descriptionEn": "Single factor reaches 35 points, shifting tier to Additional Verification.",
    "descriptionAr": "عامل واحد يصل إلى 35 نقطة وينقل الفئة إلى تحقق إضافي.",
    "expectedDecision": "Additional Verification",
    "expectedRiskLevel": "Medium",
    "customer": {
      "id": "bench-bnd-030",
      "name": "Boundary Subject 30",
      "nameAr": "عميل فحص الحدود 30",
      "averageAmount": 5000,
      "transactionCount": 20,
      "usualCountries": [
        "Saudi Arabia",
        "Philippines",
        "UAE"
      ],
      "trustedBeneficiaries": [
        "Maria Santos"
      ],
      "usualHours": [
        8,
        20
      ],
      "priorRisk": false
    },
    "input": {
      "customerId": "bench-bnd-030",
      "amount": 5200,
      "currency": "SAR",
      "destinationCountry": "UAE",
      "beneficiaryName": "Maria Santos",
      "transactionType": "International Transfer",
      "submittedAt": "2026-08-13T12:00:00.000Z"
    }
  },
  {
    "id": "BENCH-231",
    "category": "policy_boundary",
    "titleEn": "New customer baseline boundary: 45,000 SAR (under 50,000 SAR unestablished threshold)",
    "titleAr": "حد خط أساس عميل جديد: 45,000 ر.س (تحت حد 50,000 ر.س لغير المثبتين)",
    "descriptionEn": "Unestablished customer transfer below the 50,000 SAR threshold.",
    "descriptionAr": "تحويل عميل جديد غير مثبت يقع تحت عتبة 50,000 ريال.",
    "expectedDecision": "Approve",
    "expectedRiskLevel": "Low",
    "customer": {
      "id": "bench-bnd-031",
      "name": "Boundary Subject 31",
      "nameAr": "عميل فحص الحدود 31",
      "averageAmount": 0,
      "transactionCount": 0,
      "usualCountries": [
        "Saudi Arabia",
        "Philippines",
        "UAE"
      ],
      "trustedBeneficiaries": [
        "Ahmad Al-Saleh"
      ],
      "usualHours": [
        8,
        20
      ],
      "priorRisk": false
    },
    "input": {
      "customerId": "bench-bnd-031",
      "amount": 45000,
      "currency": "SAR",
      "destinationCountry": "Saudi Arabia",
      "beneficiaryName": "Ahmad Al-Saleh",
      "transactionType": "Local Transfer",
      "submittedAt": "2026-08-13T12:00:00.000Z"
    }
  },
  {
    "id": "BENCH-232",
    "category": "policy_boundary",
    "titleEn": "New customer baseline boundary: 45,000 SAR (under 50,000 SAR unestablished threshold)",
    "titleAr": "حد خط أساس عميل جديد: 45,000 ر.س (تحت حد 50,000 ر.س لغير المثبتين)",
    "descriptionEn": "Unestablished customer transfer below the 50,000 SAR threshold.",
    "descriptionAr": "تحويل عميل جديد غير مثبت يقع تحت عتبة 50,000 ريال.",
    "expectedDecision": "Approve",
    "expectedRiskLevel": "Low",
    "customer": {
      "id": "bench-bnd-032",
      "name": "Boundary Subject 32",
      "nameAr": "عميل فحص الحدود 32",
      "averageAmount": 0,
      "transactionCount": 0,
      "usualCountries": [
        "Saudi Arabia",
        "Philippines",
        "UAE"
      ],
      "trustedBeneficiaries": [
        "Ahmad Al-Saleh"
      ],
      "usualHours": [
        8,
        20
      ],
      "priorRisk": false
    },
    "input": {
      "customerId": "bench-bnd-032",
      "amount": 45000,
      "currency": "SAR",
      "destinationCountry": "Saudi Arabia",
      "beneficiaryName": "Ahmad Al-Saleh",
      "transactionType": "Local Transfer",
      "submittedAt": "2026-08-13T12:00:00.000Z"
    }
  },
  {
    "id": "BENCH-233",
    "category": "policy_boundary",
    "titleEn": "New customer baseline boundary: 45,000 SAR (under 50,000 SAR unestablished threshold)",
    "titleAr": "حد خط أساس عميل جديد: 45,000 ر.س (تحت حد 50,000 ر.س لغير المثبتين)",
    "descriptionEn": "Unestablished customer transfer below the 50,000 SAR threshold.",
    "descriptionAr": "تحويل عميل جديد غير مثبت يقع تحت عتبة 50,000 ريال.",
    "expectedDecision": "Approve",
    "expectedRiskLevel": "Low",
    "customer": {
      "id": "bench-bnd-033",
      "name": "Boundary Subject 33",
      "nameAr": "عميل فحص الحدود 33",
      "averageAmount": 0,
      "transactionCount": 0,
      "usualCountries": [
        "Saudi Arabia",
        "Philippines",
        "UAE"
      ],
      "trustedBeneficiaries": [
        "Ahmad Al-Saleh"
      ],
      "usualHours": [
        8,
        20
      ],
      "priorRisk": false
    },
    "input": {
      "customerId": "bench-bnd-033",
      "amount": 45000,
      "currency": "SAR",
      "destinationCountry": "Saudi Arabia",
      "beneficiaryName": "Ahmad Al-Saleh",
      "transactionType": "Local Transfer",
      "submittedAt": "2026-08-13T12:00:00.000Z"
    }
  },
  {
    "id": "BENCH-234",
    "category": "policy_boundary",
    "titleEn": "New customer baseline boundary: 45,000 SAR (under 50,000 SAR unestablished threshold)",
    "titleAr": "حد خط أساس عميل جديد: 45,000 ر.س (تحت حد 50,000 ر.س لغير المثبتين)",
    "descriptionEn": "Unestablished customer transfer below the 50,000 SAR threshold.",
    "descriptionAr": "تحويل عميل جديد غير مثبت يقع تحت عتبة 50,000 ريال.",
    "expectedDecision": "Approve",
    "expectedRiskLevel": "Low",
    "customer": {
      "id": "bench-bnd-034",
      "name": "Boundary Subject 34",
      "nameAr": "عميل فحص الحدود 34",
      "averageAmount": 0,
      "transactionCount": 0,
      "usualCountries": [
        "Saudi Arabia",
        "Philippines",
        "UAE"
      ],
      "trustedBeneficiaries": [
        "Ahmad Al-Saleh"
      ],
      "usualHours": [
        8,
        20
      ],
      "priorRisk": false
    },
    "input": {
      "customerId": "bench-bnd-034",
      "amount": 45000,
      "currency": "SAR",
      "destinationCountry": "Saudi Arabia",
      "beneficiaryName": "Ahmad Al-Saleh",
      "transactionType": "Local Transfer",
      "submittedAt": "2026-08-13T12:00:00.000Z"
    }
  },
  {
    "id": "BENCH-235",
    "category": "policy_boundary",
    "titleEn": "New customer baseline boundary: 45,000 SAR (under 50,000 SAR unestablished threshold)",
    "titleAr": "حد خط أساس عميل جديد: 45,000 ر.س (تحت حد 50,000 ر.س لغير المثبتين)",
    "descriptionEn": "Unestablished customer transfer below the 50,000 SAR threshold.",
    "descriptionAr": "تحويل عميل جديد غير مثبت يقع تحت عتبة 50,000 ريال.",
    "expectedDecision": "Approve",
    "expectedRiskLevel": "Low",
    "customer": {
      "id": "bench-bnd-035",
      "name": "Boundary Subject 35",
      "nameAr": "عميل فحص الحدود 35",
      "averageAmount": 0,
      "transactionCount": 0,
      "usualCountries": [
        "Saudi Arabia",
        "Philippines",
        "UAE"
      ],
      "trustedBeneficiaries": [
        "Ahmad Al-Saleh"
      ],
      "usualHours": [
        8,
        20
      ],
      "priorRisk": false
    },
    "input": {
      "customerId": "bench-bnd-035",
      "amount": 45000,
      "currency": "SAR",
      "destinationCountry": "Saudi Arabia",
      "beneficiaryName": "Ahmad Al-Saleh",
      "transactionType": "Local Transfer",
      "submittedAt": "2026-08-13T12:00:00.000Z"
    }
  },
  {
    "id": "BENCH-236",
    "category": "policy_boundary",
    "titleEn": "New customer baseline trigger: 55,000 SAR (exceeds 50,000 SAR unestablished threshold)",
    "titleAr": "تفعيل خط أساس عميل جديد: 55,000 ر.س (يتجاوز حد 50,000 ر.س لغير المثبتين)",
    "descriptionEn": "Large transfer for an unestablished customer exceeding the 50,000 SAR policy threshold.",
    "descriptionAr": "تحويل كبير لعميل غير مثبت يتجاوز عتبة السياسة البالغة 50,000 ريال.",
    "expectedDecision": "Additional Verification",
    "expectedRiskLevel": "Medium",
    "customer": {
      "id": "bench-bnd-036",
      "name": "Boundary Subject 36",
      "nameAr": "عميل فحص الحدود 36",
      "averageAmount": 0,
      "transactionCount": 0,
      "usualCountries": [
        "Saudi Arabia",
        "Philippines",
        "UAE"
      ],
      "trustedBeneficiaries": [],
      "usualHours": [
        8,
        20
      ],
      "priorRisk": false
    },
    "input": {
      "customerId": "bench-bnd-036",
      "amount": 55000,
      "currency": "SAR",
      "destinationCountry": "Saudi Arabia",
      "beneficiaryName": "New External Entity 36",
      "transactionType": "Local Transfer",
      "submittedAt": "2026-08-13T12:00:00.000Z"
    }
  },
  {
    "id": "BENCH-237",
    "category": "policy_boundary",
    "titleEn": "New customer baseline trigger: 55,000 SAR (exceeds 50,000 SAR unestablished threshold)",
    "titleAr": "تفعيل خط أساس عميل جديد: 55,000 ر.س (يتجاوز حد 50,000 ر.س لغير المثبتين)",
    "descriptionEn": "Large transfer for an unestablished customer exceeding the 50,000 SAR policy threshold.",
    "descriptionAr": "تحويل كبير لعميل غير مثبت يتجاوز عتبة السياسة البالغة 50,000 ريال.",
    "expectedDecision": "Additional Verification",
    "expectedRiskLevel": "Medium",
    "customer": {
      "id": "bench-bnd-037",
      "name": "Boundary Subject 37",
      "nameAr": "عميل فحص الحدود 37",
      "averageAmount": 0,
      "transactionCount": 0,
      "usualCountries": [
        "Saudi Arabia",
        "Philippines",
        "UAE"
      ],
      "trustedBeneficiaries": [],
      "usualHours": [
        8,
        20
      ],
      "priorRisk": false
    },
    "input": {
      "customerId": "bench-bnd-037",
      "amount": 55000,
      "currency": "SAR",
      "destinationCountry": "Saudi Arabia",
      "beneficiaryName": "New External Entity 37",
      "transactionType": "Local Transfer",
      "submittedAt": "2026-08-13T12:00:00.000Z"
    }
  },
  {
    "id": "BENCH-238",
    "category": "policy_boundary",
    "titleEn": "New customer baseline trigger: 55,000 SAR (exceeds 50,000 SAR unestablished threshold)",
    "titleAr": "تفعيل خط أساس عميل جديد: 55,000 ر.س (يتجاوز حد 50,000 ر.س لغير المثبتين)",
    "descriptionEn": "Large transfer for an unestablished customer exceeding the 50,000 SAR policy threshold.",
    "descriptionAr": "تحويل كبير لعميل غير مثبت يتجاوز عتبة السياسة البالغة 50,000 ريال.",
    "expectedDecision": "Additional Verification",
    "expectedRiskLevel": "Medium",
    "customer": {
      "id": "bench-bnd-038",
      "name": "Boundary Subject 38",
      "nameAr": "عميل فحص الحدود 38",
      "averageAmount": 0,
      "transactionCount": 0,
      "usualCountries": [
        "Saudi Arabia",
        "Philippines",
        "UAE"
      ],
      "trustedBeneficiaries": [],
      "usualHours": [
        8,
        20
      ],
      "priorRisk": false
    },
    "input": {
      "customerId": "bench-bnd-038",
      "amount": 55000,
      "currency": "SAR",
      "destinationCountry": "Saudi Arabia",
      "beneficiaryName": "New External Entity 38",
      "transactionType": "Local Transfer",
      "submittedAt": "2026-08-13T12:00:00.000Z"
    }
  },
  {
    "id": "BENCH-239",
    "category": "policy_boundary",
    "titleEn": "New customer baseline trigger: 55,000 SAR (exceeds 50,000 SAR unestablished threshold)",
    "titleAr": "تفعيل خط أساس عميل جديد: 55,000 ر.س (يتجاوز حد 50,000 ر.س لغير المثبتين)",
    "descriptionEn": "Large transfer for an unestablished customer exceeding the 50,000 SAR policy threshold.",
    "descriptionAr": "تحويل كبير لعميل غير مثبت يتجاوز عتبة السياسة البالغة 50,000 ريال.",
    "expectedDecision": "Additional Verification",
    "expectedRiskLevel": "Medium",
    "customer": {
      "id": "bench-bnd-039",
      "name": "Boundary Subject 39",
      "nameAr": "عميل فحص الحدود 39",
      "averageAmount": 0,
      "transactionCount": 0,
      "usualCountries": [
        "Saudi Arabia",
        "Philippines",
        "UAE"
      ],
      "trustedBeneficiaries": [],
      "usualHours": [
        8,
        20
      ],
      "priorRisk": false
    },
    "input": {
      "customerId": "bench-bnd-039",
      "amount": 55000,
      "currency": "SAR",
      "destinationCountry": "Saudi Arabia",
      "beneficiaryName": "New External Entity 39",
      "transactionType": "Local Transfer",
      "submittedAt": "2026-08-13T12:00:00.000Z"
    }
  },
  {
    "id": "BENCH-240",
    "category": "policy_boundary",
    "titleEn": "New customer baseline trigger: 55,000 SAR (exceeds 50,000 SAR unestablished threshold)",
    "titleAr": "تفعيل خط أساس عميل جديد: 55,000 ر.س (يتجاوز حد 50,000 ر.س لغير المثبتين)",
    "descriptionEn": "Large transfer for an unestablished customer exceeding the 50,000 SAR policy threshold.",
    "descriptionAr": "تحويل كبير لعميل غير مثبت يتجاوز عتبة السياسة البالغة 50,000 ريال.",
    "expectedDecision": "Additional Verification",
    "expectedRiskLevel": "Medium",
    "customer": {
      "id": "bench-bnd-040",
      "name": "Boundary Subject 40",
      "nameAr": "عميل فحص الحدود 40",
      "averageAmount": 0,
      "transactionCount": 0,
      "usualCountries": [
        "Saudi Arabia",
        "Philippines",
        "UAE"
      ],
      "trustedBeneficiaries": [],
      "usualHours": [
        8,
        20
      ],
      "priorRisk": false
    },
    "input": {
      "customerId": "bench-bnd-040",
      "amount": 55000,
      "currency": "SAR",
      "destinationCountry": "Saudi Arabia",
      "beneficiaryName": "New External Entity 40",
      "transactionType": "Local Transfer",
      "submittedAt": "2026-08-13T12:00:00.000Z"
    }
  }
];

export function runDecisionBenchmark(): DecisionBenchmarkReport {
  const categoryStats: Record<BenchmarkCategoryId, { total: number; matched: number }> = {
    standard_normal: { total: 0, matched: 0 },
    additional_verification: { total: 0, matched: 0 },
    mandatory_policy: { total: 0, matched: 0 },
    compound_aml: { total: 0, matched: 0 },
    policy_boundary: { total: 0, matched: 0 },
  };

  let matchedCases = 0;
  let requiredReviewTotal = 0;
  let requiredReviewCaptured = 0;
  let standardApproveTotal = 0;
  let standardApproveEscalated = 0;

  const caseResults: BenchmarkCaseResult[] = [];

  for (const benchCase of BENCHMARK_CASES) {
    const analysis = runDeterministicAnalysis(benchCase.input, benchCase.customer);
    const matched = analysis.decision === benchCase.expectedDecision;

    categoryStats[benchCase.category].total++;
    if (matched) {
      categoryStats[benchCase.category].matched++;
      matchedCases++;
    }

    if (benchCase.expectedDecision !== "Approve") {
      requiredReviewTotal++;
      if (analysis.decision !== "Approve") {
        requiredReviewCaptured++;
      }
    } else {
      standardApproveTotal++;
      if (analysis.decision !== "Approve") {
        standardApproveEscalated++;
      }
    }

    caseResults.push({
      caseId: benchCase.id,
      category: benchCase.category,
      titleEn: benchCase.titleEn,
      titleAr: benchCase.titleAr,
      descriptionEn: benchCase.descriptionEn,
      descriptionAr: benchCase.descriptionAr,
      expectedDecision: benchCase.expectedDecision,
      actualDecision: analysis.decision,
      expectedRiskLevel: benchCase.expectedRiskLevel,
      actualRiskLevel: analysis.riskLevel,
      rulesScore: analysis.score,
      behaviorScore: analysis.mlSignal.score,
      behaviorLevel: analysis.mlSignal.level,
      matched,
      factorsCount: analysis.factors.length,
      factorsTriggeredEn: analysis.factors.map(f => f.title),
      factorsTriggeredAr: analysis.factors.map(f => f.titleAr),
      policyOverride: analysis.policyOverride,
      policyOverrideAr: analysis.policyOverrideAr,
      amount: benchCase.input.amount,
      destinationCountry: benchCase.input.destinationCountry,
    });
  }

  const categoryBreakdown: Record<BenchmarkCategoryId, BenchmarkCategoryStat> = {
    standard_normal: {
      total: categoryStats.standard_normal.total,
      matched: categoryStats.standard_normal.matched,
      agreementPct: categoryStats.standard_normal.total > 0
        ? Math.round((categoryStats.standard_normal.matched / categoryStats.standard_normal.total) * 1000) / 10
        : 0,
      nameEn: BENCHMARK_CATEGORIES.standard_normal.nameEn,
      nameAr: BENCHMARK_CATEGORIES.standard_normal.nameAr,
      descriptionEn: BENCHMARK_CATEGORIES.standard_normal.descriptionEn,
      descriptionAr: BENCHMARK_CATEGORIES.standard_normal.descriptionAr,
    },
    additional_verification: {
      total: categoryStats.additional_verification.total,
      matched: categoryStats.additional_verification.matched,
      agreementPct: categoryStats.additional_verification.total > 0
        ? Math.round((categoryStats.additional_verification.matched / categoryStats.additional_verification.total) * 1000) / 10
        : 0,
      nameEn: BENCHMARK_CATEGORIES.additional_verification.nameEn,
      nameAr: BENCHMARK_CATEGORIES.additional_verification.nameAr,
      descriptionEn: BENCHMARK_CATEGORIES.additional_verification.descriptionEn,
      descriptionAr: BENCHMARK_CATEGORIES.additional_verification.descriptionAr,
    },
    mandatory_policy: {
      total: categoryStats.mandatory_policy.total,
      matched: categoryStats.mandatory_policy.matched,
      agreementPct: categoryStats.mandatory_policy.total > 0
        ? Math.round((categoryStats.mandatory_policy.matched / categoryStats.mandatory_policy.total) * 1000) / 10
        : 0,
      nameEn: BENCHMARK_CATEGORIES.mandatory_policy.nameEn,
      nameAr: BENCHMARK_CATEGORIES.mandatory_policy.nameAr,
      descriptionEn: BENCHMARK_CATEGORIES.mandatory_policy.descriptionEn,
      descriptionAr: BENCHMARK_CATEGORIES.mandatory_policy.descriptionAr,
    },
    compound_aml: {
      total: categoryStats.compound_aml.total,
      matched: categoryStats.compound_aml.matched,
      agreementPct: categoryStats.compound_aml.total > 0
        ? Math.round((categoryStats.compound_aml.matched / categoryStats.compound_aml.total) * 1000) / 10
        : 0,
      nameEn: BENCHMARK_CATEGORIES.compound_aml.nameEn,
      nameAr: BENCHMARK_CATEGORIES.compound_aml.nameAr,
      descriptionEn: BENCHMARK_CATEGORIES.compound_aml.descriptionEn,
      descriptionAr: BENCHMARK_CATEGORIES.compound_aml.descriptionAr,
    },
    policy_boundary: {
      total: categoryStats.policy_boundary.total,
      matched: categoryStats.policy_boundary.matched,
      agreementPct: categoryStats.policy_boundary.total > 0
        ? Math.round((categoryStats.policy_boundary.matched / categoryStats.policy_boundary.total) * 1000) / 10
        : 0,
      nameEn: BENCHMARK_CATEGORIES.policy_boundary.nameEn,
      nameAr: BENCHMARK_CATEGORIES.policy_boundary.nameAr,
      descriptionEn: BENCHMARK_CATEGORIES.policy_boundary.descriptionEn,
      descriptionAr: BENCHMARK_CATEGORIES.policy_boundary.descriptionAr,
    },
  };

  const decisionPolicyAgreement = Math.round((matchedCases / BENCHMARK_CASES.length) * 1000) / 10;
  const requiredReviewCapture = requiredReviewTotal > 0
    ? Math.round((requiredReviewCaptured / requiredReviewTotal) * 1000) / 10
    : 100;
  const unneededEscalation = standardApproveTotal > 0
    ? Math.round((standardApproveEscalated / standardApproveTotal) * 1000) / 10
    : 0;

  // 5 Representative Sample Cases (one from each of the 5 categories)
  const sampleIndices = [
    0,   // Sample 1: Standard / Normal (BENCH-001)
    60,  // Sample 2: Additional Verification (BENCH-061)
    110, // Sample 3: Mandatory Policy (BENCH-111)
    150, // Sample 4: Compound AML (BENCH-151)
    200, // Sample 5: Policy Boundary (BENCH-201)
  ];

  const sampleCases: BenchmarkSampleCase[] = sampleIndices.map((idx) => {
    const res = caseResults[idx];
    const cat = BENCHMARK_CATEGORIES[res.category];
    return {
      id: res.caseId,
      category: res.category,
      categoryNameEn: cat.nameEn,
      categoryNameAr: cat.nameAr,
      titleEn: res.titleEn,
      titleAr: res.titleAr,
      descriptionEn: res.descriptionEn,
      descriptionAr: res.descriptionAr,
      expectedDecision: res.expectedDecision,
      engineDecision: res.actualDecision,
      rulesScore: res.rulesScore,
      behaviorScore: res.behaviorScore,
      behaviorLevel: res.behaviorLevel,
      matched: res.matched,
      factorsTriggeredEn: res.factorsTriggeredEn,
      factorsTriggeredAr: res.factorsTriggeredAr,
      policyOverride: res.policyOverride,
      policyOverrideAr: res.policyOverrideAr,
      amount: res.amount,
      destinationCountry: res.destinationCountry,
    };
  });

  return {
    version: DECISION_BENCHMARK_VERSION,
    badge: {
      ar: "تحقق موثق",
      en: "Documented verification",
    },
    title: {
      ar: "دليل جودة القرار والذكاء",
      en: "Decision quality & AI traceability evidence",
    },
    explanation: {
      ar: "يُطبّق هذا التشغيل سياسة القرار على 240 حالة مرجعية معلّمة ومثبتة الإصدار، ثم يقارن كل نتيجة بالقرار المتوقع؛ لإظهار ثبات سلوك محرك القرار، جودة حواجز السياسة، ومسار الذكاء القابل للمراجعة.",
      en: "This execution runs the decision policy against 240 version-pinned, labeled reference benchmark cases and compares each result with the expected decision; demonstrating decision engine stability, policy guardrail quality, and auditable AI traceability.",
    },
    disclaimer: {
      ar: "تُستخدم هذه الحالات المرجعية لقياس جودة القرار وثبات الحواجز فقط، ولا تدخل سجل العملاء أو خط الأساس أو أي قرار تشغيلي حي.",
      en: "These benchmark cases are used exclusively to measure decision policy quality and guardrail consistency; they do not enter customer records, baselines, or live operational decisions.",
    },
    evaluatedAt: BENCHMARK_EVALUATION_TIME,
    metrics: {
      totalCases: BENCHMARK_CASES.length,
      matchedCases,
      decisionPolicyAgreement,
      requiredReviewCapture,
      unneededEscalation,
      categoryBreakdown,
    },
    sampleCases,
  };
}
