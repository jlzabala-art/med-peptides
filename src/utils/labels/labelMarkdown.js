/**
 * Markdown <-> label object conversion (single source of truth for the label editor).
 */

export function formatApisForEditor(item) {
  if (!item) return '';
  if (Array.isArray(item.apis) && item.apis.length > 0) {
    const list = item.apis.filter(a => {
      if (typeof a === 'string') return Boolean(a.trim());
      return !a.isVehicle && !a.isVehicleOrBase;
    });
    if (list.length > 0) {
      return list.map(a => {
        if (typeof a === 'string') return a.trim();
        const drug = a.drugName || a.drug || a.name || a.productName || '';
        const dose = a.dosage || a.dose || a.strength || '';
        return dose ? `${drug}: ${dose}` : drug;
      }).filter(Boolean).join('\n');
    }
  }
  if (item.formula) {
    return item.formula
      .split(/\s*(?:\+|\bin\b)\s*/i)
      .map(p => p.trim())
      .filter(Boolean)
      .join('\n');
  }
  return '';
}

export function labelToMarkdown(item) {
  if (!item) return '';
  const patient = item.patientName || item.patient?.name || '';
  const fileNo = item.fileNumber || item.rxCode || item.fileNo || item.id || '';
  const batch = item.batchCode || item.lote || fileNo || '';
  const volume = item.volume || item.size || item.netContent || '100 mL';
  const dosageForm = item.dosageForm || 'Topical Scalp Solution';
  const mfg = item.prodDate || item.mfgDate || '05-10-2026';
  const exp = item.expDate || item.expiryDate || item.caducidad || item.expirationDate || '04-10-2027';
  const pharmacy = item.pharmacyName || item.dispensingPharmacy || item.pharmacy || 'PHARMAPOLIS';
  const pharmacyAddress = item.pharmacyAddress || item.dispensingPharmacyAddress || item.dispensaryAddress || '1A Arhimandrit Evlogi Street, 4013 Plovdiv, Bulgaria';
  const doctor = item.doctorName || item.physician || 'Dr. Marina Cordeiro Fernandes';
  const clinic = item.clinicName || 'NOVA Clinic Day Surgery Center, Dubai';
  const license = item.doctorLicense || 'DHA-91105367';
  const storage = item.storage || 'Store at room temperature';
  const title = item.productTitle || item.productName || 'Compounded Pharmaceutical Protocol';

  let apisText = '';
  if (Array.isArray(item.apis) && item.apis.length > 0) {
    const list = item.apis.filter(a => {
      if (typeof a === 'string') return Boolean(a.trim());
      return !a.isVehicle && !a.isVehicleOrBase;
    });
    if (list.length > 0) {
      apisText = list.map(a => {
        if (typeof a === 'string') return `- ${a.replace(/^[*-]\s*/, '').trim()}`;
        const drug = a.drugName || a.drug || a.name || a.productName || a.activeIngredient || '';
        const dose = a.dosage || a.dose || a.strength || '';
        return dose ? `- ${drug}: ${dose}` : `- ${drug}`;
      }).join('\n');
    }
  }
  if (!apisText && item.formula) {
    apisText = item.formula
      .split(/\s*(?:\+|\bin\b)\s*/i)
      .map(p => `- ${p.trim()}`)
      .join('\n');
  }
  if (!apisText) {
    apisText = '- Active Compounded Formulation';
  }

  const vehicle = typeof item.vehicle === 'string' ? item.vehicle : (item.vehicle?.name || '');
  const directions = item.directions || item.instructions || 'Apply / take as directed by prescribing physician.';
  const warnings = item.warnings || item.warning || 'For external / patient use only. Keep out of reach of children.';

  return `---
patient: ${patient}
fileNumber: ${fileNo}
batch: ${batch}
volume: ${volume}
dosageForm: ${dosageForm}
mfg: ${mfg}
exp: ${exp}
pharmacy: ${pharmacy}
pharmacyAddress: ${pharmacyAddress}
doctor: ${doctor}
clinic: ${clinic}
license: ${license}
storage: ${storage}${item.shippingTitle ? `
shippingTitle: ${item.shippingTitle}` : ''}${item.deliveryTitle ? `
deliveryTitle: ${item.deliveryTitle}` : ''}
status: ${item.approvalStatus || 'draft'}
version: ${item.version || 1}
---

# ${title}

## ACTIVE COMPOUNDED INGREDIENTS
${apisText}

## COMPOUNDING VEHICLE
${vehicle || ''}

## DIRECTIONS FOR USE
${directions}

## WARNINGS & PRECAUTIONS
${warnings}
`;
}

export function parseMarkdownToLabel(mdText, baseItem = {}) {
  const result = { ...baseItem };
  if (!mdText) return result;

  const cleanMd = mdText.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  const fmMatch = cleanMd.match(/^---\s*\n([\s\S]*?)\n---\s*\n?/);
  let body = cleanMd;
  if (fmMatch) {
    body = cleanMd.slice(fmMatch[0].length);
    const lines = fmMatch[1].split('\n');
    lines.forEach(line => {
      const idx = line.indexOf(':');
      if (idx > 0) {
        const rawKey = line.slice(0, idx).trim();
        const normKey = rawKey.toLowerCase().replace(/[\s\-_]/g, '');
        const val = line.slice(idx + 1).trim();

        if (['patient', 'patientname', 'paciente', 'nombrepaciente'].includes(normKey)) {
          result.patientName = val;
        } else if (['filenumber', 'rxcode', 'file', 'rx', 'fileno', 'numeroficha', 'expediente', 'codigorx', 'numreceta', 'receta'].includes(normKey)) {
          result.fileNumber = val;
          result.rxCode = val;
        } else if (['batch', 'batchcode', 'lote', 'codigolote', 'lot', 'numlote'].includes(normKey)) {
          result.batchCode = val;
          result.lote = val;
        } else if (['volume', 'size', 'netcontent', 'net', 'volumen', 'cantidad', 'contenido', 'tamano', 'vol'].includes(normKey)) {
          result.volume = val;
          result.netContent = val;
        } else if (['dosageform', 'form', 'presentacion', 'formafarmaceutica', 'via', 'route', 'formato'].includes(normKey)) {
          result.dosageForm = val;
        } else if (['mfg', 'proddate', 'mfgdate', 'fabricacion', 'fechafabricacion', 'fechaelaboracion', 'elaboracion'].includes(normKey)) {
          result.prodDate = val;
          result.mfgDate = val;
        } else if (['exp', 'expdate', 'expiry', 'expiration', 'caducidad', 'fechacaducidad', 'fechadecaducidad', 'vencimiento', 'fechavencimiento', 'validez'].includes(normKey)) {
          result.expDate = val;
          result.expiryDate = val;
          result.caducidad = val;
        } else if (['pharmacy', 'pharmacyname', 'dispensingpharmacy', 'farmacia', 'nombrefarmacia', 'dispensary', 'farmaciadispensadora'].includes(normKey)) {
          result.pharmacyName = val;
          result.dispensingPharmacy = val;
          result.pharmacy = val;
        } else if (['pharmacyaddress', 'dispensingpharmacyaddress', 'direccionfarmacia', 'farmaciadireccion', 'dispensaryaddress', 'direccion'].includes(normKey)) {
          result.pharmacyAddress = val;
          result.dispensingPharmacyAddress = val;
        } else if (['doctor', 'doctorname', 'physician', 'medico', 'nombremedico', 'prescriptor', 'doctora'].includes(normKey)) {
          result.doctorName = val;
        } else if (['clinic', 'clinicname', 'clinica', 'centro', 'centromedico', 'hospital'].includes(normKey)) {
          result.clinicName = val;
        } else if (['license', 'doctorlicense', 'licencia', 'colegiado', 'numcolegiado', 'dha'].includes(normKey)) {
          result.doctorLicense = val;
        } else if (['storage', 'conservacion', 'almacenamiento', 'temperatura', 'condicionesconservacion'].includes(normKey)) {
          result.storage = val;
        } else if (['shippingtitle', 'shippingname', 'nombreaduana', 'nombreenvio', 'customstitle'].includes(normKey)) {
          result.shippingTitle = val;
          result.shippingName = val;
        } else if (['deliverytitle', 'deliveryname', 'nombreentrega'].includes(normKey)) {
          result.deliveryTitle = val;
        } else if (['status', 'estado', 'approvalstatus', 'approval'].includes(normKey)) {
          result.approvalStatus = val.toLowerCase() === 'approved' ? 'approved' : 'draft';
        } else if (['version', 'ver', 'revision'].includes(normKey)) {
          result.version = Number(val) || 1;
        }
      }
    });
  }

  // Flexible Title Parsing (# Title or Protocol)
  const titleMatch = body.match(/^#+\s*(?:PROTOCOL[O]?:\s*)?(.+)$/m);
  if (titleMatch) {
    result.productTitle = titleMatch[1].trim();
    result.productName = titleMatch[1].trim();
  }

  // Flexible Bilingual Active Ingredients Parsing
  const apiMatch = body.match(/##\s*(?:ACTIVE\s+COMPOUNDED\s+INGREDIENTS|INGREDIENTES\s+ACTIVOS|PRINCIPIOS\s+ACTIVOS|COMPUESTOS\s+ACTIVOS|FORMULA\s+ACTIVA|APIS|FORMULA)\s*\n([\s\S]*?)(?=\n##|$)/i);
  if (apiMatch) {
    const rawApis = apiMatch[1]
      .split('\n')
      .map(l => l.replace(/^[*-]\s*/, '').trim())
      .filter(Boolean);
    if (rawApis.length > 0) {
      result.apis = rawApis.map(line => {
        const colonIdx = line.indexOf(':');
        if (colonIdx > 0) {
          return {
            drugName: line.slice(0, colonIdx).trim(),
            dosage: line.slice(colonIdx + 1).trim()
          };
        }
        return { drugName: line };
      });
      result.formula = rawApis.join(' + ');
    }
  }

  // Flexible Bilingual Vehicle Parsing
  const vehMatch = body.match(/##\s*(?:(?:COMPOUNDING\s+)?VEHICLE(?:\s*&\s*BASE)?|VEHICULO(?:\s*Y\s*BASE)?|BASE|EXCIPIENTE)\s*\n([\s\S]*?)(?=\n##|$)/i);
  if (vehMatch) {
    const veh = vehMatch[1].trim();
    result.vehicle = (veh.toLowerCase().includes('none') || veh.toLowerCase().includes('n/a')) ? '' : veh;
  }

  // Flexible Bilingual Directions Parsing
  const dirMatch = body.match(/##\s*(?:DIRECTIONS(?:\s*FOR\s*USE)?|INSTRUCCIONES(?:\s*DE\s*USO)?|MODO\s*DE\s*EMPLEO|POSOLOGIA|ADMINISTRACION)\s*\n([\s\S]*?)(?=\n##|$)/i);
  if (dirMatch) {
    result.directions = dirMatch[1].trim();
  }

  // Flexible Bilingual Warnings Parsing
  const warnMatch = body.match(/##\s*(?:WARNINGS?(?:\s*(?:&|AND)\s*PRECAUTIONS?)?|ADVERTENCIAS?(?:\s*(?:Y|E)\s*PRECAUCIONES?)?|PRECAUCIONES?)\s*\n([\s\S]*?)(?=\n##|$)/i);
  if (warnMatch) {
    result.warnings = warnMatch[1].trim();
  }

  // Body Fallback: If user wrote expiration or pharmacy directly in the body
  if (!result.expDate) {
    const bodyExp = body.match(/(?:exp(?:_date|iry)?|caducidad|vencimiento):\s*([^\n\r]+)/i);
    if (bodyExp) {
      result.expDate = bodyExp[1].trim();
      result.expiryDate = result.expDate;
    }
  }
  if (!result.pharmacyName) {
    const bodyPharm = body.match(/(?:pharmacy(?:_name)?|farmacia|dispensary):\s*([^\n\r]+)/i);
    if (bodyPharm) {
      result.pharmacyName = bodyPharm[1].trim();
      result.dispensingPharmacy = result.pharmacyName;
      result.pharmacy = result.pharmacyName;
    }
  }
  if (!result.pharmacyAddress) {
    const bodyAddr = body.match(/(?:pharmacyAddress|direccion_farmacia|direccion farmacia):\s*([^\n\r]+)/i);
    if (bodyAddr) {
      result.pharmacyAddress = bodyAddr[1].trim();
      result.dispensingPharmacyAddress = result.pharmacyAddress;
    }
  }

  return result;
}
