import React from 'react';
import { UploadCloud } from 'lucide-react';
import TooltipWrapper from '../ui/TooltipWrapper';
import AppEntityCell from '../ui/AppEntityCell';
import InlineEditField from '../ui/InlineEditField';
import AppStatusToggle from '../ui/AppStatusToggle';
import AppActionGroup from '../ui/AppActionGroup';

export function getAdminProductsColumns({
  isAdmin,
  user,
  readOnly,
  savingProduct,
  navigate,
  updateProduct,
  handleDeleteProduct,
  handleScrapeCompetitor,
}) {
  const columns = [
    {
      key: 'product',
      header: 'Product / Category',
      sortKey: 'product',
      sortValue: (p) => p.name.toLowerCase(),
      render: (p) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {p.zoho_item_id ? (
            <TooltipWrapper text="Synced to Zoho Inventory">
              <UploadCloud size={16} color="#1a73e8" />
            </TooltipWrapper>
          ) : (
            <div style={{ width: 16 }}></div>
          )}
          <AppEntityCell
            title={p.name}
            subtitle={
              <>
                <span style={{ opacity: 0.5 }}>↳</span> {p.category} |{' '}
                {p.isGroup ? `${p.variants.length} Variants` : p.dosage}
              </>
            }
          />
        </div>
      ),
    },
    {
      key: 'product_type',
      header: 'Type',
      width: '120px',
      render: (p) => {
        return (
          <InlineEditField
            type="select"
            value={p.product_type || 'Other'}
            options={['Peptides', 'API Peptides', 'API Supplements', 'Other']}
            onSave={(val) => {
              updateProduct(p.id, { product_type: val });
            }}
          />
        );
      },
    },
    {
      key: 'status',
      header: 'Status',
      width: '80px',
      sortKey: 'status',
      render: (p) => {
        let isLocked = false;
        let isLocallyActive = p.isActive !== false;

        if (!isAdmin && user) {
          if (p.isActive === false) {
            isLocked = true;
            isLocallyActive = false;
          } else {
            const localOverrides = p.localOverrides || {};
            if (localOverrides[user.uid] === false) {
              isLocallyActive = false;
            }
          }
        }

        const handleToggle = (willBeActive) => {
          if (isAdmin) {
            updateProduct(p.id, { isActive: willBeActive });
          } else {
            if (!user) return;
            updateProduct(p.id, { [`localOverrides.${user.uid}`]: willBeActive });
          }
        };

        return (
          <AppStatusToggle isActive={isLocallyActive} isLocked={isLocked} onToggle={handleToggle} />
        );
      },
    },
  ];

  if (!readOnly) {
    columns.push({
      key: 'actions',
      header: 'Actions',
      align: 'right',
      width: '180px',
      render: (p) => {
        const targetP = p.isGroup ? (p.variants && p.variants[0] ? p.variants[0] : p) : p;
        const actions = [
          {
            type: 'inventory',
            onClick: () => {
              navigate(
                `/admin/sku-sync?sku=${encodeURIComponent(targetP.sku || '')}&productId=${encodeURIComponent(targetP.id || '')}`
              );
            },
          },
          {
            type: 'pricing',
            onClick: () => {
              navigate(
                `/admin/prices?sku=${encodeURIComponent(targetP.sku || '')}&productId=${encodeURIComponent(targetP.id || '')}`
              );
            },
          },
          {
            type: 'protocols',
            onClick: () => {
              navigate(`/admin/protocols`);
            },
          },
          {
            type: 'ai',
            onClick: () => {
              window.dispatchEvent(
                new CustomEvent('OPEN_ATLAS_CLINICAL_MODE', {
                  detail: { product: targetP.name, sku: targetP.sku },
                })
              );
            },
          },
          {
            type: 'search',
            label: 'Search Competitors',
            onClick: () => handleScrapeCompetitor(targetP),
          },
        ];

        if (!p.isGroup) {
          actions.push({ type: 'delete', onClick: () => handleDeleteProduct(p.id) });
        }

        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {savingProduct === p.id && (
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Saving...</span>
            )}
            <AppActionGroup actions={actions} />
          </div>
        );
      },
    });
  }

  return columns;
}
