// context/ScopeContext.tsx
"use client"
import { createContext, useContext, useState, ReactNode } from "react";

// 🔑 Define all possible scopes
export type Scope = "Home" | string;
export type ScopeCode = 0 | number;


type ScopeContextType = {
  scope: Scope;
  scopeCode: ScopeCode;
  setScopeCode: (value: ScopeCode) => void;
  setScope: (value: Scope) => void;
};

const ScopeContext = createContext<ScopeContextType | undefined>(undefined);

export const ScopeProvider = ({ children }: { children: ReactNode }) => {
  const [scope, setScope] = useState<Scope>("Home"); // default = home
  const [scopeCode, setScopeCode] = useState<ScopeCode>(0); // default = 0

  return (
    <ScopeContext.Provider value={{ scope, setScope, scopeCode, setScopeCode }}>
      {children}
    </ScopeContext.Provider>
  );
};

export const useScope = () => {
  const context = useContext(ScopeContext);
  if (!context) throw new Error("useScope must be used within ScopeProvider");
  return context;
};
