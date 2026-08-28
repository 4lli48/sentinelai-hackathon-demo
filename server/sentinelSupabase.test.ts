import { afterEach, describe, expect, it, vi } from "vitest";
import type { AnalysisResult } from "../shared/sentinel";

const result: AnalysisResult = {
  id: "analysis-001",
  snapshot: {
    snapshotId: "snapshot-001",
    frozenAt: "2026-08-14T12:00:00.000Z",
    customer: {
      id: "ahmed",
      name: "Ahmed Al-Otaibi",
      nameAr: "أحمد العتيبي",
      averageAmount: 4200,
      transactionCount: 12,
      usualCountries: ["Saudi Arabia"],
      trustedBeneficiaries: ["Sara Al-Mutairi"],
      usualHours: [9, 18],
      priorRisk: false,
    },
    transaction: {
      customerId: "ahmed",
      amount: 1800,
      currency: "SAR",
      destinationCountry: "Saudi Arabia",
      beneficiaryName: "Sara Al-Mutairi",
      transactionType: "Local Transfer",
      submittedAt: "2026-08-14T12:00:00.000Z",
    },
    derived: {
      amountToAverageRatio: 0.43,
      newBeneficiary: false,
      newCountry: false,
      noHistoricalBaseline: false,
      outsideUsualHours: false,
    },
  },
  score: 0,
  riskLevel: "Low",
  decision: "Approve",
  factors: [],
  mlSignal: {
    score: 7,
    level: "Routine",
    method: "Isolation Forest",
    advisory: true,
    explanation: "Routine pattern",
    explanationAr: "نمط اعتيادي",
    featureSignals: [],
  },
  audit: [],
  alert: { created: false },
  case: { created: false, status: "Not required" },
  report: {
    source: "Gemini AI",
    completion: "model",
    locale: "en",
    evidence: [],
    analysis: "Routine operation.",
    references: [],
    actions: [],
  },
};

describe("Sentinel Supabase persistence", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
    vi.resetModules();
  });

  it("writes an analysis only to sentinel-prefixed tables", async () => {
    vi.stubEnv("SUPABASE_URL", "https://example.supabase.co");
    vi.stubEnv("SUPABASE_SERVICE_ROLE_KEY", "test-server-key");

    const urls: string[] = [];
    const requests: Array<{ input: string; init?: RequestInit }> = [];
    let customerReadAttempts = 0;
    const fetchMock = vi.fn(async (input: string, init?: RequestInit) => {
      urls.push(input);
      requests.push({ input, init });
      if (input.includes("sentinel_customers?select")) {
        customerReadAttempts += 1;
        return customerReadAttempts === 1
          ? new Response("temporary upstream timeout", { status: 522 })
          : new Response(JSON.stringify([]), { status: 200 });
      }
      if (input.includes("sentinel_beneficiaries?select")) return new Response(JSON.stringify([]), { status: 200 });
      if (input.includes("sentinel_customers?on_conflict")) return new Response(JSON.stringify([{ id: "customer-1" }]), { status: 201 });
      if (input.includes("sentinel_beneficiaries")) return new Response(JSON.stringify([{ id: "beneficiary-1" }]), { status: 201 });
      if (input.includes("sentinel_transactions?on_conflict")) return new Response(JSON.stringify([{ id: "transaction-1" }]), { status: 201 });
      if (input.includes("sentinel_analysis_runs")) return new Response(JSON.stringify([{ id: "analysis-run-1" }]), { status: 201 });
      if (input.includes("sentinel_ai_reports")) return new Response(JSON.stringify([{ id: "report-1" }]), { status: 201 });
      throw new Error(`Unexpected persistence URL: ${input}`);
    });
    vi.stubGlobal("fetch", fetchMock);

    const { persistAnalysisResult } = await import("./sentinelSupabase");
    await persistAnalysisResult(result);

    expect(customerReadAttempts).toBe(2);
    expect(urls.some(url => url.includes("/Customer"))).toBe(false);
    expect(urls.every(url => url.includes("/sentinel_"))).toBe(true);
    expect(urls).toContain("https://example.supabase.co/rest/v1/sentinel_ai_reports");
    const beneficiaryInsert = requests.find(request => request.input.endsWith("/sentinel_beneficiaries") && request.init?.method === "POST");
    expect(JSON.parse(String(beneficiaryInsert?.init?.body))).toMatchObject({
      display_name: "Sara Al-Mutairi",
      country: "Saudi Arabia",
      first_seen_at: "2026-08-14T12:00:00.000Z",
      is_known_to_customer: false,
    });
    const transactionWrite = requests.find(request => request.input.includes("/sentinel_transactions?on_conflict=legacy_transaction_id"));
    expect(JSON.parse(String(transactionWrite?.init?.body))).toMatchObject({
      beneficiary_id: "beneficiary-1",
      submitted_at: "2026-08-14T12:00:00.000Z",
    });
    expect(urls.some(url => url.includes("sentinel_beneficiaries?select=*&display_name=eq.Sara%20Al-Mutairi&country=eq.Saudi%20Arabia"))).toBe(true);
  });

  it("does not retry a permanent Supabase HTTP failure", async () => {
    vi.stubEnv("SUPABASE_URL", "https://example.supabase.co");
    vi.stubEnv("SUPABASE_SERVICE_ROLE_KEY", "test-server-key");
    let attempts = 0;
    vi.stubGlobal("fetch", vi.fn(async () => {
      attempts += 1;
      return new Response("invalid query", { status: 400 });
    }));

    const { persistAnalysisResult } = await import("./sentinelSupabase");
    await expect(persistAnalysisResult(result)).rejects.toThrow("Sentinel Supabase request failed: 400");
    expect(attempts).toBe(1);
  });

  it("restores a historical result from its immutable payload when direct transaction mapping is unavailable", async () => {
    vi.stubEnv("SUPABASE_URL", "https://example.supabase.co");
    vi.stubEnv("SUPABASE_SERVICE_ROLE_KEY", "test-server-key");

    const urls: string[] = [];
    vi.stubGlobal("fetch", vi.fn(async (input: string) => {
      urls.push(input);
      if (input.includes("sentinel_transactions?select")) return new Response(JSON.stringify([]), { status: 200 });
      if (input.includes("sentinel_analysis_runs?select=id,result_payload&order=created_at.desc&limit=100")) {
        return new Response(JSON.stringify([{ id: "historical-run-1", result_payload: result }]), { status: 200 });
      }
      throw new Error(`Unexpected retrieval URL: ${input}`);
    }));

    const { loadPersistedAnalysisResult } = await import("./sentinelSupabase");
    await expect(loadPersistedAnalysisResult("analysis-001")).resolves.toEqual({ analysisRunId: "historical-run-1", result });
    expect(urls.some(url => url.includes("sentinel_analysis_runs?select=id,result_payload&order=created_at.desc&limit=100"))).toBe(true);
  });

  it("restores a historical result from its frozen snapshot identifier", async () => {
    vi.stubEnv("SUPABASE_URL", "https://example.supabase.co");
    vi.stubEnv("SUPABASE_SERVICE_ROLE_KEY", "test-server-key");

    const urls: string[] = [];
    vi.stubGlobal("fetch", vi.fn(async (input: string) => {
      urls.push(input);
      if (input.includes("sentinel_transactions?select")) return new Response(JSON.stringify([]), { status: 200 });
      if (input.includes("sentinel_analysis_runs?select=id,result_payload&order=created_at.desc&limit=100")) return new Response(JSON.stringify([{ id: "historical-run-2", result_payload: result }]), { status: 200 });
      throw new Error(`Unexpected snapshot retrieval URL: ${input}`);
    }));

    const { loadPersistedAnalysisResult } = await import("./sentinelSupabase");
    await expect(loadPersistedAnalysisResult("snapshot-001")).resolves.toEqual({ analysisRunId: "historical-run-2", result });
    expect(urls.some(url => url.includes("sentinel_analysis_runs?select=id,result_payload&order=created_at.desc&limit=100"))).toBe(true);
  });

  it("lists a customer's persisted analyses through customer-owned transactions only", async () => {
    vi.stubEnv("SUPABASE_URL", "https://example.supabase.co");
    vi.stubEnv("SUPABASE_SERVICE_ROLE_KEY", "test-server-key");

    const urls: string[] = [];
    vi.stubGlobal("fetch", vi.fn(async (input: string) => {
      urls.push(input);
      if (input.includes("sentinel_customers?select")) return new Response(JSON.stringify([{ id: "customer-1", demo_identifier: "ahmed", display_name: "Ahmed", risk_history_flag: false }]), { status: 200 });
      if (input.includes("sentinel_transactions?select=id&customer_id=eq.customer-1")) return new Response(JSON.stringify([{ id: "transaction-1" }]), { status: 200 });
      if (input.includes("sentinel_analysis_runs?select=id,result_payload&transaction_id=in.(transaction-1)")) return new Response(JSON.stringify([{ id: "analysis-run-1", result_payload: result }]), { status: 200 });
      throw new Error(`Unexpected customer-history URL: ${input}`);
    }));

    const { listPersistedCustomerAnalysisResults } = await import("./sentinelSupabase");
    await expect(listPersistedCustomerAnalysisResults("ahmed")).resolves.toEqual([result]);
    expect(urls.every(url => url.includes("/sentinel_"))).toBe(true);
  });

  it("updates only the advisory report for an existing frozen analysis", async () => {
    vi.stubEnv("SUPABASE_URL", "https://example.supabase.co");
    vi.stubEnv("SUPABASE_SERVICE_ROLE_KEY", "test-server-key");

    const urls: string[] = [];
    vi.stubGlobal("fetch", vi.fn(async (input: string, init?: RequestInit) => {
      urls.push(input);
      if (input.includes("sentinel_transactions?select")) return new Response(JSON.stringify([{ id: "transaction-1" }]), { status: 200 });
      if (input.includes("sentinel_analysis_runs?select=id,result_payload&transaction_id")) return new Response(JSON.stringify([{ id: "analysis-run-1", result_payload: result }]), { status: 200 });
      if (input.includes("sentinel_analysis_runs?id=eq.analysis-run-1") && init?.method === "PATCH") return new Response(JSON.stringify([{ id: "analysis-run-1" }]), { status: 200 });
      if (input.includes("sentinel_ai_reports?on_conflict=analysis_run_id")) return new Response(JSON.stringify([{ id: "report-2" }]), { status: 201 });
      throw new Error(`Unexpected refresh URL: ${input}`);
    }));

    const { refreshPersistedInvestigationReport } = await import("./sentinelSupabase");
    const refreshed = await refreshPersistedInvestigationReport("analysis-001", { ...result.report, locale: "ar", source: "Gemini AI", analysis: "تحليل حي محفوظ." });
    expect(refreshed?.report.locale).toBe("ar");
    expect(refreshed?.report.analysis).toBe("تحليل حي محفوظ.");
    expect(urls.some(url => url.includes("sentinel_analysis_runs?id=eq.analysis-run-1"))).toBe(true);
  });

  it("reads the start and end hour instead of minutes from 09:00–18:00", async () => {
    const { parseHours } = await import("./sentinelSupabase");
    expect(parseHours("09:00–18:00", [9, 18])).toEqual([9, 18]);
  });
});

describe("analysis-ready customer profiles", () => {
  it("allows only approved demo profiles with a complete durable baseline", async () => {
    const { isAnalysisReadyCustomerProfile } = await import("./sentinelSupabase");
    expect(isAnalysisReadyCustomerProfile(result.snapshot.customer)).toBe(true);
    expect(isAnalysisReadyCustomerProfile({
      ...result.snapshot.customer,
      id: "customer-imported-without-history",
      averageAmount: 0,
      transactionCount: 0,
      usualCountries: [],
    })).toBe(false);
  });
});
