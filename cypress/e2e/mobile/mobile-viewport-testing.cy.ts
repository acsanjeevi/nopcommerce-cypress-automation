import { TIMEOUT, WAIT, getEnv } from '../../support/constants';
import sel from '../../fixtures/mobile/mobile-selectors.json';
import data from '../../fixtures/mobile/mobile-test-data.json';
import cartSelectors from '../../fixtures/cart/cart-selectors.json';

const IPHONE = data.viewports.iphone;
const IPAD   = data.viewports.ipad;

describe('Mobile Viewport Testing', () => {

  before(() => { cy.loginAsCustomer(); });

  afterEach(() => { cy.wait(WAIT.medium); });

  // ─── iPhone (375 × 812) ──────────────────────────────────────────

  it('Test: 01 - Verify Homepage Responsive Layout at iPhone', { tags: 'prod' }, () => {
    cy.viewport(IPHONE.width, IPHONE.height);
    cy.visit(getEnv('url') + data.homeUrl, { failOnStatusCode: false });
    cy.waitForSpinnerToDisappear();
    cy.get(sel.headerLogo, { timeout: TIMEOUT.pageLoad }).should('be.visible');
    cy.get(sel.searchBox, { timeout: TIMEOUT.actionButton }).should('exist');
    cy.get(sel.footerBlock, { timeout: TIMEOUT.actionButton }).scrollIntoView().should('be.visible');
    cy.window().then((win) => {
      expect(win.innerWidth).to.equal(IPHONE.width);
    });
  });

  it('Test: 02 - Browse Products at iPhone Viewport', { tags: 'prod' }, () => {
    cy.viewport(IPHONE.width, IPHONE.height);
    cy.visit(getEnv('url') + data.notebooksUrl, { failOnStatusCode: false });
    cy.waitForSpinnerToDisappear();
    cy.get(sel.productItem, { timeout: TIMEOUT.tableData }).should('have.length.greaterThan', 0);
    cy.get(sel.productTitle, { timeout: TIMEOUT.actionButton }).first().then(($link) => {
      const productName = $link.text().trim();
      cy.wrap($link).click();
      cy.get(sel.productDetailName, { timeout: TIMEOUT.actionButton }).should('be.visible');
      cy.get(sel.productDetailPrice, { timeout: TIMEOUT.actionButton }).should('be.visible');
      cy.get(sel.addToCartButton, { timeout: TIMEOUT.actionButton }).scrollIntoView().should('be.visible');
    });
  });

  it('Test: 03 - Add to Cart and Verify at iPhone Viewport', { tags: 'prod' }, () => {
    cy.viewport(IPHONE.width, IPHONE.height);
    cy.visit(getEnv('url') + data.notebooksUrl, { failOnStatusCode: false });
    cy.waitForSpinnerToDisappear();
    cy.get(sel.productTitle, { timeout: TIMEOUT.actionButton }).first().click();
    cy.get(sel.addToCartButton, { timeout: TIMEOUT.actionButton }).scrollIntoView().should('be.visible').click();
    cy.wait(WAIT.long);
    cy.visit(getEnv('url') + data.cartUrl, { failOnStatusCode: false });
    cy.waitForSpinnerToDisappear();
    cy.get(sel.cartPageRows, { timeout: TIMEOUT.actionButton }).should('have.length.greaterThan', 0);
    cy.get(sel.cartItemName, { timeout: TIMEOUT.actionButton }).first().scrollIntoView().should('be.visible');
    cy.get(sel.cartItemQty, { timeout: TIMEOUT.actionButton }).first().should('exist');
    cy.get(sel.removeItemCheckbox).first().check({ force: true });
    cy.get(sel.updateCartButton).click({ force: true });
    cy.wait(WAIT.long);
  });

  it('Test: 04 - Proceed to Checkout at iPhone Viewport', () => {
    cy.viewport(IPHONE.width, IPHONE.height);
    cy.visit(getEnv('url') + data.notebooksUrl, { failOnStatusCode: false });
    cy.waitForSpinnerToDisappear();
    cy.get(sel.productTitle, { timeout: TIMEOUT.actionButton }).first().click();
    cy.get(sel.addToCartButton, { timeout: TIMEOUT.actionButton }).scrollIntoView().should('be.visible').click();
    cy.wait(WAIT.long);
    cy.visit(getEnv('url') + data.cartUrl, { failOnStatusCode: false });
    cy.waitForSpinnerToDisappear();
    cy.get('body').then(($body) => {
      if ($body.find(sel.termsCheckbox).length > 0) {
        cy.get(sel.termsCheckbox).check({ force: true });
        cy.wait(300);
      }
    });
    cy.get(sel.checkoutButton, { timeout: TIMEOUT.actionButton }).scrollIntoView().click();
    cy.url().should('include', 'checkout');
    cy.visit(getEnv('url') + data.cartUrl, { failOnStatusCode: false });
    cy.waitForSpinnerToDisappear();
    cy.get('body').then(($body) => {
      if ($body.find(sel.removeItemCheckbox).length > 0) {
        cy.get(sel.removeItemCheckbox).first().check({ force: true });
        cy.get(sel.updateCartButton).click({ force: true });
        cy.wait(WAIT.long);
      }
    });
  });

  // ─── iPad (768 × 1024) ───────────────────────────────────────────

  it('Test: 05 - Verify Homepage Responsive Layout at iPad', { tags: 'prod' }, () => {
    cy.viewport(IPAD.width, IPAD.height);
    cy.visit(getEnv('url') + data.homeUrl, { failOnStatusCode: false });
    cy.waitForSpinnerToDisappear();
    cy.get(sel.headerLogo, { timeout: TIMEOUT.pageLoad }).should('be.visible');
    cy.get(sel.searchBox, { timeout: TIMEOUT.actionButton }).should('exist');
    cy.get(sel.footerBlock, { timeout: TIMEOUT.actionButton }).scrollIntoView().should('be.visible');
    cy.window().then((win) => {
      expect(win.innerWidth).to.equal(IPAD.width);
    });
  });

  it('Test: 06 - Browse Products at iPad Viewport', { tags: 'prod' }, () => {
    cy.viewport(IPAD.width, IPAD.height);
    cy.visit(getEnv('url') + data.notebooksUrl, { failOnStatusCode: false });
    cy.waitForSpinnerToDisappear();
    cy.get(sel.productItem, { timeout: TIMEOUT.tableData }).should('have.length.greaterThan', 0);
    cy.get(sel.productTitle, { timeout: TIMEOUT.actionButton }).first().then(($link) => {
      cy.wrap($link).click();
      cy.get(sel.productDetailName, { timeout: TIMEOUT.actionButton }).should('be.visible');
      cy.get(sel.productDetailPrice, { timeout: TIMEOUT.actionButton }).should('be.visible');
      cy.get(sel.addToCartButton, { timeout: TIMEOUT.actionButton }).should('be.visible');
    });
  });

  it('Test: 07 - Add to Cart and Verify at iPad Viewport', { tags: 'prod' }, () => {
    cy.viewport(IPAD.width, IPAD.height);
    cy.visit(getEnv('url') + data.notebooksUrl, { failOnStatusCode: false });
    cy.waitForSpinnerToDisappear();
    cy.get(sel.productTitle, { timeout: TIMEOUT.actionButton }).first().click();
    cy.get(sel.addToCartButton, { timeout: TIMEOUT.actionButton }).should('be.visible').click();
    cy.wait(WAIT.long);
    cy.visit(getEnv('url') + data.cartUrl, { failOnStatusCode: false });
    cy.waitForSpinnerToDisappear();
    cy.get(sel.cartPageRows, { timeout: TIMEOUT.actionButton }).should('have.length.greaterThan', 0);
    cy.get(sel.cartItemName, { timeout: TIMEOUT.actionButton }).first().should('be.visible');
    cy.get(sel.cartItemQty, { timeout: TIMEOUT.actionButton }).first().should('exist');
    cy.get(sel.checkoutButton, { timeout: TIMEOUT.actionButton }).should('be.visible');
    cy.get(sel.removeItemCheckbox).first().check({ force: true });
    cy.get(sel.updateCartButton).click({ force: true });
    cy.wait(WAIT.long);
  });

});
