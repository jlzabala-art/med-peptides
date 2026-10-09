"use client";

import React, { useMemo } from 'react';
import { resolveDoctorProfile, formatMedicalLicense } from '@/services/doctorDirectoryService';
import { classifyPrescription } from '@/data/prescriptionTypeClassifier';
import { detectFagronGenomicsTest } from '@/data/fagronGenomicsTests';
import { getPharmapolisLabelsForPrescription } from '@/data/pharmapolisLabelsMap';

export function slugify(text) {
  return String(text || '')
    .toLowerCase()
    .replace(/^dr[a]?\.\s*/i, '')
    .replace(/^dr[a]?\s*/i, '')
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
}

export function getPosologyText(pos) {
  if (!pos) return '';
  if (typeof pos === 'string') return pos;
  if (typeof pos === 'object') {
    const val = pos.regimen || pos.summary || pos.timing || pos.notes || pos.text || (Array.isArray(pos.steps) ? pos.steps[0] : '');
    if (typeof val === 'string') return val;
    if (val && typeof val === 'object') return getPosologyText(val);
    return '';
  }
  return '';
}

/**
 * usePrescriptionData
 * 
 * Custom hook encapsulating:
 * 1. Two-doctor clinical segregation & directory enrichment
 * 2. Compounded formulations grouping, vehicles & route-specific posologies
 * 3. Pharmacogenomic test correlation & prescription classification
 * 4. Labels & APIs extraction
 * 5. Table of contents sections & share message resolution
 */
export function usePrescriptionData(rx = {}, { lang = 'en', isEs = false, isPatientView = false, atlasRecs = null } = {}) {
  const rxId = rx.id || rx.prescriptionNumber || 'RX-PRESCRIPTION';
  const posology = rx.structuredPosology || {};
  const patient = rx.patient || {};
  const patientName = patient.name || rx.patientName || (isEs ? 'Paciente' : 'Patient');
  const patientAlias = rx.patientAlias || patient.alias ? ` (${rx.patientAlias || patient.alias})` : '';

  // ── Two-Doctor Clinical Architecture (Strict Segregation) ───────────────────
  const isInternalProdDoc = (name) => {
    const s = String(name || '').toLowerCase();
    return s.includes('miguel ángel') || s.includes('miguel angel') || s.includes('aranda') || s.includes('camacho') || s.includes('haydee');
  };

  const is50957Rutledge = String(rx.code || rx.id || rx.fileNumber || '').includes('50957') ||
    String(rx.patient || rx.patientName || '').toLowerCase().includes('rutledge');

  const docObj = (rx.doctor && typeof rx.doctor === 'object' && rx.doctor.name && !isInternalProdDoc(rx.doctor.name)) ? rx.doctor : {};
  const treatingDocObj = (rx.treatingDoctor && typeof rx.treatingDoctor === 'object' && !isInternalProdDoc(rx.treatingDoctor.name)) ? rx.treatingDoctor : {};
  const rawCandidateName = is50957Rutledge
    ? 'Dr. Marina Cordeiro Fernandes'
    : ((typeof rx.treatingDoctor === 'string' && !isInternalProdDoc(rx.treatingDoctor) ? rx.treatingDoctor : treatingDocObj.name) ||
      docObj.name ||
      (rx.doctorName && !isInternalProdDoc(rx.doctorName) ? rx.doctorName : null) ||
      (rx.prescribingDoctor && !isInternalProdDoc(rx.prescribingDoctor) ? rx.prescribingDoctor : null) ||
      (rx.patientDoctor && !rx.patientDoctor.isInternalOnly && !isInternalProdDoc(rx.patientDoctor.name) ? rx.patientDoctor.name : null) ||
      '');

  const rawCandidate = rawCandidateName ? {
    ...docObj,
    ...treatingDocObj,
    name: rawCandidateName,
    license: treatingDocObj.license || docObj.license || rx.doctorLicense || rx.doctorLicenseNumber || '',
    clinic: treatingDocObj.clinic || docObj.clinic || rx.clinic || rx.clinicName || '',
    specialty: treatingDocObj.specialty || docObj.specialty || docObj.title || rx.doctorSpecialty || '',
    phone: treatingDocObj.phone || docObj.phone || rx.doctorPhone || '',
    email: treatingDocObj.email || docObj.email || rx.doctorEmail || '',
    id: docObj.id || treatingDocObj.id || rx.doctorId || null
  } : null;

  const isCandidateProdDoc = Boolean(rawCandidate && isInternalProdDoc(rawCandidate.name));
  const hasTreatingDoctor = Boolean(rawCandidate && rawCandidate.name && !isCandidateProdDoc);

  const resolvedProfile = hasTreatingDoctor ? resolveDoctorProfile(rawCandidate) : null;
  const treatingDoc = resolvedProfile || (hasTreatingDoctor ? rawCandidate : {});
  const rawDoctorName = treatingDoc.name || '';
  const isHaytham = String(rawDoctorName).toLowerCase().includes('haytham') || String(rawDoctorName).toLowerCase().includes('heytham');

  const doctorName = isHaytham ? 'Dr. Haytham Salem' : rawDoctorName;
  const clinic = isHaytham ? 'Arthregen Clinic' : (treatingDoc.clinic || rx.clinicName || (rx.clinic && !rx.clinic.includes('Mediluxe') ? rx.clinic : (isEs ? 'Centro Médico Prescriptor' : 'Licensed Clinical Practice')));
  const doctorClinic = clinic;
  const doctorSpecialty = isHaytham 
    ? 'Consultant Orthopedic Surgeon & Regenerative Medicine Specialist' 
    : (treatingDoc.specialty || (hasTreatingDoctor ? (isEs ? 'Médico Especialista' : 'Physician Consultant') : (isEs ? 'Práctica Médica Colaboradora' : 'Collaborating Medical Practice')));
  const doctorAddress = isHaytham 
    ? 'Med Art Clinic Day Surgery Center, Villa 823, Jumeirah St., Dubai, UAE' 
    : (treatingDoc.address || '');
  const doctorPhone = isHaytham 
    ? '+971 4 346 6149' 
    : (treatingDoc.phone || treatingDoc.mobile || '');
  const doctorLicense = isHaytham 
    ? 'DHA-P-0319842' 
    : (treatingDoc.license || treatingDoc.licenseNumber || '');
  const formattedDoctorLicense = useMemo(() => {
    return formatMedicalLicense(doctorLicense, treatingDoc);
  }, [doctorLicense, treatingDoc]);
  const isDhaLicensed = Boolean(doctorLicense && String(doctorLicense).toUpperCase().includes('DHA'));

  const doctorSlug = useMemo(() => {
    if (rx.doctorSlug) return rx.doctorSlug;
    if (rx.doctor?.slug) return rx.doctor.slug;
    if (treatingDoc?.slug) return treatingDoc.slug;
    return slugify(doctorName || 'haytham-salem');
  }, [rx.doctorSlug, rx.doctor, treatingDoc, doctorName]);

  const doctorPublicUrl = `/dr/${doctorSlug}`;

  // Pharmacogenomics & Prescription Classification
  const genomicsData = useMemo(() => detectFagronGenomicsTest(rx), [rx]);
  const prescriptionTypeInfo = useMemo(() => classifyPrescription(rx), [rx]);

  const rxProgLower = String(rx.treatmentProgram || rx.program || '').toLowerCase();
  const rxTypeLower = String(rx.treatmentType || '').toLowerCase();
  const rxDispLower = String(rx.dispensingForm || '').toLowerCase();
  const isNutrigen = prescriptionTypeInfo.key === 'nutrigen' || rxProgLower.includes('nutrigen') || rxTypeLower.includes('nutrigen') || String(rx.fagron?.testName || '').toLowerCase().includes('nutrigen');
  const isEntirelyOral = isNutrigen || rxDispLower.includes('capsule') || rxDispLower.includes('oral') || (Array.isArray(rx.prescriptionLines) && rx.prescriptionLines.length > 0 && rx.prescriptionLines.every(i => (i.route || '').toLowerCase().includes('oral')));

  // Raw Lines Normalization
  const rawLines = useMemo(() => {
    if (rx.allSessionItems && rx.allSessionItems.length > 0) {
      return rx.allSessionItems;
    }
    const itemsList = Array.isArray(rx.items) && rx.items.length > 0 ? rx.items : null;
    const linesList = Array.isArray(rx.prescriptionLines) && rx.prescriptionLines.length > 0 ? rx.prescriptionLines : null;

    if (itemsList && linesList) {
      return itemsList.map((item, idx) => {
        const line = linesList[idx] || linesList.find(l => {
          const ln = (l.drugName || l.drug || l.name || '').toLowerCase();
          const iname = (item.name || item.activeIngredient || '').toLowerCase();
          return ln && (iname.includes(ln) || ln.includes(iname));
        });
        return {
          ...line,
          ...item,
          name: item.name || line?.drugName || line?.drug || item.productName || item.activeIngredient,
          drugName: line?.drugName || item.name || item.activeIngredient,
          dosage: item.dosage || item.dose || line?.strength || '—',
          dose: item.dose || item.dosage || line?.strength || '—'
        };
      });
    }

    if (itemsList) return itemsList;
    if (linesList) {
      return linesList.map(l => ({
        ...l,
        name: l.drugName || l.drug || l.name || l.title || 'Active Compound',
        drugName: l.drugName || l.drug || l.name || l.title || 'Active Compound',
        dose: l.strength || l.dosage || l.dose || '—',
        dosage: l.strength || l.dosage || l.dose || '—'
      }));
    }
    return rx.compounds || [];
  }, [rx.allSessionItems, rx.items, rx.prescriptionLines, rx.compounds]);

  // Compounded Formulations Architecture
  const compoundedFormulations = useMemo(() => {
    const buildVehicleData = ({
      index,
      totalCount,
      vehicleName = '',
      treatmentTitle = '',
      dosageForm = '',
      route = '',
      volume = null,
      customPosology = '',
      apis = []
    }) => {
      const vNameLower = (vehicleName || '').toLowerCase();
      const titleLower = (treatmentTitle || '').toLowerCase();
      const routeLower = (route || '').toLowerCase();

      const isTrichoOil = vNameLower.includes('trichooil') || 
                          vNameLower.includes('oil') || 
                          vNameLower.includes('aceite') ||
                          titleLower.includes('trichooil') || 
                          titleLower.includes('scalp care') || 
                          titleLower.includes('higiene') || 
                          titleLower.includes('hygiene') ||
                          (apis.some(a => {
                            const an = (a.name || a.productName || a.activeIngredient || '').toLowerCase();
                            return an.includes('ginseng') || an.includes('ginkgo') || an.includes('tocopherol') || an.includes('vitamin e');
                          }) && (vNameLower.includes('oil') || titleLower.includes('scalp care') || titleLower.includes('higiene')));

      const isOral = routeLower.includes('oral') || 
                     titleLower.includes('oral') || 
                     titleLower.includes('capsule') || 
                     titleLower.includes('cápsula') || 
                     vNameLower.includes('capsule') || 
                     vNameLower.includes('cápsula') || 
                     vNameLower.includes('tablet') ||
                     isNutrigen ||
                     isEntirelyOral;

      const isTrichoFoam = vNameLower.includes('trichofoam') || vNameLower.includes('foam') || titleLower.includes('foam');

      const isPomade = routeLower.includes('perianal') ||
                       routeLower.includes('anal') ||
                       routeLower.includes('rectal') ||
                       titleLower.includes('pomade') ||
                       titleLower.includes('pomada') ||
                       titleLower.includes('ointment') ||
                       titleLower.includes('fissure') ||
                       vNameLower.includes('pomade') ||
                       vNameLower.includes('ointment') ||
                       (apis.some(a => {
                         const an = (a.name || a.productName || a.activeIngredient || '').toLowerCase();
                         return an.includes('diltiazem') || an.includes('lidocaine') || an.includes('pomade base') || an.includes('ointment base');
                       }));

      const isBHRT = vNameLower.includes('pentravan') ||
                     vNameLower.includes('lipoderm') ||
                     titleLower.includes('hormone') ||
                     titleLower.includes('bhrt') ||
                     titleLower.includes('transdermal') ||
                     (apis.some(a => {
                       const an = (a.name || a.productName || a.activeIngredient || '').toLowerCase();
                       return (an.includes('testosterone') || an.includes('estradiol') || an.includes('progesterone')) && !an.includes('minoxidil') && !an.includes('trichosol');
                     }));

      const resolvedDosageForm = dosageForm || (
        isTrichoOil ? (isEs ? 'Aceite Capilar Tópico' : 'Topical Scalp Oil') :
        isOral ? (isEs ? 'Cápsulas Orales' : 'Oral Capsules') :
        isTrichoFoam ? (isEs ? 'Espuma Tópica' : 'Topical Foam') :
        isPomade ? (isEs ? 'Pomada Tópica Galénica' : 'Topical Pomade / Ointment') :
        isBHRT ? (isEs ? 'Crema Transdérmica Liposomal' : 'Transdermal Liposomal Cream') :
        (isEs ? 'Solución Tópica' : 'Topical Scalp Solution')
      );

      let accentColor;
      let accentBg;
      let badgeText = isEs ? `PREPARACIÓN ${index} DE ${totalCount}` : `PREPARATION ${index} OF ${totalCount}`;
      let resolvedTitle;
      let resolvedRoute;
      let resolvedVolume;

      const vehicleObj = {
        tag: isEs ? 'VEHÍCULO MAGISTRAL' : 'COMPOUNDING VEHICLE / BASE',
        name: vehicleName || (isTrichoOil ? 'TrichoOil™ Natural Lipidic Carrier' : 'TrichoSol™ Liposomal Hydrophilic Base'),
        volume: volume || (isTrichoOil ? '30 mL' : (isOral ? '90 Capsules' : (isPomade ? '30 g' : (isBHRT ? '90 mL' : '100 mL')))),
        specs: ''
      };

      const safeCustomPosology = getPosologyText(customPosology);
      const posologyObj = {
        title: '',
        regimen: safeCustomPosology || '',
        timing: (typeof customPosology === 'object' && customPosology?.timing) ? String(customPosology.timing) : '',
        duration: rx.duration || '30 days',
        steps: []
      };

      if (isTrichoOil) {
        accentColor = '#0d9488';
        accentBg = '#ccfbf1';
        badgeText += isEs ? ' · ACEITE DE CUIDADO CAPILAR' : ' · SCALP CARE & HYGIENE OIL';
        resolvedTitle = treatmentTitle || (isEs ? 'Higiene & Cuidado Folicular (TrichoOil™)' : 'Scalp Care & Hygiene (TrichoOil™)');
        resolvedRoute = isEs ? 'Aplicación Tópica / Masaje Capilar' : 'Topical Scalp Application & Massage';
        resolvedVolume = volume || '30 mL';
        vehicleObj.name = vehicleName || 'TrichoOil™ Natural Lipidic Carrier';
        vehicleObj.specs = isEs 
          ? 'Vehículo 100% natural a base de ácidos grasos esenciales y fitocomplejo patentado TrichoTech™. Restaura la barrera lipídica cutánea y protege el nicho folicular.'
          : '100% Natural essential fatty acid vehicle enriched with patented TrichoTech™ phytocomplex. Restores scalp epidermal lipid barrier and shields follicular stem cells.';
        
        posologyObj.title = isEs ? 'Pauta de Higiene & Cuidado del Cuero Cabelludo' : 'Pre-Wash Scalp Care & Hygiene Regimen';
        posologyObj.regimen = safeCustomPosology || (isEs ? '1–2 Veces por Semana (Tratamiento Pre-Lavado)' : '1–2 Times Weekly (Pre-Shampoo Treatment)');
        posologyObj.timing = isEs ? '10–15 minutos antes de lavar el cabello' : '10–15 minutes before showering / washing hair';
      } else if (isOral) {
        accentColor = '#ea580c';
        accentBg = '#ffedd5';
        badgeText += isEs ? ' · VÍA ORAL' : ' · ORAL ROUTE';
        resolvedTitle = treatmentTitle || (isEs ? 'Soporte Nutracéutico Sistémico (Cápsulas)' : 'Systemic Follicular & Nutraceutical Support (Capsules)');
        resolvedRoute = isEs ? 'Vía Oral' : 'Oral Route';
        resolvedVolume = volume || (isEs ? '60 Cápsulas' : '60 Capsules');
        vehicleObj.name = vehicleName || 'Vegetable capsules. Gluten-free, lactose-free, colorant-free, and without unnecessary additives.';
        vehicleObj.specs = isEs
          ? 'Cápsulas vegetales gastrorresistentes de celulosa natural purificada sin alérgenos. Garantizan la liberación controlada y biodisponibilidad óptima.'
          : 'Pure vegetable acid-resistant capsules formulated without allergens or binders. Guarantees controlled absorption and peak bioavailability.';

        posologyObj.title = isEs ? 'Pauta de Administración Oral Diaria' : 'Daily Oral Dosing Schedule';
        posologyObj.regimen = safeCustomPosology || (isEs ? '1 Cápsula Diaria con la Cena / Noche' : '1 Capsule Daily with Dinner / Bedtime');
        posologyObj.timing = isEs ? 'Durante la cena con agua' : 'With dinner / evening meal with water';
      } else {
        accentColor = '#003666';
        accentBg = '#e0f2fe';
        badgeText += isEs ? ' · VÍA TÓPICA' : ' · TOPICAL ROUTE';
        resolvedTitle = treatmentTitle || (isEs ? 'Terapia Folicular Tópica Personalizada (TrichoSol™)' : 'Personalized Follicular Therapy (TrichoSol™)');
        resolvedRoute = isEs ? 'Aplicación Tópica (Cuero Cabelludo)' : 'Topical Scalp Application';
        resolvedVolume = volume || '100 mL';
        vehicleObj.name = vehicleName || 'TrichoSol™ (Fagron)';
        vehicleObj.specs = isEs
          ? 'Vehículo liposomal hidrofílico patentado TrichoSol™. Libre de alcohol y propilenglicol. Maximiza la retención activa en la papila dérmica.'
          : 'Patented hydrophilic liposomal TrichoSol™ vehicle. Alcohol & propylene glycol free. Maximizes active retention in the dermal papilla.';

        posologyObj.title = isEs ? 'Pauta de Aplicación Tópica Nocturna' : 'Nightly Topical Application Regimen';
        posologyObj.regimen = safeCustomPosology || (isEs ? '1.0 mL Diario por la Noche' : '1.0 mL Nightly at Bedtime');
        posologyObj.timing = isEs ? 'Cada noche antes de dormir (21:30 - 22:30)' : 'Every night at bedtime (21:30 - 22:30)';
      }

      return {
        id: `formulation-${index - 1}`,
        index,
        accentColor,
        accentBg,
        badgeText,
        title: resolvedTitle,
        shortTitle: resolvedTitle.split('(')[0].trim(),
        dosageForm: resolvedDosageForm,
        route: resolvedRoute,
        volume: resolvedVolume,
        isOral,
        isTrichoOil,
        isPomade,
        isBHRT,
        vehicle: vehicleObj,
        posology: posologyObj,
        apis: apis.map(a => ({
          ...a,
          name: a.name || a.drugName || a.productName || a.activeIngredient || 'Active API',
          dose: a.dosage || a.dose || a.strength || '—',
          dosage: a.dosage || a.dose || a.strength || '—'
        }))
      };
    };

    const activeBlocks = [];
    const solItems = [];
    const trichoOilItems = [];
    const oralItems = [];
    const vehicleLines = [];

    (rawLines || []).forEach(line => {
      const nameLower = (line.name || line.drugName || line.productName || line.activeIngredient || '').toLowerCase();
      const routeLower = (line.route || '').toLowerCase();
      const formLower = (line.form || line.dosageForm || '').toLowerCase();

      const isVeh = line._isVehicleOrBase || line.isVehicle || 
        nameLower.includes('trichosol') || 
        nameLower.includes('trichooil') || 
        nameLower.includes('trichofoam') || 
        nameLower.includes('vehicle') || 
        nameLower.includes('vehículo') || 
        nameLower.includes('base') ||
        nameLower.includes('pentravan');

      if (isVeh) {
        vehicleLines.push(line);
        return;
      }

      const isOil = nameLower.includes('trichooil') || 
        nameLower.includes('ginseng') || 
        nameLower.includes('ginkgo biloba') || 
        nameLower.includes('tocopherol') || 
        nameLower.includes('vitamin e') ||
        routeLower.includes('massage') ||
        nameLower.includes('rosmarinus');

      const isOral = routeLower.includes('oral') || 
        formLower.includes('capsule') || 
        formLower.includes('cápsula') || 
        nameLower.includes('nattokinase') || 
        nameLower.includes('serrapeptase') || 
        nameLower.includes('saw palmetto') || 
        nameLower.includes('pygeum') ||
        isNutrigen || 
        isEntirelyOral;

      if (isOil && !isOral) {
        trichoOilItems.push(line);
      } else if (isOral) {
        oralItems.push(line);
      } else {
        solItems.push(line);
      }
    });

    if (solItems.length > 0) {
      activeBlocks.push({
        type: 'trichosol',
        vehicleName: 'TrichoSol™ (Fagron)',
        dosageForm: isEs ? 'Solución Tópica' : 'Topical Scalp Solution',
        treatmentTitle: rx.treatmentType || (isEs ? 'Terapia Folicular Tópica Personalizada (TrichoSol™)' : 'Personalized Follicular Therapy (TrichoSol™ Solution)'),
        route: isEs ? 'Aplicación Tópica (Cuero Cabelludo)' : 'Topical Scalp Application',
        volume: rx.volume || '100 mL',
        customPosology: getPosologyText(rx.posology) || '',
        apis: solItems
      });
    }

    if (trichoOilItems.length > 0) {
      activeBlocks.push({
        type: 'trichooil',
        vehicleName: 'TrichoOil™ (Fagron)',
        dosageForm: isEs ? 'Aceite Capilar Tópico' : 'Topical Scalp Oil',
        treatmentTitle: isEs ? 'Higiene & Cuidado Folicular (TrichoOil™)' : 'Scalp Care & Hygiene (TrichoOil™)',
        route: isEs ? 'Aplicación Tópica / Masaje Capilar' : 'Topical Scalp Application & Massage',
        volume: '30 mL',
        customPosology: isEs ? '1–2 Veces por Semana (Tratamiento Pre-Lavado)' : '1–2 Times Weekly (Pre-Shampoo Treatment)',
        apis: trichoOilItems
      });
    }

    if (oralItems.length > 0) {
      activeBlocks.push({
        type: 'oral',
        vehicleName: 'Vegetable capsules. Gluten-free, lactose-free, colorant-free, and without unnecessary additives.',
        dosageForm: isEs ? 'Cápsulas Orales (Vegetales)' : 'Oral Route (Vegetable Capsules)',
        treatmentTitle: rx.treatmentType || (isEs ? 'Soporte Nutracéutico Sistémico (Cápsulas)' : 'Systemic Follicular & Nutraceutical Support (Capsules)'),
        route: isEs ? 'Vía Oral' : 'Oral Administration',
        volume: rx.volume || (isEs ? '60 Cápsulas' : '60 Compounded Capsules'),
        customPosology: getPosologyText(rx.posology) || (isEs ? '1 Cápsula Diaria con la Cena' : '1 Capsule Daily with Dinner / Bedtime'),
        apis: oralItems
      });
    }

    const totalCount = activeBlocks.length || 1;
    return activeBlocks.map((b, idx) => {
      return buildVehicleData({
        index: idx + 1,
        totalCount,
        vehicleName: b.vehicleName,
        treatmentTitle: b.treatmentTitle,
        dosageForm: b.dosageForm,
        route: b.route,
        volume: b.volume,
        customPosology: b.customPosology,
        apis: b.apis
      });
    });
  }, [rawLines, rx, isEs, isNutrigen, isEntirelyOral]);

  // Labels for every phase
  const prescriptionLabels = useMemo(() => {
    return getPharmapolisLabelsForPrescription(rx, compoundedFormulations);
  }, [rx, compoundedFormulations]);

  // All flat APIs
  const prescriptionApis = useMemo(() => {
    return compoundedFormulations.flatMap(f => f.apis);
  }, [compoundedFormulations]);

  // Table of Contents navigation items
  const tocSections = useMemo(() => {
    const list = [];
    if (compoundedFormulations.length > 1) {
      compoundedFormulations.forEach((form, idx) => {
        const phaseNum = form.index || (idx + 1);
        const formTypeDesc = form.isOral 
          ? (isEs ? 'Cápsulas Orales' : 'Oral Capsules')
          : (form.id.includes('oil')
              ? (isEs ? 'Aceite Folicular' : 'Scalp Oil')
              : (form.id.includes('pomade')
                  ? (isEs ? 'Pomada Tópica' : 'Topical Pomade')
                  : (isEs ? 'Solución Tópica' : 'Scalp Solution')));

        const cleanLabel = form.shortTitle || (
          form.title && form.title.length <= 32
            ? form.title 
            : (isEs ? `Fase ${phaseNum}: ${formTypeDesc}` : `Phase ${phaseNum}: ${formTypeDesc}`)
        );

        list.push({
          id: form.id,
          label: cleanLabel,
          category: 'formula',
          badge: form.volume || (form.apis ? `${form.apis.length} APIs` : null),
          accentColor: form.accentColor,
          icon: form.id.includes('oral') ? 'box' : (form.id.includes('oil') ? 'droplets' : 'flask')
        });
      });
    } else {
      list.push({ 
        id: 'formula-card', 
        label: isEs ? 'Fórmula Magistral & Posología' : 'Compounded Formula & Posology', 
        category: 'formula',
        badge: isEs ? 'Fórmula Única' : 'Single Compound',
        accentColor: '#003666',
        icon: 'flask'
      });
    }

    if (genomicsData) {
      list.push({ 
        id: 'genomics-card', 
        label: isEs ? 'Guía Genómica' : 'Genomics Guidance',
        category: 'genomics',
        icon: 'dna'
      });
    }

    list.push({ 
      id: 'milestones-card', 
      label: isEs ? 'Roadmap & Hitos Clínicos' : 'Roadmap & Milestones',
      category: 'milestones',
      icon: 'calendar'
    });

    list.push({ 
      id: 'quality-card', 
      label: isEs ? 'Calidad & Trazabilidad GMP' : 'Quality & EU Traceability',
      category: 'traceability',
      icon: 'shield'
    });

    if (atlasRecs?.peptide || atlasRecs?.supplement || atlasRecs?.diagnostic || atlasRecs?.colway) {
      list.push({ 
        id: 'atlas-recommendations-card', 
        label: isEs ? 'Recomendaciones Atlas' : 'Atlas Recommendations',
        category: 'recommendations',
        icon: 'sparkles'
      });
    }

    list.push({ 
      id: 'doctor-patient-credentials', 
      label: isEs ? 'Datos de Médico & Paciente' : 'Doctor & Patient Info',
      category: 'credentials',
      icon: 'stethoscope'
    });

    list.push({ 
      id: 'patient-sharing-card', 
      label: isPatientView
        ? (isEs ? 'Contacto con Médico' : 'Doctor & Clinic Support')
        : (isEs ? 'Atención al Paciente' : 'Patient Care Hub'),
      category: 'patient-sharing',
      icon: isPatientView ? 'stethoscope' : 'share'
    });

    if (!isPatientView) {
      list.push({ 
        id: 'atlas-quotation-card', 
        label: isEs ? 'Cotización Atlas' : 'Compounding Quote',
        category: 'quotation',
        icon: 'file'
      });
    }

    return list;
  }, [compoundedFormulations, genomicsData, isEs, isPatientView, atlasRecs]);

  // Formula & Dosage summaries
  const resolvedFormulaSummary = useMemo(() => {
    if (rx.formulaName || rx.title) return rx.formulaName || rx.title;
    if (rawLines.length > 0) {
      const activeItems = rawLines
        .filter(i => !i._isVehicleOrBase && !i.isVehicle)
        .map(i => `${i.name || i.productName || i.activeIngredient || ''}${i.dose || i.dosage || i.concentration ? ` ${i.dose || i.dosage || i.concentration}` : ''}`.trim());
      if (activeItems.length > 0) {
        return activeItems.join(' + ') + (rx.volume ? ` (${rx.volume})` : '');
      }
    }
    return rx.treatmentType || 'Compounded Prescription Formulation';
  }, [rx, rawLines]);

  const resolvedDosageSummary = useMemo(() => {
    return posology.summary || getPosologyText(rx.posology) || rx.dosageSchedule || (isEs ? 'Según prescripción médica' : 'As directed by healthcare professional');
  }, [posology, rx, isEs]);

  // WhatsApp share message
  const shareTextWhatsApp = useMemo(() => {
    const baseUrl = 'https://med-peptides.com';
    const patientPublicUrl = `${baseUrl}/rx/${rxId}?view=patient`;
    return encodeURIComponent(
      isEs
        ? `*Atlas Services — Ficha Técnica y Posología Médica*\n` +
          `📋 *Prescripción:* ${rxId}\n` +
          `👤 *Paciente:* ${patientName}${patientAlias}\n` +
          `🩺 *Médico Prescriptor:* ${doctorName} (${clinic})\n` +
          `🧪 *Fórmula:* ${resolvedFormulaSummary}\n` +
          (genomicsData ? `🧬 *Guía Genómica:* Formulada según recomendaciones de ${genomicsData.test.shortName}.\n` : '') +
          `🕒 *Posología:* ${resolvedDosageSummary}\n\n` +
          `🛒 *Información y Cotización:* Consulte los detalles de la formulación y solicite presupuesto oficial para la preparación y compra de su prescripción:\n` +
          `🔗 ${patientPublicUrl}`
        : `*Atlas Services — Medical Prescription Datasheet*\n` +
          `📋 *Prescription:* ${rxId}\n` +
          `👤 *Patient:* ${patientName}${patientAlias}\n` +
          `🩺 *Prescribing Physician:* ${doctorName} (${clinic})\n` +
          `🧪 *Formula:* ${resolvedFormulaSummary}\n` +
          (genomicsData ? `🧬 *Genomics Guidance:* Formulated based on ${genomicsData.test.shortName} report.\n` : '') +
          `🕒 *Posology:* ${resolvedDosageSummary}\n\n` +
          `🛒 *Order & Official Quotation:* View compounded formulation specifications, request batch preparation, or convert to purchase order:\n` +
          `🔗 ${patientPublicUrl}`
    );
  }, [isEs, rxId, patientName, patientAlias, doctorName, clinic, resolvedFormulaSummary, genomicsData, resolvedDosageSummary]);

  // Resolved Price
  const resolvedPrice = useMemo(() => {
    const rawCurrency = rx.currency || rx.pricing?.currency || rx.quote?.currency || 'AED';
    const rawAmount = 
      rx.totalPrice || 
      rx.price || 
      rx.pricing?.total || 
      rx.pricing?.amount || 
      rx.quote?.total || 
      rx.quote?.amount || 
      rx.totalAmount || 
      rx.cost;

    if (rawAmount) {
      const num = Number(rawAmount);
      if (!isNaN(num) && num > 0) {
        return {
          formatted: `${rawCurrency} ${num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
          currency: rawCurrency,
          amount: num
        };
      }
      return { formatted: `${rawCurrency} ${rawAmount}`, currency: rawCurrency, amount: rawAmount };
    }
    return null;
  }, [rx]);

  // Localized clinical steps (tailored for oral or topical routes)
  const steps = useMemo(() => {
    return isEs ? (posology.applicationSteps || (isEntirelyOral ? [
      {
        step: 1,
        title: 'Ingesta Diaria de la Cápsula',
        timing: getPosologyText(rx.posology).toLowerCase().includes('night') ? 'Por la Noche' : 'Dosis Diaria',
        badge: 'Vía Oral',
        instruction: 'Tomar la cápsula prescrita acompañada de un vaso de agua abundante (200-250 ml).'
      },
      {
        step: 2,
        title: 'Tolerancia y Absorción Óptima',
        timing: 'Con Alimentos',
        badge: 'Máxima Biodisponibilidad',
        instruction: 'Se aconseja administrar junto con alimentos para favorecer la tolerancia gastrointestinal y la óptima asimilación de los nutrientes y cofactores.'
      },
      {
        step: 3,
        title: 'Conservación Farmacéutica',
        timing: '< 25°C Ambiente',
        badge: 'Lugar Fresco y Seco',
        instruction: 'Mantener el envase herméticamente cerrado en lugar fresco y seco, protegido de la luz solar directa y la humedad.'
      },
      {
        step: 4,
        title: 'Pauta y Seguimiento Clínico',
        timing: rx.duration || '3 a 6 Meses',
        badge: 'Supervisión Médica',
        instruction: `Mantener la continuidad del tratamiento durante el periodo prescrito (${rx.duration || '3-6 meses'}). Revisión y control evolutivo con ${doctorName || 'el médico prescriptor'}.`
      }
    ] : [
      {
        step: 1,
        title: 'Preparación del Cuero Cabelludo',
        timing: '21:30 - 22:00 (Noche)',
        badge: 'Cuero Cabelludo Seco',
        instruction: 'Asegurarse de que el cuero cabelludo esté completamente limpio y seco antes de la aplicación. No aplicar sobre cabello húmedo para evitar la dilución del vehículo lipídico TrichoSol™. Separar el cabello en rayas cada 1-2 cm sobre las áreas con menor densidad.'
      },
      {
        step: 2,
        title: 'Dosificación de Precisión & Calibración',
        timing: 'Dosis Diaria Exacta',
        badge: 'Pipeta Graduada 1.0 mL',
        instruction: 'Extraer exactamente 1.0 ml con la pipeta graduada. Dosis superiores saturan los receptores foliculares sin aportar beneficio clínico adicional.'
      },
      {
        step: 3,
        title: 'Aplicación Gota a Gota en Raíz',
        timing: 'Contacto Dérmico Directo',
        badge: 'Piel Capilar (No Tallo)',
        instruction: 'Depositar las gotas directamente en contacto con la piel del cuero cabelludo (evitando los tallos del cabello), distribuyendo uniformemente en coronilla, zona frontal y sienes.'
      },
      {
        step: 4,
        title: 'Masaje de Microcirculación & Perfusión',
        timing: '60 - 90 Segundos',
        badge: 'Activación Vascular',
        instruction: 'Efectuar un masaje circular suave con la yema de los dedos para activar el flujo vascular capilar y optimizar la penetración transdérmica liposomal.'
      },
      {
        step: 5,
        title: 'Tiempo de Absorción Liposomal Nocturno',
        timing: '6 a 8 Horas Continuas',
        badge: 'Secado al Aire (Sin Calor)',
        instruction: 'Dejar actuar la fórmula durante el descanso nocturno. Permitir el secado natural al aire sin usar calor directo de secador. No aclarar para asegurar la captación celular. Lavar las manos con agua y jabón tras aplicar.'
      },
      {
        step: 6,
        title: 'Protocolo de Higiene Matutina',
        timing: 'A la Mañana Siguiente',
        badge: 'Champú Fisiológico pH 5.5',
        instruction: 'Lavar el cabello a la mañana siguiente con un champú neutro suave (pH 5.5 sin sulfatos agresivos).'
      }
    ])) : (posology.applicationSteps || (isEntirelyOral ? [
      {
        step: 1,
        title: 'Daily Oral Administration',
        timing: getPosologyText(rx.posology).toLowerCase().includes('night') ? 'Bedtime / Evening' : 'Daily Dose',
        badge: 'Oral Route',
        instruction: 'Take the prescribed compounded capsule with a full glass of water (approx. 200–250 mL).'
      },
      {
        step: 2,
        title: 'Optimal Absorption & Timing',
        timing: 'With Meals',
        badge: 'Peak Bioavailability',
        instruction: 'Administer with food or during dinner to enhance gastrointestinal tolerance and maximize cofactor bioavailability.'
      },
      {
        step: 3,
        title: 'Pharmaceutical Storage',
        timing: 'Room Temp < 25°C',
        badge: 'Cool & Dry',
        instruction: 'Keep container tightly sealed in a cool, dry area below 25°C (77°F), shielded from direct sunlight and moisture.'
      },
      {
        step: 4,
        title: 'Course Duration & Follow-Up',
        timing: rx.duration || '3 to 6 Months',
        badge: 'Clinical Review',
        instruction: `Maintain therapy continuity throughout the prescribed cycle (${rx.duration || '3-6 months'}). Follow-up review with ${doctorName || 'the prescribing physician'}.`
      }
    ] : [
      {
        step: 1,
        title: 'Scalp Preparation',
        timing: '21:30 - 22:00 (Bedtime)',
        badge: 'Dry Scalp Only',
        instruction: 'Ensure the scalp is completely clean and dry before application. Do not apply on damp hair to prevent dilution of the TrichoSol™ lipid carrier. Part hair every 1-2 cm across areas of reduced density.'
      },
      {
        step: 2,
        title: 'Precision Dosing & Dropper Calibration',
        timing: 'Exact Daily Dose',
        badge: '1.0 mL Calibrated Mark',
        instruction: 'Draw exactly 1.0 mL using the calibrated dropper pipette. Doses beyond 1.0 mL saturate follicular receptors without delivering additional clinical efficacy.'
      },
      {
        step: 3,
        title: 'Targeted Droplet Root Contact',
        timing: 'Direct Dermal Contact',
        badge: 'Root Skin Surface',
        instruction: 'Apply droplets directly onto the scalp skin surface (avoiding hair shafts), distributing evenly across targeted follicular zones (crown, frontal hairline, and temporal areas).'
      },
      {
        step: 4,
        title: 'Microcirculation Perfusion Massage',
        timing: '60 - 90 Seconds',
        badge: 'Capillary Perfusion',
        instruction: 'Perform gentle circular fingertip massage for 60 to 90 seconds to stimulate vascular capillary perfusion and optimize liposomal transdermal penetration.'
      },
      {
        step: 5,
        title: 'Nighttime Liposomal Absorption Window',
        timing: '6 to 8 Continuous Hours',
        badge: 'Overnight Air-Dry',
        instruction: 'Leave formula on throughout nighttime rest. Allow to air-dry naturally without direct hairdryer heat. Do not rinse overnight to ensure complete intracellular uptake. Wash hands thoroughly with soap and water after application.'
      },
      {
        step: 6,
        title: 'Morning Hygiene Protocol',
        timing: 'Following Morning',
        badge: 'pH 5.5 Gentle Cleanse',
        instruction: 'Cleanse hair the following morning using a gentle physiological shampoo (pH 5.5, free of harsh aggressive sulfates).'
      }
    ]));
  }, [isEs, posology.applicationSteps, isEntirelyOral, rx.posology, rx.duration, doctorName]);

  // Localized clinical milestones
  const timeline = useMemo(() => {
    return isEs ? (posology.timeline || (isEntirelyOral ? [
      {
        phase: 'Mes 1',
        title: 'Restablecimiento Metabólico & Absorción Inicial',
        badge: 'Fase Inicial',
        description: 'Asimilación celular de micronutrientes y cofactores esenciales. Normalización de vías metabólicas basales.'
      },
      {
        phase: 'Mes 2 - 3',
        title: 'Optimización Tisular & Regulación Celular',
        badge: 'Consolidación',
        description: 'Equilibrio de biomarcadores celulares, reducción del estrés oxidativo y mejora del tono funcional sistémico.'
      },
      {
        phase: rx.duration || 'Mes 3 - 6',
        title: 'Mantenimiento & Evaluación de Resultados',
        badge: 'Revisión Clínica',
        description: `Consolidación de las respuestas nutrigenéticas individuales. Control clínico evolutivo con ${doctorName || 'el médico prescriptor'}.`
      }
    ] : [
      {
        phase: 'Semanas 1 - 3',
        title: 'Fase de Adaptación & Estabilización',
        badge: 'Mes 1',
        description: 'Frenado de la caída telógena activa. Posible leve caída transitoria (shedding fisiológico) al expulsar cabellos viejos para dar paso a la fase anágena.'
      },
      {
        phase: 'Semanas 4 - 8',
        title: 'Activación Anágena & Proliferación',
        badge: 'Mes 2',
        description: 'Reactivación celular de la papila dérmica por IGrantine-F1™ y control androgénico por 17-α-Estradiol. Reducción notoria de caída en lavado.'
      },
      {
        phase: 'Semanas 9 - 12',
        title: 'Engrosamiento, Densidad & Consolidación',
        badge: 'Mes 3',
        description: `Incremento del calibre folicular y mayor cobertura visual. Finalización del tratamiento. Revisión clínica con ${doctorName || 'el médico prescriptor'}.`
      }
    ])) : (posology.timeline || (isEntirelyOral ? [
      {
        phase: 'Month 1',
        title: 'Metabolic Priming & Initial Bio-assimilation',
        badge: 'Initial Phase',
        description: 'Cellular uptake of key micronutrients and cofactors. Normalization of basal biochemical pathways.'
      },
      {
        phase: 'Months 2 - 3',
        title: 'Tissue Optimization & Cellular Regulation',
        badge: 'Consolidation',
        description: 'Biomarker stabilization, mitigation of oxidative stress, and enhancement of systemic vitality.'
      },
      {
        phase: rx.duration || 'Months 3 - 6',
        title: 'Maintenance & Clinical Outcome Evaluation',
        badge: 'Follow-up',
        description: `Long-term consolidation of individualized nutrigenetic adaptations. Follow-up consultation with ${doctorName || 'the prescribing physician'}.`
      }
    ] : [
      {
        phase: 'Weeks 1 - 3',
        title: 'Adaptation & Follicular Stabilization',
        badge: 'Month 1',
        description: 'Cessation of active telogen shedding. Potential transient physiological shedding as miniaturized telogen hairs make way for synchronized anagen emergence.'
      },
      {
        phase: 'Weeks 4 - 8',
        title: 'Anagen Activation & Cellular Proliferation',
        badge: 'Month 2',
        description: 'Dermal papilla reactivation via IGrantine-F1™ and androgenic pathway control by 17-α-Estradiol. Marked reduction of hairs shed during washing.'
      },
      {
        phase: 'Weeks 9 - 12',
        title: 'Shaft Thickening, Density & Consolidation',
        badge: 'Month 3',
        description: `Measurable caliber increase in hair shafts and visible density coverage. Completion of course. Follow-up clinical review with ${doctorName || 'the prescribing physician'}.`
      }
    ]));
  }, [isEs, posology.timeline, isEntirelyOral, rx.duration, doctorName]);

  return {
    rxId,
    posology,
    patient,
    patientName,
    patientAlias,
    treatingDoc,
    doctorName,
    doctorClinic,
    clinic: doctorClinic,
    doctorSpecialty,
    doctorAddress,
    doctorPhone,
    doctorLicense,
    formattedDoctorLicense,
    isDhaLicensed,
    doctorSlug,
    doctorPublicUrl,
    hasTreatingDoctor,
    isHaytham,
    genomicsData,
    prescriptionTypeInfo,
    isNutrigen,
    isEntirelyOral,
    rawLines,
    compoundedFormulations,
    prescriptionLabels,
    prescriptionApis,
    tocSections,
    resolvedFormulaSummary,
    resolvedDosageSummary,
    shareTextWhatsApp,
    resolvedPrice,
    steps,
    timeline
  };
}
