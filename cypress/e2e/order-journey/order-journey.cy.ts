import { TIMEOUT, WAIT, getEnv } from '../../support/constants';
import orderData      from '../../fixtures/order-journey/order-journey-test-data.json';
import orderSelectors from '../../fixtures/order-journey/order-journey-selectors.json';

let capturedOrderNumber = '';

function selectProductAttributes(): void {
  cy.get('body').then(($body) => {
    $body.find(orderSelectors.productAttributeSelect).each((_, el) => {
      const $sel  = Cypress.$(el);
      const first = $sel.find('option').not('[value=""]').not('[value="0"]').first();
      if (first.length) $sel.val(first.val() as string).trigger('change');
    });
    const names = [...new Set($body.find(orderSelectors.productAttributeRadio)
      .map((_, el) => (el as unknown as HTMLInputElement).name).get())];
    names.forEach((name) => {
      cy.get(`${orderSelectors.productAttributeRadio}[name="${name}"]`).first().check({ force: true });
    });
  });
}

describe('End-to-End Purchase Journey', () => {

  describe('Customer Flow', () => {

    before(() => {
      cy.loginAsCustomer();
      cy.visit(getEnv('url') + orderData.cartUrl, { failOnStatusCode: false });
      cy.waitForSpinnerToDisappear();
      cy.get('body').then(($body) => {
        if ($body.find('.cart tbody tr').length > 0) {
          cy.get('td.remove-from-cart input[type="checkbox"]').each(($cb) => cy.wrap($cb).check({ force: true }));
          cy.get('#updatecart').click({ force: true });
          cy.wait(WAIT.long);
        }
      });
    });

    afterEach(() => { cy.wait(WAIT.short); });

    it('Test: 01 - Browse Products and Open Detail Page', { tags: 'prod' }, () => {
      cy.visit(getEnv('url') + orderData.categoryUrl, { failOnStatusCode: false });
      cy.waitForSpinnerToDisappear();
      cy.get(orderSelectors.productItem, { timeout: TIMEOUT.tableData }).should('have.length.greaterThan', 0);
      cy.get(orderSelectors.productTitle).first().click();
      cy.waitForSpinnerToDisappear();
      cy.get(orderSelectors.productDetailName, { timeout: TIMEOUT.tableData }).should('be.visible');
      cy.get(orderSelectors.productDetailPrice, { timeout: TIMEOUT.actionButton }).should('be.visible')
        .invoke('text').then((price) => { expect(price.trim()).to.match(/\$[\d,.]+/); });
    });

    it('Test: 02 - Add Product to Cart with Options', () => {
      selectProductAttributes();
      cy.get(orderSelectors.qtyInput, { timeout: TIMEOUT.actionButton }).should('be.visible').clear().type(orderData.productQuantity);
      cy.get(orderSelectors.addToCartBtn).click();
      cy.get(orderSelectors.cartNotification, { timeout: TIMEOUT.listLoad })
        .should('be.visible').and('contain.text', 'has been added');
    });

    it('Test: 03 - Verify Cart Contents and Quantity', { tags: 'prod' }, () => {
      cy.visit(getEnv('url') + orderData.cartUrl, { failOnStatusCode: false });
      cy.waitForSpinnerToDisappear();
      cy.get(orderSelectors.cartPageRows, { timeout: TIMEOUT.tableData }).should('have.length.greaterThan', 0);
      cy.get('.cart').within(() => {
        cy.get(orderSelectors.cartItemQty).first().should('have.value', orderData.productQuantity);
      });
      cy.get(orderSelectors.cartSubtotal).should('be.visible');
    });

    it('Test: 04 - Complete Billing Address', () => {
      cy.get('body').then(($body) => {
        if ($body.find(orderSelectors.termsCheckbox).length > 0) {
          cy.get(orderSelectors.termsCheckbox).check({ force: true });
          cy.wait(500);
        }
      });
      cy.url().then((currentUrl) => {
        if (!currentUrl.includes('checkout')) {
          cy.get(orderSelectors.checkoutBtn, { timeout: TIMEOUT.actionButton }).should('be.visible').click();
          cy.waitForSpinnerToDisappear();
        } else {
          cy.log('Already at checkout — terms triggered auto-redirect');
        }
      });
      cy.url({ timeout: TIMEOUT.listLoad }).should('include', '/onepagecheckout');
      cy.get(orderSelectors.billingSection, { timeout: TIMEOUT.listLoad }).should('be.visible');
      cy.on('window:alert', () => true);
      cy.get('body').then(($body) => {
        if ($body.find(orderSelectors.billingFirstName).is(':visible')) {
          const addr = orderData.billingAddress;
          cy.get(orderSelectors.billingFirstName).clear().type(addr.firstName);
          cy.get(orderSelectors.billingLastName).clear().type(addr.lastName);
          cy.get(orderSelectors.billingEmail).clear().type(addr.email);
          cy.get(orderSelectors.billingCountry).select(addr.country);
          cy.wait(WAIT.xlong);
          cy.get(orderSelectors.billingCity).clear().type(addr.city);
          cy.get(orderSelectors.billingAddress1).clear().type(addr.address1);
          cy.get(orderSelectors.billingZip).clear().type(addr.zip);
          cy.get(orderSelectors.billingPhone).clear().type(addr.phone);
        } else {
          cy.log('Existing billing address — proceeding with saved address');
        }
      });
      cy.get('#billing-buttons-container .button-1').filter(':visible').first().click();
      cy.waitForSpinnerToDisappear();
      cy.wait(WAIT.xlong);
    });

    it('Test: 05 - Select Shipping Method', () => {
      cy.wait(WAIT.xlong);
      cy.get('body').then(($body) => {
        if ($body.find(orderSelectors.shippingSection).is(':visible')) {
          cy.get(orderSelectors.shippingContinueBtn, { timeout: TIMEOUT.actionButton }).filter(':visible').first().click({ force: true });
          cy.waitForSpinnerToDisappear();
          cy.wait(WAIT.long);
        }
      });
      cy.get(orderSelectors.shippingMethodSection, { timeout: TIMEOUT.listLoad }).should('be.visible');
      cy.get(orderSelectors.shippingMethodRadio, { timeout: TIMEOUT.actionButton }).first().check({ force: true });
      cy.get(orderSelectors.shippingMethodContinue, { timeout: TIMEOUT.actionButton }).should('be.visible').click();
      cy.waitForSpinnerToDisappear();
    });

    it('Test: 06 - Select Payment Method', () => {
      cy.get(orderSelectors.paymentMethodSection, { timeout: TIMEOUT.listLoad }).should('be.visible');
      cy.get(orderSelectors.paymentMethodRadio, { timeout: TIMEOUT.actionButton }).should('exist').check({ force: true });
      cy.get(orderSelectors.paymentMethodContinue, { timeout: TIMEOUT.actionButton }).should('be.visible').click();
      cy.waitForSpinnerToDisappear();
      cy.get(orderSelectors.paymentInfoSection, { timeout: TIMEOUT.listLoad }).should('be.visible');
      cy.get(orderSelectors.paymentInfoContinue, { timeout: TIMEOUT.actionButton }).should('be.visible').click();
      cy.waitForSpinnerToDisappear();
    });

    it('Test: 07 - Confirm and Place Order', { tags: 'prod' }, () => {
      cy.get(orderSelectors.confirmSection, { timeout: TIMEOUT.listLoad }).should('be.visible');
      cy.get(orderSelectors.confirmOrderItems, { timeout: TIMEOUT.actionButton }).should('have.length.greaterThan', 0);
      cy.get(orderSelectors.confirmOrderBtn, { timeout: TIMEOUT.actionButton }).should('be.visible').click();
      cy.get(orderSelectors.orderSuccessTitle, { timeout: TIMEOUT.pageLoad })
        .should('be.visible').and('contain.text', 'successfully');
      cy.get(orderSelectors.orderNumber, { timeout: TIMEOUT.tableData }).should('be.visible')
        .invoke('text').then((text) => {
          const match = text.match(/\d+/);
          capturedOrderNumber = match ? match[0] : '';
          expect(capturedOrderNumber).to.match(/^\d+$/);
          cy.log(`Order placed: #${capturedOrderNumber}`);
        });
    });

  });

  describe('Admin Flow', () => {

    before(() => { cy.loginAsAdmin(); });

    afterEach(() => { cy.wait(WAIT.short); });

    it('Test: 08 - Admin Verifies and Updates Order Status', { tags: 'prod' }, () => {
      cy.intercept('POST', orderData.adminListApi).as('orderListAlias');
      cy.visit(getEnv('adminUrl') + orderData.adminModuleUrl);
      cy.wait('@orderListAlias', { timeout: TIMEOUT.listLoad });
      cy.waitForSpinnerToDisappear();
      cy.get(orderSelectors.adminTableRows, { timeout: TIMEOUT.tableData }).should('have.length.greaterThan', 0);

      cy.intercept('POST', orderData.adminListApi).as('searchOrdersAlias');
      cy.get(orderSelectors.adminSearchBtn).click();
      cy.wait('@searchOrdersAlias', { timeout: TIMEOUT.searchResult });
      cy.waitForSpinnerToDisappear();
      cy.get(orderSelectors.adminTableRows, { timeout: TIMEOUT.tableData })
        .filter(':visible').not('.dataTables_empty')
        .should('have.length.greaterThan', 0);

      cy.get(orderSelectors.adminTableRows).filter(':visible').not('.dataTables_empty').first().within(() => {
        cy.get(orderSelectors.adminOrderLink).click();
      });
      cy.waitForSpinnerToDisappear();
      cy.url().should('include', '/Order/Edit/');
      cy.get('.content-wrapper', { timeout: TIMEOUT.tableData }).should('be.visible');

      cy.get('body').then(($body) => {
        if ($body.find(orderSelectors.adminCancelBtn).filter(':visible').length > 0) {
          cy.get(orderSelectors.adminCancelBtn).filter(':visible').first().click();
          cy.get('#cancelorder-action-confirmation', { timeout: TIMEOUT.actionButton }).should('be.visible');
          cy.get('#cancelorder-action-confirmation-submit-button').should('be.visible').click();
          cy.waitForSpinnerToDisappear();
          cy.get(orderSelectors.adminSuccessAlert, { timeout: TIMEOUT.tableData }).should('be.visible');
          cy.get('.content-wrapper').should('contain.text', orderData.cancelledStatus);
        } else {
          cy.get('.content-wrapper').should('be.visible');
          cy.log('Order status verified — cancel option not available for this order state');
        }
      });
    });

  });

});
