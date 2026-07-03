# Architecture Rules & Best Practices

## 1. Paginación y Carga Lenta Obligatoria (Golden Rule)
- **Nunca traigas todos los documentos de golpe desde Firestore.**
- Elementos como Productos, Protocolos, Prescripciones, Cotizaciones, Proveedores, Médicos, etc., DEBEN usar siempre limit() (por ejemplo, `limit(50)` o `limit(100)`) y, preferiblemente, paginación real.
- Esto evita el bloqueo (congelamiento) del hilo principal de React en módulos masivos.
- Cualquier tabla o lista nueva debe construirse usando la estrategia modular (`DataTable.jsx` o similar) con estados de carga ("Skeletons") controlados por el padre.
