const fs = require('fs');
const path = require('path');

const filesToUpdate = [
  'src/components/admin/DocumentUploadModule.jsx',
  'src/components/admin/imports/ImportCatalogsTab.jsx',
  'src/components/admin/imports/ImportCoATab.jsx',
  'src/components/admin/imports/ImportPriceListsTab.jsx',
  'src/components/admin/imports/ImportRFQTab.jsx',
  'src/gadgets/GadgetImportTab.jsx',
  'src/pages/Sales/QuotationList.jsx',
  'src/pages/Sales/SalesOrderList.jsx',
  'src/components/shared/UserProfileTab.jsx',
  'src/components/calendar/RegeneraCalendar.jsx',
  'src/templates/ProtocolValidation.jsx'
];

filesToUpdate.forEach(file => {
  if (!fs.existsSync(file)) {
    console.log('Skipping (not found):', file);
    return;
  }
  let content = fs.readFileSync(file, 'utf8');
  let originalContent = content;

  // Add import if not present and we have Checkbox replacements
  if (/<input\s+type="checkbox"/.test(content)) {
    // We'll replace the raw input.
    // Specially handle indeterminate in DocumentUploadModule
    if (file.includes('DocumentUploadModule.jsx')) {
      content = content.replace(
        /<input type="checkbox" checked=\{allSelected\} ref=\{input => \{ if \(input\) input\.indeterminate = someSelected && !allSelected; \}\} onChange=\{\(\) => toggleGroupSelection\(allIds\)\} style=\{\{ cursor: 'pointer', width: '18px', height: '18px' \}\} \/>/g,
        `<Checkbox checked={allSelected} indeterminate={someSelected && !allSelected} onChange={() => toggleGroupSelection(allIds)} />`
      );
      content = content.replace(
        /<input type="checkbox" checked=\{selectedDocs\.has\(variant\.id\)\} onChange=\{\(\) => toggleSelection\(variant\.id\)\} style=\{\{ cursor: 'pointer' \}\} \/>/g,
        `<Checkbox checked={selectedDocs.has(variant.id)} onChange={() => toggleSelection(variant.id)} />`
      );
    }
    
    // Generic replacement
    content = content.replace(/<input\s+type="checkbox"\s+checked=\{([^}]+)\}\s+onChange=\{([^}]+)\}\s*(style=\{[^}]+\})?\s*\/>/g, `<Checkbox checked={$1} onChange={$2} />`);
    // UserProfileTab variant
    content = content.replace(/<input\s+type="checkbox"\s+name="([^"]+)"\s+checked=\{([^}]+)\}\s+onChange=\{([^}]+)\}\s*\/>/g, `<Checkbox name="$1" checked={$2} onChange={$3} />`);
    
    // ProtocolValidation bypassWarning
    content = content.replace(/<input type="checkbox" checked=\{bypassWarning\} onChange=\{\(e\) => setBypassWarning\(e\.target\.checked\)\} \/>/g, `<Checkbox checked={bypassWarning} onChange={(e) => setBypassWarning(e.target.checked)} />`);

    // RegeneraCalendar
    content = content.replace(/<input type="checkbox" checked=\{eventForm\.prn\} onChange=\{\(e\) => setEventForm\(\{ \.\.\.eventForm, prn: e\.target\.checked \}\)\} disabled=\{isPatient\} \/>/g, `<Checkbox checked={eventForm.prn} onChange={(e) => setEventForm({ ...eventForm, prn: e.target.checked })} disabled={isPatient} />`);
    content = content.replace(/<input type="checkbox" checked=\{eventForm\.refillReminder\} onChange=\{\(e\) => setEventForm\(\{ \.\.\.eventForm, refillReminder: e\.target\.checked \}\)\} disabled=\{isPatient\} \/>/g, `<Checkbox checked={eventForm.refillReminder} onChange={(e) => setEventForm({ ...eventForm, refillReminder: e.target.checked })} disabled={isPatient} />`);
    
    // Sales Pages
    content = content.replace(/<input type="checkbox" checked=\{isDropship\} onChange=\{e => setIsDropship\(e\.target\.checked\)\} style=\{\{ width: '15px', height: '15px' \}\} \/>/g, `<Checkbox checked={isDropship} onChange={e => setIsDropship(e.target.checked)} />`);

    if (content !== originalContent) {
      // Determine relative path to src/components/ui
      const depth = file.split('/').length - 2;
      const relativePath = depth === 0 ? './components/ui' : '../'.repeat(depth) + 'components/ui';
      
      // Check if Checkbox is already imported
      if (!content.includes('Checkbox')) {
          console.warn('Wait, Checkbox string missing in ' + file);
      }
      
      // Look for an existing import from ui
      if (new RegExp(`from\\s+['"]${relativePath}['"]`).test(content)) {
        // Find it and inject Checkbox
        content = content.replace(
          new RegExp(`(import\\s+\\{[^\\]]+)(\\}\\s+from\\s+['"]${relativePath}['"])`),
          `$1, Checkbox $2`
        );
      } else {
        // Add new import
        // Place it after react import
        content = content.replace(
          /(import React[^;]*;\n)/,
          `$1import { Checkbox } from '${relativePath}';\n`
        );
        // Fallback if React import isn't at the top
        if (content.indexOf(`import { Checkbox }`) === -1) {
            content = `import { Checkbox } from '${relativePath}';\n` + content;
        }
      }
      fs.writeFileSync(file, content);
      console.log('Updated:', file);
    }
  }
});
