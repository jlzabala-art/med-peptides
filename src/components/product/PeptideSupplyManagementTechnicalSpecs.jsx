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

import React, { useState } from 'react';
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
  lang = 'es',
  onOpenInquiry
}) {
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
    const text = encodeURIComponent(
      `Hola, me interesa el servicio de Gestión de Suministro de Péptidos (Stock Inmediato con Account Manager).\n` +
      `• Facturación deseada: ${billingTarget === 'clinic' ? 'A la Clínica (Precio Mayorista B2B)' : 'Directa al Paciente (RRP)'}\n` +
      `• Destino de entrega: ${deliveryTarget === 'clinic' ? 'Recepción de la Clínica' : 'Dropship a Domicilio del Paciente'}\n` +
      `• Volumen mensual estimado: ${volumeVials} viales\n` +
      `Deseo que me asignen un Account Manager dedicado para reservar lotes y conocer tarifas.`
    );
    window.open(`https://wa.me/34693765765?text=${text}`, '_blank');
  };

  return (
    <div className="supply-specs-container">
      {/* ── TOP HERO BADGE & VALUE PROP ── */}
      <div className="supply-hero-card">
        <div className="supply-badge-row">
          <span className="sup-tag sup-tag-instant">
            <Zap size={14} /> Stock Inmediato · Sin Tiempos de Fabricación
          </span>
          <span className="sup-tag sup-tag-manager">
            <UserCheck size={14} /> Account Manager Dedicado Asignado
          </span>
          <span className="sup-tag sup-tag-dispatch">
            <Clock size={14} /> Despacho Express 24–48h
          </span>
          <span className="sup-tag sup-tag-cold">
            <ThermometerSnowflake size={14} /> Cadena de Frío Validada
          </span>
        </div>

        <h2 className="supply-title">
          Gestión Integral de Suministro de Péptidos & Concierge B2B
        </h2>
        <p className="supply-subtitle">
          Suministro directo para clínicas y centros médicos desde inventario liofilizado precertificado (HPLC ≥99%). Olvídate de los retrasos de fabricación: tu <strong>Account Manager personal</strong> gestiona la asignación de lotes, cotizaciones por volumen y coordina la entrega y facturación con total flexibilidad (a tu clínica o a tus pacientes).
        </p>

        {/* COMPARISON CARD: Compounding vs Direct Peptide Supply */}
        <div className="comparison-banner">
          <div className="comp-column compounding-col">
            <div className="col-header">
              <span className="col-type">Servicio de Compounding</span>
              <h4>Elaboración Magistral</h4>
            </div>
            <ul className="comp-features">
              <li>Requiere 5 a 7 días de formulación en laboratorio</li>
              <li>Adaptado a dosis milimétricas individualizadas</li>
              <li>Producción bajo pedido tras recepción de receta</li>
            </ul>
          </div>

          <div className="comp-vs-divider">VS</div>

          <div className="comp-column supply-col">
            <div className="col-header">
              <div className="recommended-badge"><Sparkles size={12} /> Stock en Tiempo Real</div>
              <span className="col-type">Gestión de Suministro</span>
              <h4>Suministro de Péptidos Inmediato</h4>
            </div>
            <ul className="comp-features">
              <li><strong>Cero esperas de fabricación:</strong> Despacho en 24–48 horas</li>
              <li><strong>Account Manager dedicado</strong> asignado a tu consulta</li>
              <li><strong>Reserva de lotes idénticos</strong> para ciclos largos de tratamiento</li>
              <li><strong>Facturación y envíos cruzados:</strong> Clínica o Paciente</li>
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
              <div className="am-status-dot" title="Disponible online" />
            </div>
            <div className="am-identity">
              <span className="am-role-tag">Soporte VIP B2B</span>
              <h4>Tu Account Manager Asignado</h4>
              <p className="am-desc">Un único interlocutor técnico y logístico para todas las necesidades de tu clínica.</p>
              <div className="am-channel-chips">
                <span><PhoneCall size={12} /> Línea Directa</span>
                <span><MessageCircle size={12} /> WhatsApp B2B</span>
                <span><ShieldCheck size={12} /> Acceso a COAs</span>
              </div>
            </div>
          </div>

          <div className="am-responsibilities">
            <h5 className="am-resp-title">¿Qué funciones asume tu Account Manager?</h5>
            <div className="am-resp-grid">
              <div className="am-resp-item">
                <div className="resp-icon"><Boxes size={18} /></div>
                <div>
                  <strong>Reserva y Bloqueo de Lotes (Lot-Locking)</strong>
                  <p>Reserva viales del mismo lote para asegurar que los pacientes de un protocolo de 3 a 6 meses reciban exactamente la misma síntesis.</p>
                </div>
              </div>

              <div className="am-resp-item">
                <div className="resp-icon"><CreditCard size={18} /></div>
                <div>
                  <strong>Precios por Volumen & Escalas B2B</strong>
                  <p>Aplica descuentos automáticos por tramos mayoristas y tramita pedidos combinados con condiciones preferentes.</p>
                </div>
              </div>

              <div className="am-resp-item">
                <div className="resp-icon"><Truck size={18} /></div>
                <div>
                  <strong>Logística Dividida (Split Shipments)</strong>
                  <p>¿Parte del pedido para el stock de la consulta y parte para el domicilio de pacientes concretos? Tu gestor lo coordina en un solo trámite.</p>
                </div>
              </div>

              <div className="am-resp-item">
                <div className="resp-icon"><ShieldCheck size={18} /></div>
                <div>
                  <strong>Auditoría de Certificados de Calidad</strong>
                  <p>Entrega inmediata de analíticas RP-HPLC y espectrometría de masas (MS) antes del despacho de cualquier lote.</p>
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
            <h3 className="section-heading">Matriz Interactiva de Gestión: ¿Quién Factura y Quién Recibe?</h3>
            <p className="section-subtext">Selecciona la combinación operativa deseada para ver el flujo exacto de fondos, márgenes y transporte.</p>
          </div>
        </div>

        {/* Matrix Controls */}
        <div className="matrix-selectors-bar">
          <div className="selector-block">
            <span className="selector-title">1. ¿A quién se emite la Factura?</span>
            <div className="selector-pills">
              <button
                type="button"
                className={`matrix-pill ${billingTarget === 'clinic' ? 'selected' : ''}`}
                onClick={() => setBillingTarget('clinic')}
              >
                <Building2 size={16} /> A la Clínica (Tarifa Mayorista)
              </button>
              <button
                type="button"
                className={`matrix-pill ${billingTarget === 'patient' ? 'selected' : ''}`}
                onClick={() => setBillingTarget('patient')}
              >
                <UserCheck size={16} /> Al Paciente Directamente (PVP / RRP)
              </button>
            </div>
          </div>

          <div className="selector-block">
            <span className="selector-title">2. ¿Dónde se realiza la Entrega en Frío?</span>
            <div className="selector-pills">
              <button
                type="button"
                className={`matrix-pill ${deliveryTarget === 'clinic' ? 'selected' : ''}`}
                onClick={() => setDeliveryTarget('clinic')}
              >
                <Building2 size={16} /> En la Clínica / Hospital
              </button>
              <button
                type="button"
                className={`matrix-pill ${deliveryTarget === 'patient' ? 'selected' : ''}`}
                onClick={() => setDeliveryTarget('patient')}
              >
                <PackageCheck size={16} /> En Domicilio del Paciente (Dropship)
              </button>
            </div>
          </div>
        </div>

        {/* Interactive Scenario Card */}
        <div className="scenario-display-card">
          <div className="scenario-banner">
            <span className="scenario-tag">
              Escenario Activo: Facturación a {billingTarget === 'clinic' ? 'Clínica' : 'Paciente'} + Entrega en {deliveryTarget === 'clinic' ? 'Clínica' : 'Paciente'}
            </span>
            <span className="scenario-model-badge">
              {billingTarget === 'clinic' && deliveryTarget === 'clinic' && 'Modelo 1: Stock Mayorista Tradicional'}
              {billingTarget === 'clinic' && deliveryTarget === 'patient' && 'Modelo 2: Dropshipping con Margen de Clínica'}
              {billingTarget === 'patient' && deliveryTarget === 'patient' && 'Modelo 3: Fulfillment Integral Delegado'}
              {billingTarget === 'patient' && deliveryTarget === 'clinic' && 'Modelo 4: Consignación para Tratamiento In-Situ'}
            </span>
          </div>

          <div className="scenario-flow-diagram">
            <div className="flow-step-box">
              <div className="flow-badge">Paso 1</div>
              <strong>Emisión de Factura</strong>
              <p>
                {billingTarget === 'clinic' 
                  ? 'Factura comercial a nombre de la clínica a precio mayorista (B2B Discount). La clínica retiene su margen de beneficio.' 
                  : 'Factura oficial enviada por correo al paciente con tarifa RRP recomendada y enlace de pago con tarjeta/SEPA.'}
              </p>
            </div>

            <div className="flow-step-arrow"><ArrowRight size={20} /></div>

            <div className="flow-step-box">
              <div className="flow-badge">Paso 2</div>
              <strong>Preparación & Despacho 24–48h</strong>
              <p>
                El <strong>Account Manager</strong> bloquea los viales requeridos del stock liofilizado, anexa los COAs de pureza (HPLC ≥99%) y valida el empaquetado térmico con registradores continuos.
              </p>
            </div>

            <div className="flow-step-arrow"><ArrowRight size={20} /></div>

            <div className="flow-step-box">
              <div className="flow-badge">Paso 3</div>
              <strong>Entrega en Destino</strong>
              <p>
                {deliveryTarget === 'clinic'
                  ? 'Recepción consolidada en la clínica o farmacia hospitalaria. Custodia inmediata en refrigeración 2°C–8°C.'
                  : 'Entrega puerta a puerta al domicilio del paciente en embalaje térmico de grado médico con precinto de seguridad.'}
              </p>
            </div>
          </div>

          <div className="scenario-benefits-bar">
            <div className="benefit-item">
              <CheckCircle2 size={16} className="text-emerald-500" />
              <span><strong>Ventaja Clave:</strong> {
                billingTarget === 'clinic' && deliveryTarget === 'clinic' ? 'Máximo control sobre inventario y margen directo en consulta.' :
                billingTarget === 'clinic' && deliveryTarget === 'patient' ? 'La clínica gana el margen mayorista sin manipular paquetes ni hacer envíos.' :
                billingTarget === 'patient' && deliveryTarget === 'patient' ? 'Cero carga administrativa de cobros y cero costes de almacenamiento.' :
                'El paciente paga su tratamiento y lo recibe el médico para su administración presencial.'
              }</span>
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
            <h3 className="section-heading">Condiciones de Transporte Internacional & Tarifa Plana</h3>
            <p className="section-subtext">Optimiza los costes de transporte asegurando lotes de al menos 10 unidades.</p>
          </div>
        </div>

        <div className="volume-grid">
          <div className="volume-slider-card">
            <div className="vol-slider-header">
              <label>Cantidad de Viales a Suministrar:</label>
              <span className="vol-vials-badge">{volumeVials} Viales</span>
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
              <span onClick={() => setVolumeVials(1)}>1 Vial</span>
              <span onClick={() => setVolumeVials(5)}>5 Viales</span>
              <span onClick={() => setVolumeVials(10)} className="vol-threshold">≥10 Viales (Envío Gratis)</span>
              <span onClick={() => setVolumeVials(25)}>25 Viales</span>
            </div>

            <div className="shipping-comparison-box">
              <div className="ship-row">
                <span>Coste Estándar de Transporte Aéreo en Frío:</span>
                <strong>200 a 400 AED (aprox. 50–100 EUR)</strong>
              </div>
              <div className="ship-row">
                <span>Tarifa Aplicada a tu Pedido ({volumeVials} viales):</span>
                <span className={`ship-badge ${isFreeShipping ? 'free-badge' : 'std-badge'}`}>
                  {isFreeShipping ? 'ENVÍO GRATUITO (0 AED · Ahorro de hasta 400 AED)' : `${shippingFeeAED} AED (Porte Estándar)`}
                </span>
              </div>
            </div>
          </div>

          <div className="volume-cta-card">
            <div className="vol-cta-content">
              <span className="cta-kicker">Asignación Inmediata</span>
              <h4>¿Listo para establecer el suministro de tu clínica?</h4>
              <p>Tu Account Manager personal te facilitará el listado completo de stock disponible, certificados de análisis y la plantilla de precios B2B.</p>
              
              <div className="vol-btn-group">
                <button 
                  type="button" 
                  className="btn-primary-supply"
                  onClick={onOpenInquiry}
                >
                  Solicitar Account Manager
                </button>
                <button 
                  type="button" 
                  className="btn-wa-supply"
                  onClick={handleWhatsAppInquiry}
                >
                  <MessageCircle size={18} /> WhatsApp Directo
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
            <h3 className="section-heading">Preguntas Frecuentes sobre Suministro de Péptidos B2B</h3>
            <p className="section-subtext">Detalles sobre reservas de lotes, envíos refrigerados y gestión contable.</p>
          </div>
        </div>

        <div className="supply-faq-accordion">
          {[
            {
              q: "¿Cuál es la diferencia entre el Suministro de Péptidos y el Compounding Farmacéutico?",
              a: "El Compounding Farmacéutico es una formulación magistral bajo receta médica que se elabora desde cero en laboratorio en Europa y requiere 5 a 7 días hábiles de fabricación. En cambio, la Gestión de Suministro de Péptidos recurre a stock liofilizado analíticamente certificado (HPLC ≥99%) listo para despacho inmediato en 24–48 horas, sin ningún retraso de producción."
            },
            {
              q: "¿Qué ventajas aporta tener un Account Manager asignado?",
              a: "El Account Manager es tu enlace directo y exclusivo. Se encarga de apartar lotes idénticos para pacientes con tratamientos de varios meses, tramita cotizaciones con descuentos de mayorista, coordina envíos divididos y supervisa el registro térmico de la carga durante el transporte aéreo."
            },
            {
              q: "¿Podemos cobrar nosotros al paciente pero pedir que el envío vaya a su casa?",
              a: "Sí, es uno de nuestros modelos más solicitados (Dropshipping Clínico). La factura se emite a tu clínica a precio mayorista B2B, tú facturas al paciente lo que estipule tu consulta, y nosotros despachamos el paquete refrigerado directamente a su domicilio con empaque médico discreto."
            },
            {
              q: "¿Y si preferimos que el paciente pague directamente su medicación?",
              a: "Simplemente indícanos los datos del paciente. Nosotros le emitimos la factura oficial con la tarifa recomendada (RRP), le enviamos el enlace de pago seguro y enviamos el pedido a su casa o a tu clínica para que se lo administres, liberando a tu equipo de tareas de facturación."
            },
            {
              q: "¿Cómo se garantiza que los péptidos no pierdan actividad biológica en tránsito?",
              a: "Todos los envíos se empaquetan en contenedores isotérmicos validados con acumuladores de frío de cambio de fase y sensores de temperatura continuos. Esto garantiza que la cadena de frío (2°C–8°C o -20°C según formulación) se mantenga ininterrumpida hasta la entrega final."
            }
          ].map((faq, idx) => (
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
