# 🔥 Configuración Firebase — med-peptides.com

## Proyecto oficial

| Campo | Valor |
|---|---|
| **Project ID** | `med-peptides-app` |
| **Dominio custom** | https://med-peptides.com |
| **Hosting URL** | https://med-peptides-app-27a3a.web.app |
| **Firebase Console** | https://console.firebase.google.com/project/med-peptides-app |

> ⚠️ **REGLA FUNDAMENTAL**: Todos los datos de este proyecto (productos,
> ajustes, FAQs, usuarios, protocolos, etc.) **siempre** se guardan en
> `med-peptides-app`. Nunca usar `regenpept-web-app` ni ningún otro proyecto.

---

## Colecciones principales en Firestore

| Colección | Descripción |
|---|---|
| `products` | Catálogo de péptidos (117 docs) |
| `catalogProducts` | Vista de catálogo (119 docs) |
| `settings` | Configuración global de la app |
| `peptide_faq` | FAQs por péptido (474 docs) |
| `faq_peptide_mapping` | Mapeo FAQ ↔ péptido (468 docs) |
| `faq_categories` | Categorías FAQ |
| `peptide_compare_blocks` | Bloques de comparación (52 docs) |
| `discovery_config` | Configuración de discovery |
| `saved_protocols` | Protocolos guardados por usuarios |
| `users` | Perfiles de usuario (Firestore) |

---

## Archivos de configuración clave

| Archivo | Propósito |
|---|---|
| `src/firebase.js` | Config Firebase del cliente (apunta a `med-peptides-app`) |
| `.firebaserc` | Proyecto y targets de hosting |
| `firebase.json` | Config de hosting, reglas, etc. |

---

## Despliegue

```bash
# Build + deploy completo
npm run build
npx firebase-tools deploy --only hosting --project med-peptides-app
```

---

## Migración (histórico — solo referencia)

El catálogo se migró desde `regenpept-web-app` → `med-peptides-app` el 19 abril 2026
usando `scripts/migrateFirestoreProjects.mjs`. **No es necesario volver a ejecutarlo.**

Los service account files (`serviceAccount-source.json`, `serviceAccount-target.json`)
están en `.gitignore` y nunca deben subirse al repositorio.
