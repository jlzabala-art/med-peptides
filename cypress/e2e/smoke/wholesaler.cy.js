// cypress/e2e/smoke/wholesaler.cy.js
// Smoke test: Wholesaler B2B portal — login, indigo sidebar, Rx inbox

const BASE = 'https://med-peptides-app-27a3a.web.app';

describe('Wholesaler — Smoke Test', () => {
  beforeEach(() => {
    cy.clearLocalStorage();
    cy.clearCookies();
    cy.loginAs('wholesaler');
    cy.url({ timeout: 12000 }).should('include', '/wholesaler');
  });

  it('shows B2B Portal header in sidebar', () => {
    cy.contains('B2B Portal', { timeout: 8000 }).should('be.visible');
  });

  it('shows Overview as default tab', () => {
    cy.contains(/overview/i, { timeout: 8000 }).should('be.visible');
  });

  it('navigates to Rx Inbox tab', () => {
    cy.contains(/rx.?inbox|inbox/i, { timeout: 5000 }).click();
    cy.contains(/inbox|prescriptions|rx/i, { timeout: 8000 }).should('be.visible');
  });

  it('mobile: sidebar drawer is accessible', () => {
    cy.viewport(390, 844);
    cy.reload();
    cy.url({ timeout: 10000 }).should('include', '/wholesaler');
    cy.get('.sb-mobile-trigger, [aria-label*="menu"], [aria-label*="navigation"]', { timeout: 8000 })
      .first().should('be.visible');
  });

  afterEach(() => cy.logout());
});
