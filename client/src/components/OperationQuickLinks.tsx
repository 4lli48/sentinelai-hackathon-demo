import { operationsWorkspaceHref, type OperationsWorkspaceView } from "@/contexts/OperationsWorkspaceContext";
import { Link } from "wouter";

type QuickLink = { view: OperationsWorkspaceView; label: string; tooltip: string };

export function operationQuickLinksFor(id: string, locale: "ar" | "en"): Array<QuickLink & { href: string }> {
  const labels: Record<"ar" | "en", QuickLink[]> = {
    ar: [
      { view: "decision", label: "القرار", tooltip: "يفتح ملخص القرار لهذه المعاملة." },
      { view: "investigation", label: "التحقيق", tooltip: "يفتح ملف التحقيق لهذه المعاملة." },
      { view: "cases", label: "الحالات والتنبيهات", tooltip: "يفتح الحالات والتنبيهات المتعلقة بهذه المعاملة." },
    ],
    en: [
      { view: "decision", label: "Decision", tooltip: "Open this transaction's decision summary." },
      { view: "investigation", label: "Investigation", tooltip: "Open this transaction's investigation file." },
      { view: "cases", label: "Cases & alerts", tooltip: "Open cases and alerts related to this transaction." },
    ],
  };
  return labels[locale].map(link => ({ ...link, href: operationsWorkspaceHref(link.view, id) }));
}

export function OperationQuickLinks({ id, locale }: { id: string; locale: "ar" | "en" }) {
  const isAr = locale === "ar";
  return <nav className="operation-quick-links" aria-label={isAr ? "الوصول السريع إلى أقسام العملية" : "Quick access to operation sections"}>
    {operationQuickLinksFor(id, locale).map(link => {
      const tooltipId = `operation-quick-link-${id}-${link.view}`;
      return <Link className="operation-quick-link" key={link.view} href={link.href} aria-describedby={tooltipId}><span>{link.label}</span><span id={tooltipId} className="operation-quick-link-tooltip" role="tooltip">{link.tooltip}</span></Link>;
    })}
  </nav>;
}
