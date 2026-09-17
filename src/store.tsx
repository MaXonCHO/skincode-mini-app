import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { Feedback, Preferences, ToneFit, ToneShift } from "./types";

type PersistedState = {
  sourceProductId: string | null;
  sourceShadeId: string | null;
  fit: ToneFit | null;
  shifts: ToneShift[];
  preferences: Preferences;
  saved: string[];
  feedback: Record<string, Feedback>;
};

type AppStore = PersistedState & {
  setSourceProductId: (value: string | null) => void;
  setSourceShadeId: (value: string | null) => void;
  setFit: (value: ToneFit | null) => void;
  toggleShift: (value: ToneShift) => void;
  setPreferences: (value: Preferences) => void;
  toggleSaved: (shadeId: string) => void;
  setFeedback: (shadeId: string, feedback: Feedback) => void;
  resetMatch: () => void;
};

const initialState: PersistedState = {
  sourceProductId: null,
  sourceShadeId: null,
  fit: null,
  shifts: [],
  preferences: { skinType: "unknown", finish: null, budget: "any" },
  saved: [],
  feedback: {},
};

const StoreContext = createContext<AppStore | null>(null);
const storageKey = "skincode-demo-state-v1";

function readState(): PersistedState {
  try {
    const value = localStorage.getItem(storageKey);
    return value ? { ...initialState, ...JSON.parse(value) } : initialState;
  } catch {
    return initialState;
  }
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<PersistedState>(readState);

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(state));
  }, [state]);

  const value = useMemo<AppStore>(() => ({
    ...state,
    setSourceProductId: (sourceProductId) => setState((current) => ({ ...current, sourceProductId, sourceShadeId: null })),
    setSourceShadeId: (sourceShadeId) => setState((current) => ({ ...current, sourceShadeId })),
    setFit: (fit) => setState((current) => ({ ...current, fit })),
    toggleShift: (shift) => setState((current) => ({
      ...current,
      shifts: current.shifts.includes(shift) ? current.shifts.filter((item) => item !== shift) : [...current.shifts, shift],
    })),
    setPreferences: (preferences) => setState((current) => ({ ...current, preferences })),
    toggleSaved: (shadeId) => setState((current) => ({
      ...current,
      saved: current.saved.includes(shadeId) ? current.saved.filter((id) => id !== shadeId) : [...current.saved, shadeId],
    })),
    setFeedback: (shadeId, feedback) => setState((current) => ({
      ...current,
      feedback: { ...current.feedback, [shadeId]: feedback },
    })),
    resetMatch: () => setState((current) => ({ ...current, sourceProductId: null, sourceShadeId: null, fit: null, shifts: [], preferences: initialState.preferences })),
  }), [state]);

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useAppStore() {
  const store = useContext(StoreContext);
  if (!store) throw new Error("useAppStore must be used inside StoreProvider");
  return store;
}
