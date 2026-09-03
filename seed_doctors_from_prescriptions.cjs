const admin = require('firebase-admin');
const serviceAccount = require('./scripts/serviceAccountKey.json');
if (!admin.apps.length) admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
const db = admin.firestore();

async function run() {
  const prescriptionsSnap = await db.collection('prescriptions').get();
  console.log(`Found ${prescriptionsSnap.size} prescriptions.`);
  
  const doctorStats = {}; // { [doctorName]: { count: 0, clinic: '', id: null } }
  
  // Aggregate from prescriptions
  for (const doc of prescriptionsSnap.docs) {
    const data = doc.data();
    if (!data.doctorName) continue;
    
    const dName = data.doctorName.trim();
    if (!doctorStats[dName]) {
      doctorStats[dName] = { count: 0, clinic: data.clinic || '', ids: [], docs: [] };
    }
    doctorStats[dName].count++;
    doctorStats[dName].docs.push(doc.id);
  }
  
  console.log(`Found ${Object.keys(doctorStats).length} unique doctors.`);
  
  let added = 0;
  for (const [name, stats] of Object.entries(doctorStats)) {
    // Check if user exists by displayName or firstName
    const existing = await db.collection('users').where('displayName', '==', name).limit(1).get();
    let userId;
    
    if (existing.empty) {
      // Create new user
      const nameParts = name.replace(/dr\.?\s*/i, '').split(' ');
      const firstName = nameParts[0] || name;
      const lastName = nameParts.slice(1).join(' ') || '';
      
      const res = await db.collection('users').add({
        role: 'doctor',
        firstName,
        lastName,
        displayName: name,
        clinicName: stats.clinic,
        prescriptionCount: stats.count,
        email: firstName.toLowerCase() + '@' + (stats.clinic.toLowerCase().replace(/[^a-z]/g, '') || 'clinic') + '.com',
        status: 'active',
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        approved: true
      });
      userId = res.id;
      added++;
    } else {
      userId = existing.docs[0].id;
      await db.collection('users').doc(userId).update({
        prescriptionCount: stats.count,
        role: 'doctor' // ensure role
      });
    }
    
    // Update prescriptions with physicianId
    for (const pid of stats.docs) {
      await db.collection('prescriptions').doc(pid).update({
        physicianId: userId
      });
    }
  }
  
  console.log(`Done. Created ${added} new doctors, updated ${Object.keys(doctorStats).length - added} existing.`);
}

run().catch(console.error);
