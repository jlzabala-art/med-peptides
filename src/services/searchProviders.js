import * as fb from '../firebase.js';
import logger from '../utils/logger.js';
const db = fb?.db;
import { collection, query, where, getDocs, limit } from 'firebase/firestore';
import { searchAlgolia, searchAlgoliaFederated } from './algoliaSearch.js';
import { Box, User, Package, FileText, Building2, Stethoscope } from 'lucide-react';

const fuzzyMatch = (q, text) => text?.toLowerCase().includes(q.toLowerCase());

export async function searchProductsAndProtocols(q, routePrefix = '') {
  try {
    const algoliaRes = await searchAlgolia(q);
    const products = (algoliaRes.products || []).map(p => ({
      id: `prod-${p.objectID || p.id}`,
      label: p.name || p.displayName,
      path: `${routePrefix}/products?search=${encodeURIComponent(p.name || p.displayName)}`,
      type: 'Product',
      icon: Box
    }));
    const protocols = (algoliaRes.protocols || []).map(p => ({
      id: `prot-${p.objectID || p.id}`,
      label: p.name || p.title,
      path: `${routePrefix}/protocols?search=${encodeURIComponent(p.name || p.title)}`,
      type: 'Protocol',
      icon: Stethoscope
    }));
    return { products, protocols };
  } catch (err) {
    logger.error('[searchProviders] Error searching products/protocols:', err);
    return { products: [], protocols: [] };
  }
}

export async function searchFederatedEntities(q, portalType = 'admin', routePrefix = '') {
  try {
    const fed = await searchAlgoliaFederated(q);
    const results = [];

    // 1. Products
    (fed.products || []).forEach(p => {
      results.push({
        id: `prod-${p.objectID || p.id}`,
        label: p.name || p.displayName,
        sublabel: p.category ? `Category: ${p.category}` : undefined,
        path: `${routePrefix}/products?search=${encodeURIComponent(p.name || p.displayName)}`,
        type: 'Product',
        icon: Box
      });
    });

    // 2. Protocols
    (fed.protocols || []).forEach(p => {
      results.push({
        id: `prot-${p.objectID || p.id}`,
        label: p.name || p.title,
        sublabel: p.primary_goal ? `Goal: ${p.primary_goal}` : undefined,
        path: `${routePrefix}/protocols?search=${encodeURIComponent(p.name || p.title)}`,
        type: 'Protocol',
        icon: Stethoscope
      });
    });

    // 3. Patients
    (fed.patients || []).forEach(pat => {
      results.push({
        id: `pat-${pat.objectID || pat.id}`,
        label: pat.fullName || pat.name || pat.email,
        sublabel: pat.phone || pat.email || undefined,
        path: portalType === 'doctor' 
          ? `/doctor/patients?search=${encodeURIComponent(pat.fullName || pat.name || pat.email)}`
          : `/admin/patients?search=${encodeURIComponent(pat.fullName || pat.name || pat.email)}`,
        type: 'Patient',
        icon: User
      });
    });

    // 4. Prescriptions
    (fed.prescriptions || []).forEach(rx => {
      results.push({
        id: `rx-${rx.objectID || rx.id}`,
        label: `Rx: ${rx.patientName || rx.patient?.name || 'Patient'} (${rx.doctorName || 'Doctor'})`,
        sublabel: rx.fagron?.boxId ? `Box ID: ${rx.fagron.boxId}` : (rx.status ? `Status: ${rx.status}` : undefined),
        path: `${routePrefix}/prescriptions?search=${encodeURIComponent(rx.patientName || rx.patient?.name || rx.fagron?.boxId || '')}`,
        type: 'Prescription',
        icon: FileText
      });
    });

    // 5. Clinics
    (fed.clinics || []).forEach(cln => {
      results.push({
        id: `cln-${cln.objectID || cln.id}`,
        label: cln.name || 'Clinic',
        sublabel: cln.territory || cln.network || undefined,
        path: `/admin/clinics?search=${encodeURIComponent(cln.name || '')}`,
        type: 'Clinic',
        icon: Building2
      });
    });

    return results;
  } catch (err) {
    logger.warn('[searchProviders] Federated search fallback:', err.message);
    return [];
  }
}

export async function searchUsers(q, portalType, currentUser) {
  const lowerQ = q.toLowerCase();
  try {
    if (portalType === 'admin') {
      if (q.includes('@')) {
        const uSnap = await getDocs(query(collection(db, 'users'), where('email', '>=', lowerQ), where('email', '<=', lowerQ + '\uf8ff'), limit(5)));
        return uSnap.docs.map(d => {
          const data = d.data();
          return { id: d.id, label: data.fullName || data.email, path: `/admin/users?uid=${d.id}`, type: 'User', icon: User };
        });
      } else {
        const uSnap = await getDocs(query(collection(db, 'users'), limit(50)));
        return uSnap.docs
          .map(d => ({ id: d.id, ...d.data() }))
          .filter(u => fuzzyMatch(lowerQ, u.fullName || u.email || ''))
          .slice(0, 5)
          .map(u => ({ id: u.id, label: u.fullName || u.email, path: `/admin/users?search=${encodeURIComponent(u.fullName || u.email)}`, type: 'User', icon: User }));
      }
    } else if (portalType === 'doctor') {
      const uSnap = await getDocs(query(collection(db, 'users'), where('role', '==', 'patient'), limit(80)));
      return uSnap.docs
        .map(d => ({ id: d.id, ...d.data() }))
        .filter(u => {
          const isAssigned = u.assignedDoctorIds?.includes(currentUser?.uid) || u.doctorId === currentUser?.uid;
          return isAssigned && fuzzyMatch(lowerQ, u.fullName || u.email || '');
        })
        .slice(0, 5)
        .map(u => ({ id: u.id, label: u.fullName || u.email, path: `/doctor/patients?search=${encodeURIComponent(u.fullName || u.email)}`, type: 'Patient', icon: User }));
    }
    return [];
  } catch (err) {
    logger.error('[searchProviders] Error searching users:', err);
    return [];
  }
}

export async function searchOrders(q, portalType, currentUser) {
  const lowerQ = q.toLowerCase();
  try {
    if (portalType === 'admin') {
      const oSnap = await getDocs(query(collection(db, 'orders'), limit(50)));
      return oSnap.docs
        .map(d => ({ id: d.id, ...d.data() }))
        .filter(o => fuzzyMatch(lowerQ, o.id) || fuzzyMatch(lowerQ, o.userEmail || ''))
        .slice(0, 5)
        .map(o => ({ id: o.id, label: `Order #${o.id.slice(0,8)} - ${o.userEmail}`, path: `/admin/orders?orderId=${o.id}`, type: 'Order', icon: Package }));
    } else if (portalType === 'doctor') {
      const oSnap = await getDocs(query(collection(db, 'orders'), limit(80)));
      return oSnap.docs
        .map(d => ({ id: d.id, ...d.data() }))
        .filter(o => fuzzyMatch(lowerQ, o.id) || fuzzyMatch(lowerQ, o.userEmail || ''))
        .slice(0, 5)
        .map(o => ({ id: o.id, label: `Order #${o.id.slice(0,8)} - ${o.userEmail}`, path: `/doctor/orders?orderId=${o.id}`, type: 'Order', icon: Package }));
    } else if (portalType === 'patient' || portalType === 'wholesaler') {
      const oSnap = await getDocs(query(collection(db, 'orders'), where('userId', '==', currentUser?.uid || ''), limit(50)));
      return oSnap.docs
        .map(d => ({ id: d.id, ...d.data() }))
        .filter(o => fuzzyMatch(lowerQ, o.id))
        .slice(0, 5)
        .map(o => ({ id: o.id, label: `Order #${o.id.slice(0,8)}`, path: `/${portalType}/orders?orderId=${o.id}`, type: 'Order', icon: Package }));
    }
    return [];
  } catch (err) {
    logger.error('[searchProviders] Error searching orders:', err);
    return [];
  }
}