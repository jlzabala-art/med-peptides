const admin = require('firebase-admin');

// Initialize with default credentials
admin.initializeApp({
  credential: admin.credential.applicationDefault()
});

const db = admin.firestore();

// The taxonomy mapping
const statusMap = {
  // Common
  'Active': 'active',
  'Pending': 'pending',
  'Approved': 'approved',
  'Rejected': 'rejected',
  'Cancelled': 'cancelled',
  'Archived': 'archived',
  'Completed': 'completed',
  
  // Prescriptions
  'Awaiting Review': 'pending',
  'processing': 'processing',
  'En Tránsito': 'en tránsito',
  
  // Invoices / POs
  'Paid': 'completed', // Or 'active' depending on context, let's map 'Paid' to 'completed' for invoices
  'Overdue': 'error', // Let's map 'Overdue' to 'error' or leave it as overdue? 'awaiting payment' is better
  'Awaiting Payment': 'awaiting payment',
  'Delivered': 'delivered',
  
  // Leads / Users
  'new': 'pending',
  'invited': 'invited',
};

async function migrateCollection(collectionName) {
  let updatedCount = 0;
  console.log(`\n--- Migrating Collection: ${collectionName} ---`);
  
  try {
    const snapshot = await db.collection(collectionName).get();
    
    const batchArray = [];
    let batch = db.batch();
    let batchCount = 0;
    
    snapshot.forEach(doc => {
      const data = doc.data();
      if (data && data.status) {
        const oldStatus = data.status;
        let newStatus = statusMap[oldStatus] || oldStatus.toLowerCase();
        
        // Only update if it's different
        if (newStatus !== oldStatus) {
          batch.update(doc.ref, { status: newStatus });
          batchCount++;
          updatedCount++;
          
          if (batchCount === 400) {
            batchArray.push(batch);
            batch = db.batch();
            batchCount = 0;
          }
        }
      }
    });
    
    if (batchCount > 0) {
      batchArray.push(batch);
    }
    
    // Dry run option (set to false to actually write)
    const DRY_RUN = false;
    
    if (DRY_RUN) {
      console.log(`[DRY RUN] Would update ${updatedCount} documents in ${collectionName}.`);
    } else {
      for (const b of batchArray) {
        await b.commit();
      }
      console.log(`Updated ${updatedCount} documents in ${collectionName}.`);
    }
  } catch (err) {
    console.error(`Error migrating ${collectionName}:`, err);
  }
}

async function run() {
  // List of main collections
  const collections = ['prescriptions', 'protocols', 'patients', 'users', 'clinics', 'products', 'orders', 'invoices'];
  
  for (const col of collections) {
    await migrateCollection(col);
  }
  
  console.log('\nMigration script finished.');
  process.exit(0);
}

run();
