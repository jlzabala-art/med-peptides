import {
  BarChart3,
  Users,
  Layers,
  Sparkles,
  Dna,
  FlaskConical,
  TrendingUp,
  ShieldCheck,
  Award,
} from 'lucide-react';

/**
 * Builds the streamlined Google Cloud-style sidebar groups for the Doctor Portal.
 * Consolidates overlapping "Pending Actions" into Prescriptions quick-filters
 * so clinicians navigate fewer, clearer top-level sections.
 */
export function buildDoctorSidebarGroups({
  isAuthorizedViewer,
  uniquePatientsCount,
  soldPatientsCount,
  unacceptedPatientsCount,
  allPrescriptionsCount,
  activeCount,
  proposalsCount,
  primaryBlueprintsCount,
  dnaResultsCount,
  bloodLabResultsCount,
}) {
  const workspaceItems = [
    {
      id: 'overview',
      label: 'Overview',
      icon: BarChart3,
      badge: null,
    },
    {
      id: 'patients',
      label: 'Patients',
      icon: Users,
      isLocked: !isAuthorizedViewer,
      badge: uniquePatientsCount > 0 ? uniquePatientsCount : null,
      actionBadgeTooltip: uniquePatientsCount > 0
        ? `${uniquePatientsCount} unique patients (${soldPatientsCount} sold customers, ${unacceptedPatientsCount} unaccepted proposals)`
        : undefined,
    },
    {
      id: 'prescriptions',
      label: 'Prescriptions',
      icon: Layers,
      isLocked: !isAuthorizedViewer,
      badge: allPrescriptionsCount > 0 ? allPrescriptionsCount : null,
      actionBadgeTooltip: activeCount > 0
        ? `${allPrescriptionsCount} total prescriptions (${activeCount} sold & invoiced, ${proposalsCount} unaccepted proposals)`
        : undefined,
    },
  ];

  return [
    {
      group: 'CLINICAL WORKSPACE',
      groupTitle: 'CLINICAL WORKSPACE',
      items: workspaceItems,
    },
    {
      group: 'CLINICAL INTELLIGENCE',
      groupTitle: 'CLINICAL INTELLIGENCE',
      items: [
        {
          id: 'recommendations',
          label: 'Atlas Recommendations',
          icon: Sparkles,
          badge: primaryBlueprintsCount > 0 ? primaryBlueprintsCount : null,
        },
        {
          id: 'dna_analysis',
          label: 'DNA Analysis',
          icon: Dna,
          badge: dnaResultsCount > 0 ? dnaResultsCount : null,
        },
        {
          id: 'lab_results',
          label: 'Lab Diagnostics',
          icon: FlaskConical,
          badge: bloodLabResultsCount > 0 ? bloodLabResultsCount : null,
        },
        {
          id: 'analytics',
          label: 'Practice Analytics',
          icon: TrendingUp,
          badge: null,
        },
      ],
    },
    {
      group: 'PRACTICE SETTINGS',
      groupTitle: 'PRACTICE SETTINGS',
      items: [
        {
          id: 'credentials',
          label: 'Clinic Credentials',
          icon: ShieldCheck,
          isLocked: !isAuthorizedViewer,
          badge: null,
        },
        {
          id: 'services_tiers',
          label: 'Platform Services',
          icon: Award,
          badge: null,
        },
      ],
    },
  ];
}
