/**
 * Converts a plain JavaScript object to the Cloud Firestore REST API Document fields format.
 * https://cloud.google.com/firestore/docs/reference/rest/v1/projects.databases.documents#Document
 */
function toFirestoreRest(data) {
  if (data === null || data === undefined) return { nullValue: null };
  if (typeof data === 'boolean') return { booleanValue: data };
  if (typeof data === 'string') return { stringValue: data };
  if (typeof data === 'number') {
    if (Number.isInteger(data)) return { integerValue: data.toString() };
    return { doubleValue: data };
  }
  if (Array.isArray(data)) {
    return {
      arrayValue: {
        values: data.map(item => toFirestoreRest(item))
      }
    };
  }
  if (typeof data === 'object') {
    const fields = {};
    for (const [key, value] of Object.entries(data)) {
      fields[key] = toFirestoreRest(value);
    }
    return {
      mapValue: {
        fields: fields
      }
    };
  }
  return { stringValue: data.toString() };
}

const protocolData = {
  "protocol_id": "sa_001",
  "protocol_slug": "skin-aesthetics-ghkcu-structured",
  "protocol_title": "Structured Skin & Aesthetics Protocol",
  "protocol_version": "v6.0",
  "status": "approved",
  "active": true,
  "metadata": {
    "primary_goal": "skin_aesthetics",
    "primary_condition": "skin_quality_photoaging_barrier_support",
    "complexity_level": "standard",
    "visibility": "public",
    "source_type": "curated_library",
    "source_reference": "ReGen_PEPT_Skin_Aesthetics_Protocol_2026",
    "author": {
      "name": "Atlas Health Clinical Team",
      "organization": "Atlas Health",
      "title": "Peptide Specialists"
    },
    "review": {
      "review_status": "approved",
      "last_reviewed_at": "2026-04-01"
    },
    "created_at": "2026-04-01T00:00:00.000Z",
    "updated_at": "2026-04-01T00:00:00.000Z",
    "evidence_basis": {
      "core_active": "GHK-Cu",
      "optional_repair_variant": "BPC-157",
      "optional_procedure_support": "microneedling_checkpoint_logic",
      "evidence_grade_notes": [
        "GHK-Cu-centered skin remodeling has stronger translational and human-supportive literature than most peptide alternatives.",
        "BPC-157 remains primarily translational / preclinical for skin-focused use.",
        "Procedure support logic is optional and intended for aesthetic-clinic workflows."
      ]
    }
  },
  "eligibility_rules": {
    "supported_age_groups": ["18-35", "36-50", "51-65", "65+"],
    "supported_sex": ["female", "male"],
    "supported_goals": [
      "skin_aesthetics",
      "photoaging_support",
      "texture_refinement",
      "post_procedure_recovery",
      "barrier_repair",
      "pigment_support"
    ],
    "required_patient_inputs": [
      "primary_clinical_focus",
      "patient_demographic",
      "age_group",
      "start_date",
      "skin_goal_profile"
    ],
    "contraindications": [
      "active_skin_infection",
      "known_copper_hypersensitivity",
      "active_inflammatory_flare_requiring_medical_management",
      "pregnancy_if_local_policy_requires_exclusion"
    ],
    "relative_cautions": [
      "very_reactive_skin",
      "history_of_postinflammatory_hyperpigmentation",
      "recent_ablative_procedure",
      "impaired_wound_healing_history",
      "active_melasma_flare"
    ]
  },
  "variant_rules": {
    "age_variants": {
      "18-35": {
        "default_duration_weeks": 8,
        "ghkcu_intensity": "standard",
        "recovery_support": "light",
        "monitoring_intensity": "standard"
      },
      "36-50": {
        "default_duration_weeks": 12,
        "ghkcu_intensity": "standard_plus",
        "recovery_support": "moderate",
        "monitoring_intensity": "moderate"
      },
      "51-65": {
        "default_duration_weeks": 16,
        "ghkcu_intensity": "extended",
        "recovery_support": "moderate",
        "monitoring_intensity": "moderate"
      },
      "65+": {
        "default_duration_weeks": 16,
        "ghkcu_intensity": "extended_conservative",
        "recovery_support": "enhanced",
        "monitoring_intensity": "enhanced"
      }
    },
    "sex_variants": {
      "female": {
        "recommended_flags": [
          "pigment_reactivity_watch",
          "barrier_flare_watch"
        ],
        "special_notes": [
          "Use more conservative escalation if PIH or melasma tendency is present."
        ]
      },
      "male": {
        "recommended_flags": [
          "sebaceous_activity_watch",
          "post_shave_irritation_watch"
        ],
        "special_notes": [
          "Barrier-repair emphasis may be useful in high-friction or shaving-related irritation patterns."
        ]
      }
    },
    "duration_variants": {
      "8_weeks": {
        "mode": "short_rejuvenation",
        "procedure_support": false,
        "repair_variant_optional": false
      },
      "12_weeks": {
        "mode": "standard_rejuvenation",
        "procedure_support": true,
        "repair_variant_optional": true
      },
      "16_weeks": {
        "mode": "extended_remodeling",
        "procedure_support": true,
        "repair_variant_optional": true
      },
      "20_weeks": {
        "mode": "extended_remodeling_plus",
        "procedure_support": true,
        "repair_variant_optional": true,
        "extra_checkpoint_logic": true
      }
    },
    "tempo_variants": {
      "conservative": {
        "dose_step_interval_weeks": 4,
        "monitoring_intensity_modifier": "up",
        "procedure_frequency_modifier": "down"
      },
      "standard": {
        "dose_step_interval_weeks": 4,
        "monitoring_intensity_modifier": "none",
        "procedure_frequency_modifier": "standard"
      },
      "aggressive": {
        "dose_step_interval_weeks": 2,
        "monitoring_intensity_modifier": "up",
        "procedure_frequency_modifier": "up",
        "restricted_to": ["18-35", "36-50"]
      }
    },
    "goal_variants": {
      "photoaging_support": {
        "primary_metric_focus": [
          "fine_lines",
          "firmness",
          "texture"
        ],
        "procedure_support": "optional"
      },
      "post_procedure_recovery": {
        "primary_metric_focus": [
          "erythema_resolution",
          "barrier_recovery",
          "downtime_reduction"
        ],
        "procedure_support": "recommended"
      },
      "pigment_support": {
        "primary_metric_focus": [
          "tone_evenness",
          "postinflammatory_mark_resolution"
        ],
        "tempo_default": "conservative"
      }
    }
  },
  "phase_blueprints": [
    {
      "phase_key": "barrier_priming",
      "phase_title": "Barrier Priming",
      "default_start_week": 1,
      "default_duration_weeks": 4,
      "clinical_purpose": [
        "barrier_support",
        "tolerance_building",
        "early_remodeling_signal"
      ],
      "drugs": [
        {
          "product_id": "prd_ghkcu",
          "product_title": "GHK-Cu",
          "route": "topical_or_local_protocol_defined",
          "dose_logic": {
            "dose_unit": "protocol_defined",
            "starting_intensity": "standard",
            "administration_frequency": "daily",
            "administration_days_default": [
              "Monday",
              "Tuesday",
              "Wednesday",
              "Thursday",
              "Friday",
              "Saturday",
              "Sunday"
            ],
            "timing_hint": "evening_or_post_cleansing"
          }
        }
      ],
      "clinical_events": [
        {
          "week": 1,
          "event_type": "baseline_skin_review",
          "title": "Baseline texture, pigment, and barrier review"
        }
      ]
    },
    {
      "phase_key": "remodeling",
      "phase_title": "Remodeling",
      "default_start_week": 5,
      "default_duration_weeks": 4,
      "clinical_purpose": [
        "collagen_support",
        "texture_refinement",
        "wrinkle_support"
      ],
      "drugs": [
        {
          "product_id": "prd_ghkcu",
          "product_title": "GHK-Cu",
          "route": "topical_or_local_protocol_defined",
          "dose_logic": {
            "dose_unit": "protocol_defined",
            "intensity": "standard_plus",
            "administration_frequency": "daily",
            "administration_days_default": [
              "Monday",
              "Tuesday",
              "Wednesday",
              "Thursday",
              "Friday",
              "Saturday",
              "Sunday"
            ]
          }
        },
        {
          "product_id": "prd_bpc157",
          "product_title": "BPC-157",
          "route": "optional_local_repair_variant",
          "dose_logic": {
            "dose_unit": "protocol_defined",
            "intensity": "low_optional",
            "administration_frequency": "3x_week",
            "administration_days_default": ["Monday", "Wednesday", "Friday"],
            "activation_condition": "post_procedure_recovery_variant_or_repair_focus"
          }
        }
      ],
      "clinical_events": [
        {
          "week": 6,
          "event_type": "milestone_review",
          "title": "Texture and tolerance reassessment"
        },
        {
          "week": 8,
          "event_type": "optional_procedure_checkpoint",
          "title": "Optional microneedling / controlled skin-stimulation checkpoint"
        }
      ]
    },
    {
      "phase_key": "consolidation",
      "phase_title": "Consolidation",
      "default_start_week": 9,
      "default_duration_weeks": 4,
      "clinical_purpose": [
        "barrier_recovery",
        "tone_evening",
        "maintenance_of_response"
      ],
      "drugs": [
        {
          "product_id": "prd_ghkcu",
          "product_title": "GHK-Cu",
          "route": "topical_or_local_protocol_defined",
          "dose_logic": {
            "dose_unit": "protocol_defined",
            "intensity": "maintenance",
            "administration_frequency": "5x_week",
            "administration_days_default": [
              "Monday",
              "Tuesday",
              "Wednesday",
              "Thursday",
              "Friday"
            ]
          }
        },
        {
          "product_id": "prd_bpc157",
          "product_title": "BPC-157",
          "route": "optional_local_repair_variant",
          "dose_logic": {
            "dose_unit": "protocol_defined",
            "intensity": "conditional",
            "administration_frequency": "2x_week",
            "administration_days_default": ["Tuesday", "Friday"],
            "activation_condition": "if_repair_signal_or_post_procedure_need_persists"
          }
        }
      ],
      "clinical_events": [
        {
          "week": 12,
          "event_type": "outcome_review",
          "title": "Firmness, texture, tone, and recovery review"
        }
      ]
    }
  ],
  "monitoring_plan": {
    "baseline_required": [
      "standardized_photography",
      "wrinkle_severity_baseline",
      "texture_baseline",
      "pigment_baseline",
      "barrier_reactivity_baseline",
      "procedure_history"
    ],
    "scheduled_checkpoints": [
      {
        "week": 4,
        "type": "tolerance_and_barrier_review",
        "measures": [
          "erythema",
          "irritation",
          "dryness",
          "subjective_tolerance"
        ],
        "purpose": "Confirm barrier readiness and treatment tolerance"
      },
      {
        "week": 8,
        "type": "remodeling_reassessment",
        "measures": [
          "texture_change",
          "fine_line_change",
          "tone_evenness",
          "downtime_if_procedure_used"
        ],
        "purpose": "Assess remodeling response and need for procedure-support variation"
      },
      {
        "week": 12,
        "type": "final_outcome_review",
        "measures": [
          "global_skin_quality",
          "wrinkle_support_response",
          "tone_evenness",
          "barrier_status"
        ],
        "purpose": "End-of-cycle assessment"
      }
    ]
  },
  "expected_outcomes": {
    "qualitative": [
      "improved texture",
      "better skin tone consistency",
      "barrier-support improvement",
      "support for fine line and firmness appearance"
    ],
    "quantitative_ranges": {
      "texture_improvement_expected": "moderate",
      "fine_line_improvement_expected": "mild_to_moderate",
      "recovery_time_reduction_expected": "variable_if_procedure_support_used",
      "tone_evenness_improvement_expected": "mild_to_moderate"
    }
  },
  "generator_rules": {
    "selection_priority": [
      "goal_match",
      "age_variant_match",
      "sex_variant_match",
      "duration_variant_match",
      "reactivity_risk_flags",
      "procedure_support_need"
    ],
    "ghkcu_intensity_profiles": {
      "standard": ["daily", "daily", "daily", "daily"],
      "standard_plus": ["daily", "daily", "daily", "5x_week"],
      "extended": ["daily", "daily", "5x_week", "5x_week"],
      "extended_conservative": ["5x_week", "5x_week", "5x_week", "5x_week"]
    },
    "repair_variant_profiles": {
      "none": [],
      "light": ["2x_week"],
      "moderate": ["3x_week"],
      "conditional": ["activate_only_if_post_procedure_or_repair_signal"]
    }
  },
  "generated_protocol_template": {
    "patient_context": {
      "primary_clinical_focus": null,
      "patient_demographic": null,
      "age_group": null,
      "skin_goal_profile": null,
      "metabolic_status": null,
      "duration_weeks": null,
      "start_date": null,
      "tempo_preference": "standard",
      "procedure_support_enabled": false
    },
    "applied_variants": {
      "age_variant": null,
      "sex_variant": null,
      "duration_variant": null,
      "tempo_variant": "standard",
      "goal_variant": null
    },
    "resolved_phases": [],
    "resolved_timeline": [],
    "resolved_monitoring": [],
    "resolved_costs": {},
    "validation": {
      "state": "NOT_EVALUATED",
      "modules": []
    }
  },
  "legacy_compatibility": {
    "enabled": true,
    "deprecated_fields": [
      "phases",
      "computedTimeline",
      "computedCost"
    ],
    "notes": "Legacy fields may still be generated temporarily for backward compatibility while the generator transitions to blueprint + resolved output mode."
  }
};

const restPayload = toFirestoreRest(protocolData);
console.log(JSON.stringify(restPayload, null, 2));
