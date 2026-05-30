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
        },
        {
          name: "query_inactive_users",
          description: "CRITICAL TOOL: ALWAYS use this tool when the user asks to find, filter, or list 'inactive users', 'users inactive for X days', or 'users who haven't logged in'. Searches for users who have been inactive for a specified number of days.",
          parameters: {
            type: "OBJECT",
            properties: {
              days: { type: "INTEGER", description: "Number of days of inactivity (default 30)." }
            }
          }
        },
        {
          name: "list_wholesalers",
          description: "Lists wholesalers, optionally filtering by approved status.",
          parameters: {
            type: "OBJECT",
            properties: {
              status: { type: "STRING", enum: ["approved", "pending", "all"], description: "Filter by status." }
            }
          }
        },
        {
          name: "suspend_user",
          description: "Proposes suspending a user. REQUIRES admin confirmation before execution. Writes to audit_log.",
          parameters: {
            type: "OBJECT",
            properties: {
              user_id: { type: "STRING", description: "The user's document ID or email." },
              reason: { type: "STRING", description: "Reason for suspension." }
            },
            required: ["user_id", "reason"]
          }
        },
        {
          name: "get_product_inventory",
          description: "Provides a breakdown of product stock. Can filter by low stock.",
          parameters: {
            type: "OBJECT",
            properties: {
              low_stock_only: { type: "BOOLEAN", description: "If true, only returns products with stock <= 10." }
            }
          }
        },
        {
          name: "get_sales_report",
          description: "Generates a sales report for a specific timeframe (today, week, month).",
          parameters: {
            type: "OBJECT",
            properties: {
              timeframe: { type: "STRING", enum: ["today", "week", "month", "all"], description: "Timeframe for the report." }
            },
            required: ["timeframe"]
          }
        },
        {
          name: "get_pending_orders",
          description: "Lists orders that have not been shipped or processed yet.",
          parameters: {
            type: "OBJECT",
            properties: {}
          }
        },
        {
          name: "update_order_status",
          description: "Proposes changing an order's status (e.g. to shipped or cancelled). REQUIRES admin confirmation.",
          parameters: {
            type: "OBJECT",
            properties: {
              order_id: { type: "STRING", description: "The ID of the order." },
              new_status: { type: "STRING", enum: ["processing", "shipped", "delivered", "cancelled"], description: "The new status." }
            },
            required: ["order_id", "new_status"]
          }
        },
        {
          name: "analyze_order_risk",
          description: "Analyzes an order for fraud or business risk based on value, account age, and item quantities.",
          parameters: {
            type: "OBJECT",
            properties: {
              order_id: { type: "STRING", description: "The ID of the order to analyze." }
            },
            required: ["order_id"]
          }
        },
        {
          name: "forecast_inventory_needs",
          description: "Calculates sales velocity over the last 30 days to predict which products will run out of stock in the given timeframe.",
          parameters: {
            type: "OBJECT",
            properties: {
              days_ahead: { type: "INTEGER", description: "Number of days ahead to forecast (default 30)." }
            }
          }
        },
        {
          name: "create_discount_campaign",
          description: "Creates a discount code. REQUIRES admin confirmation.",
          parameters: {
            type: "OBJECT",
            properties: {
              code_name: { type: "STRING", description: "The promo code string (e.g. BLACKFRIDAY15)." },
              discount_type: { type: "STRING", enum: ["percentage", "fixed"], description: "Type of discount." },
              amount: { type: "NUMBER", description: "The discount amount (e.g. 15 for 15%)." },
              days_valid: { type: "INTEGER", description: "How many days the code is valid for." }
            },
            required: ["code_name", "discount_type", "amount", "days_valid"]
          }
        },
        {
          name: "draft_segment_email",
          description: "Drafts a marketing or retention email for a specific user segment.",
          parameters: {
            type: "OBJECT",
            properties: {
              segment: { type: "STRING", enum: ["inactive", "vip", "abandoned_cart", "all"], description: "The user segment to target." },
              goal: { type: "STRING", description: "The goal of the email (e.g. 'offer 10% discount', 'announce new product')." }
            },
            required: ["segment", "goal"]
          }
        },
        {
          name: "get_top_selling_products",
          description: "Returns the most sold products based on historical orders.",
          parameters: {
            type: "OBJECT",
            properties: {
              limit: { type: "INTEGER", description: "How many products to return (default 5)." }
            }
          }
        },
        {
          name: "get_customer_ltv",
          description: "Calculates the Lifetime Value (LTV) for a specific user.",
          parameters: {
            type: "OBJECT",
            properties: {
              user_id: { type: "STRING", description: "The user's document ID or email." }
            },
            required: ["user_id"]
          }
        },
        {
          name: "simulate_margin_impact",
          description: "Simulates the revenue impact of changing a product's price based on its recent sales volume.",
          parameters: {
            type: "OBJECT",
            properties: {
              product_id: { type: "STRING", description: "The product ID." },
              new_price: { type: "NUMBER", description: "The hypothetical new retail price." }
            },
            required: ["product_id", "new_price"]
          }
        },
        {
          name: "get_user_activity_summary",
          description: "Returns an audit summary of recent actions or orders performed by a specific user.",
          parameters: {
            type: "OBJECT",
            properties: {
              user_id: { type: "STRING", description: "The user's document ID." }
            },
            required: ["user_id"]
          }
        },
        {
          name: "create_purchase_order",
          description: "Proposes creating a purchase order for laboratory suppliers to restock products. REQUIRES admin confirmation.",
          parameters: {
            type: "OBJECT",
            properties: {
              items: {
                type: "ARRAY",
                items: {
                  type: "OBJECT",
                  properties: {
                    product_id: { type: "STRING" },
                    quantity: { type: "INTEGER" }
                  }
                }
              },
              supplier: { type: "STRING", description: "Supplier name." }
            },
            required: ["items", "supplier"]
          }
        }
      ]
    }
];

// Functions that write to Firestore and need confirmation
const WRITE_FUNCTIONS = new Set(["update_product_price", "update_product_cost", "update_user_role", "batch_update_product_price", "batch_update_product_stock", "update_regional_price", "update_geographic_restriction", "suspend_user", "update_order_status", "create_discount_campaign", "create_purchase_order"]);

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

    case "query_inactive_users": {
      const { days = 30 } = args;
      const snap = await db.collection("users").get();
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - Number(days));
      const cutoffTime = cutoff.getTime();
      
      let inactive = [];
      snap.forEach(doc => {
        const u = doc.data();
        let lastActivity = u.lastLogin ? (u.lastLogin.seconds ? u.lastLogin.seconds * 1000 : u.lastLogin) : 
                           (u.createdAt ? (u.createdAt.seconds ? u.createdAt.seconds * 1000 : u.createdAt) : 0);
        if (lastActivity && lastActivity < cutoffTime) {
          inactive.push({ id: doc.id, name: u.fullName || u.displayName || "Unknown", email: u.email, role: u.role, lastActivity: new Date(lastActivity).toLocaleDateString() });
        }
      });
      if (inactive.length === 0) return `No users found who have been inactive for more than ${days} days.`;
      
      const header = `**Inactive Users (>${days} days) [${inactive.length} found]:**\n\n`;
      const list = inactive.slice(0, 20).map((u, i) => `${i + 1}. **${u.name}** (${u.email}) — Role: ${u.role || 'N/A'} | Last Active: ${u.lastActivity}`).join("\n");
      return header + list + (inactive.length > 20 ? `\n...and ${inactive.length - 20} more.` : '');
    }

    case "list_wholesalers": {
      const { status = "all" } = args;
      let query = db.collection("users").where("role", "==", "wholesaler");
      if (status === "approved") query = query.where("approved", "==", true);
      if (status === "pending") query = query.where("approved", "==", false);
      const snap = await query.get();
      if (snap.empty) return `No wholesalers found with status: ${status}.`;
      
      const list = [];
      snap.forEach(doc => {
        const u = doc.data();
        list.push(`- **${u.fullName || u.displayName || u.email}** (ID: \`${doc.id}\`) — Approved: ${u.approved ? 'Yes' : 'No'}`);
      });
      return `**Wholesalers (${status}):**\n\n` + list.join("\n");
    }

    case "get_product_inventory": {
      const { low_stock_only } = args;
      const snap = await db.collection("products").get();
      let products = [];
      snap.forEach(doc => {
        const p = doc.data();
        if (p.status === 'active') {
          const stock = typeof p.stock === 'number' ? p.stock : 0;
          products.push({ name: p.displayName || p.name || doc.id, stock });
        }
      });
      if (low_stock_only) {
        products = products.filter(p => p.stock <= 10);
      }
      products.sort((a, b) => a.stock - b.stock);
      
      if (products.length === 0) return low_stock_only ? "No active products are low on stock." : "No active products found.";
      const header = low_stock_only ? "**Low Stock Alert (<= 10):**\n\n" : "**Full Inventory:**\n\n";
      const list = products.slice(0, 30).map((p, i) => `${i + 1}. **${p.name}** — Stock: ${p.stock}`).join("\n");
      return header + list;
    }

    case "get_sales_report": {
      const { timeframe } = args;
      const snap = await db.collection("orders").get();
      let totalSales = 0;
      let orderCount = 0;
      const now = new Date();
      let cutoff = new Date(0);
      if (timeframe === "today") {
        cutoff.setHours(0,0,0,0);
      } else if (timeframe === "week") {
        cutoff.setDate(now.getDate() - 7);
      } else if (timeframe === "month") {
        cutoff.setMonth(now.getMonth() - 1);
      }
      
      const cutoffTime = cutoff.getTime();
      
      snap.forEach(doc => {
        const o = doc.data();
        let orderDate = o.createdAt ? (o.createdAt.seconds ? o.createdAt.seconds * 1000 : o.createdAt) : 0;
        if (orderDate >= cutoffTime && o.status !== 'cancelled') {
          totalSales += Number(o.total) || 0;
          orderCount++;
        }
      });
      
      return `**Sales Report (${timeframe}):**\n- Total Valid Orders: ${orderCount}\n- Revenue: $${totalSales.toFixed(2)}`;
    }

    case "get_pending_orders": {
      // Firebase "in" array length limit is 10, ["pending", "processing"] is 2
      const snap = await db.collection("orders").where("status", "in", ["pending", "processing"]).get();
      if (snap.empty) return "No pending or processing orders found.";
      
      let list = [];
      snap.forEach(doc => {
        const o = doc.data();
        const date = o.createdAt ? new Date(o.createdAt.seconds ? o.createdAt.seconds * 1000 : o.createdAt).toLocaleDateString() : "Unknown";
        list.push(`- **Order #${doc.id.slice(0,6)}** (${date}) — $${o.total || 0} — Status: *${o.status}* — Customer: ${o.userEmail || o.customerName || 'Unknown'}`);
      });
      return `**Pending Orders (${snap.size}):**\n\n` + list.slice(0, 15).join("\n") + (snap.size > 15 ? `\n\n...and ${snap.size - 15} more.` : '');
    }

    case "analyze_order_risk": {
      const { order_id } = args;
      const docRef = db.collection("orders").doc(order_id);
      const snap = await docRef.get();
      if (!snap.exists)      return `User \`${user_id}\` suspended.`;
    }

    case "create_purchase_order": {
      const { items, supplier } = args;
      
      // Calculate total cost and bundle items
      let totalCost = 0;
      const poItems = [];
      for (const item of items) {
        let pSnap = await db.collection("products").doc(item.product_id).get();
        if (!pSnap.exists) {
          const bySlug = await db.collection("products").where("slug", "==", item.product_id).limit(1).get();
          if (!bySlug.empty) pSnap = bySlug.docs[0];
        }
        
        const cost = pSnap.exists ? Number(pSnap.data().costPrice || pSnap.data().cost_price || 0) : 0;
        const name = pSnap.exists ? (pSnap.data().displayName || pSnap.data().name) : item.product_id;
        
        totalCost += (cost * item.quantity);
        poItems.push({
          productId: pSnap.id || item.product_id,
          name: name,
          quantity: item.quantity,
          unitCost: cost,
          totalLineCost: cost * item.quantity
        });
      }
      
      const docRef = db.collection("purchase_orders").doc();
      await docRef.set({
        supplier,
        items: poItems,
        totalCost,
        status: "draft",
        createdBy: callerUid,
        createdAt: timestamp,
        updatedAt: timestamp
      });
      
      // Audit log
      await db.collection("audit_logs").add({
        action: "create_purchase_order",
        po_id: docRef.id,
        supplier,
        totalCost,
        adminId: callerUid,
        timestamp
      });
      
      return `Created Purchase Order \`${docRef.id}\` for supplier **${supplier}** with total estimated cost of **$${totalCost.toFixed(2)}**.`;
    }

    default: const o = snap.data();
      let riskScore = 0;
      let flags = [];
      
      if (Number(o.total) > 500) { riskScore += 30; flags.push("High order value (>$500)"); }
      if (Number(o.total) > 1000) { riskScore += 20; flags.push("Extremely high order value (>$1000)"); }
      
      // Analyze user
      if (o.userId) {
        const userSnap = await db.collection("users").doc(o.userId).get();
        if (userSnap.exists) {
          const u = userSnap.data();
          const createdDaysAgo = u.createdAt ? (Date.now() - (u.createdAt.seconds ? u.createdAt.seconds * 1000 : u.createdAt)) / (1000 * 60 * 60 * 24) : 999;
          if (createdDaysAgo < 3) { riskScore += 40; flags.push("Account created less than 3 days ago"); }
        }
      } else {
        riskScore += 20; flags.push("Guest checkout / No user ID linked");
      }
      
      if (o.items && Array.isArray(o.items)) {
        for (const item of o.items) {
          if (item.quantity > 5) { riskScore += 15; flags.push(`High quantity of single item: ${item.name || item.id} (x${item.quantity})`); }
        }
      }
      
      let riskLevel = "LOW";
      if (riskScore > 40) riskLevel = "MEDIUM";
      if (riskScore >= 70) riskLevel = "HIGH";
      
      return `**Risk Analysis for Order #${order_id.slice(0,6)}**\n- **Risk Level:** ${riskLevel} (Score: ${riskScore}/100)\n- **Flags Detected:**\n${flags.length > 0 ? flags.map(f => `  - ⚠️ ${f}`).join("\n") : "  - ✅ No suspicious flags detected."}\n- **Total Amount:** $${o.total || 0}\n- **Status:** ${o.status}`;
    }

    case "forecast_inventory_needs": {
      const { days_ahead = 30 } = args;
      const now = Date.now();
      const thirtyDaysAgo = new Date(now - 30 * 24 * 60 * 60 * 1000);
      const ordersSnap = await db.collection("orders").where("createdAt", ">=", thirtyDaysAgo).get();
      
      const salesMap = {};
      ordersSnap.forEach(doc => {
        const o = doc.data();
        if (o.status !== "cancelled" && o.items) {
          o.items.forEach(item => {
            const pid = item.productId || item.id || item.name;
            if (!salesMap[pid]) salesMap[pid] = 0;
            salesMap[pid] += (item.quantity || 1);
          });
        }
      });
      
      const productsSnap = await db.collection("products").where("status", "==", "active").get();
      const forecast = [];
      productsSnap.forEach(doc => {
        const p = doc.data();
        const pid = doc.id;
        const name = p.name || p.displayName;
        const stock = typeof p.stock === 'number' ? p.stock : 0;
        
        const monthlySales = salesMap[pid] || salesMap[name] || 0;
        const dailyVelocity = monthlySales / 30;
        const projectedNeed = Math.ceil(dailyVelocity * days_ahead);
        
        if (stock < projectedNeed && dailyVelocity > 0) {
          forecast.push({
            name, stock, velocity: dailyVelocity.toFixed(1), need: projectedNeed, deficit: projectedNeed - stock
          });
        }
      });
      
      forecast.sort((a,b) => b.deficit - a.deficit);
      if (forecast.length === 0) return `Inventory Forecast (${days_ahead} days): All active products have sufficient stock based on recent sales velocity.`;
      
      const list = forecast.slice(0, 15).map(f => `- **${f.name}**: Stock: ${f.stock} | Expected Need: ${f.need} | Deficit: 🔻 ${f.deficit} (Velocity: ${f.velocity}/day)`).join("\n");
      return `**Inventory Restock Forecast (${days_ahead} days ahead):**\n\n${list}\n\n*Suggestion: Contact laboratory suppliers to replenish these deficits.*`;
    }

    case "draft_segment_email": {
      const { segment, goal } = args;
      let intro = "";
      if (segment === "inactive") intro = "Subject: We've missed you at Atlas Health\n\nDear [Name],\nIt's been a while since your last visit. We noticed you haven't been active lately.";
      else if (segment === "vip") intro = "Subject: Exclusive VIP Access at Atlas Health\n\nDear [Name],\nAs one of our top institutional partners, we value your continued trust.";
      else if (segment === "abandoned_cart") intro = "Subject: Did you forget something? (Atlas Health)\n\nDear [Name],\nWe saved your cart for you. Your research materials are waiting.";
      else intro = "Subject: Updates from Atlas Health\n\nDear [Name],\nWe have some exciting news to share.";
      
      const body = `We are writing to you today because ${goal}.\n\nAtlas Health is committed to providing the highest purity peptides and clinical supplements for your research and longevity needs.\n\nBest regards,\nThe Atlas Health Team\nhttps://atlas-health.com`;
      
      return `**Email Draft Generated for segment [${segment.toUpperCase()}]:**\n\n\`\`\`text\n${intro}\n\n${body}\n\`\`\`\n\n*Note: This is a draft. You can copy this into your email marketing tool (e.g. Mailchimp, SendGrid) to dispatch.*`;
    }

    case "get_top_selling_products": {
      const { limit = 5 } = args;
      const snap = await db.collection("orders").get();
      const productCounts = {};
      
      snap.forEach(doc => {
        const o = doc.data();
        if (o.status !== "cancelled" && o.items) {
          o.items.forEach(item => {
            const pid = item.productId || item.name || item.id;
            if (!productCounts[pid]) productCounts[pid] = { name: item.name || pid, count: 0, revenue: 0 };
            productCounts[pid].count += (item.quantity || 1);
            productCounts[pid].revenue += (item.price || 0) * (item.quantity || 1);
          });
        }
      });
      
      const sorted = Object.values(productCounts).sort((a,b) => b.count - a.count).slice(0, limit);
      if (sorted.length === 0) return "No product sales data found.";
      
      return `**Top ${limit} Selling Products (All Time):**\n\n` + sorted.map((p,i) => `${i+1}. **${p.name}** — ${p.count} units sold (Total Rev: $${p.revenue.toFixed(2)})`).join("\n");
    }

    case "get_customer_ltv": {
      const { user_id } = args;
      let snap = await db.collection("orders").where("userId", "==", user_id).get();
      if (snap.empty) {
        // Try by email
        snap = await db.collection("orders").where("userEmail", "==", user_id).get();
      }
      
      if (snap.empty) return `No orders found for user: ${user_id}. LTV is $0.00.`;
      
      let totalSpent = 0;
      let orderCount = 0;
      let firstOrderDate = Date.now();
      
      snap.forEach(doc => {
        const o = doc.data();
        if (o.status !== "cancelled") {
          totalSpent += Number(o.total) || 0;
          orderCount++;
          const dateMs = o.createdAt ? (o.createdAt.seconds ? o.createdAt.seconds * 1000 : o.createdAt) : Date.now();
          if (dateMs < firstOrderDate) firstOrderDate = dateMs;
        }
      });
      
      const customerLifespanDays = Math.max(1, (Date.now() - firstOrderDate) / (1000 * 60 * 60 * 24));
      const aov = totalSpent / orderCount;
      
      return [
        `**Customer Lifetime Value (LTV) Report for ${user_id}**`,
        `- **Total LTV (Revenue):** $${totalSpent.toFixed(2)}`,
        `- **Total Valid Orders:** ${orderCount}`,
        `- **Average Order Value (AOV):** $${aov.toFixed(2)}`,
        `- **Customer Tenure:** ${Math.round(customerLifespanDays)} days`
      ].join("\n");
    }

    case "simulate_margin_impact": {
      const { product_id, new_price } = args;
      // Get current product details
      let pSnap = await db.collection("products").doc(product_id).get();
      if (!pSnap.exists) {
        const bySlug = await db.collection("products").where("slug", "==", product_id).limit(1).get();
        if (bySlug.empty) return `Product ${product_id} not found.`;
        pSnap = bySlug.docs[0];
      }
      
      const p = pSnap.data();
      const cost = Number(p.costPrice || p.cost_price || 0);
      const name = p.displayName || p.name || product_id;
      
      // Get recent 30-day sales volume
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const ordersSnap = await db.collection("orders").where("createdAt", ">=", thirtyDaysAgo).get();
      let volume30 = 0;
      let currentAvgPrice = 0;
      let rev30 = 0;
      
      ordersSnap.forEach(doc => {
        const o = doc.data();
        if (o.status !== "cancelled" && o.items) {
          o.items.forEach(item => {
            if (item.productId === pSnap.id || item.name === name) {
              volume30 += (item.quantity || 1);
              rev30 += (item.price || 0) * (item.quantity || 1);
            }
          });
        }
      });
      
      if (volume30 > 0) currentAvgPrice = rev30 / volume30;
      
      const currentProfit = (currentAvgPrice - cost) * volume30;
      const simulatedProfit = (new_price - cost) * volume30;
      const profitDelta = simulatedProfit - currentProfit;
      
      const currentMargin = currentAvgPrice > 0 ? ((currentAvgPrice - cost) / currentAvgPrice * 100).toFixed(1) : "N/A";
      const newMargin = new_price > 0 ? ((new_price - cost) / new_price * 100).toFixed(1) : "N/A";
      
      return [
        `**Margin Impact Simulation for: ${name}**`,
        `- **Cost Price:** $${cost.toFixed(2)}`,
        `- **30-Day Sales Volume:** ${volume30} units`,
        ``,
        `**Current Economics (Last 30 Days):**`,
        `- Estimated Avg Price: $${currentAvgPrice.toFixed(2)}`,
        `- Current Margin: ${currentMargin}%`,
        `- Gross Profit (30d): $${currentProfit.toFixed(2)}`,
        ``,
        `**Simulated Economics (at $${new_price}):**`,
        `- New Margin: ${newMargin}%`,
        `- Projected Gross Profit (30d): $${simulatedProfit.toFixed(2)}`,
        ``,
        `**Projected Impact (assuming flat volume):** ${profitDelta >= 0 ? '🟢 +$' : '🔴 -$'}${Math.abs(profitDelta).toFixed(2)} per month`
      ].join("\n");
    }

    case "get_user_activity_summary": {
      const { user_id } = args;
      let uSnap = await db.collection("users").doc(user_id).get();
      if (!uSnap.exists) {
        const byEmail = await db.collection("users").where("email", "==", user_id).limit(1).get();
        if (!byEmail.empty) uSnap = byEmail.docs[0];
      }
      
      const name = uSnap.exists ? (uSnap.data().fullName || uSnap.data().email) : user_id;
      
      const logsSnap = await db.collection("audit_logs").where("userId", "==", user_id).orderBy("timestamp", "desc").limit(5).get();
      let logsList = [];
      logsSnap.forEach(doc => {
        const d = doc.data();
        const time = d.timestamp ? new Date(d.timestamp.seconds * 1000).toLocaleString() : "Unknown";
        logsList.push(`- [${time}] Action: ${d.action}`);
      });
      
      const ordersSnap = await db.collection("orders").where("userId", "==", user_id).orderBy("createdAt", "desc").limit(3).get();
      let ordersList = [];
      ordersSnap.forEach(doc => {
        const o = doc.data();
        const time = o.createdAt ? new Date(o.createdAt.seconds * 1000).toLocaleDateString() : "Unknown";
        ordersList.push(`- [${time}] Order #${doc.id.slice(0,6)} - $${o.total} (${o.status})`);
      });
      
      return [
        `**Activity Summary for User: ${name}**`,
        ``,
        `**Recent Orders (up to 3):**`,
        ordersList.length > 0 ? ordersList.join("\n") : "- No recent orders.",
        ``,
        `**Recent Admin Audit Logs (up to 5):**`,
        logsList.length > 0 ? logsList.join("\n") : "- No admin audit logs found."
      ].join("\n");
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

    case "suspend_user": {
      const { user_id, reason } = args;
      let docRef = db.collection("users").doc(user_id);
      let snap = await docRef.get();
      if (!snap.exists) {
        const byEmail = await db.collection("users").where("email", "==", user_id).limit(1).get();
        if (!byEmail.empty) {
          docRef = byEmail.docs[0].ref;
          snap = byEmail.docs[0];
        } else {
          throw new Error(`User "${user_id}" not found.`);
        }
      }
      const u = snap.data();
      const userName = u.fullName || u.email || user_id;
      
      await docRef.update({ 
        suspended: true, 
        approved: false, 
        suspensionReason: reason, 
        updatedAt: timestamp 
      });
      
      const auditRef = await db.collection("audit_log").add({
        action: "suspend_user", user_id: docRef.id, reason, executed_by: callerUid || "admin", executed_at: timestamp, source: "AdminAI"
      });
      return { success: true, message: `✅ User **${userName}** has been suspended. Reason: ${reason}`, auditId: auditRef.id };
    }

    case "update_order_status": {
      const { order_id, new_status } = args;
      let docRef = db.collection("orders").doc(order_id);
      let snap = await docRef.get();
      if (!snap.exists) {
        throw new Error(`Order "${order_id}" not found. Please provide the exact full ID.`);
      }
      const oldStatus = snap.data().status;
      await docRef.update({ status: new_status, updatedAt: timestamp });
      
      const auditRef = await db.collection("audit_log").add({
        action: "update_order_status", order_id, old_status: oldStatus, new_status, executed_by: callerUid || "admin", executed_at: timestamp, source: "AdminAI"
      });
      return { success: true, message: `✅ Order **#${order_id.slice(0,6)}** status updated: ${oldStatus} -> ${new_status}`, auditId: auditRef.id };
    }

    case "create_discount_campaign": {
      const { code_name, discount_type, amount, days_valid } = args;
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + Number(days_valid));
      
      const promoData = {
        code: code_name.toUpperCase(),
        type: discount_type,
        value: Number(amount),
        active: true,
        expiresAt: expiresAt,
        createdAt: timestamp,
        createdBy: callerUid || "admin"
      };
      
      await db.collection("promotions").doc(code_name.toUpperCase()).set(promoData);
      
      const auditRef = await db.collection("audit_log").add({
        action: "create_discount", code: promoData.code, type: promoData.type, value: promoData.value, executed_by: callerUid || "admin", executed_at: timestamp, source: "AdminAI"
      });
      return { success: true, message: `✅ Discount Code **${promoData.code}** created! It grants a ${promoData.type === 'percentage' ? promoData.value + '%' : '$' + promoData.value} discount and expires in ${days_valid} days.`, auditId: auditRef.id };
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
