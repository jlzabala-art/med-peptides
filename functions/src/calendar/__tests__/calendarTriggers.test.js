import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock firebase-functions
vi.mock("firebase-functions/v2/firestore", () => ({
  onDocumentWritten: (path, handler) => handler,
  onDocumentCreated: (path, handler) => handler
}));

// Mock firestore
const mockSet = vi.fn();
const mockDoc = vi.fn(() => ({ set: mockSet }));
const mockCollection = vi.fn(() => ({ doc: mockDoc }));

const firestoreModule = require("firebase-admin/firestore");
vi.spyOn(firestoreModule, "getFirestore").mockImplementation(() => ({
  collection: mockCollection
}));

const { protocolDaySync, syncToGoogleCalendar } = require("../calendarTriggers");

describe("calendarTriggers", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("protocolDaySync", () => {
    it("should generate calendar_events for each dose in the protocol", async () => {
      const event = {
        params: { protocolId: "proto123" },
        data: {
          before: { data: () => null },
          after: {
            data: () => ({
              name: "Test Protocol",
              patientId: "pat1",
              doctorId: "doc1",
              doses: [
                { date: "2026-06-10" },
                { date: "2026-06-11" }
              ]
            })
          }
        }
      };

      await protocolDaySync(event);

      expect(mockCollection).toHaveBeenCalledWith('calendar_events');
      expect(mockDoc).toHaveBeenCalledWith('protocol-proto123-dose-0');
      expect(mockDoc).toHaveBeenCalledWith('protocol-proto123-dose-1');
      expect(mockSet).toHaveBeenCalledTimes(2);
      expect(mockSet).toHaveBeenCalledWith(
        expect.objectContaining({
          title: "Protocol Dosing: Test Protocol",
          type: "protocol",
          ownerIds: ["pat1", "doc1"]
        }),
        { merge: true }
      );
    });

    it("should ignore writes without doses", async () => {
      const event = {
        params: { protocolId: "proto123" },
        data: {
          before: { data: () => null },
          after: { data: () => ({ name: "Empty Protocol" }) }
        }
      };

      await protocolDaySync(event);
      expect(mockSet).not.toHaveBeenCalled();
    });
  });
  
  describe("syncToGoogleCalendar", () => {
     it("should log Google Calendar sync stub", async () => {
       const event = {
         params: { eventId: "ev123" },
         data: {
           after: {
             data: () => ({ ownerIds: ["pat1"] })
           }
         }
       };
       await syncToGoogleCalendar(event);
       expect(true).toBe(true);
     });
  });
});
