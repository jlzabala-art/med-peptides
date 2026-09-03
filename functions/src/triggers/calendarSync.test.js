import { describe, it, expect, vi, beforeEach } from 'vitest';
import { syncToGoogleCalendar, protocolDaySync } from './calendarSync.js';

// Mocks for firebase-functions
vi.mock('firebase-functions/v2/firestore', () => ({
  onDocumentWritten: vi.fn((path, handler) => handler)
}));

// Mocks for firebase-admin
const mockBatch = {
  set: vi.fn(),
  commit: vi.fn()
};
const mockDocRef = {
  get: vi.fn(),
  update: vi.fn()
};
const mockCollection = {
  doc: vi.fn(() => mockDocRef)
};
const mockFirestore = {
  collection: vi.fn(() => mockCollection),
  batch: vi.fn(() => mockBatch)
};

vi.mock('firebase-admin/firestore', () => ({
  getFirestore: vi.fn(() => mockFirestore)
}));

// Mocks for googleapis
const insertMock = vi.fn(() => Promise.resolve({ data: { id: 'new-google-event-id' } }));
const updateMock = vi.fn(() => Promise.resolve({ data: { id: 'existing-google-event-id' } }));

vi.mock('googleapis', () => {
  return {
    google: {
      auth: {
        OAuth2: vi.fn().mockImplementation(() => ({
          setCredentials: vi.fn()
        }))
      },
      calendar: vi.fn(() => ({
        events: {
          insert: insertMock,
          update: updateMock
        }
      }))
    }
  };
});

describe('calendarSync Cloud Functions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('protocolDaySync', () => {
    it('should create calendar events for each protocol dose', async () => {
      const mockEvent = {
        params: { protocolId: 'test-protocol-123' },
        data: {
          after: {
            exists: true,
            data: () => ({
              protocol_name: 'Test Protocol',
              created_by: { user_id: 'doctor_123' },
              doses: [
                { date: '2026-08-01' },
                { date: '2026-08-02' }
              ]
            })
          }
        }
      };

      await protocolDaySync(mockEvent);

      expect(mockFirestore.batch).toHaveBeenCalled();
      expect(mockBatch.set).toHaveBeenCalledTimes(2);
      expect(mockBatch.commit).toHaveBeenCalled();
      
      const firstSetCall = mockBatch.set.mock.calls[0];
      expect(firstSetCall[1]).toMatchObject({
        title: 'Protocol Dose: Test Protocol',
        type: 'protocol',
        protocolId: 'test-protocol-123'
      });
    });

    it('should ignore if after does not exist (delete operation)', async () => {
      const mockEvent = {
        data: {
          after: { exists: false }
        }
      };

      await protocolDaySync(mockEvent);
      expect(mockFirestore.batch).not.toHaveBeenCalled();
    });
  });

  describe('syncToGoogleCalendar', () => {
    it('should insert a new event if googleEventId is missing', async () => {
      const mockEventDoc = {
        exists: true,
        data: () => ({
          title: 'Test Event',
          start: '2026-08-10T10:00:00Z',
          end: '2026-08-10T11:00:00Z',
          ownerIds: ['user_456']
        })
      };

      const mockEvent = {
        params: { eventId: 'event_789' },
        data: { after: mockEventDoc }
      };

      mockDocRef.get.mockResolvedValueOnce({
        data: () => ({
          googleCalendar: { refresh_token: 'valid_refresh_token' }
        })
      });

      await syncToGoogleCalendar(mockEvent);

      expect(mockCollection).toHaveBeenCalledWith('users');
      expect(mockDocRef.get).toHaveBeenCalled();
      
      expect(insertMock).toHaveBeenCalled();
      expect(updateMock).not.toHaveBeenCalled();
      
      expect(mockDocRef.update).toHaveBeenCalledWith({
        googleEventId: 'new-google-event-id'
      });
    });

    it('should update an existing event if googleEventId is present', async () => {
      const mockEventDoc = {
        exists: true,
        data: () => ({
          title: 'Updated Event',
          start: '2026-08-10T10:00:00Z',
          googleEventId: 'existing-google-event-id',
          ownerIds: ['user_456']
        })
      };

      const mockEvent = {
        params: { eventId: 'event_789' },
        data: { after: mockEventDoc }
      };

      mockDocRef.get.mockResolvedValueOnce({
        data: () => ({
          googleCalendar: { refresh_token: 'valid_refresh_token' }
        })
      });

      await syncToGoogleCalendar(mockEvent);

      expect(updateMock).toHaveBeenCalled();
      expect(insertMock).not.toHaveBeenCalled();
    });
  });
});
