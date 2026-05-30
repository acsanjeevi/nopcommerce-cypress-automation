import { CommonPage } from '../page-objects/common-page';
import { TIMEOUT } from '../support/constants';
import usersSelectors from '../fixtures/users/users-selectors.json';
import usersData from '../fixtures/users/users-test-data.json';

import type { UserRecord } from '../support/index.d';

Cypress.Commands.add('loadUsersOverview', () => {
  cy.intercept('POST', usersData.listApi).as('usersListAlias');
  cy.visit(Cypress.env('adminUrl') as string + usersData.moduleUrl);
  cy.wait('@usersListAlias', { timeout: TIMEOUT.listLoad });
  cy.waitForSpinnerToDisappear();
});

Cypress.Commands.add('clickOnAddUsers', () => {
  cy.get(usersSelectors.addButton, { timeout: TIMEOUT.actionButton }).should('be.visible').click();
  cy.url().should('include', '/Customer/Create');
});

Cypress.Commands.add('createUsers', (data: UserRecord) => {
  CommonPage.enterText(usersSelectors.emailInput, data.email);
  CommonPage.enterText(usersSelectors.passwordInput, data.password);
  CommonPage.enterText(usersSelectors.firstNameInput, data.firstName);
  CommonPage.enterText(usersSelectors.lastNameInput, data.lastName);
  cy.get(usersSelectors.createButton).click();
  cy.waitForSpinnerToDisappear();
});

Cypress.Commands.add('editUsers', (recordName: string) => {
  cy.intercept('POST', usersData.listApi).as('usersSearchAlias');
  cy.get(usersSelectors.searchEmailInput).clear().type(recordName);
  cy.get(usersSelectors.searchButton).click();
  cy.wait('@usersSearchAlias', { timeout: TIMEOUT.searchResult });
  cy.waitForSpinnerToDisappear();
  cy.get(usersSelectors.tableRows, { timeout: TIMEOUT.actionButton }).first().within(() => {
    cy.get(usersSelectors.editOption).click();
  });
  cy.url().should('include', '/Customer/Edit/');
});

Cypress.Commands.add('validateUsersContextMenu', () => {
  cy.get(usersSelectors.tableRows).first().within(() => {
    cy.get(usersSelectors.editOption).should('be.visible');
  });
});
