import Box from "lucide-react/dist/esm/icons/box";
import User from "lucide-react/dist/esm/icons/user";
import Package from "lucide-react/dist/esm/icons/package";
import { db } from '../firebase';
import { collection, query, where, getDocs, limit } from 'firebase/firestore';
import { searchAlgolia } from './algoliaSearch';




const fuzzyMatch = (q, text) => text?.toLowerCase().includes(q.toLowerCase());

export async function searchProductsAndProtocols(q, routePrefix) {
  try {
    const algoliaRes = await searchAlgolia(q);
    const products = (algoliaRes.products || []).map(p => ({
      id: `prod-${p.objectID}`,
      label: p.name || p.displayName,
      path: `${routePrefix}/products?search=${encodeURIComponent(p.name || p.displayName)}`,
      type: 'Product',
      icon: Box
    }));
    const protocols = (algoliaRes.protocols || []).map(p => ({
      id: `prot-${p.objectID}`,
      label: p.name || p.title,
      path: `${routePrefix}/protocols?search=${encodeURIComponent(p.name || p.title)}`,
      type: 'Protocol',
      icon: Box
    }));
    return { products, protocols };
  } catch (err) {
    console.error('Error searching products/protocols:', err);
    return { products: [], protocols: [] };
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
    console.error('Error searching users:', err);
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
    console.error('Error searching orders:', err);
    return [];
  }
}