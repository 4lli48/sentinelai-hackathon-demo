import { useDemo } from "@/contexts/DemoContext";
import { useTheme } from "@/contexts/ThemeContext";
import { pageTransitionKey } from "@/lib/pageTransition";
import { summarizeResultSources } from "@/lib/resultSources";
import { trpc } from "@/lib/trpc";
import { cn } from "@/lib/utils";
import { useOperationsWorkspace } from "@/contexts/OperationsWorkspaceContext";
import { Activity, BookOpenText, ChevronRight, FileSearch, GitCommit, Grid2X2, Landmark, Languages, Menu, Moon, RotateCcw, ShieldCheck, Sun, X } from "lucide-react";
import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";

const nav = [
  { path: "/", icon: Grid2X2, en: "Overview", ar: "نظرة عامة" },
  { path: "/bank", icon: Landmark, en: "Transfer review", ar: "مراجعة التحويل" },
  { path: "/operations", icon: FileSearch, en: "Operations workspace", ar: "مساحة العمليات" },
  { path: "/methodology", icon: BookOpenText, en: "Governance", ar: "الحوكمة والمنهجية" },
  { path: "/changelog", icon: GitCommit, en: "Engineering log", ar: "سجل التحديثات" },
];

export default function SentinelLayout({ children, eyebrow, title, aside, forceShell = false }: { children: ReactNode; eyebrow: string; title: string; aside?: ReactNode; forceShell?: boolean }) {
  const { locale, setLocale, results, resetSession } = useDemo();
  const { theme, toggleTheme } = useTheme();
  const [location, setLocation] = useLocation();
  const isAr = locale === "ar";
  const pageKey = pageTransitionKey(location);
  const persistedResults = trpc.sentinel.persistedResults.useQuery();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const sourceSummary = summarizeResultSources(results, persistedResults.data ?? []);
  const embeddedInOperationsWorkspace = useOperationsWorkspace();
  useEffect(() => setMobileNavOpen(false), [location]);
  if (embeddedInOperationsWorkspace && !forceShell) return <>{children}</>;
  return (
    <div className="app-shell" dir={isAr ? "rtl" : "ltr"}>
      <aside className="sentinel-sidebar">
        <Link href="/" className="brand-lockup">
          <span className="brand-mark"><Landmark size={19} /></span>
          <span><strong>SENTINEL<span>AI</span></strong><small>{isAr ? "العمليات المصرفية" : "banking operations"}</small></span>
        </Link>
        <div className="side-caption">{isAr ? "ذكاء مخاطر محلي · الإصدار 1.0" : "LOCAL RISK INTELLIGENCE · v1.0"}</div>
        <button className="mobile-nav-trigger" type="button" onClick={() => setMobileNavOpen(open => !open)} aria-controls="sentinel-mobile-nav" aria-expanded={mobileNavOpen}>
          {mobileNavOpen ? <X size={17} /> : <Menu size={17} />}<span>{isAr ? "القائمة" : "Menu"}</span>
        </button>
        <nav id="sentinel-mobile-nav" className={cn("side-nav", mobileNavOpen && "mobile-nav-open")}>
          {nav.map(item => {
            const active = item.path === "/" ? location === "/" : location.startsWith(item.path);
            return <Link key={item.path} href={item.path} onClick={() => setMobileNavOpen(false)} className={cn("nav-item", active && "nav-active")}>
              <item.icon size={17} /><span>{isAr ? item.ar : item.en}</span>{active && <ChevronRight size={15} className="nav-arrow" />}
            </Link>;
          })}
        </nav>
        <div className="side-bottom">
          <div className="system-pulse"><i /> {isAr ? "حالة الخدمة طبيعية" : "Service status normal"}</div>
          <div className="mini-stat"><span>{isAr ? "سجل Sentinel" : "Sentinel records"}</span><b>{sourceSummary.persisted.toString().padStart(2, "0")}</b></div>
          {sourceSummary.sessionOnly > 0 ? <div className="mini-stat mini-stat-session"><span>{isAr ? "نتائج الجلسة" : "Session results"}</span><b>+{sourceSummary.sessionOnly}</b></div> : null}
        </div>
      </aside>
      <main className="main-canvas">
        <header className="topbar">
          <div>
            <p className="eyebrow"><span /> {eyebrow}</p>
            <h1>{title}</h1>
          </div>
          <div className="top-actions">
            <div className="advisory-tag"><ShieldCheck size={14} /> {isAr ? "استدلال ذكاء محلي · بيئة محمية" : "Local AI Inference · Protected Environment"}</div>
            <button className="session-reset-button" onClick={() => { if (window.confirm(isAr ? "سيتم مسح نتائج جلسة العرض من هذا المتصفح فقط. هل تريد المتابعة؟" : "This clears demo results from this browser only. Continue?")) { resetSession(); setLocation("/"); } }}><RotateCcw size={14} /><span>{isAr ? "جلسة جديدة" : "New session"}</span></button>
            <button className="theme-toggle" type="button" onClick={toggleTheme} aria-label={theme === "light" ? (isAr ? "تفعيل الوضع الداكن" : "Enable dark mode") : (isAr ? "تفعيل الوضع الفاتح" : "Enable light mode")} title={theme === "light" ? (isAr ? "الوضع الداكن" : "Dark mode") : (isAr ? "الوضع الفاتح" : "Light mode")}>
              {theme === "light" ? <Moon size={16} /> : <Sun size={16} />}<span>{theme === "light" ? (isAr ? "داكن" : "Dark") : (isAr ? "فاتح" : "Light")}</span>
            </button>
            <button className="language-toggle" onClick={() => setLocale(isAr ? "en" : "ar")}><Languages size={15} /> {isAr ? "EN" : "ع"}</button>
          </div>
        </header>
        <div className="geometry-orbit orbit-a" /><div className="geometry-orbit orbit-b" />
        <section className="page-content page-transition" key={pageKey}>{children}</section>
        {aside && <aside className="page-aside">{aside}</aside>}
      </main>
    </div>
  );
}
