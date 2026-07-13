# Architecture Rules & Best Practices

## 1. Paginación y Carga Lenta Obligatoria (Golden Rule)
- **Nunca traigas todos los documentos de golpe desde Firestore.**
- Elementos como Productos, Protocolos, Prescripciones, Cotizaciones, Proveedores, Médicos, etc., DEBEN usar siempre limit() (por ejemplo, `limit(50)` o `limit(100)`) y, preferiblemente, paginación real.
- Esto evita el bloqueo (congelamiento) del hilo principal de React en módulos masivos.
- Cualquier tabla o lista nueva debe construirse usando la estrategia modular (`DataTable.jsx` o similar) con estados de carga ("Skeletons") controlados por el padre.

## 2. Firestore es la Única Fuente de Verdad (Golden Rule)
- **Nunca uses archivos locales (JSON, JS estático) como fuente de datos en producción.** Archivos como `/data/products.json`, bundles de protocolos locales, o cualquier JSON estático son solo herramientas de seeding/importación inicial — nunca la fuente activa de datos.
- La base de datos (Firestore) es siempre la fuente autoritativa para: Productos, Péptidos, Protocolos, Prescripciones, Proveedores, Médicos, Pacientes, Pedidos, etc.
- **Toda modificación de datos debe escribirse en Firestore.** Nunca modificar archivos locales y esperar que "se sincronicen".
- **Estrategia de rendimiento obligatoria** para evitar penalizaciones de latencia:
  1. **Capa 1 — Memoria RAM**: Variable de módulo con TTL (el más rápido, 0ms de red). 
  2. **Capa 2 — `localStorage`**: Persiste entre recargas de página. TTL recomendado: 30-60 minutos.
  3. **Capa 3 — React Query**: `staleTime` alineado con el TTL del repositorio. Evita re-fetches innecesarios.
  4. **Capa 4 — Firestore**: Solo se consulta cuando las capas anteriores están expiradas o se llama `forceRefresh: true`.
- **Los repositorios deben exponer `invalidateXxxCache()`** para que el Admin Panel pueda forzar la recarga inmediata tras ediciones manuales o escrituras de IA.
- **Los archivos locales JSON pueden existir como fallback de emergencia** (si Firestore es inaccesible), pero NUNCA como la fuente primaria.

## 3. Uso Exclusivo de DataTable para Renderizado Tabular (Golden Rule)
- **Bajo ninguna circunstancia se deben crear etiquetas `<table HTML>` sueltas o personalizadas.**
- Todo dato tabular en la plataforma DEBE renderizarse a través del componente unificado `src/components/ui/DataTable.jsx`.
- Cualquier customización visual, anidación de componentes, o edición en línea (inline editing) debe inyectarse a través de la propiedad `render` de las definiciones de columnas (`columns`) de `DataTable`.
- **Beneficios forzados**: Al usar `DataTable`, heredamos automáticamente virtualización, paginación, filtros, y responsividad móvil (conversión a tarjetas vía `.gcp-table-container` y `data-label`). No rompas este estándar creando tablas ad-hoc.
