import { TIMEOUT, WAIT, getEnv } from '../../support/constants';
import { CommonPage } from '../../page-objects/common-page';
import usersData from '../../fixtures/users/users-test-data.json';
import usersSelectors from '../../fixtures/users/users-selectors.json';

describe('Customer Admin', () => {

  before(() => {
    cy.loginAsAdmin();
    cy.intercept('POST', usersData.listApi).as('cleanupList');
    cy.visit(getEnv('adminUrl') + usersData.moduleUrl);
    cy.wait('@cleanupList', { timeout: TIMEOUT.listLoad });
    cy.waitForSpinnerToDisappear();
    cy.get(usersSelectors.searchEmailInput).clear().type(usersData.validInputs.email);
    cy.get(usersSelectors.searchButton).click();
    cy.wait(WAIT.long);
    cy.get('body').then(($body) => {
      const noData = $body.text().includes('No data available in table');
      const hasRows = $body.find(usersSelectors.tableRows).filter(':visible').not('.dataTables_empty').length > 0;
      if (!noData && hasRows) {
        cy.on('window:confirm', () => true);
        cy.get(usersSelectors.tableRows).filter(':visible').not('.dataTables_empty').first().within(() => {
          cy.get(usersSelectors.editOption).click();
        });
        cy.waitForSpinnerToDisappear();
        cy.url().should('include', '/Customer/Edit/');
        cy.get(usersSelectors.deleteOption, { timeout: TIMEOUT.actionButton })
          .first()
          .scrollIntoView()
          .click({ force: true });
        cy.wait(500);
        cy.get(usersSelectors.deleteConfirmButton, { timeout: TIMEOUT.shortAction }).should('be.visible').click();
        cy.wait(WAIT.long);
      }
    });
  });

  beforeEach(() => {
    cy.intercept('POST', usersData.listApi).as('getCustomersList');
    cy.visit(getEnv('adminUrl') + usersData.moduleUrl);
    cy.wait('@getCustomersList', { timeout: TIMEOUT.listLoad });
    cy.waitForSpinnerToDisappear();
    cy.wait(WAIT.medium);
  });

  afterEach(() => { cy.wait(WAIT.medium); });

  it('Test: 01 - View Customer List', { tags: 'prod' }, () => {
    cy.get(usersSelectors.tableBody, { timeout: TIMEOUT.tableData }).should('be.visible');
    cy.get(usersSelectors.tableRows).should('have.length.greaterThan', 0);
    cy.url().should('include', usersData.moduleUrl);
  });

  it('Test: 02 - Search Customer by Email', { tags: 'prod' }, () => {
    cy.intercept('POST', usersData.listApi).as('searchAlias');
    cy.get(usersSelectors.searchEmailInput).clear().type(usersData.searchEmail);
    cy.get(usersSelectors.searchButton).click();
    cy.wait('@searchAlias', { timeout: TIMEOUT.searchResult });
    cy.waitForSpinnerToDisappear();
    cy.get(usersSelectors.tableRows, { timeout: TIMEOUT.actionButton })
      .should('have.length.greaterThan', 0).first().should('contain.text', usersData.searchEmail);
  });

  it('Test: 03 - Navigate to Add Customer Form', () => {
    cy.get(usersSelectors.addButton, { timeout: TIMEOUT.actionButton }).should('be.visible').click();
    cy.url().should('include', usersData.addUrl);
  });

  it('Test: 04 - Create Customer and Verify Success', { tags: 'prod' }, () => {
    cy.visit(getEnv('adminUrl') + usersData.addUrl);
    cy.wait(WAIT.long);
    CommonPage.enterText(usersSelectors.emailInput, usersData.validInputs.email);
    CommonPage.enterText(usersSelectors.passwordInput, usersData.validInputs.password);
    CommonPage.enterText(usersSelectors.firstNameInput, usersData.validInputs.firstName);
    CommonPage.enterText(usersSelectors.lastNameInput, usersData.validInputs.lastName);
    cy.get(usersSelectors.createButton).click();
    cy.get('body', { timeout: TIMEOUT.successToast }).then(($body) => {
      if (!$body.text().includes('already registered')) {
        cy.url().should('include', '/Customer/Edit/');
      } else {
        cy.log('Customer already exists — duplicate email test will use this');
      }
    });
  });

  it('Test: 05 - Edit Customer and Verify Update', () => {
    cy.intercept('POST', usersData.listApi).as('editAlias');
    cy.get(usersSelectors.searchEmailInput).clear().type(usersData.validInputs.email);
    cy.get(usersSelectors.searchButton).click();
    cy.wait('@editAlias', { timeout: TIMEOUT.searchResult });
    cy.waitForSpinnerToDisappear();
    cy.get(usersSelectors.tableRows, { timeout: TIMEOUT.actionButton }).filter(':visible').first().within(() => {
      cy.get(usersSelectors.editOption).click();
    });
    cy.url().should('include', '/Customer/Edit/');
    cy.wait(WAIT.long);
    CommonPage.enterText(usersSelectors.lastNameInput, usersData.updatedInputs.lastName);
    cy.get(usersSelectors.updateButton).click();
    cy.wait(WAIT.long);
    cy.get(usersSelectors.toastSuccess, { timeout: TIMEOUT.successToast })
      .should('be.visible').and('contain.text', 'successfully');
  });

  it('Test: 06 - Validate Invalid Email Format', () => {
    cy.visit(getEnv('adminUrl') + usersData.addUrl);
    cy.wait(WAIT.long);
    CommonPage.enterText(usersSelectors.emailInput, usersData.invalidInputs.emailInvalid);
    cy.get('form').invoke('attr', 'novalidate', '');
    cy.get(usersSelectors.createButton).click();
    cy.get(usersSelectors.emailError, { timeout: TIMEOUT.errorMessage })
      .should('be.visible').and('contain.text', usersData.validationMessages.invalidEmail);
  });

  it('Test: 07 - Validate Duplicate Email Error', () => {
    cy.visit(getEnv('adminUrl') + usersData.addUrl);
    cy.wait(WAIT.long);
    CommonPage.enterText(usersSelectors.emailInput, usersData.validInputs.email);
    CommonPage.enterText(usersSelectors.passwordInput, usersData.validInputs.password);
    cy.get(usersSelectors.createButton).click();
    cy.wait(WAIT.long);
    cy.get(`${usersSelectors.toastError}, .validation-summary-errors`, { timeout: TIMEOUT.actionButton })
      .should('be.visible').and('contain.text', usersData.validationMessages.duplicateRecord);
  });

});
