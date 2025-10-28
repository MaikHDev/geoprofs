import "@testing-library/jest-dom";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import CreateRequestForLeave from "./createRequestForLeave";

// ---- Mock trpc API ----
const mutateMock = vi.fn();

vi.mock("~/trpc/react", () => ({
  api: {
    requestForLeave: {
      create: {
        useMutation: () => ({
          mutateAsync: mutateMock,
          isPending: false,
        }),
      },
    },
  },
}));

describe("CreateRequestForLeave", () => {
  beforeEach(() => {
    mutateMock.mockClear();
  });

  it("renders the form", () => {
    render(<CreateRequestForLeave />);
    expect(screen.getByText("Request for Leave")).toBeInTheDocument();
  });

  it("allows selecting a reason and entering text", () => {
    render(<CreateRequestForLeave />);

    const vacationRadio = screen.getByLabelText("vacation");
    const reasoningInput = screen.getByLabelText("Reasoning:");

    // Klik radio
    fireEvent.click(vacationRadio);
    expect(vacationRadio).toBeChecked();

    // Vul textarea
    fireEvent.change(reasoningInput, { target: { value: "Need a break" } });
    expect(reasoningInput.value).toBe("Need a break");
  });
});
