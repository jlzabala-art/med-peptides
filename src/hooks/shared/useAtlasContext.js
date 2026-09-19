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

    const isProductsPath = pathname.includes('/products') || pathname.includes('/catalog');

    // Role and Path based logic
    switch (effectiveRole) {
      case 'doctor':
      case 'medical_director':
        themeAccent = '#0d9488';
        themeBgActive = 'rgba(13, 148, 136, 0.08)';
        agentType = 'clinical_decision';
        assistantName = 'Clinical AI Copilot';
        
        if (isProductsPath) {
          suggestedPrompts = [
            { label: '💉 Retatrutide dosages and vial formats' },
            { label: '🔬 Retatrutide vs Tirzepatide clinical comparison' },
            { label: '⚖️ Weight-adjusted titration schedule' },
            { label: '⚠️ Screen peptide contraindications' }
          ];
          contextActions = [
            { id: 'doc_formats', icon: Sparkles, label: 'Dosing & Formats', desc: 'Vial sizes & concentrations', color: 'purple', prompt: 'What dosages, concentrations, and vial formats are available for catalog peptides?' },
            { id: 'doc_indications', icon: Activity, label: 'Clinical Indications', desc: 'Research evidence & trials', color: 'teal', prompt: 'Summarize clinical research evidence and medical indications for catalog peptides.' }
          ];
        } else if (pathname.includes('/proto') || pathname.includes('/protocols')) {
          suggestedPrompts = [
            { label: '📄 Descargar Guía Clínica de Protocolo PDF' },
            { label: '🔬 Mecanismos de acción y fases de titulación' },
            { label: '⚠️ Analíticas de laboratorio y biomarcadores requeridos' },
            { label: '💊 Crear prescripción médica desde protocolo' }
          ];
          contextActions = [
            { id: 'doc_guide', icon: FileText, label: 'Guía Clínica PDF', desc: 'Ficha técnica y posología', color: 'teal', prompt: 'Genera la guía clínica y ficha técnica oficial en PDF para el protocolo seleccionado.' },
            { id: 'doc_biomarkers', icon: Activity, label: 'Monitoreo de Labs', desc: 'Biomarcadores pre y post ciclo', color: 'blue', prompt: '¿Qué analíticas basales y de seguimiento se requieren para este protocolo?' }
          ];
        } else if (pathname.includes('/prescriptions')) {
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
        
        if (isProductsPath) {
          suggestedPrompts = [
            { label: '💬 Explain how Retatrutide works' },
            { label: '🧊 How to store and prepare peptide vials' },
            { label: '✨ What are the benefits of catalog peptides?' }
          ];
          contextActions = [
            { id: 'pat_guide', icon: BookOpen, label: 'Reconstitution Guide', desc: 'Step-by-step preparation', color: 'purple', prompt: 'Show me step-by-step reconstitution and storage instructions for catalog products.' },
            { id: 'pat_goals', icon: TrendingUp, label: 'Wellness Goals', desc: 'Recovery & metabolism', color: 'blue', prompt: 'Which catalog peptides align with metabolic health and wellness goals?' }
          ];
        } else if (pathname.includes('/prescriptions') || pathname.includes('/orders')) {
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
        
        if (isProductsPath) {
          suggestedPrompts = [
            { label: '💰 Retatrutide 10-kit and 50-kit tier pricing' },
            { label: '📈 Peptides with highest wholesale margins' },
            { label: '📦 Supplier stock availability and lead times' },
            { label: '🤝 Request bulk discount quotation' }
          ];
          contextActions = [
            { id: 'ws_tiers', icon: TrendingUp, label: 'Volume Tiers (10x/50x)', desc: 'Bulk discounts & kits', color: 'purple', prompt: 'What are the volume tier discounts (10x, 50x kits) and margins for catalog peptides?' },
            { id: 'ws_inventory', icon: Database, label: 'Supplier Availability', desc: 'Immediate stock & lead times', color: 'orange', prompt: 'Which catalog items are running low across verified suppliers?' }
          ];
        } else {
          suggestedPrompts = [
            { label: '📦 High-demand peptide trends' },
            { label: '💰 Optimize purchase volume margins' }
          ];
          contextActions = [
            { id: 'ws_inventory', icon: Database, label: 'Stock Alerts', desc: 'Low stock supplier items', color: 'orange', prompt: 'Which catalog items are running low across verified suppliers?' },
            { id: 'ws_margins', icon: TrendingUp, label: 'Tier Margins', desc: 'Wholesale vs Retail', color: 'purple', prompt: 'Analyze current gross margins across 10x and 50x volume tiers.' }
          ];
        }
        break;

      case 'compounding_pharmacy':
        themeAccent = '#10b981';
        themeBgActive = 'rgba(16, 185, 129, 0.08)';
        agentType = 'formulation_expert';
        
        suggestedPrompts = [
          { label: '⚗️ Raw API cost per gram vs finished vials' },
          { label: '🧊 Peptide stability at 4°C vs -20°C' },
          { label: '🔬 Check CAS numbers and COA purity' },
          { label: '💵 Compounding unit cost breakdown' }
        ];
        contextActions = [
          { id: 'pharm_api', icon: Database, label: 'Raw API Sourcing', desc: 'CAS numbers & COA purity', color: 'blue', prompt: 'Check raw material API availability, CAS numbers, and purity specifications.' },
          { id: 'pharm_specs', icon: Sparkles, label: 'Compounding Specs', desc: 'Stability & reconstitution', color: 'teal', prompt: 'Review compounding formulation stability and reconstitution guidelines.' }
        ];
        break;

      case 'supplier':
        themeAccent = '#6366f1';
        themeBgActive = 'rgba(99, 102, 241, 0.08)';
        agentType = 'api_catalog_expert';
        
        suggestedPrompts = [
          { label: '📄 Generate API technical data sheet' },
          { label: '📊 Demand forecast for catalog peptides' },
          { label: '🤝 Pricing competitiveness vs competitors' },
          { label: '🔬 Certificate of Analysis (COA) verification' }
        ];
        contextActions = [
          { id: 'sup_placement', icon: TrendingUp, label: 'Catalog Pricing', desc: 'Price competitiveness', color: 'blue', prompt: 'Analyze catalog price competitiveness across peptide formats.' },
          { id: 'sup_demand', icon: AlertCircle, label: 'Demand Forecast', desc: 'Stock deficits & inquiries', color: 'purple', prompt: 'Which peptides have highest demand velocity and stock shortages?' }
        ];
        break;

      case 'admin':
        themeAccent = '#1a73e8';
        themeBgActive = 'rgba(26, 115, 232, 0.08)';
        agentType = 'copilot_admin';
        
        if (isProductsPath) {
          suggestedPrompts = [
            { label: '🏷️ Compare peptide variant prices across tiers' },
            { label: '⚠️ Which variants are low in stock (<20 units)?' },
            { label: '🧬 Retatrutide variants and pricing levels' },
            { label: '📊 Finished products vs raw API materials' }
          ];
          contextActions = [
            { id: 'admin_pricing', icon: TrendingUp, label: 'Pricing & Margins', desc: 'Cost vs Wholesale vs Retail', color: 'purple', prompt: 'Audit peptide pricing levels and margins across cost, clinic, wholesale, and retail tiers.' },
            { id: 'admin_stock', icon: AlertCircle, label: 'Catalog Stock Alerts', desc: 'Critical stock & zero units', color: 'red', prompt: 'Which catalog peptides or variants have low stock (<20 units) or are out of stock?' }
          ];
        } else if (pathname.includes('/proto') || pathname.includes('/protocols')) {
          suggestedPrompts = [
            { label: '📋 Exportar Compendio de Protocolos PDF' },
            { label: '🔥 Comparar protocolos metabólicos (Semaglutide/Retatrutide)' },
            { label: '🧬 Protocolos con mayor sinergia y completitud clínica' },
            { label: '⚠️ Verificar disponibilidad de stock para protocolos' }
          ];
          contextActions = [
            { id: 'proto_compendium', icon: FileText, label: 'Compendio PDF', desc: 'Directorio clínico de protocolos', color: 'teal', prompt: 'Genera el compendio clínico en PDF con todos los protocolos activos.' },
            { id: 'proto_synergies', icon: Sparkles, label: 'Sinergias & Interacciones', desc: 'Análisis de combinaciones', color: 'purple', prompt: 'Analiza las sinergias clínicas e interacciones entre péptidos en nuestros protocolos más populares.' }
          ];
        } else if (pathname.includes('/deploy')) {
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

    // Global Product Page Override (Rule #1: NO admin cards on single product/supplement detail pages)
    if (pathname.startsWith('/product/') || pathname.startsWith('/supplements/')) {
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
