"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function OrdersRedirectPage() {
  const router = useRouter();
  const { activeRole } = useAuth();

  useEffect(() => {
    const role = (activeRole || 'patient').toLowerCase();
    if (role === 'doctor' || role === 'medical_director') {
      router.replace('/doctor/orders');
    } else if (role === 'wholesaler' || role === 'wholeseller') {
      router.replace('/wholesaler/orders');
    } else if (role === 'supplier') {
      router.replace('/supplier/orders');
    } else if (role === 'admin') {
      router.replace('/admin/orders');
    } else {
      router.replace('/patient/orders');
    }
  }, [activeRole, router]);

  return (
    <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b', fontWeight: 600 }}>
      Redirecting to orders...
    </div>
  );
}
