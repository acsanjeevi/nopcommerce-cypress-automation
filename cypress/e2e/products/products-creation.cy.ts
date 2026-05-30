import { TIMEOUT } from '../../support/constants';
import productsSelectors from '../../fixtures/products/products-selectors.json';
import creationData from '../../fixtures/products/products-creations-testdata.json';

describe('Product Management - Data Setup', () => {

  before(() => { cy.loginAsAdmin(); });

  it('Test: 01 - Create Wireless Headphones Product', () => {
    cy.loadProductsOverview();
    cy.clickOnAddProducts();
    cy.createProducts(creationData.records[0]);
    cy.get(productsSelectors.toastSuccess, { timeout: TIMEOUT.successToast })
      .should('be.visible').and('contain.text', 'successfully');
  });

  it('Test: 02 - Create Smart Watch Product', () => {
    cy.loadProductsOverview();
    cy.clickOnAddProducts();
    cy.createProducts(creationData.records[1]);
    cy.get(productsSelectors.toastSuccess, { timeout: TIMEOUT.successToast })
      .should('be.visible').and('contain.text', 'successfully');
  });

  it('Test: 03 - Create Bluetooth Speaker Product', () => {
    cy.loadProductsOverview();
    cy.clickOnAddProducts();
    cy.createProducts(creationData.records[2]);
    cy.get(productsSelectors.toastSuccess, { timeout: TIMEOUT.successToast })
      .should('be.visible').and('contain.text', 'successfully');
  });

});
