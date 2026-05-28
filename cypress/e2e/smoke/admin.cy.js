// cypress/e2e/smoke/admin.cy.js
// Smoke test: Admin portal — login, sidebar nav groups, tab navigation

const BASE = 'https://med-peptides-app-27a3a.web.app';

describe('Admin — Smoke Test', () => {
  beforeEach(() => {
    cy.clearLocalStorage();
    cy.clearCookies();
    cy.loginAs('admin');
    // Wait for Firebase Auth redirect — admin goes to /admin
    cy.url({ timeout: 20000 }).should('include', '/admin');
  });

  it('shows Admin sidebar with Control Center header', () => {
    cy.contains('Control Center', { timeout: 8000 }).should('be.visible');
    cy.contains('Admin Portal').should('be.visible');
  });

  it('sidebar shows all expected nav groups', () => {
    cy.contains(/overview/i).should('be.visible');
    cy.contains(/users/i).should('be.visible');
    cy.contains(/catalog/i).should('be.visible');
    cy.contains(/orders/i).should('be.visible');
    cy.contains(/ai agents/i).should('be.visible');
  });

  it('navigates to User Management tab', () => {
    cy.contains('User Management').click();
    cy.contains(/users|members|accounts/i, { timeout: 8000 }).should('be.visible');
  });

  it('navigates to Orders tab', () => {
    cy.contains('Order Queue').click();
    cy.contains(/orders|queue/i, { timeout: 8000 }).should('be.visible');
  });

  it('shows NO public site header on /admin (no double header)', () => {
    cy.get('.site-header').should('not.exist');
  });

  afterEach(() => cy.logout());
});
