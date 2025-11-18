"use client";

import { createContext, type ReactNode, useContext } from "react";
import type { UserSession } from "../../../utils/auth-actions";

const SessionContext = createContext<UserSession | null>(null);

interface SessionProviderProps {
  children: ReactNode;
  session: UserSession;
}

export function SessionProvider({ children, session }: SessionProviderProps) {
  return (
    <SessionContext.Provider value={session ?? null}>
      {children}
    </SessionContext.Provider>
  );
}

export function useSessionContext() {
  return useContext(SessionContext);
}
