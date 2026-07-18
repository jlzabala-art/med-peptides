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

## 4. Consolidación de UI y Evitación de Modales (Master-Detail en Tabla)
- **Nunca abandones el contexto de la tabla a menos que sea estrictamente necesario.**
- En lugar de abrir pantallas nuevas o modales a pantalla completa para ver detalles de un registro, utiliza la propiedad `expandableRender` de `DataTable` para mostrar paneles de detalle (Master-Detail) integrados directamente bajo la fila.
- Los modales solo deben usarse para flujos de trabajo aislados (subir un archivo, advertencias), no para la exploración de datos.

## 5. Edición en Línea (Inline Editing) Estándar
- **No crees formularios separados para ediciones simples.** Para editar campos escalares o directos (cantidades, precios, márgenes, estados), integra elementos como `<input>` o selectores directamente en las celdas usando la función `render` de las columnas de `DataTable`.
- Esto mantiene el flujo de trabajo rápido (similar a Excel) y reduce la fricción de la interfaz. Los cambios se pueden sincronizar on-blur o mediante un guardado general.

## 6. Búsqueda y Filtros Globales Integrados
- **Toda tabla debe ofrecer capacidad de búsqueda estándar.** Usa la propiedad `globalSearch={true}` y `searchPlaceholder` de `DataTable`, o conéctala a un `GlobalSearchBar` superior pasándole el `searchQuery`. 
- No reinventes barras de búsqueda por componente a menos que requieran filtros multicampo complejos (ej. rangos de fechas específicos). Esto unifica la UX en toda la plataforma.

## 7. Posicionamiento Prioritario del Buscador (Golden Rule)
- **El buscador es SIEMPRE lo primero visible en cualquier pantalla con datos.** Ningún botón de acción, título secundario, o filtro puede estar posicionado por encima o a la izquierda del campo de búsqueda principal.
- **Componente estándar exclusivo**: Toda búsqueda en la plataforma Admin debe usar `<GlobalSearchBar>` (ubicado en `src/components/ui/GlobalSearchBar.jsx`). Nunca se crea un `<input type="text">` ad-hoc para buscar.
- **Filtros integrados visualmente**: Cualquier filtro adicional (estado, tipo, fecha, categoría) debe renderizarse como chips/pills adheridos visualmente al `GlobalSearchBar`, usando la prop `filters` del componente. Los filtros no deben vivir en secciones separadas ni romperse visualmente con la barra de búsqueda.
- **UX consistente en todas las pantallas**: El buscador siempre tendrá:
  - Ícono de lupa a la izquierda.
  - Atajo de teclado `⌘K` / `Ctrl+K` para activarlo.
  - Badge de recuento de resultados a la derecha.
  - Historial de búsquedas recientes (localStorage por namespace).
  - Botón `×` para limpiar instantáneamente.
  - Filtros activos como chips removibles, justo debajo o a la derecha del input.
- **Tamaño**: usar siempre `size="lg"` para módulos principales (catálogo, clientes, prescripciones), y `size="md"` para submódulos o paneles laterales.

## 8. Sistema Unificado de Estado (Status Badge) — Inspirado en GCP
- **Nunca improvises colores para estados.** Google Cloud Console usa exactamente los mismos colores semánticos para cada estado en toda la plataforma. Nosotros debemos hacer lo mismo.
- **Componente exclusivo**: Usa siempre `<StatusBadge status="active" />` (ubicado en `src/components/ui/StatusBadge.jsx`). Nunca crees `<span style={{ color: 'green' }}>Active</span>` ad-hoc.
- **Mapa semántico obligatorio de colores**:
  - `active`, `approved`, `reconciled`, `published` → **Verde** (`#16a34a` / fondo `#f0fdf4`)
  - `pending`, `draft`, `awaiting`, `processing` → **Amarillo** (`#d97706` / fondo `#fffbeb`)
  - `error`, `rejected`, `disputed`, `failed`, `cancelled` → **Rojo** (`#dc2626` / fondo `#fef2f2`)
  - `inactive`, `archived`, `disabled` → **Gris** (`#64748b` / fondo `#f1f5f9`)
  - `po_created`, `synced`, `converted` → **Azul** (`#2563eb` / fondo `#eff6ff`)
- Este sistema garantiza que un operador de la clínica sepa **instantáneamente** el estado de cualquier registro sin leer el texto.

## 9. Cabecera de Página Fija con Acción Primaria Siempre Visible (Inspirado en GCP)
- **El botón de acción principal nunca debe perderse al hacer scroll.** Google Cloud mantiene siempre el título y el botón CTA ("Crear instancia", "Nuevo pedido") visibles en la cabecera fija.
- **Estructura obligatoria**: Todo módulo Admin debe usar `<AdminPageHeader title="..." subtitle="..." actions={<button>...</button>} />` con `position: sticky; top: 0; z-index: 20`.
- **No se permiten botones de acción flotando en medio del contenido** sin una ancla visual clara en la cabecera.
- El `AdminPageHeader` ya implementa este patrón. Cualquier módulo nuevo DEBE usarlo como primera línea del render.

## 10. Acción Destructiva con Confirmación Explícita (Golden Rule — Anti-Riesgo)
- **Cualquier acción irreversible** (eliminar un paciente, borrar un producto del catálogo, purgar pedidos, cancelar una prescripción activa) debe requerir que el usuario **escriba el nombre del recurso** antes de confirmar. Este es el patrón de GCP para eliminar proyectos o instancias críticas.
- **Implementación**: Usa siempre `notifier.confirmCritical(message, callback)` para operaciones de alto riesgo. Para operaciones que eliminan datos de Firestore de forma permanente, refuerza con un campo de texto: "Escribe el nombre del paciente para confirmar".
- **Nunca uses un `window.confirm()` nativo.** Es UX de los años 90 y no da contexto sobre la gravedad de la acción.
- **Stack de riesgo**: Las acciones peligrosas deben estar siempre al final de la lista de botones de acción, con color rojo/destructivo, y separadas visualmente del resto.

## 11. IDs y Códigos son Siempre Copy-on-Click (Inspirado en GCP)
- **En Google Cloud, cualquier ID, hash, o código se puede copiar con un clic.** Esto ahorra tiempo masivo a los operadores cuando necesitan referenciar un registro en otro sistema (Zoho, WhatsApp, email).
- **Implementación obligatoria**: Cualquier columna de tabla que muestre un ID, código de pedido (`PO-XXXXXX`), ID de RFQ, ID de prescripción, o UID de Firestore debe usar el patrón:
  ```jsx
  <CopyableId value={row.id} />  // src/components/ui/CopyableId.jsx
  ```
  Al pasar el cursor, se muestra un ícono de copia. Al hacer clic, se copia al portapapeles y aparece un toast "Copiado ✓".
- **Nunca muestres IDs técnicos sin este mecanismo.** Un ID sin copy-on-click es un ID inservible para el operador.

## 12. Shell de Navegación Único Parametrizable por Rol (Golden Rule)
- **Un solo `PanelShell.jsx`** en `src/components/shell/` actúa como layout compartido para Admin, Doctor, Patient y Wholeseller panels.
- Acepta props `navItems`, `role`, `theme` — cada panel solo parametriza lo que cambia.
- El TopBar y SideNav son idénticos en todos los paneles; solo el menú lateral varía.
- **Nunca duplicar** el TopBar o el Sidebar entre paneles. Si necesitas cambiar algo global, cámbialo en `PanelShell`, no en cada panel por separado.

## 13. Módulos Reutilizables via Props de Permisos (Golden Rule)
- Cada módulo de tabla acepta `readOnly`, `allowedActions[]`, `visibleColumns[]`.
- El mismo componente (p.ej. `ProductsTable`) sirve como catálogo de Admin (edición completa) y catálogo de Doctor (`readOnly + visibleColumns`).
- **Nunca crear un componente de tabla duplicado** para otro panel. Reutiliza y parametriza.
- Ejemplo: `<DataTable readOnly={role === 'doctor'} visibleColumns={['name','dose','stock']} />`

## 14. Hook `useRoleAccess()` Universal (Golden Rule)
- Toda verificación de permisos pasa por este hook — elimina `if(role === 'admin')` esparcidos en el código.
- ```js
  const { can, is } = useRoleAccess();
  can('edit:products')    // → true si Admin
  can('view:pricing')     // → false si Patient
  is('wholeseller')       // → true
  ```
- El hook consulta el claim de Firebase Auth o el campo `role` de Firestore.
- Ubicación: `src/hooks/useRoleAccess.js`

## 15. Temas CSS por Panel — Variables Override (Golden Rule)
- Cada panel tiene su propio archivo de tema en `src/styles/themes/`.
- Los componentes NO tienen colores hardcodeados — solo usan variables CSS como `var(--color-primary)`.
- Paleta por panel:
  - Admin: `--color-primary: #003666` (azul corporativo)
  - Doctor: `--color-primary: #0d9488` (teal médico)
  - Patient: `--color-primary: #7c3aed` (púrpura wellness)
  - Wholeseller: `--color-primary: #c2410c` (naranja comercial)
- Cambiar de panel = importar un archivo CSS diferente. Zero cambios en componentes.

## 16. `PageHeader` Universal — No Solo Admin (Golden Rule)
- **Renombrar `AdminPageHeader` → `PageHeader`** y moverlo a `src/components/ui/PageHeader.jsx`.
- Acepta prop opcional `panel` para aplicar acento de color correcto automáticamente.
- Todos los módulos existentes actualizarán el import de forma gradual.
- **Nunca crear una variante de `PageHeader` ad-hoc para otro panel.**

## 17. Breadcrumbs Siempre Visibles en Módulos con Profundidad > 1 (Golden Rule)
- Todo módulo que navegue a un detalle (paciente → prescripción → documento) DEBE mostrar `<Breadcrumb />`.
- Inspirado en GCP: `Compute Engine > VM Instances > my-vm-01`.
- Componente: `src/components/ui/Breadcrumb.jsx`
- ```jsx
  <Breadcrumb items={[
    { label: 'Patients', href: '/doctor/patients' },
    { label: 'Carlos Méndez', href: '/doctor/patients/carlos' },
    { label: 'Prescription #RX-001' }   // último ítem = sin href (activo)
  ]} />
  ```
- Nunca más de 3 niveles de profundidad sin breadcrumb.

## 18. Panel de Ayuda Contextual con `HelpDrawer` (Golden Rule)
- Un drawer lateral accesible con `?` o botón de ayuda en el `PageHeader`.
- Cada módulo registra su `helpTopic` (slug de markdown) y el drawer carga el contenido correcto.
- Componente: `src/components/ui/HelpDrawer.jsx`
- Funciona igual en todos los paneles; el contenido varía por `helpTopic` y `role`.

## 19. Notificaciones Cross-Panel con Filtro por Rol (Golden Rule)
- El `NotificationContext` existente se amplía para soportar `targetRole[]`.
- Admin puede enviar notificaciones a Doctor, Patient, Wholeseller o All.
- El `NotificationBell` del TopBar es idéntico en todos los paneles — solo filtra por rol.
- ```js
  notifier.send({ to: ['doctor', 'wholeseller'], message: '...', type: 'product' })
  ```
- **Nunca duplicar la lógica de notificaciones** entre paneles.

## 20. `EmptyState` Estándar — Nunca `<p>No data</p>` (Golden Rule)
- **Prohibido** usar texto plano o `null` cuando una lista/tabla está vacía.
- Usar siempre `<EmptyState />` en `src/components/ui/EmptyState.jsx`:
  ```jsx
  <EmptyState
    icon={FileText}
    title="No prescriptions yet"
    subtitle="Your prescriptions will appear here once a doctor creates one."
    action={{ label: 'Request Consultation', onClick: handleRequest }}
  />
  ```
- Mismo componente en todos los paneles; copy e icono varían por contexto.

## 21. Server Components — Promover Módulos de Solo Lectura (Golden Rule)
- **Los módulos que NO tienen interactividad del lado del cliente** (filtros locales, modales, formularios inline) DEBEN convertirse en React Server Components (RSC).
- Criterios para promover a Server Component:
  - No usa `useState`, `useEffect`, `useRef`, ni event handlers del cliente.
  - Solo fetcha datos de Firestore Admin SDK (no client SDK) o de una API Route.
  - No necesita el banner `"use client"`.
- **Patrón obligatorio**: El Server Component fetcha datos y los pasa como props al Client Component hijo que maneja la interactividad.
  ```
  AdminProtocolsPage.jsx (RSC — fetcha datos, no "use client")
    └── ProtocolsTableClient.jsx ("use client" — maneja filtros, edición inline)
  ```
- Beneficios: reducción de JS enviado al browser, mejor LCP, menor TTI.
- **Candidatos inmediatos**: páginas de listado de solo lectura — Audit Logs, Email Templates (vista), Analytics (widgets estáticos).
- **NO promover** módulos con: filtros cliente, infinite scroll, modales, inline editing, drag & drop.

## 22. KPIs por Defecto en Toda Pantalla (Golden Rule)
- **Toda pantalla o módulo principal debe mostrar KPIs relevantes por defecto en la parte superior.**
- No se permiten pantallas de listado o gestión (como Pacientes, Catálogo, Prescripciones, Leads, Finanzas) que muestren solo una tabla sin un resumen métrico en la cabecera.
- **Implementación obligatoria**: Se debe usar un componente de tarjetas de métricas (ej. `MetricCard` o similar) justo debajo del `PageHeader` y antes del `GlobalSearchBar`.
- **Generación Contextual**: Si una pantalla aún no tiene KPIs definidos, el agente debe analizar el contexto de los datos gestionados en esa pantalla (ej. "Total de pacientes", "Nuevos esta semana", "Tasa de conversión" para pacientes) y generar KPIs útiles de forma automática.
- Estos KPIs idealmente deben calcularse en el servidor o extraerse de agregaciones pre-calculadas para evitar cargas pesadas en el cliente.

## 23. Mobile-First UX Compatibility (Golden Rule)
- **Toda interfaz o componente, tanto nuevo como existente, DEBE ser diseñado o adaptado pensando en su compatibilidad con dispositivos móviles.**
- Nunca diseñes pantallas o tablas que solo funcionen en monitores anchos (desktop). Utiliza enfoques responsivos, `flex-wrap`, media queries (`@media (max-width: 768px)`), y el sistema integrado de `DataTable` (que convierte filas en tarjetas móviles).
- Antes de implementar cualquier cambio visual o funcional, pregúntate: *¿Cómo se verá y usará esto en un teléfono móvil?*
- Evita anchos fijos (`width: 800px`), usa anchos fluidos (`width: 100%`, `max-width`) y asegura que los botones y áreas táctiles sean lo suficientemente grandes (mínimo 44x44px).

## 24. Filtros Activos y Temporales en Tablas (Golden Rule)
- **Toda tabla o listado de datos debe mostrar explícitamente los filtros que están aplicados actualmente.**
- **Visibilidad:** Los filtros activos (por ejemplo: "Estado: Pendiente", "Rol: Paciente") deben renderizarse como chips extraíbles debajo del buscador global o de la cabecera.
- **Filtro Temporal por Defecto:** Siempre debe existir un filtro temporal activo por defecto para limitar la carga inicial (ej. "Últimos 30 días", "Este mes") y para darle contexto al usuario de por qué está viendo esos datos en particular.
- **Reseteo fácil:** Debe haber un botón claro de "Limpiar filtros" o "Reset" que devuelva la vista al estado por defecto. Nunca el usuario debe sentirse "atrapado" en un listado vacío sin saber cómo quitar los filtros.
- **Sincronización de URL:** Idealmente, los filtros deben reflejarse en los parámetros de la URL (`?status=pending&range=30d`) para que al recargar o compartir la URL, la vista de la tabla se mantenga.

