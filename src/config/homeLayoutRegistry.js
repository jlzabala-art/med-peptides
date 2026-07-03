import { lazy } from 'react';

// Shared Components
const TrustStrip = lazy(() => import('../sections/TrustStrip'));

// Guest Components - Eager load above-the-fold
import GuestHeroSearch from '../sections/GuestHeroSearch';
import ResearchIntakeCTA from '../components/shared/ResearchIntakeCTA';

// Guest Components - Lazy load
const QuickDiscovery = lazy(() => import('../sections/QuickDiscovery'));
const FeaturedCategories = lazy(() => import('../sections/FeaturedCategories'));
const StepByStepGuide = lazy(() => import('../sections/StepByStepGuide'));
const UserSegmentEntry = lazy(() => import('../sections/UserSegmentEntry'));
const MobileQuickNav = lazy(() => import('../sections/MobileQuickNav'));
const ProfessionalUpgradeCTA = lazy(() => import('../sections/ProfessionalUpgradeCTA'));
const GuestIntroTeaser = lazy(() => import('../sections/GuestIntroTeaser'));

// Phase 2–8 New Sections
const GuestModeBanner = lazy(() => import('../sections/GuestModeBanner'));
const WhyChooseMedPeptides = lazy(() => import('../sections/WhyChooseMedPeptides'));
const PeptideIntroEducation = lazy(() => import('../sections/PeptideIntroEducation'));
const PriceTransparency = lazy(() => import('../sections/PriceTransparency'));
const HowItWorks = lazy(() => import('../sections/HowItWorks'));
const EmotionalTrust = lazy(() => import('../sections/EmotionalTrust'));
const GoalLifestyleStrip = lazy(() => import('../sections/GoalLifestyleStrip'));
const KeyPeptides = lazy(() => import('../sections/KeyPeptides'));
const ClinicalAIPromo = lazy(() => import('../sections/ClinicalAIPromo'));
const KnowledgeHubShowcase = lazy(() => import('../sections/KnowledgeHubShowcase'));

// Rules 5.0 — Phase additions
const BeginnerCollections = lazy(() => import('../sections/BeginnerCollections'));
const NotSureWhereToStart = lazy(() => import('../sections/NotSureWhereToStart'));
const ProtocolPreviewCards = lazy(() => import('../sections/ProtocolPreviewCards'));
const GuidedSearchHints = lazy(() => import('../sections/GuidedSearchHints'));
const GoalEntryFlow = lazy(() => import('../sections/GoalEntryFlow'));
const RecentlyExplored = lazy(() => import('../sections/RecentlyExplored'));
const EternaDiagnosticsShowcase = lazy(() => import('../sections/EternaDiagnosticsShowcase'));
const LatestArticles = lazy(() => import('../sections/LatestArticles'));

// Guest Intelligence — preferences, newsletter
const GuestWelcomeBack = lazy(() => import('../sections/GuestWelcomeBack'));
const HealthNewsletterSection = lazy(() => import('../sections/HealthNewsletterSection'));

// Professional Components - Eager load above-the-fold
import Hero from '../sections/Hero';

// Professional Components - Lazy load
const PowerSearch = lazy(() => import('../sections/PowerSearch'));
const DiscoveryHub = lazy(() => import('../sections/DiscoveryHub'));
const TrustHub = lazy(() => import('../sections/TrustHub'));
const ExpertAccessStrip = lazy(() => import('../sections/ExpertAccessStrip'));
const TrendingPeptides = lazy(() => import('../sections/TrendingPeptides'));
const TrendingProtocols = lazy(() => import('../sections/TrendingProtocols'));
const NovelAcquisitions = lazy(() => import('../sections/NovelAcquisitions'));
const PathwayNavigation = lazy(() => import('../sections/PathwayNavigation'));
const ProtocolHighlight = lazy(() => import('../sections/ProtocolHighlight'));
const InstitutionalSolutions = lazy(() => import('../sections/InstitutionalSolutions'));
const ProfessionalDashboard = lazy(() => import('../sections/ProfessionalDashboard'));
const GlobalLogistics = lazy(() => import('../sections/GlobalLogistics'));
const PlatformCapabilitiesPro = lazy(() => import('../sections/PlatformCapabilitiesPro'));
const ContactCTA = lazy(() => import('../sections/ContactCTA'));

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
  GuestPreferenceWidget: {
    id: 'GuestPreferenceWidget',
    label: '🎯 Personalización de Investigación',
    description: 'Call to Action que abre el ResearchDrawer para personalizar la investigación.',
    component: ResearchIntakeCTA,
    category: 'guest',
    defaultEnabled: true,
    defaultOrder: 1,
    defaultVisibility: 'all',
  },
  GoalLifestyleStrip: {
    id: 'GoalLifestyleStrip',
    label: '🏃 Banda de Objetivos de Salud',
    description: 'Tira animada con objetivos de bienestar (longevidad, rendimiento, sueño…). Se desplaza automáticamente.',
    component: GoalLifestyleStrip,
    category: 'shared',
    defaultEnabled: true,
    defaultOrder: 2,
    defaultVisibility: 'all',
  },
  EternaDiagnosticsShowcase: {
    id: 'EternaDiagnosticsShowcase',
    label: '🧬 Escaparate ETERNA® Diagnostics (Longevidad)',
    description: 'Sección premium interactiva que presenta los servicios de Eterna DX y permite añadir la plataforma al carrito.',
    component: EternaDiagnosticsShowcase,
    category: 'guest',
    defaultEnabled: true,
    defaultOrder: 3,
    defaultVisibility: 'all',
    withTransition: true,
  },
  BeginnerCollections: {
    id: 'BeginnerCollections',
    label: '🧪 Colecciones para Principiantes (Fase 2)',
    description: 'Colecciones curadas con 3–5 péptidos y lenguaje explicativo WHY para investigadores nuevos. Reduce la sobrecarga del catálogo.',
    component: BeginnerCollections,
    category: 'guest',
    defaultEnabled: true,
    defaultOrder: 4,
    defaultVisibility: 'all',
  },
  LatestArticles: {
    id: 'LatestArticles',
    label: '📰 Artículos Recientes',
    description: 'Muestra los 2 últimos artículos publicados en el blog con enlace para ver todos.',
    component: LatestArticles,
    category: 'guest',
    defaultEnabled: true,
    defaultOrder: 5,
    defaultVisibility: 'all',
    isLazy: true,
  },
  HealthNewsletterSection: {
    id: 'HealthNewsletterSection',
    label: '📧 Newsletter Semanal — Digest de Salud Personalizado',
    description: 'Sección de registro para newsletter semanal de consejos de salud personalizados por IA. Agente: AgentNewsletterDigest. Público (invitados).',
    component: HealthNewsletterSection,
    category: 'guest',
    defaultEnabled: true,
    defaultOrder: 6,
    defaultVisibility: 'all',
    variant: 'dark',
  },
  UserSegmentEntry: {
    id: 'UserSegmentEntry',
    label: '🔀 Selector de Perfil — Visitante vs. Profesional',
    description: 'CTA que dirige al usuario hacia el registro profesional o la exploración como invitado.',
    component: UserSegmentEntry,
    category: 'guest',
    defaultEnabled: true,
    defaultOrder: 7,
    defaultVisibility: 'all',
  },

  // DISABLED GUEST & SHARED SECTIONS
  GuestIntroTeaser: {
    id: 'GuestIntroTeaser',
    label: '💡 Banner Educativo — ¿Qué son los Péptidos?',
    description: 'Banner informativo descartable que enlaza a la guía de introducción a péptidos. Solo visible para visitantes.',
    component: GuestIntroTeaser,
    category: 'guest',
    defaultEnabled: false,
    defaultOrder: 2.5,
    defaultVisibility: 'all',
    sectionClass: 'git-root',
  },
  ClinicalAIPromo: {
    id: 'ClinicalAIPromo',
    label: '🤖 Promoción — Asistente IA Clínico',
    description: 'Banner destacado que promociona el Asistente IA Clínico. Visible para todos los usuarios.',
    component: ClinicalAIPromo,
    category: 'shared',
    defaultEnabled: false,
    defaultOrder: 6.2,
    defaultVisibility: 'all',
  },
  KeyPeptides: {
    id: 'KeyPeptides',
    label: '💊 Escaparate de Péptidos Destacados',
    description: 'Carrusel horizontal con los péptidos más importantes del catálogo.',
    component: KeyPeptides,
    category: 'guest',
    defaultEnabled: false,
    defaultOrder: 5,
    defaultVisibility: 'all',
    isLazy: true,
    sectionClass: 'kp-section',
    withTransition: true,
  },
  ProfessionalUpgradeCTA: {
    id: 'ProfessionalUpgradeCTA',
    label: '⭐ CTA — Regístrate como Profesional',
    description: 'Banners que invitan al visitante a solicitar acceso profesional para precios y funciones avanzadas.',
    component: ProfessionalUpgradeCTA,
    category: 'guest',
    defaultEnabled: false,
    defaultOrder: 9,
    defaultVisibility: 'all',
  },
  GuestModeBanner: {
    id: 'GuestModeBanner',
    label: '👤 Indicador de Modo Visitante',
    description: 'Píldora/banner que muestra que el usuario navega como invitado, con CTA para desbloquear acceso completo.',
    component: GuestModeBanner,
    category: 'guest',
    defaultEnabled: false,
    defaultOrder: 0.5,
    defaultVisibility: 'all',
  },
  WhyChooseMedPeptides: {
    id: 'WhyChooseMedPeptides',
    label: '✅ ¿Por qué elegir Atlas Health?',
    description: 'Lista con iconos sobre los pilares de confianza: pureza, trazabilidad y soporte científico.',
    component: WhyChooseMedPeptides,
    category: 'shared',
    defaultEnabled: false,
    defaultOrder: 7,
    defaultVisibility: 'all',
    variant: 'dark',
  },
  HowItWorks: {
    id: 'HowItWorks',
    label: '🔄 Cómo Funciona Atlas Health (4 pasos)',
    description: 'Línea de tiempo visual: Aprende → Elige → Calcula → Sigue el protocolo.',
    component: HowItWorks,
    category: 'shared',
    defaultEnabled: false,
    defaultOrder: 7.5,
    defaultVisibility: 'all',
    variant: 'dark',
  },
  ProtocolPreviewCards: {
    id: 'ProtocolPreviewCards',
    label: '🧬 Vista Previa de Protocolos — Acceso Avanzado (Fase 6)',
    description: 'Tarjetas de vista previa de protocolos con objetivo, duración, péptidos y complejidad. Capa avanzada de exploración visible tras BeginnerCollections y KeyPeptides.',
    component: ProtocolPreviewCards,
    category: 'shared',
    defaultEnabled: false,
    defaultOrder: 5.8,
    defaultVisibility: 'all',
    variant: 'dark',
  },
  GuestWelcomeBack: {
    id: 'GuestWelcomeBack',
    label: '👋 Bienvenida Personalizada (Visitantes Recurrentes)',
    description: 'Banner compacto para visitantes con preferencias guardadas. Muestra goal + nivel + CTA a ClinicalAI pre-sembrado. Solo visible en visitas de retorno.',
    component: GuestWelcomeBack,
    category: 'guest',
    defaultEnabled: false,
    defaultOrder: 0.3,
    defaultVisibility: 'all',
  },
  TrustStrip: {
    id: 'TrustStrip',
    label: '🛡️ Banda de Confianza y Certificaciones',
    description: 'Muestra badges de verificación, pureza y certificaciones del laboratorio.',
    component: TrustStrip,
    category: 'shared',
    defaultEnabled: false,
    defaultOrder: 6.5,
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
  PeptideIntroEducation: {
    id: 'PeptideIntroEducation',
    label: '🌱 Introducción a los Péptidos — Empieza Aquí',
    description: 'Sección educativa para principiantes: qué son, cómo reconstituir y protocolos básicos.',
    component: PeptideIntroEducation,
    category: 'guest',
    defaultEnabled: false,
    defaultOrder: 2.5,
    defaultVisibility: 'all',
  },
  PriceTransparency: {
    id: 'PriceTransparency',
    label: '💰 Transparencia de Precios y Niveles de Servicio',
    description: 'Explica la diferencia entre acceso visitante y profesional sin mencionar descuentos directos.',
    component: PriceTransparency,
    category: 'guest',
    defaultEnabled: false,
    defaultOrder: 4.5,
    defaultVisibility: 'all',
  },
  EmotionalTrust: {
    id: 'EmotionalTrust',
    label: '💬 Testimonios y Confianza Visual',
    description: 'Sección con testimonios reales y gradiente visual que refuerza la confianza en la plataforma.',
    component: EmotionalTrust,
    category: 'shared',
    defaultEnabled: false,
    defaultOrder: 7.5,
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
    defaultEnabled: false,
    defaultOrder: 1,
    defaultVisibility: 'all',
  },
  GoalEntryFlow: {
    id: 'GoalEntryFlow',
    label: '🎯 Flujo de Entrada por Objetivo (Fase 1)',
    description: 'Selección de objetivo de investigación. Conecta directamente al Asistente IA según el goal elegido.',
    component: GoalEntryFlow,
    category: 'guest',
    defaultEnabled: false,
    defaultOrder: 3,
    defaultVisibility: 'all',
  },
  RecentlyExplored: {
    id: 'RecentlyExplored',
    label: '🕐 Explorado Recientemente (Fase 4)',
    description: 'Franja horizontal con los últimos péptidos, suplementos y protocolos visitados. Se muestra solo cuando hay historial. Especialmente útil tras usar el Asistente IA.',
    component: RecentlyExplored,
    category: 'guest',
    defaultEnabled: false,
    defaultOrder: 4.2,
    defaultVisibility: 'all',
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
  DiscoveryHub: {
    id: 'DiscoveryHub',
    label: '🔭 Discovery Hub — Péptidos, Protocolos y Más',
    description: 'Vista unificada con tabs para explorar Trending Peptides, Trending Protocols, Featured y Nuevas Incorporaciones. Consolida las 4 secciones de descubrimiento en una sola capa.',
    component: DiscoveryHub,
    category: 'professional',
    defaultEnabled: true,
    defaultOrder: 2.5,
    defaultVisibility: 'all',
  },
  ExpertAccessStrip: {
    id: 'ExpertAccessStrip',
    label: '⚡ Acceso Rápido — Herramientas Expert',
    description: 'Barra compacta con acceso directo a Comparar, Calculadora, Catálogo y Biblioteca de Investigación.',
    component: ExpertAccessStrip,
    category: 'professional',
    defaultEnabled: true,
    defaultOrder: 3.5,
    defaultVisibility: 'all',
  },
  TrendingPeptides: {
    id: 'TrendingPeptides',
    label: '📈 Péptidos en Tendencia',
    description: 'Péptidos de investigación con mayor demanda actual en el mercado profesional.',
    component: TrendingPeptides,
    category: 'professional',
    defaultEnabled: false,
    defaultOrder: 3,
    defaultVisibility: 'all',
  },
  TrendingProtocols: {
    id: 'TrendingProtocols',
    label: '📊 Protocolos más Consultados',
    description: 'Los protocolos de investigación con más accesos recientes por la comunidad profesional.',
    component: TrendingProtocols,
    category: 'professional',
    defaultEnabled: false,
    defaultOrder: 4,
    defaultVisibility: 'all',
  },
  NovelAcquisitions: {
    id: 'NovelAcquisitions',
    label: '🆕 Nuevas Incorporaciones al Catálogo',
    description: 'Los péptidos más recientes añadidos al catálogo de investigación.',
    component: NovelAcquisitions,
    category: 'professional',
    defaultEnabled: false,
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
    defaultOrder: 11.5,
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
  TrustHub: {
    id: 'TrustHub',
    label: '🛡️ Trust Hub — Certificaciones, Testimonios y Logística',
    description: 'Vista unificada con tabs para explorar Certificaciones, Testimonios y Logística Global. Consolida las secciones de confianza en una sola capa.',
    component: TrustHub,
    category: 'professional',
    defaultEnabled: true,
    defaultOrder: 7.8,
    defaultVisibility: 'all',
  },
  GlobalLogistics: {
    id: 'GlobalLogistics',
    label: '🌍 Mapa de Logística Global',
    description: 'Tiempos de envío estimados y red de distribución internacional según destino.',
    component: GlobalLogistics,
    category: 'professional',
    defaultEnabled: false,
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
