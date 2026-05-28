describe('Debug Page Load', () => {
  it('waits for React to mount and logs contents', () => {
    cy.on('window:before:load', (win) => {
      cy.stub(win.console, 'error').callsFake((...args) => {
        cy.task('log', 'CONSOLE ERROR: ' + args.join(' '));
      });
    });

    cy.visit('/');
    
    // Assert that #root becomes non-empty
    cy.get('#root', { timeout: 8000 }).should('not.be.empty');
    
    cy.document().then((doc) => {
      cy.task('log', 'SUCCESS: React mounted. HTML snippet: ' + doc.getElementById('root').innerHTML.substring(0, 500));
    });
  });
});
