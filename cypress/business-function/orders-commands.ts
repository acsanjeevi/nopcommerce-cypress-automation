import { TIMEOUT } from '../support/constants';
import ordersSelectors from '../fixtures/orders/orders-selectors.json';
import ordersData from '../fixtures/orders/orders-test-data.json';

import type { OrderRecord } from '../support/index.d';

Cypress.Commands.add('loadOrdersOverview', () => {
  cy.intercept('POST', ordersData.listApi).as('ordersListAlias');
  cy.visit(Cypress.env('adminUrl') as string + ordersData.moduleUrl);
  cy.wait('@ordersListAlias', { timeout: TIMEOUT.listLoad });
  cy.waitForSpinnerToDisappear();
});

Cypress.Commands.add('clickOnAddOrders', () => {
  cy.url().then((url) => {
    cy.log(`Orders are created via storefront checkout — admin URL: ${url}`);
  });
});

Cypress.Commands.add('createOrders', (_data: OrderRecord) => {
  cy.log('Orders are created via storefront checkout — not via admin panel directly');
});

Cypress.Commands.add('editOrders', (searchText: string) => {
  cy.intercept('POST', ordersData.listApi).as('ordersSearchAlias');
  cy.get(ordersSelectors.searchEmailInput).clear().type(searchText);
  cy.get(ordersSelectors.searchButton).click();
  cy.wait('@ordersSearchAlias', { timeout: TIMEOUT.searchResult });
  cy.waitForSpinnerToDisappear();
  cy.get(ordersSelectors.tableRows, { timeout: TIMEOUT.actionButton }).first().within(() => {
    cy.get(ordersSelectors.editOption).click();
  });
  cy.url().should('include', '/Order/Edit/');
});

Cypress.Commands.add('validateOrdersContextMenu', () => {
  cy.get(ordersSelectors.tableRows).first().within(() => {
    cy.get(ordersSelectors.editOption).should('be.visible');
  });
});
