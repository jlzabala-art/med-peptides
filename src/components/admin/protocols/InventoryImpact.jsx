"use client";

import React, { useState, useEffect } from 'react';
import { ShieldAlert, TrendingDown, ShoppingCart, CheckCircle, Package } from '@/lib/icons';
import { calculateProtocolRequirements, calculateInventoryImpact } from '../../../engine/protocolMath';
import { useGlobalStore } from '../../../stores/globalStore';
import DataTable from '../../ui/DataTable';

export default function InventoryImpact({ protocol }) {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const products = useGlobalStore(state => state.products);
  const fetchProducts = useGlobalStore(state => state.fetchProducts);
  const isProductsLoaded = useGlobalStore(state => state.isProductsLoaded);

  useEffect(() => {
    async function loadInventory() {
      if (!isProductsLoaded) {
        await fetchProducts();
      }
      
      const requirements = calculateProtocolRequirements(protocol);
      if (requirements.length === 0) {
        setLoading(false);
        return;
      }

      // Use the global store products, ensuring we don't need to re-query Firestore inside the component
      const impact = calculateInventoryImpact(requirements, useGlobalStore.getState().products);
      setInventory(impact);
      setLoading(false);
    }

    loadInventory();
  }, [protocol, isProductsLoaded, fetchProducts]);

  if (loading) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading inventory data...</div>;
  }

  if (inventory.length === 0) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
        No valid products found in protocol to check inventory.
      </div>
    );
  }

  const [isGeneratingPO, setIsGeneratingPO] = useState(false);
  const [poGenerated, setPoGenerated] = useState(false);

  const handleCreatePO = async () => {
    setIsGeneratingPO(true);
    try {
      // Simulate backend API call or Firestore write to create a Draft PO
      await new Promise(resolve => setTimeout(resolve, 1500));
      setPoGenerated(true);
    } catch (error) {
      console.error("Failed to generate PO", error);
    } finally {
      setIsGeneratingPO(false);
    }
  };

  const totalPurchaseCost = inventory.reduce((acc, item) => acc + (item.shortage * item.costPerVial), 0);
  const totalShortage = inventory.reduce((acc, item) => acc + item.shortage, 0);

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', paddingBottom: '2rem' }}>
      <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.5rem' }}>Inventory Impact</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', margin: 0 }}>
            Compares the required vials for this protocol against current stock levels.
          </p>
        </div>
        
        {totalShortage > 0 && (
          poGenerated ? (
             <div style={{ background: '#dcfce7', color: '#16a34a', padding: '0.5rem 1rem', borderRadius: '8px', fontSize: '0.9rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <CheckCircle size={18} /> PO Draft Created
             </div>
          ) : (
            <button 
              className="btn btn-primary" 
              onClick={handleCreatePO}
              disabled={isGeneratingPO}
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', opacity: isGeneratingPO ? 0.7 : 1 }}
            >
              <ShoppingCart size={16} /> 
              {isGeneratingPO ? 'Generating...' : `Auto-Dispatch PO (AED ${totalPurchaseCost.toLocaleString()})`}
            </button>
          )
        )}
      </div>

      <div className="gcp-table-container">
        <DataTable
          columns={[
            {
              key: 'name',
              header: 'Product',
              render: (val) => (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontWeight: 600, color: 'var(--text-main)' }}>
                  <Package size={18} color="var(--text-muted)" />
                  {val}
                </div>
              )
            },
            {
              key: 'requiredVials',
              header: 'Required Vials',
              render: (val) => <span style={{ fontSize: '0.95rem' }}>{val}</span>
            },
            {
              key: 'currentStock',
              header: 'Current Stock',
              render: (val) => <span style={{ fontSize: '0.95rem' }}>{val}</span>
            },
            {
              key: 'status',
              header: 'Status',
              render: (val, item) => (
                val === 'Critical' ? (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: 'var(--danger-light, #fee2e2)', color: 'var(--danger, #dc2626)', padding: '0.35rem 0.75rem', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 600 }}>
                    <ShieldAlert size={14} /> Shortage: {item.shortage}
                  </span>
                ) : val === 'Low' ? (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: 'var(--warning-light, #fef3c7)', color: 'var(--warning, #d97706)', padding: '0.35rem 0.75rem', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 600 }}>
                    <TrendingDown size={14} /> Low Stock
                  </span>
                ) : (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: 'var(--success-light, #dcfce7)', color: 'var(--success, #16a34a)', padding: '0.35rem 0.75rem', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 600 }}>
                    <CheckCircle size={14} /> Sufficient
                  </span>
                )
              )
            },
            {
              key: 'action',
              header: 'Action',
              render: (val, item) => (
                <div style={{ textAlign: 'right' }}>
                  {item.status === 'Critical' && (
                    <span style={{ fontSize: '0.85rem', color: 'var(--primary)', fontWeight: 600, cursor: 'pointer' }}>
                      Order {item.shortage} Vials
                    </span>
                  )}
                </div>
              )
            }
          ]}
          data={inventory}
          keyField={(row, idx) => idx.toString()}
        />
      </div>
    </div>
  );
}
