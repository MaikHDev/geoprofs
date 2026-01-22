"use client";

import { api } from "~/trpc/react";
import type { PermissionKey } from "~/shared/permissions";

export function usePermission() {
  const { data: s } = api.userAccount.getUserSession.useQuery();
  const { data, isLoading } = api.auth.getMyPermissions.useQuery(undefined, {
    enabled: !s?.user,
    retry: (failureCount, error) => {
      if (error?.data?.code === "UNAUTHORIZED") return false;

      return failureCount < 3;
    },
  });
  const perms = data ?? [];

  return {
    hasPermission: (key: PermissionKey): boolean => perms.includes(key),
    isLoading,
  };
}
