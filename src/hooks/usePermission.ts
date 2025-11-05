"use client";

import {api} from "~/trpc/react";
import type {PermissionKey} from "~/shared/permissions";

export function usePermission({enabled = true} = {}) {
    const {data, isLoading} = api.auth.getMyPermissions.useQuery(undefined, {
        enabled,
    });
    const perms = data ?? [];

    return {
        hasPermission: (key: PermissionKey): boolean => perms.includes(key),
        isLoading
    };
}
