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
- **No crees formularios separados para ediciones simples.** Para editar campos escalares o directos (cantidades, precios, márgenes, estados), integra elementos como `<input>` o selectores directamente en las celdas usando la función `render` de las columnas de `DataTable` (p.ej. usando `InlineEditableCell`).
- **Visibilidad clara de la acción de edición**: El icono indicador (como un lápiz) de que un campo es editable debe estar siempre visible (por ejemplo, con una opacidad mínima, `opacity: 0.4`) y protegido contra desbordamientos (`flex-shrink: 0`) para que el usuario identifique instantáneamente qué celdas puede editar sin tener que pasar el ratón.
- **Botones de confirmación explícita (Golden Rule)**: Siempre que una celda entre en modo edición, DEBEN aparecer pequeños iconos de "Guardar" (✔️) y "Cancelar" (❌) directamente en la propia celda. Aunque el sistema guarde on-blur por comodidad, estos botones deben existir para dar seguridad al usuario sobre cómo confirmar o deshacer su cambio.
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

## 22. KPIs por Defecto y Switch de Alcance (Scope) en Toda Pantalla (Golden Rule)
- **Toda pantalla o módulo principal debe mostrar 4 KPIs relevantes por defecto en la parte superior.**
- No se permiten pantallas de listado o gestión (como Pacientes, Catálogo, Prescripciones, Leads, Finanzas) que muestren solo una tabla sin un resumen métrico en la cabecera.
- **Implementación obligatoria**: Se debe usar un componente de tarjetas de métricas (ej. `MetricCard` o similar con `title`, `value`, `subtitle`, `icon`, `color`) justo debajo del `PageHeader` y antes del `GlobalSearchBar`.
- **Cálculo en Servidor (Golden Standard)**: Los KPIs deben calcularse en el servidor (a través de facet maps o metadata indexada como `_meta/*_facets`) para garantizar coherencia con la paginación y evitar cálculos pesados e inconsistentes en el cliente.
- **Transparencia de Alcance (Scope Switcher / Filter Indicator - Golden Rule)**:
  - Debe quedar siempre explícito si las métricas corresponden a los **filtros aplicados** (*Applied Filters View*) o a la **base de datos global** (*Global Database View*).
  - Toda sección de KPIs debe contar con:
    1. **Badge indicador de alcance**: `Matching Active Filters (X items)` vs `Entire Database (Unfiltered)`.
    2. **Selector de Alcance (Scope Switcher)**: Permite al usuario alternar entre ver los conteos del subconjunto filtrado o los totales globales de la base de datos sin perder su búsqueda.
- **Idioma estándar**: Todos los títulos, etiquetas y subtítulos de los KPIs deben formularse en **inglés** para mantener consistencia en la plataforma administrativa.

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


## 25. Operaciones Asíncronas No Bloqueantes (Idempotencia UI)
- **Las operaciones de red (guardar, crear, procesar) no deben bloquear completamente la interfaz.** Inspirado en GCP, donde lanzar una instancia no congela la pantalla, sino que muestra un estado de carga localizado.
- **Implementación obligatoria**: Los botones de acción deben entrar en estado `disabled` y mostrar un indicador visual ("Saving...", "Creating...") durante la operación para evitar envíos duplicados (idempotencia en el cliente). 
- No usar `window.alert()` ni modales bloqueantes para mostrar el progreso. El usuario debe poder seguir navegando o visualizando otros datos si es posible, o al menos ver un indicador claro de que el sistema está trabajando en segundo plano.

## 26. Divulgación Progresiva (Progressive Disclosure)
- **No abrumes al usuario con todas las opciones a la vez.** En formularios complejos (como crear un protocolo médico o dar de alta un producto avanzado), oculta las configuraciones secundarias, de bajo uso, o "Avanzadas" detrás de secciones colapsables (Accordions o botones de "Opciones Avanzadas").
- La ruta principal ("Happy Path") debe estar completamente libre de fricción, mostrando solo los campos obligatorios o más críticos.
- Este es el estándar de GCP, donde la creación de cualquier recurso básico requiere 2 campos, y el resto están ocultos bajo menús de configuración avanzada.

## 27. Feedback Explícito y Continuo de Operaciones (Toasts)
- **Todo cambio de estado en la base de datos debe reflejarse con una confirmación visual no intrusiva.** Si el usuario edita un paciente, crea una orden, o cambia un precio, se DEBE lanzar un Toast (`toast.success` o `notifier.info`).
- El mensaje debe ser específico: "Paciente Carlos guardado con éxito" en lugar de un genérico "Guardado".
- Esto da tranquilidad al operador de que la operación distribuida ha concluido.

## 28. Taxonomía Unificada de Estados Obligatoria (Golden Rule)
- **Para mantener consistencia en la base de datos y la UI**, toda entidad principal debe utilizar exclusivamente el siguiente vocabulario de estados (en minúsculas).
- **Prescripciones:** `draft`, `pending`, `approved`, `processing`, `en tránsito`, `completed`, `cancelled`.
- **Protocolos:** `draft`, `active`, `paused`, `archived`.
- **Pacientes:** `unverified`, `active`, `suspended`, `archived`.
- **Médicos/Clínicas:** `invited`, `pending`, `approved`, `rejected`, `inactive`.
- **Productos:** `draft`, `published`, `out of stock`, `hidden`, `archived`.
- **Pedidos/POs:** `draft`, `awaiting payment`, `processing`, `en tránsito`, `delivered`, `disputed`.
- **NUNCA** inventes nuevos estados. Si te ves forzado a crear uno nuevo, verifica primero si se puede mapear a uno existente.
- En la UI, todos los estados deben renderizarse exclusivamente a través del componente `<StatusBadge status={...} />`.

## 29. Taxonomía Universal de Filtros (Table Filters)
- **Todo módulo de listado (tablas) debe seguir una arquitectura de filtrado universal:**
  1. **GlobalSearchBar:** Obligatorio en la parte superior para búsquedas exactas.
  2. **Filtro Temporal por Defecto:** Obligatorio para limitar los registros cargados inicialmente (ej. "Últimos 30 días", "Este mes"). Ninguna tabla debe intentar cargar todo el historial por defecto.
  3. **Filtro de Estado:** Múltiple selector basado EXCLUSIVAMENTE en la taxonomía estricta de la Regla #28.
- **Representación Visual:** Los filtros aplicados deben mostrarse siempre como chips/pills removibles debajo del buscador global.
- **Sincronización:** Los filtros deben reflejarse en los parámetros de la URL (`?status=pending&range=30d`) para permitir vistas compartibles.
- **Empty State Inteligente:** Si una tabla está vacía debido a los filtros, el componente `EmptyState` debe indicar explícitamente "No hay resultados para estos filtros" y ofrecer un botón de "Limpiar filtros".

## 30. No Horizontal Scrolling on Desktop Tables (Golden Rule)
- **Las tablas nunca deben hacer scroll horizontal en resoluciones de escritorio.** 
- Todo el contenido debe ajustarse al ancho del contenedor (100%).
- **Implementación obligatoria**: El componente `<DataTable>` usa internamente `table-layout: fixed` y prohíbe el uso de `white-space: nowrap` de manera global para forzar el envoltorio natural (wrap) del texto.
- **Distribución de anchos**: Toda vista o módulo que defina un arreglo `columns` para pasarlo a `DataTable` DEBE definir explícitamente la propiedad `width` en cada columna (preferiblemente usando porcentajes, ej. `width: '35%'` o `width: '120px'` para acciones). Si no se hace, las columnas se distribuirán equitativamente, lo que arruinará la estética de datos asimétricos. Solo se permite `nowrap` en columnas técnicas muy estrechas (como checkboxes o iconos).

## 31. Cabeceras de Tabla y Ordenamiento Universal (Golden Rule)
- **Toda columna en una tabla DEBE mostrar su nombre en la cabecera.** Si se usa `DataTable`, asegúrate de definir `header` o `label` en la definición de la columna.
- **Ordenamiento (Sort) por defecto:** Todas las columnas de datos (alfabéticos, fechas, valores numéricos, estados) deben ser ordenables al hacer clic en su cabecera. En `DataTable`, esto se logra automáticamente si la columna tiene un `key` definido y no se deshabilita explícitamente (`sortable: false`).
- Esta es una regla universal para maximizar la explorabilidad de los datos en toda la plataforma.

## 32. Placeholders de Búsqueda Contextuales (Golden Rule)
- **El placeholder del buscador debe ser dinámico y descriptivo para cada pantalla.** Por ejemplo: "Buscar protocolos por nombre, categoría, objetivos..." en lugar de un simple "Buscar...".
- **Prohibido exponer terminología técnica a los usuarios.** Nunca incluyas nombres de herramientas o motores subyacentes (ej. "Algolia", "Firestore", "Elasticsearch") en la interfaz de usuario.
- Esta es una regla general obligatoria para todas las tablas y listados.

## 33. Búsqueda Confiable y Global (Golden Rule)
- **La búsqueda en cualquier módulo debe garantizar que busca en toda la base de datos de manera global**, no solo en los registros que se encuentran actualmente cargados en pantalla (datos paginados).
- **Optimistic Local Search Fallback:** Cuando se realizan búsquedas en tablas paginadas, el sistema DEBE implementar un fallback híbrido:
  1. Si un motor de full-text search externo (ej. Algolia) está configurado, la tabla delega en él para buscar en toda la base de datos (incluso lo que no se ha descargado).
  2. Independientemente de si Algolia responde bien o falla (o si está retrasado en su sincronización), la interfaz DEBE realizar además una búsqueda local (substring match) en los datos que el usuario ya tiene cargados en la tabla en ese momento.
  3. Los resultados de ambas fuentes (base de datos completa + datos locales en memoria) se combinan y se muestran juntos sin duplicados.
- De esta manera garantizamos una experiencia de búsqueda absolutamente fiable y a prueba de fallos de red o retrasos de indexación en toda la plataforma. Nunca el usuario buscará un ítem que está visible en su pantalla y no lo encontrará.

## 34. Densidad Visual en Drawers (Golden Rule)
- **La información presentada dentro de los Drawers (paneles laterales) debe ser condensada y densa.**
- Por regla general, el `StandardDrawer` y cualquier otro panel lateral deben utilizar una clase o estructura que reduzca los márgenes, paddings y tamaños de letra (ej. `font-size: 0.85rem`) en comparación con las vistas principales de página completa.
- Esto asegura que el operador pueda visualizar mucha información del detalle de un registro sin hacer scroll excesivo.
- **Implementación obligatoria**: El componente `StandardDrawer` inyecta automáticamente la clase `.drawer-condensed-layout` en su contenedor principal, la cual define esta densidad (ej. menores `gap`, `padding` ajustado, reducción de la escala tipográfica).

## 35. Soft Deletion y Archiving sobre Hard Deletion (Golden Rule)
- **Como norma general, promueve siempre el "Archive" (Archivar) por encima del "Delete" (Borrar).** Esto es especialmente crítico en entidades médicas y transaccionales (Prescripciones, Protocolos, Productos, Médicos, Pacientes).
- **Prohibición de borrado con dependencias activas**: Nunca se debe permitir el borrado duro (hard delete) de un elemento si este ha sido utilizado o referenciado en otro lugar. Por ejemplo: no se puede borrar un protocolo si ya existe una prescripción en curso que lo utiliza; no se puede borrar un médico si tiene pacientes asociados.
- **Implementación obligatoria**: Toda acción de borrado destructivo debe ir precedida de una consulta (query) a Firestore para verificar si el ítem tiene dependencias activas o un historial. Si las tiene, el borrado debe ser bloqueado mostrando un error claro (`toast.error`) y sugiriendo explícitamente al usuario que cambie el estado a `archived` o `inactive` usando los botones de estado.

## 36. Mejoras Visuales de Tablas: Chips y Texto Explícito (Golden Rule)
- **Categorías y Metadatos en "Chips"**: Cualquier columna de tabla que muestre una categoría (ej. Categoría Terapéutica, Tipo de Producto) o un rol (ej. Tipo de Usuario) no debe renderizarse como texto plano flotante. Debe renderizarse como un `chip` o `pill` (fondo gris claro o pastel, bordes redondeados, padding ajustado, texto sutil). Esto mejora el escaneo visual de las tablas.
- **Iconos con Texto Explícito (Evitar Ambigüedad)**: Nunca se debe renderizar un icono seguido únicamente de un número (ej. "🧪 2"), ya que esto es ambiguo para los nuevos usuarios. Siempre se debe acompañar del texto explícito en plural o singular dinámico (ej. "🧪 2 Phases" o "🧪 1 Phase").
- **Evitar el "Wrapping" Indeseado**: Utiliza `white-space: nowrap` en contenedores flexibles pequeños (como los de Icono + Texto) para evitar que el número y la palabra se rompan en múltiples líneas dentro de una celda de la tabla.

## 34. Unified Primary Action Dropdown (Golden Rule)
- **Las acciones principales de un módulo en la cabecera (Header Actions) no deben estar desperdigadas.**
- Si existen múltiples opciones para crear o importar algo (ej. "Nueva Prescripción" y "Importar Escaneada"), deben agruparse en un **único botón desplegable (Split Button)** en lugar de tener múltiples botones de colores distintos o botones separados compitiendo por la atención visual.
- **Color Estándar**: Todos los botones de acción principal (incluyendo FABs en móvil) deben usar siempre el color primario de la plataforma (`var(--color-primary)`), eliminando la paleta de colores variados (rojos, naranjas, verdes) para mantener una interfaz limpia y profesional.
- **Implementación**: Usar el componente `PrimarySplitButton` pasándolo a la prop `actions` de `DataModule`, o bien usar el soporte nativo de `PageHeader`. Si un módulo renderiza `actions` explícitas, el `PageHeader` ignorará el FAB global de escritorio para evitar duplicaciones.

## 35. IDs en Tablas (Consolidación Visual)
- **Nunca crear una columna dedicada exclusivamente para el ID** si la tabla ya tiene muchas columnas o si hay una columna principal (como Nombre del Paciente, Nombre del Protocolo, etc.) donde se pueda integrar visualmente.
- **Implementación (Golden Rule)**: El ID debe ocultarse y renderizarse ÚNICAMENTE como una capacidad de copiado utilizando la propiedad `displayValue` del componente. Usar el formato `<CopyableId value={row.id} displayValue="ID" />`. No se debe mostrar el valor largo del hash del ID, sino solo la palabra "ID" junto al icono de copiado, lo cual ahorra muchísimo espacio.

## 36. Acciones Rápidas (Quick Actions) y Tooltips en Tablas
- **Toda tabla debe incluir una columna final de Acciones Rápidas** que contenga botones de icono para las operaciones más frecuentes de cada fila (ej. Editar, Descargar, Duplicar, Eliminar), evitando que el usuario tenga que abrir una vista detallada para tareas simples.
- **Tooltips Obligatorios (Thumbtools)**: Cada uno de estos botones de acción debe incluir el atributo `title="..."` (o su equivalente en el componente que provea un tooltip nativo) explicando claramente qué hace esa acción (ej. `title="Descargar PDF"`).

## 37. Estilo Unificado de Botones (Golden Rule)
- **Todos los botones de la aplicación deben utilizar exclusivamente las clases estándar del sistema de diseño.**
- Se prohíbe el uso de estilos en línea (`style={{ background: "...", color: "..." }}`) o colores arbitrarios para definir la apariencia de un botón.
- **Primarios**: Usar `className="gcp-btn-primary"` para la acción principal de una vista o formulario.
- **Secundarios**: Usar `className="gcp-btn-secondary"` para acciones secundarias, exportaciones, cancelaciones o flujos alternativos.
- Esto aplica de manera retrospectiva a componentes antiguos y es mandatorio para todo el código nuevo.

## 38. Presentación Visual de KPIs (Golden Rule - Dashboard Cards)
- **Todos los cards (MetricCards) de todas las pantallas deben tener la misma presentación visual que los del Dashboard (Atlas Command Center).**
- El estilo obligatorio es:
  - Diseño horizontal.
  - A la izquierda: El icono dentro de una caja con esquinas redondeadas y fondo sutil tintado con el color semántico (`color`).
  - A la derecha: 
    - El valor principal (`value`) en grande.
    - (Opcional) El subtítulo (`subtitle`) como un valor secundario (ej. `≈ 409 USD`).
    - El título de la métrica (`title`) en texto menor describiendo el valor (ej. `Real Revenue Generated`).
- **Implementación**: Usar SIEMPRE el componente `src/components/ui/MetricCard.jsx`, el cual ha sido actualizado para forzar esta estructura de diseño internamente. No crear tarjetas de métricas personalizadas con `div` o `BaseCard` que no sigan este patrón.

## 39. Estilo Homogéneo en Botones de Acción Masiva (Bulk Actions) (Golden Rule)
- **Todos los botones de acciones masivas (Bulk Actions) deben utilizar el mismo estilo base (`gcp-btn-secondary`)**, sin aplicar colores personalizados en los bordes, fondos o textos.
- Esto mantiene la consistencia visual y evita un "efecto arcoíris" en las barras de herramientas.
- La única excepción permitida es para acciones explícitamente destructivas (como "Archive" o "Delete"), que pueden utilizar una variante de peligro (`color: var(--color-danger)` o `gcp-btn-danger`), pero siempre respetando la forma y espaciado estándar del resto de los botones.

## 40. Estandarización de Botones de Acción en Tablas (AppActionGroup) (Golden Rule)
- **Prohibido crear botones de acción ad-hoc (`<button>`) en las columnas de cualquier tabla.**
- Toda tabla que requiera acciones a nivel de fila (ver, editar, eliminar, asignar, etc.) DEBE importar y usar exclusivamente el componente `<AppActionGroup actions={actions} maxVisible={2} />`.
- Esto garantiza que todas las tablas compartan el mismo aspecto visual (botones cuadrados compactos con bordes sutiles) y el mismo comportamiento responsivo (agrupación en menú de 3 puntos en móvil).
- Si necesitas un nuevo tipo de acción o icono, añádelo al diccionario `ACTION_CONFIG` dentro de `src/components/ui/AppActionGroup.jsx` en lugar de crear un botón personalizado en el componente de la tabla.

## 41. Botones de Acción en PageHeader — Homogeneidad Visual Obligatoria (Golden Rule)
- **Todos los botones de acción de la cabecera (`PageHeader`) de cualquier pantalla DEBEN usar las clases `gcp-btn-primary` o `gcp-btn-secondary` del sistema de diseño.** Nunca se crearán botones con estilos `inline` propios (padding, background, border, color) en el header.
- **Posicionamiento**: Los botones de acción primaria y secundaria siempre estarán en la cabecera fija (`PageHeader`), a la derecha. Ningún botón de acción principal (crear, exportar, librerías) puede vivir dentro de la tabla o debajo del buscador.
- **Jerarquía de variantes**:
  - Acción principal (crear, publicar, confirmar) → `gcp-btn-primary` (fondo azul corporativo)
  - Acciones secundarias (exportar, ver librería, ver borrador) → `gcp-btn-secondary` (borde sutil, texto oscuro)
  - Acciones de vista o navegación → `gcp-btn-secondary` con color `var(--color-primary)` para destacarlas ligeramente.
- **Tamaño y espaciado estándar**: `padding: 0.5rem 1rem`, `fontSize: 0.875rem`, `fontWeight: 500` (primario) / `600` (secundario que da contexto de navegación), `borderRadius: 6px`. Nunca usar padding mayor a `1.25rem` horizontal ni `0.75rem` vertical en headers.
- **Regla de comunicación entre PageHeader y módulos internos**: Si un botón del PageHeader necesita controlar el estado de un módulo hijo (p.ej., abrir un drawer en `MasterCatalogTable`), se DEBE usar un `CustomEvent` dispatched en `window` y escuchado con `addEventListener` en el módulo hijo. No se levantará el estado al padre ni se usarán callbacks de props complejas.

## 42. Layout de PageHeader y Responsividad del Subtítulo (Golden Rule)
- **El subtítulo NUNCA debe compartir la misma fila/columna compitiendo por espacio con los botones de acción.** Cuando hay varios botones a la derecha, comprimen la columna izquierda y provocan que el subtítulo se aplaste y rompa en múltiples líneas.
- **Implementación obligatoria:** La estructura del `PageHeader` debe asegurar que:
  1. El Ícono y Título ocupan la zona superior izquierda.
  2. Los Botones de Acción ocupan la zona superior derecha.
  3. El Subtítulo se sitúa en una **fila independiente** en la parte inferior, ocupando todo el ancho horizontal disponible bajo el título y los botones.
- **Alineación Visual:** En vista de escritorio, el subtítulo debe estar alineado visualmente con el texto del título (inyectando un offset izquierdo que compense el ancho del ícono y su margen, por defecto `calc(48px + 1rem)`), siempre que haya un ícono presente.
- **Responsividad (Móvil `< 768px`):** El Header debe colapsar en una única columna, respetando estrictamente este orden de apilamiento vertical:
  1. Ícono + Título (arriba).
  2. Subtítulo (en medio, reiniciando su offset izquierdo a `0` para usar todo el ancho).
  3. Botones de Acción (abajo, estirándose para ocupar todo el ancho, `width: 100%` con los botones haciendo *wrap* o adaptándose).

## 43. Taxonomía y Esquema de Variantes (Golden Rule)
Toda variante dentro del arreglo `variants` de un producto (Aplicable ÚNICAMENTE a la categoría "Peptides") debe pertenecer a un 'Péptido Canónico' (con un `canonicalId` único transversal a todos los proveedores) y debe cumplir estrictamente con el siguiente esquema:
1. `supplierId` y `supplier`: Identificación clara del proveedor.
2. `strength` / `dosage`: Dosis del producto (ej. 2mg, 5mg, 50mg).
3. `presentation`: Formato físico del producto (ej. `vial`, `prefilled_pen`, `nasal_spray`, `tablet`).
4. `unit_price`: Precio unitario base.
5. `cost_tiers`: Un objeto con exactamente 4 niveles de precios de coste por volumen: `cost_10`, `cost_20`, `cost_50`, `cost_100`.

## 44. Cabeceras de Tabla Dinámicas en Una Sola Línea (Golden Rule)
- **El texto de las cabeceras (headers) de cualquier tabla NO debe romperse nunca en múltiples líneas.** 
- **Implementación obligatoria**: Toda cabecera de tabla debe utilizar la propiedad CSS `white-space: nowrap` junto con `text-overflow: ellipsis` y `overflow: hidden`. Para evitar que el texto desaparezca rápidamente en pantallas estrechas, se debe utilizar `font-size: clamp(...)` (por ejemplo, `clamp(0.6rem, 0.8vw, 0.75rem)`) para escalar el tamaño de la fuente dinámicamente antes de truncarse.
- **Componente**: Esto aplica para `DataTable` u otras tablas en la plataforma.

## 45. Arquitectura de Filtros en Mobile — Two-Level Bottom Sheet (Golden Rule)

**Aplica a TODAS las pantallas del admin, doctor, patient y wholesaler panels que tengan filtros en mobile.**

La experiencia de filtrado en mobile NUNCA debe mostrar todos los valores de todos los grupos de filtros simultáneamente. Con 10 Categorías + 12 Goals + 10 Presentaciones + Proveedores, el usuario procesaría 30+ controles a la vez, lo cual es inaceptable.

### Arquitectura obligatoria: dos niveles en UN ÚNICO bottom sheet

**Nivel 1 — Vista de grupos (default):**
- Filas compactas de `min-height: 56-60px`, una por dimensión de filtro.
- Cada fila muestra: `[Nombre del grupo]` a la izquierda + `[Resumen]  ›` a la derecha.
- Resúmenes: `Any` (sin selección), `Nasal Spray` (1 opción), `3 selected` (>1 opción).
- Grupos activos muestran el resumen en navy/primary + fila con fondo levemente tintado.

**Nivel 2 — Vista de detalle (al tocar un grupo):**
- El contenido del MISMO bottom sheet se sustituye en el lugar. **NUNCA abrir un segundo bottom sheet encima del primero.**
- Cabecera: `← [Nombre del grupo]   ×`
- Opciones como chips: navy fill + checkmark cuando están seleccionados, borde gris cuando no.
- Multi-select soportado; mínimo touch target 44×44px.
- Counts visibles SOLO cuando `count > 0`. Nunca mostrar `()`. Si el count es 0: chip griseado, borde discontinuo, `disabled`.

### Estado pendiente (pending state) — Golden Rule
- **Las selecciones NO se aplican chip a chip ni grupo a grupo.**
- Existe un estado interno `pendingValues` que acumula todos los cambios.
- Solo al tocar "Show X Products" se hace commit de `pendingValues` → se llaman todos los `fo.onChange()` → se cierra el sheet → los resultados se actualizan.
- Esto elimina refetches innecesarios al servidor durante la configuración de filtros.

### Trigger button — Golden Rule
```
[ ⚙ Filters   [2] ]   ← botón full-width, 44px height
```
- Ocupa el 100% del ancho disponible.
- Badge = número de GRUPOS con al menos una selección activa (no suma total de valores).
- Estado activo: borde navy, texto navy, icono navy.

### CTA del footer — Golden Rule
El footer sticky del bottom sheet SIEMPRE debe tener:
- **Izquierda:** `Clear All` (deshabilitado si no hay selecciones pendientes)
- **Derecha:** CTA primario dinámico:
  - `Show 6 Products` — cuando hay resultados (>1)
  - `Show 1 Product` — cuando hay exactamente 1 resultado
  - `No Products Found` — cuando count = 0 (CTA deshabilitado)
  - **NUNCA:** `Apply Filters` — este texto genérico no da contexto al usuario.

### Implementación de referencia
- Componente: `src/components/ui/MobileFiltersSheet.jsx`
- Trigger: `src/components/ui/MobileFiltersSheet.jsx` (export `MobileFilterTrigger`)
- CSS: `src/styles/mobile.css` (clases `mfs-*` y `mft-*`)
- Integración: `src/components/ui/DataModule.jsx` (props `filterOptions`, `resultCount`, `onClearAll`)

### Especificaciones técnicas mínimas
- Sheet: `max-height: min(92vh, 700px)`, `border-radius: 20px 20px 0 0`
- Animación: `translateY(100%) → translateY(0)`, `cubic-bezier(0.32, 0.72, 0, 1)`, 320ms
- Backdrop: `rgba(0,0,0,0.48)` con transición suave
- iOS safe area: `padding-bottom: env(safe-area-inset-bottom)`
- `z-index`: overlay 500, sheet 501 (por encima de la bottom nav)
- `document.body.style.overflow = 'hidden'` cuando el sheet está abierto
- Cierre: × button (siempre visible), tap en backdrop, tecla Escape
- El body scroll se previene cuando el sheet está abierto

### Chips activos en pantalla principal (fuera del sheet)
- Los filtros aplicados permanecen visibles debajo del trigger como chips removibles.
- Scroll horizontal en el área de chips (no wrapping vertical).
- `Clear all` disponible al final de los chips activos.
- Eliminar un chip individual aplica inmediatamente sin abrir el sheet.

## 33. Máximo 3 Acciones Visibles por Fila en Desktop/Laptop (Golden Rule — Regla de los Tres Puntos ⋯)
- **En cualquier tabla o componente tabular en escritorio/laptop, la columna de acciones DEBE limitar las acciones directas visibles a un máximo de 3.**
- Se debe utilizar siempre `<AppActionGroup maxVisible={3} actions={[...]} />`.
- **Comportamiento forzado**:
  - Las **primeras 3 acciones principales** se muestran como iconos de acción directa.
  - Todas las acciones adicionales (partiendo de la 4ª acción en adelante) **DEBEN agruparse automáticamente en un menú desplegable de tres puntos (`⋯` / `MoreHorizontal`)**.
- **Beneficios UX**: Evita el desbordamiento horizontal de celdas en portátiles, mantiene el ancho de la columna de acciones compacto (≤130px), y garantiza una interfaz ultra limpia y corporativa sin importar cuántas acciones secundarias tenga un registro.

