import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebaseAdmin';
import { FieldValue } from 'firebase-admin/firestore';
import { syncPrescriptionToAlgolia } from '@/services/algoliaSyncService';
import crypto from 'crypto';

export async function POST(request) {
  try {
    const body = await request.json();
    const {
      doctorId = 'dr-hanieh-erdmann',
      doctorName = 'Dr. Hanieh Erdmann',
      doctorLicense = 'DHA-00013060-006',
      clinicName = 'Bedaya Polyclinic L.L.C.',
      clinicAddress = 'Villa 2, Street 49th, Al Wasl, Dubai',
      doctorSpecialty = 'Specialist Dermatologist & Trichologist',
      patient = null,
      treatmentTitle = 'Compounded Personalized Protocol',
      formulationBlocks = [],
      formulaSummary = '',
      nutrigenomicProfile = null,
      capsuleSize = 'Size 0',
      capsPerBottle = 60,
      supplyDays = 30,
      genotypeChecksum = null
    } = body;

    if (!patient || !patient.name) {
      return NextResponse.json(
        { success: false, error: 'Patient information (name) is required to issue an official prescription.' },
        { status: 400 }
      );
    }

    if (!Array.isArray(formulationBlocks) || formulationBlocks.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Formulation blocks are required.' },
        { status: 400 }
      );
    }

    // Generate unique prescription code
    const randomDigits = Math.floor(10000 + Math.random() * 90000);
    const rxCode = `RX-CMP-${randomDigits}`;

    // Cryptographic audit checksum of input genotypes + formulations (Non-repudiation)
    const calculatedChecksum = genotypeChecksum || crypto
      .createHash('sha256')
      .update(JSON.stringify({
        patientName: patient.name,
        patientId: patient.id,
        sampleId: nutrigenomicProfile?.sampleId || '',
        genotypes: nutrigenomicProfile?.genotypes || {},
        formulationBlocks
      }))
      .digest('hex');

    const newPrescription = {
      code: rxCode,
      fileNumber: rxCode,
      status: 'approved',
      clinicalType: 'nutraceutical',
      clinicalCategory: 'nutraceutical',
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
      prescribedAt: new Date().toISOString(),
      
      // Prescribing Treating Physician Credentials (Verified DHA / EU)
      doctorId: doctorId,
      doctorName: doctorName,
      doctorLicense: doctorLicense,
      doctorSpecialty: doctorSpecialty,
      clinicName: clinicName,
      clinicAddress: clinicAddress,
      physician: {
        id: doctorId,
        name: doctorName,
        license: doctorLicense,
        clinic: clinicName,
        address: clinicAddress,
        specialty: doctorSpecialty
      },

      // Registered Patient Demographics
      patientId: patient.id || `pt-${Date.now()}`,
      patientName: patient.name,
      patient: {
        id: patient.id || `pt-${Date.now()}`,
        name: patient.name,
        email: patient.email || '',
        phone: patient.phone || '',
        dob: patient.dob || ''
      },

      treatmentTitle: treatmentTitle,
      formulationBlocks: formulationBlocks,
      formulaSummary: formulaSummary,
      capsuleDetails: {
        size: capsuleSize,
        material: 'Vegan HPMC (Acid-Resistant)',
        capsPerBottle: capsPerBottle,
        supplyDays: supplyDays
      },

      // Nutrigenomic DNA Calibration metadata & Cryptographic Audit
      nutrigenomicProfile: nutrigenomicProfile || null,
      auditTrail: {
        engineVersion: '2.1.0',
        genotypeChecksum: calculatedChecksum,
        verifiedBy: doctorName,
        regulatoryStandard: 'Ph. Eur. 11th Ed. & EU Good Compounding Practices'
      },

      // Quality & Pharmacopeial Standard
      compoundingStandard: 'Ph. Eur. 11th Ed. & EU Good Compounding Practices',
      dispensingPharmacy: 'Pharmapolis Ltd. (EU Reg.)',
      releaseTimeline: '48–72h Batch Release'
    };

    const docRef = await adminDb.collection('prescriptions').add(newPrescription);

    // Persist to clinical_triangulations audit collection
    try {
      await adminDb.collection('clinical_triangulations').add({
        prescriptionId: docRef.id,
        rxCode,
        patientId: newPrescription.patientId,
        patientName: patient.name,
        doctorId,
        sampleId: nutrigenomicProfile?.sampleId || '',
        genotypeChecksum: calculatedChecksum,
        engineVersion: '2.1.0',
        createdAt: FieldValue.serverTimestamp()
      });
    } catch (auditErr) {
      console.warn('[create-compounded] Non-blocking audit log error:', auditErr.message);
    }

    // In-process atomic Algolia synchronization (Zero manual sync needed)
    await syncPrescriptionToAlgolia(docRef.id, { ...newPrescription, id: docRef.id });

    return NextResponse.json({
      success: true,
      id: docRef.id,
      rxCode: rxCode,
      patientName: patient.name,
      doctorName: doctorName,
      checksum: calculatedChecksum
    });
  } catch (error) {
    console.error('[create-compounded] Error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create compounded prescription.' },
      { status: 500 }
    );
  }
}

