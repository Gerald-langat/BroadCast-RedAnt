// context/ScopeContext.tsx
"use client"
import { createContext, useContext, useState, ReactNode } from "react";

// 🔑 Define all possible scopes
export type Scope = "Home" | string;


type ScopeContextType = {
  scope: Scope;
  setScope: (value: Scope) => void;
};

const ScopeContext = createContext<ScopeContextType | undefined>(undefined);

export const ScopeProvider = ({ children }: { children: ReactNode }) => {
  const [scope, setScope] = useState<Scope>("Home"); // default = home

  return (
    <ScopeContext.Provider value={{ scope, setScope }}>
      {children}
    </ScopeContext.Provider>
  );
};

export const useScope = () => {
  const context = useContext(ScopeContext);
  if (!context) throw new Error("useScope must be used within ScopeProvider");
  return context;
};
