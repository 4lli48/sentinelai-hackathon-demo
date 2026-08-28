import { readFile, writeFile } from "node:fs/promises";

const stageDir = "/home/ubuntu/sentinelai-migration-staging";
const baseUrl = process.env.SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!baseUrl || !serviceRoleKey) {
  throw new Error("Supabase migration credentials are unavailable.");
}

const headers = {
  apikey: serviceRoleKey,
  Authorization: `Bearer ${serviceRoleKey}`,
  "Content-Type": "application/json",
  Prefer: "resolution=merge-duplicates,return=representation",
};

async function load(name) {
  return JSON.parse(await readFile(`${stageDir}/${name}.json`, "utf8"));
}

async function upsert(table, conflictField, rows) {
  if (rows.length === 0) return [];

  const response = await fetch(
    `${baseUrl}/rest/v1/${table}?on_conflict=${encodeURIComponent(conflictField)}`,
    {
      method: "POST",
      headers,
      body: JSON.stringify(rows),
    },
  );

  if (!response.ok) {
    throw new Error(`Supabase target upsert failed for ${table}: ${response.status}`);
  }

  return response.json();
}

const [customers, histories, beneficiaries, websites, transactions] = await Promise.all([
  load("Customer"),
  load("CustomerHistory"),
  load("Beneficiary"),
  load("Website"),
  load("Transaction"),
]);

const targetCustomers = await upsert(
  "sentinel_customers",
  "legacy_customer_id",
  customers.map((customer) => ({
    legacy_customer_id: customer.id,
    demo_identifier: customer.demo_identifier,
    display_name: customer.name,
    risk_history_flag: Boolean(customer.risk_history_flag),
    source_system: "aimoney_supabase",
  })),
);

const customerIdByLegacy = new Map(
  targetCustomers.map((customer) => [customer.legacy_customer_id, customer.id]),
);

const targetBeneficiaries = await upsert(
  "sentinel_beneficiaries",
  "legacy_beneficiary_id",
  beneficiaries.map((beneficiary) => ({
    legacy_beneficiary_id: beneficiary.id,
    display_name: beneficiary.name,
    account_ref: beneficiary.account_ref,
    country: beneficiary.country,
    is_known_to_customer: Boolean(beneficiary.is_known_to_customer),
    trust_score: beneficiary.trust_score,
    first_seen_at: beneficiary.first_seen_at,
    source_system: "aimoney_supabase",
  })),
);

const beneficiaryIdByLegacy = new Map(
  targetBeneficiaries.map((beneficiary) => [beneficiary.legacy_beneficiary_id, beneficiary.id]),
);

const targetWebsites = await upsert(
  "sentinel_websites",
  "legacy_website_id",
  websites.map((website) => ({
    legacy_website_id: website.id,
    domain: website.domain,
    reputation_score: website.reputation_score,
    phishing_flag: Boolean(website.phishing_flag),
    ssl_valid: website.ssl_valid,
    domain_age_days: website.domain_age_days,
    similarity_to_known_brand: website.similarity_to_known_brand,
    legitimacy_verdict: website.gemini_legitimacy_verdict,
    reasoning_text: website.gemini_reasoning_text,
    sources: website.gemini_sources ?? [],
    source_system: "aimoney_supabase",
  })),
);

const websiteIdByLegacy = new Map(
  targetWebsites.map((website) => [website.legacy_website_id, website.id]),
);

const historyRows = histories
  .map((history) => ({
    legacyCustomerId: history.customer_id,
    row: {
      customer_id: customerIdByLegacy.get(history.customer_id),
      avg_transfer_amount: history.avg_transfer_amount,
      transaction_count: history.transaction_count ?? 0,
      previous_countries: history.previous_countries ?? [],
      previous_beneficiary_ids: history.previous_beneficiary_ids ?? [],
      usual_transfer_time_window: history.usual_transfer_time_window,
      past_risk_flags: history.past_risk_flags ?? [],
      past_alert_ids: history.past_alert_ids ?? [],
      home_city: history.home_city,
      source_system: "aimoney_supabase",
    },
  }))
  .filter(({ row }) => Boolean(row.customer_id));

const targetHistories = await upsert(
  "sentinel_customer_history",
  "customer_id",
  historyRows.map(({ row }) => row),
);

const skippedTransactions = [];
const transactionRows = transactions.flatMap((transaction) => {
  const customerId = customerIdByLegacy.get(transaction.customer_id);
  if (!customerId) {
    skippedTransactions.push({ legacyTransactionId: transaction.id, reason: "missing_customer" });
    return [];
  }

  return [{
    legacy_transaction_id: transaction.id,
    customer_id: customerId,
    beneficiary_id: transaction.beneficiary_id
      ? beneficiaryIdByLegacy.get(transaction.beneficiary_id) ?? null
      : null,
    website_id: transaction.website_id
      ? websiteIdByLegacy.get(transaction.website_id) ?? null
      : null,
    amount: transaction.amount,
    currency: transaction.currency,
    destination_country: transaction.destination_country,
    transaction_type: transaction.transaction_type,
    status: transaction.status,
    submitted_at: transaction.submitted_at,
    source_system: "aimoney_supabase",
  }];
});

const targetTransactions = await upsert(
  "sentinel_transactions",
  "legacy_transaction_id",
  transactionRows,
);

await writeFile(
  `${stageDir}/migration-result.json`,
  JSON.stringify(
    {
      source: {
        customers: customers.length,
        histories: histories.length,
        beneficiaries: beneficiaries.length,
        websites: websites.length,
        transactions: transactions.length,
      },
      migrated: {
        customers: targetCustomers.length,
        histories: targetHistories.length,
        beneficiaries: targetBeneficiaries.length,
        websites: targetWebsites.length,
        transactions: targetTransactions.length,
      },
      skippedTransactions,
    },
    null,
    2,
  ),
  "utf8",
);
