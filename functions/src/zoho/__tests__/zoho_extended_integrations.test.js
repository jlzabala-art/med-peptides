import { describe, it, expect, vi, beforeEach } from "vitest";
import Module from "module";

// Clean require.cache for the modules under test to ensure they load fresh
Object.keys(require.cache).forEach((key) => {
  if (
    key.includes("fetchZohoCRMIntelligence") ||
    key.includes("zohoBooksWebhook") ||
    key.includes("fetchFinanceDashboard") ||
    key.includes("users_bigin_sync")
  ) {
    delete require.cache[key];
  }
});

// Intercept require calls to inject firebase-functions mocks globally
const originalLoad = Module._load;
Module._load = function (request, parent, isMain) {
  if (request.includes("firebase-functions/v2/https")) {
    return {
      onRequest: (options, handler) => {
        const actualHandler = typeof options === "function" ? options : handler;
        actualHandler.options = typeof options === "object" ? options : {};
        return actualHandler;
      },
      onCall: (options, handler) => {
        const actualHandler = typeof options === "function" ? options : handler;
        actualHandler.options = typeof options === "object" ? options : {};
        return actualHandler;
      },
      HttpsError: class HttpsError extends Error {
        constructor(code, message) {
          super(message);
          this.code = code;
        }
      }
    };
  }
  if (request.includes("firebase-functions/v2/firestore")) {
    return {
      onDocumentWritten: (options, handler) => {
        const actualHandler = typeof options === "function" ? options : handler;
        actualHandler.options = typeof options === "object" ? options : {};
        return actualHandler;
      }
    };
  }
  if (request.includes("firebase-functions/params")) {
    return {
      defineSecret: (name) => ({
        value: () => `mocked-${name}`
      })
    };
  }
  return originalLoad.apply(this, arguments);
};

// Mock firestore DB queries
const mockGet = vi.fn();
const mockSet = vi.fn();
const mockAdd = vi.fn();

const mockQueryGet = vi.fn();
const mockWhere = vi.fn().mockReturnThis();
const mockLimit = vi.fn().mockReturnThis();

const mockDoc = vi.fn((path) => ({
  get: mockGet,
  set: mockSet,
}));

const mockCollection = vi.fn((path) => ({
  doc: (id) => mockDoc(`${path}/${id}`),
  add: mockAdd,
  where: mockWhere,
  limit: mockLimit,
  get: mockQueryGet,
}));

// Spy/Mock firebase-admin/firestore getFirestore
const firestoreModule = require("firebase-admin/firestore");
vi.spyOn(firestoreModule, "getFirestore").mockImplementation(() => ({
  collection: mockCollection,
  doc: mockDoc,
}));

// Mock serverTimestamp
vi.spyOn(firestoreModule.FieldValue, "serverTimestamp").mockImplementation(() => "mocked-timestamp");

// Mock global fetch
const mockFetch = vi.fn(async (url, options) => {
  const urlString = decodeURIComponent(String(url));

  // 1. OAuth Token Exchange
  if (urlString.includes("/oauth/v2/token")) {
    return {
      ok: true,
      json: () => Promise.resolve({ access_token: "mock-access-token", expires_in: 3600 })
    };
  }

  // 2. Bigin Contacts upsert
  if (urlString.includes("/Contacts/upsert")) {
    return {
      ok: true,
      json: () => Promise.resolve({
        data: [{ status: "success", code: "SUCCESS" }]
      })
    };
  }

  // 3. Zoho Reports profit & loss
  if (urlString.includes("/reports/profitandloss")) {
    return {
      ok: true,
      json: () => Promise.resolve({
        code: 0,
        profitandloss: {
          net_profit: 50000,
          total_income: 120000,
          total_expense: 70000
        }
      })
    };
  }

  // 4. Zoho Bills
  if (urlString.includes("/bills")) {
    return {
      ok: true,
      json: () => Promise.resolve({
        code: 0,
        bills: [
          { bill_id: "bill-1", bill_number: "BILL-001", total: 300 },
          { bill_id: "bill-2", bill_number: "BILL-002", total: 450 }
        ]
      })
    };
  }

  // 5. Zoho Contacts
  if (urlString.includes("/contacts")) {
    if (urlString.includes("contact_name_contains=Lotusland")) {
      return {
        ok: true,
        json: () => Promise.resolve({
          code: 0,
          contacts: [{ contact_id: "lotus-123", contact_name: "Lotusland Medical" }]
        })
      };
    }
    if (urlString.includes("contact_name_contains=NPLAB")) {
      return {
        ok: true,
        json: () => Promise.resolve({
          code: 0,
          contacts: [{ contact_id: "nplab-456", contact_name: "NPLAB Labs" }]
        })
      };
    }
    if (urlString.includes("contact_type=customer")) {
      return {
        ok: true,
        json: () => Promise.resolve({
          code: 0,
          contacts: [
            { contact_id: "c-1", contact_name: "Acme Customer", company_name: "Acme Corp", email: "acme@test.com", status: "active" },
            { contact_id: "c-2", contact_name: "John Individual", company_name: "", email: "john@test.com", status: "active" }
          ]
        })
      };
    }
    return {
      ok: true,
      json: () => Promise.resolve({ code: 0, contacts: [] })
    };
  }

  // 6. Zoho Invoices
  if (urlString.includes("/invoices")) {
    if (urlString.includes("customer_id=c-1")) {
      return {
        ok: true,
        json: () => Promise.resolve({
          code: 0,
          invoices: [
            { invoice_id: "inv-1", invoice_number: "INV-1001", total: 1000, balance: 100, date: "2026-05-15", status: "sent", line_items: [{ name: "Product A", quantity: 2 }] }
          ]
        })
      };
    }
    if (urlString.includes("customer_id=c-2")) {
      return {
        ok: true,
        json: () => Promise.resolve({
          code: 0,
          invoices: [
            { invoice_id: "inv-2", invoice_number: "INV-1002", total: 500, balance: 0, date: "2026-05-20", status: "paid", line_items: [{ name: "Product B", quantity: 1 }] }
          ]
        })
      };
    }
    if (urlString.includes("customer_id=lotus-123")) {
      return {
        ok: true,
        json: () => Promise.resolve({
          code: 0,
          invoices: [
            { invoice_id: "lotus-inv-1", invoice_number: "LOTUS-001", total: 2000, balance: 500, date: "2026-05-25", status: "sent" }
          ]
        })
      };
    }
    if (urlString.includes("status=unpaid")) {
      return {
        ok: true,
        json: () => Promise.resolve({
          code: 0,
          invoices: [
            { invoice_id: "inv-unpaid-1", invoice_number: "INV-UNPAID-1", total: 1000, balance: 1000 }
          ]
        })
      };
    }
    if (urlString.includes("status=overdue")) {
      return {
        ok: true,
        json: () => Promise.resolve({
          code: 0,
          invoices: [
            { invoice_id: "inv-overdue-1", invoice_number: "INV-OVERDUE-1", total: 2000, balance: 2000 }
          ]
        })
      };
    }
    return {
      ok: true,
      json: () => Promise.resolve({ code: 0, invoices: [] })
    };
  }

  return {
    ok: false,
    status: 404,
    json: () => Promise.resolve({ error: "Not found" })
  };
});

globalThis.fetch = mockFetch;

// Import the modules under test
const { fetchZohoCRMIntelligence } = require("../fetchZohoCRMIntelligence");
const { zohoBooksWebhook } = require("../zohoBooksWebhook");
const { fetchFinanceDashboard } = require("../fetchFinanceDashboard");
const usersBiginSync = require("../../triggers/users_bigin_sync");

// Helpers
const createMockRequest = (body = {}, method = "POST") => ({
  method,
  headers: {},
  body
});

const createMockResponse = () => {
  const headers = {};
  const res = {
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
    send: vi.fn().mockReturnThis(),
    on: vi.fn().mockImplementation((event, callback) => res),
    emit: vi.fn().mockReturnThis(),
    end: vi.fn().mockReturnThis(),
    setHeader: vi.fn().mockImplementation((name, value) => {
      headers[name] = value;
      return res;
    }),
    getHeader: vi.fn().mockImplementation((name) => headers[name])
  };
  return res;
};

const createMockFirestoreEvent = (dataAfter, exists = true) => ({
  data: {
    after: {
      exists,
      data: () => dataAfter
    }
  }
});

describe("Extended Zoho and Bigin Integrations", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGet.mockReset();
    mockSet.mockReset();
    mockAdd.mockReset();
    mockQueryGet.mockReset();
  });

  describe("fetchZohoCRMIntelligence", () => {
    it("should return cached intelligence if within TTL and not forced", async () => {
      const req = createMockRequest({ force: false });
      const res = createMockResponse();

      // Mock cached data
      mockGet.mockResolvedValueOnce({
        exists: true,
        data: () => ({
          cachedAt: { toMillis: () => Date.now() - 1000 },
          summary: { total_customers: 2 },
          top_customers: []
        })
      });

      await fetchZohoCRMIntelligence(req, res);

      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        source: "cache",
        summary: { total_customers: 2 }
      }));
    });

    it("should run live sync and cache results if cache expired or forced", async () => {
      const req = createMockRequest({ force: true });
      const res = createMockResponse();

      // Cache empty
      mockGet.mockResolvedValueOnce({ exists: false });
      mockSet.mockResolvedValueOnce(true);

      await fetchZohoCRMIntelligence(req, res);

      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        source: "live",
        summary: expect.objectContaining({
          total_customers: 2,
          currency: "AED"
        })
      }));
      expect(mockSet).toHaveBeenCalled();
    });

    it("should fall back to cached data if live fetch crashes", async () => {
      const req = createMockRequest({ force: true });
      const res = createMockResponse();

      // Temporarily mock fetch to fail
      const originalFetch = globalThis.fetch;
      globalThis.fetch = vi.fn().mockRejectedValue(new Error("Network error"));

      // Cache exists
      mockGet.mockResolvedValueOnce({
        exists: true,
        data: () => ({
          cachedAt: { toMillis: () => Date.now() - CACHE_TTL_MS * 2 },
          summary: { total_customers: 5 }
        })
      });

      // TTL is imported internally. Mock TTL constant is defined as 6h
      const CACHE_TTL_MS = 6 * 60 * 60 * 1000;

      await fetchZohoCRMIntelligence(req, res);

      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        source: "cache_fallback",
        summary: { total_customers: 5 },
        warning: expect.stringContaining("Live sync failed")
      }));

      globalThis.fetch = originalFetch;
    });
  });

  describe("zohoBooksWebhook", () => {
    it("should return 200 on verification GET request", async () => {
      const req = createMockRequest({}, "GET");
      const res = createMockResponse();

      await zohoBooksWebhook(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.send).toHaveBeenCalledWith("Webhook endpoint is active and verified.");
    });

    it("should reject payload without contact_id or email", async () => {
      const req = createMockRequest({ contact: {} });
      const res = createMockResponse();

      await zohoBooksWebhook(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
    });

    it("should parse JSONString webhook payload and sync successfully", async () => {
      const req = createMockRequest({
        JSONString: JSON.stringify({
          contact: {
            contact_id: "wc-100",
            email: "webhook@test.com",
            contact_name: "Web Hook Corp",
            company_name: "Web Hook Corp Ltd",
            mobile: "+971500000000"
          }
        })
      });
      const res = createMockResponse();

      // Mock user search in Firestore (not registered)
      mockQueryGet.mockResolvedValueOnce({ empty: true });
      mockSet.mockResolvedValueOnce(true);
      mockAdd.mockResolvedValueOnce(true);

      await zohoBooksWebhook(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(mockSet).toHaveBeenCalledWith(expect.objectContaining({
        contact_id: "wc-100",
        email: "webhook@test.com",
        type: "corporate"
      }));
    });
  });

  describe("users_bigin_sync", () => {
    it("should exit early if document deleted", async () => {
      const event = createMockFirestoreEvent(null, false);
      const result = await usersBiginSync(event);
      expect(result).toBeUndefined();
    });

    it("should mute sync for non-medical profile (e.g. client/guest role)", async () => {
      const event = createMockFirestoreEvent({
        email: "guest@test.com",
        role: "patient"
      });
      const result = await usersBiginSync(event);
      expect(result).toBeUndefined();
    });

    it("should run sync and upsert to Bigin for doctor profile", async () => {
      const event = createMockFirestoreEvent({
        email: "doctor@test.com",
        role: "doctor",
        firstName: "Marcus",
        lastName: "Welby",
        specialty: "Cardiology",
        medicalLicense: "LIC-12345"
      });

      const spyConsole = vi.spyOn(console, "log").mockImplementation(() => {});

      await usersBiginSync(event);

      expect(spyConsole).toHaveBeenCalledWith(expect.stringContaining("Successfully synced contact"));
      spyConsole.mockRestore();
    });
  });

  describe("fetchFinanceDashboard", () => {
    it("should return cached dashboard metrics if valid and not forced", async () => {
      // Create mock callable request
      const callableRequest = {
        data: { forceRefresh: false }
      };

      // Mock cached system doc
      mockGet.mockResolvedValueOnce({
        exists: true,
        data: () => ({
          timestamp: Date.now() - 1000,
          payload: { profitAndLoss: { net_profit: 40000 } }
        })
      });

      const result = await fetchFinanceDashboard(callableRequest);

      expect(result).toEqual(expect.objectContaining({
        cached: true,
        profitAndLoss: { net_profit: 40000 }
      }));
    });

    it("should query Zoho and return fresh report and list of invoices when forced", async () => {
      const callableRequest = {
        data: { forceRefresh: true }
      };

      mockSet.mockResolvedValueOnce(true);

      const result = await fetchFinanceDashboard(callableRequest);

      expect(result).toEqual(expect.objectContaining({
        cached: false,
        profitAndLoss: expect.objectContaining({ net_profit: 50000 }),
        pendingInvoices: expect.any(Array),
        lotuslandData: expect.objectContaining({ id: "lotus-123" }),
        nplabData: expect.objectContaining({ id: "nplab-456" })
      }));
    });
  });
});
