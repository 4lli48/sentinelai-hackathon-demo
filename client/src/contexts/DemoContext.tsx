import type { AnalysisResult, Locale } from "@shared/sentinel";
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { clearDemoResults, DEMO_RESULTS_STORAGE_KEY } from "@/lib/demoSession";

type DemoState = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  results: AnalysisResult[];
  pushResult: (result: AnalysisResult) => void;
  resetSession: () => void;
  current?: AnalysisResult;
};

const DemoContext = createContext<DemoState | undefined>(undefined);
export function DemoProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("en");
  const [results, setResults] = useState<AnalysisResult[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem(DEMO_RESULTS_STORAGE_KEY);
    if (saved) {
      try { setResults(JSON.parse(saved)); } catch { localStorage.removeItem(DEMO_RESULTS_STORAGE_KEY); }
    }
    const savedLocale = localStorage.getItem("sentinelai-locale") as Locale | null;
    if (savedLocale === "ar" || savedLocale === "en") setLocaleState(savedLocale);
  }, []);

  const setLocale = (next: Locale) => {
    setLocaleState(next);
    localStorage.setItem("sentinelai-locale", next);
    document.documentElement.dir = next === "ar" ? "rtl" : "ltr";
    document.documentElement.lang = next;
  };

  const pushResult = (result: AnalysisResult) => {
    setResults(previous => {
      const next = [result, ...previous.filter(item => item.id !== result.id)].slice(0, 12);
      localStorage.setItem(DEMO_RESULTS_STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  };

  const resetSession = () => {
    setResults([]);
    clearDemoResults(localStorage);
  };

  const value = useMemo(() => ({ locale, setLocale, results, pushResult, resetSession, current: results[0] }), [locale, results]);
  return <DemoContext.Provider value={value}>{children}</DemoContext.Provider>;
}

export function useDemo() {
  const context = useContext(DemoContext);
  if (!context) throw new Error("useDemo must be used inside DemoProvider");
  return context;
}
