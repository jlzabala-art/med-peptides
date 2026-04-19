const protocolData = {
  active: true,
  author: "system",
  complexity_level: "standard",
  created_at: "2026-04-02T05:40:00.000Z",
  economics: {
    total_protocol_cost_estimate: 1140,
    total_vials_required: 12
  },
  monitoring_plan: {
    baseline_required: ["photography", "skin_scoring"],
    checkpoints: [
      { week: 4, type: "barrier_review" },
      { week: 8, type: "remodeling_review" },
      { week: 12, type: "final_review" }
    ]
  },
  phases: [
    {
      phase_key: "barrier_priming",
      phase_title: "Barrier Priming",
      default_duration_weeks: 4,
      drugs: [
        {
          product_id: "prd_ghkcu",
          product_title: "GHK-Cu",
          route: "topical",
          dose_intensity: "standard",
          administration_frequency: "daily"
        }
      ]
    },
    {
      phase_key: "remodeling",
      phase_title: "Active Remodeling",
      default_duration_weeks: 4,
      drugs: [
        {
          product_id: "prd_ghkcu",
          product_title: "GHK-Cu",
          route: "topical",
          dose_intensity: "standard_plus",
          administration_frequency: "daily"
        },
        {
          product_id: "prd_bpc157",
          product_title: "BPC-157",
          product_slug: "bpc-157",
          route: "localized_optional",
          dose_intensity: "low_optional",
          administration_frequency: "3x_week",
          activation_condition: "post_procedure_support"
        }
      ]
    },
    {
      phase_key: "consolidation",
      phase_title: "Consolidation & Maintenance",
      default_duration_weeks: 4,
      drugs: [
        {
          product_id: "prd_ghkcu",
          product_title: "GHK-Cu",
          route: "topical",
          dose_intensity: "maintenance",
          administration_frequency: "5x_week"
        }
      ]
    }
  ],
  primary_goal: "Skin / Anti-Aging",
  protocol_duration_weeks: 12,
  protocol_id: "sa_001",
  protocol_is_curated: true,
  protocol_is_physician_authored: false,
  protocol_slug: "skin-aesthetics-ghkcu-structured",
  protocol_title: "Structured Skin & Aesthetics Protocol",
  status: "approved",
  updated_at: "2026-04-02T05:40:00.000Z",
  visibility: "public"
};

/**
 * Converts a JS object to Firestore REST API field format
 */
function toFirestoreFields(obj) {
  const fields = {};
  for (const key in obj) {
    const val = obj[key];
    if (typeof val === 'boolean') {
      fields[key] = { booleanValue: val };
    } else if (typeof val === 'number') {
      if (Number.isInteger(val)) {
        fields[key] = { integerValue: val.toString() };
      } else {
        fields[key] = { doubleValue: val };
      }
    } else if (typeof val === 'string') {
      fields[key] = { stringValue: val };
    } else if (Array.isArray(val)) {
      fields[key] = {
        arrayValue: {
          values: val.map(v => {
            if (typeof v === 'object') return { mapValue: { fields: toFirestoreFields(v) } };
            if (typeof v === 'string') return { stringValue: v };
            return { stringValue: String(v) };
          })
        }
      };
    } else if (typeof val === 'object' && val !== null) {
      fields[key] = { mapValue: { fields: toFirestoreFields(val) } };
    }
  }
  return fields;
}

const restPayload = {
  fields: toFirestoreFields(protocolData)
};

console.log(JSON.stringify(restPayload, null, 2));
