"use client";

import React, { memo } from 'react';
import PublicUnifiedFooter from '../components/shared/PublicUnifiedFooter';

function Footer({ lang = 'en' }) {
  return <PublicUnifiedFooter lang={lang} />;
}

export default memo(Footer);