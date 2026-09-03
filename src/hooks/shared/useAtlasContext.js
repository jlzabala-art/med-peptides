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
    let suggestedPrompts = [{ label: '👋 ¿Cómo puedes ayudarme?' }];
    let contextActions = [];

    // Role and Path based logic
    switch (activeRole) {
      case 'doctor':
        themeAccent = '#0f9d58';
        themeBgActive = 'rgba(15, 157, 88, 0.08)';
        agentType = 'clinical_decision';
        
        if (pathname.includes('/prescriptions')) {
          suggestedPrompts = [
            { label: '📋 Analizar recetas pendientes' },
            { label: '💊 Dosis recomendada BPC-157' }
          ];
          contextActions = [
            { id: 'doc_sugerir_protocolo', icon: Sparkles, label: 'Suggest Protocols', desc: 'Based on BMI', color: 'purple', prompt: 'Suggest medical protocols based on patient metrics.' },
            { id: 'doc_interacciones', icon: ShieldAlert, label: 'Interaction Check', desc: 'Cross-reference supplements', color: 'red', prompt: 'Check for potential interactions between these supplements.' }
          ];
        } else {
          suggestedPrompts = [
            { label: '💉 Protocolo para pérdida de peso' },
            { label: '🔬 Evidencia clínica de péptidos' },
            { label: '📋 Redactar nota clínica' }
          ];
          contextActions = [
            { id: 'doc_citas_hoy', icon: Calendar, label: 'Today\'s Appointments', desc: 'Daily schedule', color: 'blue', prompt: 'Show me my appointments for today.' },
            { id: 'doc_seguimiento', icon: AlertCircle, label: 'Follow-up Alerts', desc: 'Inactive patients', color: 'orange', prompt: 'List patients who need follow-ups.' }
          ];
        }
        break;

      case 'patient':
        themeAccent = '#4285f4';
        themeBgActive = 'rgba(66, 133, 244, 0.08)';
        agentType = 'wellness_companion';
        
        if (pathname.includes('/prescriptions') || pathname.includes('/orders')) {
          suggestedPrompts = [
            { label: '📦 ¿Cuándo llega mi pedido?' },
            { label: '🔄 ¿Cómo solicitar una recarga?' }
          ];
          contextActions = [
            { id: 'pat_refill', icon: ShoppingCart, label: 'Request Refill', desc: 'Add to cart', color: 'orange', prompt: 'I want to request a refill for my active prescriptions.' },
            { id: 'pat_guide', icon: BookOpen, label: 'Reconstitution Guide', desc: 'Video instructions', color: 'purple', prompt: 'Show me the reconstitution guide for my products.' }
          ];
        } else {
          suggestedPrompts = [
            { label: '💬 Explícame mi protocolo actual' },
            { label: '📅 ¿Qué esperar en semana 2?' }
          ];
          contextActions = [
            { id: 'pat_next_dose', icon: Calendar, label: 'My Next Dose', desc: "Today's plan", color: 'green', prompt: 'When is my next dose scheduled?' },
            { id: 'pat_goals', icon: TrendingUp, label: 'Goal Progress', desc: 'Mass / Longevity', color: 'blue', prompt: 'Show my progress against my health goals.' }
          ];
        }
        break;

      case 'wholesaler':
        themeAccent = '#f4b400';
        themeBgActive = 'rgba(244, 180, 0, 0.08)';
        agentType = 'b2b_optimizer';
        
        suggestedPrompts = [
          { label: '📦 ¿Qué péptidos tienen más demanda?' },
          { label: '💰 Optimizar márgenes de compra' }
        ];
        break;

      case 'admin':
        themeAccent = '#1a73e8';
        themeBgActive = 'rgba(26, 115, 232, 0.08)';
        agentType = 'copilot_admin';
        
        if (pathname.includes('/deploy')) {
          contextActions = [
            { id: 'deploy_trigger', icon: Terminal, label: 'Trigger Deploy', desc: 'Deploy to Prod', color: 'blue', prompt: 'Trigger a new manual deployment to production.' },
            { id: 'deploy_backup', icon: Database, label: 'Run Backup', desc: 'DB Snapshot', color: 'green', prompt: 'Trigger a manual database backup right now.' }
          ];
        } else if (pathname.includes('/finance') || pathname.includes('/analytics')) {
          contextActions = [
            { id: 'fin_pnl', icon: TrendingUp, label: 'Analyze P&L (AI)', desc: 'Expenses vs Revenue', color: 'purple', prompt: 'Analyze P&L by listing products sorted by highest margin and retrieving the top selling products.' },
            { id: 'fin_sync', icon: RefreshCw, label: 'Sync Zoho', desc: 'Force update', color: 'blue', prompt: 'Sync Zoho data for recent users.' }
          ];
        } else if (pathname.includes('/sales') || pathname.includes('/orders')) {
          contextActions = [
            { id: 'sales_approve', icon: UserCheck, label: 'Approve Pending', desc: 'Verified → Processing', color: 'green', prompt: 'List all pending orders.' },
            { id: 'sales_delays', icon: AlertCircle, label: 'Detect Delays', desc: 'Analyze shipping', color: 'orange', prompt: 'Check for pending orders to detect any delays.' }
          ];
        } else {
          suggestedPrompts = [
            { label: '⚙️ Revisar logs del sistema' },
            { label: '📊 Resumen financiero de hoy' }
          ];
          contextActions = [
            { id: 'admin_report', icon: FileText, label: 'Monthly Report', desc: 'PDF summary of metrics', color: 'blue', prompt: 'Generate a monthly sales and operations report.' },
            { id: 'admin_alerts', icon: AlertCircle, label: 'System Alerts', desc: 'Critical notifications', color: 'red', prompt: 'Check for pending user approvals and system alerts.' }
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
