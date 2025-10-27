import { vi, describe, it, expect, beforeEach } from "vitest";
vi.mock("~/env", () => ({
  env: new Proxy({}, { get: (_, key) => process.env[key as string] ?? "test-value" }),
}));
vi.mock("~/server/db", () => ({ db: {} }));
import { leaveRequestsRouter } from "../leaveRequest";

// --- Mock Data ---
const mockRequests = [
  {
    id: 1,
    subject: "Vacation Request",
    reason: "vacation",
    status: "pending",
    start: new Date("2025-10-25"),
    end: new Date("2025-10-30"),
    createdAt: new Date(),
    requesterName: "John Doe",
    requesterEmail: "john@example.com",
  },
];

// --- Mock DB ---
const mockDb = {
  select: vi.fn(() => mockDb),
  from: vi.fn(() => mockDb),
  leftJoin: vi.fn(() => mockDb),
  where: vi.fn(() => mockDb),
  orderBy: vi.fn(() => Promise.resolve(mockRequests)),
};

// --- Mock Context ---
const mockCtx: any = {
  db: mockDb,
  session: {
    user: { id: "admin" },
  },
  perms: new Set(["leaveRequest.read", "leaveRequest.update"]),
  hasPermission: () => true,
};


const caller = leaveRequestsRouter.createCaller(mockCtx);

describe("leaveRequestsRouter.listPendingRequests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should list pending leave requests", async () => {
    const result = await caller.listPendingRequests();

    expect(Array.isArray(result)).toBe(true);
    expect(result).toHaveLength(1);

    const first = result[0]!;
    expect(first.status).toBe("pending");
    expect(first.subject).toBe("Vacation Request");

    expect(mockDb.select).toHaveBeenCalledOnce();
    expect(mockDb.from).toHaveBeenCalledOnce();
    expect(mockDb.orderBy).toHaveBeenCalledOnce();
  });
});

describe("leaveRequestsRouter.getById", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return a single leave request by ID", async () => {
    mockDb.select.mockReturnValueOnce(mockDb);
    mockDb.from.mockReturnValueOnce(mockDb);
    mockDb.leftJoin.mockReturnValueOnce(mockDb);
    mockDb.where.mockReturnValueOnce(Promise.resolve([mockRequests[0]]));

    const result = await caller.getById({ id: 1 });

    expect(result).not.toBeNull();
    expect(result?.id).toBe(1);
    expect(result?.subject).toBe("Vacation Request");
    expect(result?.status).toBe("pending");

    expect(mockDb.select).toHaveBeenCalledOnce();
    expect(mockDb.from).toHaveBeenCalledOnce();
    expect(mockDb.where).toHaveBeenCalledOnce();
  });

  it("should return null if no request matches ID", async () => {
    mockDb.select.mockReturnValueOnce(mockDb);
    mockDb.from.mockReturnValueOnce(mockDb);
    mockDb.leftJoin.mockReturnValueOnce(mockDb);
    mockDb.where.mockReturnValueOnce(Promise.resolve([]));

    const result = await caller.getById({ id: 999 });

    expect(result).toBeNull();
  });
});

