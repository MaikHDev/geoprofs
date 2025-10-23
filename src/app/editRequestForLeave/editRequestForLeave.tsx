"use client";

import { useEffect, useRef, useState } from "react";
import { api } from "~/trpc/react";
import { ToastContainer, toast } from 'react-toastify';


export default function EditRequestForLeave({ requestId }: { requestId: number }) {
  const [error, setError] = useState<string | null>(null);
  const [reasonOfLeave, setReasonOfLeave] = useState<"vacation" | "personal" | "medical" | "extra">("vacation");
  const [dateLeaveStart, setDateLeaveStart] = useState<Date>(new Date());
  const [dateLeaveEnd, setDateLeaveEnd] = useState<Date>(new Date());
  const [reasoning, setReasoning] = useState("");

  const { data: request, isLoading } = api.requestForLeave.getById.useQuery({ id: requestId });
  const updateRequest = api.requestForLeave.update.useMutation();

  const startDateRef = useRef<HTMLInputElement>(null);
  const endDateRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (request) {
      setReasonOfLeave(request.reasonOfLeave);
      setDateLeaveStart(new Date(request.dateLeaveStart));
      setDateLeaveEnd(new Date(request.dateLeaveEnd));
      setReasoning(request.reasoning);
    }
  }, [request]);

  async function handleEditRequest(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!dateLeaveStart || !dateLeaveEnd) {
      setError("Please select start and end dates.");
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

      alert("Leave request updated successfully!");
    } catch (err) {
      if(err && err instanceof Error) {
        setError( err.message ?? "Unknown error");
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
            <label className="font-medium mb-1 text-[#000000]">Start Date:</label>
            <input
              ref={startDateRef}
              type="date"
              value={dateLeaveStart.toISOString().split("T")[0]}
              onChange={(e) => setDateLeaveStart(new Date(e.target.value))}
              className="border border-[#CCCCCC] rounded-[4px] px-3 py-2 w-full"
            />
          </div>

          <div className="flex flex-col">
            <label className="font-medium mb-1 text-[#000000]">End Date:</label>
            <input
              ref={endDateRef}
              type="date"
              value={dateLeaveEnd.toISOString().split("T")[0]}
              onChange={(e) => setDateLeaveEnd(new Date(e.target.value))}
              className="border border-[#CCCCCC] rounded-[4px] px-3 py-2 w-full"
            />
          </div>
        </div>

        <div className="flex flex-col">
          <label className="font-medium mb-1 text-[#000000]">Reasoning:</label>
          <textarea
            value={reasoning}
            onChange={(e) => setReasoning(e.target.value)}
            className="border border-[#CCCCCC] rounded-[4px] px-3 py-2 min-h-[120px]"
          />
        </div>

        {error && <p className="text-[#FF3333] text-sm text-center font-medium mb-3">{error}</p>}

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
        <ToastContainer/>
      </form>
    </div>
  );
}
