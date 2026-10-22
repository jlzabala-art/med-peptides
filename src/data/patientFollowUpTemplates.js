/**
 * src/data/patientFollowUpTemplates.js
 *
 * Medical follow-up templates designed with an empathetic, non-commercial,
 * clinical tone for patient follow-up and 1-click patient portal onboarding.
 */

export const FOLLOWUP_SCENARIOS = [
  {
    id: 'treatment_inquiry',
    label: 'Revisión Médica & Factura Emitida (Sin Presión)',
    labelEn: 'Clinical Review & Prepared Formulation (No Pressure)',
    description: 'Acompañamiento médico tras emitir la propuesta/factura de farmacia para resolver dudas de posología antes de preparar el producto.',
    icon: 'Stethoscope'
  },
  {
    id: 'portal_invitation',
    label: 'Invitación 1-Click al Portal de Pacientes',
    labelEn: '1-Click Patient Portal Access (For Active Buyers)',
    description: 'Para pacientes que han adquirido el tratamiento, invitándoles a ver su pauta médica, guías de administración y analíticas con 1 clic.',
    icon: 'UserCheck'
  },
  {
    id: 'clinical_adherence',
    label: 'Evolución Clínica & Tolerancia',
    labelEn: 'Clinical Evolution & Tolerance Check',
    description: 'Seguimiento de cómo se encuentra el paciente con su tratamiento y si experimenta buena tolerancia.',
    icon: 'Activity'
  },
  {
    id: 'refill_renewal',
    label: 'Continuidad de Ciclo & Renovación (Refill)',
    labelEn: 'Treatment Continuity & Cycle Refill',
    description: 'Revisión para evaluar si corresponde pautar la siguiente fase o ciclo de mantenimiento.',
    icon: 'RotateCw'
  }
];

export function generatePatientFollowUpMessage({
  scenario = 'treatment_inquiry',
  language = 'es', // 'es' | 'en'
  patientName = 'Paciente',
  doctorName = 'Dr. Khalid Shukri',
  treatmentTitle = 'Tratamiento Pautado',
  rxCode = '',
  patientPortalUrl = ''
}) {
  const cleanDoc = doctorName.startsWith('Dr.') ? doctorName : `Dr. ${doctorName}`;
  const cleanPatient = patientName.replace(/^Patient\s+[A-Z0-9-]+/i, '').trim() || patientName;
  const baseUrl = patientPortalUrl || (rxCode ? `https://www.atlashealth-services.com/rx/${encodeURIComponent(rxCode)}` : 'https://www.atlashealth-services.com');

  if (language === 'en') {
    switch (scenario) {
      case 'treatment_inquiry':
        return `Hello ${cleanPatient},

This is the clinical care team writing on behalf of ${cleanDoc} regarding your prescribed personalized treatment plan for ${treatmentTitle}${rxCode ? ` (Ref #${rxCode})` : ''}.

Your customized pharmacy formulation order has been prepared. ${cleanDoc} wanted us to personally check in with you to see how you are feeling, and to ensure any clinical questions regarding your posology, administration guidelines, or therapeutic schedule are fully answered before the pharmacy proceeds with dispensing.

You can review your complete clinical prescription and instructions on your secure portal:
👉 ${baseUrl}

Please feel free to reply directly here with any medical questions or timing preferences. We are here to support your therapeutic journey.

Warm regards,
Clinical Care Team · ${cleanDoc}
Atlas Health Services`;

      case 'portal_invitation':
        return `Hello ${cleanPatient},

Following your recent consultation with ${cleanDoc}, we are delighted to invite you to activate your private Patient Portal on Atlas Health Services with just 1 click (no password required):

👉 ${baseUrl}

Inside your confidential patient portal, you will be able to:
• Access your detailed posology, application schedules, and cold-chain storage instructions for ${treatmentTitle}.
• Download your clinical prescription sheets and diagnostic reports.
• Request direct medical follow-up consultations or treatment refills.

We remain at your service throughout your health journey.

Warm regards,
${cleanDoc} & Clinical Support Team
Atlas Health Services`;

      case 'clinical_adherence':
        return `Hello ${cleanPatient},

This is ${cleanDoc}'s clinical team checking in on how you are feeling with your ${treatmentTitle} regimen.

How is your tolerance so far? Are you noticing any changes, or do you have any questions regarding your daily dosing schedule?

You can review your updated prescription details anytime:
👉 ${baseUrl}

Please let us know how your progress is going so we can ensure optimal outcomes for your protocol.

Warm regards,
${cleanDoc} · Clinical Follow-up Team
Atlas Health Services`;

      case 'refill_renewal':
        return `Hello ${cleanPatient},

We are reaching out from ${cleanDoc}'s medical practice regarding your current cycle of ${treatmentTitle}.

As your current supply approaches completion, ${cleanDoc} recommends evaluating your therapeutic progress to determine if a maintenance phase or cycle renewal is indicated.

Review your protocol history and request renewal here:
👉 ${baseUrl}

Please let us know if you would like to schedule a clinical follow-up review with the doctor.

Warm regards,
Clinical Care Team · ${cleanDoc}
Atlas Health Services`;

      default:
        return '';
    }
  }

  // Default: Spanish
  switch (scenario) {
    case 'treatment_inquiry':
      return `Hola ${cleanPatient},

Le escribimos desde el equipo de seguimiento clínico del ${cleanDoc} en relación a su pauta médica de ${treatmentTitle}${rxCode ? ` (Ref #${rxCode})` : ''}.

Hemos preparado su orden de formulación en farmacia. El doctor nos ha pedido ponernos en contacto con usted para ver cómo se encuentra y asegurarnos de que la posología recomendada, el modo de administración y los tiempos de su tratamiento están completamente claros para usted antes de que la farmacia proceda con la dispensación.

Puede consultar los detalles de su prescripción médica en su ficha clínica segura:
👉 ${baseUrl}

Si tiene cualquier duda médica o necesita adaptar la pauta antes de dispensar, estamos a su total disposición respondiendo directamente a este mensaje.

Un cordial saludo,
Equipo de Seguimiento Clínico · ${cleanDoc}
Atlas Health Services`;

    case 'portal_invitation':
      return `Hola ${cleanPatient},

Esperamos que se encuentre muy bien. Tras la prescripción realizada por el ${cleanDoc}, le invitamos a acceder a su Portal de Paciente privado en Atlas Health Services con un solo clic (sin necesidad de crear contraseñas):

👉 ${baseUrl}

En su portal de paciente podrá:
• Consultar la posología exacta, consejos de aplicación y conservación de ${treatmentTitle}.
• Descargar su informe médico y analíticas.
• Solicitar renovaciones de tratamiento (refills) con su médico de forma inmediata.

Estamos a su disposición para acompañarle en cada etapa de su tratamiento.

Un saludo muy cordial,
${cleanDoc} y Equipo Clínico Atlas
Atlas Health Services`;

    case 'clinical_adherence':
      return `Hola ${cleanPatient},

Le contactamos desde la consulta médica del ${cleanDoc} para dar seguimiento a su tratamiento de ${treatmentTitle}.

¿Cómo se va encontrando estos días? ¿Está tolerando bien la medicación o le surge alguna duda con respecto a las tomas o la aplicación?

Puede consultar su pauta activa en cualquier momento aquí:
👉 ${baseUrl}

Queremos asegurarnos de que su respuesta al tratamiento sea óptima. Quedamos atentos a cualquier comentario.

Un cordial saludo,
${cleanDoc} & Equipo de Atención Médica
Atlas Health Services`;

    case 'refill_renewal':
      return `Hola ${cleanPatient},

Le escribimos desde el equipo del ${cleanDoc} en relación a su ciclo actual de ${treatmentTitle}.

Dado que está próximo a completar la pauta pautada, el doctor considera conveniente revisar su evolución clínica para valorar si procede pautar una fase de mantenimiento o renovación de su formulación.

Puede revisar su expediente médico aquí:
👉 ${baseUrl}

Quedamos a su disposición si desea coordinar una consulta de revisión con el doctor.

Un cordial saludo,
Equipo de Seguimiento Clínico · ${cleanDoc}
Atlas Health Services`;

    default:
      return '';
  }
}
