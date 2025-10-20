"use client";

import { api } from "~/trpc/react";
import type { PermissionKey } from "~/shared/permissions";

export function usePermission() {
  const { data } = api.auth.getMyPermissions.useQuery();
  const perms = data ?? [];

  return (key: PermissionKey): boolean => perms.includes(key);
}
