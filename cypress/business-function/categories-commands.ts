import { CommonPage } from '../page-objects/common-page';
import { TIMEOUT } from '../support/constants';
import categoriesSelectors from '../fixtures/categories/categories-selectors.json';
import categoriesData from '../fixtures/categories/categories-test-data.json';

import type { CategoryRecord } from '../support/index.d';

Cypress.Commands.add('loadCategoriesOverview', () => {
  cy.intercept('POST', categoriesData.listApi).as('categoriesListAlias');
  cy.visit(Cypress.env('adminUrl') as string + categoriesData.moduleUrl);
  cy.wait('@categoriesListAlias', { timeout: TIMEOUT.listLoad });
  cy.waitForSpinnerToDisappear();
});

Cypress.Commands.add('clickOnAddCategories', () => {
  cy.get(categoriesSelectors.addButton, { timeout: TIMEOUT.actionButton }).should('be.visible').click();
  cy.url().should('include', '/Category/Create');
});

Cypress.Commands.add('createCategories', (data: CategoryRecord) => {
  CommonPage.enterText(categoriesSelectors.categoryNameInput, data.categoryName);
  cy.get(categoriesSelectors.createButton).click();
  cy.waitForSpinnerToDisappear();
});

Cypress.Commands.add('editCategories', (recordName: string) => {
  cy.intercept('POST', categoriesData.listApi).as('categoriesSearchAlias');
  cy.get(categoriesSelectors.searchInput).clear().type(recordName);
  cy.get(categoriesSelectors.searchButton).click();
  cy.wait('@categoriesSearchAlias', { timeout: TIMEOUT.searchResult });
  cy.waitForSpinnerToDisappear();
  cy.get(categoriesSelectors.tableRows, { timeout: TIMEOUT.actionButton }).first().within(() => {
    cy.get(categoriesSelectors.editOption).click();
  });
  cy.url().should('include', '/Category/Edit/');
});

Cypress.Commands.add('validateCategoriesContextMenu', () => {
  cy.get(categoriesSelectors.tableRows).first().within(() => {
    cy.get(categoriesSelectors.editOption).should('be.visible');
  });
});
