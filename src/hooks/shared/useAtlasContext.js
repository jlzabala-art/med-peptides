import { useMemo } from 'react';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useSimulationStore } from '@/stores/useSimulationStore';
import { FileText, TrendingUp, AlertCircle, ShoppingCart, UserCheck, MessageSquare, Calendar, ShieldAlert, RefreshCw, Sparkles, BookOpen, Terminal, Database, Activity } from '@/lib/icons';

export function useAtlasContext() {
  const { activeRole } = useAuth();
  const { simulatedRole } = useSimulationStore();
  const effectiveRole = simulatedRole || activeRole || 'patient';
  const pathname = usePathname() || '';

  const contextData = useMemo(() => {
    let themeAccent = '#4285f4'; 
    let themeBgActive = 'rgba(66, 133, 244, 0.08)';
    let agentType = 'default';
    let assistantName = 'Atlas AI';
    let suggestedPrompts = [{ label: '👋 How can I assist you today?' }];
    let contextActions = [];

    // Role and Path based logic
    switch (effectiveRole) {
      case 'doctor':
      case 'medical_director':
        themeAccent = '#0d9488';
        themeBgActive = 'rgba(13, 148, 136, 0.08)';
        agentType = 'clinical_decision';
        assistantName = 'Clinical AI Copilot';
        
        if (pathname.includes('/prescriptions')) {
          suggestedPrompts = [
            { label: '📋 Review pending prescriptions' },
            { label: '💊 Recommended BPC-157 dosage' },
            { label: '⚠️ Screen drug interactions' }
          ];
          contextActions = [
            { id: 'doc_sugerir_protocolo', icon: Sparkles, label: 'Suggest Protocols', desc: 'Based on patient biomarkers', color: 'purple', prompt: 'Suggest evidence-based medical protocols tailored to the patient metrics.' },
            { id: 'doc_interacciones', icon: ShieldAlert, label: 'Interaction Check', desc: 'Cross-reference compounds', color: 'red', prompt: 'Check for potential contraindications or drug-peptide interactions.' }
          ];
        } else if (pathname.includes('/patients')) {
          suggestedPrompts = [
            { label: '📊 Patient biomarker trends' },
            { label: '⚠️ Screen contraindications' },
            { label: '📝 Draft prescription protocol' }
          ];
          contextActions = [
            { id: 'doc_interacciones', icon: ShieldAlert, label: 'Drug Safety Check', desc: 'Contraindications & interactions', color: 'red', prompt: 'Screen active patient protocols for contraindications and drug interactions.' },
            { id: 'doc_biomarkers', icon: Activity, label: 'Biomarker Review', desc: 'HbA1c, IGF-1 & blood panels', color: 'teal', prompt: 'Evaluate recent blood lab panels and identify out-of-range biomarkers.' }
          ];
        } else {
          suggestedPrompts = [
            { label: '💉 GLP-1 Protocol Titration' },
            { label: '🔬 Peptide Clinical Evidence' },
            { label: '📋 Draft Clinical Consultation Note' },
            { label: '⚠️ Drug Interaction Check' }
          ];
          contextActions = [
            { id: 'doc_safety', icon: ShieldAlert, label: 'Drug Safety & Warnings', desc: 'Contraindications & interactions', color: 'red', prompt: 'Screen active patient protocols for contraindications and compound interactions.' },
            { id: 'doc_biomarkers', icon: Activity, label: 'Biomarker Lab Review', desc: 'Evaluate blood panels & trends', color: 'teal', prompt: 'Evaluate recent blood lab panels and identify out-of-range biomarkers.' }
          ];
        }
        break;

      case 'patient':
        themeAccent = '#4285f4';
        themeBgActive = 'rgba(66, 133, 244, 0.08)';
        agentType = 'wellness_companion';
        
        if (pathname.includes('/prescriptions') || pathname.includes('/orders')) {
          suggestedPrompts = [
            { label: '📦 Track my order shipment' },
            { label: '🔄 Request prescription refill' }
          ];
          contextActions = [
            { id: 'pat_refill', icon: ShoppingCart, label: 'Request Refill', desc: 'Submit intake', color: 'orange', prompt: 'I want to request a refill for my active prescriptions.' },
            { id: 'pat_guide', icon: BookOpen, label: 'Reconstitution Guide', desc: 'Step-by-step instructions', color: 'purple', prompt: 'Show me the step-by-step reconstitution guide for my products.' }
          ];
        } else {
          suggestedPrompts = [
            { label: '💬 Explain my current protocol' },
            { label: '📅 What to expect in Week 2?' }
          ];
          contextActions = [
            { id: 'pat_next_dose', icon: Calendar, label: 'My Next Dose', desc: "Today's schedule", color: 'green', prompt: 'When is my next protocol dose scheduled?' },
            { id: 'pat_goals', icon: TrendingUp, label: 'Goal Progress', desc: 'Health markers', color: 'blue', prompt: 'Show my progress against my personal health objectives.' }
          ];
        }
        break;

      case 'wholesaler':
        themeAccent = '#f4b400';
        themeBgActive = 'rgba(244, 180, 0, 0.08)';
        agentType = 'b2b_optimizer';
        
        suggestedPrompts = [
          { label: '📦 High-demand peptide trends' },
          { label: '💰 Optimize purchase volume margins' }
        ];
        contextActions = [
          { id: 'ws_inventory', icon: Database, label: 'Stock Alerts', desc: 'Low stock supplier items', color: 'orange', prompt: 'Which catalog items are running low across verified suppliers?' },
          { id: 'ws_margins', icon: TrendingUp, label: 'Tier Margins', desc: 'Wholesale vs Retail', color: 'purple', prompt: 'Analyze current gross margins across 10x and 50x volume tiers.' }
        ];
        break;

      case 'admin':
        themeAccent = '#1a73e8';
        themeBgActive = 'rgba(26, 115, 232, 0.08)';
        agentType = 'copilot_admin';
        
        if (pathname.includes('/deploy')) {
          contextActions = [
            { id: 'deploy_trigger', icon: Terminal, label: 'Trigger Deploy', desc: 'Deploy to Production', color: 'blue', prompt: 'Trigger a new manual deployment to production.' },
            { id: 'deploy_backup', icon: Database, label: 'Run Backup', desc: 'Database Snapshot', color: 'green', prompt: 'Trigger a manual database snapshot right now.' }
          ];
        } else if (pathname.includes('/finance') || pathname.includes('/analytics')) {
          contextActions = [
            { id: 'fin_pnl', icon: TrendingUp, label: 'Analyze P&L (AI)', desc: 'Expenses vs Revenue', color: 'purple', prompt: 'Analyze P&L by listing products sorted by highest margin and retrieving the top selling products.' },
            { id: 'fin_sync', icon: RefreshCw, label: 'Sync Zoho Books', desc: 'Reconcile invoices', color: 'blue', prompt: 'Sync and verify Zoho financial records for recent transactions.' }
          ];
        } else if (pathname.includes('/sales') || pathname.includes('/orders')) {
          contextActions = [
            { id: 'sales_approve', icon: UserCheck, label: 'Pending Orders', desc: 'Awaiting dispatch', color: 'green', prompt: 'List all pending orders awaiting payment or dispatch.' },
            { id: 'sales_delays', icon: AlertCircle, label: 'Transit Delays', desc: 'Carrier monitoring', color: 'orange', prompt: 'Check in-transit shipments to detect any carrier delays.' }
          ];
        } else {
          suggestedPrompts = [
            { label: '⚙️ Inspect system audit logs' },
            { label: '📊 Today\'s revenue & order summary' }
          ];
          contextActions = [
            { id: 'admin_report', icon: FileText, label: 'Executive Report', desc: 'Operations & KPI summary', color: 'blue', prompt: 'Generate an executive summary of platform metrics and catalog coverage.' },
            { id: 'admin_alerts', icon: AlertCircle, label: 'System Alerts', desc: 'Critical notifications', color: 'red', prompt: 'Check for pending user approvals, supplier RFQs, and data completeness alerts.' }
          ];
        }
        break;
        
      default:
        break;
    }

    // Global Product Page Override (Rule #1: NO admin cards on product/supplement pages)
    if (pathname.includes('/product/') || pathname.includes('/supplements/')) {
      contextActions = [];
      suggestedPrompts = [
        { label: '🔬 Scientific Mechanism of Action' },
        { label: '💊 Recommended Research Dosage' },
        { label: '✨ Is this right for me?' },
        { label: '🧊 Reconstitution & Storage Guide' }
      ];
    }

    return {
      themeAccent,
      themeBgActive,
      agentType,
      assistantName,
      suggestedPrompts,
      contextActions,
      contextMode: (effectiveRole === 'medical_director' ? 'doctor' : effectiveRole) || 'default'
    };
  }, [effectiveRole, pathname]);

  return contextData;
}
