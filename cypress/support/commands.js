const ACCOUNTS = {
  admin:      { email: 'admin@regenpept.test',      password: 'TestAdmin1234!' },
  doctor:     { email: 'doctor@regenpept.test',     password: 'Test1234!' },
  wholesaler: { email: 'wholesaler@regenpept.test', password: 'Test1234!' },
  patient:    { email: 'patient@regenpept.test',    password: 'Test1234!' },
  guest:      { email: 'guest@regenpept.test',      password: 'Test1234!' }
};

Cypress.Commands.add('loginAs', (role) => {
  const account = ACCOUNTS[role];
  if (!account) throw new Error(`Unknown role: "${role}".`);

  cy.task('log', `Starting loginAs for role: ${role}`);
  
  // Explicitly sign out first using the window helper to destroy any active IndexedDB session
  cy.window().then((win) => {
    if (win.firebaseSignOut) {
      cy.task('log', 'Signing out active session via window.firebaseSignOut first...');
      return win.firebaseSignOut().catch(() => {});
    }
  });

  cy.visit('/login');
  
  // Double check if we are still logged in (e.g. if the window helper wasn't loaded yet)
  cy.get('body').then(($body) => {
    if ($body.find('button:contains("Sign Out")').length > 0) {
      cy.task('log', 'Found active session on login page, clicking Sign Out...');
      cy.contains('button', 'Sign Out').click();
      cy.get('input[type="email"]', { timeout: 10000 }).should('be.visible');
    }
  });

  cy.get('input[type="email"]', { timeout: 15000 }).should('be.visible').type(account.email, { delay: 50 });
  cy.get('input[type="password"]').should('be.visible').type(account.password, { delay: 50 });
  cy.task('log', 'Typed credentials, clicking submit...');
  cy.contains('button', 'Secure Sign In').should('be.visible').click();
  cy.task('log', 'Clicked submit.');
});

/**
 * cy.logout()
 * Clears local storage, cookies, and visits the home page.
 */
Cypress.Commands.add('logout', () => {
  cy.task('log', 'Logging out...');
  cy.window().then((win) => {
    if (win.firebaseSignOut) {
      return win.firebaseSignOut().catch(() => {});
    }
  });
  cy.clearLocalStorage();
  cy.clearCookies();
  cy.visit('/');
});
