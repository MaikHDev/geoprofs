"use client";

import { useSessionContext } from "~/app/_components/session-provider";
import { HasPermission } from "../../../../utils/hasPermission";
import ReturnView from "~/app/_components/returnView";
import React, { type FormEvent, useEffect, useState } from "react";
import { api } from "~/trpc/react";
import { toast } from "react-toastify";

export default function CreateUser() {
  const session = useSessionContext();
  const hasPermission = HasPermission(session?.perms);

  const createUser = api.userAccount.createAccount.useMutation({
    onSuccess: () => {
      toast.success("Successfully created user!");
      // Reset form
      setFirstName("");
      setLastName("");
      setEmail("");
      setPassword("");
      setVacationDays(null);
      setCsn("");
      setError("");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const { data: useableRoles, isLoading: loadingRoles } =
    api.auth.getRoles.useQuery(undefined, {
      retry: (failureCount, error) => {
        if (error?.data?.code === "UNAUTHORIZED") return false;

        return failureCount < 3;
      },
      refetchOnWindowFocus: false,
    });

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState<string | null>("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [vacationDays, setVacationDays] = useState<number | null>(null);
  const [csn, setCsn] = useState<string | null>("");
  const [role, setRole] = useState("");

  const [error, setError] = useState<string>("");

  useEffect(() => {
    if (useableRoles?.[0] && useableRoles.length > 0 && !role) {
      setRole(useableRoles[0]);
    }
  }, [useableRoles, role]);

  if (!session) {
    return (
      <ReturnView
        returnPath="/auth"
        returnName="Login"
        label="You need to be logged in for this action!"
      />
    );
  }
  if (!hasPermission("UserUseOthers.create")) {
    return <ReturnView returnName="Dashboard" returnPath="/dashboard" />;
  }

  const handleUserCreation = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    const pass = password.trim();

    if (!firstName) {
      setError("You need to set the firstname!");
      return;
    }
    if (!email) {
      setError("You need to set the email!");
      return;
    }
    if (!pass) {
      setError("You need to set the password!");
      return;
    }
    if (pass.length < 8) {
      setError("Password needs to be 8 characters or more!");
      return;
    }
    if (!role) {
      setError("You need to select a role!");
      return;
    }

    const userData = {
      name: firstName,
      email,
      password: pass,
      role,
      ...(vacationDays && { vacationDays }),
      ...(lastName && { lastName }),
      ...(csn && { csn }),
    };

    await createUser.mutateAsync(userData);
  };

  return (
    <div className="px-4 py-8">
      <div className="mx-auto w-full max-w-4xl space-y-6 rounded-[4px] border border-[#CCCCCC] bg-white p-8 shadow-md">
        <h1 className="text-center text-2xl font-semibold text-[#000000]">
          Create New User
        </h1>

        {loadingRoles && (
          <div className="font-semibold text-blue-500">Loading roles...</div>
        )}

        {error && (
          <div className="rounded-[4px] border border-red-300 bg-red-50 p-3 font-semibold text-red-500">
            {error}
          </div>
        )}

        <form onSubmit={handleUserCreation} className="space-y-4">
          <div className="flex flex-col">
            <label className="mb-1 font-medium text-[#000000]">
              First Name: <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
              placeholder="Enter first name"
              className="rounded-[4px] border border-[#CCCCCC] px-3 py-2 text-[#000000] transition-colors focus:border-[#00888F] focus:outline-none focus:ring-1 focus:ring-[#00888F]"
            />
          </div>

          <div className="flex flex-col">
            <label className="mb-1 font-medium text-[#000000]">
              Last Name:
            </label>
            <input
              type="text"
              value={lastName ?? ""}
              onChange={(e) => setLastName(e.target.value)}
              placeholder="Enter last name"
              className="rounded-[4px] border border-[#CCCCCC] px-3 py-2 text-[#000000] transition-colors focus:border-[#00888F] focus:outline-none focus:ring-1 focus:ring-[#00888F]"
            />
          </div>

          <div className="flex flex-col">
            <label className="mb-1 font-medium text-[#000000]">
              Email: <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="Enter email address"
              className="rounded-[4px] border border-[#CCCCCC] px-3 py-2 text-[#000000] transition-colors focus:border-[#00888F] focus:outline-none focus:ring-1 focus:ring-[#00888F]"
            />
          </div>

          <div className="flex flex-col">
            <label className="mb-1 font-medium text-[#000000]">
              Password: <span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Enter password (min 8 characters)"
              className="rounded-[4px] border border-[#CCCCCC] px-3 py-2 text-[#000000] transition-colors focus:border-[#00888F] focus:outline-none focus:ring-1 focus:ring-[#00888F]"
            />
          </div>

          <div className="flex flex-col">
            <label className="mb-1 font-medium text-[#000000]">
              Vacation Days:
            </label>
            <input
              type="number"
              value={vacationDays ?? ""}
              onChange={(e) => setVacationDays(e.target.valueAsNumber || null)}
              placeholder="Enter vacation days"
              className="rounded-[4px] border border-[#CCCCCC] px-3 py-2 text-[#000000] transition-colors focus:border-[#00888F] focus:outline-none focus:ring-1 focus:ring-[#00888F]"
            />
          </div>

          <div className="flex flex-col">
            <label className="mb-1 font-medium text-[#000000]">CSN:</label>
            <input
              type="text"
              value={csn ?? ""}
              onChange={(e) => setCsn(e.target.value)}
              placeholder="Enter CSN"
              className="rounded-[4px] border border-[#CCCCCC] px-3 py-2 text-[#000000] transition-colors focus:border-[#00888F] focus:outline-none focus:ring-1 focus:ring-[#00888F]"
            />
          </div>

          <div className="flex flex-col">
            <label className="mb-1 font-medium text-[#000000]">
              Role: <span className="text-red-500">*</span>
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              disabled={loadingRoles || !useableRoles || useableRoles.length === 0}
              className="rounded-[4px] border border-[#CCCCCC] px-3 py-2 text-[#000000] transition-colors focus:border-[#00888F] focus:outline-none focus:ring-1 focus:ring-[#00888F] disabled:cursor-not-allowed disabled:bg-gray-50"
            >
              {!role && <option value="">Select a role...</option>}
              {useableRoles?.map((rl) => (
                <option key={rl} value={rl}>
                  {rl}
                </option>
              ))}
            </select>
          </div>

          <div className="border-t border-[#CCCCCC] pt-4">
            <button
              type="submit"
              disabled={loadingRoles || createUser.isPending}
              className={`w-full rounded-[4px] px-6 py-2 font-semibold text-white transition-colors ${
                loadingRoles || createUser.isPending
                  ? "cursor-not-allowed bg-[#CCCCCC]"
                  : "bg-[#00888F] hover:bg-[#00767C]"
              }`}
            >
              {createUser.isPending ? "Creating User..." : "Create User"}
            </button>
          </div>

          <p className="text-center text-sm text-gray-600">
            <span className="text-red-500">*</span> Required fields
          </p>
        </form>
      </div>
    </div>
  );
}