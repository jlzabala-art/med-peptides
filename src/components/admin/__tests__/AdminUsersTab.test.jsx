import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { describe, test, vi, expect } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import AdminUsersTab from '../AdminUsersTab.jsx';

vi.mock('firebase/firestore', () => {
  const collection = (db, name) => ({ _collectionName: name });
  const query = (col, ...args) => ({ _collectionName: col._collectionName });
  const getDocs = (q) => {
    const colName = q?._collectionName;
    let data = [];
    if (colName === 'users') {
      data = [
        {
          id: 'u1',
          fullName: 'Patient One',
          role: 'patient',
          approved: true,
          createdAt: '2026-05-26T13:00:00Z',
        },
        {
          id: 'u2',
          fullName: 'Patient Two',
          role: 'guest',
          approved: false,
          createdAt: '2026-05-26T13:00:00Z',
        },
        {
          id: 'u3',
          fullName: 'Dr. House',
          role: 'doctor',
          approved: true,
          createdAt: '2026-05-26T13:00:00Z',
        },
      ];
    } else if (colName === 'doctor_patient_relationships') {
      data = [{ id: 'r1', patientId: 'u1', doctorId: 'u3', status: 'active' }];
    } else if (colName === 'orders') {
      data = [{ id: 'o1', userId: 'u1', total: 100, status: 'completed' }];
    }
    return Promise.resolve({
      docs: data.map((item) => ({
        id: item.id,
        data: () => {
          const { id, ...rest } = item;
          return rest;
        },
      })),
    });
  };

  return {
    collection,
    getDocs,
    doc: () => ({}),
    updateDoc: () => Promise.resolve(),
    getDoc: () => Promise.resolve({ exists: () => false }),
    where: () => ({}),
    query,
    addDoc: () => Promise.resolve({ id: 'new-id' }),
    arrayUnion: () => ({}),
    initializeFirestore: () => ({}),
    persistentLocalCache: () => ({}),
    persistentSingleTabManager: () => ({}),
    getCountFromServer: () => Promise.resolve({ data: () => ({ count: 3 }) }),
    limit: () => ({}),
    startAfter: () => ({}),
    orderBy: () => ({}),
  };
});

// Mock db and auth context
vi.mock('../../../firebase', () => ({ db: {} }));
vi.mock('../../../context/AuthContext', () => ({
  useAuth: () => ({ user: { uid: 'test-admin' } }),
}));

describe('AdminUsersTab', () => {
  test('renders without crashing with defaultRole="patient" and mock data', async () => {
    render(
      <MemoryRouter>
        <AdminUsersTab defaultRole="patient" />
      </MemoryRouter>
    );
    await waitFor(() => {
      expect(screen.getByText('Patient One')).toBeInTheDocument();
    });
  });
});
