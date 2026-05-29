// cypress/e2e/smoke/guest.cy.js
// Smoke test: Guest experience — homepage, mobile drawer, catalog access

describe('Guest — Smoke Test', () => {
  beforeEach(() => {
    // Ensure we are in guest (unauthenticated) state
    cy.clearLocalStorage();
    cy.clearCookies();
    cy.visit('/', {
      onBeforeLoad(win) {
        win.localStorage.setItem('mp_region', 'es');
      }
    });
  });

  it('shows the homepage with Atlas Health branding', () => {
    cy.contains('Atlas Health').should('be.visible');
    cy.get('#root').should('not.be.empty');
  });

  it('shows Guest View badge in the header', () => {
    // The badge renders as "Guest View" (mixed case) in Header.jsx
    cy.contains('Guest View').should('be.visible');
  });

  it('navigates to /login and shows sign-in form', () => {
    cy.visit('/login');
    cy.get('input[type="email"]').should('be.visible');
    cy.get('input[type="password"]').should('be.visible');
    cy.contains('button', 'Secure Sign In').should('be.visible');
  });

  it('mobile drawer opens on hamburger click', () => {
    cy.viewport(390, 844);
    cy.visit('/', {
      onBeforeLoad(win) {
        win.localStorage.setItem('mp_region', 'es');
      }
    });
    // Aria-label from Header.jsx line 473
    cy.get('button[aria-label="Open navigation menu"]', { timeout: 8000 }).click();
    // After opening, catalog section or nav links should be visible
    cy.contains('Professional Account', { timeout: 5000 }).should('be.visible');
  });
});

