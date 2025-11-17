"use client";

import {api} from "~/trpc/react";
import type {PermissionKey} from "~/shared/permissions";
import { useSession } from "../../utils/auth-client";

export function usePermission() {
    const { data: s } = useSession();
    const { data, isLoading } = api.auth.getMyPermissions.useQuery(undefined, {
        enabled: !!s?.user,
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