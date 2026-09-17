import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { Feedback, Preferences, ToneFit, ToneShift } from "./types";

type PersistedState = {
  sourceProductIds: string[];
  sourceShadeIds: Record<string, string>;
  sourceFits: Record<string, ToneFit>;
  sourceShifts: Record<string, ToneShift[]>;
  sourceProductId: string | null;
  sourceShadeId: string | null;
  fit: ToneFit | null;
  shifts: ToneShift[];
  preferences: Preferences;
  saved: string[];
  feedback: Record<string, Feedback>;
};

type AppStore = PersistedState & {
  toggleSourceProductId: (value: string) => void;
  setSourceShadeForProduct: (productId: string, shadeId: string) => void;
  setSourceFit: (productId: string, value: ToneFit) => void;
  toggleSourceShift: (productId: string, value: ToneShift) => void;
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
  sourceProductIds: [],
  sourceShadeIds: {},
  sourceFits: {},
  sourceShifts: {},
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
    if (!value) return initialState;
    const parsed = JSON.parse(value) as Partial<PersistedState>;
    const sourceProductIds = parsed.sourceProductIds?.length
      ? parsed.sourceProductIds
      : parsed.sourceProductId
        ? [parsed.sourceProductId]
        : [];
    const sourceShadeIds = parsed.sourceShadeIds ?? (
      parsed.sourceProductId && parsed.sourceShadeId
        ? { [parsed.sourceProductId]: parsed.sourceShadeId }
        : {}
    );
    const sourceProductId = sourceProductIds[0] ?? null;
    return {
      ...initialState,
      ...parsed,
      sourceProductIds,
      sourceShadeIds,
      sourceProductId,
      sourceShadeId: sourceProductId ? sourceShadeIds[sourceProductId] ?? null : null,
    };
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
    toggleSourceProductId: (productId) => setState((current) => {
      const selected = current.sourceProductIds.includes(productId);
      const sourceProductIds = selected
        ? current.sourceProductIds.filter((id) => id !== productId)
        : [...current.sourceProductIds, productId];
      const sourceShadeIds = { ...current.sourceShadeIds };
      const sourceFits = { ...current.sourceFits };
      const sourceShifts = { ...current.sourceShifts };
      if (selected) delete sourceShadeIds[productId];
      if (selected) delete sourceFits[productId];
      if (selected) delete sourceShifts[productId];
      const sourceProductId = sourceProductIds[0] ?? null;
      return {
        ...current,
        sourceProductIds,
        sourceShadeIds,
        sourceFits,
        sourceShifts,
        sourceProductId,
        sourceShadeId: sourceProductId ? sourceShadeIds[sourceProductId] ?? null : null,
      };
    }),
    setSourceShadeForProduct: (productId, shadeId) => setState((current) => {
      const sourceShadeIds = { ...current.sourceShadeIds, [productId]: shadeId };
      const sourceProductId = current.sourceProductIds[0] ?? productId;
      return {
        ...current,
        sourceProductId,
        sourceShadeIds,
        sourceShadeId: sourceShadeIds[sourceProductId] ?? null,
      };
    }),
    setSourceFit: (productId, value) => setState((current) => ({
      ...current,
      sourceFits: { ...current.sourceFits, [productId]: value },
      fit: productId === current.sourceProductIds[0] ? value : current.fit,
    })),
    toggleSourceShift: (productId, value) => setState((current) => {
      const currentShifts = current.sourceShifts[productId] ?? [];
      const nextShifts = currentShifts.includes(value)
        ? currentShifts.filter((item) => item !== value)
        : [...currentShifts, value];
      return {
        ...current,
        sourceShifts: { ...current.sourceShifts, [productId]: nextShifts },
        shifts: productId === current.sourceProductIds[0] ? nextShifts : current.shifts,
      };
    }),
    setSourceProductId: (sourceProductId) => setState((current) => ({
      ...current,
      sourceProductIds: sourceProductId ? [sourceProductId] : [],
      sourceShadeIds: {},
      sourceFits: {},
      sourceShifts: {},
      sourceProductId,
      sourceShadeId: null,
    })),
    setSourceShadeId: (sourceShadeId) => setState((current) => ({
      ...current,
      sourceShadeId,
      sourceShadeIds: current.sourceProductId && sourceShadeId
        ? { ...current.sourceShadeIds, [current.sourceProductId]: sourceShadeId }
        : current.sourceShadeIds,
    })),
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
    resetMatch: () => setState((current) => ({ ...current, sourceProductIds: [], sourceShadeIds: {}, sourceFits: {}, sourceShifts: {}, sourceProductId: null, sourceShadeId: null, fit: null, shifts: [], preferences: initialState.preferences })),
  }), [state]);

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useAppStore() {
  const store = useContext(StoreContext);
  if (!store) throw new Error("useAppStore must be used inside StoreProvider");
  return store;
}
