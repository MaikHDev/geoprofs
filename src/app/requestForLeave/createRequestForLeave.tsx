"use client";

import { useState, useRef } from "react";
import { api } from "~/trpc/react";

export default function CreateRequestForLeave() {
  const [error, setError] = useState<string | null>(null);
  const [reasonOfLeave, setReasonOfLeave] = useState<"vacation" | "personal" | "medical" | "extra">("vacation");
  const [dateLeaveStart, setDateLeaveStart] = useState<Date>(new Date());
  const [dateLeaveEnd, setDateLeaveEnd] = useState<Date>(new Date());
  const [reasoning, setReasoning] = useState("");

  const createRequest = api.requestForLeave.create.useMutation();

  const startDateRef = useRef<HTMLInputElement>(null);
  const endDateRef = useRef<HTMLInputElement>(null);

  async function handleCreateRequest(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!dateLeaveStart || !dateLeaveEnd) {
      setError("Please select start and end dates.");
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

      setReasonOfLeave("vacation");
      setDateLeaveStart(new Date());
      setDateLeaveEnd(new Date());
      setReasoning("");
    } catch (err: any) {
      setError(err.message || "Information invalid");
    }
  }

  return (
    <div className="flex justify-center items-center min-h-screen bg-[#F9F9F9] p-6">
      <form
        onSubmit={handleCreateRequest}
        className="bg-white shadow-md p-8 w-full max-w-4xl space-y-6 border border-[#CCCCCC] rounded-[4px]"
      >
        <h1 className="text-2xl font-semibold text-[#000000] text-center">
          Request for Leave
        </h1>

        <div>
          <p className="font-medium mb-2 text-[#000000]">Reason for Leave:</p>
          <div className="flex flex-wrap gap-4">
            {["vacation", "personal", "medical", "extra"].map((type) => (
              <label
                key={type}
                className="flex items-center space-x-2 p-2 px-3 border border-[#CCCCCC] rounded-[4px] hover:border-[#00888F] cursor-pointer"
              >
                <input
                  type="radio"
                  name="reasonOfLeave"
                  value={type}
                  checked={reasonOfLeave === type}
                  onChange={() =>
                    setReasonOfLeave(type as typeof reasonOfLeave)
                  }
                  className="accent-[#00888F]"
                />
                <span className="capitalize text-[#000000]">{type}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div className="flex flex-col">
            <label className="font-medium mb-1 text-[#000000]">
              Start Date:
            </label>
            <div
              className="border border-[#CCCCCC] rounded-[4px] px-3 py-2 cursor-pointer focus-within:ring-2 focus-within:ring-[#00888F] transition"
              onClick={() => startDateRef.current?.showPicker()}
            >
              <input
                ref={startDateRef}
                type="date"
                value={dateLeaveStart.toISOString().split("T")[0]}
                onChange={(e) => setDateLeaveStart(new Date(e.target.value))}
                className="w-full outline-none text-[#000000] cursor-pointer bg-transparent"
              />
            </div>
          </div>

          <div className="flex flex-col">
            <label className="font-medium mb-1 text-[#000000]">End Date:</label>
            <div
              className="border border-[#CCCCCC] rounded-[4px] px-3 py-2 cursor-pointer focus-within:ring-2 focus-within:ring-[#00888F] transition"
              onClick={() => endDateRef.current?.showPicker()}
            >
              <input
                ref={endDateRef}
                type="date"
                value={dateLeaveEnd.toISOString().split("T")[0]}
                onChange={(e) => setDateLeaveEnd(new Date(e.target.value))}
                className="w-full outline-none text-[#000000] cursor-pointer bg-transparent"
              />
            </div>
          </div>
        </div>

        <div className="flex flex-col">
          <label className="font-medium mb-1 text-[#000000]">Reasoning:</label>
          <textarea
            value={reasoning}
            onChange={(e) => setReasoning(e.target.value)}
            className="border border-[#CCCCCC] rounded-[4px] px-3 py-2 min-h-[120px] focus:outline-none focus:ring-2 focus:ring-[#00888F]"
          />
        </div>

        <div className="flex flex-col">
          {error && (
            <p className="text-[#FF3333] text-sm text-center font-medium mb-3">
              {error}
            </p>
          )}
          <button
            type="submit"
            disabled={createRequest.isPending}
            className={`w-full py-3 rounded-[4px] text-white font-semibold transition-colors ${
              createRequest.isPending
                ? "bg-[#CCCCCC] cursor-not-allowed"
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
