import type { TransactionInput } from "@shared/sentinel";

export type TransferDraft = Omit<TransactionInput, "transactionType"> & {
  transactionType: TransactionInput["transactionType"] | "";
};

export const destinations = [
  { value: "Saudi Arabia", ar: "المملكة العربية السعودية", en: "Saudi Arabia" },
  { value: "UAE", ar: "الإمارات العربية المتحدة", en: "United Arab Emirates" },
  { value: "Philippines", ar: "الفلبين", en: "Philippines" },
  { value: "Pakistan", ar: "باكستان", en: "Pakistan" },
  { value: "India", ar: "الهند", en: "India" },
  { value: "Turkey", ar: "تركيا", en: "Turkey" },
  { value: "High-risk jurisdiction", ar: "ممر عالي المخاطر — عرض", en: "High-risk corridor — demo" },
] as const;

export function newManualDraft(): TransferDraft {
  return { customerId: "", amount: 0, currency: "SAR", destinationCountry: "", beneficiaryName: "", transactionType: "" };
}

export function draftForScenario(scenario: TransactionInput): TransferDraft {
  return scenario;
}

export function isDraftReady(draft: TransferDraft): boolean {
  return Boolean(draft.customerId && draft.amount > 0 && draft.destinationCountry && draft.beneficiaryName.trim() && draft.transactionType);
}
