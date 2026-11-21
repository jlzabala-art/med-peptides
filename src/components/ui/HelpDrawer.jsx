'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Sparkles, HelpCircle, Send, ArrowUpRight, ArrowRight, RotateCcw } from 'lucide-react';
import StandardDrawer from './StandardDrawer';
import { useAtlasContext } from '@/context/AtlasContextProvider';
import { usePublicWorkspace } from '@/context/PublicWorkspaceContext';
import { useAuth } from '@/context/AuthContext';
import { trackSearchClick } from '@/services/algoliaInsights';

/**
 * Resolves a human-friendly screen title, quick workflow summary, and truly contextual
 * suggested questions for ANY screen in the platform, merging live `screenContext`
 * registered via `useRegisterAtlasContext` with route-specific clinical intelligence.
 */
function resolveContextualScreenHelp(pathname = '/', screenContext = null, isEs = false) {
  const anchor = screenContext?.contextAnchor || {};
  const entityName = anchor.name || screenContext?.title || '';
  const customPrompts = Array.isArray(anchor.helpPrompts) && anchor.helpPrompts.length > 0 ? anchor.helpPrompts : null;

  // 1. /calculator — Universal Peptide Administration & Dosing Guide
  if (pathname.startsWith('/calculator')) {
    return {
      title: entityName || (isEs
        ? 'Guía Universal de Preparación y Dosificación de Péptidos'
        : 'Universal Peptide Administration & Dosing Guide'),
      subtitle: anchor.keyActives || (isEs
        ? 'Paso 1: Elige Péptido · Paso 2: Elige Formato · Paso 3: Calcula Dosis y Clics/Unidades'
        : 'Step 1: Choose Peptide · Step 2: Pick Format · Step 3: Calculate Dose & Clicks/Units'),
      summaryGuide: anchor.welcomeIntro || (isEs
        ? '1) Busca o selecciona cualquier péptido y su concentración en el Paso 1. 2) Elige la presentación disponible (Vial, Pluma U-100, Cartucho 3 mL, Spray Nasal, Cápsulas o Tópico) en el Paso 2. 3) Ajusta la dosis en el Paso 3 y comparte el enlace o QR con el paciente.'
        : '1) Search or select any peptide and strength in Step 1. 2) Pick an available delivery format (Vial, U-100 Pen, 3 mL Cartridge, Nasal Spray, Oral Capsules, or Topical) in Step 2. 3) Set your dose in Step 3 and share the personalized link or QR with the patient.'),
      prompts: customPrompts || (isEs
        ? [
            '¿Cómo elijo primero mi péptido, formato de presentación y concentración en los Pasos 1 y 2?',
            '¿Cómo paso de mg o mcg a unidades de jeringa U-100 o clics de pluma (100 clics = 1 mL)?',
            '¿Cuánta agua bacteriostática (BAC) se recomienda según los mg del vial?',
            '¿Cómo comparto esta guía visual personalizada por enlace o código QR con un paciente?',
          ]
        : [
            'How do I choose my peptide, presentation format, and strength in Steps 1 & 2?',
            'How do I convert mg or mcg into U-100 syringe units or pen dial clicks (100 clicks = 1 mL)?',
            'How much bacteriostatic (BAC) water is recommended for each vial strength?',
            'How do I share this exact personalized visual guide via link or QR code with a patient?',
          ]),
    };
  }

  // 2. /pricing/pens or /pricing/dnlab-pens — Pre-filled Peptide Pen Dosing Guide
  if (pathname.startsWith('/pricing/pens') || pathname.startsWith('/pricing/dnlab-pens')) {
    return {
      title: entityName || (isEs
        ? 'Guía Clínica de Dosificación · Bolígrafos Precargados (U-100)'
        : 'Peptide Pen Dosing Guide · Pre-filled Multi-Dose Formulary (U-100)'),
      subtitle: isEs
        ? '27 Fórmulas · 45 Presentaciones (2.0–3.0 mL) · 100 clics = 1.00 mL'
        : '27 Formulated Pens · 45 Strength SKUs (2.0–3.0 mL) · 100 clicks = 1.00 mL',
      summaryGuide: isEs
        ? 'Cambia entre concentraciones con las píldoras de cada tarjeta, abre "Dial y Ficha" para simular clics en vivo y copiar o enviar por WhatsApp la pauta al paciente, o pulsa "+ Protocolo" para exportar un PDF clínico de 1 página.'
        : 'Switch strengths using the pills on any card, open "Dial & Specs" to simulate live clicks and copy/WhatsApp patient instructions inline, or click "+ Add to Protocol" to export a custom 1-page clinical PDF.',
      prompts: customPrompts || (isEs
        ? [
            '¿Cómo funciona la regla U-100 (100 clics = 1 mL; 1 clic = 0.01 mL) en cartuchos de 2, 2.4 y 3 mL?',
            '¿Cómo cambio los clics cuando varía la concentración (ej. MOTS-c 15/30/40/60 mg o NAD+ 300/750/1050 mg)?',
            '¿Cómo copio o envío por WhatsApp las instrucciones del paciente directamente desde "Dial y Ficha"?',
            '¿Cómo armo un protocolo de varias plumas y exporto la Guía Visual en PDF de 1 página?',
          ]
        : [
            'How does the U-100 dial conversion (100 clicks = 1 mL; 1 click = 0.01 mL) work across 2, 2.4 & 3 mL pens?',
            'How do dial clicks change across strengths (e.g. MOTS-c 15/30/40/60 mg or NAD+ 300/750/1050 mg)?',
            'How do I copy or WhatsApp patient dosing instructions directly from "Dial & Specs"?',
            'How do I assemble a multi-pen Supply Summary and export a 1-page Protocol PDF?',
          ]),
    };
  }

  // 2.5 /labels — Pharmacy Labels Studio
  if (pathname.startsWith('/labels')) {
    return {
      title: entityName || (isEs ? 'Estudio de Etiquetado Farmacéutico' : 'Pharmacy Labels Studio'),
      subtitle: isEs
        ? 'Carga Manual Multi-Parte · Vista Previa Térmica · Impresión A4'
        : 'Multi-Part Manual Rx · Live Label Preview · A4 Batch Printing',
      summaryGuide: isEs
        ? 'Usa "+ Nueva Rx Manual" para crear prescripciones multi-parte con vista previa en vivo, o selecciona filas de la cola de trabajo para imprimir etiquetas térmicas o en hoja A4.'
        : 'Use "+ Quick Manual Rx" to create multi-part prescriptions with live label preview, or select worklist rows for thermal or A4 batch printing.',
      prompts: customPrompts || (isEs
        ? [
            '¿Cómo creo una prescripción manual multi-parte (ej. TrichoTest 2 partes)?',
            '¿Cómo ajusto el offset de la hoja A4 y el lote/BUD en lote?',
            '¿Cómo verifico que la posología no desborde la etiqueta térmica?',
          ]
        : [
            'How do I create a multi-part manual prescription (e.g. TrichoTest 2-Part)?',
            'How do I configure A4 grid offset and batch Lot/BUD values?',
            'How do I verify directions fit cleanly on a thermal pharmacy label?',
          ]),
    };
  }

  // 2.6 /doctor & /dr/ — Physician Portal
  if (pathname.startsWith('/doctor') || pathname.startsWith('/dr/')) {
    return {
      title: entityName || (isEs ? 'Portal Clínico del Médico' : 'Physician Clinical Portal'),
      subtitle: isEs
        ? 'Prescripciones · Alertas de Refill · Análisis DNA · Protocolos'
        : 'Prescriptions · Refill Alerts · DNA Analysis · Protocols',
      summaryGuide: isEs
        ? 'Gestiona prescripciones activas, revisa alertas de renovación (refill) de pacientes y lanza formulaciones magistrales personalizadas.'
        : 'Manage active prescriptions, review patient refill alerts, and launch personalized compounded formulations.',
      prompts: customPrompts || (isEs
        ? [
            '¿Cómo reviso las alertas de refill pendientes de mis pacientes?',
            '¿Cómo genero una prescripción magistral desde un análisis genómico?',
            '¿Cómo comparto una guía visual de dosificación con un paciente?',
          ]
        : [
            'How do I review pending patient refill alerts?',
            'How do I generate a compounded prescription from a DNA analysis?',
            'How do I share a visual dosing guide with a patient?',
          ]),
    };
  }

  // 2.7 /patient — Patient Portal
  if (pathname.startsWith('/patient')) {
    return {
      title: entityName || (isEs ? 'Portal del Paciente' : 'Patient Care Portal'),
      subtitle: isEs
        ? 'Mis Prescripciones · Pauta Diaria · Solicitud de Refill'
        : 'My Prescriptions · Daily Schedule · Refill Request',
      summaryGuide: isEs
        ? 'Consulta tu pauta exacta de administración, conservación en frío y solicita la renovación de tu tratamiento en un clic.'
        : 'Review your exact administration schedule, cold-chain storage instructions, and request a treatment refill in one click.',
      prompts: customPrompts || (isEs
        ? [
            '¿Cómo leo mi dosis exacta en unidades U-100 o clics de pluma?',
            '¿Cómo solicito un refill o renovación de mi prescripción?',
            '¿Cómo debo conservar mi medicación una vez reconstituida?',
          ]
        : [
            'How do I read my exact dose in U-100 units or pen clicks?',
            'How do I request a prescription refill or renewal?',
            'How should I store my medication once reconstituted?',
          ]),
    };
  }

  // 2.8 /admin — Admin Operations Console
  if (pathname.startsWith('/admin')) {
    return {
      title: entityName || (isEs ? 'Consola de Operaciones Admin' : 'Admin Operations Console'),
      subtitle: isEs
        ? 'Catálogo Firestore · Proveedores · Prescripciones · Pedidos'
        : 'Firestore Catalog · Suppliers · Prescriptions · Orders',
      summaryGuide: isEs
        ? 'Edita precios y proveedores en línea en DataTable, audita el modelo canónico de productos y gestiona pedidos B2B y prescripciones.'
        : 'Edit prices and suppliers inline in DataTable, audit canonical product records, and manage B2B orders and prescriptions.',
      prompts: customPrompts || (isEs
        ? [
            '¿Cómo edito precios o proveedores en línea sin abrir modales?',
            '¿Cómo invalido la caché tras modificar productos en Firestore?',
            '¿Cómo audito prescripciones incompletas antes de etiquetar?',
          ]
        : [
            'How do I edit prices or suppliers inline without opening modals?',
            'How do I invalidate cache after modifying products in Firestore?',
            'How do I audit incomplete prescriptions before labeling?',
          ]),
    };
  }

  // 3. /pricing/peptides — Official B2B Lyophilized Peptide Vials Schedule
  if (pathname.startsWith('/pricing/peptides')) {
    return {
      title: entityName || (isEs
        ? 'Tarifa Oficial B2B · Viales de Péptidos Liofilizados (10R)'
        : 'Official B2B Schedule · Certified Lyophilized Peptide Vials (10R)'),
      subtitle: isEs
        ? 'Pureza analítica ≥99.0% HPLC · Unidad y Pack ×10 con descuento por volumen'
        : 'Analytical Purity ≥99.0% HPLC · Single Vial & Pack ×10 volume tiers',
      summaryGuide: isEs
        ? 'Filtra por categoría terapéutica o estado FDA, compara precios por vial suelto frente a Pack ×10, despliega cualquier fila para ver su perfil clínico y protocolos, o añade productos para generar tu proforma B2B.'
        : 'Filter by therapeutic specialty or FDA status, compare Single Vial vs Pack ×10 volume pricing, expand any row for clinical monographs and protocols, or add items to build a B2B proforma quote.',
      prompts: customPrompts || (isEs
        ? [
            '¿Qué ventaja de precio ofrece el Pack ×10 frente a viales individuales y cómo armo una proforma?',
            '¿Cómo filtro los péptidos por categoría clínica, concentración o corredor logístico (UE / EAU)?',
            '¿Dónde consulto la ficha técnica COA, pureza HPLC y guía de reconstitución de cada vial?',
            '¿Cómo exporto o comparto el tarifario oficial en PDF en EUR, USD o AED?',
          ]
        : [
            'What volume discount does Pack ×10 offer vs Single Vials and how do I build a proforma quote?',
            'How do I filter peptides by clinical category, strength, or shipping corridor (EU / UAE)?',
            'Where can I inspect the COA specifications, HPLC purity, and reconstitution guide for each vial?',
            'How do I export or share the official B2B PDF price schedule in EUR, USD, or AED?',
          ]),
    };
  }

  // 4. /pricing/pellets — Subcutaneous Hormone Pellets & Surgical Trocars
  if (pathname.startsWith('/pricing/pellets')) {
    return {
      title: entityName || (isEs
        ? 'Pellets Hormonales Subcutáneos y Kits Quirúrgicos (EU GMP)'
        : 'Subcutaneous Hormone Pellets & Surgical Trocar Kits (EU GMP)'),
      subtitle: isEs
        ? 'Pharmapolis Compounding · Esterilización E-Beam SAL 10⁻⁶ · Liberación 3–6 meses'
        : 'Pharmapolis Compounding · E-Beam Sterilized SAL 10⁻⁶ · 3–6 Month Zero-Order Release',
      summaryGuide: isEs
        ? 'Filtra por tipo hormonal (Testosterona, Estradiol, Progesterona, Biest, DHEA o Kits de Trócar), verifica el calibre de trócar compatible (3.2 mm vs 4.5 mm) y añade unidades sueltas o cajas Pack ×10 (-10%).'
        : 'Filter by hormone line (Testosterone, Estradiol, Progesterone, Biest, DHEA, or Trocar Kits), verify compatible trocar gauge (3.2 mm vs 4.5 mm), and select Single Units or Pack ×10 boxes (-10%).',
      prompts: customPrompts || (isEs
        ? [
            '¿Qué calibre de trócar (3.2 mm vs 4.5 mm) corresponde a cada concentración de pellet hormonal?',
            '¿Qué diferencia hay entre los pellets de Testosterona de 100 mg y 200 mg y cuánto dura su liberación?',
            '¿Cómo funciona el descuento institucional del -10% en cajas Pack ×10 de Pharmapolis EU GMP?',
            '¿Dónde abro la Guía Quirúrgica Interactiva de Implante Subcutáneo con Trócar?',
          ]
        : [
            'Which surgical trocar gauge (3.2 mm vs 4.5 mm) matches each hormone pellet strength?',
            'How do the 100 mg and 200 mg Testosterone pellets compare in release duration and dimensions?',
            'How does the -10% institutional discount work on Pack ×10 boxes of Pharmapolis EU GMP pellets?',
            'Where do I open the Interactive Subcutaneous Trocar Implantation Clinical Guide?',
          ]),
    };
  }

  // 5. /pricing/24genetics or /pricing/24genomics-qatar
  if (pathname.startsWith('/pricing/24genetics') || pathname.startsWith('/pricing/24genomics')) {
    return {
      title: entityName || (isEs
        ? 'Paneles Genómicos Salivales CE-IVD · 24Genetics & AI Connect'
        : 'CE-IVD Saliva Genomic Panels · 24Genetics & AI Connect'),
      subtitle: isEs
        ? '7 Kits Genéticos CE-IVD + 5 Asistentes Clínicos IA (Jun, Julia, Kai, Gaia, Nuria)'
        : '7 CE-IVD DNA Kits + 5 AI Clinical Assistants (Jun, Julia, Kai, Gaia, Nuria)',
      summaryGuide: isEs
        ? 'Compara tarifas Retail, Clínica y Mayorista para los 7 test salivales CE-IVD y las suscripciones a los asistentes de inteligencia artificial genómica.'
        : 'Compare Retail, Clinic, and Wholesale tiers across all 7 CE-IVD saliva DNA panels and the 5 specialized genomic AI assistants.',
      prompts: customPrompts || (isEs
        ? [
            '¿Qué asistente IA de 24Genomics (Jun, Julia, Kai, Gaia o Nuria) corresponde a cada test genético?',
            '¿Cómo funciona la integración entre el informe genético salival CE-IVD y la prescripción de péptidos?',
            '¿Cómo solicito un pedido mayorista o pack clínico de kits 24Genetics?',
          ]
        : [
            'Which 24Genomics AI Assistant (Jun, Julia, Kai, Gaia, or Nuria) matches each DNA test panel?',
            'How does a CE-IVD saliva DNA report integrate with personalized peptide and longevity protocols?',
            'How do I place a clinic or wholesale order for 24Genetics test kits?',
          ]),
    };
  }

  // 6. /pricing/colway*
  if (pathname.startsWith('/pricing/colway')) {
    return {
      title: entityName || (isEs
        ? 'Colway International · Colágeno Nativo Bioactivo y Tricología'
        : 'Colway International · Bioactive Native Collagen & Trichology Schedule'),
      subtitle: isEs
        ? 'Triple hélice de colágeno transdérmico + Protocolo capilar Baicapil™ 2%'
        : 'Transdermal triple-helix native collagen + Baicapil™ 2% follicular protocol',
      summaryGuide: isEs
        ? 'Consulta las tarifas de clínica y distribuidor para la línea dermatológica de colágeno nativo y el protocolo anticaída capilar.'
        : 'Review clinic and distributor pricing for the native collagen dermatology portfolio and anti-hair-loss trichology protocol.',
      prompts: customPrompts || (isEs
        ? [
            '¿Cómo actúa el protocolo capilar Colway (Champú + Acondicionador con Baicapil™ 2% y Diosmina)?',
            '¿Cuál es la diferencia térmica y de aplicación entre Colágeno Platinum, Silver y Graphite?',
            '¿Cómo combino el protocolo capilar Colway con péptidos como GHK-Cu o el test TrichoTest?',
          ]
        : [
            'How does the Colway Hair Thickening Shampoo & Conditioner protocol (Baicapil™ 2% + Diosmin) work?',
            'What is the difference between Native Collagen Platinum, Silver, and Graphite?',
            'How can clinics combine Colway trichology products with GHK-Cu peptides or TrichoTest?',
          ]),
    };
  }

  // 7. /pricing (Master B2B Directory)
  if (pathname === '/pricing') {
    return {
      title: isEs ? 'Directorio Oficial de Tarifas y Formularios Clínicos B2B' : 'Official B2B Price Schedules & Clinical Formularies Directory',
      subtitle: isEs ? '15 Catálogos Especializados · Péptidos, Plumas, Pellets, Genómica e Inyectables' : '15 Specialized Catalogs · Peptides, Pens, Pellets, Genomics & Injectables',
      summaryGuide: isEs
        ? 'Filtra por macrocategoría (Péptidos y Hormonas, Genómica CE-IVD, Cosmética o Inyectables), abre cualquier catálogo en vivo o comparte enlaces rastreables por WhatsApp o email.'
        : 'Filter by macro-category (Peptides & Hormones, CE-IVD Genomics, Cosmetics, or Injectables), open any live schedule, or share tracked links via WhatsApp or email.',
      prompts: isEs
        ? [
            '¿Qué diferencia hay entre la Tarifa de Viales (/pricing/peptides) y la Guía de Plumas (/pricing/pens)?',
            '¿Cómo comparto un catálogo B2B con divisa e idioma preconfigurados con un médico o clínica?',
            '¿Dónde encuentro los Pellets Hormonales EU GMP (/pricing/pellets) y los paneles 24Genetics?',
          ]
        : [
            'What is the difference between the Peptide Vials Schedule (/pricing/peptides) and the Pen Dosing Guide (/pricing/pens)?',
            'How do I share a B2B schedule with pre-selected currency and language with a partner clinic?',
            'Where can I find EU GMP Hormone Pellets (/pricing/pellets) and 24Genetics CE-IVD panels?',
          ],
    };
  }

  // 8. /labels — Pharmacy & Clinical Labels Studio
  if (pathname.startsWith('/labels')) {
    return {
      title: entityName || (isEs ? 'Labels Studio · Etiquetado Farmacéutico y Clínico GMP' : 'Labels Studio · GMP Pharmacy & Clinical Labeling'),
      subtitle: isEs ? 'Motor SVG vectorial de etiquetas para viales, plumas, pellets y kits' : 'Vector SVG label engine for vials, pens, pellets, and compounded kits',
      summaryGuide: isEs
        ? 'Busca por código de prescripción (#RX, #BOX), paciente o péptido, edita lotes y fechas de caducidad (BUD), valida el control GMP Strict e imprime etiquetas térmicas o pliegos A4.'
        : 'Search by prescription code (#RX, #BOX), patient, or peptide, customize batch numbers and BUD dates, run GMP Strict validation, and print thermal or A4 label sheets.',
      prompts: customPrompts || (isEs
        ? [
            '¿Cómo cargo una prescripción (#RX o #BOX) o un protocolo de plumas en Labels Studio?',
            '¿Cómo elimino una parte de una prescripción o programo un refill desde /labels?',
            '¿Qué comprueba la validación GMP Strict antes de exportar el PDF de etiquetas?',
          ]
        : [
            'How do I load a prescription (#RX or #BOX) or a pen protocol into Labels Studio?',
            'How do I remove a part from an imported prescription or issue a refill from /labels?',
            'What does GMP Strict Gate validate before exporting the print-ready label PDF?',
          ]),
    };
  }

  // 9. /p/* or /raw/* — Clinical Monograph / Compound Datasheet
  if (pathname.startsWith('/p/') || pathname.startsWith('/raw/')) {
    return {
      title: entityName || (isEs ? 'Monografía Clínica y Ficha Farmacéutica' : 'Clinical Monograph & Pharmaceutical Datasheet'),
      subtitle: anchor.keyActives || (isEs ? 'Farmacología, posología, reconstitución y evidencia clínica' : 'Pharmacology, posology, reconstitution, and clinical evidence'),
      summaryGuide: isEs
        ? 'Explora las pestañas de mecanismo de acción, posología por vía de administración, calculadora de reconstitución, sinergias y referencias PubMed, o cambia a Vista Paciente (?view=patient).'
        : 'Explore mechanism of action, route-specific posology, interactive reconstitution calculator, clinical synergies, and PubMed references, or switch to locked Patient Guide mode (?view=patient).',
      prompts: customPrompts || (isEs
        ? [
            `¿Cuál es el mecanismo de acción, posología recomendada y vida media de ${entityName || 'este compuesto'}?`,
            `¿Cómo se reconstituye o administra ${entityName || 'este péptido'} y qué conservación en frío requiere?`,
            `¿Con qué otros péptidos o protocolos tiene sinergia clínica ${entityName || 'este compuesto'}?`,
            '¿Cómo comparto la Guía del Paciente bloqueada (?view=patient) sin mostrar precios B2B?',
          ]
        : [
            `What is the mechanism of action, standard clinical dosing, and half-life of ${entityName || 'this compound'}?`,
            `How do I reconstitute or administer ${entityName || 'this peptide'} and what cold-chain storage is required?`,
            `Which other peptides or protocols stack synergistically with ${entityName || 'this compound'}?`,
            'How do I share the locked Patient Guide (?view=patient) without exposing B2B pricing?',
          ]),
    };
  }

  // 10. /proto* or /protocol-finder — Clinical Protocols
  if (pathname.startsWith('/proto') || pathname.startsWith('/protocol-finder')) {
    return {
      title: entityName || (isEs ? 'Protocolos Clínicos Multi-Fase · Atlas Health' : 'Multi-Phase Clinical Protocols · Atlas Health'),
      subtitle: anchor.keyActives || (isEs ? 'Sinergias terapéuticas, calendario de fases y dosificación' : 'Therapeutic synergies, phase timelines, and dosing schedules'),
      summaryGuide: isEs
        ? 'Revisa la arquitectura por fases del protocolo, las dosis de cada péptido, los biomarcadores de seguimiento y exporta el dossier clínico en PDF.'
        : 'Review the multi-phase protocol architecture, individual compound dosing, monitoring biomarkers, and export the clinical protocol PDF.',
      prompts: customPrompts || (isEs
        ? [
            `¿Cómo se estructuran las fases, dosis y horarios de administración en ${entityName || 'este protocolo'}?`,
            '¿Qué biomarcadores analíticos se recomienda monitorizar antes y durante el protocolo?',
            '¿Cómo exporto el protocolo en PDF o calculo la reconstitución de cada vial incluido?',
          ]
        : [
            `How are the phases, doses, and administration timings structured in ${entityName || 'this protocol'}?`,
            'Which laboratory biomarkers should be monitored before and during this protocol?',
            'How do I export the protocol PDF or calculate reconstitution for each included compound?',
          ]),
    };
  }

  // 11. /rx/* or /verify/* — Prescription Tracking & Batch Verification
  if (pathname.startsWith('/rx') || pathname.startsWith('/verify')) {
    return {
      title: entityName || (isEs ? 'Portal de Prescripción y Verificación Farmacéutica' : 'Prescription Portal & Batch Verification'),
      subtitle: isEs ? 'Trazabilidad clínica, estado de dispensación y pauta para el paciente' : 'Clinical traceability, dispensing status, and patient posology',
      summaryGuide: isEs
        ? 'Consulta el desglose de formulaciones prescritas, estado de preparación/envío, lote analítico COA e instrucciones de administración.'
        : 'Inspect prescribed formulations, compounding/dispatch status, analytical COA batch data, and step-by-step administration instructions.',
      prompts: customPrompts || (isEs
        ? [
            '¿Cómo consulto las instrucciones de administración y conservación de cada parte de esta prescripción?',
            '¿Cómo solicito una renovación (refill) o contacto con el equipo médico/farmacéutico?',
            '¿Cómo verifico el certificado de análisis (COA) y lote de fabricación?',
          ]
        : [
            'How do I view the administration and cold-chain storage instructions for each item in this prescription?',
            'How do I request a prescription refill or contact the clinical pharmacy team?',
            'How do I verify the Certificate of Analysis (COA) and manufacturing batch?',
          ]),
    };
  }

  // 12. /dr/* — Doctor Public Portal & Workstation
  if (pathname.startsWith('/dr')) {
    return {
      title: entityName || (isEs ? 'Estación Clínica del Médico · Atlas Health' : 'Physician Clinical Workstation · Atlas Health'),
      subtitle: isEs ? 'Prescripciones, protocolos personalizados, etiquetas y guías de paciente' : 'Prescriptions, custom protocols, labels, and patient dosing guides',
      summaryGuide: isEs
        ? 'Gestiona las prescripciones de tus pacientes, activa el Modo Consulta para ocultar datos sensibles en pantalla, abre etiquetas en Labels Studio o comparte guías de dosificación.'
        : 'Manage patient prescriptions, toggle Desk Privacy mode during live consultations, launch Labels Studio, or share visual patient dosing guides.',
      prompts: customPrompts || (isEs
        ? [
            '¿Cómo activo el Modo Consulta (Desk Privacy) para ocultar nombres de pacientes en pantalla?',
            '¿Cómo abro una prescripción directamente en Labels Studio o solicito un refill?',
            '¿Cómo envío a un paciente la guía visual interactiva de su péptido o pluma U-100?',
          ]
        : [
            'How do I enable Desk Privacy mode to mask patient names during consultations?',
            'How do I open a prescription directly in Labels Studio or issue a refill?',
            'How do I send a patient the interactive visual dosing guide for their peptide or U-100 pen?',
          ]),
    };
  }

  // 13. /vials, /collection/*, /c/*, /compounding*
  if (pathname.startsWith('/vials') || pathname.startsWith('/collection') || pathname.startsWith('/c/') || pathname.startsWith('/compounding')) {
    return {
      title: entityName || (isEs ? 'Catálogo Clínico y Formulación Personalizada' : 'Clinical Portfolio & Compounding Collection'),
      subtitle: anchor.keyActives || (isEs ? 'Formulaciones estériles, especificaciones técnicas y dosificación' : 'Sterile formulations, technical specifications, and dosing guidance'),
      summaryGuide: anchor.welcomeIntro || (isEs
        ? 'Explora las formulaciones clínicas disponibles, filtra por indicación terapéutica, consulta la monografía de cada compuesto o abre la calculadora de dosificación.'
        : 'Explore available clinical formulations, filter by therapeutic indication, open full compound monographs, or launch the interactive dosing calculator.'),
      prompts: customPrompts || (isEs
        ? [
            `¿Qué compuestos destacan en ${entityName || 'esta colección clínica'} y cuáles son sus indicaciones principales?`,
            '¿Cómo comparo las presentaciones en vial liofilizado frente a bolígrafo precargado U-100?',
            '¿Cómo abro la monografía completa o la calculadora de dosificación para cualquiera de estos productos?',
          ]
        : [
            `Which compounds are featured in ${entityName || 'this clinical collection'} and what are their primary indications?`,
            'How do lyophilized vial presentations compare against pre-filled U-100 peptide pens?',
            'How do I open the full clinical monograph or dosing calculator for any of these formulations?',
          ]),
    };
  }

  // 14. /admin/*, /doctor/*, /patient/*, /wholesaler/*, /clinic/*, /pharmacy/*
  if (
    pathname.startsWith('/admin') ||
    pathname.startsWith('/doctor') ||
    pathname.startsWith('/patient') ||
    pathname.startsWith('/wholesaler') ||
    pathname.startsWith('/clinic') ||
    pathname.startsWith('/pharmacy')
  ) {
    return {
      title: entityName || (isEs ? `Panel de Gestión Clínica (${pathname})` : `Clinical Operations Console (${pathname})`),
      subtitle: isEs ? 'Búsqueda global, filtros activos, edición en línea y exportación' : 'Global search, active filter chips, inline editing, and exports',
      summaryGuide: isEs
        ? 'Usa el buscador superior (⌘K) y los filtros rápidos para localizar registros, haz clic en cualquier fila para abrir su panel de detalle (Master-Detail) o edita campos directamente en línea.'
        : 'Use the top search bar (⌘K) and quick filter chips to locate records, click any row to expand its inline Master-Detail panel, or edit fields inline.',
      prompts: customPrompts || (isEs
        ? [
            '¿Cómo filtro y busco registros rápidamente en esta tabla y cambio el alcance de los KPIs?',
            '¿Cómo edito campos en línea o abro el detalle completo sin salir de la tabla?',
            '¿Cómo exporto los datos filtrados o genero etiquetas y documentos PDF desde este módulo?',
          ]
        : [
            'How do I filter and search records in this view and toggle the KPI Scope Switcher?',
            'How do I edit fields inline or expand the Master-Detail panel without leaving the table?',
            'How do I export filtered records or generate labels and PDF documents from this module?',
          ]),
    };
  }

  // 15. Universal Contextual Fallback (uses any registered contextAnchor or clean page title)
  return {
    title: entityName || (isEs ? 'Asistente Clínico Contextual · Atlas Health' : 'Atlas Health · Clinical Screen Assistant'),
    subtitle: anchor.sectionTitle || (isEs ? 'Guía de uso, dosificación y navegación clínica' : 'Clinical dosing, formularies, and workflow guidance'),
    summaryGuide: anchor.welcomeIntro || (isEs
      ? 'Consulta cualquier duda sobre los compuestos mostrados en esta pantalla, cálculos de dosificación (viales U-100 o plumas en clics), protocolos clínicos o exportación de guías en PDF.'
      : 'Ask any question about the formulations displayed on this screen, dosing calculations (U-100 vials or pen clicks), clinical protocols, or PDF guide exports.'),
    prompts: customPrompts || (isEs
      ? [
          `¿Qué puedo consultar y hacer en esta pantalla (${entityName || pathname})?`,
          '¿Cómo abro la Guía Universal de Dosificación (/calculator) o la Guía de Plumas U-100 (/pricing/pens)?',
          '¿Cómo comparto esta pantalla por enlace directo o código QR con un médico o paciente?',
        ]
      : [
          `What clinical tools and actions are available on this screen (${entityName || pathname})?`,
          'How do I use the Universal Peptide Dosing Guide (/calculator) or U-100 Pen Formulary (/pricing/pens)?',
          'How do I share this screen via direct URL or QR code with a physician or patient?',
        ]),
  };
}

/**
 * HelpDrawer
 * ─────────────────────────────────────────────────────────────────────────────
 * Atlas AI-powered contextual Help & Documentation Drawer.
 * Works both when controlled (`isOpen` / `onClose`) and globally via `?` shortcut
 * or `open-atlas-help-drawer` custom event.
 */
export default function HelpDrawer({ isOpen: controlledIsOpen, onClose: controlledOnClose }) {
  const [internalOpen, setInternalOpen] = useState(false);
  const isControlled = typeof controlledIsOpen === 'boolean';
  const isOpen = isControlled ? controlledIsOpen : internalOpen;

  const pathname = usePathname() || '/';
  const { screenContext, openAtlasAi } = useAtlasContext();
  const workspace = usePublicWorkspace?.() || null;
  const { user, activeRole } = useAuth();
  const isEs =
    screenContext?.lang === 'es' ||
    screenContext?.contextAnchor?.lang === 'es' ||
    workspace?.lang === 'es' ||
    (typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('lang') === 'es') ||
    (typeof document !== 'undefined' && document.documentElement?.lang === 'es');

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const endRef = useRef(null);

  // Clear stale chat history when user navigates to a different route so help is always fresh for the current screen
  useEffect(() => {
    setMessages([]);
  }, [pathname]);

  const handleClose = () => {
    if (isControlled) {
      controlledOnClose?.();
    } else {
      setInternalOpen(false);
    }
  };

  // Global listener for `?` shortcut (outside inputs) & `open-atlas-help-drawer`
  useEffect(() => {
    if (isControlled) return undefined;
    const handleOpenEvent = () => setInternalOpen(true);
    const handleKeyDown = (e) => {
      if (pathname.startsWith('/labels')) return; // /labels uses ? for its own Shortcuts modal
      const tag = (e.target?.tagName || '').toLowerCase();
      if (tag === 'input' || tag === 'textarea' || tag === 'select' || e.target?.isContentEditable) return;
      if (e.key === '?' && !e.metaKey && !e.ctrlKey && !e.altKey) {
        e.preventDefault();
        setInternalOpen((v) => !v);
      }
    };
    window.addEventListener('open-atlas-help-drawer', handleOpenEvent);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('open-atlas-help-drawer', handleOpenEvent);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isControlled, pathname]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const screenHelp = useMemo(
    () => resolveContextualScreenHelp(pathname, screenContext, isEs),
    [pathname, screenContext, isEs]
  );
  const quickPrompts = screenHelp.prompts;

  const askAtlasHelp = async (questionText) => {
    const q = String(questionText || input || '').trim();
    if (!q || loading) return;

    const userMsg = { role: 'user', content: q };
    const nextHistory = [...messages, userMsg];
    setMessages(nextHistory);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/ai-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: q,
          mode: 'platform_help',
          lang: isEs ? 'es' : 'en',
          history: nextHistory.slice(-6).map((m) => ({
            role: m.role === 'assistant' ? 'model' : 'user',
            content: m.content,
          })),
          currentUser: user ? { uid: user.uid, role: activeRole || 'operator' } : null,
          context: {
            pathname,
            screenTitle: screenHelp.title,
            contextType: screenContext?.contextType || screenContext?.contextAnchor?.type || 'contextual_help',
            contextAnchor: {
              ...(screenContext?.contextAnchor || {}),
              name: screenHelp.title,
              sectionTitle: screenHelp.subtitle,
              welcomeIntro: screenHelp.summaryGuide,
              mechanisms:
                screenContext?.contextAnchor?.mechanisms ||
                screenHelp.summaryGuide,
            },
          },
        }),
      });
      const data = await res.json();
      const reply =
        data?.reply ||
        data?.answer ||
        data?.message ||
        data?.text ||
        (isEs ? 'No pude generar respuesta en este momento.' : 'Unable to generate a response right now.');
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: reply,
          matchedEntities: Array.isArray(data?.matchedEntities) ? data.matchedEntities : [],
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: isEs
            ? 'Error de conexión con Atlas AI. Inténtalo de nuevo.'
            : 'Connection error reaching Atlas AI. Please try again.',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <StandardDrawer
      isOpen={isOpen}
      onClose={handleClose}
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Sparkles size={18} color="#1a73e8" />
          <span>{isEs ? 'Ayuda Inteligente · Atlas AI' : 'Atlas AI Contextual Help'}</span>
        </div>
      }
      width="420px"
      bodyPadding="1rem"
    >
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: '12px' }}>
        {/* Active Screen Context Card + Instant Screen Workflow Guide */}
        <div
          style={{
            padding: '11px 13px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, #f8fafc 0%, #eff6ff 100%)',
            border: '1px solid #dbeafe',
            fontSize: '0.76rem',
            color: '#334155',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px' }}>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontWeight: 800, color: '#003666', fontSize: '0.83rem', lineHeight: 1.3 }}>
                {screenHelp.title}
              </div>
              <div style={{ fontSize: '0.71rem', color: '#1d4ed8', fontWeight: 650, marginTop: '2px' }}>
                {screenHelp.subtitle}
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                handleClose();
                openAtlasAi();
              }}
              style={{
                padding: '5px 9px',
                borderRadius: '6px',
                border: '1px solid #bfdbfe',
                background: '#ffffff',
                color: '#1d4ed8',
                fontSize: '0.7rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '3px',
                flexShrink: 0,
              }}
            >
              <span>{isEs ? 'Atlas AI' : 'Full AI'}</span>
              <ArrowUpRight size={11} />
            </button>
          </div>

          {screenHelp.summaryGuide && (
            <div
              style={{
                fontSize: '0.73rem',
                lineHeight: 1.45,
                color: '#334155',
                background: 'rgba(255, 255, 255, 0.85)',
                border: '1px solid #e2e8f0',
                borderRadius: '7px',
                padding: '7px 9px',
              }}
            >
              <strong style={{ color: '#0f172a' }}>
                {isEs ? 'Cómo usar esta pantalla: ' : 'How to use this screen: '}
              </strong>
              {screenHelp.summaryGuide}
            </div>
          )}
        </div>

        {/* Route-Aware Suggested Prompts */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
            <span style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', color: '#64748b' }}>
              {isEs ? 'Preguntas rápidas de esta pantalla' : 'Suggested for this screen'}
            </span>
            {messages.length > 0 && (
              <button
                type="button"
                onClick={() => setMessages([])}
                style={{ border: 'none', background: 'none', color: '#64748b', fontSize: '0.7rem', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '3px' }}
              >
                <RotateCcw size={11} />
                <span>{isEs ? 'Limpiar' : 'Clear'}</span>
              </button>
            )}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {quickPrompts.map((prompt) => (
              <button
                key={prompt}
                type="button"
                disabled={loading}
                onClick={() => askAtlasHelp(prompt)}
                style={{
                  textAlign: 'left',
                  padding: '8px 10px',
                  borderRadius: '8px',
                  border: '1px solid #e2e8f0',
                  background: '#ffffff',
                  color: '#0f172a',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  cursor: loading ? 'wait' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '7px',
                }}
              >
                <HelpCircle size={13} color="#1a73e8" style={{ flexShrink: 0 }} />
                <span>{prompt}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Conversation Thread */}
        <div
          style={{
            flex: 1,
            minHeight: '180px',
            overflowY: 'auto',
            borderRadius: '10px',
            border: '1px solid #e2e8f0',
            background: '#f8fafc',
            padding: '10px',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
          }}
        >
          {messages.length === 0 ? (
            <div style={{ fontSize: '0.78rem', color: '#64748b', textAlign: 'center', margin: 'auto 0', padding: '16px' }}>
              {isEs
                ? 'Haz cualquier pregunta sobre cómo usar esta pantalla, protocolos, prescripciones o herramientas de Atlas.'
                : 'Ask anything about how to use this screen, clinical protocols, prescriptions, or Atlas workflows.'}
            </div>
          ) : (
            messages.map((m, idx) => (
              <div
                key={idx}
                style={{
                  alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start',
                  maxWidth: '90%',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px',
                }}
              >
                <div
                  style={{
                    padding: '8px 11px',
                    borderRadius: '10px',
                    background: m.role === 'user' ? '#1a73e8' : '#ffffff',
                    color: m.role === 'user' ? '#ffffff' : '#0f172a',
                    border: m.role === 'user' ? 'none' : '1px solid #e2e8f0',
                    fontSize: '0.8rem',
                    lineHeight: 1.45,
                    whiteSpace: 'pre-wrap',
                  }}
                >
                  {m.content}
                </div>
                {m.role === 'assistant' && Array.isArray(m.matchedEntities) && m.matchedEntities.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                    {m.matchedEntities.slice(0, 3).map((ent, entIdx) => (
                      <Link
                        key={`${ent.type}-${ent.objectID}-${entIdx}`}
                        href={ent.href}
                        onClick={() => {
                          trackSearchClick({
                            indexName: ent.type === 'protocol' ? 'protocols' : 'products',
                            objectID: ent.objectID,
                            position: entIdx + 1,
                            eventName: 'Atlas Help Grounded Card Clicked',
                          });
                          handleClose();
                        }}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          padding: '4px 8px',
                          borderRadius: '6px',
                          border: '1px solid #bfdbfe',
                          background: '#eff6ff',
                          color: '#1d4ed8',
                          fontSize: '0.72rem',
                          fontWeight: 600,
                          textDecoration: 'none',
                        }}
                      >
                        <span>{ent.title}</span>
                        <ArrowRight size={11} />
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))
          )}
          {loading && (
            <div style={{ fontSize: '0.76rem', color: '#1a73e8', fontWeight: 600 }}>
              {isEs ? 'Atlas AI está pensando...' : 'Atlas AI is thinking...'}
            </div>
          )}
          <div ref={endRef} />
        </div>

        {/* Input Form + Escalate to Full Atlas AI */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              askAtlasHelp();
            }}
            style={{ display: 'flex', gap: '6px' }}
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={isEs ? 'Pregunta a Atlas AI sobre esta pantalla...' : 'Ask Atlas AI about this screen...'}
              style={{
                flex: 1,
                padding: '8px 10px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                fontSize: '0.82rem',
              }}
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              aria-label={isEs ? 'Enviar pregunta' : 'Send question'}
              style={{
                padding: '0 12px',
                minHeight: '40px',
                borderRadius: '8px',
                border: 'none',
                background: '#1a73e8',
                color: '#ffffff',
                cursor: loading || !input.trim() ? 'not-allowed' : 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Send size={15} />
            </button>
          </form>
          <button
            type="button"
            onClick={() => {
              handleClose();
              openAtlasAi?.({
                initialQuery: input.trim() || undefined,
              });
            }}
            style={{
              width: '100%',
              padding: '7px 10px',
              borderRadius: '8px',
              border: '1px solid #c7d2fe',
              background: '#eef2ff',
              color: '#3730a3',
              fontSize: '0.76rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
            }}
          >
            <Sparkles size={13} />
            <span>{isEs ? 'Continuar en Atlas AI Completo (⌘I)' : 'Continue in Full Atlas AI (⌘I)'}</span>
          </button>
        </div>
      </div>
    </StandardDrawer>
  );
}
