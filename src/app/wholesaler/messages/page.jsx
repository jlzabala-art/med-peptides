"use client";

import React from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useRouter } from 'next/navigation';
import MessagingWidget from '../../../components/messaging/MessagingWidget';

export default function MessagesPage() {
  const { user } = useAuth();
  const router = useRouter();
  return <MessagingWidget />;
}
