import { CommonPage } from '../page-objects/common-page';
import { TIMEOUT } from '../support/constants';
import productsSelectors from '../fixtures/products/products-selectors.json';
import productsData from '../fixtures/products/products-test-data.json';

import type { ProductRecord } from '../support/index.d';

Cypress.Commands.add('loadProductsOverview', () => {
  cy.intercept('POST', productsData.listApi).as('productsListAlias');
  cy.visit(Cypress.env('adminUrl') as string + productsData.moduleUrl);
  cy.wait('@productsListAlias', { timeout: TIMEOUT.listLoad });
  cy.waitForSpinnerToDisappear();
});

Cypress.Commands.add('clickOnAddProducts', () => {
  cy.get(productsSelectors.addButton, { timeout: TIMEOUT.actionButton }).should('be.visible').click();
  cy.url().should('include', '/Product/Create');
});

Cypress.Commands.add('createProducts', (data: ProductRecord) => {
  CommonPage.enterText(productsSelectors.productNameInput, data.productName);
  CommonPage.enterText(productsSelectors.skuInput, data.sku);
  CommonPage.enterText(productsSelectors.priceInput, data.price);
  cy.get(productsSelectors.createButton).click();
  cy.waitForSpinnerToDisappear();
});

Cypress.Commands.add('editProducts', (recordName: string) => {
  cy.intercept('POST', productsData.listApi).as('productsSearchAlias');
  cy.get(productsSelectors.searchInput).clear().type(recordName);
  cy.get(productsSelectors.searchButton).click();
  cy.wait('@productsSearchAlias', { timeout: TIMEOUT.searchResult });
  cy.waitForSpinnerToDisappear();
  cy.get(productsSelectors.tableRows, { timeout: TIMEOUT.actionButton }).first().within(() => {
    cy.get(productsSelectors.editOption).click();
  });
  cy.url().should('include', '/Product/Edit/');
});

Cypress.Commands.add('validateProductsContextMenu', () => {
  cy.get(productsSelectors.tableRows).first().within(() => {
    cy.get(productsSelectors.editOption).should('be.visible');
  });
});
