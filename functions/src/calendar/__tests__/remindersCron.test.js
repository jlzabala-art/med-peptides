import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock firebase-functions
vi.mock("firebase-functions/v2/scheduler", () => ({
  onSchedule: (schedule, handler) => handler
}));

// Mock firestore
const mockGet = vi.fn();
const mockWhere2 = vi.fn(() => ({ get: mockGet }));
const mockWhere1 = vi.fn(() => ({ where: mockWhere2 }));
const mockCollection = vi.fn(() => ({ where: mockWhere1 }));

const firestoreModule = require("firebase-admin/firestore");
vi.spyOn(firestoreModule, "getFirestore").mockImplementation(() => ({
  collection: mockCollection
}));

const { sendCalendarReminders } = require("../remindersCron");

describe("remindersCron", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("sendCalendarReminders", () => {
    it("should process reminders for upcoming events", async () => {
      // Mock Date to be deterministic
      const mockNow = new Date("2026-06-06T12:00:00Z");
      vi.useFakeTimers();
      vi.setSystemTime(mockNow);

      const eventStart = new Date(mockNow.getTime() + 15 * 60 * 1000).toISOString(); // 15 mins later

      mockGet.mockResolvedValue({
        empty: false,
        forEach: (cb) => {
          cb({
            data: () => ({
              title: "Test Appointment",
              start: eventStart,
              ownerIds: ["user1"],
              reminders: [{ method: "email", offsetMinutes: 15 }]
            })
          });
        }
      });

      await sendCalendarReminders({});

      // It should call where clauses
      expect(mockCollection).toHaveBeenCalledWith('calendar_events');
      
      // We don't have deep assertions for SendGrid right now, but the cron should run and find 1 notification match
      
      vi.useRealTimers();
    });

    it("should handle empty results", async () => {
      mockGet.mockResolvedValue({
        empty: true
      });
      await sendCalendarReminders({});
      expect(mockCollection).toHaveBeenCalledWith('calendar_events');
    });
  });
});
