import UrgentAlertsBanner from '../components/doctor/gadgets/UrgentAlertsBanner';
import ClinicalKpiOverview from '../components/doctor/gadgets/ClinicalKpiOverview';
import ClinicalThroughputChart from '../components/doctor/gadgets/ClinicalThroughputChart';
import QuickActionsGrid from '../components/doctor/gadgets/QuickActionsGrid';
import PriorityActionCenter from '../components/doctor/gadgets/PriorityActionCenter';
import DailyScheduleList from '../components/doctor/gadgets/DailyScheduleList';
import QuickPatientSearch from '../components/doctor/gadgets/QuickPatientSearch';
import ClinicalScratchpad from '../components/doctor/gadgets/ClinicalScratchpad';
import ProtocolAdherenceWidget from '../components/doctor/gadgets/ProtocolAdherenceWidget';
import PrescriptionGeneratorWidget from '../components/doctor/gadgets/PrescriptionGeneratorWidget';
import ActivePrescriptionsTracker from '../components/doctor/gadgets/ActivePrescriptionsTracker';
import RefillApprovalsWidget from '../components/doctor/gadgets/RefillApprovalsWidget';
import LabResultsInboxWidget from '../components/doctor/gadgets/LabResultsInboxWidget';
import ClinicalProgressMonitorWidget from '../components/doctor/gadgets/ClinicalProgressMonitorWidget';
import ProtocolBuilderWidget from '../components/doctor/gadgets/ProtocolBuilderWidget';
import DirectMessageWidget from '../components/doctor/gadgets/DirectMessageWidget';

// Patient Gadgets
import MyActivePrescriptionsWidget from '../components/patient/gadgets/MyActivePrescriptionsWidget';
import RefillRequestWidget from '../components/patient/gadgets/RefillRequestWidget';
import MyMedicalTeamWidget from '../components/patient/gadgets/MyMedicalTeamWidget';
import BloodworkUploaderWidget from '../components/patient/gadgets/BloodworkUploaderWidget';
import SymptomLoggerWidget from '../components/patient/gadgets/SymptomLoggerWidget';
import AdverseEventLoggerWidget from '../components/patient/gadgets/AdverseEventLoggerWidget';
import DailyCheckinWidget from '../components/patient/gadgets/DailyCheckinWidget';

// Wholesaler Gadgets
import BulkOrderTrackerWidget from '../components/wholesaler/gadgets/BulkOrderTrackerWidget';
import StockAlertsWidget from '../components/wholesaler/gadgets/StockAlertsWidget';
import RealTimeStockManagerWidget from '../components/wholesaler/gadgets/RealTimeStockManagerWidget';
import BulkRestockPortalWidget from '../components/wholesaler/gadgets/BulkRestockPortalWidget';
import BatchExpirationTrackerWidget from '../components/wholesaler/gadgets/BatchExpirationTrackerWidget';
import TurnoverAnalyticsWidget from '../components/wholesaler/gadgets/TurnoverAnalyticsWidget';
import PrescriptionIntakeWidget from '../components/wholesaler/gadgets/PrescriptionIntakeWidget';
import DemandForecastingWidget from '../components/wholesaler/DemandForecastingWidget';

import GlobalLogisticsQueueWidget from '../components/admin/gadgets/GlobalLogisticsQueueWidget';
import B2BOrderApprovalsWidget from '../components/admin/gadgets/B2BOrderApprovalsWidget';
import SystemAuditLogWidget from '../components/admin/gadgets/SystemAuditLogWidget';
import PayoutManagerWidget from '../components/admin/gadgets/PayoutManagerWidget';

export const WIDGET_REGISTRY = {
  // Doctor
  'urgent_alerts': UrgentAlertsBanner,
  'kpi_overview': ClinicalKpiOverview,
  'clinical_chart': ClinicalThroughputChart,
  'quick_actions': QuickActionsGrid,
  'urgent_queue': PriorityActionCenter,
  'daily_schedule': DailyScheduleList,
  'patient_search': QuickPatientSearch,
  'clinical_scratchpad': ClinicalScratchpad,
  'protocol_adherence': ProtocolAdherenceWidget, // Old static one
  'prescription_generator': PrescriptionGeneratorWidget,
  'prescription_tracker': ActivePrescriptionsTracker,
  'refill_approvals': RefillApprovalsWidget,
  'lab_results_inbox': LabResultsInboxWidget,
  'clinical_progress': ClinicalProgressMonitorWidget,
  
  // Patient
  'my_prescriptions': MyActivePrescriptionsWidget,
  'refill_request': RefillRequestWidget,
  'my_medical_team': MyMedicalTeamWidget,
  'bloodwork_uploader': BloodworkUploaderWidget,
  'symptom_logger': SymptomLoggerWidget,
  'adverse_events': AdverseEventLoggerWidget,
  'daily_checkin': DailyCheckinWidget,

  // Wholesaler
  'bulk_order_tracker': BulkOrderTrackerWidget,
  'stock_alerts': StockAlertsWidget,
  'real_time_stock': RealTimeStockManagerWidget,
  'bulk_restock': BulkRestockPortalWidget,
  'batch_expiration': BatchExpirationTrackerWidget,
  'turnover_analytics': TurnoverAnalyticsWidget,
  'prescription_intake': PrescriptionIntakeWidget,
  'demand_forecasting': DemandForecastingWidget,

  // Admin
  'global_logistics': GlobalLogisticsQueueWidget,
  'b2b_approvals': B2BOrderApprovalsWidget,
  'system_audit': SystemAuditLogWidget,
  'payout_manager': PayoutManagerWidget,
  
  // New Doctor Gadgets
  'protocol_builder': ProtocolBuilderWidget,
  'direct_message': DirectMessageWidget
};

export const DEFAULT_DOCTOR_CONFIG = {
  layoutType: 'grid',
  widgets: [
    { id: 'urgent_alerts', order: 1, enabled: true, colSpan: 12 },
    { id: 'lab_results_inbox', order: 2, enabled: true, colSpan: 6 },
    { id: 'refill_approvals', order: 3, enabled: true, colSpan: 6 },
    { id: 'prescription_generator', order: 4, enabled: true, colSpan: 6 },
    { id: 'protocol_builder', order: 4.5, enabled: true, colSpan: 6 },
    { id: 'direct_message', order: 4.6, enabled: true, colSpan: 12 },
    { id: 'prescription_tracker', order: 5, enabled: true, colSpan: 6 },
    { id: 'clinical_progress', order: 6, enabled: true, colSpan: 12 },
    { id: 'kpi_overview', order: 7, enabled: true, colSpan: 12 },
    { id: 'clinical_chart', order: 8, enabled: true, colSpan: 8 },
    { id: 'daily_schedule', order: 9, enabled: true, colSpan: 4 },
    { id: 'quick_actions', order: 10, enabled: true, colSpan: 12 },
    { id: 'patient_search', order: 11, enabled: true, colSpan: 4 },
    { id: 'clinical_scratchpad', order: 12, enabled: true, colSpan: 12 },
  ]
};

export const DEFAULT_PATIENT_CONFIG = {
  layoutType: 'grid',
  widgets: [
    { id: 'adverse_events', order: 0, enabled: true, colSpan: 12 },
    { id: 'daily_checkin', order: 0.5, enabled: true, colSpan: 6 },
    { id: 'bloodwork_uploader', order: 1, enabled: true, colSpan: 6 },
    { id: 'my_prescriptions', order: 3, enabled: true, colSpan: 12 },
    { id: 'refill_request', order: 4, enabled: true, colSpan: 6 },
    { id: 'my_medical_team', order: 5, enabled: true, colSpan: 6 }
  ]
};

export const DEFAULT_WHOLESALER_CONFIG = {
  layoutType: 'grid',
  widgets: [
    { id: 'demand_forecasting', order: 0.1, enabled: true, colSpan: 12 },
    { id: 'prescription_intake', order: 0.2, enabled: true, colSpan: 12 },
    { id: 'turnover_analytics', order: 0.3, enabled: true, colSpan: 6 },
    { id: 'batch_expiration', order: 0.5, enabled: true, colSpan: 6 },
    { id: 'bulk_restock', order: 1, enabled: true, colSpan: 12 },
    { id: 'bulk_order_tracker', order: 2, enabled: true, colSpan: 12 },
    { id: 'stock_alerts', order: 3, enabled: true, colSpan: 6 },
    { id: 'real_time_stock', order: 4, enabled: true, colSpan: 6 }
  ]
};

export const DEFAULT_CLINIC_CONFIG = {
  layoutType: 'grid',
  widgets: [
    { id: 'bulk_restock', order: 1, enabled: true, colSpan: 12 },
    { id: 'urgent_alerts', order: 2, enabled: true, colSpan: 12 },
    { id: 'kpi_overview', order: 3, enabled: true, colSpan: 12 }
  ]
};

export const DEFAULT_ADMIN_CONFIG = {
  layoutType: 'grid',
  widgets: [
    { id: 'global_logistics', order: 1, enabled: true, colSpan: 12 },
    { id: 'b2b_approvals', order: 2, enabled: true, colSpan: 12 }
  ]
};
