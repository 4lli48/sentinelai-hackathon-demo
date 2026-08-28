import { createContext, useContext, type ReactNode } from "react";

export type OperationsWorkspaceView = "decision" | "investigation" | "cases";

const OperationsWorkspaceContext = createContext(false);

export function OperationsWorkspaceProvider({ children }: { children: ReactNode }) {
  return <OperationsWorkspaceContext.Provider value>{children}</OperationsWorkspaceContext.Provider>;
}

export function useOperationsWorkspace() {
  return useContext(OperationsWorkspaceContext);
}

export function operationsWorkspaceHref(view: OperationsWorkspaceView, id?: string) {
  const query = new URLSearchParams({ view });
  if (id) query.set("id", id);
  return `/operations?${query.toString()}`;
}
