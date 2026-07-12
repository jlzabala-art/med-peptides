import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import * as fb from '../firebase';
const db = fb?.db;

/**
 * Run this function once manually (e.g. from the browser console) to generate demo quotations.
 * It will populate the "quotations_v2" collection with realistic B2B/B2C scenarios.
 */
export async function seedDemoQuotations() {
  const quotations = [
    {
      quotationNumber: 'QT-2023-001',
      patientName: 'John Doe',
      clinicName: 'Elite Peptides Clinic',
      doctorName: 'Dr. Sarah Jenkins',
      status: 'Draft',
      totalAmount: 1250.00,
      marginPercent: 45.5,
      leadTime: '3-5 Days',
      warehouse: 'USA'
    },
    {
      quotationNumber: 'QT-2023-002',
      patientName: 'Alice Smith',
      clinicName: 'Longevity Center',
      doctorName: 'Dr. Marcus Webb',
      status: 'Sent',
      totalAmount: 850.00,
      marginPercent: 38.0,
      leadTime: '1-2 Days',
      warehouse: 'USA'
    },
    {
      quotationNumber: 'QT-2023-003',
      patientName: 'Roberto Gomez',
      clinicName: 'Madrid Health Hub',
      doctorName: 'Dr. Elena Suarez',
      status: 'Pending Review',
      totalAmount: 2400.00,
      marginPercent: 52.0,
      leadTime: '5-7 Days',
      warehouse: 'Spain'
    },
    {
      quotationNumber: 'QT-2023-004',
      patientName: 'Emily Chen',
      clinicName: 'Optimal Wellness',
      doctorName: 'Dr. David Kim',
      status: 'Accepted',
      totalAmount: 3200.00,
      marginPercent: 48.2,
      leadTime: '3-5 Days',
      warehouse: 'Poland'
    },
    {
      quotationNumber: 'QT-2023-005',
      patientName: 'Michael Johnson',
      clinicName: 'Peak Performance',
      doctorName: 'Dr. Lisa Ray',
      status: 'Negotiation',
      totalAmount: 1750.00,
      marginPercent: 41.5,
      leadTime: '7-10 Days',
      warehouse: 'Dubai'
    },
    {
      quotationNumber: 'QT-2023-006',
      patientName: 'Sarah Williams',
      clinicName: 'Elite Peptides Clinic',
      doctorName: 'Dr. Sarah Jenkins',
      status: 'Converted',
      totalAmount: 4500.00,
      marginPercent: 55.0,
      leadTime: '3-5 Days',
      warehouse: 'USA'
    },
    {
      quotationNumber: 'QT-2023-007',
      patientName: 'David Brown',
      clinicName: 'Longevity Center',
      doctorName: 'Dr. Marcus Webb',
      status: 'Rejected',
      totalAmount: 950.00,
      marginPercent: 35.0,
      leadTime: '1-2 Days',
      warehouse: 'USA'
    },
    {
      quotationNumber: 'QT-2023-008',
      patientName: 'James Taylor',
      clinicName: 'UK Wellness Clinic',
      doctorName: 'Dr. Olivia Brown',
      status: 'Viewed',
      totalAmount: 1100.00,
      marginPercent: 42.0,
      leadTime: '5-7 Days',
      warehouse: 'Poland'
    },
    {
      quotationNumber: 'QT-2023-009',
      patientName: 'Maria Garcia',
      clinicName: 'Madrid Health Hub',
      doctorName: 'Dr. Elena Suarez',
      status: 'Draft',
      totalAmount: 2100.00,
      marginPercent: 50.0,
      leadTime: '3-5 Days',
      warehouse: 'Spain'
    },
    {
      quotationNumber: 'QT-2023-010',
      patientName: 'William Martinez',
      clinicName: 'Optimal Wellness',
      doctorName: 'Dr. David Kim',
      status: 'Accepted',
      totalAmount: 3800.00,
      marginPercent: 49.5,
      leadTime: '1-2 Days',
      warehouse: 'USA'
    }
  ];

  console.log('Starting to seed demo quotations...');
  let count = 0;
  for (const q of quotations) {
    try {
      await addDoc(collection(db, 'quotations_v2'), {
        ...q,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      count++;
    } catch (err) {
      console.error('Failed to add quotation:', q.quotationNumber, err);
    }
  }
  console.log(`Successfully seeded ${count} quotations.`);
}

// Attach to window so it can be run from the console:
if (typeof window !== 'undefined') {
  window.seedDemoQuotations = seedDemoQuotations;
}
