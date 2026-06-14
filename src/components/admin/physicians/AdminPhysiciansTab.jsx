import Loader2 from "lucide-react/dist/esm/icons/loader-2";
import Plus from "lucide-react/dist/esm/icons/plus";
import Users from "lucide-react/dist/esm/icons/users";
import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, limit, getCountFromServer, getAggregateFromServer, sum, count } from 'firebase/firestore';
import { db } from '../../../firebase';




import PhysiciansAnalyticsHeader from './PhysiciansAnalyticsHeader';
import PhysiciansDirectory from './PhysiciansDirectory';
import PhysicianProfileDrawer from './PhysicianProfileDrawer';
import PhysicianOnboardingWizard from './PhysicianOnboardingWizard';

export default function AdminPhysiciansTab() {
  const [loading, setLoading] = useState(true);
  // Real Data State
  const [doctors, setDoctors] = useState([]);
  const [globalStats, setGlobalStats] = useState({ totalPhysicians: 0, activePhysicians: 0, newThisMonth: 0, totalRevenue: 0 });
  // Mappings for table
  const [patientMap, setPatientMap] = useState({});
  const [orderMap, setOrderMap] = useState({});

  // UI State
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    async function fetchPhysicianData() {
      try {
        // 1. Fetch Doctors (Limit to 100 for fast page load)
        const docsQuery = query(collection(db, 'users'), where('roles', 'array-contains', 'doctor'), limit(100));
        const docsSnap = await getDocs(docsQuery);
        const docsList = docsSnap.docs.map(d => ({ id: d.id, ...d.data() }));
        // 2. Fetch Global Stats using Server-Side Aggregation (Fast, 1 read per query)
        // Total revenue
        const revenueSnap = await getAggregateFromServer(collection(db, 'orders'), {
          total: sum('total')
        });
        const revenueAmount = revenueSnap.data().total || 0;

        // Total Physicians
        const totalDocsSnap = await getCountFromServer(query(collection(db, 'users'), where('roles', 'array-contains', 'doctor')));
        const totalDocsCount = totalDocsSnap.data().count;

        // Active Physicians
        const activeDocsSnap = await getCountFromServer(query(collection(db, 'users'), where('roles', 'array-contains', 'doctor'), where('status', '==', 'active')));
        const activeDocsCount = activeDocsSnap.data().count;

        // New this month
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        let newDocsCount = 0;
        try {
          const newDocsSnap = await getCountFromServer(query(collection(db, 'users'), where('roles', 'array-contains', 'doctor'), where('createdAt', '>=', startOfMonth)));
          newDocsCount = newDocsSnap.data().count;
        } catch(e) {
          console.warn("Index missing for new this month calculation, fallback to 0");
        }

        setGlobalStats({
          totalPhysicians: totalDocsCount,
          activePhysicians: activeDocsCount,
          newThisMonth: newDocsCount,
          totalRevenue: revenueAmount
        });

        // 3. Fetch specific Order/Patient Aggregates per visible doctor
        const pMap = {};
        const oMap = {};
        await Promise.all(docsList.map(async (doc) => {
          try {
            const pCountSnap = await getCountFromServer(query(collection(db, 'doctor_patient_relationships'), where('doctorId', '==', doc.id)));
            pMap[doc.id] = [{ id: 'mock', length: pCountSnap.data().count }]; // PhysiciansDirectory uses length

            const oAggSnap = await getAggregateFromServer(
              query(collection(db, 'orders'), where('supervisingPhysicianId', '==', doc.id)),
              { totalRev: sum('total'), orderCount: count() }
            );
            const oData = oAggSnap.data();
            // PhysiciansDirectory uses length and sum
            const fakeOrderArr = new Array(oData.orderCount).fill({ total: 0 });
            if (oData.orderCount > 0) fakeOrderArr[0] = { total: oData.totalRev || 0 };
            oMap[doc.id] = fakeOrderArr;
          } catch(e) {
            console.error("Aggregation error for doc", doc.id, e);
            pMap[doc.id] = [];
            oMap[doc.id] = [];
          }
        }));

        setDoctors(docsList);
        setPatientMap(pMap);
        setOrderMap(oMap);

      } catch (err) {
        console.error("Error fetching physician data:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchPhysicianData();
  }, []);

  if (loading) {
    return (
      <div style={{ padding: '4rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', color: 'var(--text-muted)' }}>
        <Loader2 size={32} className="spin" style={{ color: 'var(--primary)' }} />
        <span>Loading Physician Directory...</span>
        <style>{`
          .spin { animation: spin 1s linear infinite; }
          @keyframes spin { 100% { transform: rotate(360deg); } }
        `}</style>
      </div>
    );
  }

  if (showOnboarding) {
    return (
      <PhysicianOnboardingWizard 
        onClose={() => setShowOnboarding(false)}
        onComplete={(newDoc) => {
          setDoctors([newDoc, ...doctors]);
        }}
      />
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: '1.5rem', backgroundColor: 'var(--background)' }}>
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ margin: '0 0 0.5rem 0', fontSize: '1.5rem', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Users size={24} color="var(--primary)" /> Physicians Management
          </h1>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Enterprise directory and performance tracking</div>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button className="gcp-btn-secondary">Import CSV</button>
          <button className="gcp-btn-primary" onClick={() => setShowOnboarding(true)}>
            <Plus size={16} style={{ marginRight: '0.5rem' }} /> Add Physician
          </button>
        </div>
      </div>

      {/* Analytics Header */}
      <PhysiciansAnalyticsHeader stats={globalStats} />

      {/* Main Directory Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
        <PhysiciansDirectory 
          doctors={doctors} 
          onSelectDoctor={setSelectedDoctor} 
          patientMap={patientMap} 
          orderMap={orderMap} 
          onAddPhysician={() => setShowOnboarding(true)}
        />
      </div>

      {/* Drawers & Modals */}
      {selectedDoctor && (
        <PhysicianProfileDrawer 
          doctor={selectedDoctor} 
          onClose={() => setSelectedDoctor(null)}
          // Drawer now fetches its own actual data
        />
      )}

    </div>
  );
}