/**
 * src/components/product/PeptideSupplyManagementTechnicalSpecs.jsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Highly graphical presentation of the B2B Peptide Supply Chain & Dedicated
 * Inventory Management Service.
 *
 * Core Features Highlighted:
 * 1. ZERO Manufacturing Delay (In-Stock Certified Inventory vs Compounding)
 * 2. Dedicated Account Manager Assigned (Personal Concierge)
 * 3. 2x2 Interactive Matrix: Flexible Invoicing (Clinic vs Patient) × Flexible Delivery (Clinic vs Patient)
 * 4. Lot-Locking & Batch Consistency for Patient Cycles
 * 5. 24–48h Dispatch with Validated Cold-Chain Thermal Logging
 * 6. Free Shipping on 10+ Units (Save 200-400 AED)
 * ─────────────────────────────────────────────────────────────────────────────
 */

'use client';

import React, { useState, useMemo } from 'react';
import {
  Boxes,
  UserCheck,
  Building2,
  PackageCheck,
  Truck,
  ShieldCheck,
  Clock,
  CheckCircle2,
  Zap,
  ArrowRight,
  HelpCircle,
  ChevronDown,
  MessageCircle,
  ThermometerSnowflake,
  CreditCard,
  Layers,
  Sparkles,
  PhoneCall,
  Flame
} from 'lucide-react';
import './PeptideSupplyManagementTechnicalSpecs.css';

export default function PeptideSupplyManagementTechnicalSpecs({
  product,
  lang = 'en',
  onOpenInquiry
}) {
  const isEn = lang !== 'es';

  // 2x2 Matrix State
  const [billingTarget, setBillingTarget] = useState('clinic'); // 'clinic' | 'patient'
  const [deliveryTarget, setDeliveryTarget] = useState('clinic'); // 'clinic' | 'patient'
  const [volumeVials, setVolumeVials] = useState(12);
  const [openFaqIndex, setOpenFaqIndex] = useState(0);

  const isFreeShipping = volumeVials >= 10;
  const shippingFeeAED = isFreeShipping ? 0 : 350;

  const toggleFaq = (idx) => {
    setOpenFaqIndex(openFaqIndex === idx ? null : idx);
  };

  const handleWhatsAppInquiry = () => {
    const text = isEn
      ? encodeURIComponent(
          `Hello, I am interested in the B2B Peptide Supply Chain & Dedicated Inventory Management service (In-Stock with Dedicated Account Manager).\n` +
          `• Invoicing Preference: ${billingTarget === 'clinic' ? 'Billed to Clinic (B2B Wholesale Price)' : 'Direct to Patient (RRP)'}\n` +
          `• Delivery Destination: ${deliveryTarget === 'clinic' ? 'Clinic Facility / Refrigeration Receiving' : 'Dropship to Patient Residence'}\n` +
          `• Estimated Monthly Volume: ${volumeVials} vials\n` +
          `I would like to be assigned a Dedicated Account Manager to reserve lots and review pricing tiers.`
        )
      : encodeURIComponent(
          `Hola, me interesa el servicio de Gestión de Suministro de Péptidos (Stock Inmediato con Account Manager).\n` +
          `• Facturación deseada: ${billingTarget === 'clinic' ? 'A la Clínica (Precio Mayorista B2B)' : 'Directa al Paciente (RRP)'}\n` +
          `• Destino de entrega: ${deliveryTarget === 'clinic' ? 'Recepción de la Clínica' : 'Dropship a Domicilio del Paciente'}\n` +
          `• Volumen mensual estimado: ${volumeVials} viales\n` +
          `Deseo que me asignen un Account Manager dedicado para reservar lotes y conocer tarifas.`
        );
    window.open(`https://wa.me/34693765765?text=${text}`, '_blank');
  };

  const faqs = useMemo(() => {
    if (isEn) {
      return [
        {
          q: 'How does Peptide Supply Management differ from Pharmaceutical Compounding?',
          a: 'Pharmaceutical Compounding involves bespoke prescription manufacturing formulated from scratch in a European laboratory, taking 5 to 7 business days. In contrast, Peptide Supply Management draws from pre-certified, analytical HPLC ≥99% verified warehouse stock ready for immediate dispatch within 24 to 48 hours, with zero manufacturing delays.'
        },
        {
          q: 'What is the role and benefit of the Dedicated Account Manager?',
          a: 'Your Account Manager is your direct, personal operational liaison. They manage lot-locking reservations (ensuring identical peptide batches across multi-month patient cycles), issue custom wholesale volume quotes, coordinate split clinic/patient shipments, and monitor temperature tracking during air freight in real time.'
        },
        {
          q: 'Can our clinic bill the patient while having shipments dropshipped to their home?',
          a: 'Yes, this is one of our most requested arrangements (Clinical Dropshipping). The commercial invoice is billed to your clinic at the discounted B2B Wholesale rate, your practice bills the patient at your chosen consultation fee, and we dispatch the temperature-controlled shipment directly to your patient\'s home with discreet medical packaging.'
        },
        {
          q: 'What if we prefer the patient to pay directly for their treatment?',
          a: 'Simply provide the patient\'s contact details. We issue the official invoice at the Recommended Patient Price (RRP), send a secure payment link directly to the patient, and dispatch the package to their home or your clinic, relieving your practice of billing administration and collections.'
        },
        {
          q: 'How do you guarantee cold-chain thermal integrity during transit?',
          a: 'All peptides are packaged in certified isothermal insulated containers with calibrated phase-change refrigerant packs and continuous electronic temperature data loggers. This guarantees that strict cold-chain compliance (2°C–8°C or -20°C depending on compound) is maintained uninterrupted until delivery.'
        }
      ];
    }
    return [
      {
        q: '¿Cuál es la diferencia entre el Suministro de Péptidos y el Compounding Farmacéutico?',
        a: 'El Compounding Farmacéutico es una formulación magistral bajo receta médica que se elabora desde cero en laboratorio en Europa y requiere 5 a 7 días hábiles de fabricación. En cambio, la Gestión de Suministro de Péptidos recurre a stock liofilizado analíticamente certificado (HPLC ≥99%) listo para despacho inmediato en 24–48 horas, sin ningún retraso de producción.'
      },
      {
        q: '¿Qué ventajas aporta tener un Account Manager asignado?',
        a: 'El Account Manager es tu enlace directo y exclusivo. Se encarga de apartar lotes idénticos para pacientes con tratamientos de varios meses, tramita cotizaciones con descuentos de mayorista, coordina envíos divididos y supervisa el registro térmico de la carga durante el transporte aéreo.'
      },
      {
        q: '¿Podemos cobrar nosotros al paciente pero pedir que el envío vaya a su casa?',
        a: 'Sí, es uno de nuestros modelos más solicitados (Dropshipping Clínico). La factura se emite a tu clínica a precio mayorista B2B, tú facturas al paciente lo que estipule tu consulta, y nosotros despachamos el paquete refrigerado directamente a su domicilio con empaque médico discreto.'
      },
      {
        q: '¿Y si preferimos que el paciente pague directamente su medicación?',
        a: 'Simplemente indícanos los datos del paciente. Nosotros le emitimos la factura oficial con la tarifa recomendada (RRP), le enviamos el enlace de pago seguro y enviamos el pedido a su casa o a tu clínica para que se lo administres, liberando a tu equipo de tareas de facturación.'
      },
      {
        q: '¿Cómo se garantiza que los péptidos no pierdan actividad biológica en tránsito?',
        a: 'Todos los envíos se empaquetan en contenedores isotérmicos validados con acumuladores de frío de cambio de fase y sensores de temperatura continuos. Esto garantiza que la cadena de frío (2°C–8°C o -20°C según formulación) se mantenga ininterrumpida hasta la entrega final.'
      }
    ];
  }, [isEn]);

  return (
    <div className="supply-specs-container">
      {/* ── TOP HERO BADGE & VALUE PROP ── */}
      <div className="supply-hero-card">
        <div className="supply-badge-row">
          <span className="sup-tag sup-tag-instant">
            <Zap size={14} /> {isEn ? 'Immediate Stock · Zero Manufacturing Delay' : 'Stock Inmediato · Sin Tiempos de Fabricación'}
          </span>
          <span className="sup-tag sup-tag-manager">
            <UserCheck size={14} /> {isEn ? 'Dedicated Account Manager Assigned' : 'Account Manager Dedicado Asignado'}
          </span>
          <span className="sup-tag sup-tag-dispatch">
            <Clock size={14} /> {isEn ? 'Express 24–48h Dispatch' : 'Despacho Express 24–48h'}
          </span>
          <span className="sup-tag sup-tag-cold">
            <ThermometerSnowflake size={14} /> {isEn ? 'Validated Cold-Chain Transit' : 'Cadena de Frío Validada'}
          </span>
        </div>

        <h2 className="supply-title">
          {isEn
            ? 'B2B Peptide Supply Chain & Dedicated Inventory Management'
            : 'Gestión Integral de Suministro de Péptidos & Concierge B2B'}
        </h2>
        <p className="supply-subtitle">
          {isEn ? (
            <>
              Direct peptide procurement for medical practices and longevity centers from pre-certified, lyophilized inventory (HPLC ≥99%). Eliminate manufacturing backlogs: your <strong>personal Dedicated Account Manager</strong> coordinates batch reservations, volume quotas, and facilitates flexible billing and delivery (to your clinic or direct to your patients). Sourced and managed through authorized healthcare supplier <strong>Mediluxe Health Solutions</strong>.
            </>
          ) : (
            <>
              Suministro directo para clínicas y centros médicos desde inventario liofilizado precertificado (HPLC ≥99%). Olvídate de los retrasos de fabricación: tu <strong>Account Manager personal</strong> gestiona la asignación de lotes, cotizaciones por volumen y coordina la entrega y facturación con total flexibilidad (a tu clínica o a tus pacientes). Proveído y gestionado por <strong>Mediluxe Health Solutions</strong>.
            </>
          )}
        </p>

        {/* COMPARISON CARD: Compounding vs Direct Peptide Supply */}
        <div className="comparison-banner">
          <div className="comp-column compounding-col">
            <div className="col-header">
              <span className="col-type">{isEn ? 'Compounding Service' : 'Servicio de Compounding'}</span>
              <h4>{isEn ? 'Magistral Compounding' : 'Elaboración Magistral'}</h4>
            </div>
            <ul className="comp-features">
              <li>{isEn ? 'Requires 5 to 7 days formulation in European laboratory' : 'Requiere 5 a 7 días de formulación en laboratorio'}</li>
              <li>{isEn ? 'Customized to millimetric personalized dosages' : 'Adaptado a dosis milimétricas individualizadas'}</li>
              <li>{isEn ? 'Made-to-order production following prescription intake' : 'Producción bajo pedido tras recepción de receta'}</li>
            </ul>
          </div>

          <div className="comp-vs-divider">VS</div>

          <div className="comp-column supply-col">
            <div className="col-header">
              <div className="recommended-badge"><Sparkles size={12} /> {isEn ? 'Real-Time Stock' : 'Stock en Tiempo Real'}</div>
              <span className="col-type">{isEn ? 'Supply Management' : 'Gestión de Suministro'}</span>
              <h4>{isEn ? 'Immediate In-Stock Peptides' : 'Suministro de Péptidos Inmediato'}</h4>
            </div>
            <ul className="comp-features">
              <li><strong>{isEn ? 'Zero manufacturing wait:' : 'Cero esperas de fabricación:'}</strong> {isEn ? 'Dispatched within 24–48 hours' : 'Despacho en 24–48 horas'}</li>
              <li><strong>{isEn ? 'Dedicated Account Manager' : 'Account Manager dedicado'}</strong> {isEn ? 'assigned to your practice' : 'asignado a tu consulta'}</li>
              <li><strong>{isEn ? 'Lot-locking batch consistency' : 'Reserva de lotes idénticos'}</strong> {isEn ? 'for long-term therapy cycles' : 'para ciclos largos de tratamiento'}</li>
              <li><strong>{isEn ? 'Cross-billing & shipping flexibility:' : 'Facturación y envíos cruzados:'}</strong> {isEn ? 'Clinic or Patient' : 'Clínica o Paciente'}</li>
            </ul>
          </div>
        </div>
      </div>

      {/* ── DEDICATED ACCOUNT MANAGER SPOTLIGHT ── */}
      <div className="account-manager-card">
        <div className="am-grid">
          <div className="am-profile">
            <div className="am-avatar-wrap">
              <div className="am-avatar-circle">
                <UserCheck size={36} />
              </div>
              <div className="am-status-dot" title={isEn ? 'Online and available' : 'Disponible online'} />
            </div>
            <div className="am-identity">
              <span className="am-role-tag">{isEn ? 'VIP B2B Support' : 'Soporte VIP B2B'}</span>
              <h4>{isEn ? 'Your Assigned Account Manager' : 'Tu Account Manager Asignado'}</h4>
              <p className="am-desc">
                {isEn
                  ? 'A single clinical and logistics point of contact for all your clinic\'s peptide supply operations.'
                  : 'Un único interlocutor técnico y logístico para todas las necesidades de tu clínica.'}
              </p>
              <div className="am-channel-chips">
                <span><PhoneCall size={12} /> {isEn ? 'Direct Line' : 'Línea Directa'}</span>
                <span><MessageCircle size={12} /> {isEn ? 'B2B WhatsApp' : 'WhatsApp B2B'}</span>
                <span><ShieldCheck size={12} /> {isEn ? 'Instant COAs' : 'Acceso a COAs'}</span>
              </div>
            </div>
          </div>

          <div className="am-responsibilities">
            <h5 className="am-resp-title">
              {isEn ? 'What responsibilities does your Account Manager handle?' : '¿Qué funciones asume tu Account Manager?'}
            </h5>
            <div className="am-resp-grid">
              <div className="am-resp-item">
                <div className="resp-icon"><Boxes size={18} /></div>
                <div>
                  <strong>{isEn ? 'Batch Allocation & Lot-Locking' : 'Reserva y Bloqueo de Lotes (Lot-Locking)'}</strong>
                  <p>
                    {isEn
                      ? 'Locks and reserves vials from identical production runs so patients on 3- to 6-month protocols receive consistent synthesis profiles.'
                      : 'Reserva viales del mismo lote para asegurar que los pacientes de un protocolo de 3 a 6 meses reciban exactamente la misma síntesis.'}
                  </p>
                </div>
              </div>

              <div className="am-resp-item">
                <div className="resp-icon"><CreditCard size={18} /></div>
                <div>
                  <strong>{isEn ? 'Wholesale Volume Pricing' : 'Precios por Volumen & Escalas B2B'}</strong>
                  <p>
                    {isEn
                      ? 'Applies automatic wholesale tier discounts and structures tailored bundled orders with preferential margins.'
                      : 'Aplica descuentos automáticos por tramos mayoristas y tramita pedidos combinados con condiciones preferentes.'}
                  </p>
                </div>
              </div>

              <div className="am-resp-item">
                <div className="resp-icon"><Truck size={18} /></div>
                <div>
                  <strong>{isEn ? 'Split Fulfillment & Multi-Destination Logistics' : 'Logística Dividida (Split Shipments)'}</strong>
                  <p>
                    {isEn
                      ? 'Need part of your order at the clinic for office administration and part dropshipped to patients? Handled under a single coordinated workflow.'
                      : '¿Parte del pedido para el stock de la consulta y parte para el domicilio de pacientes concretos? Tu gestor lo coordina en un solo trámite.'}
                  </p>
                </div>
              </div>

              <div className="am-resp-item">
                <div className="resp-icon"><ShieldCheck size={18} /></div>
                <div>
                  <strong>{isEn ? 'Certificate of Analysis (COA) Auditing' : 'Auditoría de Certificados de Calidad'}</strong>
                  <p>
                    {isEn
                      ? 'Provides immediate RP-HPLC and mass spectrometry (MS) reports prior to releasing and dispatching any lot.'
                      : 'Entrega inmediata de analíticas RP-HPLC y espectrometría de masas (MS) antes del despacho de cualquier lote.'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── 2x2 INTERACTIVE MATRIX: BILLING vs SHIPPING ── */}
      <div className="matrix-section">
        <div className="matrix-header">
          <div className="matrix-shield">
            <Layers size={20} />
          </div>
          <div>
            <h3 className="section-heading">
              {isEn
                ? 'Interactive Fulfillment Matrix: Who Gets Invoiced & Who Receives?'
                : 'Matriz Interactiva de Gestión: ¿Quién Factura y Quién Recibe?'}
            </h3>
            <p className="section-subtext">
              {isEn
                ? 'Select your operational combination to visualize exact fund flows, commercial margins, and cold delivery logistics.'
                : 'Selecciona la combinación operativa deseada para ver el flujo exacto de fondos, márgenes y transporte.'}
            </p>
          </div>
        </div>

        {/* Matrix Controls */}
        <div className="matrix-selectors-bar">
          <div className="selector-block">
            <span className="selector-title">
              {isEn ? '1. Who is the invoice issued to?' : '1. ¿A quién se emite la Factura?'}
            </span>
            <div className="selector-pills">
              <button
                type="button"
                className={`matrix-pill ${billingTarget === 'clinic' ? 'selected' : ''}`}
                onClick={() => setBillingTarget('clinic')}
              >
                <Building2 size={16} /> {isEn ? 'To Clinic (B2B Wholesale Rate)' : 'A la Clínica (Tarifa Mayorista)'}
              </button>
              <button
                type="button"
                className={`matrix-pill ${billingTarget === 'patient' ? 'selected' : ''}`}
                onClick={() => setBillingTarget('patient')}
              >
                <UserCheck size={16} /> {isEn ? 'Direct to Patient (Retail RRP)' : 'Al Paciente Directamente (PVP / RRP)'}
              </button>
            </div>
          </div>

          <div className="selector-block">
            <span className="selector-title">
              {isEn ? '2. Where is cold delivery fulfilled?' : '2. ¿Dónde se realiza la Entrega en Frío?'}
            </span>
            <div className="selector-pills">
              <button
                type="button"
                className={`matrix-pill ${deliveryTarget === 'clinic' ? 'selected' : ''}`}
                onClick={() => setDeliveryTarget('clinic')}
              >
                <Building2 size={16} /> {isEn ? 'At Clinic / Hospital Facility' : 'En la Clínica / Hospital'}
              </button>
              <button
                type="button"
                className={`matrix-pill ${deliveryTarget === 'patient' ? 'selected' : ''}`}
                onClick={() => setDeliveryTarget('patient')}
              >
                <PackageCheck size={16} /> {isEn ? 'At Patient Home Address (Dropship)' : 'En Domicilio del Paciente (Dropship)'}
              </button>
            </div>
          </div>
        </div>

        {/* Interactive Scenario Card */}
        <div className="scenario-display-card">
          <div className="scenario-banner">
            <span className="scenario-tag">
              {isEn
                ? `Active Scenario: Billed to ${billingTarget === 'clinic' ? 'Clinic' : 'Patient'} + Delivered to ${deliveryTarget === 'clinic' ? 'Clinic' : 'Patient'}`
                : `Escenario Activo: Facturación a ${billingTarget === 'clinic' ? 'Clínica' : 'Paciente'} + Entrega en ${deliveryTarget === 'clinic' ? 'Clínica' : 'Paciente'}`}
            </span>
            <span className="scenario-model-badge">
              {billingTarget === 'clinic' && deliveryTarget === 'clinic' && (isEn ? 'Model 1: Traditional Wholesale Stock' : 'Modelo 1: Stock Mayorista Tradicional')}
              {billingTarget === 'clinic' && deliveryTarget === 'patient' && (isEn ? 'Model 2: Dropshipping with Clinic Margin' : 'Modelo 2: Dropshipping con Margen de Clínica')}
              {billingTarget === 'patient' && deliveryTarget === 'patient' && (isEn ? 'Model 3: Delegated Full Fulfillment' : 'Modelo 3: Fulfillment Integral Delegado')}
              {billingTarget === 'patient' && deliveryTarget === 'clinic' && (isEn ? 'Model 4: Consignment for In-Clinic Administration' : 'Modelo 4: Consignación para Tratamiento In-Situ')}
            </span>
          </div>

          <div className="scenario-flow-diagram">
            <div className="flow-step-box">
              <div className="flow-badge">{isEn ? 'Step 1' : 'Paso 1'}</div>
              <strong>{isEn ? 'Invoice Issuance' : 'Emisión de Factura'}</strong>
              <p>
                {isEn
                  ? (billingTarget === 'clinic'
                      ? 'Commercial invoice issued to clinic at B2B wholesale discount. The clinic retains its consultation margin directly.'
                      : 'Official invoice emailed to patient with Recommended Patient Price (RRP) and secure card / SEPA payment link.')
                  : (billingTarget === 'clinic' 
                      ? 'Factura comercial a nombre de la clínica a precio mayorista (B2B Discount). La clínica retiene su margen de beneficio.' 
                      : 'Factura oficial enviada por correo al paciente con tarifa RRP recomendada y enlace de pago con tarjeta/SEPA.')}
              </p>
            </div>

            <div className="flow-step-arrow"><ArrowRight size={20} /></div>

            <div className="flow-step-box">
              <div className="flow-badge">{isEn ? 'Step 2' : 'Paso 2'}</div>
              <strong>{isEn ? '24–48h Dispatch & Lot Allocation' : 'Preparación & Despacho 24–48h'}</strong>
              <p>
                {isEn
                  ? 'Your dedicated Account Manager reserves the requested vials from certified lyophilized inventory, attaches analytical purity COAs (HPLC ≥99%), and verifies thermal packaging with calibrated temperature loggers.'
                  : 'El Account Manager bloquea los viales requeridos del stock liofilizado, anexa los COAs de pureza (HPLC ≥99%) y valida el empaquetado térmico con registradores continuos.'}
              </p>
            </div>

            <div className="flow-step-arrow"><ArrowRight size={20} /></div>

            <div className="flow-step-box">
              <div className="flow-badge">{isEn ? 'Step 3' : 'Paso 3'}</div>
              <strong>{isEn ? 'Cold-Chain Delivery' : 'Entrega en Destino'}</strong>
              <p>
                {isEn
                  ? (deliveryTarget === 'clinic'
                      ? 'Consolidated intake at clinic pharmacy or medical receiving. Immediate refrigerated custody at 2°C–8°C.'
                      : 'Door-to-door delivery directly to patient home address in medical-grade insulated packaging with security seals.')
                  : (deliveryTarget === 'clinic'
                      ? 'Recepción consolidada en la clínica o farmacia hospitalaria. Custodia inmediata en refrigeración 2°C–8°C.'
                      : 'Entrega puerta a puerta al domicilio del paciente en embalaje térmico de grado médico con precinto de seguridad.')}
              </p>
            </div>
          </div>

          <div className="scenario-benefits-bar">
            <div className="benefit-item">
              <CheckCircle2 size={16} className="text-emerald-500" />
              <span>
                <strong>{isEn ? 'Key Advantage:' : 'Ventaja Clave:'}</strong>{' '}
                {isEn ? (
                  billingTarget === 'clinic' && deliveryTarget === 'clinic' ? 'Maximum inventory control and immediate in-office prescription margin.' :
                  billingTarget === 'clinic' && deliveryTarget === 'patient' ? 'Clinic captures wholesale profit margins without handling cold shipments or packing boxes.' :
                  billingTarget === 'patient' && deliveryTarget === 'patient' ? 'Zero administrative billing burden and zero inventory holding costs for your practice.' :
                  'Patient pays directly for medication while product is delivered straight to the doctor for in-office administration.'
                ) : (
                  billingTarget === 'clinic' && deliveryTarget === 'clinic' ? 'Máximo control sobre inventario y margen directo en consulta.' :
                  billingTarget === 'clinic' && deliveryTarget === 'patient' ? 'La clínica gana el margen mayorista sin manipular paquetes ni hacer envíos.' :
                  billingTarget === 'patient' && deliveryTarget === 'patient' ? 'Cero carga administrativa de cobros y cero costes de almacenamiento.' :
                  'El paciente paga su tratamiento y lo recibe el médico para su administración presencial.'
                )}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── VOLUME TIERS & FREE SHIPPING CALCULATOR ── */}
      <div className="supply-volume-section">
        <div className="matrix-header">
          <div className="matrix-shield">
            <Truck size={20} />
          </div>
          <div>
            <h3 className="section-heading">
              {isEn ? 'International Priority Cold Freight & Volume Shipping' : 'Condiciones de Transporte Internacional & Tarifa Plana'}
            </h3>
            <p className="section-subtext">
              {isEn
                ? 'Optimize international logistics costs by ordering lots of 10 or more vials.'
                : 'Optimiza los costes de transporte asegurando lotes de al menos 10 unidades.'}
            </p>
          </div>
        </div>

        <div className="volume-grid">
          <div className="volume-slider-card">
            <div className="vol-slider-header">
              <label>{isEn ? 'Number of Vials to Supply:' : 'Cantidad de Viales a Suministrar:'}</label>
              <span className="vol-vials-badge">{volumeVials} {isEn ? 'Vials' : 'Viales'}</span>
            </div>

            <input
              type="range"
              min="1"
              max="40"
              value={volumeVials}
              onChange={(e) => setVolumeVials(Number(e.target.value))}
              className="volume-slider"
            />

            <div className="vol-slider-markers">
              <span onClick={() => setVolumeVials(1)}>1 {isEn ? 'Vial' : 'Vial'}</span>
              <span onClick={() => setVolumeVials(5)}>5 {isEn ? 'Vials' : 'Viales'}</span>
              <span onClick={() => setVolumeVials(10)} className="vol-threshold">≥10 {isEn ? 'Vials (Free Shipping)' : 'Viales (Envío Gratis)'}</span>
              <span onClick={() => setVolumeVials(25)}>25 {isEn ? 'Vials' : 'Viales'}</span>
            </div>

            <div className="shipping-comparison-box">
              <div className="ship-row">
                <span>{isEn ? 'Standard Priority Air Cold-Chain Freight:' : 'Coste Estándar de Transporte Aéreo en Frío:'}</span>
                <strong>200 – 400 AED (approx. 50–100 EUR / $55–$110 USD)</strong>
              </div>
              <div className="ship-row">
                <span>{isEn ? `Applied Logistics Fee (${volumeVials} vials):` : `Tarifa Aplicada a tu Pedido (${volumeVials} viales):`}</span>
                <span className={`ship-badge ${isFreeShipping ? 'free-badge' : 'std-badge'}`}>
                  {isFreeShipping
                    ? (isEn ? 'FREE SHIPPING (0 AED · Save up to 400 AED)' : 'ENVÍO GRATUITO (0 AED · Ahorro de hasta 400 AED)')
                    : `${shippingFeeAED} AED (${isEn ? 'Standard Cold Freight' : 'Porte Estándar'})`}
                </span>
              </div>
            </div>
          </div>

          <div className="volume-cta-card">
            <div className="vol-cta-content">
              <span className="cta-kicker">{isEn ? 'Immediate Allocation' : 'Asignación Inmediata'}</span>
              <h4>
                {isEn
                  ? 'Ready to establish your clinic\'s peptide supply?'
                  : '¿Listo para establecer el suministro de tu clínica?'}
              </h4>
              <p>
                {isEn
                  ? 'Your dedicated Account Manager will provide complete in-stock inventory lists, verified analytical certificates, and customized B2B wholesale pricing.'
                  : 'Tu Account Manager personal te facilitará el listado completo de stock disponible, certificados de análisis y la plantilla de precios B2B.'}
              </p>
              
              <div className="vol-btn-group">
                <button 
                  type="button" 
                  className="btn-primary-supply"
                  onClick={onOpenInquiry}
                >
                  {isEn ? 'Request Account Manager' : 'Solicitar Account Manager'}
                </button>
                <button 
                  type="button" 
                  className="btn-wa-supply"
                  onClick={handleWhatsAppInquiry}
                >
                  <MessageCircle size={18} /> {isEn ? 'Direct WhatsApp' : 'WhatsApp Directo'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── FREQUENTLY ASKED QUESTIONS ── */}
      <div className="supply-faqs-section">
        <div className="matrix-header">
          <div className="matrix-shield">
            <HelpCircle size={20} />
          </div>
          <div>
            <h3 className="section-heading">
              {isEn
                ? 'Frequently Asked Questions on B2B Peptide Supply'
                : 'Preguntas Frecuentes sobre Suministro de Péptidos B2B'}
            </h3>
            <p className="section-subtext">
              {isEn
                ? 'Details regarding lot-locking, refrigerated express air transport, and accounting setup.'
                : 'Detalles sobre reservas de lotes, envíos refrigerados y gestión contable.'}
            </p>
          </div>
        </div>

        <div className="supply-faq-accordion">
          {faqs.map((faq, idx) => (
            <div 
              key={idx} 
              className={`supply-faq-item ${openFaqIndex === idx ? 'open' : ''}`}
            >
              <button 
                type="button" 
                className="supply-faq-trigger"
                onClick={() => toggleFaq(idx)}
              >
                <span>{faq.q}</span>
                <ChevronDown size={18} className="faq-chevron" />
              </button>
              {openFaqIndex === idx && (
                <div className="supply-faq-answer">
                  <p>{faq.a}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
