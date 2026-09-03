import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const filePath = join(__dirname, '../src/components/admin/MasterCatalogTable.jsx');

let content = readFileSync(filePath, 'utf8');

const startMarker = '<CatalogOffersPricingDrawer\n        isOpen={!!selectedProduct && !!activeDrawer && [\'offers\', \'pricing\', \'competitors\'].includes(activeDrawer)}';
const endMarker = '<PriceListPdfDrawer';

const startIndex = content.indexOf(startMarker);
const endIndex = content.indexOf(endMarker);

if (startIndex !== -1 && endIndex !== -1) {
  const replacement = `<CatalogOffersPricingDrawer
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
      />\n\n      `;

  content = content.substring(0, startIndex) + replacement + content.substring(endIndex);
  writeFileSync(filePath, content, 'utf8');
  console.log('MasterCatalogTable.jsx cleaned successfully!');
} else {
  console.error('Markers not found:', { startIndex, endIndex });
}
