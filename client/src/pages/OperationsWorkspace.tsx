import SentinelLayout from "@/components/SentinelLayout";
import { useDemo } from "@/contexts/DemoContext";
import { OperationsWorkspaceProvider, type OperationsWorkspaceView } from "@/contexts/OperationsWorkspaceContext";
import Analysis from "@/pages/Analysis";
import Cases from "@/pages/Cases";
import Investigation from "@/pages/Investigation";
import { Activity, FileSearch, ShieldCheck } from "lucide-react";
import { useSearch } from "wouter";
import { customerPrivacyPolicy } from "@/pages/customerPrivacy";

const viewOptions: { view: OperationsWorkspaceView; icon: typeof FileSearch; en: string; ar: string; descriptionEn: string; descriptionAr: string }[] = [
  { view: "decision", icon: FileSearch, en: "Decision", ar: "القرار", descriptionEn: "Decision record, evidence, and export", descriptionAr: "سجل القرار والأدلة والتصدير" },
  { view: "investigation", icon: ShieldCheck, en: "Investigation", ar: "التحقيق", descriptionEn: "Case evidence, AI analysis, and reviewer actions", descriptionAr: "ملف القضية وتحليل الذكاء وإجراءات المراجع" },
  { view: "cases", icon: Activity, en: "Cases & alerts", ar: "الحالات والتنبيهات", descriptionEn: "Human-review queue and priority filters", descriptionAr: "طابور المراجعة البشرية وفلاتر الأولوية" },
];

function selectedView(value: string | null): OperationsWorkspaceView {
  return value === "investigation" || value === "cases" ? value : "decision";
}

export default function OperationsWorkspace() {
  const { locale } = useDemo();
  const isAr = locale === "ar";
  const search = useSearch();
  const params = new URLSearchParams(search);
  const view = selectedView(params.get("view"));
  const selectedId = params.get("id") ?? undefined;
  const activeOption = viewOptions.find(option => option.view === view)!;
  const Content = view === "decision" ? Analysis : view === "investigation" ? Investigation : Cases;

  return <OperationsWorkspaceProvider><SentinelLayout forceShell eyebrow={isAr ? "مساحة عمل موحّدة" : "UNIFIED REVIEW WORKSPACE"} title={isAr ? "القرار والتحقيق والمتابعة" : "Decision, investigation & follow-up"}>
    <section className="operations-workspace-shell">
      <div className="operations-workspace-intro"><div><span className="section-index">02</span><h2>{isAr ? "مساحة العملية الواحدة" : "One operation workspace"}</h2><p>{isAr ? "تنقل بين القرار وملف التحقيق والحالات من نفس المساحة؛ تبقى كل لقطة وسجل وأداة تصدير كما هي." : "Move between the decision, case file, and review queue in one space; every snapshot, record, and export remains intact."}</p></div><div className="operations-workspace-current"><activeOption.icon size={16} /><span>{isAr ? activeOption.ar : activeOption.en}</span><small>{isAr ? activeOption.descriptionAr : activeOption.descriptionEn}</small></div></div>
      <div className="operations-workspace-privacy-note"><ShieldCheck size={13} aria-hidden="true" /><span>{isAr ? customerPrivacyPolicy.operationsWorkspaceNoteAr : customerPrivacyPolicy.operationsWorkspaceNoteEn}</span></div>
      <div className="operations-workspace-view" key={`${view}-${selectedId ?? "directory"}`}><Content /></div>
    </section>
  </SentinelLayout></OperationsWorkspaceProvider>;
}
