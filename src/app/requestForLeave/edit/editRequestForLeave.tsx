"use client";

import { useEffect, useRef, useState } from "react";
import { api } from "~/trpc/react";
import { ToastContainer, toast } from "react-toastify";
import { usePermission } from "~/hooks/usePermission";
import ReturnView from "~/app/_components/returnView";

export default function EditRequestForLeave({ requestId }: { requestId: number }) {
  const hasPermission = usePermission("leave_request.create");
    
  const [error, setError] = useState<string | null>(null);
  const [reasonOfLeave, setReasonOfLeave] = useState<
    "vacation" | "personal" | "medical" | "extra"
  >("vacation");
  const [dateLeaveStart, setDateLeaveStart] = useState<Date>(new Date());
  const [dateLeaveEnd, setDateLeaveEnd] = useState<Date>(new Date());
  const [reasoning, setReasoning] = useState("");

  const { data: request, isLoading } = api.requestForLeave.getById.useQuery({
    id: requestId,
  });
  const updateRequest = api.requestForLeave.update.useMutation();

  const startDateRef = useRef<HTMLInputElement>(null);
  const endDateRef = useRef<HTMLInputElement>(null);

  const formatDate = (date: Date): string => date.toISOString().split("T")[0]!;

  const today = formatDate(new Date());

  useEffect(() => {
    if (request) {
      setReasonOfLeave(request.reasonOfLeave);
      setDateLeaveStart(new Date(request.dateLeaveStart));
      setDateLeaveEnd(new Date(request.dateLeaveEnd));
      setReasoning(request.reasoning);
    }
  }, [request]);

  if (!hasPermission("leave_request.update")) {
      return(
          <ReturnView/>      
      );
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
    } catch (err) {
      if (err && err instanceof Error) {
        setError(err.message ?? "Unknown error");
        toast.error(err.message);
      }
    }
  }

  if (isLoading) return <p>Loading...</p>;

  return (
    <div className="flex justify-center items-center min-h-screen bg-[#F9F9F9] p-6">
      <form
        onSubmit={handleEditRequest}
        className="bg-white shadow-md p-8 w-full max-w-4xl space-y-6 border border-[#CCCCCC] rounded-[4px]"
      >
        <h1 className="text-2xl font-semibold text-[#000000] text-center">
          Edit Leave Request
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
                  onChange={() => setReasonOfLeave(type as typeof reasonOfLeave)}
                  className="accent-[#00888F]"
                />
                <span className="capitalize text-[#000000]">{type}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div className="flex flex-col">
            <label className="font-medium mb-1 text-[#000000]">Start Date:</label>
            <div
              className="border border-[#CCCCCC] rounded-[4px] px-3 py-2 cursor-pointer focus-within:ring-2 focus-within:ring-[#00888F] transition"
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
                min={formatDate(dateLeaveStart)}
                value={formatDate(dateLeaveEnd)}
                onChange={(e) => {
                  const value = e.target.value;
                  if (!value) return;
                  setDateLeaveEnd(new Date(value));
                }}
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

        {error && (
          <p className="text-[#FF3333] text-sm text-center font-medium mb-3">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={updateRequest.isPending}
          className={`w-full py-3 rounded-[4px] text-white font-semibold transition-colors ${
            updateRequest.isPending
              ? "bg-[#CCCCCC] cursor-not-allowed"
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
