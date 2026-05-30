import { TIMEOUT, WAIT, getEnv } from '../../support/constants';
import cartSelectors from '../../fixtures/cart/cart-selectors.json';
import cartData from '../../fixtures/cart/cart-test-data.json';

function addFirstProductToCart(): void {
  cy.visit(getEnv('url') + cartData.moduleUrl, { failOnStatusCode: false });
  cy.waitForSpinnerToDisappear();

  cy.get(cartSelectors.productTitle, { timeout: TIMEOUT.tableData })
    .should('have.length.greaterThan', 0)
    .first()
    .click();
  cy.waitForSpinnerToDisappear();

  cy.get('body').then(($body) => {
    $body.find('.attributes select').each((_, el) => {
      const $sel  = Cypress.$(el);
      const first = $sel.find('option').not('[value=""]').not('[value="0"]').first();
      if (first.length) $sel.val(first.val() as string).trigger('change');
    });
    const radioNames = [...new Set($body.find('.attributes input[type="radio"]')
      .map((_, el) => (el as HTMLInputElement).name).get())];
    radioNames.forEach((name) => {
      cy.get(`.attributes input[type="radio"][name="${name}"]`).first().check({ force: true });
    });
  });

  cy.get(cartSelectors.addToCartButton, { timeout: TIMEOUT.actionButton }).should('be.visible').click();
  cy.wait(WAIT.long);
}

describe('Storefront - Cart and Checkout', () => {

  before(() => { cy.loginAsCustomer(); });

  it('Test: 01 - Place Order for Available Product', () => {
    addFirstProductToCart();
    cy.loadCartPage();
    cy.proceedToCheckout({});
    cy.url({ timeout: TIMEOUT.pageLoad }).should('include', '/checkout/completed');
  });

  it('Test: 02 - Place Second Order and Confirm Checkout Completes', () => {
    addFirstProductToCart();
    cy.loadCartPage();
    cy.proceedToCheckout({});
    cy.url({ timeout: TIMEOUT.pageLoad }).should('include', '/checkout/completed');
  });

  it('Test: 03 - Place Third Order and Verify Success Message', () => {
    addFirstProductToCart();
    cy.loadCartPage();
    cy.proceedToCheckout({});
    cy.url({ timeout: TIMEOUT.pageLoad }).should('include', '/checkout/completed');
    cy.get('body').should('contain.text', 'successfully processed');
  });

});
