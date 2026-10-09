import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

import { companyKey } from "@/lib/data";

export type TabId = "restaurants" | "contacts" | "emails";
export const TABS: { id: TabId; label: string }[] = [
  { id: "restaurants", label: "Restaurants" },
  { id: "contacts", label: "Contact Info" },
  { id: "emails", label: "Sample Emails" },
];

/** A company the user jumped to from another tab; its rows stay highlighted. */
export interface Focus {
  tab: TabId;
  from: TabId;
  key: string;
  label: string;
  nonce: number;
}

interface NavState {
  tab: TabId;
  focus: Focus | null;
  /** Switch tabs by hand (clears any highlight). */
  setTab: (tab: TabId) => void;
  /** Jump to another tab and highlight a company's entry there. */
  goTo: (tab: TabId, company: string) => void;
  clearFocus: () => void;
  hiddenOpen: "readMe" | "dropped" | null;
  openHidden: (page: "readMe" | "dropped" | null) => void;
}

const NavContext = createContext<NavState | null>(null);

export function useNav() {
  const ctx = useContext(NavContext);
  if (!ctx) throw new Error("useNav must be used inside <NavProvider>");
  return ctx;
}

const fromHash = (): TabId => {
  const h = window.location.hash.replace("#", "") as TabId;
  return TABS.some((t) => t.id === h) ? h : "restaurants";
};

export function NavProvider({ children }: { children: ReactNode }) {
  const [tab, setTabState] = useState<TabId>(fromHash);
  const [focus, setFocus] = useState<Focus | null>(null);
  const [hiddenOpen, openHidden] = useState<NavState["hiddenOpen"]>(null);

  useEffect(() => {
    window.history.replaceState(null, "", `#${tab}`);
  }, [tab]);

  const setTab = useCallback((next: TabId) => {
    setTabState(next);
    setFocus(null);
  }, []);

  const goTo = useCallback(
    (next: TabId, company: string) => {
      setFocus((prev) => ({
        tab: next,
        from: tab,
        key: companyKey(company),
        label: company,
        nonce: (prev?.nonce ?? 0) + 1,
      }));
      setTabState(next);
    },
    [tab],
  );

  const clearFocus = useCallback(() => setFocus(null), []);

  const value = useMemo(
    () => ({ tab, focus, setTab, goTo, clearFocus, hiddenOpen, openHidden }),
    [tab, focus, setTab, goTo, clearFocus, hiddenOpen],
  );
  return <NavContext.Provider value={value}>{children}</NavContext.Provider>;
}
