import { customers as approvedDemoCustomers, type AnalysisResult, type CustomerProfile, type InvestigationReport, type Locale } from "../shared/sentinel";

type JsonRecord = Record<string, unknown>;

const baseUrl = process.env.SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const transientSupabaseStatuses = new Set([408, 429, 500, 502, 503, 504, 522, 524]);

class NonRetryableSupabaseError extends Error {}

function assertConnection() {
  if (!baseUrl || !serviceRoleKey) {
    throw new Error("Supabase persistence is not configured.");
  }
}

function headers(prefer = "return=representation") {
  assertConnection();
  return {
    apikey: serviceRoleKey!,
    Authorization: `Bearer ${serviceRoleKey}`,
    "Content-Type": "application/json",
    Prefer: prefer,
  };
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  assertConnection();
  let lastError: unknown;
  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      const response = await fetch(`${baseUrl}/rest/v1/${path}`, {
        ...init,
        headers: {
          ...headers(),
          ...(init.headers ?? {}),
        },
      });

      if (response.ok) return response.json() as Promise<T>;
      const message = `Sentinel Supabase request failed: ${response.status}`;
      lastError = new Error(message);
      if (!transientSupabaseStatuses.has(response.status)) throw new NonRetryableSupabaseError(message);
      if (attempt === 2) throw lastError;
    } catch (error) {
      lastError = error;
      if (error instanceof NonRetryableSupabaseError || attempt === 2) throw error;
    }
    await new Promise(resolve => setTimeout(resolve, 150 * (attempt + 1)));
  }
  throw lastError instanceof Error ? lastError : new Error("Sentinel Supabase request failed.");
}

async function findOne<T>(table: string, filter: string): Promise<T | null> {
  const rows = await request<T[]>(`${table}?select=*&${filter}&limit=1`);
  return rows[0] ?? null;
}

async function upsert<T extends JsonRecord>(table: string, conflictField: string, payload: JsonRecord) {
  const rows = await request<T[]>(`${table}?on_conflict=${encodeURIComponent(conflictField)}`, {
    method: "POST",
    headers: headers("resolution=merge-duplicates,return=representation"),
    body: JSON.stringify(payload),
  });
  if (!rows[0]) throw new Error(`Sentinel Supabase upsert returned no row for ${table}.`);
  return rows[0];
}

async function insert<T extends JsonRecord>(table: string, payload: JsonRecord) {
  const rows = await request<T[]>(table, {
    method: "POST",
    headers: headers("return=representation"),
    body: JSON.stringify(payload),
  });
  if (!rows[0]) throw new Error(`Sentinel Supabase insert returned no row for ${table}.`);
  return rows[0];
}

type StoredCustomer = {
  id: string;
  demo_identifier: string | null;
  display_name: string;
  risk_history_flag: boolean;
};

type StoredRelationship = { id: string; first_seen_at?: string | null };

type StoredTransaction = { id: string };

type StoredAnalysisRun = { id: string; result_payload: AnalysisResult | null };

type StoredHistory = {
  avg_transfer_amount: number | string | null;
  transaction_count: number;
  previous_countries: string[] | null;
  usual_transfer_time_window: string | null;
};

const approvedDemoCustomerIds = new Set(approvedDemoCustomers.map(customer => customer.id));

export function isAnalysisReadyCustomerProfile(profile: CustomerProfile) {
  return approvedDemoCustomerIds.has(profile.id)
    && profile.averageAmount > 0
    && profile.transactionCount > 0
    && profile.usualCountries.length > 0;
}

function displayFallback(identifier: string) {
  const known: Record<string, { nameAr: string; usualHours: [number, number] }> = {
    ahmed: { nameAr: "أحمد العتيبي", usualHours: [9, 18] },
    noura: { nameAr: "نورة الدوسري", usualHours: [11, 21] },
    khalid: { nameAr: "خالد الشهري", usualHours: [9, 18] },
    mohammed: { nameAr: "محمد الغامدي", usualHours: [8, 17] },
    layan: { nameAr: "ليان الحربي", usualHours: [8, 22] },
  };
  return known[identifier] ?? { nameAr: identifier, usualHours: [9, 18] as [number, number] };
}

export function parseHours(value: string | null, fallback: [number, number]): [number, number] {
  const hours = Array.from(value?.matchAll(/(?:^|[^\d])(\d{1,2}):\d{2}/g) ?? []).map(match => Number(match[1]));
  if (hours.length < 2) return fallback;
  const [start, end] = hours;
  return Number.isInteger(start) && Number.isInteger(end) && start >= 0 && start <= 23 && end >= 0 && end <= 23
    ? [start, end]
    : fallback;
}

async function trustedBeneficiaries(customerId: string) {
  const transactions = await request<Array<{ beneficiary_id: string | null }>>(
    `sentinel_transactions?select=beneficiary_id&customer_id=eq.${encodeURIComponent(customerId)}&beneficiary_id=not.is.null`,
  );
  const ids = Array.from(new Set(transactions.map(transaction => transaction.beneficiary_id).filter(Boolean))) as string[];
  if (!ids.length) return [];
  const beneficiaries = await request<Array<{ display_name: string }>>(
    `sentinel_beneficiaries?select=display_name&id=in.(${ids.map(encodeURIComponent).join(",")})&is_known_to_customer=eq.true`,
  );
  return beneficiaries.map(beneficiary => beneficiary.display_name);
}

function mapCustomerProfile(customer: StoredCustomer, history: StoredHistory | null, beneficiaries: string[]): CustomerProfile {
  const identifier = customer.demo_identifier ?? customer.id;
  const fallback = displayFallback(identifier);
  return {
    id: identifier,
    name: customer.display_name,
    nameAr: fallback.nameAr,
    averageAmount: Number(history?.avg_transfer_amount ?? 0),
    transactionCount: history?.transaction_count ?? 0,
    usualCountries: history?.previous_countries ?? [],
    trustedBeneficiaries: beneficiaries,
    usualHours: parseHours(history?.usual_transfer_time_window ?? null, fallback.usualHours),
    priorRisk: Boolean(customer.risk_history_flag),
  };
}

export async function loadPersistentCustomerProfile(identifier: string) {
  const customer = await findOne<StoredCustomer>(
    "sentinel_customers",
    `demo_identifier=eq.${encodeURIComponent(identifier)}`,
  );
  if (!customer) return null;
  const [history, beneficiaries] = await Promise.all([
    findOne<StoredHistory>("sentinel_customer_history", `customer_id=eq.${encodeURIComponent(customer.id)}`),
    trustedBeneficiaries(customer.id),
  ]);
  const profile = mapCustomerProfile(customer, history, beneficiaries);
  return isAnalysisReadyCustomerProfile(profile) ? profile : null;
}

export async function listPersistentCustomerProfiles() {
  const customers = await request<StoredCustomer[]>(
    "sentinel_customers?select=id,demo_identifier,display_name,risk_history_flag&order=display_name.asc",
  );
  const profiles = await Promise.all(customers.map(async customer => {
    const [history, beneficiaries] = await Promise.all([
      findOne<StoredHistory>("sentinel_customer_history", `customer_id=eq.${encodeURIComponent(customer.id)}`),
      trustedBeneficiaries(customer.id),
    ]);
    return mapCustomerProfile(customer, history, beneficiaries);
  }));
  return profiles.filter(isAnalysisReadyCustomerProfile);
}

async function ensureCustomer(profile: CustomerProfile) {
  const existing = await findOne<StoredCustomer>(
    "sentinel_customers",
    `demo_identifier=eq.${encodeURIComponent(profile.id)}`,
  );

  if (existing) return existing;

  return upsert<StoredCustomer>("sentinel_customers", "demo_identifier", {
    demo_identifier: profile.id,
    display_name: profile.name,
    risk_history_flag: profile.priorRisk,
    source_system: "sentinelai_runtime",
  });
}

async function ensureBeneficiary(name: string, country: string, firstSeenAt: string) {
  const existing = await findOne<StoredRelationship>(
    "sentinel_beneficiaries",
    `display_name=eq.${encodeURIComponent(name)}&country=eq.${encodeURIComponent(country)}`,
  );

  if (existing) return existing;

  return insert<StoredRelationship>("sentinel_beneficiaries", {
    display_name: name,
    country,
    is_known_to_customer: false,
    first_seen_at: firstSeenAt,
    source_system: "sentinelai_runtime",
  });
}

async function ensureWebsite(result: AnalysisResult) {
  if (!result.website) return null;

  const existing = await findOne<StoredRelationship>(
    "sentinel_websites",
    `domain=eq.${encodeURIComponent(result.website.domain)}`,
  );

  if (existing) return existing;

  return insert<StoredRelationship>("sentinel_websites", {
    domain: result.website.domain,
    reputation_score: result.website.score,
    phishing_flag: result.website.classification === "High Risk",
    legitimacy_verdict: result.website.classification,
    reasoning_text: result.website.indicators.map(indicator => indicator.label).join("; "),
    sources: [],
    source_system: "sentinelai_runtime",
  });
}

export async function persistAnalysisResult(result: AnalysisResult) {
  const customer = await ensureCustomer(result.snapshot.customer);
  const beneficiary = await ensureBeneficiary(
    result.snapshot.transaction.beneficiaryName,
    result.snapshot.transaction.destinationCountry,
    result.snapshot.transaction.submittedAt,
  );
  const website = await ensureWebsite(result);

  const transaction = await upsert<StoredTransaction>("sentinel_transactions", "legacy_transaction_id", {
    legacy_transaction_id: result.id,
    customer_id: customer.id,
    beneficiary_id: beneficiary.id,
    website_id: website?.id ?? null,
    amount: result.snapshot.transaction.amount,
    currency: result.snapshot.transaction.currency,
    destination_country: result.snapshot.transaction.destinationCountry,
    transaction_type: result.snapshot.transaction.transactionType,
    status: result.decision,
    submitted_at: result.snapshot.transaction.submittedAt,
    source_system: "sentinelai_runtime",
  });

  const analysisRun = await insert<StoredAnalysisRun>("sentinel_analysis_runs", {
    transaction_id: transaction.id,
    score: result.score,
    risk_level: result.riskLevel,
    decision: result.decision,
    risk_factors: result.factors,
    stage_trace: result.audit,
    ml_advisory: result.mlSignal,
    decision_snapshot: result.snapshot,
    result_payload: result,
  });

  await insert("sentinel_ai_reports", {
    analysis_run_id: analysisRun.id,
    model_source: result.report.source,
    status: result.report.completion ?? "model",
    report_payload: result.report,
  });

  if (result.alert.created) {
    await insert("sentinel_alerts", {
      transaction_id: transaction.id,
      analysis_run_id: analysisRun.id,
      severity: result.alert.severity ?? "Medium",
      alert_type: "risk_analysis",
      payload: { factors: result.factors.map(factor => factor.id) },
    });
  }

  if (result.case.created) {
    await upsert("sentinel_cases", "transaction_id", {
      transaction_id: transaction.id,
      status: "open",
    });
  }

  return { transactionId: transaction.id, analysisRunId: analysisRun.id };
}

async function findPersistedRunByIdentifier(identifier: string) {
  const rows = await request<StoredAnalysisRun[]>(
    "sentinel_analysis_runs?select=id,result_payload&order=created_at.desc&limit=100",
  );
  return rows.find(run => (
    run.id === identifier
    || run.result_payload?.id === identifier
    || run.result_payload?.snapshot.snapshotId === identifier
  )) ?? null;
}

export async function loadPersistedAnalysisResult(transactionId: string) {
  const transaction = await findOne<StoredTransaction>(
    "sentinel_transactions",
    `legacy_transaction_id=eq.${encodeURIComponent(transactionId)}`,
  );
  const rows = transaction
    ? await request<StoredAnalysisRun[]>(
      `sentinel_analysis_runs?select=id,result_payload&transaction_id=eq.${encodeURIComponent(transaction.id)}&order=created_at.desc&limit=1`,
    )
    : [];
  const run = rows[0] ?? await findPersistedRunByIdentifier(transactionId);
  if (!run?.result_payload) return null;
  return { analysisRunId: run.id, result: run.result_payload };
}

export async function listPersistedAnalysisResults(limit = 36) {
  const rows = await request<StoredAnalysisRun[]>(
    `sentinel_analysis_runs?select=id,result_payload&order=created_at.desc&limit=${Math.min(Math.max(limit, 1), 100)}`,
  );
  return rows.flatMap(row => row.result_payload ? [row.result_payload] : []);
}

export async function listPersistedCustomerAnalysisResults(customerIdentifier: string, limit = 12) {
  const customer = await findOne<StoredCustomer>(
    "sentinel_customers",
    `demo_identifier=eq.${encodeURIComponent(customerIdentifier)}`,
  );
  if (!customer) return [];

  const transactions = await request<Array<{ id: string }>>(
    `sentinel_transactions?select=id&customer_id=eq.${encodeURIComponent(customer.id)}`,
  );
  const transactionIds = transactions.map(transaction => transaction.id).filter(Boolean);
  if (!transactionIds.length) return [];

  const rows = await request<StoredAnalysisRun[]>(
    `sentinel_analysis_runs?select=id,result_payload&transaction_id=in.(${transactionIds.map(encodeURIComponent).join(",")})&order=created_at.desc&limit=${Math.min(Math.max(limit, 1), 20)}`,
  );
  return rows.flatMap(row => row.result_payload ? [row.result_payload] : []);
}

/** Replaces only the advisory report in an existing frozen result; the decision snapshot is never recalculated. */
export async function refreshPersistedInvestigationReport(transactionId: string, report: InvestigationReport) {
  const persisted = await loadPersistedAnalysisResult(transactionId);
  if (!persisted) return null;

  const updatedResult: AnalysisResult = { ...persisted.result, report };
  const rows = await request<StoredAnalysisRun[]>(
    `sentinel_analysis_runs?id=eq.${encodeURIComponent(persisted.analysisRunId)}`,
    {
      method: "PATCH",
      body: JSON.stringify({ result_payload: updatedResult }),
    },
  );
  if (!rows[0]) throw new Error("Sentinel Supabase report refresh returned no analysis run.");

  await upsert("sentinel_ai_reports", "analysis_run_id", {
    analysis_run_id: persisted.analysisRunId,
    model_source: report.source,
    status: report.completion ?? "model",
    report_payload: report,
  });
  return updatedResult;
}

export async function persistChatExchange(
  transactionId: string,
  question: string,
  answer: string,
  source: string,
) {
  const persisted = await loadPersistedAnalysisResult(transactionId);
  if (!persisted) return;

  await insert("sentinel_ai_messages", {
    analysis_run_id: persisted.analysisRunId,
    role: "user",
    content: question,
    model_source: "user",
  });
  await insert("sentinel_ai_messages", {
    analysis_run_id: persisted.analysisRunId,
    role: "assistant",
    content: answer,
    model_source: source,
  });
}

export async function listPersistedMessages(transactionId: string) {
  const persisted = await loadPersistedAnalysisResult(transactionId);
  if (!persisted) return [];

  return request<Array<{ role: "user" | "assistant"; content: string; model_source: string }>>(
    `sentinel_ai_messages?select=role,content,model_source&analysis_run_id=eq.${encodeURIComponent(persisted.analysisRunId)}&order=created_at.asc`,
  );
}
