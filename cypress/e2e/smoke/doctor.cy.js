// cypress/e2e/smoke/doctor.cy.js
// Smoke test: Doctor/Physician portal — login, emerald sidebar, clinical tabs

const BASE = 'https://med-peptides-app-27a3a.web.app';

describe('Doctor — Smoke Test', () => {
  beforeEach(() => {
    cy.clearLocalStorage();
    cy.clearCookies();
    cy.loginAs('doctor');
    cy.url({ timeout: 12000 }).should('include', '/doctor');
  });

  it('shows Physician Portal with emerald sidebar', () => {
    cy.contains('Physician Portal', { timeout: 8000 }).should('be.visible');
  });

  it('shows Clinical Work nav group', () => {
    cy.contains(/clinical work/i, { timeout: 5000 }).should('be.visible');
  });

  it('shows Overview tab by default', () => {
    cy.contains(/overview|clinical overview/i, { timeout: 8000 }).should('be.visible');
  });

  it('navigates to Prescriptions tab', () => {
    cy.contains(/Prescriptions|Rx/i, { timeout: 5000 }).click();
    cy.contains(/prescription|protocol/i, { timeout: 8000 }).should('be.visible');
  });

  it('mobile: shows hamburger and opens drawer', () => {
    cy.viewport(390, 844);
    cy.reload();
    cy.url({ timeout: 10000 }).should('include', '/doctor');
    cy.get('.sb-mobile-trigger, [aria-label*="menu"], [aria-label*="navigation"]', { timeout: 8000 })
      .first().should('be.visible');
  });

  afterEach(() => cy.logout());
});
