// app/_components/session-provider.tsx
"use client";

import { createContext, type ReactNode, useContext } from "react";
import { useSession as useBetterAuthSession } from "~/../utils/auth-client";
import type { getUserSession } from "../../../utils/auth-actions";

type SessionType = Awaited<ReturnType<typeof getUserSession>>;

const SessionContext = createContext<{
  serverSession: SessionType | null;
  clientSession: ReturnType<typeof useBetterAuthSession>;
} | null>(null);

interface SessionProviderProps {
  children: ReactNode;
  session?: SessionType;
}

export function SessionProvider({
  children,
  session: serverSession,
}: SessionProviderProps) {
  const clientSession = useBetterAuthSession();

  return (
    <SessionContext.Provider
      value={{ serverSession: serverSession ?? null, clientSession }}
    >
      {children}
    </SessionContext.Provider>
  );
}

export function useSessionContext() {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error("useSessionContext must be used within SessionProvider");
  }

  const { serverSession, clientSession } = context;

  // Use server session for initial fast render, then switch to client session when there is no session.
  const hasClientData = clientSession?.data !== undefined;

  return hasClientData ? serverSession : clientSession.data;
}
