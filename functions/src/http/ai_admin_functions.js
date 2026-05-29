"use strict";
/**
 * ai_admin_functions.js — Gemini Function Calling tools for AdminAI.
 *
 * Exports:
 *  - ADMIN_TOOLS          → tool declarations array for Gemini API
 *  - WRITE_FUNCTIONS      → Set of function names that mutate Firestore
 *  - executeReadOnlyFunction(fn, args, db) → runs safe read queries
 *  - executeWriteFunction(fn, args, db, callerUid) → writes + audit_log
 */

// ── Tool declarations (Gemini Function Calling schema) ────────────────────────
const ADMIN_TOOLS = [
  {
    functionDeclarations: [
      {
        name: "get_product_pricing",
        description: "Returns the full pricing breakdown for a specific product: costPrice, retail, wholesale, clinic, and master/distributor tiers, plus computed margins.",
        parameters: {
          type: "OBJECT",
          properties: {
            product_id: {
              type: "STRING",
              description: "The Firestore document ID or slug of the product to query."
            }
          },
          required: ["product_id"]
        }
      },
      {
        name: "list_products_by_margin",
        description: "Lists all active products sorted by retail margin (ascending or descending). Returns product name, costPrice, retailPrice, and margin %.",
        parameters: {
          type: "OBJECT",
          properties: {
            order: {
              type: "STRING",
              enum: ["asc", "desc"],
              description: "Sort order: 'asc' = lowest margin first, 'desc' = highest margin first."
            },
            limit: {
              type: "INTEGER",
              description: "Maximum number of products to return (default 10, max 50)."
            }
          },
          required: ["order"]
        }
      },
      {
        name: "update_product_price",
        description: "Proposes a price change for a specific tier of a product. REQUIRES admin confirmation before execution. Writes to audit_log.",
        parameters: {
          type: "OBJECT",
          properties: {
            product_id: {
              type: "STRING",
              description: "Firestore document ID of the product."
            },
            tier: {
              type: "STRING",
              enum: ["retail", "wholesale", "clinic", "master"],
              description: "Which pricing tier to update."
            },
            new_price: {
              type: "NUMBER",
              description: "The new price in USD."
            },
            variant_index: {
              type: "INTEGER",
              description: "Index of the variant to update (default 0 for the first/only variant)."
            }
          },
          required: ["product_id", "tier", "new_price"]
        }
      },
      {
        name: "update_product_cost",
        description: "Proposes a costPrice change for a product. REQUIRES admin confirmation before execution. Writes to audit_log.",
        parameters: {
          type: "OBJECT",
          properties: {
            product_id: {
              type: "STRING",
              description: "Firestore document ID of the product."
            },
            new_cost: {
              type: "NUMBER",
              description: "The new cost price in USD."
            }
          },
          required: ["product_id", "new_cost"]
        }
      },
      {
        name: "list_users",
          description: "Lists users from the users collection, with options to filter by role, limit, and keyword search.",
          parameters: {
            type: "OBJECT",
            properties: {
              role: {
                type: "STRING",
                description: "Filter users by their role (e.g. 'doctor', 'wholesaler', 'patient', 'admin')."
              },
              limit: {
                type: "INTEGER",
                description: "Maximum number of users to return (default 20)."
              },
              search: {
                type: "STRING",
                description: "Case-insensitive keyword search matching user email, name, or ID."
              }
            }
          }
        },
        {
          name: "get_pending_approvals",
          description: "Lists all users with approved status set to false who belong to the doctor, wholesaler, professional_pending, or patient roles.",
          parameters: {
            type: "OBJECT",
            properties: {}
          }
        },
        {
          name: "update_user_role",
          description: "Proposes an update to a user's role and/or approved status. REQUIRES admin confirmation before execution. Writes to audit_log.",
          parameters: {
            type: "OBJECT",
            properties: {
              user_id: {
                type: "STRING",
                description: "The user's document ID, email, or full/display name."
              },
              role: {
                type: "STRING",
                description: "The new role to assign to the user."
              },
              approved: {
                type: "BOOLEAN",
                description: "The new approved status to set for the user."
              }
            },
            required: ["user_id"]
          }
        },
        {
          name: "batch_update_product_price",
          description: "Batch updates multiple prices for products. Used primarily when confirming an imported price list.",
          parameters: {
            type: "OBJECT",
            properties: {
              updates: {
                type: "ARRAY",
                items: {
                  type: "OBJECT",
                  properties: {
                    product_id: { type: "STRING" },
                    new_price: { type: "NUMBER" }
                  }
                }
              }
            },
            required: ["updates"]
          }
        },
        {
          name: "batch_update_product_stock",
          description: "Batch updates stock levels for multiple products. Used primarily when confirming an imported stock list.",
          parameters: {
            type: "OBJECT",
            properties: {
              updates: {
                type: "ARRAY",
                items: {
                  type: "OBJECT",
                  properties: {
                    product_id: { type: "STRING" },
                    new_stock: { type: "NUMBER" }
                  }
                }
              }
            },
            required: ["updates"]
          }
        },
        {
          name: "update_regional_price",
          description: "Updates the price for a specific geographic region (e.g., 'EU', 'US', 'UK').",
          parameters: {
            type: "OBJECT",
            properties: {
              product_id: { type: "STRING", description: "Firestore document ID of the product." },
              region: { type: "STRING", description: "Region code, e.g., 'EU', 'US', 'UK'." },
              new_price: { type: "NUMBER", description: "The new price for this region." }
            },
            required: ["product_id", "region", "new_price"]
          }
        },
        {
          name: "update_geographic_restriction",
          description: "Blocks or unblocks a product from being sold in a specific region.",
          parameters: {
            type: "OBJECT",
            properties: {
              product_id: { type: "STRING", description: "Firestore document ID of the product." },
              region: { type: "STRING", description: "Region code, e.g., 'EU', 'US', 'UK'." },
              restricted: { type: "BOOLEAN", description: "True to block sales, false to allow." }
            },
            required: ["product_id", "region", "restricted"]
          }
        },
        {
          name: "generate_contextual_summary",
          description: "Generates a 3-bullet point contextual summary of an entity (user, order, product). Uses Firestore data directly.",
          parameters: {
            type: "OBJECT",
            properties: {
              entity_type: { type: "STRING", description: "One of: 'user', 'order', 'product'" },
              entity_id: { type: "STRING", description: "The Firestore document ID of the entity." }
            },
            required: ["entity_type", "entity_id"]
          }
        }
      ]
    }
];

// Functions that write to Firestore and need confirmation
const WRITE_FUNCTIONS = new Set(["update_product_price", "update_product_cost", "update_user_role", "batch_update_product_price", "batch_update_product_stock", "update_regional_price", "update_geographic_restriction"]);

// ── Read-only function executor ───────────────────────────────────────────────

async function executeReadOnlyFunction(fn, args, db) {
  switch (fn) {
    case "get_product_pricing": {
      const { product_id } = args;
      // Try by doc ID first, then by slug field
      let snap = await db.collection("products").doc(product_id).get();
      if (!snap.exists) {
        const bySlug = await db.collection("products")
          .where("slug", "==", product_id)
          .limit(1)
          .get();
        if (bySlug.empty) {
          return `Product "${product_id}" not found in Firestore.`;
        }
        snap = bySlug.docs[0];
      }
      const p = snap.data();
      const costPrice = p.costPrice || p.cost_price || 0;
      const variant   = (p.variants || [])[0] || {};
      const pricing   = variant.pricing || p.pricing || {};
      const retail    = pricing.retail?.basePrice ?? pricing.retail ?? 0;
      const wholesale = pricing.wholesale?.basePrice ?? pricing.wholesale ?? 0;
      const clinic    = pricing.clinic?.basePrice ?? pricing.clinic ?? 0;
      const master    = pricing.master?.basePrice ?? pricing.master ?? pricing.distributor?.basePrice ?? 0;

      const marginPct = (base, cost) =>
        cost > 0 ? (((base - cost) / base) * 100).toFixed(1) + "%" : "N/A";

      return [
        `**Pricing for: ${p.displayName || p.name || product_id}**`,
        `- Cost Price: $${costPrice.toFixed(2)}`,
        `- Retail: $${retail.toFixed ? retail.toFixed(2) : retail} (margin: ${marginPct(retail, costPrice)})`,
        `- Wholesale: $${wholesale.toFixed ? wholesale.toFixed(2) : wholesale} (margin: ${marginPct(wholesale, costPrice)})`,
        `- Clinic: $${clinic.toFixed ? clinic.toFixed(2) : clinic} (margin: ${marginPct(clinic, costPrice)})`,
        `- Master/Distributor: $${master.toFixed ? master.toFixed(2) : master} (margin: ${marginPct(master, costPrice)})`,
      ].join("\n");
    }

    case "list_products_by_margin": {
      const { order = "desc", limit: rawLimit } = args;
      const maxLimit = Math.min(Number(rawLimit) || 10, 50);
      const snap = await db.collection("products")
        .where("status", "==", "active")
        .get();

      const rows = [];
      snap.forEach(doc => {
        const p = doc.data();
        const cost    = p.costPrice || p.cost_price || 0;
        const variant = (p.variants || [])[0] || {};
        const pricing = variant.pricing || p.pricing || {};
        const retail  = pricing.retail?.basePrice ?? pricing.retail ?? 0;
        if (retail > 0 && cost > 0) {
          const margin = ((retail - cost) / retail) * 100;
          rows.push({
            name:   p.displayName || p.name || doc.id,
            id:     doc.id,
            cost:   cost.toFixed(2),
            retail: retail.toFixed(2),
            margin: margin.toFixed(1)
          });
        }
      });

      rows.sort((a, b) =>
        order === "asc"
          ? parseFloat(a.margin) - parseFloat(b.margin)
          : parseFloat(b.margin) - parseFloat(a.margin)
      );

      const sliced = rows.slice(0, maxLimit);
      if (sliced.length === 0) return "No active products with complete pricing found.";

      const header = `**Products by Retail Margin (${order === "desc" ? "highest → lowest" : "lowest → highest"})**\n`;
      const table  = sliced.map((r, i) =>
        `${i + 1}. **${r.name}** — Cost: $${r.cost} | Retail: $${r.retail} | Margin: ${r.margin}%`
      ).join("\n");
      return header + table;
    }

    case "list_users": {
      const { role, limit = 20, search } = args;
      let queryRef = db.collection("users");
      if (role) {
        queryRef = queryRef.where("role", "==", role);
      }
      
      const snap = await queryRef.get();
      let users = [];
      snap.forEach(doc => {
        const u = doc.data();
        users.push({
          id: doc.id,
          ...u
        });
      });

      if (search) {
        const term = search.toLowerCase();
        users = users.filter(u => {
          const email = (u.email || "").toLowerCase();
          const fullName = (u.fullName || "").toLowerCase();
          const displayName = (u.displayName || "").toLowerCase();
          const id = (u.id || "").toLowerCase();
          return email.includes(term) || fullName.includes(term) || displayName.includes(term) || id.includes(term);
        });
      }

      const limitVal = Number(limit) || 20;
      const sliced = users.slice(0, limitVal);

      if (sliced.length === 0) {
        return "No users found matching the criteria.";
      }

      const header = `**User List (showing ${sliced.length} of ${users.length} matching users):**\n\n`;
      const list = sliced.map((u, i) => {
        const name = u.fullName || u.displayName || "N/A";
        const email = u.email || "N/A";
        const userRole = u.role || "N/A";
        const approvedStatus = u.approved !== undefined ? u.approved : "N/A";
        return `${i + 1}. **${name}** (ID: \`${u.id}\`, Email: ${email}) — Role: *${userRole}* | Approved: **${approvedStatus}**`;
      }).join("\n");

      return header + list;
    }

    case "get_pending_approvals": {
      const snap = await db.collection("users").where("approved", "==", false).get();
      const allowedRoles = new Set(["doctor", "wholesaler", "professional_pending", "patient"]);
      const users = [];
      snap.forEach(doc => {
        const u = doc.data();
        const role = u.role || "";
        if (allowedRoles.has(role)) {
          users.push({
            id: doc.id,
            ...u
          });
        }
      });

      if (users.length === 0) {
        return "No pending approvals found for the roles: doctor, wholesaler, professional_pending, patient.";
      }

      const header = `**Pending Approvals (${users.length}):**\n\n`;
      const list = users.map((u, i) => {
        const name = u.fullName || u.displayName || "N/A";
        const email = u.email || "N/A";
        const userRole = u.role || "N/A";
        return `${i + 1}. **${name}** (ID: \`${u.id}\`, Email: ${email}) — Role: *${userRole}*`;
      }).join("\n");

      return header + list;
    }

    case "generate_contextual_summary": {
      const { entity_type, entity_id } = args;
      if (entity_type === "user") {
        const snap = await db.collection("users").doc(entity_id).get();
        if (!snap.exists) return "User not found.";
        const u = snap.data();
        const created = u.createdAt ? new Date(u.createdAt.seconds ? u.createdAt.seconds * 1000 : u.createdAt).toLocaleDateString() : "Unknown";
        return [
          `**Contextual Summary for User ${u.fullName || u.displayName || u.email}:**`,
          `- **Role & Status:** ${u.role} (Approved: ${u.approved})`,
          `- **Registration:** Joined on ${created}`,
          `- **Location/Contact:** ${u.country || "Unknown Country"} | ${u.email}`
        ].join("\n");
      } else if (entity_type === "order") {
        const snap = await db.collection("orders").doc(entity_id).get();
        if (!snap.exists) return "Order not found.";
        const o = snap.data();
        return [
          `**Contextual Summary for Order #${entity_id.slice(0,6)}:**`,
          `- **Status:** ${o.status}`,
          `- **Value:** $${o.total}`,
          `- **Customer:** ${o.userEmail || o.customerName}`
        ].join("\n");
      } else {
        return "Entity type not supported for summary yet.";
      }
    }

    default:
      return `Unknown read function: ${fn}`;
  }
}

// ── Write function executor (called ONLY after admin confirmation) ─────────────

async function executeWriteFunction(fn, args, db, callerUid) {
  const { FieldValue } = require("firebase-admin/firestore");
  const timestamp = FieldValue.serverTimestamp();

  switch (fn) {
    case "update_product_price": {
      const { product_id, tier, new_price, variant_index = 0 } = args;

      // Locate the product
      let docRef = db.collection("products").doc(product_id);
      let snap   = await docRef.get();
      if (!snap.exists) {
        const bySlug = await db.collection("products")
          .where("slug", "==", product_id).limit(1).get();
        if (bySlug.empty) throw new Error(`Product "${product_id}" not found`);
        docRef = bySlug.docs[0].ref;
        snap   = bySlug.docs[0];
      }

      const p = snap.data();
      const productName = p.displayName || p.name || product_id;

      // Determine the old price for audit
      const variant   = (p.variants || [])[variant_index] || {};
      const pricing   = variant.pricing || p.pricing || {};
      const oldPrice  = pricing[tier]?.basePrice ?? pricing[tier] ?? null;

      // Build update path
      let updatePayload;
      if (p.variants && p.variants.length > 0) {
        // Nested variants structure
        const variantsCopy = [...p.variants];
        if (!variantsCopy[variant_index]) variantsCopy[variant_index] = {};
        if (!variantsCopy[variant_index].pricing) variantsCopy[variant_index].pricing = {};
        if (!variantsCopy[variant_index].pricing[tier]) {
          variantsCopy[variant_index].pricing[tier] = {};
        }
        // Support both flat (number) and object ({basePrice}) formats
        if (typeof variantsCopy[variant_index].pricing[tier] === "number") {
          variantsCopy[variant_index].pricing[tier] = new_price;
        } else {
          variantsCopy[variant_index].pricing[tier].basePrice = new_price;
        }
        updatePayload = { variants: variantsCopy, updatedAt: timestamp };
      } else {
        // Flat pricing structure
        const pricingField = typeof pricing[tier] === "number"
          ? `pricing.${tier}` : `pricing.${tier}.basePrice`;
        updatePayload = { [pricingField]: new_price, updatedAt: timestamp };
      }

      await docRef.update(updatePayload);

      // Write audit log
      const auditEntry = {
        action:      "update_product_price",
        product_id:  docRef.id,
        product_name: productName,
        tier,
        old_price:   oldPrice,
        new_price,
        variant_index,
        executed_by: callerUid || "admin",
        executed_at: timestamp,
        source:      "AdminAI"
      };
      const auditRef = await db.collection("audit_log").add(auditEntry);

      return {
        success: true,
        message: `✅ Price updated: **${productName}** [${tier}] $${oldPrice ?? "?"} → $${new_price}`,
        auditId: auditRef.id,
      };
    }

    case "update_product_cost": {
      const { product_id, new_cost } = args;

      let docRef = db.collection("products").doc(product_id);
      let snap   = await docRef.get();
      if (!snap.exists) {
        const bySlug = await db.collection("products")
          .where("slug", "==", product_id).limit(1).get();
        if (bySlug.empty) throw new Error(`Product "${product_id}" not found`);
        docRef = bySlug.docs[0].ref;
        snap   = bySlug.docs[0];
      }

      const p = snap.data();
      const productName = p.displayName || p.name || product_id;
      const oldCost = p.costPrice || p.cost_price || null;

      await docRef.update({ costPrice: new_cost, updatedAt: timestamp });

      const auditEntry = {
        action:       "update_product_cost",
        product_id:   docRef.id,
        product_name: productName,
        old_cost:     oldCost,
        new_cost,
        executed_by:  callerUid || "admin",
        executed_at:  timestamp,
        source:       "AdminAI"
      };
      const auditRef = await db.collection("audit_log").add(auditEntry);

      return {
        success: true,
        message: `✅ Cost updated: **${productName}** $${oldCost ?? "?"} → $${new_cost}`,
        auditId: auditRef.id,
      };
    }

    case "update_user_role": {
      const { user_id, role, approved } = args;

      let docRef = db.collection("users").doc(user_id);
      let snap = await docRef.get();
      
      if (!snap.exists) {
        // Look up by matching email field
        const byEmail = await db.collection("users")
          .where("email", "==", user_id)
          .limit(1)
          .get();
        if (!byEmail.empty) {
          docRef = byEmail.docs[0].ref;
          snap = byEmail.docs[0];
        } else {
          // Search in memory for fullName or displayName matching the user_id input case-insensitively
          const allUsersSnap = await db.collection("users").get();
          let matchedDoc = null;
          const searchLower = user_id.toLowerCase();
          
          allUsersSnap.forEach(doc => {
            if (matchedDoc) return;
            const u = doc.data();
            const fullName = (u.fullName || "").toLowerCase();
            const displayName = (u.displayName || "").toLowerCase();
            if (fullName === searchLower || displayName === searchLower) {
              matchedDoc = doc;
            }
          });
          
          if (!matchedDoc) {
            throw new Error(`User with ID, email, or name "${user_id}" not found.`);
          }
          
          docRef = matchedDoc.ref;
          snap = matchedDoc;
        }
      }

      const userData = snap.data();
      const oldRole = userData.role || null;
      const oldApproved = userData.approved !== undefined ? userData.approved : null;
      const userName = userData.fullName || userData.displayName || "N/A";

      const updatePayload = {
        updatedAt: timestamp
      };
      if (role !== undefined) {
        updatePayload.role = role;
      }
      if (approved !== undefined) {
        updatePayload.approved = approved;
      }

      await docRef.update(updatePayload);

      // Write audit log
      const auditEntry = {
        action: "update_user_role",
        user_id: docRef.id,
        user_name: userName,
        old_role: oldRole,
        new_role: role !== undefined ? role : oldRole,
        old_approved: oldApproved,
        new_approved: approved !== undefined ? approved : oldApproved,
        executed_by: callerUid || "admin",
        executed_at: timestamp,
        source: "AdminAI"
      };

      const auditRef = await db.collection("audit_log").add(auditEntry);

      return {
        success: true,
        message: `✅ Updated user **${userName}** (ID: \`${docRef.id}\`): set role to **${role !== undefined ? role : 'unchanged'}** and approved status to **${approved !== undefined ? approved : 'unchanged'}**`,
        auditId: auditRef.id,
      };
    }

    case "batch_update_product_price": {
      const { updates } = args;
      let count = 0;
      const batch = db.batch();
      for (const update of updates) {
        if (!update.product_id) continue;
        const ref = db.collection("products").doc(update.product_id);
        batch.update(ref, { "pricing.retail.basePrice": update.new_price, updatedAt: timestamp });
        count++;
      }
      await batch.commit();
      const auditRef = await db.collection("audit_log").add({
        action: "batch_update_product_price",
        count,
        executed_by: callerUid || "admin",
        executed_at: timestamp,
        source: "AdminAI"
      });
      return { success: true, message: `✅ Batch updated ${count} prices.`, auditId: auditRef.id };
    }

    case "batch_update_product_stock": {
      const { updates } = args;
      let count = 0;
      const batch = db.batch();
      for (const update of updates) {
        if (!update.product_id) continue;
        const ref = db.collection("products").doc(update.product_id);
        batch.update(ref, { stock: update.new_stock, updatedAt: timestamp });
        count++;
      }
      await batch.commit();
      const auditRef = await db.collection("audit_log").add({
        action: "batch_update_product_stock",
        count,
        executed_by: callerUid || "admin",
        executed_at: timestamp,
        source: "AdminAI"
      });
      return { success: true, message: `✅ Batch updated ${count} stock levels.`, auditId: auditRef.id };
    }

    case "update_regional_price": {
      const { product_id, region, new_price } = args;
      const docRef = db.collection("products").doc(product_id);
      
      const payload = { updatedAt: timestamp };
      payload[`regionalPricing.${region}`] = new_price;
      
      await docRef.update(payload);
      
      const auditRef = await db.collection("audit_log").add({
        action: "update_regional_price",
        product_id, region, new_price,
        executed_by: callerUid || "admin", executed_at: timestamp, source: "AdminAI"
      });
      return { success: true, message: `✅ Regional price updated for ${region} to $${new_price}`, auditId: auditRef.id };
    }

    case "update_geographic_restriction": {
      const { product_id, region, restricted } = args;
      const docRef = db.collection("products").doc(product_id);
      
      const payload = { updatedAt: timestamp };
      payload[`restrictedRegions.${region}`] = restricted;
      
      await docRef.update(payload);
      
      const auditRef = await db.collection("audit_log").add({
        action: "update_geographic_restriction",
        product_id, region, restricted,
        executed_by: callerUid || "admin", executed_at: timestamp, source: "AdminAI"
      });
      return { success: true, message: `✅ Geographic restriction for ${region} set to ${restricted ? 'BLOCKED' : 'ALLOWED'}`, auditId: auditRef.id };
    }

    default:
      throw new Error(`Unknown write function: ${fn}`);
  }
}

// ── Exports ───────────────────────────────────────────────────────────────────
module.exports = {
  ADMIN_TOOLS,
  WRITE_FUNCTIONS,
  executeReadOnlyFunction,
  executeWriteFunction,
};
