import React from 'react';
import dynamic from 'next/dynamic';
import StandardDrawer from '../../../ui/StandardDrawer';
import WorkspaceFloatingDock from '../../../shared/workspaces/WorkspaceFloatingDock';
import GoalsCoverageWidget from '../GoalsCoverageWidget';
import UniversalProductQuickView from '../../../shared/UniversalProductQuickView';

const ProductDetailsDrawer = dynamic(() => import('../../products/ProductDetailsDrawer'), { ssr: false });
const CatalogOffersPricingDrawer = dynamic(() => import('./CatalogOffersPricingDrawer'), { ssr: false });
const PriceListPdfDrawer = dynamic(() => import('../PriceListPdfDrawer'), { ssr: false });
const SavedPdfsDrawer = dynamic(() => import('../SavedPdfsDrawer'), { ssr: false });
const ProductBulkEditModal = dynamic(() => import('../ProductBulkEditModal'), { ssr: false });
const ProductMergeModal = dynamic(() => import('../ProductMergeModal'), { ssr: false });
const ProductEnrichmentModal = dynamic(() => import('../ProductEnrichmentModal'), { ssr: false });
const ScanPriceListWidget = dynamic(() => import('../../ScanPriceListWidget'), { ssr: false });
const ProductTransactionsDrawer = dynamic(() => import('./ProductTransactionsDrawer'), { ssr: false });

export default function CatalogModalsContainer({
  activeDrawer,
  setActiveDrawer,
  selectedProduct,
  setSelectedProduct,
  data = [],
  filterSupplier = [],
  displayCurrency,
  setDisplayCurrency,
  priceView,
  setPriceView,
  commercialChannel,
  setCommercialChannel,
  resolveSupplierName,
  handleExportProductPdf,
  isPriceListModalOpen,
  setIsPriceListModalOpen,
  isSavedPdfsOpen,
  setIsSavedPdfsOpen,
  isScanPriceListOpen,
  setIsScanPriceListOpen,
  scanPriceListInitialData,
  setScanPriceListInitialData,
  isBulkEditModalOpen,
  setIsBulkEditModalOpen,
  isMergeModalOpen,
  setIsMergeModalOpen,
  selectedIds = [],
  setSelectedIds,
  cloneConfig,
  setCloneConfig,
  pdfCustomProduct,
  setPdfCustomProduct,
  showGoalsCoverage,
  setShowGoalsCoverage,
  enrichmentProduct,
  setEnrichmentProduct,
  transactionsProduct,
  setTransactionsProduct,
  setOptimisticOverrides,
  handleNavigation,
  refresh,
  queryClient,
  openDrawer
}) {
  return (
    <>
      <ProductDetailsDrawer
        isOpen={activeDrawer === 'edit'}
        onClose={() => {
          setSelectedProduct(null);
          setActiveDrawer(null);
        }}
        product={selectedProduct}
        onSave={() => {
          refresh?.();
        }}
      />

      <UniversalProductQuickView
        isOpen={activeDrawer === 'quick-view' && !!selectedProduct}
        onClose={() => {
          setSelectedProduct(null);
          setActiveDrawer(null);
        }}
        product={selectedProduct}
        products={data}
        activeSupplierFilter={selectedProduct?._preselectedSupplierId || (filterSupplier.length > 0 ? filterSupplier[0] : null)}
      />

      <ProductBulkEditModal
        isOpen={isBulkEditModalOpen}
        onClose={() => setIsBulkEditModalOpen(false)}
        selectedProducts={data.filter(d => selectedIds.includes(d.id))}
        onRefresh={() => {
          setSelectedIds([]);
          refresh?.();
        }}
      />

      <ProductMergeModal
        isOpen={isMergeModalOpen}
        onClose={() => setIsMergeModalOpen(false)}
        selectedProducts={data.filter(d => selectedIds.includes(d.id))}
        onRefresh={() => {
          setSelectedIds([]);
          refresh?.();
        }}
      />

      <CatalogOffersPricingDrawer
        isOpen={!!selectedProduct && !!activeDrawer && ['offers', 'pricing', 'competitors'].includes(activeDrawer)}
        activeDrawer={activeDrawer}
        onClose={() => {
          setSelectedProduct(null);
          setActiveDrawer(null);
        }}
        selectedProduct={selectedProduct}
        setSelectedProduct={setSelectedProduct}
        displayCurrency={displayCurrency}
        setDisplayCurrency={setDisplayCurrency}
        priceView={priceView}
        setPriceView={setPriceView}
        commercialChannel={commercialChannel}
        setCommercialChannel={setCommercialChannel}
        filterSupplier={filterSupplier}
        resolveSupplierName={resolveSupplierName}
        handleExportProductPdf={handleExportProductPdf}
        onOpenImportPriceList={(initData) => {
          setScanPriceListInitialData(initData);
          setIsScanPriceListOpen(true);
          if (typeof openDrawer === 'function') {
            openDrawer('import-price-list', 'new', initData);
          }
        }}
        refresh={refresh}
      />

      <PriceListPdfDrawer
        key={pdfCustomProduct ? `pdf-${pdfCustomProduct.id}` : 'global-pdf'}
        isOpen={isPriceListModalOpen}
        onClose={() => { setIsPriceListModalOpen(false); setCloneConfig(null); setSelectedIds([]); setPdfCustomProduct(null); }}
        selectedProducts={pdfCustomProduct ? [pdfCustomProduct] : data.filter(d => selectedIds.includes(d.id))}
        initialConfig={cloneConfig ? { ...cloneConfig, supplierFilter: cloneConfig.supplierFilter || (filterSupplier?.length > 0 ? filterSupplier[0] : null) } : (filterSupplier?.length > 0 ? { supplierFilter: filterSupplier[0] } : null)}
      />
      
      <SavedPdfsDrawer 
        isOpen={isSavedPdfsOpen}
        onClose={() => setIsSavedPdfsOpen(false)}
        onClone={(config) => {
          setCloneConfig(config);
          setIsSavedPdfsOpen(false);
          setIsPriceListModalOpen(true);
        }}
      />

      {isScanPriceListOpen && (
        <ScanPriceListWidget
          isOpen={true}
          onClose={() => setIsScanPriceListOpen(false)}
          initialData={scanPriceListInitialData}
          zIndex={10050}
        />
      )}

      <StandardDrawer
        isOpen={showGoalsCoverage}
        onClose={() => setShowGoalsCoverage(false)}
        title="🎯 Goals Coverage"
        subtitle="How catalog products map to each therapeutic goal"
        width="620px"
      >
        <div style={{ padding: '1rem 0' }}>
          <GoalsCoverageWidget />
        </div>
      </StandardDrawer>

      <ProductEnrichmentModal
        isOpen={!!enrichmentProduct}
        onClose={() => setEnrichmentProduct(null)}
        product={enrichmentProduct}
        onEnriched={(updated) => {
          if (updated && updated.id) {
            setOptimisticOverrides?.(prev => ({
              ...prev,
              [updated.id]: updated,
              [updated.canonicalName]: updated,
              ...(updated.slug ? { [updated.slug]: updated } : {})
            }));
            queryClient?.invalidateQueries({ queryKey: ['catalog-summary'], exact: false });
            refresh?.();
          }
        }}
      />

      <ProductTransactionsDrawer
        isOpen={!!transactionsProduct}
        onClose={() => setTransactionsProduct(null)}
        product={transactionsProduct}
        onNavigate={handleNavigation}
      />

      <WorkspaceFloatingDock />
    </>
  );
}
