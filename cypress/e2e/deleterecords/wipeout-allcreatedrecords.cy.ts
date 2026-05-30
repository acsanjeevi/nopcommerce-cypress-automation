import { TIMEOUT, WAIT, getEnv } from '../../support/constants';
import usersData           from '../../fixtures/users/users-test-data.json';
import usersSelectors      from '../../fixtures/users/users-selectors.json';
import categoriesData      from '../../fixtures/categories/categories-test-data.json';
import categoriesSelectors from '../../fixtures/categories/categories-selectors.json';
import productsData        from '../../fixtures/products/products-test-data.json';
import productsSelectors   from '../../fixtures/products/products-selectors.json';

interface DeleteConfig {
  moduleUrl:         string;
  listApi:           string;
  searchSelector:    string;
  searchBtnSelector: string;
  tableRowsSelector: string;
  editLinkSelector:  string;
  recordLabel:       string;
}

function deleteIfExists(cfg: DeleteConfig): void {
  cy.intercept('POST', cfg.listApi).as('wipeAlias');
  cy.visit(getEnv('adminUrl') + cfg.moduleUrl);
  cy.wait('@wipeAlias', { timeout: TIMEOUT.listLoad });
  cy.waitForSpinnerToDisappear();
  cy.wait(WAIT.short);

  cy.get(cfg.searchSelector).clear().type(cfg.recordLabel);
  cy.get(cfg.searchBtnSelector).click();
  cy.wait('@wipeAlias', { timeout: TIMEOUT.searchResult });
  cy.waitForSpinnerToDisappear();

  cy.get('body').then(($body) => {
    const rows   = $body.find(cfg.tableRowsSelector);
    const noData = $body.text().includes('No data available in table');
    if (noData || rows.length === 0) {
      cy.log(`"${cfg.recordLabel}" not found — skipping`);
      return;
    }
    cy.on('window:confirm', () => true);
    cy.get(cfg.tableRowsSelector).filter(':visible').first().within(() => { cy.get(cfg.editLinkSelector).click(); });
    cy.url().should('include', '/Edit/');
    cy.wait(WAIT.medium);
    cy.get('body').then(($editBody) => {
      if ($editBody.find('button[name="delete"]').length > 0) {
        cy.get('button[name="delete"]', { timeout: TIMEOUT.actionButton }).should('be.visible').click();
        cy.get('.alert-success', { timeout: TIMEOUT.tableData }).should('be.visible');
      } else if ($editBody.find('button.btn-danger').length > 0) {
        cy.get('button.btn-danger', { timeout: TIMEOUT.actionButton }).first().scrollIntoView().click({ force: true });
        cy.wait(500);
        cy.get('#customermodel-Delete-delete-confirmation button.btn-danger', { timeout: TIMEOUT.shortAction })
          .should('be.visible').click();
        cy.get('.alert-success', { timeout: TIMEOUT.tableData }).should('be.visible');
      } else {
        cy.log(`No delete button found for "${cfg.recordLabel}" — skipping`);
      }
    });
    cy.log(`"${cfg.recordLabel}" deleted`);
  });
}

describe('Data Cleanup', () => {

  before(() => { cy.loginAsAdmin(); });

  afterEach(() => { cy.wait(WAIT.medium); });

  it('Test: 01 - Delete Test Customers', () => {
    usersData.deleteRecords.forEach((name) => {
      deleteIfExists({
        moduleUrl:         usersData.moduleUrl,
        listApi:           usersData.listApi,
        searchSelector:    usersSelectors.searchFirstNameInput,
        searchBtnSelector: usersSelectors.searchButton,
        tableRowsSelector: usersSelectors.tableRows,
        editLinkSelector:  usersSelectors.editOption,
        recordLabel:       name,
      });
    });
  });

  it('Test: 02 - Delete Electronics Category', () => {
    deleteIfExists({
      moduleUrl:         categoriesData.moduleUrl,
      listApi:           categoriesData.listApi,
      searchSelector:    categoriesSelectors.searchInput,
      searchBtnSelector: categoriesSelectors.searchButton,
      tableRowsSelector: categoriesSelectors.tableRows,
      editLinkSelector:  categoriesSelectors.editOption,
      recordLabel:       'Electronics',
    });
  });

  it('Test: 03 - Delete Clothing Category', () => {
    deleteIfExists({
      moduleUrl:         categoriesData.moduleUrl,
      listApi:           categoriesData.listApi,
      searchSelector:    categoriesSelectors.searchInput,
      searchBtnSelector: categoriesSelectors.searchButton,
      tableRowsSelector: categoriesSelectors.tableRows,
      editLinkSelector:  categoriesSelectors.editOption,
      recordLabel:       'Clothing',
    });
  });

  it('Test: 04 - Delete Home Appliances Category', () => {
    deleteIfExists({
      moduleUrl:         categoriesData.moduleUrl,
      listApi:           categoriesData.listApi,
      searchSelector:    categoriesSelectors.searchInput,
      searchBtnSelector: categoriesSelectors.searchButton,
      tableRowsSelector: categoriesSelectors.tableRows,
      editLinkSelector:  categoriesSelectors.editOption,
      recordLabel:       'Home Appliances',
    });
  });

  it('Test: 05 - Delete Wireless Headphones Product', () => {
    deleteIfExists({
      moduleUrl:         productsData.moduleUrl,
      listApi:           productsData.listApi,
      searchSelector:    productsSelectors.searchInput,
      searchBtnSelector: productsSelectors.searchButton,
      tableRowsSelector: productsSelectors.tableRows,
      editLinkSelector:  productsSelectors.editOption,
      recordLabel:       'Wireless Headphones',
    });
  });

  it('Test: 06 - Delete Smart Watch Product', () => {
    deleteIfExists({
      moduleUrl:         productsData.moduleUrl,
      listApi:           productsData.listApi,
      searchSelector:    productsSelectors.searchInput,
      searchBtnSelector: productsSelectors.searchButton,
      tableRowsSelector: productsSelectors.tableRows,
      editLinkSelector:  productsSelectors.editOption,
      recordLabel:       'Smart Watch',
    });
  });

  it('Test: 07 - Delete Bluetooth Speaker Product', () => {
    deleteIfExists({
      moduleUrl:         productsData.moduleUrl,
      listApi:           productsData.listApi,
      searchSelector:    productsSelectors.searchInput,
      searchBtnSelector: productsSelectors.searchButton,
      tableRowsSelector: productsSelectors.tableRows,
      editLinkSelector:  productsSelectors.editOption,
      recordLabel:       'Bluetooth Speaker',
    });
  });

});
