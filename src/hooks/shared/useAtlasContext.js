import { useMemo } from 'react';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { FileText, TrendingUp, AlertCircle, ShoppingCart, UserCheck, MessageSquare, Calendar, ShieldAlert, RefreshCw, Sparkles, BookOpen, Terminal, Database, Activity } from '@/lib/icons';

export function useAtlasContext() {
  const { activeRole } = useAuth();
  const pathname = usePathname() || '';

  const contextData = useMemo(() => {
    let themeAccent = '#4285f4'; 
    let themeBgActive = 'rgba(66, 133, 244, 0.08)';
    let agentType = 'default';
    let assistantName = 'Atlas AI';
    let suggestedPrompts = [{ label: '👋 How can I assist you today?' }];
    let contextActions = [];

    // Role and Path based logic
    switch (activeRole) {
      case 'doctor':
        themeAccent = '#0f9d58';
        themeBgActive = 'rgba(15, 157, 88, 0.08)';
        agentType = 'clinical_decision';
        
        if (pathname.includes('/prescriptions')) {
          suggestedPrompts = [
            { label: '📋 Review pending prescriptions' },
            { label: '💊 Recommended BPC-157 dosage' }
          ];
          contextActions = [
            { id: 'doc_sugerir_protocolo', icon: Sparkles, label: 'Suggest Protocols', desc: 'Based on patient biomarkers', color: 'purple', prompt: 'Suggest evidence-based medical protocols tailored to the patient metrics.' },
            { id: 'doc_interacciones', icon: ShieldAlert, label: 'Interaction Check', desc: 'Cross-reference compounds', color: 'red', prompt: 'Check for potential contraindications or drug-peptide interactions.' }
          ];
        } else {
          suggestedPrompts = [
            { label: '💉 GLP-1 Weight Management Protocol' },
            { label: '🔬 Peptide Clinical Trial Evidence' },
            { label: '📋 Draft Clinical Consultation Note' }
          ];
          contextActions = [
            { id: 'doc_citas_hoy', icon: Calendar, label: "Today's Schedule", desc: 'Consultations & intakes', color: 'blue', prompt: 'Show my scheduled patient consultations for today.' },
            { id: 'doc_seguimiento', icon: AlertCircle, label: 'Follow-up Alerts', desc: 'Check-ins required', color: 'orange', prompt: 'List active patients who are due for biomarker follow-up.' }
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
      contextMode: activeRole || 'default'
    };
  }, [activeRole, pathname]);

  return contextData;
}
