/**
 * src/components/product/CompoundingServicesTechnicalSpecs.jsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Comprehensive, highly graphical presentation of the European Pharmaceutical
 * Compounding & Custom Formulation Service.
 *
 * Features:
 * - 5-Step Visual Workflow Stepper (Request -> Invoice -> Payment -> Lab Prep -> Delivery)
 * - Dual Invoicing Selector (Clínica vs Paciente) with real-time margin breakdown
 * - Dual Destination Switcher (Envío a Clínica vs Dropship a Paciente)
 * - Volume Shipping Calculator (200-400 AED vs FREE on 10+ items)
 * - Dual Order Channel Cards (Mobile App vs kasia@mediluxeme.com Email Desk)
 * - Direct Consultation Drawer & WhatsApp CTAs
 * ─────────────────────────────────────────────────────────────────────────────
 */

'use client';

import React, { useState, useMemo } from 'react';
import {
  FlaskConical,
  FileText,
  CreditCard,
  Truck,
  CheckCircle2,
  Building2,
  UserCheck,
  ShieldCheck,
  Clock,
  Sparkles,
  Smartphone,
  Mail,
  ArrowRight,
  HelpCircle,
  ChevronDown,
  Layers,
  Calculator,
  ExternalLink,
  MessageCircle,
  ThermometerSnowflake,
  PackageCheck
} from 'lucide-react';
import './CompoundingServicesTechnicalSpecs.css';

export default function CompoundingServicesTechnicalSpecs({
  product,
  lang = 'es',
  onOpenInquiry
}) {
  // Interactive Controls
  const [payerMode, setPayerMode] = useState('clinic'); // 'clinic' | 'patient'
  const [shippingDest, setShippingDest] = useState('clinic'); // 'clinic' | 'patient'
  const [quantity, setQuantity] = useState(10); // units for shipping & margin demo
  const [activeStep, setActiveStep] = useState(1);
  const [openFaqIndex, setOpenFaqIndex] = useState(0);

  // Pricing calculations for simulator
  const unitWholesaleEUR = 85;
  const unitRrpEUR = 150;
  const eurToAed = 4.15;

  const isFreeShipping = quantity >= 10;
  const shippingFeeAED = isFreeShipping ? 0 : 350;
  const shippingFeeEUR = isFreeShipping ? 0 : Math.round(shippingFeeAED / eurToAed);

  const totalWholesaleEUR = unitWholesaleEUR * quantity;
  const totalRrpEUR = unitRrpEUR * quantity;
  const clinicGrossProfitEUR = totalRrpEUR - totalWholesaleEUR;

  const toggleFaq = (idx) => {
    setOpenFaqIndex(openFaqIndex === idx ? null : idx);
  };

  const handleWhatsAppInquiry = () => {
    const text = encodeURIComponent(
      `Hola, me interesa el servicio de Compounding Farmacéutico Europeo de Med-Peptides.\n` +
      `• Modelo de facturación: ${payerMode === 'clinic' ? 'Facturación a Clínica (Precio Mayorista)' : 'Facturación Directa a Paciente (RRP)'}\n` +
      `• Destino de entrega: ${shippingDest === 'clinic' ? 'Entrega en Clínica' : 'Dropship directo a Paciente'}\n` +
      `• Volumen estimado: ${quantity} unidades\n` +
      `Deseo coordinar el envío de prescripciones y catálogo disponible.`
    );
    window.open(`https://wa.me/34693765765?text=${text}`, '_blank');
  };

  return (
    <div className="compounding-specs-container">
      {/* ── TOP HERO BADGE & OVERVIEW ── */}
      <div className="compounding-hero-card">
        <div className="compounding-badge-row">
          <span className="comp-tag comp-tag-gmp">
            <ShieldCheck size={14} /> EU GMP & Ph. Eur. Certified
          </span>
          <span className="comp-tag comp-tag-cold">
            <ThermometerSnowflake size={14} /> European Cold-Chain (-20°C / 2-8°C)
          </span>
          <span className="comp-tag comp-tag-time">
            <Clock size={14} /> 5–7 Working Days Turnaround
          </span>
        </div>

        <h2 className="compounding-title">
          Compounding Farmacéutico Europeo & Fórmulas Magistrales
        </h2>
        <p className="compounding-subtitle">
          Fabricación personalizada de prescripciones médicas y péptidos formulados en farmacias de compounding autorizadas en la Unión Europea. Envío con control térmico certificado directo a tu clínica o al domicilio de tus pacientes.
        </p>

        {/* Dual Ordering Channels Banner */}
        <div className="compounding-channels-grid">
          <div className="channel-card">
            <div className="channel-icon-wrap channel-app">
              <Smartphone size={22} />
            </div>
            <div className="channel-content">
              <h4>Vía Nuestra Aplicación Móvil</h4>
              <p>Selecciona fórmulas de nuestro catálogo, adjunta la prescripción médica del paciente y supervisa el estado de elaboración en tiempo real.</p>
              <button 
                type="button" 
                className="channel-btn"
                onClick={onOpenInquiry}
              >
                Solicitar Acceso a la App <ArrowRight size={14} />
              </button>
            </div>
          </div>

          <div className="channel-card">
            <div className="channel-icon-wrap channel-email">
              <Mail size={22} />
            </div>
            <div className="channel-content">
              <h4>Vía Email al Despacho Clínico</h4>
              <p>Envía las recetas directamente a nuestro equipo de farmacéuticos a través de <strong>kasia@mediluxeme.com</strong> o <strong>business@med-peptides.com</strong>.</p>
              <a 
                href="mailto:kasia@mediluxeme.com?subject=Solicitud%20de%20Compounding%20Farmaceutico%20-%20Prescripcion" 
                className="channel-link"
              >
                Enviar Prescripción por Email <ExternalLink size={14} />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* ── INTERACTIVE 5-STEP WORKFLOW FLOWCHART ── */}
      <div className="compounding-stepper-section">
        <div className="stepper-header">
          <div className="stepper-shield">
            <Layers size={20} />
          </div>
          <div>
            <h3 className="section-heading">Workflow de Elaboración y Cumplimiento Paso a Paso</h3>
            <p className="section-subtext">Haz clic en cada etapa para visualizar los requisitos regulatorios, tiempos y detalles operativos.</p>
          </div>
        </div>

        <div className="flow-steps-container">
          <div 
            className={`flow-step-node ${activeStep === 1 ? 'active' : ''}`}
            onClick={() => setActiveStep(1)}
          >
            <div className="step-number-badge">1</div>
            <div className="step-node-icon"><FileText size={18} /></div>
            <div className="step-node-label">Envío de Receta</div>
            <div className="step-node-hint">App o Email</div>
          </div>

          <div className="flow-connector" />

          <div 
            className={`flow-step-node ${activeStep === 2 ? 'active' : ''}`}
            onClick={() => setActiveStep(2)}
          >
            <div className="step-number-badge">2</div>
            <div className="step-node-icon"><Calculator size={18} /></div>
            <div className="step-node-label">Cotización y Factura</div>
            <div className="step-node-hint">Clínica o Paciente</div>
          </div>

          <div className="flow-connector" />

          <div 
            className={`flow-step-node ${activeStep === 3 ? 'active' : ''}`}
            onClick={() => setActiveStep(3)}
          >
            <div className="step-number-badge">3</div>
            <div className="step-node-icon"><CreditCard size={18} /></div>
            <div className="step-node-label">Pago Seguro</div>
            <div className="step-node-hint">SEPA / Link Tarjeta</div>
          </div>

          <div className="flow-connector" />

          <div 
            className={`flow-step-node ${activeStep === 4 ? 'active' : ''}`}
            onClick={() => setActiveStep(4)}
          >
            <div className="step-number-badge">4</div>
            <div className="step-node-icon"><FlaskConical size={18} /></div>
            <div className="step-node-label">Fabricación EU</div>
            <div className="step-node-hint">5–7 Días Laborables</div>
          </div>

          <div className="flow-connector" />

          <div 
            className={`flow-step-node ${activeStep === 5 ? 'active' : ''}`}
            onClick={() => setActiveStep(5)}
          >
            <div className="step-number-badge">5</div>
            <div className="step-node-icon"><Truck size={18} /></div>
            <div className="step-node-label">Logística en Frío</div>
            <div className="step-node-hint">Clínica o Paciente</div>
          </div>
        </div>

        {/* Dynamic Detail Card based on activeStep */}
        <div className="step-detail-card">
          {activeStep === 1 && (
            <div className="step-detail-content">
              <div className="step-detail-tag">Etapa 1 · Solicitud & Prescripción</div>
              <h4>Recepción de la Prescripción Médica</h4>
              <p>
                El médico tratante remite la prescripción con dosificación, volumen y concentración deseada. Se puede efectuar cómodamente mediante la <strong>Aplicación Móvil</strong> dedicada o enviando un correo a <strong>kasia@mediluxeme.com</strong> con copia a <strong>business@med-peptides.com</strong>.
              </p>
              <ul className="step-bullets">
                <li><CheckCircle2 size={16} /> Aceptación de recetas clínicas con firma médica colegiada.</li>
                <li><CheckCircle2 size={16} /> Verificación de compatibilidad galénica y estabilidad por el farmacéutico responsable en Europa.</li>
                <li><CheckCircle2 size={16} /> Asignación de código único de seguimiento clínico.</li>
              </ul>
            </div>
          )}

          {activeStep === 2 && (
            <div className="step-detail-content">
              <div className="step-detail-tag">Etapa 2 · Estructuración Comercial</div>
              <h4>Emisión de Factura con Modalidad Flexible</h4>
              <p>
                El importador genera una cotización formal y emite la factura proforma adaptada al modelo operativo de tu consulta:
              </p>
              <div className="step-split-box">
                <div className="split-option">
                  <div className="split-badge">Modalidad A · Pago por Clínica</div>
                  <strong>Tarifa Profesional / Mayorista (Clinical Price)</strong>
                  <p>La clínica abona directamente con descuento profesional, permitiéndole facturar al paciente con su propio margen de beneficio.</p>
                </div>
                <div className="split-option">
                  <div className="split-badge">Modalidad B · Pago por Paciente</div>
                  <strong>Tarifa Recomendada al Paciente (RRP)</strong>
                  <p>El paciente abona directamente al importador mediante link de pago seguro. Cero riesgo de cobro o gestión administrativa para la clínica.</p>
                </div>
              </div>
            </div>
          )}

          {activeStep === 3 && (
            <div className="step-detail-content">
              <div className="step-detail-tag">Etapa 3 · Liquidación y Divisas</div>
              <h4>Pasarelas de Pago Europeas y Conversión Transparente</h4>
              <p>
                Todos los presupuestos se liquidan en Euros (€), aplicando la tasa de cambio oficial a Dirhams de los EAU (AED) vigente en la fecha de emisión de la factura.
              </p>
              <ul className="step-bullets">
                <li><CheckCircle2 size={16} /> <strong>Transferencia Bancaria Europea (SEPA / IBAN)</strong> directa a la cuenta del Importador en la UE.</li>
                <li><CheckCircle2 size={16} /> <strong>Link de Pago Seguro por Email</strong> con soporte para tarjetas de crédito/débito internacionales sin fricción.</li>
                <li><CheckCircle2 size={16} /> Confirmación automática que activa inmediatamente el pase a producción en sala blanca.</li>
              </ul>
            </div>
          )}

          {activeStep === 4 && (
            <div className="step-detail-content">
              <div className="step-detail-tag">Etapa 4 · Fabricación & Control</div>
              <h4>Elaboración en Farmacia de Compounding Europea Certificada</h4>
              <p>
                Una vez confirmado el pago, se inicia la preparación en campana de flujo laminar y salas blancas certificadas bajo normativa Good Manufacturing Practice (GMP) y Real Farmacopea Europea.
              </p>
              <ul className="step-bullets">
                <li><CheckCircle2 size={16} /> Tiempo estimado de formulación, cuarentena analítica y liberación: <strong>5 a 7 días hábiles</strong>.</li>
                <li><CheckCircle2 size={16} /> Certificado de Análisis (CoA) lote por lote con ensayo de esterilidad y endotoxinas bacterianas.</li>
                <li><CheckCircle2 size={16} /> Etiquetado bilingüe con número de lote, fecha de caducidad y datos de prescripción.</li>
              </ul>
            </div>
          )}

          {activeStep === 5 && (
            <div className="step-detail-content">
              <div className="step-detail-tag">Etapa 5 · Cadena de Frío & Logística</div>
              <h4>Distribución Internacional Directa (Clínica o Paciente)</h4>
              <p>
                El importador coordina el transporte aéreo con acumuladores de frío calibrados (-20°C o 2°C–8°C según estabilidad de la molécula) y registro continuo de temperatura hasta el destino.
              </p>
              <ul className="step-bullets">
                <li><CheckCircle2 size={16} /> <strong>Tarifa Estándar de Envío:</strong> 200 a 400 AED (aprox. 50–100 EUR / 55–110 USD).</li>
                <li><CheckCircle2 size={16} /> <strong>Envío Gratuito (Free Shipping):</strong> En todos los pedidos de 10 o más productos.</li>
                <li><CheckCircle2 size={16} /> Despacho directo a la recepción de la clínica o entrega puerta a puerta al paciente.</li>
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* ── INTERACTIVE INVOICING & SHIPPING SIMULATOR ── */}
      <div className="compounding-simulator-section">
        <div className="stepper-header">
          <div className="stepper-shield">
            <Calculator size={20} />
          </div>
          <div>
            <h3 className="section-heading">Simulador Interactivo de Facturación, Margen y Envío</h3>
            <p className="section-subtext">Comprueba cómo cambian las tarifas, los portes y los beneficios según la modalidad de pago y el volumen.</p>
          </div>
        </div>

        <div className="sim-interactive-grid">
          {/* Left: Toggles & Inputs */}
          <div className="sim-controls-panel">
            <div className="sim-control-group">
              <label className="sim-label">1. ¿Quién realiza el pago de la prescripción?</label>
              <div className="toggle-pill-row">
                <button
                  type="button"
                  className={`toggle-pill ${payerMode === 'clinic' ? 'active' : ''}`}
                  onClick={() => setPayerMode('clinic')}
                >
                  <Building2 size={16} /> Factura a Clínica (Tarifa Mayorista)
                </button>
                <button
                  type="button"
                  className={`toggle-pill ${payerMode === 'patient' ? 'active' : ''}`}
                  onClick={() => setPayerMode('patient')}
                >
                  <UserCheck size={16} /> Factura a Paciente (Tarifa RRP)
                </button>
              </div>
            </div>

            <div className="sim-control-group">
              <label className="sim-label">2. ¿Dónde se entrega la medicación?</label>
              <div className="toggle-pill-row">
                <button
                  type="button"
                  className={`toggle-pill ${shippingDest === 'clinic' ? 'active' : ''}`}
                  onClick={() => setShippingDest('clinic')}
                >
                  <Building2 size={16} /> Recepción de la Clínica
                </button>
                <button
                  type="button"
                  className={`toggle-pill ${shippingDest === 'patient' ? 'active' : ''}`}
                  onClick={() => setShippingDest('patient')}
                >
                  <PackageCheck size={16} /> Domicilio del Paciente (Dropship)
                </button>
              </div>
            </div>

            <div className="sim-control-group">
              <div className="slider-label-row">
                <label className="sim-label">3. Cantidad de Unidades en el Pedido:</label>
                <span className="slider-value-badge">{quantity} Viales / Fórmulas</span>
              </div>
              <input
                type="range"
                min="1"
                max="30"
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                className="sim-slider"
              />
              <div className="slider-markers">
                <span onClick={() => setQuantity(1)}>1 Unidad</span>
                <span onClick={() => setQuantity(5)}>5 Uds</span>
                <span onClick={() => setQuantity(10)} className="marker-highlight">10 Uds (Envío Gratis)</span>
                <span onClick={() => setQuantity(25)}>25 Uds</span>
              </div>
            </div>
          </div>

          {/* Right: Real-Time Results Matrix Card */}
          <div className="sim-result-card">
            <div className="result-header">
              <span className="result-mode-badge">
                {payerMode === 'clinic' ? 'Facturación B2B · Cuenta Clínica' : 'Facturación Directa B2C · Paciente'}
              </span>
              <span className={`shipping-status-badge ${isFreeShipping ? 'free' : 'standard'}`}>
                {isFreeShipping ? 'Envío Gratis Aplicado ✓' : 'Porte Estándar (200-400 AED)'}
              </span>
            </div>

            <div className="result-metric-row">
              <div className="result-metric">
                <span className="metric-title">Precio Unitario Aplicado</span>
                <span className="metric-val">
                  {payerMode === 'clinic' ? `€${unitWholesaleEUR} EUR` : `€${unitRrpEUR} EUR`}
                </span>
                <span className="metric-hint">
                  {payerMode === 'clinic' ? `≈ ${(unitWholesaleEUR * eurToAed).toFixed(0)} AED (Clinical Rate)` : `≈ ${(unitRrpEUR * eurToAed).toFixed(0)} AED (Patient RRP)`}
                </span>
              </div>

              <div className="result-metric">
                <span className="metric-title">Gastos de Envío Internacional</span>
                <span className={`metric-val ${isFreeShipping ? 'green' : ''}`}>
                  {isFreeShipping ? 'GRATIS (0 AED)' : `${shippingFeeAED} AED (€${shippingFeeEUR})`}
                </span>
                <span className="metric-hint">
                  {isFreeShipping ? 'Cumple umbral de ≥10 unidades' : 'Añade ' + (10 - quantity) + ' unidades más para envío gratis'}
                </span>
              </div>
            </div>

            <div className="result-summary-box">
              <div className="summary-line">
                <span>Subtotal Fórmulas ({quantity} uds):</span>
                <strong>
                  {payerMode === 'clinic' 
                    ? `€${totalWholesaleEUR.toLocaleString()} EUR (${(totalWholesaleEUR * eurToAed).toFixed(0)} AED)`
                    : `€${totalRrpEUR.toLocaleString()} EUR (${(totalRrpEUR * eurToAed).toFixed(0)} AED)`}
                </strong>
              </div>
              <div className="summary-line">
                <span>Transporte en Frío (Europa → {shippingDest === 'clinic' ? 'Clínica' : 'Paciente'}):</span>
                <span className={isFreeShipping ? 'free-text' : ''}>
                  {isFreeShipping ? 'Gratuito (Ahorro 350 AED)' : `${shippingFeeAED} AED (€${shippingFeeEUR})`}
                </span>
              </div>

              {payerMode === 'clinic' && (
                <div className="clinic-margin-highlight">
                  <div className="margin-title">Margen Bruto Potencial para la Clínica:</div>
                  <div className="margin-amount">
                    +€{clinicGrossProfitEUR.toLocaleString()} EUR 
                    <span className="margin-aed"> (+{(clinicGrossProfitEUR * eurToAed).toFixed(0)} AED)</span>
                  </div>
                  <div className="margin-note">Basado en la aplicación de la tarifa RRP oficial a tus pacientes.</div>
                </div>
              )}

              {payerMode === 'patient' && (
                <div className="patient-mode-highlight">
                  <UserCheck size={18} />
                  <div>
                    <strong>Cero Gestión de Cobros:</strong> El paciente recibe un enlace de pago seguro en su email/SMS y la medicación viaja directamente a su domicilio bajo frío controlado.
                  </div>
                </div>
              )}
            </div>

            <div className="sim-cta-row">
              <button 
                type="button" 
                className="sim-cta-primary"
                onClick={onOpenInquiry}
              >
                Solicitar Cotización de Compounding
              </button>
              <button 
                type="button" 
                className="sim-cta-whatsapp"
                onClick={handleWhatsAppInquiry}
              >
                <MessageCircle size={18} /> WhatsApp Clínico
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── FREQUENTLY ASKED QUESTIONS ACCORDION ── */}
      <div className="compounding-faqs-section">
        <div className="stepper-header">
          <div className="stepper-shield">
            <HelpCircle size={20} />
          </div>
          <div>
            <h3 className="section-heading">Preguntas Frecuentes sobre Compounding Farmacéutico</h3>
            <p className="section-subtext">Condiciones legales, tiempos de conservación y detalles de importación en Europa y GCC.</p>
          </div>
        </div>

        <div className="comp-faq-accordion">
          {[
            {
              q: "¿Cómo enviamos las solicitudes o prescripciones para compounding?",
              a: "Se ofrecen dos métodos ágiles: a través de nuestra Aplicación Móvil dedicada (donde puedes seleccionar productos del catálogo y subir recetas) o enviando un email especificando moléculas, concentraciones y recetas a kasia@mediluxeme.com y business@med-peptides.com."
            },
            {
              q: "¿Cómo funciona la facturación si paga la clínica o si paga el paciente?",
              a: "Si el pago lo asume la clínica, se aplica el precio clínico / mayorista con descuento B2B, permitiendo a la consulta retener el margen comercial. Si se solicita que el paciente pague directamente su medicación, emitimos la factura con la tarifa recomendada al paciente (RRP) y le enviamos un enlace de pago seguro."
            },
            {
              q: "¿Se pueden enviar los paquetes directamente a la dirección del paciente?",
              a: "Sí. El importador coordina la logística completa desde la farmacia de compounding en Europa hasta el destino final, ya sea la recepción de la clínica médica o el domicilio particular del paciente con embalaje isotérmico discreto."
            },
            {
              q: "¿Cuáles son los costes de transporte y plazos de entrega?",
              a: "El coste habitual de envío oscila entre 200 y 400 AED (aprox. 50–100 EUR o 55–110 USD). En pedidos de 10 o más productos, el envío internacional con frío es completamente GRATUITO. El plazo total (fabricación, documentación y entrega) es de 5 a 7 días laborables."
            },
            {
              q: "¿En qué moneda y cómo se efectúan los pagos?",
              a: "Los pagos pueden realizarse por transferencia bancaria a la cuenta europea del Importador (SEPA/IBAN) o a través de pasarela de pago seguro mediante enlace por correo. Las facturas se cotizan en Euros y se convierten a AED conforme a la cotización oficial del día de emisión."
            }
          ].map((faq, idx) => (
            <div 
              key={idx} 
              className={`comp-faq-item ${openFaqIndex === idx ? 'open' : ''}`}
            >
              <button 
                type="button" 
                className="comp-faq-trigger"
                onClick={() => toggleFaq(idx)}
              >
                <span>{faq.q}</span>
                <ChevronDown size={18} className="faq-chevron" />
              </button>
              {openFaqIndex === idx && (
                <div className="comp-faq-answer">
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
