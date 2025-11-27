"use client";

import React, { useEffect, useRef, useState } from "react";
import { api } from "~/trpc/react";
import { ToastContainer, toast } from "react-toastify";
import { usePermission } from "~/hooks/usePermission";
import ReturnView from "~/app/_components/returnView";
import { useParams } from "next/navigation";
import {
  reasonOfLeaveValues,
  type ReasonOfLeave,
} from "../create/createRequestForLeave";
import { TrpcErrorlikeMessages } from "~/trpc/trpc-errorlike-messages";
import ErrorHandler from "~/app/_components/errorHandler";

export default function EditRequestForLeave() {
  const params = useParams();
  const requestId = Number(params.id);

  const { data: session, isLoading: isLoadingSession } =
    api.userAccount.getUserSession.useQuery();
  const { hasPermission, isLoading: loadingPerms } = usePermission();

  const [error, setError] = useState<string | null>(null);
  const [reasonOfLeave, setReasonOfLeave] = useState<ReasonOfLeave>("leave");
  const [dateLeaveStart, setDateLeaveStart] = useState<Date>(new Date());
  const [dateLeaveEnd, setDateLeaveEnd] = useState<Date>(new Date());
  const [reasoning, setReasoning] = useState("");

  const [disabledForm, setDisabledForm] = useState(true);

  const utils = api.useUtils();

  const {
    data: request,
    isLoading,
    error: requestError,
  } = api.requestForLeave.getById.useQuery({
    id: requestId,
  });
  const updateRequest = api.requestForLeave.update.useMutation({
    onSuccess: async () => {
      await utils.requestForLeave.invalidate();
    },
  });

  const startDateRef = useRef<HTMLInputElement>(null);
  const endDateRef = useRef<HTMLInputElement>(null);

  const formatDate = (date: Date): string => date.toISOString().split("T")[0]!;

  const today = formatDate(new Date());

  useEffect(() => {
    if (request && !loadingPerms && hasPermission("LeaveRequest.update")) {
      setReasonOfLeave(request.reasonOfLeave);
      setDateLeaveStart(new Date(request.dateLeaveStart));
      setDateLeaveEnd(new Date(request.dateLeaveEnd));
      setReasoning(request.reasoning);
    }
  }, [hasPermission, loadingPerms, request]);

  useEffect(() => {
    if (!request || loadingPerms) return;
    if (!hasPermission("LeaveRequest.update")) return;

    const isSame =
      dateLeaveStart.getDate() === new Date(request.dateLeaveStart).getDate() &&
      dateLeaveEnd.getDate() === new Date(request.dateLeaveEnd).getDate() &&
      reasonOfLeave === request.reasonOfLeave &&
      reasoning === request.reasoning;

    setDisabledForm(isSame);
  }, [
    dateLeaveStart,
    dateLeaveEnd,
    reasonOfLeave,
    reasoning,
    request,
    loadingPerms,
    hasPermission,
  ]);

  if (!isLoadingSession && !session) {
    return (
      <ReturnView
        label={TrpcErrorlikeMessages.session.message}
        returnName="Login"
        returnPath="/auth"
      />
    );
  }
  if (hasPermission("LeaveRequest.update") && requestError?.data) {
    return (
      <ErrorHandler
        code={requestError.data.code}
        message={requestError.message}
      />
    );
  }

  if (!request && !isLoading) {
    return (
      <h1 className="flex min-h-screen items-center justify-center text-3xl text-red-500">
        You are unable edit this leave request
      </h1>
    );
  }

  if (!loadingPerms && !hasPermission("LeaveRequest.update")) {
    return <ReturnView />;
  }

  async function handleEditRequest(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!dateLeaveStart || !dateLeaveEnd) {
      setError("Please select start and end dates.");
      return;
    }

    if (dateLeaveEnd < dateLeaveStart) {
      setError("End date cannot be before the start date.");
      return;
    }

    if (dateLeaveStart < new Date(today)) {
      setError("Start date cannot be in the past.");
      return;
    }

    try {
      await updateRequest.mutateAsync({
        id: requestId,
        subject: "Leave Request",
        reasonOfLeave,
        dateLeaveStart,
        dateLeaveEnd,
        reasoning,
      });

      toast.success("Leave request updated successfully!");
      setDisabledForm(true);
    } catch (err) {
      if (err && err instanceof Error) {
        setError(err.message ?? "Unknown error");
        toast.error(err.message);
      }
    }
  }

  if (isLoading || loadingPerms || isLoadingSession)
    return (
      <p className="flex min-h-screen items-center justify-center text-3xl">
        Loading...
      </p>
    );

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F9F9F9] p-6">
      <form
        onSubmit={handleEditRequest}
        className="w-full max-w-4xl space-y-6 rounded-[4px] border border-[#CCCCCC] bg-white p-8 shadow-md"
      >
        <h1 className="text-center text-2xl font-semibold text-[#000000]">
          Edit Leave Request
        </h1>

        <div>
          <p className="mb-2 font-medium text-[#000000]">Reason for Leave:</p>
          <div className="flex flex-wrap gap-4">
            {reasonOfLeaveValues.map((type) => (
              <label
                key={type}
                className="flex cursor-pointer items-center space-x-2 rounded-[4px] border border-[#CCCCCC] p-2 px-3 hover:border-[#00888F]"
              >
                <input
                  type="radio"
                  name="reasonOfLeave"
                  value={type}
                  checked={reasonOfLeave === type}
                  onChange={() => setReasonOfLeave(type)}
                  className="accent-[#00888F]"
                />
                <span className="text-[#000000] capitalize">{type}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div className="flex flex-col">
            <label className="mb-1 font-medium text-[#000000]">
              Start Date:
            </label>
            <div
              className="cursor-pointer rounded-[4px] border border-[#CCCCCC] px-3 py-2 transition focus-within:ring-2 focus-within:ring-[#00888F]"
              onClick={() => startDateRef.current?.showPicker()}
            >
              <input
                ref={startDateRef}
                type="date"
                min={today}
                value={formatDate(dateLeaveStart)}
                onChange={(e) => {
                  const value = e.target.value;
                  if (!value) return;
                  const newStart = new Date(value);
                  setDateLeaveStart(newStart);

                  if (dateLeaveEnd < newStart) {
                    setDateLeaveEnd(newStart);
                  }
                }}
                className="w-full cursor-pointer bg-transparent text-[#000000] outline-none"
              />
            </div>
          </div>

          <div className="flex flex-col">
            <label className="mb-1 font-medium text-[#000000]">End Date:</label>
            <div
              className="cursor-pointer rounded-[4px] border border-[#CCCCCC] px-3 py-2 transition focus-within:ring-2 focus-within:ring-[#00888F]"
              onClick={() => endDateRef.current?.showPicker()}
            >
              <input
                ref={endDateRef}
                type="date"
                min={formatDate(dateLeaveStart)}
                value={formatDate(dateLeaveEnd)}
                onChange={(e) => {
                  const value = e.target.value;
                  if (!value) return;
                  setDateLeaveEnd(new Date(value));
                }}
                className="w-full cursor-pointer bg-transparent text-[#000000] outline-none"
              />
            </div>
          </div>
        </div>

        <div className="flex flex-col">
          <label className="mb-1 font-medium text-[#000000]">Reasoning:</label>
          <textarea
            value={reasoning}
            onChange={(e) => setReasoning(e.target.value)}
            className="min-h-[120px] rounded-[4px] border border-[#CCCCCC] px-3 py-2 focus:ring-2 focus:ring-[#00888F] focus:outline-none"
          />
        </div>

        {error && (
          <p className="mb-3 text-center text-sm font-medium text-[#FF3333]">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={disabledForm}
          className={`w-full rounded-[4px] py-3 font-semibold text-white transition-colors ${
            updateRequest.isPending || disabledForm
              ? "cursor-not-allowed bg-[#CCCCCC]"
              : "bg-[#00888F] hover:bg-[#00767C]"
          }`}
        >
          {updateRequest.isPending ? "Updating..." : "Update Request"}
        </button>
        <ToastContainer />
      </form>
    </div>
  );
}
