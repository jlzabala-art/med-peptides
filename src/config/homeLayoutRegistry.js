 
import { lazy } from 'react';

// Shared Components
import TrustStrip from '../sections/TrustStrip';

// Guest Components
import GuestHeroSearch from '../sections/GuestHeroSearch';
import QuickDiscovery from '../sections/QuickDiscovery';
import FeaturedCategories from '../sections/FeaturedCategories';
import StepByStepGuide from '../sections/StepByStepGuide';
import UserSegmentEntry from '../sections/UserSegmentEntry';
import MobileQuickNav from '../sections/MobileQuickNav';
import ProfessionalUpgradeCTA from '../sections/ProfessionalUpgradeCTA';
import GuestIntroTeaser from '../sections/GuestIntroTeaser';

// Phase 2–8 New Sections
import GuestModeBanner from '../sections/GuestModeBanner';
import WhyChooseMedPeptides from '../sections/WhyChooseMedPeptides';
import PeptideIntroEducation from '../sections/PeptideIntroEducation';
import PriceTransparency from '../sections/PriceTransparency';
import HowItWorks from '../sections/HowItWorks';
import EmotionalTrust from '../sections/EmotionalTrust';
// import FloatingProCTA from '../sections/FloatingProCTA'; // Disabled floating CTA
import GoalLifestyleStrip from '../sections/GoalLifestyleStrip';
const KeyPeptides = lazy(() => import('../sections/KeyPeptides'));
import ClinicalAIPromo from '../sections/ClinicalAIPromo';
import KnowledgeHubShowcase from '../sections/KnowledgeHubShowcase';

// Rules 5.0 — Phase additions
import BeginnerCollections from '../sections/BeginnerCollections';
import NotSureWhereToStart from '../sections/NotSureWhereToStart';
import ProtocolPreviewCards from '../sections/ProtocolPreviewCards';
import GuidedSearchHints from '../sections/GuidedSearchHints';
import GoalEntryFlow from '../sections/GoalEntryFlow';
import RecentlyExplored from '../sections/RecentlyExplored';
import EternaDiagnosticsShowcase from '../sections/EternaDiagnosticsShowcase';
const LatestArticles = lazy(() => import('../sections/LatestArticles'));

// Guest Intelligence — preferences, newsletter
import ResearchIntakeCTA from '../components/shared/ResearchIntakeCTA';
import GuestWelcomeBack from '../sections/GuestWelcomeBack';
import HealthNewsletterSection from '../sections/HealthNewsletterSection';

// Professional Components
import Hero from '../sections/Hero';
import PowerSearch from '../sections/PowerSearch';
import DiscoveryHub from '../sections/DiscoveryHub';
import TrustHub from '../sections/TrustHub';
import ExpertAccessStrip from '../sections/ExpertAccessStrip';
import TrendingPeptides from '../sections/TrendingPeptides';
import TrendingProtocols from '../sections/TrendingProtocols';
import NovelAcquisitions from '../sections/NovelAcquisitions';
import PathwayNavigation from '../sections/PathwayNavigation';
import ProtocolHighlight from '../sections/ProtocolHighlight';
import InstitutionalSolutions from '../sections/InstitutionalSolutions';
import ProfessionalDashboard from '../sections/ProfessionalDashboard';
import GlobalLogistics from '../sections/GlobalLogistics';
import PlatformCapabilitiesPro from '../sections/PlatformCapabilitiesPro';
import ContactCTA from '../sections/ContactCTA';

/**
 * MASTER REGISTRY OF HOME SECTIONS
 * ─────────────────────────────────────────────────────────────────────────────
 * Single source of truth for all sections available on the homepage.
 *
 * Fields per entry:
 *   id                 – unique string key (must match Firestore layout id)
 *   label              – human-readable name shown in Admin UI
 *   description        – short description shown in Admin UI
 *   component          – React component to render
 *   category           – 'guest' | 'professional' | 'shared'
 *   defaultEnabled     – whether new installs show this section
 *   defaultOrder       – render position on first sync (0-based)
 *   defaultVisibility  – 'all' | 'desktop' | 'mobile'
 *   isLazy             – true if component is React.lazy()
 *   defaultProps       – static props forwarded to the component
 */
export const HOME_SECTIONS = {

  // ── GUEST SECTIONS ──────────────────────────────────────────────────────────

  GuestHeroSearch: {
    id: 'GuestHeroSearch',
    label: '🔍 Hero — Buscador Principal',
    description: 'Sección hero con buscador y imagen de fondo. Primera sección visible para visitantes.',

    component: GuestHeroSearch,
    category: 'guest',
    defaultEnabled: true,
    defaultOrder: 0,
    defaultVisibility: 'all',
    defaultProps: {},
    withTransition: true,
  },
  GoalLifestyleStrip: {
    id: 'GoalLifestyleStrip',
    label: '🏃 Banda de Objetivos de Salud',
    description: 'Tira animada con objetivos de bienestar (longevidad, rendimiento, sueño…). Se desplaza automáticamente.',

    component: GoalLifestyleStrip,
    category: 'shared',
    defaultEnabled: true,
    defaultOrder: 1.5,         // Rules 5.0 — after GuidedSearchHints (discovery first)
    defaultVisibility: 'all',
  },
  GuestIntroTeaser: {
    id: 'GuestIntroTeaser',
    label: '💡 Banner Educativo — ¿Qué son los Péptidos?',
    description: 'Banner informativo descartable que enlaza a la guía de introducción a péptidos. Solo visible para visitantes.',

    component: GuestIntroTeaser,
    category: 'guest',
    defaultEnabled: true,
    defaultOrder: 2.5,         // Rules 5.0 — Guidance zone: before GoalEntryFlow
    defaultVisibility: 'all',
    sectionClass: 'git-root',
  },
  TrustStrip: {
    id: 'TrustStrip',
    label: '🛡️ Banda de Confianza y Certificaciones',
    description: 'Muestra badges de verificación, pureza y certificaciones del laboratorio.',

    component: TrustStrip,
    category: 'shared',
    defaultEnabled: false,     // Phase 5-A: now inside TrustHub (Certifications tab)
    defaultOrder: 6.5,
    defaultVisibility: 'all',
  },
  ClinicalAIPromo: {
    id: 'ClinicalAIPromo',
    label: '🤖 Promoción — Asistente IA Clínico',
    description: 'Banner destacado que promociona el Asistente IA Clínico. Visible para todos los usuarios.',

    component: ClinicalAIPromo,
    category: 'shared',
    defaultEnabled: true,           // Conversion 5.0 — high-value CTA enabled
    defaultOrder: 6.2,             // After KeyPeptides (5), before EternaDX (5.5) — max attention zone
    defaultVisibility: 'all',
  },
  KnowledgeHubShowcase: {
    id: 'KnowledgeHubShowcase',
    label: '📚 Hub de Conocimiento — Péptidos & Suplementos',
    description: 'Muestra los dos pilares de contenido: catálogo de péptidos y suplementos con acceso rápido.',

    component: KnowledgeHubShowcase,
    category: 'shared',
    defaultEnabled: false,
    defaultOrder: 1.2,
    defaultVisibility: 'all',
  },
  QuickDiscovery: {
    id: 'QuickDiscovery',
    label: '⚡ Descubrimiento Rápido por Categoría',
    description: 'Grid de accesos directos a las categorías más populares (recuperación, cognitivo, hormonal…).',

    component: QuickDiscovery,
    category: 'guest',
    defaultEnabled: false,
    defaultOrder: 3,
    defaultVisibility: 'all',
  },
  // FeaturedCategories removed as per user request to use marquee instead
  StepByStepGuide: {
    id: 'StepByStepGuide',
    label: '📋 Guía Paso a Paso — Cómo Empezar',
    description: 'Tutorial visual para nuevos investigadores: cómo explorar, elegir y usar los péptidos.',

    component: StepByStepGuide,
    category: 'guest',
    defaultEnabled: false,
    defaultOrder: 6,
    defaultVisibility: 'all',
  },
  UserSegmentEntry: {
    id: 'UserSegmentEntry',
    label: '🔀 Selector de Perfil — Visitante vs. Profesional',
    description: 'CTA que dirige al usuario hacia el registro profesional o la exploración como invitado.',

    component: UserSegmentEntry,
    category: 'guest',
    defaultEnabled: true,
    defaultOrder: 8,           // Phase 2 — Advanced/Institutional zone
    defaultVisibility: 'all',
  },
  KeyPeptides: {
    id: 'KeyPeptides',
    label: '💊 Escaparate de Péptidos Destacados',
    description: 'Carrusel horizontal con los péptidos más importantes del catálogo.',

    component: KeyPeptides,
    category: 'guest',
    defaultEnabled: true,
    defaultOrder: 5,           // Phase 2 — Exploration zone (unchanged)
    defaultVisibility: 'all',
    isLazy: true,
    sectionClass: 'kp-section',
    withTransition: true,
  },
  EternaDiagnosticsShowcase: {
    id: 'EternaDiagnosticsShowcase',
    label: '🧬 Escaparate ETERNA® Diagnostics (Longevidad)',
    description: 'Sección premium interactiva que presenta los servicios de Eterna DX y permite añadir la plataforma al carrito.',
    component: EternaDiagnosticsShowcase,
    category: 'guest',
    defaultEnabled: true,
    defaultOrder: 5.5,
    defaultVisibility: 'all',
    withTransition: true,
  },
  MobileQuickNav: {
    id: 'MobileQuickNav',
    label: '📱 Navegación Rápida Móvil (barra inferior)',
    description: 'Barra de navegación fija en la parte inferior para usuarios de móvil. Solo visible en pantallas pequeñas.',

    component: MobileQuickNav,
    category: 'guest',
    defaultEnabled: false,
    defaultOrder: 99,
    defaultVisibility: 'mobile',
  },
  ProfessionalUpgradeCTA: {
    id: 'ProfessionalUpgradeCTA',
    label: '⭐ CTA — Regístrate como Profesional',
    description: 'Banners que invitan al visitante a solicitar acceso profesional para precios y funciones avanzadas.',

    component: ProfessionalUpgradeCTA,
    category: 'guest',
    defaultEnabled: true,
    defaultOrder: 9,           // Conversion 5.0 — hard CTA above newsletter
    defaultVisibility: 'all',
  },
  LatestArticles: {
    id: 'LatestArticles',
    label: '📰 Artículos Recientes',
    description: 'Muestra los 2 últimos artículos publicados en el blog con enlace para ver todos.',
    component: LatestArticles,
    category: 'guest',
    defaultEnabled: true,
    defaultOrder: 8.5,
    defaultVisibility: 'all',
    isLazy: true,
  },


  // ── PHASE 2–8 NEW SECTIONS ────────────────────────────────────────────────────

  GuestModeBanner: {
    id: 'GuestModeBanner',
    label: '👤 Indicador de Modo Visitante',
    description: 'Píldora/banner que muestra que el usuario navega como invitado, con CTA para desbloquear acceso completo.',
    component: GuestModeBanner,
    category: 'guest',
    defaultEnabled: true,
    defaultOrder: 0.5,
    defaultVisibility: 'all',
  },
  WhyChooseMedPeptides: {
    id: 'WhyChooseMedPeptides',
    label: '✅ ¿Por qué elegir Med-Peptides?',
    description: 'Lista con iconos sobre los pilares de confianza: pureza, trazabilidad y soporte científico.',
    component: WhyChooseMedPeptides,
    category: 'shared',
    defaultEnabled: true,
    defaultOrder: 7,           // Phase 5 — Trust layer: consolidated after exploration (KeyPeptides→ProtocolPreview→…→Trust)
    defaultVisibility: 'all',
    variant: 'dark',
  },
  PeptideIntroEducation: {
    id: 'PeptideIntroEducation',
    label: '🌱 Introducción a los Péptidos — Empieza Aquí',
    description: 'Sección educativa para principiantes: qué son, cómo reconstituir y protocolos básicos.',
    component: PeptideIntroEducation,
    category: 'guest',
    defaultEnabled: false,     // Phase 2 — disabled; content now spread across other sections
    defaultOrder: 2.5,
    defaultVisibility: 'all',
  },
  PriceTransparency: {
    id: 'PriceTransparency',
    label: '💰 Transparencia de Precios y Niveles de Servicio',
    description: 'Explica la diferencia entre acceso visitante y profesional sin mencionar descuentos directos.',
    component: PriceTransparency,
    category: 'guest',
    defaultEnabled: false,     // Phase 2 — disabled; reduces noise in discovery flow
    defaultOrder: 4.5,
    defaultVisibility: 'all',
  },
  HowItWorks: {
    id: 'HowItWorks',
    label: '🔄 Cómo Funciona Med-Peptides (4 pasos)',
    description: 'Línea de tiempo visual: Aprende → Elige → Calcula → Sigue el protocolo.',
    component: HowItWorks,
    category: 'shared',
    defaultEnabled: true,
    defaultOrder: 7.5,         // Phase 5 — Trust layer: immediately after WhyChooseMedPeptides (7), before UserSegmentEntry (8)
    defaultVisibility: 'all',
    variant: 'dark',
  },
  EmotionalTrust: {
    id: 'EmotionalTrust',
    label: '💬 Testimonios y Confianza Visual',
    description: 'Sección con testimonios reales y gradiente visual que refuerza la confianza en la plataforma.',
    component: EmotionalTrust,
    category: 'shared',
    defaultEnabled: false,     // Phase 5-A: now inside TrustHub (Testimonials tab)
    defaultOrder: 7.5,
    defaultVisibility: 'all',
  },
  // ── RULES 5.0 PHASES ─────────────────────────────────────────────────────

  BeginnerCollections: {
    id: 'BeginnerCollections',
    label: '🧪 Colecciones para Principiantes (Fase 2)',
    description: 'Colecciones curadas con 3–5 péptidos y lenguaje explicativo WHY para investigadores nuevos. Reduce la sobrecarga del catálogo.',
    component: BeginnerCollections,
    category: 'guest',
    defaultEnabled: true,
    defaultOrder: 4,           // Rules 5.0 — Protocol zone: after GoalEntryFlow
    defaultVisibility: 'all',
  },
  NotSureWhereToStart: {
    id: 'NotSureWhereToStart',
    label: '🤔 ¿No sabes por dónde empezar? (Fase 10)',
    description: 'CTA tranquilizadora que conecta con ClinicalAI para guía personalizada.',
    component: NotSureWhereToStart,
    category: 'guest',
    defaultEnabled: false,
    defaultOrder: 5.5,
    defaultVisibility: 'all',
  },
  GuidedSearchHints: {
    id: 'GuidedSearchHints',
    label: '🔍 Búsqueda Guiada por Objetivo (Fase 14)',
    description: 'Sugerencias contextuales por objetivo de salud — desactivado: la sección hero ya cubre este rol de forma más visual.',
    component: GuidedSearchHints,
    category: 'shared',
    defaultEnabled: false,     // Disabled — hero covers discovery more visually
    defaultOrder: 1,           // Rules 5.0 — Discovery zone: first layer below hero
    defaultVisibility: 'all',
  },
  GoalEntryFlow: {
    id: 'GoalEntryFlow',
    label: '🎯 Flujo de Entrada por Objetivo (Fase 1)',
    description: 'Selección de objetivo de investigación. Conecta directamente al Asistente IA según el goal elegido.',
    component: GoalEntryFlow,
    category: 'guest',
    defaultEnabled: false,     // Disabled — hero goal cards cover this more visually
    defaultOrder: 3,           // Rules 5.0 — Goal zone: after GuestIntroTeaser, before BeginnerCollections
    defaultVisibility: 'all',
  },
  RecentlyExplored: {
    id: 'RecentlyExplored',
    label: '🕐 Explorado Recientemente (Fase 4)',
    description: 'Franja horizontal con los últimos péptidos, suplementos y protocolos visitados. Se muestra solo cuando hay historial. Especialmente útil tras usar el Asistente IA.',
    component: RecentlyExplored,
    category: 'guest',
    defaultEnabled: false,
    defaultOrder: 4.2,         // Phase 4 — After primary Discovery/Hero zones (DiscoveryHub ~4, BeginnerCollections ~3)
    defaultVisibility: 'all',
  },
  ProtocolPreviewCards: {
    id: 'ProtocolPreviewCards',
    label: '🧬 Vista Previa de Protocolos — Acceso Avanzado (Fase 6)',
    description: 'Tarjetas de vista previa de protocolos con objetivo, duración, péptidos y complejidad. Capa avanzada de exploración visible tras BeginnerCollections y KeyPeptides.',
    component: ProtocolPreviewCards,
    category: 'shared',
    defaultEnabled: true,
    defaultOrder: 5.8,         // Phase 6 — Advanced exploration: after KeyPeptides (5), before NotSureWhereToStart (5.5→6)
    defaultVisibility: 'all',
    variant: 'dark',
  },

  // FloatingProCTA: { // Disabled floating CTA
    // id: 'FloatingProCTA',
    // label: '📌 Botón Flotante — Solicitar Acceso Profesional',
    // description: 'Botón fijo en la esquina inferior-derecha para que visitantes soliciten acceso profesional.',
    // component: FloatingProCTA,
    // category: 'guest',
    // defaultEnabled: true,
    // defaultOrder: 98,
    // defaultVisibility: 'all',
  // }, // End of disabled FloatingProCTA

  // ── GUEST INTELLIGENCE ─────────────────────────────────────────────
  GuestPreferenceWidget: {
    id: 'GuestPreferenceWidget',
    label: '🎯 Personalización de Investigación',
    description: 'Call to Action que abre el ResearchDrawer para personalizar la investigación.',
    component: ResearchIntakeCTA,
    category: 'guest',
    defaultEnabled: true,
    defaultOrder: 0.8,          // Right after hero (0), before GoalLifestyleStrip (1.5)
    defaultVisibility: 'all',
  },
  GuestWelcomeBack: {
    id: 'GuestWelcomeBack',
    label: '👋 Bienvenida Personalizada (Visitantes Recurrentes)',
    description: 'Banner compacto para visitantes con preferencias guardadas. Muestra goal + nivel + CTA a ClinicalAI pre-sembrado. Solo visible en visitas de retorno.',
    component: GuestWelcomeBack,
    category: 'guest',
    defaultEnabled: true,
    defaultOrder: 0.3,          // Top of page — above everything
    defaultVisibility: 'all',
  },
  HealthNewsletterSection: {
    id: 'HealthNewsletterSection',
    label: '📧 Newsletter Semanal — Digest de Salud Personalizado',
    description: 'Sección de registro para newsletter semanal de consejos de salud personalizados por IA. Agente: AgentNewsletterDigest. Público (invitados).',
    component: HealthNewsletterSection,
    category: 'guest',
    defaultEnabled: true,
    defaultOrder: 9.5,          // Conversion 5.0 — soft CTA after ProfessionalUpgradeCTA (9)
    defaultVisibility: 'all',
    variant: 'dark',
  },

  // ── PROFESSIONAL SECTIONS ────────────────────────────────────────────────────

  Hero: {
    id: 'Hero',
    label: '🏆 Hero Profesional — Portada de Bienvenida',
    description: 'Sección hero de alto impacto diseñada para usuarios profesionales verificados.',
    component: Hero,
    category: 'professional',
    defaultEnabled: true,
    defaultOrder: 0,
    defaultVisibility: 'all',
  },
  PowerSearch: {
    id: 'PowerSearch',
    label: '🔎 Buscador Avanzado (Power Search)',
    description: 'Buscador denso con filtros para usuarios expertos: por péptido, vía, objetivo o protocolo.',
    component: PowerSearch,
    category: 'professional',
    defaultEnabled: true,
    defaultOrder: 1,
    defaultVisibility: 'all',
  },
  // ── DISCOVERY HUB (Phase 4-A) ──────────────────────────────────────────────
  DiscoveryHub: {
    id: 'DiscoveryHub',
    label: '🔭 Discovery Hub — Péptidos, Protocolos y Más',
    description: 'Vista unificada con tabs para explorar Trending Peptides, Trending Protocols, Featured y Nuevas Incorporaciones. Consolida las 4 secciones de descubrimiento en una sola capa.',
    component: DiscoveryHub,
    category: 'professional',
    defaultEnabled: true,
    defaultOrder: 2.5,          // Between PowerSearch (1) and the rest
    defaultVisibility: 'all',
  },
  // ── EXPERT ACCESS STRIP (Phase 6-A) ────────────────────────────────────────────
  ExpertAccessStrip: {
    id: 'ExpertAccessStrip',
    label: '⚡ Acceso Rápido — Herramientas Expert',
    description: 'Barra compacta con acceso directo a Comparar, Calculadora, Catálogo y Biblioteca de Investigación.',
    component: ExpertAccessStrip,
    category: 'professional',
    defaultEnabled: true,
    defaultOrder: 3.5,          // After DiscoveryHub (2.5), before PathwayNavigation (6)
    defaultVisibility: 'all',
  },
  TrendingPeptides: {
    id: 'TrendingPeptides',
    label: '📈 Péptidos en Tendencia',
    description: 'Péptidos de investigación con mayor demanda actual en el mercado profesional.',
    component: TrendingPeptides,
    category: 'professional',
    defaultEnabled: false,      // Phase 4-A: now inside DiscoveryHub
    defaultOrder: 3,
    defaultVisibility: 'all',
  },
  TrendingProtocols: {
    id: 'TrendingProtocols',
    label: '📊 Protocolos más Consultados',
    description: 'Los protocolos de investigación con más accesos recientes por la comunidad profesional.',
    component: TrendingProtocols,
    category: 'professional',
    defaultEnabled: false,      // Phase 4-A: now inside DiscoveryHub
    defaultOrder: 4,
    defaultVisibility: 'all',
  },
  NovelAcquisitions: {
    id: 'NovelAcquisitions',
    label: '🆕 Nuevas Incorporaciones al Catálogo',
    description: 'Los péptidos más recientes añadidos al catálogo de investigación.',
    component: NovelAcquisitions,
    category: 'professional',
    defaultEnabled: false,      // Phase 4-A: now inside DiscoveryHub (New tab)
    defaultOrder: 5,
    defaultVisibility: 'all',
  },
  PathwayNavigation: {
    id: 'PathwayNavigation',
    label: '🧬 Navegación por Vía Biológica',
    description: 'Grid de filtros por vía metabólica o biológica (GH, insulina, neural, inflamación…).',
    component: PathwayNavigation,
    category: 'professional',
    defaultEnabled: true,
    defaultOrder: 6,
    defaultVisibility: 'all',
  },
  ProtocolHighlight: {
    id: 'ProtocolHighlight',
    label: '🔬 Protocolo Destacado del Mes',
    description: 'Análisis en profundidad de un protocolo específico seleccionado por el equipo editorial.',
    component: ProtocolHighlight,
    category: 'professional',
    defaultEnabled: true,
    defaultOrder: 7,
    defaultVisibility: 'all',
  },
  InstitutionalSolutions: {
    id: 'InstitutionalSolutions',
    label: '🏛️ Soluciones para Instituciones y Compras al Por Mayor',
    description: 'Información sobre precios mayoristas, suministro institucional y procurement para laboratorios.',
    component: InstitutionalSolutions,
    category: 'professional',
    defaultEnabled: true,
    defaultOrder: 11.5,        // Phase 5-B: moved after TrustHub + PlatformCapabilities
    defaultVisibility: 'all',
    defaultProps: { isProfessional: true },
  },
  ProfessionalDashboard: {
    id: 'ProfessionalDashboard',
    label: '📋 Mini-Panel de Control del Profesional',
    description: 'Vista rápida del estado de cuenta, pedidos recientes y protocolos guardados del usuario.',
    component: ProfessionalDashboard,
    category: 'professional',
    defaultEnabled: true,
    defaultOrder: 9,
    defaultVisibility: 'all',
  },
  // ── TRUST HUB (Phase 5-A) ──────────────────────────────────────────────────
  TrustHub: {
    id: 'TrustHub',
    label: '🛡️ Trust Hub — Certificaciones, Testimonios y Logística',
    description: 'Vista unificada con tabs para explorar Certificaciones, Testimonios y Logística Global. Consolida las secciones de confianza en una sola capa.',
    component: TrustHub,
    category: 'professional',
    defaultEnabled: true,
    defaultOrder: 7.8,          // Between ProtocolHighlight (7) and InstitutionalSolutions (8)
    defaultVisibility: 'all',
  },
  GlobalLogistics: {
    id: 'GlobalLogistics',
    label: '🌍 Mapa de Logística Global',
    description: 'Tiempos de envío estimados y red de distribución internacional según destino.',
    component: GlobalLogistics,
    category: 'professional',
    defaultEnabled: false,     // Phase 5-A: now inside TrustHub (Logistics tab)
    defaultOrder: 10,
    defaultVisibility: 'all',
  },
  PlatformCapabilitiesPro: {
    id: 'PlatformCapabilitiesPro',
    label: '⚙️ Capacidades de la Plataforma para Profesionales',
    description: 'Resumen de las funciones exclusivas para usuarios profesionales: IA clínica, protocolos avanzados, analytics.',
    component: PlatformCapabilitiesPro,
    category: 'professional',
    defaultEnabled: true,
    defaultOrder: 11,
    defaultVisibility: 'all',
  },
  ContactCTA: {
    id: 'ContactCTA',
    label: '📞 Contacto y Soporte Dedicado',
    description: 'Banner de pie de página con acceso directo al equipo de soporte científico y gestión de cuentas.',
    component: ContactCTA,
    category: 'professional',
    defaultEnabled: true,
    defaultOrder: 12,
    defaultVisibility: 'all',
  },
};
