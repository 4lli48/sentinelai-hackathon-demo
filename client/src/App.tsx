import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { DemoProvider } from "@/contexts/DemoContext";
import BankPortal from "@/pages/BankPortal";
import Methodology from "@/pages/Methodology";
import Changelog from "@/pages/Changelog";
import NotFound from "@/pages/NotFound";
import OperationsWorkspace from "@/pages/OperationsWorkspace";
import { Redirect, Route, Switch, useSearch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";

function Router() {
  return <Switch>
    <Route path="/" component={Home} />
    <Route path="/bank" component={BankPortal} />
    <Route path="/operations" component={OperationsWorkspace} />
    <Route path="/analysis" component={() => <LegacyOperationsRedirect view="decision" />} />
    <Route path="/investigation" component={() => <LegacyOperationsRedirect view="investigation" />} />
    <Route path="/cases" component={() => <LegacyOperationsRedirect view="cases" />} />
    <Route path="/methodology" component={Methodology} />
    <Route path="/changelog" component={Changelog} />
    <Route path="/404" component={NotFound} />
    <Route component={NotFound} />
  </Switch>;
}

function LegacyOperationsRedirect({ view }: { view: "decision" | "investigation" | "cases" }) {
  const search = useSearch().replace(/^\?/, "");
  return <Redirect to={`/operations?view=${view}${search ? `&${search}` : ""}`} />;
}

function App() {
  return <ErrorBoundary><ThemeProvider defaultTheme="light" switchable><TooltipProvider><DemoProvider><Toaster /><Router /></DemoProvider></TooltipProvider></ThemeProvider></ErrorBoundary>;
}

export default App;
