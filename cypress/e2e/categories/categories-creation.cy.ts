import { TIMEOUT } from '../../support/constants';
import categoriesSelectors from '../../fixtures/categories/categories-selectors.json';
import creationData from '../../fixtures/categories/categories-creations-testdata.json';

describe('Category Management - Data Setup', () => {

  before(() => { cy.loginAsAdmin(); });

  it('Test: 01 - Create Electronics Category', () => {
    cy.loadCategoriesOverview();
    cy.clickOnAddCategories();
    cy.createCategories(creationData.records[0]);
    cy.get(categoriesSelectors.toastSuccess, { timeout: TIMEOUT.successToast })
      .should('be.visible').and('contain.text', 'successfully');
  });

  it('Test: 02 - Create Clothing Category', () => {
    cy.loadCategoriesOverview();
    cy.clickOnAddCategories();
    cy.createCategories(creationData.records[1]);
    cy.get(categoriesSelectors.toastSuccess, { timeout: TIMEOUT.successToast })
      .should('be.visible').and('contain.text', 'successfully');
  });

  it('Test: 03 - Create Home Appliances Category', () => {
    cy.loadCategoriesOverview();
    cy.clickOnAddCategories();
    cy.createCategories(creationData.records[2]);
    cy.get(categoriesSelectors.toastSuccess, { timeout: TIMEOUT.successToast })
      .should('be.visible').and('contain.text', 'successfully');
  });

});
