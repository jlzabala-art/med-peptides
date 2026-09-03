"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { getComparisonDataAction } from '@/app/actions/productActions';
import PageHeader from '../ui/PageHeader';
import DataTable from '../ui/DataTable';
import GlobalSearchBar from '../ui/GlobalSearchBar';
import { AlertCircle, Package, ShieldCheck, Calculator, Truck, ShoppingCart, Plus, X, FileText } from 'lucide-react';
import Badge from '../ui/Badge';

const formatCurrency = (val) => {
  if (val === null || val === undefined) return '';
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 }).format(val);
};

export default function AdminPricingEngineTabClient({ isMobile }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [desiredVolume, setDesiredVolume] = useState(1);
  
  // Phase 3: B2B Cart State
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const result = await getComparisonDataAction();
        if (result.success) {
          setData(result.data);
        } else {
          console.error("Failed to load comparison data", result.error);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Recalculate and re-sort data based on desired volume & landed costs
  const processedData = useMemo(() => {
    const vol = Math.max(1, parseInt(desiredVolume) || 1);
    
    return data.map(moleculeGroup => {
      const updatedVariants = moleculeGroup.variants.map(variant => {
        let effectivePriceUsd = variant.price_usd;
        let activeTier = null;

        // Apply volume discount if available
        if (variant.pricing_tiers && variant.pricing_tiers.length > 0) {
          const sortedTiers = [...variant.pricing_tiers].sort((a, b) => b.min_qty - a.min_qty);
          for (const tier of sortedTiers) {
            if (vol >= tier.min_qty) {
              effectivePriceUsd = tier.price_usd;
              activeTier = tier;
              break;
            }
          }
        }

        // Calculate landed cost = unit price + (shipping cost / volume)
        const amortizedShipping = (variant.flat_shipping_cost_usd || 0) / vol;
        const landedPriceUsd = effectivePriceUsd + amortizedShipping;

        const effectivePricePerMg = (landedPriceUsd && variant.total_active_mg) 
          ? landedPriceUsd / variant.total_active_mg 
          : null;

        return {
          ...variant,
          effectivePriceUsd,
          amortizedShipping,
          landedPriceUsd,
          effectivePricePerMg,
          activeTier,
          moleculeName: moleculeGroup.canonicalName
        };
      });

      // Sort variants in this molecule group by the NEW landed price per mg
      updatedVariants.sort((a, b) => {
        if (a.effectivePricePerMg === null) return 1;
        if (b.effectivePricePerMg === null) return -1;
        return a.effectivePricePerMg - b.effectivePricePerMg;
      });

      return {
        ...moleculeGroup,
        variants: updatedVariants
      };
    });
  }, [data, desiredVolume]);

  const filteredData = useMemo(() => {
    if (!searchTerm) return processedData;
    const lower = searchTerm.toLowerCase();
    return processedData.filter(item => item.canonicalName.toLowerCase().includes(lower));
  }, [processedData, searchTerm]);

  const addToCart = (variant) => {
    const vol = Math.max(1, parseInt(desiredVolume) || 1);
    const existingIdx = cart.findIndex(item => item.id === variant.id);
    if (existingIdx > -1) {
      const newCart = [...cart];
      newCart[existingIdx].quantity += vol;
      setCart(newCart);
    } else {
      setCart([...cart, { ...variant, quantity: vol }]);
    }
    setIsCartOpen(true);
  };

  const removeFromCart = (id) => {
    setCart(cart.filter(item => item.id !== id));
  };

  const updateCartQty = (id, newQty) => {
    if (newQty < 1) return;
    setCart(cart.map(item => item.id === id ? { ...item, quantity: newQty } : item));
  };

  const cartBySupplier = useMemo(() => {
    const grouped = {};
    cart.forEach(item => {
      const s = item.supplier;
      if (!grouped[s]) grouped[s] = { items: [], subtotal: 0, shipping: item.flat_shipping_cost_usd || 0, leadTime: item.lead_time_days };
      grouped[s].items.push(item);
      grouped[s].subtotal += (item.effectivePriceUsd * item.quantity);
      // Flat shipping is per supplier order usually, we'll just take the max if it varies
      grouped[s].shipping = Math.max(grouped[s].shipping, item.flat_shipping_cost_usd || 0);
    });
    return grouped;
  }, [cart]);

  // Master columns for the molecules
  const columns = [
    {
      key: 'canonicalName',
      label: 'Canonical Molecule',
      width: '40%',
      render: (val, row) => (
        <div className="flex items-center gap-2 font-medium">
          <Package className="w-4 h-4 text-slate-400" />
          {val}
        </div>
      )
    },
    {
      key: 'variantCount',
      label: 'Available Offers',
      width: '30%',
      render: (_, row) => (
        <Badge variant="secondary">{row.variants.length} suppliers</Badge>
      )
    },
    {
      key: 'priceRange',
      label: `Landed Price Range ($/mg)`,
      width: '30%',
      render: (_, row) => {
        const validPrices = row.variants.filter(v => v.effectivePricePerMg !== null).map(v => v.effectivePricePerMg);
        if (validPrices.length === 0) return 'N/A';
        const min = Math.min(...validPrices);
        const max = Math.max(...validPrices);
        return min === max 
          ? formatCurrency(min) + '/mg' 
          : `${formatCurrency(min)} - ${formatCurrency(max)}/mg`;
      }
    }
  ];

  // The expandable render function for variants
  const expandableRender = (row) => {
    return (
      <div className="bg-slate-50 p-4 rounded-b-md border-x border-b border-slate-200 shadow-inner overflow-x-auto">
        <h4 className="text-sm font-semibold text-slate-700 mb-3">Supplier Offers for {row.canonicalName}</h4>
        <DataTable
          data={row.variants}
          pagination={false}
          columns={[
            {
              key: 'supplier',
              label: 'Supplier & Lead Time',
              width: '25%',
              render: (_, variant) => {
                return (
                  <div className="flex flex-col gap-1">
                    <div className="font-medium text-slate-800 flex items-center gap-2">
                      {variant.supplier}
                      {variant.requires_vat_confirmation && (
                        <span title="Provisional Price: VAT inclusion unconfirmed" className="inline-flex items-center text-amber-600">
                          <AlertCircle className="w-3.5 h-3.5" />
                        </span>
                      )}
                    </div>
                    {variant.lead_time_days ? (
                       <div className="flex items-center gap-1 text-[11px] text-slate-500">
                         <Truck className="w-3 h-3" />
                         Est. {variant.lead_time_days} days
                       </div>
                    ) : null}
                  </div>
                );
              }
            },
            {
              key: 'format',
              label: 'Format & Quality',
              width: '25%',
              render: (_, variant) => (
                <div className="flex flex-col gap-1">
                  <span className="text-slate-600 capitalize">
                    {variant.dosage_form.replace(/_/g, ' ')} 
                    <span className="text-xs ml-1 text-slate-400">({variant.total_active_mg ? `${variant.total_active_mg}mg` : 'N/A'})</span>
                  </span>
                  {variant.has_coa_verified ? (
                    <div className="flex w-fit items-center gap-1 px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-medium">
                      <ShieldCheck className="w-3 h-3" />
                      Premium Grade {variant.purity_percentage ? `> ${Math.floor(variant.purity_percentage)}%` : '>99%'}
                    </div>
                  ) : (
                    <span className="text-slate-400 text-[10px]">Standard (Unverified)</span>
                  )}
                </div>
              )
            },
            {
              key: 'unit_shipping',
              label: 'Unit / Shipping',
              width: '20%',
              render: (_, variant) => {
                const hasDiscount = variant.activeTier && variant.activeTier.min_qty > 1;
                return (
                  <div className="flex flex-col">
                    <span className={`font-medium ${hasDiscount ? 'text-green-700' : ''}`}>
                      Unit: {formatCurrency(variant.effectivePriceUsd)}
                      {hasDiscount && (
                        <span className="text-[10px] text-green-600 ml-2">(Vol. disc)</span>
                      )}
                    </span>
                    {variant.flat_shipping_cost_usd > 0 && (
                      <span className="text-xs text-slate-500">
                        + {formatCurrency(variant.flat_shipping_cost_usd)} flat shipping
                      </span>
                    )}
                  </div>
                );
              }
            },
            {
              key: 'landed',
              label: 'Landed Price per mg',
              width: '20%',
              render: (_, variant) => {
                const isBestValue = variant.id === row.variants[0]?.id && variant.effectivePricePerMg !== null;
                return variant.effectivePricePerMg ? (
                  <div className="flex flex-col items-end gap-1">
                    <div className="flex items-center justify-end gap-2">
                      <span className={`font-semibold ${isBestValue ? 'text-green-700' : 'text-slate-700'}`}>
                        {formatCurrency(variant.effectivePricePerMg)}/mg
                      </span>
                      {isBestValue && <Badge variant="success" className="text-[10px] px-1.5 py-0.5">Best Landed Value</Badge>}
                    </div>
                    <span className="text-[10px] text-slate-500">
                      Landed: {formatCurrency(variant.landedPriceUsd)}/vial
                    </span>
                  </div>
                ) : 'N/A';
              }
            },
            {
              key: 'action',
              label: 'Action',
              width: '10%',
              render: (_, variant) => (
                <div style={{ display: 'flex', justifyContent: 'center' }}>
                  <button 
                    onClick={(e) => { e.stopPropagation(); addToCart(variant); }}
                    className="p-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-md shadow-sm transition-colors"
                    title={`Add ${desiredVolume} to Draft PO`}
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              )
            }
          ]}
          getRowProps={(variant) => {
            const isBestValue = variant.id === row.variants[0]?.id && variant.effectivePricePerMg !== null;
            return {
              className: isBestValue ? 'bg-green-50/50' : 'bg-white'
            };
          }}
        />
      </div>
    );
  };

  const handlePrintPO = () => {
    window.print();
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 relative">
      <PageHeader 
        title="Pricing Engine" 
        subtitle="Apples-to-apples B2B peptide comparison with total landed costs"
        actions={
          <button 
            onClick={() => setIsCartOpen(true)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            <ShoppingCart className="w-4 h-4" />
            <span>PO Builder</span>
            {cart.length > 0 && (
              <span className="bg-white text-blue-700 text-xs font-bold px-2 py-0.5 rounded-full ml-1">
                {cart.length}
              </span>
            )}
          </button>
        }
      />
      
      <div className="flex-1 p-6 flex flex-col gap-4 max-w-7xl mx-auto w-full">
        {/* Dynamic Controls Bar */}
        <div className="flex flex-col sm:flex-row items-center gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm print:hidden">
          <div className="flex-1 w-full">
            <GlobalSearchBar 
              value={searchTerm}
              onChange={setSearchTerm}
              placeholder="Search molecules (e.g., AOD-9604)..."
              size="md"
            />
          </div>
          
          <div className="flex items-center gap-3 w-full sm:w-auto bg-slate-50 px-4 py-2 rounded-lg border border-slate-200">
            <Calculator className="w-5 h-5 text-slate-400" />
            <div className="flex flex-col">
              <label htmlFor="volume" className="text-xs font-medium text-slate-500">Total Order Volume (Amortizes Shipping)</label>
              <div className="flex items-center gap-2">
                <input 
                  id="volume"
                  type="number" 
                  min="1"
                  value={desiredVolume}
                  onChange={(e) => setDesiredVolume(e.target.value)}
                  className="w-20 bg-white border border-slate-300 rounded px-2 py-1 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-sm text-slate-600">units</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden print:hidden">
          <DataTable 
            data={filteredData}
            columns={columns}
            keyExtractor={row => row.canonicalName}
            isLoading={loading}
            emptyTitle="No molecules found"
            emptySubtitle="Adjust your search filters or check your supplier catalog."
            expandableRender={expandableRender}
          />
        </div>
      </div>

      {/* PO Builder Slide-Over Cart */}
      {isCartOpen && (
        <>
          <div 
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 print:hidden"
            onClick={() => setIsCartOpen(false)}
          ></div>
          <div className="fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-2xl z-50 flex flex-col print:w-full print:max-w-none print:static print:h-auto print:shadow-none">
            <div className="flex items-center justify-between p-4 border-b border-slate-200 print:hidden">
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <ShoppingCart className="w-5 h-5 text-blue-600" />
                Draft Purchase Orders
              </h2>
              <button onClick={() => setIsCartOpen(false)} className="p-1 hover:bg-slate-100 rounded text-slate-500">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 bg-slate-50">
              {cart.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-slate-400 gap-3 print:hidden">
                  <Package className="w-12 h-12" />
                  <p>Your PO Draft is empty.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {Object.entries(cartBySupplier).map(([supplier, details]) => (
                    <div key={supplier} className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden mb-6">
                      <div className="bg-slate-100 px-4 py-3 border-b border-slate-200 flex justify-between items-center">
                        <div className="flex flex-col">
                          <h3 className="font-bold text-slate-800 text-base">{supplier}</h3>
                          {details.leadTime && (
                            <span className="text-xs text-slate-500 flex items-center gap-1">
                              <Truck className="w-3 h-3" />
                              Lead Time: {details.leadTime} days
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="p-0">
                        <DataTable
                          data={details.items}
                          keyField="id"
                          columns={[
                            {
                              id: 'item',
                              header: 'Item',
                              width: '50%',
                              render: (item) => (
                                <div>
                                  <div className="font-medium text-slate-800">{item.moleculeName}</div>
                                  <div className="text-xs text-slate-500 capitalize">{item.dosage_form.replace(/_/g, ' ')} ({item.total_active_mg}mg)</div>
                                  <div className="text-[10px] text-slate-400 mt-0.5">{formatCurrency(item.effectivePriceUsd)}/ea</div>
                                </div>
                              ),
                            },
                            {
                              id: 'quantity',
                              header: 'Qty',
                              width: '20%',
                              render: (item) => (
                                <div className="text-center">
                                  <input 
                                    type="number" 
                                    min="1" 
                                    value={item.quantity}
                                    onChange={(e) => updateCartQty(item.id, parseInt(e.target.value) || 1)}
                                    className="w-14 border border-slate-300 rounded px-1.5 py-1 text-center text-sm print:border-none print:p-0"
                                  />
                                </div>
                              ),
                            },
                            {
                              id: 'extPrice',
                              header: 'Ext. Price',
                              width: '20%',
                              render: (item) => (
                                <div className="text-right font-medium text-slate-700">
                                  {formatCurrency(item.effectivePriceUsd * item.quantity)}
                                </div>
                              ),
                            },
                            {
                              id: 'actions',
                              header: '',
                              width: '10%',
                              render: (item) => (
                                <div className="text-center print:hidden">
                                  <button onClick={() => removeFromCart(item.id)} className="text-red-400 hover:text-red-600">
                                    <X className="w-4 h-4" />
                                  </button>
                                </div>
                              ),
                            },
                          ]}
                        />
                      </div>
                      <div className="bg-slate-50 p-3 border-t border-slate-200">
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-slate-500">Subtotal</span>
                          <span className="font-medium text-slate-700">{formatCurrency(details.subtotal)}</span>
                        </div>
                        <div className="flex justify-between text-sm mb-2 pb-2 border-b border-slate-200">
                          <span className="text-slate-500">Flat Shipping</span>
                          <span className="font-medium text-slate-700">{formatCurrency(details.shipping)}</span>
                        </div>
                        <div className="flex justify-between text-base font-bold">
                          <span className="text-slate-800">PO Total</span>
                          <span className="text-blue-700">{formatCurrency(details.subtotal + details.shipping)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="p-4 border-t border-slate-200 bg-white print:hidden">
              <button 
                disabled={cart.length === 0}
                onClick={handlePrintPO}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white py-3 rounded-lg font-bold flex justify-center items-center gap-2 transition-colors"
              >
                <FileText className="w-5 h-5" />
                Generate Purchase Orders PDF
              </button>
            </div>
          </div>
        </>
      )}

      {/* Basic Print Styling embedded */}
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          body { visibility: hidden; }
          .print\\:static { position: absolute !important; left: 0; top: 0; }
          .print\\:w-full { width: 100% !important; max-width: none !important; }
          .fixed.top-0.right-0 { visibility: visible !important; }
          .fixed.top-0.right-0 * { visibility: visible; }
          .print\\:hidden { display: none !important; }
          .print\\:border-none { border: none !important; }
        }
      `}} />
    </div>
  );
}
