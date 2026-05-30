import { TIMEOUT, WAIT, getEnv } from '../../support/constants';
import { CommonPage } from '../../page-objects/common-page';
import productsData from '../../fixtures/products/products-test-data.json';
import productsSelectors from '../../fixtures/products/products-selectors.json';

describe('Product Admin', () => {

  before(() => { cy.loginAsAdmin(); });

  beforeEach(() => {
    cy.intercept('POST', productsData.listApi).as('getProductsList');
    cy.visit(getEnv('adminUrl') + productsData.moduleUrl);
    cy.wait('@getProductsList', { timeout: TIMEOUT.listLoad });
    cy.waitForSpinnerToDisappear();
    cy.wait(WAIT.medium);
  });

  afterEach(() => { cy.wait(WAIT.medium); });

  it('Test: 01 - View Product List', { tags: 'prod' }, () => {
    cy.get(productsSelectors.tableBody, { timeout: TIMEOUT.tableData }).should('be.visible');
    cy.get(productsSelectors.tableRows).should('have.length.greaterThan', 0);
    cy.url().should('include', '/Product/List');
  });

  it('Test: 02 - Search Product by Name', { tags: 'prod' }, () => {
    cy.intercept('POST', productsData.listApi).as('searchAlias');
    cy.get(productsSelectors.searchInput).clear().type(productsData.searchText);
    cy.get(productsSelectors.searchButton).click();
    cy.wait('@searchAlias', { timeout: TIMEOUT.searchResult });
    cy.waitForSpinnerToDisappear();
    cy.get(productsSelectors.tableRows, { timeout: TIMEOUT.actionButton })
      .should('have.length.greaterThan', 0).first().should('contain.text', productsData.searchText);
  });

  it('Test: 03 - Navigate to Add Product Form', () => {
    cy.get(productsSelectors.addButton, { timeout: TIMEOUT.actionButton }).should('be.visible').click();
    cy.url().should('include', productsData.addUrl);
  });

  it('Test: 04 - Create Product and Verify Success', { tags: 'prod' }, () => {
    cy.visit(getEnv('adminUrl') + productsData.addUrl);
    cy.wait(WAIT.long);
    CommonPage.enterText(productsSelectors.productNameInput, productsData.validInputs.productName);
    CommonPage.enterText(productsSelectors.skuInput, productsData.validInputs.sku);
    CommonPage.enterText(productsSelectors.priceInput, productsData.validInputs.price);
    cy.get(productsSelectors.createButton).click();
    cy.wait(WAIT.long);
    cy.get(productsSelectors.toastSuccess, { timeout: TIMEOUT.successToast })
      .should('be.visible').and('contain.text', 'successfully');
  });

  it('Test: 05 - Edit Product Price and Verify Update', () => {
    cy.intercept('POST', productsData.listApi).as('editAlias');
    cy.get(productsSelectors.searchInput).clear().type(productsData.validInputs.productName);
    cy.get(productsSelectors.searchButton).click();
    cy.wait('@editAlias', { timeout: TIMEOUT.searchResult });
    cy.waitForSpinnerToDisappear();
    cy.get(productsSelectors.tableRows, { timeout: TIMEOUT.actionButton }).filter(':visible').first().within(() => {
      cy.get(productsSelectors.editOption).click();
    });
    cy.url().should('include', '/Product/Edit/');
    cy.wait(WAIT.long);
    CommonPage.enterText(productsSelectors.priceInput, productsData.updatedInputs.price);
    cy.get(productsSelectors.updateButton).click();
    cy.wait(WAIT.long);
    cy.get(productsSelectors.toastSuccess, { timeout: TIMEOUT.successToast })
      .should('be.visible').and('contain.text', 'successfully');
  });

  it('Test: 06 - Validate Required Product Name', () => {
    cy.visit(getEnv('adminUrl') + productsData.addUrl);
    cy.wait(WAIT.long);
    cy.get(productsSelectors.createButton).click();
    cy.get(productsSelectors.productNameError, { timeout: TIMEOUT.errorMessage }).should('be.visible');
  });

  it('Test: 07 - Verify SKU and Price Fields Accept Valid Input', () => {
    cy.visit(getEnv('adminUrl') + productsData.addUrl);
    cy.wait(WAIT.long);
    CommonPage.enterText(productsSelectors.skuInput, productsData.validInputs.sku);
    cy.get(productsSelectors.skuInput).should('have.value', productsData.validInputs.sku);
    CommonPage.enterText(productsSelectors.priceInput, productsData.validInputs.price);
    cy.get(productsSelectors.priceInput).should('have.value', productsData.validInputs.price);
  });

});
