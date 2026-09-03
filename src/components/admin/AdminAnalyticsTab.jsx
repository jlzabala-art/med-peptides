import React from 'react';
import AdminAnalyticsTabClient from './AdminAnalyticsTabClient';

import { fetchGlobalAnalyticsAction } from '../../actions/adminActions';

/**
 * AdminAnalyticsTab — Server Component
 * Fetches massive analytics aggregated on the server to prevent sending 
 * hundreds of documents to the browser.
 */
export default async function AdminAnalyticsTab({ isSubTab = false }) {
  // Pre-fetch securely on the server!
  const initialData = await fetchGlobalAnalyticsAction();
  return <AdminAnalyticsTabClient isSubTab={isSubTab} initialData={initialData} />;
}
