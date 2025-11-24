import type {PermissionKey} from "~/shared/permissions";

export const HasPermission = (perms?: Set<PermissionKey>) => {
    return (key: PermissionKey) => perms?.has(key)
}