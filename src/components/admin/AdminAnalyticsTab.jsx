import React from 'react';
import AdminAnalyticsTabClient from './AdminAnalyticsTabClient';

/**
 * AdminAnalyticsTab — Server Component
 * Future expansion: Pre-fetch analytics data here if an internal SDK method becomes available.
 */
export default async function AdminAnalyticsTab({ isSubTab = false }) {
  // Pass initialData as null for now, Client will fetch via API
  return <AdminAnalyticsTabClient isSubTab={isSubTab} />;
}
