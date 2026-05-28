// cypress/support/e2e.js
// Entry point for all Cypress E2E support — imports custom commands
import './commands';

// Globally set default region to bypass destination selector modal and forward logs
Cypress.on('window:before:load', (win) => {
  win.localStorage.setItem('mp_region', 'es');
  
  win.__browser_logs = [];
  const originalLog = win.console.log;
  win.console.log = (...args) => {
    originalLog(...args);
    try {
      const msg = args.map(x => typeof x === 'object' ? JSON.stringify(x) : String(x)).join(' ');
      win.__browser_logs.push('[LOG] ' + msg);
    } catch (e) {}
  };
  const originalError = win.console.error;
  win.console.error = (...args) => {
    originalError(...args);
    try {
      const msg = args.map(x => typeof x === 'object' ? JSON.stringify(x) : String(x)).join(' ');
      win.__browser_logs.push('[ERROR] ' + msg);
    } catch (e) {}
  };
  const originalWarn = win.console.warn;
  win.console.warn = (...args) => {
    originalWarn(...args);
    try {
      const msg = args.map(x => typeof x === 'object' ? JSON.stringify(x) : String(x)).join(' ');
      win.__browser_logs.push('[WARN] ' + msg);
    } catch (e) {}
  };
});
// Catch uncaught exceptions and log them for debugging
Cypress.on('uncaught:exception', (err, runnable) => {
  console.error('UNCAUGHT EXCEPTION:', err.stack || err.message || err);
  return false;
});
