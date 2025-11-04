"use client";

import { api } from "~/trpc/react";
import type { PermissionKey } from "~/shared/permissions";

export function usePermission({ enabled = true } = {}) {
  const { data } = api.auth.getMyPermissions.useQuery(undefined, {
    enabled,
  });
  const perms = data ?? [];

  return (key: PermissionKey): boolean => perms.includes(key);
}
