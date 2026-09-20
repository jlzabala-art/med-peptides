/**
 * SharedCatalogStyles — Injected <style> block for the isolated shared catalog portal.
 * Extracted from SharedCatalogClientView.jsx to reduce file size.
 * Zero changes to class names or media queries — drop-in replacement.
 */
export default function SharedCatalogStyles() {
  return (
    <style>{`
        .catalog-container {
          max-width: 1160px;
          margin: 0 auto;
          padding: 24px 16px;
        }
        /* Sandboxed Institutional Topbar — Datasheet Deep Navy Blue (#003666) Theme */
        .institutional-topbar {
          background-color: #003666;
          border-bottom: 1px solid rgba(255, 255, 255, 0.12);
          position: sticky;
          top: 0;
          z-index: 1000;
          box-shadow: 0 2px 8px rgba(0, 54, 102, 0.25);
          color: #ffffff;
        }
        .topbar-inner {
          max-width: 1160px;
          margin: 0 auto;
          padding: 0.55rem 1.25rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: nowrap;
          gap: 12px;
        }
        .topbar-brand {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .topbar-brand-title {
          font-size: 0.95rem;
          font-weight: 800;
          color: #ffffff;
          letter-spacing: -0.01em;
          display: inline-flex;
          align-items: center;
        }
        .topbar-brand-divider {
          width: 1px;
          height: 15px;
          background-color: rgba(255, 255, 255, 0.25);
          display: inline-block;
          margin: 0 4px;
        }
        .topbar-badge-pill {
          background-color: rgba(56, 189, 248, 0.15);
          border: 1px solid rgba(56, 189, 248, 0.35);
          color: #7dd3fc;
          font-size: 0.68rem;
          font-weight: 800;
          padding: 2px 8px;
          border-radius: 9999px;
          letter-spacing: 0.04em;
          white-space: nowrap;
        }
        .portal-verified-badge {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          background-color: rgba(255, 255, 255, 0.14);
          border: 1px solid rgba(255, 255, 255, 0.22);
          color: #e0f2fe;
          font-size: 0.72rem;
          font-weight: 700;
          padding: 2px 8px;
          border-radius: 6px;
            .topbar-actions {
          display: flex;
          align-items: center;
          flex-wrap: nowrap;
          gap: 8px;
        }
        .topbar-destination {
          height: 32px;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background-color: rgba(255, 255, 255, 0.10);
          padding: 0 10px;
          border-radius: 6px;
          border: 1px solid rgba(255, 255, 255, 0.20);
          font-size: 0.78rem;
          color: #ffffff;
          min-width: 170px;
          flex-shrink: 0;
          box-sizing: border-box;
          transition: all 0.15s ease;
        }
        .topbar-destination:hover {
          background-color: rgba(255, 255, 255, 0.16);
          border-color: rgba(255, 255, 255, 0.35);
        }
        .dest-flag-icon {
          font-size: 0.85rem;
          flex-shrink: 0;
        }
        .topbar-dest-select {
          background: transparent;
          color: #ffffff;
          border: none;
          font-size: 0.78rem;
          font-weight: 700;
          cursor: pointer;
          outline: none;
          width: 100%;
          white-space: nowrap;
        }
        .topbar-dest-select option {
          background: #002544;
          color: #ffffff;
        }
        .topbar-quick-tools {
          display: flex;
          align-items: center;
          gap: 6px;
          flex-shrink: 0;
        }
        .topbar-select {
          height: 32px;
          background-color: rgba(255, 255, 255, 0.10);
          color: #ffffff;
          border: 1px solid rgba(255, 255, 255, 0.20);
          border-radius: 6px;
          padding: 0 8px;
          font-size: 0.75rem;
          font-weight: 700;
          cursor: pointer;
          outline: none;
          box-sizing: border-box;
          transition: all 0.15s ease;
        }
        .topbar-select:hover {
          background-color: rgba(255, 255, 255, 0.16);
          border-color: rgba(255, 255, 255, 0.35);
        }
        .topbar-select option {
          background: #002544;
          color: #ffffff;
        }
        .topbar-contact-btn {
          height: 32px;
          background-color: rgba(255, 255, 255, 0.10);
          color: #e2e8f0;
          border: 1px solid rgba(255, 255, 255, 0.20);
          border-radius: 6px;
          padding: 0 10px;
          font-size: 0.75rem;
          font-weight: 600;
          display: inline-flex;
          align-items: center;
          gap: 5px;
          cursor: pointer;
          box-sizing: border-box;
          transition: all 0.15s ease;
          white-space: nowrap;
        }
        .topbar-contact-btn:hover {
          background-color: rgba(255, 255, 255, 0.16);
          border-color: rgba(255, 255, 255, 0.35);
          color: #ffffff;
        }
        .topbar-cart-pill {
          height: 32px;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background-color: rgba(56, 189, 248, 0.18);
          border: 1px solid rgba(56, 189, 248, 0.38);
          color: #e0f2fe;
          padding: 0 10px;
          border-radius: 6px;
          font-size: 0.76rem;
          font-weight: 800;
          cursor: pointer;
          box-sizing: border-box;
          transition: all 0.15s ease;
          white-space: nowrap;
        }
        .topbar-cart-pill:hover {
          background-color: rgba(56, 189, 248, 0.28);
        }
        .topbar-row-access {
          display: flex;
          align-items: center;
          gap: 6px;
          flex-shrink: 0;
        }
        .topbar-auth-inner {
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .topbar-signin-btn {
          height: 32px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          background-color: rgba(255, 255, 255, 0.10);
          border: 1px solid rgba(255, 255, 255, 0.25);
          color: #ffffff;
          padding: 0 12px;
          border-radius: 6px;
          font-size: 0.76rem;
          font-weight: 700;
          text-decoration: none;
          cursor: pointer;
          box-sizing: border-box;
          transition: all 0.15s ease;
          white-space: nowrap;
        }
        .topbar-signin-btn:hover {
          background-color: rgba(255, 255, 255, 0.18);
          border-color: rgba(255, 255, 255, 0.40);
        }
        .topbar-apply-btn {
          height: 32px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          background: #0284c7;
          border: 1px solid rgba(255, 255, 255, 0.30);
          color: #ffffff;
          padding: 0 14px;
          border-radius: 6px;
          font-size: 0.76rem;
          font-weight: 800;
          cursor: pointer;
          box-sizing: border-box;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.25);
          transition: all 0.15s ease;
          white-space: nowrap;
        }
        .topbar-apply-btn:hover {
          background: #0369a1;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.35);
        }
        .access-label-compact {
          display: none;
        }

        /* Product List Row — Standard GCP Console High-Density Item */
        .catalog-list-item {
          background-color: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 10px;
          margin-bottom: 8px;
          overflow: hidden;
          transition: all 0.15s ease;
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.02);
        }
        .catalog-list-item.is-expanded {
          border-color: #0284c7;
          box-shadow: 0 4px 14px rgba(2, 132, 199, 0.08);
        }
        .catalog-list-row-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 10px 14px;
          cursor: pointer;
          background-color: #ffffff;
          transition: background 0.12s ease;
          gap: 12px;
        }
        .catalog-list-item.is-expanded .catalog-list-row-header {
          background-color: #f8fafc;
        }
        .catalog-row-main {
          display: flex;
          align-items: center;
          gap: 12px;
          flex: 1 1 auto;
          min-width: 0;
        }
        .catalog-row-img {
          width: 40px;
          height: 40px;
          border-radius: 8px;
          object-fit: cover;
          border: 1px solid #e2e8f0;
          flex-shrink: 0;
        }
        .catalog-row-info {
          display: flex;
          flex-direction: column;
          gap: 2px;
          min-width: 0;
        }
        .catalog-row-title-line {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-wrap: wrap;
        }
        .catalog-row-title {
          font-size: 0.95rem;
          font-weight: 800;
          color: #0f172a;
          letter-spacing: -0.01em;
        }
        .catalog-row-purity {
          font-size: 0.66rem;
          font-weight: 700;
          background-color: #f0fdf4;
          color: #16a34a;
          padding: 1px 6px;
          border-radius: 4px;
          border: 1px solid #bbf7d0;
          white-space: nowrap;
        }
        .catalog-row-subtitle {
          font-size: 0.72rem;
          color: #64748b;
        }
        .catalog-row-action-zone {
          display: flex;
          align-items: center;
          gap: 12px;
          flex-shrink: 0;
        }
        .catalog-row-price-block {
          text-align: right;
          padding-right: 2px;
        }
        .catalog-price-label {
          font-size: 0.65rem;
          color: #64748b;
          display: block;
          text-transform: uppercase;
          font-weight: 600;
          letter-spacing: 0.02em;
        }
        .catalog-price-amount {
          font-size: 1.05rem;
          font-weight: 800;
          color: #003666;
        }
        .catalog-row-buttons {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .catalog-row-monograph-btn {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          height: 32px;
          padding: 0 10px;
          border-radius: 6px;
          background: #f8fafc;
          border: 1px solid #cbd5e1;
          color: #475569;
          font-size: 0.72rem;
          font-weight: 600;
          text-decoration: none;
          transition: all 0.15s ease;
          cursor: pointer;
        }
        .catalog-row-monograph-btn:hover {
          background: #f1f5f9;
          color: #0f172a;
          border-color: #94a3b8;
        }
        .catalog-row-expand-btn {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          height: 32px;
          padding: 0 12px;
          border-radius: 6px;
          background: #f1f5f9;
          color: #003666;
          border: 1px solid #cbd5e1;
          font-size: 0.74rem;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.15s ease;
        }
        .catalog-list-item.is-expanded .catalog-row-expand-btn {
          background: #003666;
          color: #ffffff;
          border-color: #003666;
        }
        .catalog-row-expand-btn:hover {
          background: #e2e8f0;
        }
        .catalog-list-item.is-expanded .catalog-row-expand-btn:hover {
          background: #002544;
        }
        /* Executive Header Card */
        .header-card {
          color: #ffffff;
          border-radius: 16px;
          padding: 22px 28px;
          margin-bottom: 20px;
          box-shadow: 0 10px 30px -5px rgba(0, 0, 0, 0.35);
          position: relative;
          overflow: hidden;
          transition: background 0.3s ease, border-color 0.3s ease;
        }
        .header-card-inner {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        @media (min-width: 960px) {
          .header-card {
            padding: 22px 30px;
          }
          .header-card-inner {
            display: grid;
            grid-template-columns: minmax(0, 1.4fr) auto auto;
            align-items: center;
            gap: 24px;
          }
        }
        .header-card-left {
          min-width: 0;
        }
        .header-meta-container {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-top: 12px;
          font-size: 0.8rem;
          color: #ffffff;
        }
        .header-meta-pill {
          background-color: rgba(255, 255, 255, 0.16);
          backdrop-filter: blur(4px);
          padding: 5px 12px;
          border-radius: 8px;
          font-weight: 600;
          font-size: 0.78rem;
          color: #ffffff;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          border: 1px solid rgba(255, 255, 255, 0.15);
          transition: all 0.15s ease;
        }
        .header-card-right {
          display: flex;
          align-items: center;
          gap: 18px;
          justify-content: flex-end;
        }
        .header-card-actions {
          display: flex;
          flex-direction: column;
          gap: 8px;
          align-items: flex-start;
          flex-shrink: 0;
        }
        .mobile-qr-toggle-btn {
          display: none !important;
        }
        .barcode-desktop-wrapper {
          display: block;
        }
        .header-card-qr {
          display: flex;
          justify-content: center;
          align-items: center;
          flex-shrink: 0;
        }
        .tab-button {
          padding: 8px 16px;
          border-radius: 10px;
          font-size: 0.85rem;
          font-weight: 700;
          cursor: pointer;
          border: none;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          transition: all 0.15s ease;
        }
        .tab-button.active {
          background: #003666;
          color: #ffffff;
          box-shadow: 0 2px 8px rgba(0, 54, 102, 0.25);
        }
        .tab-button.inactive {
          background: #ffffff;
          color: #64748b;
          border: 1px solid #e2e8f0;
        }
        .tab-button.inactive:hover {
          background: #f1f5f9;
          color: #0f172a;
        }
        .filter-bar {
          display: flex;
          flex-direction: column;
          gap: 10px;
          background: #ffffff;
          padding: 14px 18px;
          border-radius: 12px;
          border: 1px solid #e2e8f0;
          margin-bottom: 16px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.02);
        }
        .catalog-search-box {
          display: flex;
          align-items: center;
          gap: 10px;
          width: 100%;
          background-color: #f8fafc;
          padding: 0 14px;
          height: 44px;
          box-sizing: border-box;
          border-radius: 10px;
          border: 1px solid #e2e8f0;
          transition: all 0.15s ease;
        }
        .catalog-search-box:focus-within {
          border-color: #0284c7;
          background-color: #ffffff;
          box-shadow: 0 0 0 3px rgba(2, 132, 199, 0.12);
        }
        .chips-scroll-container {
          display: flex;
          align-items: center;
          gap: 6px;
          overflow-x: auto;
          -webkit-overflow-scrolling: touch;
          padding: 2px 0 4px 0;
          scrollbar-width: none;
          width: 100%;
        }
        .chips-scroll-container::-webkit-scrollbar {
          display: none;
        }
        .product-card {
          background: #ffffff;
          border: 1px solid #cbd5e1;
          border-top: 3px solid #003666;
          border-radius: 14px;
          padding: 20px 22px;
          margin-bottom: 18px;
          transition: all 0.22s cubic-bezier(0.16, 1, 0.3, 1);
          box-shadow: 0 4px 16px -4px rgba(0, 54, 102, 0.07), 0 1px 3px rgba(0,0,0,0.02);
        }
        .product-card:hover {
          border-color: #38bdf8;
          border-top-color: #0284c7;
          box-shadow: 0 10px 28px -4px rgba(0, 54, 102, 0.14), 0 2px 8px rgba(0,0,0,0.04);
        }
        .pds-catalog-monograph-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: linear-gradient(135deg, #003666 0%, #002244 100%);
          color: #ffffff !important;
          border: 1px solid rgba(56, 189, 248, 0.4);
          border-radius: 8px;
          padding: 4px 10px;
          font-size: 0.74rem;
          font-weight: 700;
          text-decoration: none;
          transition: all 0.18s ease;
          box-shadow: 0 2px 6px rgba(0, 54, 102, 0.25);
          letter-spacing: 0.01em;
          flex-shrink: 0;
        }
        .pds-catalog-monograph-btn:hover {
          background: linear-gradient(135deg, #004080 0%, #002b55 100%);
          border-color: #38bdf8;
          color: #ffffff !important;
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(0, 54, 102, 0.35);
        }
        .pds-catalog-monograph-btn:active {
          transform: translateY(0);
        }
        .pds-variant-protocol-pill {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          background-color: #f0f9ff;
          border: 1px solid #bae6fd;
          color: #0284c7 !important;
          border-radius: 6px;
          padding: 2px 7px;
          font-size: 0.70rem;
          font-weight: 700;
          text-decoration: none;
          transition: all 0.15s ease;
          letter-spacing: 0.01em;
          white-space: nowrap;
        }
        .pds-variant-protocol-pill:hover {
          background-color: #e0f2fe;
          border-color: #7dd3fc;
          color: #0369a1 !important;
          transform: translateY(-0.5px);
        }
        .category-chip {
          padding: 6px 14px;
          border-radius: 16px;
          font-size: 0.78rem;
          font-weight: 700;
          cursor: pointer;
          border: 1px solid transparent;
          white-space: nowrap;
          flex-shrink: 0;
          transition: all 0.15s ease;
        }
        .category-chip.active {
          background: #003666;
          color: #ffffff;
        }
        .category-chip.inactive {
          background: #f1f5f9;
          color: #475569;
          border: 1px solid #e2e8f0;
        }
        .product-desc-clamp {
          font-size: 0.825rem;
          color: #475569;
          margin: 4px 0 0 0;
          line-height: 1.4;
          max-width: 780px;
        }
        .add-kit-btn {
          background-color: #16a34a;
          color: #ffffff;
          border: none;
          border-radius: 6px;
          padding: 4px 10px;
          font-size: 0.74rem;
          font-weight: 800;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 4px;
          box-shadow: 0 1px 3px rgba(22, 163, 74, 0.25);
          transition: all 0.15s ease;
        }
        .add-kit-btn:hover {
          background-color: #15803d;
        }
        .remove-kit-btn {
          background-color: #fef2f2;
          color: #dc2626;
          border: 1px solid #fecaca;
          border-radius: 6px;
          padding: 4px 8px;
          font-size: 0.72rem;
          font-weight: 700;
          cursor: pointer;
        }
        .cart-mobile-backdrop {
          display: none;
        }
        .cart-drawer-wrapper {
          position: fixed;
          bottom: 74px;
          left: 0;
          right: 0;
          pointer-events: none;
          z-index: 60;
        }
        .cart-drawer-container {
          maxWidth: 1120px;
          margin: 0 auto;
          padding: 0 16px;
          display: flex;
          justify-content: flex-end;
          width: 100%;
          box-sizing: border-box;
        }
        .cart-drawer-card {
          pointer-events: auto;
          max-width: 450px;
          width: 100%;
          background-color: #ffffff;
          border-radius: 12px;
          box-shadow: 0 10px 30px rgba(0,0,0,0.15);
          border: 1px solid #e2e8f0;
          padding: 16px;
          max-height: 500px;
          overflow-y: auto;
        }
        .mobile-drag-indicator {
          display: none;
        }

        .variant-info-col {
          display: flex;
          align-items: center;
          gap: 10px;
          flex: 1 1 220px;
        }
        .variant-pricing-actions {
          display: flex;
          align-items: center;
          gap: 10px;
          flex-wrap: wrap;
        }
        .single-unit-box {
          display: flex;
          align-items: center;
          gap: 10px;
          background-color: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          padding: 6px 10px;
        }
        .kit-pack-box {
          display: flex;
          align-items: center;
          gap: 10px;
          background-color: #f0fdf4;
          border: 1px solid #bbf7d0;
          border-radius: 8px;
          padding: 6px 12px;
        }

        @media (max-width: 768px) {
          .catalog-container {
            padding: 10px 8px 115px 8px;
          }
          .header-card {
            padding: 16px 14px;
            border-radius: 12px;
          }
          .header-card h1 {
            font-size: 1.35rem !important;
          }
          .header-meta-container {
            display: grid !important;
            grid-template-columns: 1fr 1fr !important;
            gap: 8px !important;
            width: 100% !important;
            margin-top: 14px !important;
          }
          .header-meta-pill {
            width: 100% !important;
            box-sizing: border-box !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            text-align: center !important;
            padding: 8px 10px !important;
            font-size: 0.74rem !important;
            border-radius: 8px !important;
            white-space: nowrap !important;
          }
          .header-meta-pill.pill-full {
            grid-column: 1 / -1 !important;
            width: 100% !important;
            font-size: 0.78rem !important;
            font-weight: 700 !important;
            background-color: rgba(255, 255, 255, 0.22) !important;
            border: 1px solid rgba(255, 255, 255, 0.28) !important;
            padding: 9px 12px !important;
          }
          .product-card {
            padding: 12px 10px !important;
            margin-bottom: 12px !important;
            border-radius: 10px !important;
          }
          .variants-section-container {
            padding: 8px 6px !important;
            border-radius: 8px !important;
          }
          .variant-card {
            padding: 10px 10px !important;
            flex-direction: column !important;
            align-items: stretch !important;
            gap: 8px !important;
            margin-bottom: 6px !important;
          }
          .variant-info-col {
            flex: 0 0 auto !important;
            width: 100% !important;
            height: auto !important;
            min-height: 0 !important;
            margin-bottom: 2px !important;
          }
          .variant-pricing-actions {
            width: 100% !important;
            display: flex !important;
            flex-direction: column !important;
            gap: 6px !important;
          }
          .single-unit-box {
            width: 100% !important;
            box-sizing: border-box !important;
            padding: 8px 10px !important;
            display: flex !important;
            align-items: center !important;
            justify-content: space-between !important;
          }
          .kit-pack-box {
            width: 100% !important;
            box-sizing: border-box !important;
            padding: 8px 10px !important;
            display: flex !important;
            align-items: center !important;
            justify-content: space-between !important;
          }
          .catalog-filter-row {
            display: flex;
            gap: 10px;
            flex-wrap: wrap;
            width: 100%;
          }
          .catalog-dropdowns-row {
            display: flex;
            gap: 10px;
            flex: 0 1 auto;
          }
          @media (max-width: 768px) {
            .catalog-filter-row {
              flex-direction: column !important;
              gap: 8px !important;
            }
            .catalog-search-box {
              width: 100% !important;
              flex: 1 1 100% !important;
            }
            .catalog-dropdowns-row {
              display: grid !important;
              grid-template-columns: 1fr 1fr !important;
              gap: 8px !important;
              width: 100% !important;
            }
            .category-dropdown-container,
            .format-dropdown-container {
              width: 100% !important;
              min-width: 0 !important;
              flex: 1 1 auto !important;
            }
          }
          .catalog-search-box {
            width: 100%;
          }
          .category-dropdown-container {
            width: 100%;
          }
          .product-desc-clamp {
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            overflow: hidden;
            font-size: 0.78rem;
          }
          .mobile-hide {
            display: none !important;
          }
          .cart-mobile-backdrop {
            display: block !important;
            position: fixed !important;
            inset: 0 !important;
            background-color: rgba(15, 23, 42, 0.55) !important;
            backdrop-filter: blur(4px) !important;
            z-index: 998 !important;
          }
          .cart-drawer-wrapper {
            position: fixed !important;
            bottom: 0 !important;
            left: 0 !important;
            right: 0 !important;
            pointer-events: none !important;
            z-index: 999 !important;
          }
          .cart-drawer-container {
            padding: 0 !important;
            margin: 0 !important;
            width: 100% !important;
            max-width: 100% !important;
          }
          .cart-drawer-card {
            pointer-events: auto !important;
            max-width: 100vw !important;
            width: 100vw !important;
            margin: 0 !important;
            border-radius: 20px 20px 0 0 !important;
            border: none !important;
            box-shadow: 0 -10px 40px rgba(0,0,0,0.25) !important;
            padding: 12px 16px max(18px, env(safe-area-inset-bottom, 18px)) 16px !important;
            max-height: 84vh !important;
            overflow-y: auto !important;
          }
          .mobile-drag-indicator {
            display: block !important;
            width: 40px !important;
            height: 4px !important;
            border-radius: 2px !important;
            background-color: #cbd5e1 !important;
            margin: 0 auto 10px auto !important;
          }
        }
        @media (max-width: 768px) {
          .topbar-inner {
            display: grid !important;
            grid-template-columns: 1fr auto !important;
            grid-template-rows: auto auto !important;
            row-gap: 6px !important;
            column-gap: 8px !important;
            padding: 6px 10px !important;
            height: auto !important;
          }
          .topbar-brand {
            grid-column: 1 !important;
            grid-row: 1 !important;
            display: flex !important;
            align-items: center !important;
            gap: 6px !important;
            justify-content: flex-start !important;
            width: auto !important;
          }
          .topbar-brand-title {
            font-size: 0.88rem !important;
          }
          .portal-verified-badge {
            display: none !important;
          }
          .topbar-actions {
            display: contents !important;
          }
          .topbar-quick-tools {
            grid-column: 2 !important;
            grid-row: 1 !important;
            display: flex !important;
            align-items: center !important;
            justify-content: flex-end !important;
            gap: 5px !important;
          }
          .topbar-select {
            height: 28px !important;
            font-size: 0.70rem !important;
            padding: 0 4px !important;
          }
          .topbar-contact-btn {
            height: 28px !important;
            font-size: 0.70rem !important;
            padding: 0 6px !important;
          }
          .contact-label-text {
            display: none !important;
          }
          .topbar-destination {
            grid-column: 1 !important;
            grid-row: 2 !important;
            height: 30px !important;
            min-width: 0 !important;
            width: 100% !important;
            padding: 0 6px !important;
            font-size: 0.72rem !important;
            flex: 1 1 auto !important;
            display: inline-flex !important;
            align-items: center !important;
            box-sizing: border-box !important;
            border-radius: 6px !important;
          }
          .topbar-dest-select {
            width: 100% !important;
            font-size: 0.72rem !important;
            white-space: nowrap !important;
          }
          .topbar-cart-pill {
            height: 28px !important;
            padding: 0 6px !important;
            font-size: 0.70rem !important;
          }
          .topbar-row-access {
            grid-column: 2 !important;
            grid-row: 2 !important;
            display: flex !important;
            align-items: center !important;
            gap: 4px !important;
            min-width: 120px !important;
            width: auto !important;
          }
          .topbar-auth-inner {
            display: flex !important;
            align-items: center !important;
            gap: 4px !important;
            width: 100% !important;
          }
          .topbar-signin-btn,
          .topbar-apply-btn {
            height: 30px !important;
            min-height: 30px !important;
            font-size: 0.72rem !important;
            padding: 0 8px !important;
            border-radius: 6px !important;
            display: inline-flex !important;
            align-items: center !important;
            justify-content: center !important;
            text-align: center !important;
            box-sizing: border-box !important;
            white-space: nowrap !important;
            flex: 1 !important;
          }
          .access-label-full {
            display: none !important;
          }
          .access-label-compact {
            display: inline !important;
          }

          /* Product List Item Mobile Ergonomics */
          .catalog-list-row-header {
            display: flex !important;
            flex-direction: column !important;
            align-items: stretch !important;
            padding: 10px 12px !important;
            gap: 8px !important;
          }
          .catalog-row-main {
            width: 100% !important;
            display: flex !important;
            align-items: center !important;
            gap: 10px !important;
          }
          .catalog-row-info {
            flex: 1 1 auto !important;
            min-width: 0 !important;
          }
          .catalog-row-title-line {
            display: flex !important;
            align-items: center !important;
            justify-content: space-between !important;
            width: 100% !important;
          }
          .catalog-row-title {
            font-size: 0.92rem !important;
          }
          .catalog-row-action-zone {
            width: 100% !important;
            display: flex !important;
            align-items: center !important;
            justify-content: space-between !important;
            padding-top: 8px !important;
            border-top: 1px solid #f1f5f9 !important;
          }
          .catalog-row-price-block {
            display: flex !important;
            align-items: baseline !important;
            gap: 4px !important;
            text-align: left !important;
          }
          .catalog-price-label {
            display: inline !important;
            font-size: 0.68rem !important;
          }
          .catalog-price-amount {
            font-size: 1.1rem !important;
          }
          .catalog-row-buttons {
            display: flex !important;
            align-items: center !important;
            gap: 6px !important;
          }
          .catalog-row-monograph-btn {
            height: 30px !important;
            padding: 0 8px !important;
            font-size: 0.70rem !important;
          }
          .monograph-btn-label {
            display: none !important;
          }
          .catalog-row-expand-btn {
            height: 30px !important;
            padding: 0 10px !important;
            font-size: 0.72rem !important;
          }
          .chips-scroll-container {
            flex-wrap: wrap !important;
          }
          .header-card-right {
            width: 100% !important;
            flex-direction: column !important;
            align-items: stretch !important;
            gap: 14px !important;
            margin-top: 14px !important;
          }
          .header-card-actions {
            width: 100% !important;
            margin-top: 0 !important;
            align-items: center !important;
            display: flex !important;
            flex-direction: column !important;
            gap: 8px !important;
          }
          .header-card-actions button {
            width: 100% !important;
            justify-content: center !important;
            min-height: 42px !important;
          }
          .mobile-qr-toggle-btn {
            display: flex !important;
          }
          .barcode-desktop-wrapper {
            display: none;
            width: 100%;
          }
          .barcode-desktop-wrapper.mobile-visible {
            display: flex !important;
            justify-content: center !important;
            width: 100% !important;
            margin-top: 8px !important;
          }
          .header-card-qr {
            display: none !important;
          }
          .header-card-qr.mobile-visible {
            width: 100% !important;
            display: flex !important;
            justify-content: center !important;
            margin-top: 8px !important;
          }
          .dock-wrapper {
            padding: 8px 10px max(12px, env(safe-area-inset-bottom, 12px)) 10px !important;
          }
          .dock-content {
            flex-direction: column !important;
            align-items: stretch !important;
            gap: 8px !important;
          }
          .dock-actions {
            width: 100% !important;
            display: grid !important;
            grid-template-columns: 1fr 2fr !important;
            gap: 6px !important;
          }
          .dock-actions button {
            justify-content: center !important;
            min-height: 44px !important;
          }
          .checkout-form-grid {
            grid-template-columns: 1fr !important;
          }
          .checkout-modal-card {
            padding: 16px 14px !important;
            border-radius: 14px !important;
          }
        }

        /* Institutional Portal Access Modal */
        .access-modal-overlay {
          position: fixed;
          inset: 0;
          background-color: rgba(15, 23, 42, 0.65);
          backdrop-filter: blur(5px);
          -webkit-backdrop-filter: blur(5px);
          z-index: 100;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 16px;
          box-sizing: border-box;
        }
        .access-modal-card {
          background-color: #ffffff;
          border-radius: 16px;
          max-width: 620px;
          width: 100%;
          max-height: 90vh;
          overflow-y: auto;
          -webkit-overflow-scrolling: touch;
          box-shadow: 0 25px 50px -12px rgba(15, 23, 42, 0.25);
          border: 1px solid #e2e8f0;
          padding: 26px 28px;
          position: relative;
          box-sizing: border-box;
        }
        .access-modal-header {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          margin-bottom: 6px;
          padding-right: 44px;
        }
        .access-modal-close-btn {
          position: absolute;
          top: 18px;
          right: 18px;
          border: none;
          background: #f1f5f9;
          cursor: pointer;
          color: #64748b;
          font-size: 1.1rem;
          font-weight: 700;
          width: 34px;
          height: 34px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.15s ease;
          z-index: 2;
        }
        .access-modal-close-btn:hover {
          background: #e2e8f0;
          color: #0f172a;
        }
        .access-form-section {
          background: #f8fafc;
          border: 1px solid #f1f5f9;
          border-radius: 10px;
          padding: 12px 14px;
          margin-bottom: 12px;
        }
        .access-section-title {
          font-size: 0.72rem;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: #0284c7;
          margin: 0 0 10px 0;
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .access-form-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }
        .access-field-label {
          display: block;
          font-size: 0.76rem;
          font-weight: 700;
          color: #334155;
          margin-bottom: 5px;
        }
        .access-input-control {
          width: 100%;
          padding: 10px 12px;
          border: 1px solid #cbd5e1;
          border-radius: 8px;
          font-size: 0.86rem;
          color: #0f172a;
          background-color: #ffffff;
          box-sizing: border-box;
          font-family: inherit;
          transition: border-color 0.15s ease, box-shadow 0.15s ease;
        }
        .access-input-control:focus {
          outline: none;
          border-color: #003666;
          box-shadow: 0 0 0 3px rgba(0, 54, 102, 0.12);
        }
        .access-actions-row {
          display: flex;
          align-items: center;
          justify-content: flex-end;
          gap: 10px;
          margin-top: 14px;
        }
        @media (max-width: 640px) {
          .access-modal-card {
            padding: 20px 16px !important;
            border-radius: 14px !important;
            max-height: 92vh !important;
          }
          .access-modal-header {
            padding-right: 36px !important;
          }
          .access-modal-close-btn {
            top: 14px !important;
            right: 14px !important;
            width: 32px !important;
            height: 32px !important;
          }
          .access-form-grid {
            grid-template-columns: 1fr !important;
            gap: 10px !important;
          }
          .access-input-control {
            font-size: 16px !important;
            padding: 11px 12px !important;
            min-height: 44px !important;
          }
          .access-actions-row {
            flex-direction: column-reverse !important;
            align-items: stretch !important;
            gap: 8px !important;
          }
          .access-actions-row button {
            width: 100% !important;
            justify-content: center !important;
            min-height: 44px !important;
            font-size: 0.9rem !important;
          }
        }

        /* ── Dual View Switcher (List vs Cards) ── */
        .proto-view-switcher {
          display: inline-flex;
          align-items: center;
          background: #f1f5f9;
          border: 1px solid #cbd5e1;
          border-radius: 8px;
          padding: 3px;
          gap: 2px;
        }

        .proto-view-btn {
          border: none;
          background: transparent;
          padding: 0.38rem 0.75rem;
          min-height: 32px;
          border-radius: 6px;
          font-size: 0.76rem;
          font-weight: 700;
          color: #64748b;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 5px;
          transition: all 0.15s ease;
          white-space: nowrap;
        }

        .proto-view-btn:hover {
          color: #0f172a;
        }

        .proto-view-btn.is-active {
          background: #ffffff;
          color: #003666;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
        }

        /* ── Goal Section Headers ── */
        .proto-goal-section {
          display: flex;
          flex-direction: column;
          gap: 0.85rem;
        }

        .proto-goal-section-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0.75rem 1rem;
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 10px;
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.02);
        }

        /* ── List Mode Row Styles ── */
        .proto-list-item {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 10px;
          overflow: hidden;
          transition: all 0.15s ease;
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.02);
        }

        .proto-list-item:hover {
          border-color: #cbd5e1;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
        }

        .proto-list-item.is-expanded {
          border-color: #0284c7;
          box-shadow: 0 4px 12px rgba(2, 132, 199, 0.08);
        }

        .proto-list-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0.75rem 1rem;
          cursor: pointer;
          flex-wrap: wrap;
          gap: 0.75rem;
          transition: background 0.12s ease;
        }

        .proto-list-row:hover {
          background: #f8fafc;
        }

        .proto-list-expand-btn {
          background: #f1f5f9;
          border: 1px solid #e2e8f0;
          border-radius: 6px;
          width: 28px;
          height: 28px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          color: #475569;
          flex-shrink: 0;
          transition: all 0.12s ease;
        }

        .proto-list-expand-btn:hover {
          background: #e2e8f0;
          color: #0f172a;
        }

        .proto-list-expanded {
          padding: 1rem;
          background: #fafbfc;
          border-top: 1px solid #f1f5f9;
          animation: fadeIn 0.15s ease-out;
        }

        /* ── Google Cloud Console Scope Switcher Tabs ────────────────────── */
        .catalog-scope-nav-bar {
          display: flex;
          justify-content: flex-start;
          margin-top: 14px;
          margin-bottom: 16px;
        }

        .catalog-scope-nav-inner {
          display: inline-flex;
          align-items: center;
          background: #f1f5f9;
          padding: 3px;
          border-radius: 8px;
          border: 1px solid #e2e8f0;
          box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.04);
        }

        .catalog-scope-tab {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 8px 16px;
          border-radius: 6px;
          border: none;
          background: transparent;
          color: #475569;
          font-size: 0.82rem;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.15s ease;
          user-select: none;
        }

        .catalog-scope-tab:hover {
          color: #0f172a;
          background: rgba(255, 255, 255, 0.6);
        }

        .catalog-scope-tab.is-active {
          background: #ffffff;
          color: #003666;
          box-shadow: 0 1px 3px rgba(0, 54, 102, 0.12), 0 1px 2px rgba(0, 0, 0, 0.06);
        }

        .catalog-scope-badge {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          background: rgba(0, 54, 102, 0.08);
          color: #003666;
          font-size: 0.70rem;
          font-weight: 800;
          padding: 1px 7px;
          border-radius: 10px;
          line-height: 1.3;
        }

        .catalog-scope-tab.is-active .catalog-scope-badge {
          background: #003666;
          color: #ffffff;
        }

        @media (max-width: 640px) {
          .catalog-scope-nav-bar {
            width: 100%;
          }
          .catalog-scope-nav-inner {
            width: 100%;
            display: grid;
            grid-template-columns: 1fr 1fr;
          }
          .catalog-scope-tab {
            justify-content: center;
            min-height: 42px;
            padding: 8px 10px;
            font-size: 0.78rem;
          }
        }
      `}</style>
  );
}
