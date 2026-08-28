import { z } from "zod";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { createInvestigationChatReply, createInvestigationReport } from "./sentinelAi";
import { runDeterministicAnalysis } from "./sentinelEngine";
import { runDecisionBenchmark } from "../shared/decisionBenchmark";
import { listPersistedAnalysisResults, listPersistedCustomerAnalysisResults, listPersistedMessages, listPersistentCustomerProfiles, loadPersistedAnalysisResult, loadPersistentCustomerProfile, persistAnalysisResult, persistChatExchange, refreshPersistedInvestigationReport } from "./sentinelSupabase";
import { persistRagGrounding } from "./sentinelRag";
import { applyCompositeDecision } from "./compositeDecision";
import { demoScenarios, type AnalysisResult, type CustomerProfile, type InvestigationReport, type Locale, type TransactionInput } from "../shared/sentinel";
import type { RagGrounding } from "../shared/rag";

const transactionInput = z.object({
  customerId: z.string(),
  amount: z.number().positive().max(1000000),
  currency: z.literal("SAR"),
  destinationCountry: z.string().min(2),
  beneficiaryName: z.string().min(2),
  transactionType: z.enum(["Local Transfer", "International Transfer", "Merchant Payment", "Personal Transfer"]),
  websiteDomain: z.string().optional(),
  submittedAt: z.string().optional(),
});

const chatHistoryInput = z.array(z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string().trim().min(1).max(800),
})).max(8);

const persistedLookupInput = z.object({
  transactionId: z.string().min(1),
  snapshotId: z.string().min(1).optional(),
  sessionResult: z.object({
    id: z.string().min(1),
    snapshot: z.object({ snapshotId: z.string().min(1) }).passthrough(),
  }).passthrough().optional(),
});

const analysisSessionCache = new Map<string, AnalysisResult>();

function cacheAnalysis(result: AnalysisResult) {
  analysisSessionCache.set(result.id, result);
  while (analysisSessionCache.size > 40) {
    const oldest = analysisSessionCache.keys().next().value as string | undefined;
    if (!oldest) break;
    analysisSessionCache.delete(oldest);
  }
}

/** RAG tables reference the immutable legacy transaction identifier stored with the decision result. */
export function ragTransactionReference(result: Pick<AnalysisResult, "id">) {
  return result.id;
}

type ManualAnalysisDependencies = {
  loadCustomer: (customerId: string) => Promise<CustomerProfile | null>;
  createReport: (base: Omit<AnalysisResult, "report">, locale: Locale) => Promise<InvestigationReport>;
  persistResult: (result: AnalysisResult) => Promise<{ transactionId: string; analysisRunId: string }>;
  persistGrounding: (transactionId: string, snapshotId: string, grounding: RagGrounding) => Promise<void>;
};

const manualAnalysisDependencies: ManualAnalysisDependencies = {
  loadCustomer: loadPersistentCustomerProfile,
  createReport: createInvestigationReport,
  persistResult: persistAnalysisResult,
  persistGrounding: persistRagGrounding,
};

/** Full manual-intake workflow: deterministic result, snapshot-bound report, persistent record, then optional RAG audit trail. */
export async function executeManualAnalysis(input: TransactionInput & { locale: Locale }, dependencies: ManualAnalysisDependencies = manualAnalysisDependencies) {
  const { locale, ...transaction } = input;
  const customer = await dependencies.loadCustomer(transaction.customerId);
  if (!customer) throw new Error("Sentinel customer profile is not available in Supabase.");
  const base = runDeterministicAnalysis(transaction, customer);
  const report = await dependencies.createReport(base, locale);
  const composed = applyCompositeDecision(base, report.aiRecommendation);
  const result = { ...composed, report };
  cacheAnalysis(result);
  await dependencies.persistResult(result);
  if (report.rag) await dependencies.persistGrounding(ragTransactionReference(result), result.snapshot.snapshotId, report.rag);
  return result;
}

export function matchesInvestigationLookup(result: AnalysisResult, transactionId: string, snapshotId?: string) {
  return result.id === transactionId
    || result.snapshot.snapshotId === transactionId
    || (Boolean(snapshotId) && result.snapshot.snapshotId === snapshotId);
}

async function resolveInvestigationResult(transactionId: string, snapshotId?: string, sessionResult?: AnalysisResult) {
  const cachedResult = analysisSessionCache.get(transactionId);
  if (cachedResult) return { result: cachedResult, lookupId: transactionId };
  if (sessionResult && matchesInvestigationLookup(sessionResult, transactionId, snapshotId)) {
    cacheAnalysis(sessionResult);
    return { result: sessionResult, lookupId: transactionId, isPersisted: false };
  }
  const persisted = await loadPersistedAnalysisResult(transactionId);
  if (persisted) return { result: persisted.result, lookupId: transactionId };
  if (!snapshotId || snapshotId === transactionId) return null;
  const bySnapshot = await loadPersistedAnalysisResult(snapshotId);
  return bySnapshot ? { result: bySnapshot.result, lookupId: snapshotId } : null;
}

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      ctx.res.clearCookie(COOKIE_NAME, { ...getSessionCookieOptions(ctx.req), maxAge: -1 });
      return { success: true } as const;
    }),
  }),
  sentinel: router({
    decisionQualityEvidence: publicProcedure.query(async () => runDecisionBenchmark()),
    bootstrap: publicProcedure.query(async () => ({ customers: await listPersistentCustomerProfiles(), scenarios: demoScenarios })),
    persistedResults: publicProcedure.query(async () => listPersistedAnalysisResults()),
    scenarioComparison: publicProcedure.query(async () => {
      const customers = await listPersistentCustomerProfiles();
      return demoScenarios.map(scenario => {
        const customer = customers.find(profile => profile.id === scenario.input.customerId);
        if (!customer) return { ...scenario, available: false as const };
        const result = runDeterministicAnalysis(scenario.input, customer);
        return { ...scenario, available: true as const, score: result.score, decision: result.decision, riskLevel: result.riskLevel, factors: result.factors.length };
      });
    }),
    customerAnalysisHistory: publicProcedure.input(z.object({ customerId: z.string().min(1) })).query(async ({ input }) => (
      listPersistedCustomerAnalysisResults(input.customerId)
    )),
    analyze: publicProcedure.input(transactionInput.extend({ locale: z.enum(["en", "ar"]).default("en") })).mutation(async ({ input }) => executeManualAnalysis(input)),
    refreshInvestigationReport: publicProcedure.input(persistedLookupInput.extend({
      locale: z.enum(["en", "ar"]),
    })).mutation(async ({ input }) => {
      const resolved = await resolveInvestigationResult(input.transactionId, input.snapshotId, input.sessionResult as AnalysisResult | undefined);
      if (!resolved) return null;

      const report = await createInvestigationReport(resolved.result, input.locale);
      const recomposed = applyCompositeDecision(resolved.result, report.aiRecommendation);
      const nextResult = { ...recomposed, report };
      const refreshed = resolved.isPersisted === false ? null : await refreshPersistedInvestigationReport(resolved.lookupId, report);
      const updatedResult = refreshed ? { ...nextResult, report: refreshed.report } : nextResult;
      if (resolved.isPersisted !== false && report.rag) await persistRagGrounding(ragTransactionReference(updatedResult), updatedResult.snapshot.snapshotId, report.rag);
      cacheAnalysis(updatedResult);
      return updatedResult;
    }),
    investigatorChat: publicProcedure.input(persistedLookupInput.extend({
      question: z.string().trim().min(1).max(800),
      locale: z.enum(["en", "ar"]),
      history: chatHistoryInput.default([]),
    })).mutation(async ({ input }) => {
      const resolved = await resolveInvestigationResult(input.transactionId, input.snapshotId, input.sessionResult as AnalysisResult | undefined);
      if (!resolved) {
        return {
          source: "Deterministic fallback" as const,
          answer: input.locale === "ar"
            ? "لا تتوفر لقطة هذه العملية في جلسة الخادم الحالية. حلل العملية مرة أخرى ثم أرسل السؤال."
            : "This operation snapshot is not available in the current server session. Analyse the transaction again, then send your question.",
        };
      }
      cacheAnalysis(resolved.result);
      const reply = await createInvestigationChatReply(resolved.result, input.question, input.locale, input.history);
      if (resolved.isPersisted !== false) await persistChatExchange(resolved.lookupId, input.question, reply.answer, reply.source);
      if (resolved.isPersisted !== false && reply.source === "Gemini AI" && reply.grounding) await persistRagGrounding(ragTransactionReference(resolved.result), resolved.result.snapshot.snapshotId, reply.grounding);
      return reply;
    }),
    investigatorHistory: publicProcedure.input(persistedLookupInput).query(async ({ input }) => {
      const direct = await listPersistedMessages(input.transactionId);
      if (direct.length || !input.snapshotId || input.snapshotId === input.transactionId) return direct;
      return listPersistedMessages(input.snapshotId);
    }),
  }),
});

export type AppRouter = typeof appRouter;
