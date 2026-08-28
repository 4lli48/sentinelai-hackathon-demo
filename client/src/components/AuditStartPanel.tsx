import { ChevronRight, ShieldCheck, type LucideIcon } from "lucide-react";
import { Link } from "wouter";

type AuditStartPanelProps = {
  icon: LucideIcon;
  eyebrow: string;
  title: string;
  description: string;
  steps: string[];
  action: string;
  href: string;
  standalone?: boolean;
  compact?: boolean;
};

export function AuditStartPanel({ icon: Icon, eyebrow, title, description, steps, action, href, standalone = false, compact = false }: AuditStartPanelProps) {
  return <section className={`audit-start${standalone ? " panel" : ""}${compact ? " audit-start--compact" : ""}`}>
    <div className="audit-start-seal"><Icon size={24} /></div>
    <div className="audit-start-copy"><span className="audit-start-kicker"><ShieldCheck size={13} /> {eyebrow}</span><h2>{title}</h2><p>{description}</p></div>
    <ol className="audit-start-rail">{steps.map((step, index) => <li key={step}><span>{String(index + 1).padStart(2, "0")}</span><b>{step}</b></li>)}</ol>
    <Link href={href} className="primary-button audit-start-action">{action}<ChevronRight size={17} /></Link>
  </section>;
}
