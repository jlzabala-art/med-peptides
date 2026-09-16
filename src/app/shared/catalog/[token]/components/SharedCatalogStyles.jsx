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
        /* Sandboxed Institutional Topbar */
        .institutional-topbar {
          background-color: #ffffff;
          border-bottom: 1px solid #e2e8f0;
          position: sticky;
          top: 0;
          z-index: 50;
          box-shadow: 0 1px 3px rgba(0,0,0,0.03);
        }
        .topbar-inner {
          max-width: 1160px;
          margin: 0 auto;
          padding: 10px 16px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 12px;
        }
        .topbar-brand {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .topbar-brand-title {
          font-size: 0.95rem;
          font-weight: 800;
          color: #003666;
          letter-spacing: -0.01em;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .portal-verified-badge {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          background-color: #f0fdf4;
          border: 1px solid #bbf7d0;
          color: #166534;
          font-size: 0.72rem;
          font-weight: 700;
          padding: 2px 8px;
          borderRadius: 6px;
        }
        .topbar-actions {
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          gap: 10px;
        }
        .topbar-row-logistics {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .topbar-row-access {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .topbar-currency-toggle {
          display: inline-flex;
          background-color: #f1f5f9;
          padding: 2px;
          border-radius: 8px;
          border: 1px solid #e2e8f0;
        }
        .currency-btn {
          padding: 4px 10px;
          border-radius: 6px;
          border: none;
          font-size: 0.76rem;
          font-weight: 800;
          cursor: pointer;
          transition: all 0.15s ease;
        }
        .currency-btn.active {
          background-color: #003666;
          color: #ffffff;
          box-shadow: 0 1px 3px rgba(0, 54, 102, 0.2);
        }
        .currency-btn.inactive {
          background: transparent;
          color: #64748b;
        }
        .topbar-destination {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background-color: #f8fafc;
          padding: 5px 12px;
          border-radius: 8px;
          border: 1px solid #e2e8f0;
          font-size: 0.8rem;
          color: #334155;
          min-width: 180px;
          flex-shrink: 0;
          transition: all 0.15s ease;
        }
        .topbar-destination:hover {
          background-color: #f1f5f9;
          border-color: #cbd5e1;
        }
        .topbar-destination select {
          background: transparent;
          color: #0f172a;
          border: none;
          font-size: 0.8rem;
          font-weight: 700;
          cursor: pointer;
          outline: none;
          width: 100%;
          white-space: nowrap;
        }
        .topbar-cart-pill {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background-color: #eff6ff;
          border: 1px solid #bfdbfe;
          color: #1e40af;
          padding: 6px 12px;
          border-radius: 8px;
          font-size: 0.8rem;
          font-weight: 800;
          cursor: pointer;
          transition: all 0.15s ease;
        }
        .topbar-cart-pill:hover {
          background-color: #dbeafe;
        }
        .topbar-signin-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background-color: #ffffff;
          border: 1px solid #cbd5e1;
          color: #334155;
          padding: 6px 12px;
          border-radius: 8px;
          font-size: 0.8rem;
          font-weight: 700;
          text-decoration: none;
          cursor: pointer;
          transition: all 0.15s ease;
        }
        .topbar-signin-btn:hover {
          background-color: #f8fafc;
          border-color: #94a3b8;
        }
        .topbar-apply-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: linear-gradient(135deg, #003666 0%, #0284c7 100%);
          border: none;
          color: #ffffff;
          padding: 7px 14px;
          border-radius: 8px;
          font-size: 0.8rem;
          font-weight: 800;
          cursor: pointer;
          box-shadow: 0 2px 6px rgba(0, 54, 102, 0.25);
          transition: all 0.15s ease;
        }
        .topbar-apply-btn:hover {
          opacity: 0.95;
          box-shadow: 0 3px 10px rgba(0, 54, 102, 0.35);
        }
        .access-label-compact {
          display: none;
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
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 18px 20px;
          margin-bottom: 14px;
          transition: all 0.15s ease;
          box-shadow: 0 1px 3px rgba(0,0,0,0.02);
        }
        .product-card:hover {
          border-color: #cbd5e1;
          box-shadow: 0 4px 12px rgba(0,0,0,0.04);
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
            padding: 8px 12px !important;
            gap: 10px !important;
            flex-direction: column !important;
            align-items: stretch !important;
          }
          .topbar-brand {
            width: 100% !important;
            display: flex !important;
            align-items: center !important;
            justify-content: space-between !important;
          }
          .topbar-brand-title {
            font-size: 0.88rem !important;
          }
          .portal-verified-badge {
            display: none !important;
          }
          .topbar-actions {
            width: 100% !important;
            display: flex !important;
            flex-direction: column !important;
            gap: 8px !important;
          }
          .topbar-row-logistics {
            width: 100% !important;
            display: flex !important;
            flex-wrap: wrap !important;
            align-items: center !important;
            justify-content: space-between !important;
            gap: 8px !important;
          }
          .topbar-row-access {
            width: 100% !important;
            display: grid !important;
            grid-template-columns: 1fr 1fr !important;
            gap: 8px !important;
          }
          .topbar-destination {
            flex: 1 1 100% !important;
            width: 100% !important;
            min-width: 100% !important;
            max-width: 100% !important;
            padding: 7px 12px !important;
            font-size: 0.82rem !important;
            display: flex !important;
            align-items: center !important;
            box-sizing: border-box !important;
            border-radius: 8px !important;
          }
          .topbar-destination select {
            width: 100% !important;
            max-width: 100% !important;
            font-size: 0.82rem !important;
            white-space: nowrap !important;
          }
          .topbar-currency-toggle {
            flex-shrink: 0 !important;
          }
          .currency-btn {
            padding: 5px 8px !important;
            font-size: 0.72rem !important;
          }
          .topbar-cart-pill {
            flex-shrink: 0 !important;
            padding: 5px 8px !important;
            font-size: 0.72rem !important;
          }
          .topbar-signin-btn,
          .topbar-apply-btn {
            width: 100% !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            text-align: center !important;
            min-height: 38px !important;
            padding: 6px 10px !important;
            font-size: 0.76rem !important;
            border-radius: 8px !important;
            box-sizing: border-box !important;
            white-space: nowrap !important;
          }
          .access-label-full {
            display: none !important;
          }
          .access-label-compact {
            display: inline !important;
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
          }
          .header-card-actions button {
            width: 100% !important;
            justify-content: center !important;
            min-height: 42px !important;
          }
          .header-card-qr {
            width: 100% !important;
            display: flex !important;
            justify-content: center !important;
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
      `}</style>
  );
}
