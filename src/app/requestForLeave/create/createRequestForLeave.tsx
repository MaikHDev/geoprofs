"use client";

import React, { useState, useRef } from "react";
import { ToastContainer, toast } from "react-toastify";
import { api } from "~/trpc/react";
import ReturnView from "~/app/_components/returnView";
import { ReasonsForLeave } from "~/server/db/schema";
import { TrpcErrorlikeMessages } from "~/trpc/trpc-errorlike-messages";
import { useSessionContext } from "~/app/_components/session-provider";

export const reasonOfLeaveValues = ReasonsForLeave.enumValues;

export type ReasonOfLeave = (typeof reasonOfLeaveValues)[number];

export default function CreateRequestForLeave() {
  const session = useSessionContext();
  const hasPermission = session?.hasPermission;

  const [error, setError] = useState<string | null>(null);
  const [reasonOfLeave, setReasonOfLeave] = useState<ReasonOfLeave>("leave");
  const [dateLeaveStart, setDateLeaveStart] = useState<Date>(new Date());
  const [dateLeaveEnd, setDateLeaveEnd] = useState<Date>(new Date());
  const [reasoning, setReasoning] = useState("");

  const createRequest = api.requestForLeave.create.useMutation();

  const startDateRef = useRef<HTMLInputElement>(null);
  const endDateRef = useRef<HTMLInputElement>(null);

  const formatDate = (date: Date): string => date.toISOString().split("T")[0]!;

  const today = formatDate(new Date());

  if (!session) {
    return (
      <ReturnView
        label={TrpcErrorlikeMessages.session.message}
        returnName="Login"
        returnPath="/auth"
      />
    );
  }

  if (!hasPermission?.["LeaveRequest.update"]) {
    return <ReturnView />;
  }

  async function handleCreateRequest(e: React.FormEvent) {
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
      await createRequest.mutateAsync({
        reasonOfLeave,
        dateLeaveStart,
        dateLeaveEnd,
        reasoning,
        subject: "Leave Request",
      });

      setReasonOfLeave("leave");
      setDateLeaveStart(new Date());
      setDateLeaveEnd(new Date());
      setReasoning("");
      toast.success("Request placed!");
    } catch (err) {
      if (err && err instanceof Error) {
        toast.error(err.message);
      }
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F9F9F9] p-6">
      <form
        onSubmit={handleCreateRequest}
        className="w-full max-w-4xl space-y-6 rounded-[4px] border border-[#CCCCCC] bg-white p-8 shadow-md"
      >
        <h1 className="text-center text-2xl font-semibold text-[#000000]">
          Request for Leave
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

        <div className="flex flex-col">
          {error && <div className="text-red-500">{error}</div>}
          <button
            type="submit"
            disabled={createRequest.isPending}
            className={`w-full rounded-[4px] py-3 font-semibold text-white transition-colors ${
              createRequest.isPending
                ? "cursor-not-allowed bg-[#CCCCCC]"
                : "bg-[#00888F] hover:bg-[#00767C]"
            }`}
          >
            {createRequest.isPending ? "Submitting..." : "Submit Request"}
          </button>
        </div>
      </form>
    </div>
  );
}
