# Tareas Completadas
- [x] Verificado el enrutamiento de `AccountManagerDashboard.jsx`. La navegación ya utiliza React Router con sub-rutas `/account-manager/*` como `/account-manager/clients`.
- [x] Verificada la configuración en `App.jsx` que ya soporta rutas anidadas.
- [x] Actualizado `PortalLayout.jsx` a un aspecto premium "Vademecum style".
  - Se agregó efecto Glassmorphism (`backdrop-filter`) a la barra de navegación.
  - Se actualizaron los estilos del buscador con sombras suaves y foco animado.
  - Se mejoraron los botones e íconos con transiciones suaves y fondos translúcidos.
- [x] Auditados los componentes críticos (`OrdersTab.jsx`, `AdminBulkOrdersTab.jsx`, `WholesalerBulkOrderBuilder.jsx` y `DoctorPrescriptionBuilder.jsx`) e implementada la función `logAction` de trazabilidad para registrar las operaciones de edición.
- [x] Revisadas consultas complejas y añadidos índices compuestos en `firestore.indexes.json` para soportar consultas con múltiples `where` y `orderBy` en la colección `orders` (`paymentOwnerId`, `accountManagerId` y `doctorId` combinados con `createdAt`).
- [x] Implement tools `list_users`, `get_pending_approvals`, `update_user_role` in `ai_admin_functions.js`
- [x] Update `ai.js` to handle `update_user_role` confirmations and update instructions to suggest role editing
- [x] Implement backend query endpoint or tool for attention items
- [x] Add real attention notification dropdown in `PortalLayout.jsx` topbar
- [x] Verify build & test functionality
- [x] Refactor `PatientHome.jsx` to use `DashboardEngine`
- [x] Refactor `DoctorHome.jsx` to integrate Atlas Health and Mensajes
- [x] Refactor `WholesalerHome.jsx` to integrate Atlas Health and Mensajes
- [x] Ensure `PharmacyHome.jsx` accurately utilizes `DashboardEngine`
- [x] Document the B2B Supply Chain hierarchy (Supplier vs Wholesaler vs Compounding Pharmacy) in `implementation_plan.md`

### Global App Enhancements
- [x] Replace all remaining "med-peptides" text with "Atlas Health" (index.html, manifest, robots, App.jsx)
- [x] Fix `AppSidebar` customization logic so that favorited items visually show their active "pinned" star icon regardless of which group they are rendered in.ity
