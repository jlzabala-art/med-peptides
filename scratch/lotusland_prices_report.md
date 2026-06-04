# Reporte de Batería de Pruebas de Precios (Lotusland)

Este reporte detalla los resultados de la batería de pruebas de precios para conseguir los costos de **API Peptides** y **Peptide Vials** de Lotusland.

## Resumen de Cobertura de Precios

* **Total de Productos Lotusland**: 170
* **Precios Conseguidos**: 164 (96.5%)
* **Gaps (Sin precio)**: 6 (3.5%)

### Desglose por Fuentes de Obtención

- **Firestore (Base)**: 35 (20.6%)
- **Local v2 Catalog**: 129 (75.9%)
- **UNRESOLVED (GAP)**: 6 (3.5%)

---

## Mapeos de Costo Destacados

A continuación se muestran ejemplos representativos de los precios de costo conciliados por categoría:

### API Peptides (Materia Prima a Granel)
* **SS-31**: $780.00 por gramo (Fuente: Firestore (Base))
* **Humamin**: $4600.00 por gramo (Fuente: Firestore (Base))
* **Semax**: $640.00 por gramo (Fuente: Firestore (Base))
* **Alprostadil**: $4930.00 por gramo (Fuente: Firestore (Base))
* **MGF**: $3240.00 por gramo (Fuente: Firestore (Base))
* **CJC-1295 Acetate**: $4300.00 por gramo (Fuente: Firestore (Base))
* **AOD 9604 Acetate**: $2856.00 por gramo (Fuente: Firestore (Base))
* **Kisspeptin**: $1300.00 por gramo (Fuente: Firestore (Base))

### Peptide Vials (Viales Terminados)
* **5-AMINO 1 MQ**: $55.20 por unidad/vial (Fuente: Local v2 Catalog)
* **5-AMINO 1 MQ**: $55.20 por unidad/vial (Fuente: Local v2 Catalog)
* **5-AMINO 1 MQ**: $55.20 por unidad/vial (Fuente: Local v2 Catalog)
* **AOD-9604**: $12.00 por unidad/vial (Fuente: Local v2 Catalog)
* **AOD-9604**: $12.00 por unidad/vial (Fuente: Local v2 Catalog)
* **ARA-290**: $72.00 por unidad/vial (Fuente: Local v2 Catalog)
* **BPC-157**: $48.00 por unidad/vial (Fuente: Local v2 Catalog)
* **BPC-157**: $48.00 por unidad/vial (Fuente: Local v2 Catalog)

---

## Gaps Identificados (Productos sin Precio)

Los siguientes productos de Lotusland **no** tienen ningún costo de compra en Firestore, en los catálogos v2 ni en Zoho Books. Deben ser cotizados manualmente:

* **[Longevity & Anti-Aging]** NMN (SKU: MP-ANT-NMN-50MG/TABLET, ID: NMN-50mg-tablet)
* **[Metabolic & Weight]** Tirzepatide (SKU: MP-WEI-TIRZEP-10MG/VIAL, ID: Tirzepatide-10mg-vial)
* **[Metabolic & Weight]** Tirzepatide (SKU: MP-WEI-TIRZEP-15MG/VIAL, ID: Tirzepatide-15mg-vial)
* **[Metabolic & Weight]** Tirzepatide (SKU: MP-WEI-TIRZEP-30MG/VIAL, ID: Tirzepatide-30mg-vial)
* **[Metabolic & Weight]** Tirzepatide (SKU: MP-WEI-TIRZEP-5MG/VIAL, ID: Tirzepatide-5mg-vial)
* **[Metabolic & Weight]** Tirzepatide (SKU: MP-WEI-TIRZEP-60MG/VIAL, ID: Tirzepatide-60mg-vial)
