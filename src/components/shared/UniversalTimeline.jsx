import UserPlus from "lucide-react/dist/esm/icons/user-plus";
import FileText from "lucide-react/dist/esm/icons/file-text";
import Pill from "lucide-react/dist/esm/icons/pill";
import DollarSign from "lucide-react/dist/esm/icons/dollar-sign";
import Activity from "lucide-react/dist/esm/icons/activity";
import Settings from "lucide-react/dist/esm/icons/settings";
import PackageSearch from "lucide-react/dist/esm/icons/package-search";
import Stethoscope from "lucide-react/dist/esm/icons/stethoscope";
import Mail from "lucide-react/dist/esm/icons/mail";
import React, { useState, useEffect } from 'react';
import { collection, query, where, orderBy, getDocs, limit, onSnapshot } from 'firebase/firestore';
import { db } from '../../firebase';









import { formatDistanceToNow } from 'date-fns';

const EVENT_ICONS = {
  'PATIENT_CREATED': UserPlus,
  'ORDER_PLACED': PackageSearch,
  'PRESCRIPTION_CREATED': Pill,
  'PAYMENT_RECEIVED': DollarSign,
  'TEST_ORDERED': Activity,
  'CLINIC_CREATED': Settings,
  'PHYSICIAN_ONBOARDED': Stethoscope,
  'DOCUMENT_UPLOADED': FileText,
  'COMMUNICATION_LOGGED': Mail
};

const EVENT_COLORS = {
  'PATIENT_CREATED': '#3b82f6',
  'ORDER_PLACED': '#10b981',
  'PRESCRIPTION_CREATED': '#8b5cf6',
  'PAYMENT_RECEIVED': '#10b981',
  'TEST_ORDERED': '#f59e0b',
  'CLINIC_CREATED': '#6366f1',
  'PHYSICIAN_ONBOARDED': '#ec4899',
  'DOCUMENT_UPLOADED': '#64748b',
  'COMMUNICATION_LOGGED': '#0ea5e9'
};

export default function UniversalTimeline({ entityId = null, entityType = null, maxItems = 20 }) {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let q;
    const activitiesRef = collection(db, 'activities');

    if (entityId) {
      q = query(
        activitiesRef, 
        where('relatedEntityId', '==', entityId),
        orderBy('createdAt', 'desc'),
        limit(maxItems)
      );
    } else {
      // Global Timeline
      q = query(
        activitiesRef,
        orderBy('createdAt', 'desc'),
        limit(maxItems)
      );
    }

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedEvents = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setEvents(fetchedEvents);
      setLoading(false);
    }, (err) => {
      console.error("Error fetching timeline:", err);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [entityId, maxItems]);

  if (loading) {
    return <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>Loading timeline...</div>;
  }

  if (events.length === 0) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
        No recent activities recorded.
        {!entityId && " Global events will appear here as users interact with the system."}
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', position: 'relative' }}>
      {/* Vertical Line */}
      <div style={{ position: 'absolute', left: '19px', top: '24px', bottom: '24px', width: '2px', backgroundColor: '#e2e8f0', zIndex: 0 }}></div>

      {events.map((event, idx) => {
        const Icon = EVENT_ICONS[event.type] || Activity;
        const color = EVENT_COLORS[event.type] || '#64748b';
        const dateStr = event.createdAt?.seconds 
          ? formatDistanceToNow(new Date(event.createdAt.seconds * 1000), { addSuffix: true }) 
          : 'Just now';

        return (
          <div key={event.id || idx} style={{ display: 'flex', gap: '1rem', paddingBottom: '1.5rem', position: 'relative', zIndex: 1 }}>
            {/* Icon Node */}
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: `${color}15`, border: `1px solid ${color}30`, color: color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Icon size={18} />
            </div>

            {/* Event Content */}
            <div style={{ flex: 1, backgroundColor: 'white', border: '1px solid var(--border)', borderRadius: '8px', padding: '1rem', boxShadow: '0 1px 2px rgba(0,0,0,0.02)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                <div style={{ fontWeight: 600, color: 'var(--text-main)', fontSize: '0.9rem' }}>
                  {event.title}
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                  {dateStr}
                </div>
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                {event.description}
              </div>

              {/* Related Entity Chip */}
              {!entityId && event.entityName && (
                <div style={{ marginTop: '0.75rem', display: 'inline-block' }}>
                  <span style={{ fontSize: '0.7rem', padding: '2px 8px', backgroundColor: '#f1f5f9', color: '#475569', borderRadius: '4px', fontWeight: 600, cursor: 'pointer' }}>
                    {event.entityType}: {event.entityName}
                  </span>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}