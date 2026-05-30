import { TIMEOUT, WAIT, getEnv } from '../../support/constants';
import cartData from '../../fixtures/cart/cart-test-data.json';
import cartSelectors from '../../fixtures/cart/cart-selectors.json';

describe('Storefront Validation', () => {

  before(() => { cy.loginAsCustomer(); });

  afterEach(() => { cy.wait(WAIT.medium); });

  it('Test: 01 - View Product Listings on Storefront', { tags: 'prod' }, () => {
    cy.visit(getEnv('url') + cartData.moduleUrl, { failOnStatusCode: false });
    cy.waitForSpinnerToDisappear();
    cy.get(cartSelectors.productItem, { timeout: TIMEOUT.tableData }).should('have.length.greaterThan', 0);
    cy.url().should('include', '/notebooks');
  });

  it('Test: 02 - Add Product to Cart', { tags: 'prod' }, () => {
    cy.visit(getEnv('url') + cartData.moduleUrl, { failOnStatusCode: false });
    cy.waitForSpinnerToDisappear();
    cy.get(cartSelectors.productTitle, { timeout: TIMEOUT.actionButton }).first().click();
    cy.get(cartSelectors.addToCartButton, { timeout: TIMEOUT.actionButton }).should('be.visible').click();
    cy.wait(WAIT.long);
    cy.visit(getEnv('url') + cartData.cartUrl, { failOnStatusCode: false });
    cy.waitForSpinnerToDisappear();
    cy.get(cartSelectors.cartPageRows, { timeout: TIMEOUT.actionButton }).should('have.length.greaterThan', 0);
  });

  it('Test: 03 - View Cart Contents', { tags: 'prod' }, () => {
    cy.visit(getEnv('url') + cartData.cartUrl, { failOnStatusCode: false });
    cy.waitForSpinnerToDisappear();
    cy.get('body', { timeout: TIMEOUT.actionButton }).then(($body) => {
      if ($body.find(cartSelectors.cartPageRows).length > 0) {
        cy.get(cartSelectors.cartPageRows).should('have.length.greaterThan', 0);
        cy.get(cartSelectors.checkoutButton, { timeout: TIMEOUT.actionButton }).should('be.visible');
      } else {
        cy.get(cartSelectors.cartEmpty).should('be.visible');
      }
    });
  });

  it('Test: 04 - Remove Item from Cart', () => {
    cy.visit(getEnv('url') + cartData.cartUrl, { failOnStatusCode: false });
    cy.waitForSpinnerToDisappear();
    cy.get('body').then(($body) => {
      if ($body.find(cartSelectors.cartPageRows).length > 0) {
        cy.get(cartSelectors.removeItemCheckbox).first().check({ force: true });
        cy.get(cartSelectors.updateCartButton).click({ force: true });
        cy.wait(WAIT.long);
      } else {
        cy.log('Cart is empty — remove item step skipped');
      }
    });
  });

  it('Test: 05 - Proceed to Checkout from Cart', () => {
    cy.visit(getEnv('url') + cartData.moduleUrl, { failOnStatusCode: false });
    cy.waitForSpinnerToDisappear();
    cy.get(cartSelectors.productTitle, { timeout: TIMEOUT.actionButton }).first().click();
    cy.get(cartSelectors.addToCartButton, { timeout: TIMEOUT.actionButton }).should('be.visible').click();
    cy.wait(WAIT.long);
    cy.visit(getEnv('url') + cartData.cartUrl, { failOnStatusCode: false });
    cy.get('body').then(($body) => {
      if ($body.find('#termsofservice').length > 0) {
        cy.get('#termsofservice').check({ force: true });
        cy.wait(300);
      }
    });
    cy.get(cartSelectors.checkoutButton, { timeout: TIMEOUT.actionButton }).click();
    cy.url().should('include', 'checkout');
  });

});
