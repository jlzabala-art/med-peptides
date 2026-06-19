import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import fs from 'fs';
import path from 'path';

try {
  initializeApp();
} catch (e) {
  // Ignore if already initialized
}

const db = getFirestore();

const mockQueue = [
  {
    id: 'msg-1',
    subject: 'Cagrilintide Inquiry - Urgent Pricing',
    senderName: 'Lynn Magenta',
    senderEmail: 'lynn@magenta-health.com',
    detectedIntent: 'RFQ',
    status: 'New', 
    outcome: 'Pending',
    linkedRecord: null,
    owner: 'Procurement Team',
    date: '15-Jun-2026',
    category: 'rfqs',
    content: "Hi Atlas Team,\n\nWe are looking to source 15 grams of Cagrilintide for our upcoming clinical batch. Please provide pricing and COA. We need delivery to Dubai by next month.\n\nThanks,\nLynn",
    extraction: [
      { field: 'Product', value: 'Cagrilintide', source: 'Email Body', exactMatch: '15 grams of Cagrilintide', confidence: 98 },
      { field: 'Quantity', value: '15 grams', source: 'Email Body', exactMatch: '15 grams', confidence: 100 },
      { field: 'Delivery Location', value: 'Dubai', source: 'Email Body', exactMatch: 'delivery to Dubai', confidence: 95 }
    ],
    customerDetection: {
      name: 'Magenta Health Group',
      relationship: 'Business Client',
      lastOrders: 12,
      totalRevenue: 'USD 280,000',
      openRfqs: 3
    },
    workflowRecommendation: {
      action: 'Create RFQ',
      reasons: ['Product Found', 'Quantity Found', 'Customer Identified', 'Destination Found'],
      preview: {
        type: 'RFQ',
        products: [{ name: 'Cagrilintide', qty: '15 grams' }],
        destination: 'Dubai',
        estimatedValue: '$45,000'
      }
    },
    activityLog: [
      { id: 1, action: 'Email Received', time: '15-Jun 09:01', actor: 'System' },
      { id: 2, action: 'AI Processing Started', time: '15-Jun 09:02', actor: 'Atlas AI' },
      { id: 3, action: 'Intent Identified: RFQ', time: '15-Jun 09:03', actor: 'Atlas AI' },
      { id: 4, action: 'Product Detected', time: '15-Jun 09:03', actor: 'Atlas AI' },
      { id: 5, action: 'Quantity Extracted', time: '15-Jun 09:04', actor: 'Atlas AI' },
      { id: 6, action: 'Sender Categorized: Business Client', time: '15-Jun 09:04', actor: 'Atlas AI' }
    ]
  },
  {
    id: 'msg-2',
    subject: 'Prescription Request: Semaglutide 2.4mg',
    senderName: 'Dr. Robert Cline',
    senderEmail: 'robert.cline@mediluxe.com',
    detectedIntent: 'Prescription',
    status: 'Completed',
    outcome: 'Prescription Imported',
    linkedRecord: 'RX-2026-033',
    owner: 'Reimi',
    date: '15-Jun-2026',
    category: 'prescriptions',
    content: "Please find attached the prescription for patient JD-8821. Semaglutide 2.4mg, 1 pen per month.",
    extraction: [
      { field: 'Product', value: 'Semaglutide 2.4mg', source: 'Email Body', exactMatch: 'Semaglutide 2.4mg', confidence: 95 },
      { field: 'Quantity', value: '1 pen', source: 'Email Body', exactMatch: '1 pen', confidence: 100 },
      { field: 'Patient ID', value: 'JD-8821', source: 'Email Body', exactMatch: 'JD-8821', confidence: 98 }
    ],
    customerDetection: {
      name: 'Dr. Robert Cline (Mediluxe)',
      relationship: 'Registered Doctor',
      lastOrders: 45,
      totalRevenue: 'USD 12,500',
      openRfqs: 0
    },
    workflowRecommendation: {
      action: 'Create Prescription Draft',
      reasons: ['Doctor Verified', 'Patient Found', 'Dosage Extracted'],
      preview: {
        type: 'Prescription',
        products: [{ name: 'Semaglutide 2.4mg', qty: '1 pen' }],
        destination: 'Patient JD-8821',
        estimatedValue: '$350'
      }
    },
    activityLog: [
      { id: 1, action: 'Email Received', time: '15-Jun 08:15', actor: 'System' },
      { id: 2, action: 'AI Processing Started', time: '15-Jun 08:16', actor: 'Atlas AI' },
      { id: 3, action: 'Prescription Drafted', time: '15-Jun 08:18', actor: 'Atlas AI' },
      { id: 4, action: 'Reviewed and Approved', time: '15-Jun 08:25', actor: 'Reimi' },
      { id: 5, action: 'Prescription Imported', time: '15-Jun 08:26', actor: 'System' }
    ]
  }
];

async function seed() {
  console.log('Seeding operations queue...');
  for (const item of mockQueue) {
    // Keep id out of data, but we can set the doc ID manually
    const { id, ...data } = item;
    await db.collection('operations_queue').doc(id).set(data);
  }
  console.log('Done seeding!');
}

seed().catch(console.error);
