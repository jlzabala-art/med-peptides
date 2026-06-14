describe('Flujo de Ventas B2C (Checkout)', () => {
  it('Debería permitir añadir un producto al carrito y proceder al pago', () => {
    // Visit catalog page
    cy.visit('/shop');

    // Wait for catalog items to load
    cy.get('.product-card', { timeout: 10000 }).should('have.length.greaterThan', 0);

    // Click the first "Add to Cart" button
    cy.get('.product-card button').contains('Add').first().click();

    // Verify cart indicator increased
    cy.get('.cart-badge').should('contain', '1');

    // Navigate to checkout
    cy.visit('/checkout');

    // Verify checkout page loaded
    cy.contains('Resumen del Pedido').should('be.visible');

    // Verify the item is in the checkout list
    cy.get('.checkout-item').should('have.length.greaterThan', 0);
  });
});
