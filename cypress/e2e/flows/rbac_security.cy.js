// cypress/e2e/flows/rbac_security.cy.js
// Exhaustive test: Role-Based Access Control (RBAC) Security Boundaries

describe('RBAC Security Boundaries', () => {
  describe('Guest Access (Unauthenticated)', () => {
    beforeEach(() => {
      cy.clearLocalStorage();
      cy.clearCookies();
    });

    it('redirects guest to /login when visiting /admin', () => {
      cy.visit('/admin');
      cy.url().should('include', '/login');
    });

    it('redirects guest to /login when visiting /doctor', () => {
      cy.visit('/doctor');
      cy.url().should('include', '/login');
    });

    it('redirects guest to /login when visiting /wholesaler', () => {
      cy.visit('/wholesaler');
      cy.url().should('include', '/login');
    });

    it('redirects guest to /login when visiting /patient', () => {
      cy.visit('/patient');
      cy.url().should('include', '/login');
    });
  });

  describe('Patient Access', () => {
    beforeEach(() => {
      cy.clearLocalStorage();
      cy.clearCookies();
      cy.loginAs('patient');
      cy.url({ timeout: 15000 }).should('include', '/patient');
    });

    it('redirects patient to /patient when trying to access /admin', () => {
      cy.visit('/admin');
      // Should redirect via /dashboard to /patient
      cy.url({ timeout: 12000 }).should('include', '/patient');
    });

    it('redirects patient to /patient when trying to access /wholesaler', () => {
      cy.visit('/wholesaler');
      // Should redirect via /dashboard to /patient
      cy.url({ timeout: 12000 }).should('include', '/patient');
    });

    afterEach(() => cy.logout());
  });

  describe('Doctor Access', () => {
    beforeEach(() => {
      cy.clearLocalStorage();
      cy.clearCookies();
      cy.loginAs('doctor');
      cy.url({ timeout: 15000 }).should('include', '/doctor');
    });

    it('redirects doctor to /doctor when trying to access /admin', () => {
      cy.visit('/admin');
      // Should redirect via /dashboard to /doctor
      cy.url({ timeout: 12000 }).should('include', '/doctor');
    });

    afterEach(() => cy.logout());
  });

  describe('Wholesaler Access', () => {
    beforeEach(() => {
      cy.clearLocalStorage();
      cy.clearCookies();
      cy.loginAs('wholesaler');
      cy.url({ timeout: 15000 }).should('include', '/wholesaler');
    });

    it('redirects wholesaler to /wholesaler when trying to access /admin', () => {
      cy.visit('/admin');
      // Should redirect via /dashboard to /wholesaler
      cy.url({ timeout: 12000 }).should('include', '/wholesaler');
    });

    afterEach(() => cy.logout());
  });
});
