import Users from "lucide-react/dist/esm/icons/users";
import Calendar from "lucide-react/dist/esm/icons/calendar";
import Microscope from "lucide-react/dist/esm/icons/microscope";
import Activity from "lucide-react/dist/esm/icons/activity";
import React from 'react';
import { motion } from 'framer-motion';





const MetricCard = motion.create(React.forwardRef(({ title, value, trend, icon: Icon, color, bgColor, alert = false }, ref) => {
  return (
    <div ref={ref} style={{
      backgroundColor: 'white', borderRadius: '24px', padding: '1.75rem',
      boxShadow: '0 4px 20px rgba(0,0,0,0.03)', border: `1px solid ${alert ? 'rgba(239, 68, 68, 0.3)' : 'var(--color-border)'}`,
      position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column', gap: '1.25rem',
      transition: 'transform 0.2s, box-shadow 0.2s'
    }} onMouseOver={(e) => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 10px 25px rgba(0,0,0,0.05)'; }}
       onMouseOut={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.03)'; }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ width: '48px', height: '48px', borderRadius: '14px', backgroundColor: bgColor, color: color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon size={24} strokeWidth={2.5} />
        </div>
        {alert && (
          <span style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--color-danger)', backgroundColor: 'rgba(239, 68, 68, 0.1)', padding: '0.3rem 0.6rem', borderRadius: '10px', animation: 'pulse 2s infinite' }}>
            Action Needed
          </span>
        )}
      </div>
      <div>
        <h4 style={{ margin: 0, fontSize: '0.9rem', color: 'var(--color-text-secondary)', fontWeight: 600 }}>{title}</h4>
        <div style={{ fontSize: '2rem', fontWeight: 900, color: '#0f172a', marginTop: '0.2rem', letterSpacing: '-0.03em' }}>
          {value}
        </div>
        <div style={{ margin: '0.4rem 0 0', fontSize: '0.8rem', color: alert ? 'var(--color-danger)' : 'var(--color-success)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
          {trend}
        </div>
      </div>
    </div>
  );
}));

export default function ClinicalKpiOverview({ metrics }) {
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
  };

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" style={{ 
      display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem'
    }}>
      <MetricCard variants={itemVariants} title="Active Patients" value={metrics?.activePatients || 0} icon={Users} color="#0ea5e9" bgColor="rgba(14, 165, 233, 0.1)" trend="+4% this month" />
      <MetricCard variants={itemVariants} title="Today's Appointments" value={metrics?.appointmentsToday || 0} icon={Calendar} color="#8b5cf6" bgColor="rgba(139, 92, 246, 0.1)" trend="2 remaining" alert={metrics?.appointmentsToday > 0} />
      <MetricCard variants={itemVariants} title="Pending Lab Results" value={metrics?.pendingLabs || 0} icon={Microscope} color="var(--color-danger)" bgColor="rgba(239, 68, 68, 0.1)" trend="2 urgent" alert={metrics?.pendingLabs > 0} />
      <MetricCard variants={itemVariants} title="Active Protocols" value={metrics?.activeProtocols || 0} icon={Activity} color="var(--color-success)" bgColor="rgba(16, 185, 129, 0.1)" trend="+12% this week" />
    </motion.div>
  );
}