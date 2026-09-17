export type Finish = "matte" | "natural" | "radiant";
export type SkinType = "dry" | "oily" | "combination" | "normal" | "unknown";
export type Budget = "any" | "3000" | "5000";
export type ToneFit = "perfect" | "lighter" | "darker";
export type ToneShift = "yellow" | "pink";

export type Shade = {
  id: string;
  code: string;
  name: string;
  swatch: string;
};

export type Product = {
  id: string;
  brand: string;
  name: string;
  description: string;
  finish: Finish;
  skinTypes: Exclude<SkinType, "unknown">[];
  price: number;
  available: boolean;
  bottle: "round" | "square" | "soft";
  image?: string;
  shades: Shade[];
};

export type DemoMatch = {
  sourceShadeId: string;
  targetShadeId: string;
  level: "close" | "possible";
  explanation: string;
};

export type Preferences = {
  skinType: SkinType;
  finish: Finish | null;
  budget: Budget;
};

export type Feedback = {
  tried: boolean;
  color: "matched" | "lighter" | "darker" | "yellow" | "pink";
  formula: "liked" | "disliked";
};
