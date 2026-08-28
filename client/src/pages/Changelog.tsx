import SentinelLayout from "@/components/SentinelLayout";
import { useDemo } from "@/contexts/DemoContext";
import { useState } from "react";
import {
  Activity,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock,
  Cpu,
  Download,
  ExternalLink,
  FileCheck2,
  Filter,
  GitBranch,
  GitCommit,
  Landmark,
  Layers,
  Search,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Terminal,
  Zap,
} from "lucide-react";

type ReleaseCategory = "all" | "core" | "ai" | "security" | "ui";

interface ChangeItem {
  id: string;
  category: "core" | "ai" | "security" | "ui";
  tagEn: string;
  tagAr: string;
  titleEn: string;
  titleAr: string;
  descEn: string;
  descAr: string;
  badgeEn?: string;
  badgeAr?: string;
}

interface ReleaseVersion {
  version: string;
  releaseDate: string;
  titleEn: string;
  titleAr: string;
  summaryEn: string;
  summaryAr: string;
  isLatest?: boolean;
  metrics: {
    tests: string;
    stages: string;
    focusEn: string;
    focusAr: string;
  };
  changes: ChangeItem[];
}

const releasesData: ReleaseVersion[] = [
  {
    version: "v1.2.0",
    releaseDate: "2026-08-28",
    titleEn: "Sovereign AI Reasoning & Regulatory Governance RAG",
    titleAr: "الاستدلال المحلي المحوكم وRAG المعرفة التنظيمية",
    summaryEn:
      "Enterprise release introducing official SAMA, SDAIA, and FATF regulatory grounding, strict prompt leakage guards, deterministic narrative completion bridges, and automated executive export dossiers.",
    summaryAr:
      "إصدار مؤسسي يقدّم الربط المعرفي بلوائح ساما وسدايا وفاتف، حواجز منع تسريب التعليمات، جسور الإكمال الحتمي لتقارير الاستدلال، والتصدير الآلي للملفات التنفيذية.",
    isLatest: true,
    metrics: {
      tests: "147 / 147 Passed",
      stages: "14 Stages Sealed",
      focusEn: "Zero PII Leakage & Regulatory Traceability",
      focusAr: "حماية تامة للبيانات وإسناد تنظيمي موثق",
    },
    changes: [
      {
        id: "c1",
        category: "ai",
        tagEn: "Regulatory RAG",
        tagAr: "الامتثال وRAG",
        titleEn: "Supervisory Context Grounding (SAMA · SDAIA · FATF)",
        titleAr: "الإسناد المعرفي بالجهات الإشرافية (ساما · سدايا · FATF)",
        descEn:
          "Integrated an immutable catalogue of official regulatory clauses mapped dynamically to active risk factor codes, keeping decision context legally defensible without altering the deterministic outcome.",
        descAr:
          "بناء كتالوج مراجع تنظيمي معتمد يربط عوامل المخاطر النشطة بنصوص ساما وسدايا وفاتف الرسمية لضمان قانونية التفسير دون المساس بحتمية القرار.",
        badgeEn: "Core Governance",
        badgeAr: "حوكمة أساسية",
      },
      {
        id: "c2",
        category: "security",
        tagEn: "Prompt Sanitizer",
        tagAr: "حماية الاستدلال",
        titleEn: "Prompt Isolation & Deterministic Completion Bridges",
        titleAr: "عزل التعليمات وجسور الإكمال الحتمي المقيدة",
        descEn:
          "Engineered bidirectional sanitization guards eliminating prompt leakage, JSON artifact echoes, and truncated model fragments by injecting a certified deterministic closure.",
        descAr:
          "تطوير منظومة تعقيم ثنائية تمنع تسريب أسماء الحقول أو التعليمات مع جسر إكمال حتمي آلي يعالج الجمل غير المكتملة بأدلة اللقطة المجمدة.",
        badgeEn: "Security Floor",
        badgeAr: "حماية صارمة",
      },
      {
        id: "c3",
        category: "ui",
        tagEn: "Executive Reporting",
        tagAr: "التقارير التنفيذية",
        titleEn: "Automated Case Dossier PDF & Excel Export Engine",
        titleAr: "محرك تصدير ملفات القضايا التنفيذية إلى PDF وExcel",
        descEn:
          "Added one-click generation of audit-ready investigative dossiers featuring bilingual decision metrics, timeline evidence, and official citation metadata.",
        descAr:
          "إتاحة تصدير فوري لملف القضية بضغطة زر بصيغتي PDF وExcel المصرفية متضمناً مؤشرات القرار والأدلة الزمنية والمراجع.",
      },
      {
        id: "c4",
        category: "core",
        tagEn: "Workspace",
        tagAr: "مساحة العمليات",
        titleEn: "Unified Operations Workspace Architecture",
        titleAr: "توحيد مساحة العمليات والمراجعة المركزية",
        descEn:
          "Consolidated Decision Details, Investigator Desk, Case Queues, and Benchmark telemetry into a high-performance single-canvas operations workspace.",
        descAr:
          "دمج تفاصيل القرار، مكتب التحقيق، وقائمة القضايا، والقياس المعياري في منصة عمليات موحدة وسريعة الاستجابة.",
      },
    ],
  },
  {
    version: "v1.1.0",
    releaseDate: "2026-08-26",
    titleEn: "Interactive What-If Simulation & Full Arabic Localisation",
    titleAr: "محاكاة ما-لو التفاعلية والتعريب المصرفي الشامل",
    summaryEn:
      "Major enhancement delivering non-persistent sandboxed simulation, real-time transaction streaming telemetry, and native bilingual Arabic-first UI with RTL ergonomics.",
    summaryAr:
      "تحديث رئيسي قدّم محاكاة السيناريوهات المعزولة غير الحافظة، ومؤشرات البث الحي للمعاملات، والتعريب المصرفي الأصيل مع دعم RTL.",
    metrics: {
      tests: "132 / 132 Passed",
      stages: "14 Stages Sealed",
      focusEn: "Analyst Sandbox & Native RTL",
      focusAr: "بيئة تجارب معزولة وتجربة مصرفية",
    },
    changes: [
      {
        id: "c5",
        category: "ai",
        tagEn: "Simulation Sandbox",
        tagAr: "محاكاة معزولة",
        titleEn: "Non-Persistent 'What-If' Parameter Testing",
        titleAr: "محاكاة افتراضية غير حافظة لفحص السيناريوهات",
        descEn:
          "Enables fraud analysts to query hypothetical changes (e.g. higher volume, foreign corridor) with explicit non-persistent labeling, safeguarding audit log integrity.",
        descAr:
          "تمكين المحقق من اختبار تغير المعاملات أو المبالغ في بيئة محاكاة فورية موسومة بأنها غير محفوظة لحماية سلامة سجل التدقيق.",
      },
      {
        id: "c6",
        category: "core",
        tagEn: "Behavioral Drift",
        tagAr: "سلوك العميل",
        titleEn: "Customer Behavioral Profile Drift & Velocity Scoring",
        titleAr: "رصد انحراف النمط السلوكي ومعدل تكرار العمليات",
        descEn:
          "Implemented statistical baseline analysis checking transaction deviations (2.74x baseline deviation trigger, off-hours timing, new corridor verification).",
        descAr:
          "تطبيق فحص مقارنة خط الأساس الإحصائي لحساب انحرافات المبالغ (معامل انحراف 2.74x) وتوقيت العمليات والمستفيدين الجدد.",
      },
      {
        id: "c7",
        category: "ui",
        tagEn: "Design System",
        tagAr: "الهوية المصرفية",
        titleEn: "Saudi Banking Design Language (Arabic First & Dual Theme)",
        titleAr: "نظام تصميم مصرفي سعودي (عربي أصيل ووضع ليلي/نهاري)",
        descEn:
          "Refined the entire design system to enterprise banking standards using IBM Plex Sans Arabic typography, clean contrast ratios, and instant dark/light switching.",
        descAr:
          "إعادة بناء الواجهة وفق معايير المؤسسات المالية السعودية مع خط IBM Plex Sans العربي، ونظام ألوان هادئ، ودعم كامل للوضع الداكن.",
      },
    ],
  },
  {
    version: "v1.0.0",
    releaseDate: "2026-08-22",
    titleEn: "Deterministic Core Engine & Isolation Forest Foundation",
    titleAr: "المحرك الحتمي ونواة كشف الشذوذ الإحصائي",
    summaryEn:
      "Initial production baseline deploying the 14-stage immutable risk policy engine, Isolation Forest unsupervised anomaly detector, and cryptographic snapshot state.",
    summaryAr:
      "الإصدار التأسيسي الذي أطلق محرك القواعد الحتمي من 14 مرحلة، ونموذج Isolation Forest لكشف الشذوذ الإحصائي، وتجميد لقطات القرارات المشفرة.",
    metrics: {
      tests: "98 / 98 Passed",
      stages: "14 Stages Sealed",
      focusEn: "Deterministic Hard Governance",
      focusAr: "حوكمة قطعية وقواعد صارمة",
    },
    changes: [
      {
        id: "c8",
        category: "core",
        tagEn: "Policy Engine",
        tagAr: "محرك القواعد",
        titleEn: "14-Stage Deterministic Risk Policy Accumulator",
        titleAr: "محرك احتساب المخاطر الحتمي عبر 14 مرحلة قطعية",
        descEn:
          "Built a tamper-proof accumulator calculating 0-100 policy scores and risk tiers. Enforces absolute non-bypassable mandatory overrides.",
        descAr:
          "بناء محرك تراكمي حتمي لحساب درجات المخاطر من 0 إلى 100 وتحديد الإجراءات دون السماح لأي نموذج ذكاء بتجاوز السياسات الإلزامية.",
        badgeEn: "Core Foundation",
        badgeAr: "أساس النظام",
      },
      {
        id: "c9",
        category: "security",
        tagEn: "Context Snapshot",
        tagAr: "لقطة القرار",
        titleEn: "Cryptographic Decision Snapshot Freezing",
        titleAr: "تجميد لقطة السياق والقرار بشكل غير قابل للتعديل",
        descEn:
          "Freezes customer baseline, counterparty metadata, merchant classification, and rule state prior to scoring, ensuring lifelong audit repeatability.",
        descAr:
          "تثبيت وتجميد سياق العميل والعملية والمستفيدين والموقع فور التحليل لضمان إمكانية إعادة التدقيق المستقلة في أي وقت.",
      },
      {
        id: "c10",
        category: "ai",
        tagEn: "Anomaly Signal",
        tagAr: "كشف الشذوذ",
        titleEn: "Isolation Forest Unsupervised Anomaly Scoring",
        titleAr: "كشف الشذوذ الإحصائي غير الموجه (Isolation Forest)",
        descEn:
          "Integrated unsupervised Isolation Forest anomaly detection generating a 0-100 advisory anomaly signal acting strictly as non-interfering evidence.",
        descAr:
          "دمج خوارزمية Isolation Forest لاستخراج إشارة شذوذ استشارية مستقلة تسهم كدليل داعم للقرار دون أن تفرض تغيير الحكم الحتمي.",
      },
    ],
  },
];

export default function Changelog() {
  const { locale } = useDemo();
  const isAr = locale === "ar";
  const [selectedCategory, setSelectedCategory] = useState<ReleaseCategory>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedReleases, setExpandedReleases] = useState<Record<string, boolean>>({
    "v1.2.0": true,
    "v1.1.0": true,
    "v1.0.0": true,
  });

  const toggleRelease = (version: string) => {
    setExpandedReleases(prev => ({ ...prev, [version]: !prev[version] }));
  };

  const filteredReleases = releasesData
    .map(rel => {
      const filteredChanges = rel.changes.filter(c => {
        const matchesCat = selectedCategory === "all" || c.category === selectedCategory;
        const q = searchQuery.toLowerCase().trim();
        if (!q) return matchesCat;
        const matchesQuery =
          c.titleEn.toLowerCase().includes(q) ||
          c.titleAr.includes(q) ||
          c.descEn.toLowerCase().includes(q) ||
          c.descAr.includes(q) ||
          c.tagEn.toLowerCase().includes(q) ||
          c.tagAr.includes(q);
        return matchesCat && matchesQuery;
      });
      return { ...rel, changes: filteredChanges };
    })
    .filter(rel => rel.changes.length > 0 || !searchQuery);

  const categories: { id: ReleaseCategory; labelEn: string; labelAr: string; icon: any }[] = [
    { id: "all", labelEn: "All Modules", labelAr: "كافة المحاور", icon: Layers },
    { id: "core", labelEn: "Deterministic Core", labelAr: "المحرك الحتمي", icon: Cpu },
    { id: "ai", labelEn: "AI Reasoning & RAG", labelAr: "الاستدلال وRAG", icon: Sparkles },
    { id: "security", labelEn: "Security & Governance", labelAr: "الأمان والحوكمة", icon: ShieldCheck },
    { id: "ui", labelEn: "Banking UI & i18n", labelAr: "الواجهة والتعريب", icon: Landmark },
  ];

  return (
    <SentinelLayout
      eyebrow={isAr ? "سجل التطوير والهندسة المعمارية" : "ENGINEERING CHANGELOG & MILESTONES"}
      title={isAr ? "سجل التحديثات والإصدارات المعمارية" : "SentinelAI System Engineering & Release Log"}
    >
      {/* Hero Stats */}
      <section className="panel" style={{ padding: "30px", marginBottom: "24px", background: "linear-gradient(135deg, rgba(255,255,255,0.98), rgba(244,249,248,0.95))" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "20px" }}>
          <div>
            <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "5px 10px", background: "#e6f8f0", color: "#14704b", borderRadius: "20px", fontSize: "11px", fontFamily: "var(--font-mono)", fontWeight: 700, marginBottom: "12px" }}>
              <GitCommit size={14} />
              <span>{isAr ? "الإصدار المعتمد: v1.2.0 الإنتاجي" : "Production Baseline: v1.2.0"}</span>
            </div>
            <h2 style={{ margin: "0 0 8px", fontSize: "28px", letterSpacing: "-0.04em", color: "var(--ink)" }}>
              {isAr ? "المسار الهندسي وتطور منظومة SentinelAI" : "SentinelAI Engineering Roadmap & Changelog"}
            </h2>
            <p style={{ margin: 0, maxWidth: "680px", color: "var(--muted)", fontSize: "13px", lineHeight: "1.6" }}>
              {isAr
                ? "سجل معماري شامل يوثق كافة المراحل والميزات المنجزة في منظومة تقييم مخاطر التحويلات: من المحرك الحتمي ذي الـ 14 مرحلة إلى استدلال الذكاء المحلي وحوكمة RAG التنظيمية."
                : "A detailed engineering audit log documenting every architectural milestone delivered across the transaction risk intelligence pipeline: from deterministic 14-stage governance to sovereign edge AI and regulatory RAG."}
            </p>
          </div>

          {/* Quick Metrics */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "10px", minWidth: "280px" }}>
            <div style={{ padding: "12px 14px", background: "#fff", border: "1px solid var(--line)", borderRadius: "10px" }}>
              <span style={{ display: "block", fontSize: "10px", color: "var(--muted)", fontFamily: "var(--font-mono)" }}>
                {isAr ? "اختبارات Vitest الآلية" : "Automated Tests"}
              </span>
              <b style={{ fontSize: "17px", color: "#14704b" }}>147 / 147 PASS</b>
            </div>
            <div style={{ padding: "12px 14px", background: "#fff", border: "1px solid var(--line)", borderRadius: "10px" }}>
              <span style={{ display: "block", fontSize: "10px", color: "var(--muted)", fontFamily: "var(--font-mono)" }}>
                {isAr ? "مراحل التدقيق الحتمي" : "Audit Checkpoints"}
              </span>
              <b style={{ fontSize: "17px", color: "#0c6270" }}>14 STAGES</b>
            </div>
            <div style={{ padding: "12px 14px", background: "#fff", border: "1px solid var(--line)", borderRadius: "10px" }}>
              <span style={{ display: "block", fontSize: "10px", color: "var(--muted)", fontFamily: "var(--font-mono)" }}>
                {isAr ? "المراجع الإشرافية" : "Regulatory RAG"}
              </span>
              <b style={{ fontSize: "17px", color: "#785310" }}>SAMA · SDAIA · FATF</b>
            </div>
            <div style={{ padding: "12px 14px", background: "#fff", border: "1px solid var(--line)", borderRadius: "10px" }}>
              <span style={{ display: "block", fontSize: "10px", color: "var(--muted)", fontFamily: "var(--font-mono)" }}>
                {isAr ? "تسريب بيانات العملاء" : "PII Data Leakage"}
              </span>
              <b style={{ fontSize: "17px", color: "#14704b" }}>0.0% (Air-Gapped)</b>
            </div>
          </div>
        </div>
      </section>

      {/* Filter and Search Bar */}
      <section className="panel" style={{ padding: "14px 20px", marginBottom: "24px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "14px" }}>
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", alignItems: "center" }}>
          <span style={{ display: "flex", alignItems: "center", gap: "5px", color: "var(--muted)", fontSize: "11px", fontFamily: "var(--font-mono)", marginInlineEnd: "6px" }}>
            <Filter size={13} /> {isAr ? "التصنيف:" : "Filter:"}
          </span>
          {categories.map(cat => {
            const Icon = cat.icon;
            const active = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  padding: "6px 12px",
                  borderRadius: "8px",
                  fontSize: "12px",
                  fontWeight: active ? 700 : 500,
                  border: active ? "1px solid var(--ink)" : "1px solid var(--line)",
                  background: active ? "var(--ink)" : "#fff",
                  color: active ? "#fff" : "var(--ink)",
                  cursor: "pointer",
                  transition: "all 0.15s ease",
                }}
              >
                <Icon size={13} />
                <span>{isAr ? cat.labelAr : cat.labelEn}</span>
              </button>
            );
          })}
        </div>

        <div style={{ position: "relative", minWidth: "240px" }}>
          <Search size={14} style={{ position: "absolute", insetInlineStart: "10px", top: "50%", transform: "translateY(-50%)", color: "var(--muted)" }} />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder={isAr ? "ابحث في التحديثات والمعايير..." : "Search changelog..."}
            style={{
              width: "100%",
              padding: "7px 10px 7px 32px",
              paddingInlineStart: "32px",
              fontSize: "12px",
              borderRadius: "8px",
              border: "1px solid var(--line)",
              outline: "none",
              background: "#fff",
            }}
          />
        </div>
      </section>

      {/* Releases Timeline */}
      <div style={{ display: "grid", gap: "28px" }}>
        {filteredReleases.map(rel => {
          const isExpanded = expandedReleases[rel.version] ?? true;
          return (
            <article
              key={rel.version}
              className="panel"
              style={{
                borderRadius: "14px",
                overflow: "hidden",
                border: rel.isLatest ? "1px solid #1f8260" : "1px solid var(--line)",
                boxShadow: rel.isLatest ? "0 10px 30px rgba(31,130,96,0.08)" : "0 4px 16px rgba(0,0,0,0.03)",
              }}
            >
              {/* Release Header */}
              <div
                onClick={() => toggleRelease(rel.version)}
                style={{
                  padding: "20px 24px",
                  background: rel.isLatest ? "linear-gradient(90deg, #f0fbf6, #ffffff)" : "#fafbfa",
                  borderBottom: isExpanded ? "1px solid var(--line)" : "none",
                  cursor: "pointer",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: "16px",
                  flexWrap: "wrap",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "6px",
                      padding: "4px 10px",
                      borderRadius: "6px",
                      fontSize: "13px",
                      fontFamily: "var(--font-mono)",
                      fontWeight: 700,
                      background: rel.isLatest ? "#14704b" : "#445055",
                      color: "#fff",
                    }}
                  >
                    <GitBranch size={13} /> {rel.version}
                  </span>

                  {rel.isLatest && (
                    <span style={{ padding: "3px 8px", background: "#dcfce7", color: "#166534", borderRadius: "12px", fontSize: "10px", fontWeight: 700, fontFamily: "var(--font-mono)" }}>
                      {isAr ? "الإصدار الأحدث" : "LATEST RELEASE"}
                    </span>
                  )}

                  <span style={{ display: "inline-flex", alignItems: "center", gap: "5px", color: "var(--muted)", fontSize: "11px", fontFamily: "var(--font-mono)" }}>
                    <Clock size={12} /> {rel.releaseDate}
                  </span>

                  <h3 style={{ margin: 0, fontSize: "18px", color: "var(--ink)", fontWeight: 700 }}>
                    {isAr ? rel.titleAr : rel.titleEn}
                  </h3>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <span style={{ fontSize: "11px", color: "var(--muted)", fontFamily: "var(--font-mono)" }}>
                    {rel.changes.length} {isAr ? "ميزات معمارية" : "milestones"}
                  </span>
                  <button
                    type="button"
                    aria-label={isExpanded ? "Collapse" : "Expand"}
                    style={{ background: "none", border: "none", color: "var(--muted)", display: "flex", alignItems: "center" }}
                  >
                    {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                  </button>
                </div>
              </div>

              {/* Release Body */}
              {isExpanded && (
                <div style={{ padding: "24px" }}>
                  <p style={{ margin: "0 0 20px", color: "var(--muted)", fontSize: "13px", lineHeight: "1.65" }}>
                    {isAr ? rel.summaryAr : rel.summaryEn}
                  </p>

                  {/* Release Highlight Badge Strip */}
                  <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginBottom: "22px", padding: "10px 14px", background: "#f8fbfb", borderRadius: "8px", border: "1px dashed var(--line)" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "11px", color: "#2d6356" }}>
                      <CheckCircle2 size={13} color="#16a34a" />
                      <strong>{rel.metrics.tests}</strong>
                    </div>
                    <span style={{ color: "var(--line)" }}>|</span>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "11px", color: "#2d6356" }}>
                      <FileCheck2 size={13} color="#0284c7" />
                      <strong>{rel.metrics.stages}</strong>
                    </div>
                    <span style={{ color: "var(--line)" }}>|</span>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "11px", color: "#556468" }}>
                      <Zap size={13} color="#ca8a04" />
                      <span>{isAr ? rel.metrics.focusAr : rel.metrics.focusEn}</span>
                    </div>
                  </div>

                  {/* Changes Grid */}
                  <div style={{ display: "grid", gap: "14px" }}>
                    {rel.changes.map(item => (
                      <div
                        key={item.id}
                        style={{
                          display: "grid",
                          gridTemplateColumns: "auto 1fr auto",
                          gap: "14px",
                          alignItems: "flex-start",
                          padding: "14px 16px",
                          background: "#ffffff",
                          border: "1px solid #edf1f2",
                          borderRadius: "10px",
                          transition: "border-color 0.15s ease",
                        }}
                      >
                        <div
                          style={{
                            display: "grid",
                            placeItems: "center",
                            width: "32px",
                            height: "32px",
                            borderRadius: "8px",
                            background:
                              item.category === "core"
                                ? "#e0f2fe"
                                : item.category === "ai"
                                ? "#f3e8ff"
                                : item.category === "security"
                                ? "#dcfce7"
                                : "#fef3c7",
                            color:
                              item.category === "core"
                                ? "#0369a1"
                                : item.category === "ai"
                                ? "#7e22ce"
                                : item.category === "security"
                                ? "#15803d"
                                : "#b45309",
                          }}
                        >
                          {item.category === "core" && <Cpu size={16} />}
                          {item.category === "ai" && <Sparkles size={16} />}
                          {item.category === "security" && <ShieldCheck size={16} />}
                          {item.category === "ui" && <Landmark size={16} />}
                        </div>

                        <div>
                          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap", marginBottom: "4px" }}>
                            <h4 style={{ margin: 0, fontSize: "14px", fontWeight: 700, color: "var(--ink)" }}>
                              {isAr ? item.titleAr : item.titleEn}
                            </h4>
                            <span
                              style={{
                                fontSize: "10px",
                                fontFamily: "var(--font-mono)",
                                padding: "2px 6px",
                                background: "#f1f5f9",
                                color: "#475569",
                                borderRadius: "4px",
                              }}
                            >
                              {isAr ? item.tagAr : item.tagEn}
                            </span>
                          </div>
                          <p style={{ margin: 0, fontSize: "12px", color: "var(--muted)", lineHeight: "1.55" }}>
                            {isAr ? item.descAr : item.descEn}
                          </p>
                        </div>

                        {item.badgeEn && (
                          <span
                            style={{
                              fontSize: "10px",
                              fontFamily: "var(--font-mono)",
                              padding: "3px 7px",
                              borderRadius: "4px",
                              background: "#ecfdf5",
                              color: "#047857",
                              border: "1px solid #a7f3d0",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {isAr ? item.badgeAr : item.badgeEn}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </article>
          );
        })}
      </div>

      {/* Footer Assurance */}
      <section
        className="panel"
        style={{
          marginTop: "30px",
          padding: "20px 24px",
          background: "#0d261e",
          color: "#fff",
          borderRadius: "12px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "16px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <Shield size={22} color="#5eead4" />
          <div>
            <h4 style={{ margin: 0, fontSize: "14px", color: "#f0fdfa" }}>
              {isAr ? "معايير الحوكمة والتحقق المستمر" : "Continuous Governance & Quality Assurance"}
            </h4>
            <p style={{ margin: "2px 0 0", fontSize: "11px", color: "#99f6e4" }}>
              {isAr
                ? "يتم تشغيل كافة الاختبارات الحتمية واختبارات عدم الانحدار تلقائياً قبل اعتماد أي إصدار في المستودع."
                : "All deterministic policy benchmarks and regression suites execute automatically on every release."}
            </p>
          </div>
        </div>

        <div style={{ display: "flex", gap: "10px" }}>
          <a
            href="https://github.com/4lli48/sentinelai-hackathon-demo"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              padding: "7px 12px",
              borderRadius: "6px",
              background: "rgba(255,255,255,0.12)",
              color: "#fff",
              fontSize: "11px",
              fontFamily: "var(--font-mono)",
              border: "1px solid rgba(255,255,255,0.2)",
            }}
          >
            <ExternalLink size={12} />
            <span>{isAr ? "المستودع الرسمي" : "GitHub Repo"}</span>
          </a>
        </div>
      </section>
    </SentinelLayout>
  );
}
