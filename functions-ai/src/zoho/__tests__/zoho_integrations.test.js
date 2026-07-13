import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock firebase-functions
vi.mock("firebase-functions/v2/https", () => ({
  onRequest: (options, handler) => {
    const actualHandler = typeof options === "function" ? options : handler;
    actualHandler.options = typeof options === "object" ? options : {};
    return actualHandler;
  }
}));

vi.mock("firebase-functions/params", () => ({
  defineSecret: (name) => ({
    value: () => `mocked-${name}`
  })
}));

// Mock firestore DB queries
const mockGetDocs = vi.fn();
const mockWhere = vi.fn().mockReturnThis();
const mockLimit = vi.fn().mockReturnThis();
const mockCollection = vi.fn(() => ({
  where: mockWhere,
  limit: mockLimit,
  get: mockGetDocs
}));

// Spy/Mock firebase-admin/firestore getFirestore
const firestoreModule = require("firebase-admin/firestore");
vi.spyOn(firestoreModule, "getFirestore").mockImplementation(() => ({
  collection: mockCollection
}));

// Mock global fetch deterministically
const mockFetch = vi.fn(async (url, options) => {
  const urlString = decodeURIComponent(String(url));

  // 1. OAuth Token Exchange
  if (urlString.includes("/oauth/v2/token")) {
    return {
      ok: true,
      json: () => Promise.resolve({ access_token: "mock-token" })
    };
  }

  // 2. Contacts API
  if (urlString.includes("/contacts")) {
    if (urlString.includes("exists@test.com")) {
      return {
        ok: true,
        json: () => Promise.resolve({
          contacts: [{
            contact_id: "12345",
            contact_name: "John Doe",
            display_name: "John Doe",
            email: "exists@test.com",
            mobile: "+971501234567",
            company_name: "Acme Corp",
            billing_address: {
              address: "Office 101",
              city: "Dubai",
              country: "UAE"
            }
          }]
        })
      };
    }

    if (urlString.includes("wholesaler@exists.com")) {
      return {
        ok: true,
        json: () => Promise.resolve({
          contacts: [{
            contact_id: "wh-777",
            contact_name: "Med Labs Wholesaler",
            display_name: "Med Labs Wholesaler",
            email: "wholesaler@exists.com",
            phone: "+971509999999",
            company_name: "Med Labs Ltd",
            billing_address: {
              address: "Warehouse B",
              city: "Abu Dhabi",
              country: "UAE"
            }
          }]
        })
      };
    }

    return {
      ok: true,
      json: () => Promise.resolve({ contacts: [] })
    };
  }

  // 3. Invoices API
  if (urlString.includes("/invoices")) {
    if (urlString.includes("customer_id=wh-777") || urlString.includes("customer_id=12345")) {
      return {
        ok: true,
        json: () => Promise.resolve({
          invoices: [{
            invoice_id: "inv-999",
            invoice_number: "INV-0001",
            date: "2026-06-01",
            status: "sent",
            total: 1500.00,
            balance: 500.00
          }]
        })
      };
    }
    return {
      ok: true,
      json: () => Promise.resolve({ invoices: [] })
    };
  }

  return {
    ok: false,
    status: 404,
    json: () => Promise.resolve({ error: "Not found" })
  };
});

globalThis.fetch = mockFetch;

// Import the handlers
const { searchZohoContactByEmail } = require("../searchZohoContactByEmail");
const { fetchZohoBiginWholesaler } = require("../fetchZohoBiginWholesaler");

// Helper to create mock request object with headers
const createMockRequest = (body = {}) => {
  return {
    method: "POST",
    headers: {},
    body
  };
};

// Helper to create mock response object with lifecycle methods required by firebase-functions v2
const createMockResponse = () => {
  const headers = {};
  const res = {
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
    send: vi.fn().mockReturnThis(),
    on: vi.fn().mockImplementation((event, callback) => {
      return res;
    }),
    emit: vi.fn().mockReturnThis(),
    end: vi.fn().mockReturnThis(),
    setHeader: vi.fn().mockImplementation((name, value) => {
      headers[name] = value;
      return res;
    }),
    getHeader: vi.fn().mockImplementation((name) => {
      return headers[name];
    })
  };
  return res;
};

describe("Zoho and Bigin Integration Cloud Functions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetDocs.mockReset();
  });

  describe("searchZohoContactByEmail", () => {
    it("should return 400 if email is missing", async () => {
      const req = createMockRequest({});
      const res = createMockResponse();

      await searchZohoContactByEmail(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: "Email is required for search" });
    });

    it("should return found: false if contact is not in Zoho", async () => {
      const req = createMockRequest({ email: "missing@test.com" });
      const res = createMockResponse();

      await searchZohoContactByEmail(req, res);

      expect(res.json).toHaveBeenCalledWith({
        found: false,
        message: "No matching contact found in Zoho Books."
      });
    });

    it("should return mapped contact and registration status if contact exists", async () => {
      const req = createMockRequest({ email: "exists@test.com" });
      const res = createMockResponse();

      // Mock Firestore user query (user is not registered)
      mockGetDocs.mockResolvedValueOnce({
        empty: true
      });

      await searchZohoContactByEmail(req, res);

      expect(res.json).toHaveBeenCalledWith({
        found: true,
        contact: {
          contact_id: "12345",
          name: "John Doe",
          email: "exists@test.com",
          phone: "+971501234567",
          company: "Acme Corp",
          type: "corporate",
          address: "Office 101, Dubai, UAE",
          zohoLink: "https://books.zoho.me/app#/contacts/12345"
        },
        alreadyRegistered: false,
        registeredUser: null
      });
    });
  });

  describe("fetchZohoBiginWholesaler", () => {
    it("should return found: false if wholesaler is not found in Zoho Books", async () => {
      const req = createMockRequest({ email: "wholesaler@missing.com" });
      const res = createMockResponse();

      await fetchZohoBiginWholesaler(req, res);

      expect(res.json).toHaveBeenCalledWith({
        found: false,
        message: "No matching contact found in Zoho Bigin or Zoho Books."
      });
    });

    it("should return wholesaler details and invoices if found in Zoho Books", async () => {
      const req = createMockRequest({ email: "wholesaler@exists.com" });
      const res = createMockResponse();

      await fetchZohoBiginWholesaler(req, res);

      expect(res.json).toHaveBeenCalledWith({
        found: true,
        source: "Zoho Books",
        contact: {
          id: "wh-777",
          fullName: "Med Labs Wholesaler",
          email: "wholesaler@exists.com",
          phone: "+971509999999",
          company: "Med Labs Ltd",
          description: "",
          address: "Warehouse B, Abu Dhabi",
          city: "Abu Dhabi",
          country: "UAE"
        },
        invoices: [{
          invoiceId: "inv-999",
          invoiceNumber: "INV-0001",
          date: "2026-06-01",
          status: "sent",
          total: 1500.00,
          balance: 500.00
        }]
      });
    });
  });
});
