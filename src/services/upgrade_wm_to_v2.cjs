const fs = require('fs');
const path = require('path');

const wmStructured = JSON.parse(fs.readFileSync('/Users/joseluiszabala/Documents/Antigravity/regenpept-web/src/services/weight_management_protocols_structured.json', 'utf8'));
const bundleDir = '/Users/joseluiszabala/Documents/Antigravity/regenpept-web/src/services/protocol_builder_2_0_protocols_bundle';

wmStructured.forEach(p => {
    const blueprint = {
        protocol_id: p.protocol_id,
        protocol_slug: p.protocol_slug,
        protocol_title: p.protocol_title,
        protocol_version: "v6.1",
        status: "approved",
        active: true,
        metadata: {
            primary_goal: "Weight Management / Obesity",
            primary_condition: "metabolic_dysfunction_obesity",
            complexity_level: p.complexity_level,
            visibility: "public",
            source_type: "curated_library",
            author: {
                name: "ReGen PEPT Clinical Team",
                organization: "ReGen PEPT",
                title: "Peptide Specialists"
            },
            review: {
                review_status: "approved",
                last_reviewed_at: new Date().toISOString().split('T')[0]
            }
        },
        eligibility_rules: {
            supported_age_groups: ["18-35", "36-50", "51-65", "65+"],
            supported_sex: ["female", "male"],
            supported_goals: ["weight_loss", "metabolic_health", "body_composition"],
            required_patient_inputs: ["bmi", "weight", "height", "age_group"]
        },
        variant_rules: {
            age_variants: {
                "65+": { mode: "conservative", caution: "low_starting_dose" }
            },
            tempo_variants: {
                "conservative": { dose_step_interval_weeks: 4 },
                "standard": { dose_step_interval_weeks: 4 },
                "aggressive": { dose_step_interval_weeks: 2 }
            }
        },
        phase_blueprints: p.phases.map(ph => ({
            phase_key: ph.phase_key,
            phase_title: ph.phase_title,
            default_duration_weeks: ph.default_duration_weeks,
            drugs: ph.drugs.map(d => ({
                product_id: d.product_id,
                product_title: d.product_title,
                route: d.route,
                dose_logic: {
                    administration_frequency: d.administration_frequency,
                    intensity: d.dose_intensity
                }
            }))
        })),
        monitoring_plan: {
            baseline_required: ["weight", "bmi", "comprehensive_metabolic_panel"],
            scheduled_checkpoints: p.monitoring_plan.checkpoints
        }
    };

    fs.writeFileSync(path.join(bundleDir, `${p.protocol_id}.json`), JSON.stringify(blueprint, null, 2));
    console.log(`Generated 2.0 Blueprint for ${p.protocol_id}`);
});
