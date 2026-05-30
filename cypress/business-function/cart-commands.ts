import { TIMEOUT, WAIT } from '../support/constants';
import cartSelectors from '../fixtures/cart/cart-selectors.json';
import cartData from '../fixtures/cart/cart-test-data.json';

import type { CheckoutData } from '../support/index.d';

Cypress.Commands.add('loadProductsPage', () => {
  cy.visit(Cypress.env('url') as string + cartData.moduleUrl, { failOnStatusCode: false });
  cy.waitForSpinnerToDisappear();
});

Cypress.Commands.add('loadCartPage', () => {
  cy.visit(Cypress.env('url') as string + cartData.cartUrl, { failOnStatusCode: false });
  cy.waitForSpinnerToDisappear();
});

Cypress.Commands.add('addProductToCart', (productName: string) => {
  cy.contains(cartSelectors.productTitle, productName, { timeout: TIMEOUT.tableData }).click();
  cy.waitForSpinnerToDisappear();

  cy.get('body').then(($body) => {
    $body.find('.attributes select').each((_, el) => {
      const $sel  = Cypress.$(el);
      const first = $sel.find('option').not('[value=""]').not('[value="0"]').first();
      if (first.length) $sel.val(first.val() as string).trigger('change');
    });

    const radioNames = [
      ...new Set(
        $body
          .find('.attributes input[type="radio"]')
          .map((_, el) => (el as HTMLInputElement).name)
          .get()
      ),
    ];
    radioNames.forEach((name) => {
      cy.get(`.attributes input[type="radio"][name="${name}"]`).first().check({ force: true });
    });
  });

  cy.get(cartSelectors.addToCartButton, { timeout: TIMEOUT.actionButton }).should('be.visible').click();
  cy.wait(WAIT.long);
});

Cypress.Commands.add('removeCartItem', (productName: string) => {
  cy.contains(cartSelectors.cartItemName, productName, { timeout: TIMEOUT.actionButton })
    .closest('tr')
    .within(() => {
      cy.get(cartSelectors.removeItemCheckbox).check();
    });
  cy.get(cartSelectors.updateCartButton).click();
  cy.wait(WAIT.long);
});

Cypress.Commands.add('applyCouponCode', (_couponCode: string) => {
  cy.log('Coupon functionality not implemented in this nopCommerce demo build');
});

Cypress.Commands.add('proceedToCheckout', (_checkoutData: CheckoutData) => {
  const customerEmail = Cypress.env('customerEmail') as string || 'test@test.com';

  cy.get('body').then(($body) => {
    if ($body.find('#termsofservice').length > 0) {
      cy.get('#termsofservice').check({ force: true });
      cy.wait(300);
    }
  });

  cy.get(cartSelectors.checkoutButton, { timeout: TIMEOUT.actionButton }).should('be.visible').click();
  cy.url({ timeout: TIMEOUT.tableData }).should('include', 'checkout');
  cy.wait(WAIT.medium);

  cy.get('#checkout-step-billing', { timeout: TIMEOUT.listLoad }).should('be.visible');
  cy.on('window:alert', () => true);

  cy.get('body').then(($body) => {
    const hasNewForm = $body.find('#BillingNewAddress_FirstName').is(':visible');
    if (hasNewForm) {
      cy.log('New billing address form — filling details');
      cy.get('#BillingNewAddress_FirstName').clear().type('Test');
      cy.get('#BillingNewAddress_LastName').clear().type('Buyer');
      cy.get('#BillingNewAddress_Email').clear().type(customerEmail);
      cy.get('#BillingNewAddress_CountryId').select('United States of America');
      cy.wait(WAIT.xlong);
      cy.get('#BillingNewAddress_StateProvinceId option')
        .not('[value="0"]').not('[value=""]')
        .should('have.length.greaterThan', 0).first()
        .then(($opt) => { cy.get('#BillingNewAddress_StateProvinceId').select($opt.val() as string); });
      cy.get('#BillingNewAddress_City').clear().type('Los Angeles');
      cy.get('#BillingNewAddress_Address1').clear().type('123 Test Street');
      cy.get('#BillingNewAddress_ZipPostalCode').clear().type('90001');
      cy.get('#BillingNewAddress_PhoneNumber').clear().type('3105551234');
    } else {
      cy.log('Existing billing address detected — proceeding with saved address');
    }
  });

  cy.get('#billing-buttons-container .button-1').filter(':visible').first().click();
  cy.waitForSpinnerToDisappear();
  cy.wait(WAIT.xlong);

  cy.get('body').then(($body) => {
    if ($body.find('#checkout-step-shipping').is(':visible')) {
      cy.get('#shipping-buttons-container .button-1', { timeout: TIMEOUT.actionButton })
        .should('be.visible')
        .click();
      cy.waitForSpinnerToDisappear();
      cy.wait(WAIT.short);
    }
  });

  cy.get('#checkout-step-shipping-method', { timeout: TIMEOUT.listLoad }).should('be.visible');
  cy.get('input[name="shippingoption"]', { timeout: TIMEOUT.actionButton }).first().check({ force: true });
  cy.get('#shipping-method-buttons-container .button-1', { timeout: TIMEOUT.actionButton })
    .should('be.visible')
    .click();
  cy.waitForSpinnerToDisappear();
  cy.wait(WAIT.medium);

  cy.get('#checkout-step-payment-method', { timeout: TIMEOUT.listLoad }).should('be.visible');
  cy.get('body').then(($body) => {
    const paymentSelector = $body.find('input[value="Payments.CheckMoneyOrder"]').length > 0
      ? 'input[value="Payments.CheckMoneyOrder"]'
      : 'input[name="paymentmethod"]';
    cy.get(paymentSelector).first().check({ force: true });
  });
  cy.get('#payment-method-buttons-container .button-1', { timeout: TIMEOUT.actionButton })
    .should('be.visible')
    .click();
  cy.waitForSpinnerToDisappear();
  cy.wait(WAIT.medium);

  cy.get('#checkout-step-payment-info', { timeout: TIMEOUT.listLoad }).should('be.visible');
  cy.get('#payment-info-buttons-container .button-1', { timeout: TIMEOUT.actionButton })
    .should('be.visible')
    .click();
  cy.waitForSpinnerToDisappear();
  cy.wait(WAIT.medium);

  cy.get('#checkout-step-confirm-order', { timeout: TIMEOUT.listLoad }).should('be.visible');
  cy.get('#confirm-order-buttons-container .button-1', { timeout: TIMEOUT.actionButton })
    .should('be.visible')
    .click();
  cy.waitForSpinnerToDisappear();
  cy.wait(WAIT.long);

  cy.url({ timeout: TIMEOUT.listLoad }).should('include', '/checkout/completed');
  cy.log('Order placed successfully via storefront checkout');
});
