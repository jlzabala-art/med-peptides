 
import React from 'react';
import { ShieldAlert } from 'lucide-react';

const ComplianceBanner = () => {
  return (
    <div className="compliance-banner bg-primary py-s">
      <div className="container">
        <div className="flex items-center justify-center gap-m text-dark font-bold">
          <ShieldAlert size={20} />
          <span className="p-s tracking-wide uppercase">
            ATTENTION: ALL PRODUCTS ARE STRICTLY FOR LABORATORY RESEARCH USE ONLY. NOT FOR HUMAN CONSUMPTION.
          </span>
          <ShieldAlert size={20} />
        </div>
      </div>
    </div>
  );
};

export default ComplianceBanner;
