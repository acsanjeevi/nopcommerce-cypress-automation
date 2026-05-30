import { TIMEOUT, WAIT, getEnv } from '../../support/constants';
import { CommonPage } from '../../page-objects/common-page';
import categoriesData from '../../fixtures/categories/categories-test-data.json';
import categoriesSelectors from '../../fixtures/categories/categories-selectors.json';

describe('Category Admin', () => {

  before(() => { cy.loginAsAdmin(); });

  beforeEach(() => {
    cy.intercept('POST', categoriesData.listApi).as('getCategoriesList');
    cy.visit(getEnv('adminUrl') + categoriesData.moduleUrl);
    cy.wait('@getCategoriesList', { timeout: TIMEOUT.listLoad });
    cy.waitForSpinnerToDisappear();
    cy.wait(WAIT.medium);
  });

  afterEach(() => { cy.wait(WAIT.medium); });

  it('Test: 01 - View Category List', { tags: 'prod' }, () => {
    cy.get(categoriesSelectors.tableBody, { timeout: TIMEOUT.tableData }).should('be.visible');
    cy.get(categoriesSelectors.tableRows).should('have.length.greaterThan', 0);
    cy.url().should('include', '/Category/List');
  });

  it('Test: 02 - Search Category by Name', { tags: 'prod' }, () => {
    cy.intercept('POST', categoriesData.listApi).as('searchAlias');
    cy.get(categoriesSelectors.searchInput).clear().type(categoriesData.searchText);
    cy.get(categoriesSelectors.searchButton).click();
    cy.wait('@searchAlias', { timeout: TIMEOUT.searchResult });
    cy.waitForSpinnerToDisappear();
    cy.get(categoriesSelectors.tableRows, { timeout: TIMEOUT.actionButton })
      .should('have.length.greaterThan', 0).first().should('contain.text', categoriesData.searchText);
  });

  it('Test: 03 - Navigate to Add Category Form', () => {
    cy.get(categoriesSelectors.addButton, { timeout: TIMEOUT.actionButton }).should('be.visible').click();
    cy.url().should('include', categoriesData.addUrl);
  });

  it('Test: 04 - Create Category and Verify Success', { tags: 'prod' }, () => {
    cy.visit(getEnv('adminUrl') + categoriesData.addUrl);
    cy.wait(WAIT.long);
    CommonPage.enterText(categoriesSelectors.categoryNameInput, categoriesData.validInputs.categoryName);
    cy.get(categoriesSelectors.createButton).click();
    cy.wait(WAIT.long);
    cy.get(categoriesSelectors.toastSuccess, { timeout: TIMEOUT.successToast })
      .should('be.visible').and('contain.text', 'successfully');
  });

  it('Test: 05 - Edit Category and Verify Update', () => {
    cy.intercept('POST', categoriesData.listApi).as('editAlias');
    cy.get(categoriesSelectors.searchInput).clear().type(categoriesData.validInputs.categoryName);
    cy.get(categoriesSelectors.searchButton).click();
    cy.wait('@editAlias', { timeout: TIMEOUT.searchResult });
    cy.waitForSpinnerToDisappear();
    cy.get(categoriesSelectors.tableRows, { timeout: TIMEOUT.actionButton }).filter(':visible').first().within(() => {
      cy.get(categoriesSelectors.editOption).click();
    });
    cy.url().should('include', '/Category/Edit/');
    cy.wait(WAIT.long);
    CommonPage.enterText(categoriesSelectors.categoryNameInput, categoriesData.updatedInputs.categoryName);
    cy.get(categoriesSelectors.updateButton).click();
    cy.wait(WAIT.long);
    cy.get(categoriesSelectors.toastSuccess, { timeout: TIMEOUT.successToast })
      .should('be.visible').and('contain.text', 'successfully');
  });

  it('Test: 06 - Validate Required Category Name', () => {
    cy.visit(getEnv('adminUrl') + categoriesData.addUrl);
    cy.wait(WAIT.long);
    cy.get(categoriesSelectors.createButton).click();
    cy.get(categoriesSelectors.categoryNameError, { timeout: TIMEOUT.errorMessage }).should('be.visible');
  });

  it('Test: 07 - Verify Published Status Default', () => {
    cy.visit(getEnv('adminUrl') + categoriesData.addUrl);
    cy.wait(WAIT.long);
    cy.get(categoriesSelectors.publishedCheckbox).should('be.checked');
  });

});
