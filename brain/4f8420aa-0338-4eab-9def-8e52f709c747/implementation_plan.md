# Mejoras Arquitectónicas para `admin/suppliers`

Actualmente, el módulo de Proveedores (`AdminWholesellersTab.jsx` y `useSupplierData.js`) experimenta lentitud al cargar por primera vez debido a varios cuellos de botella arquitectónicos que violan directamente nuestras reglas de oro (como la Regla #1 sobre carga lenta obligatoria). 

A continuación presento los problemas detectados y el plan de arquitectura para solucionarlos.

## Análisis del Problema Actual

1. **Descarga Masiva de Datos (Violación de Regla #1):**
   En `useSupplierData.js`, la función `fetchAllSuppliers()` realiza una consulta a Firestore que trae hasta 2000 documentos de golpe (`limit(2000)`) al montar el componente. Esto satura la red y la memoria del navegador.
2. **Procesamiento Costoso en el Cliente (Bloqueo del Hilo Principal):**
   Una vez descargados los 2000 proveedores, el cliente utiliza un bloque `useMemo` inmenso para desduplicar, filtrar, buscar y ordenar toda la data en memoria. Esto congela la interfaz (TTI alto).
3. **Waterfall (Efecto Cascada) de Peticiones:**
   El componente cliente se monta, muestra un esqueleto de carga y *luego* dispara las consultas a Firestore. Esto retrasa la aparición de los datos en pantalla.

---

## Plan de Implementación Propuesto

### Fase 1: React Server Components (RSC) para Carga Inicial Instantánea
- **Acción:** Convertiremos la obtención inicial de KPIs y la primera página de proveedores en una Server Action asíncrona (ej. `fetchInitialSuppliersData()`).
- **Beneficio:** Eliminaremos el "Loading Skeleton" en la primera carga. El HTML llegará al navegador con la primera página de datos y las métricas KPI ya listas, con latencia 0ms desde la base de datos hasta el servidor de Next.js.

### Fase 2: Paginación Real y Carga Lenta (Lazy Loading)
- **Acción:** Reemplazaremos la consulta de 2000 documentos por una paginación real basada en cursores de Firestore (`startAfter`, `limit(20)`).
- **Beneficio:** Reduciremos drásticamente el uso de memoria en el navegador y el costo de lecturas en Firebase. Cumpliremos estrictamente con la Regla de Oro #1.

### Fase 3: Integración de Algolia para Búsqueda Global (Full-Text Search)
- **Acción:** Dado que Firestore no permite buscar por múltiples campos simultáneamente (ej. nombre del proveedor, país, o nombre del producto), conectaremos la barra de búsqueda `GlobalSearchBar` a un índice de Algolia (`wholesellers`). 
- **Beneficio:** La búsqueda será instantánea (< 50ms) y escalable sin necesidad de descargar todos los proveedores al cliente. (Esto también responde a tu sugerencia anterior de usar Algolia para encontrar proveedores que ofrezcan un producto específico).

## Open Questions

> [!WARNING]
> **Pregunta sobre Algolia:** ¿Quieres que implementemos la búsqueda mediante Algolia en esta iteración? Si aún no tienes configurado el índice de `wholesellers` en Algolia, podemos optar por una búsqueda híbrida más ligera usando un servidor temporal o simplemente mantener un `limit` razonable en Firestore por ahora.

> [!IMPORTANT]
> **Aprobación Requerida:** Por favor, revisa estas ideas de arquitectura y dime si apruebas el plan para proceder con la refactorización de `useSupplierData.js` y `AdminWholesellersTab.jsx`.
