import { TIMEOUT, WAIT, getEnv } from '../../support/constants';
import ordersData from '../../fixtures/orders/orders-test-data.json';
import ordersSelectors from '../../fixtures/orders/orders-selectors.json';

describe('Order Admin', () => {

  before(() => { cy.loginAsAdmin(); });

  beforeEach(() => {
    cy.intercept('POST', ordersData.listApi).as('getOrdersList');
    cy.visit(getEnv('adminUrl') + ordersData.moduleUrl);
    cy.wait('@getOrdersList', { timeout: TIMEOUT.listLoad });
    cy.waitForSpinnerToDisappear();
    cy.wait(WAIT.medium);
  });

  afterEach(() => { cy.wait(WAIT.medium); });

  it('Test: 01 - View Order List', { tags: 'prod' }, () => {
    cy.get(ordersSelectors.tableBody, { timeout: TIMEOUT.tableData }).should('be.visible');
    cy.get(ordersSelectors.tableRows).should('have.length.greaterThan', 0);
    cy.url().should('include', '/Order/List');
  });

  it('Test: 02 - Search Order by Customer Email', { tags: 'prod' }, () => {
    cy.intercept('POST', ordersData.listApi).as('searchAlias');
    cy.get(ordersSelectors.searchEmailInput).clear().type(ordersData.searchEmail);
    cy.get(ordersSelectors.searchButton).click();
    cy.wait('@searchAlias', { timeout: TIMEOUT.searchResult });
    cy.waitForSpinnerToDisappear();
    cy.get(ordersSelectors.tableRows, { timeout: TIMEOUT.actionButton }).should('have.length.greaterThan', 0);
  });

  it('Test: 03 - Open Order Detail Page', { tags: 'prod' }, () => {
    cy.get(ordersSelectors.tableRows, { timeout: TIMEOUT.actionButton }).filter(':visible').first().within(() => {
      cy.get(ordersSelectors.editOption).click();
    });
    cy.url().should('include', '/Order/Edit/');
    cy.wait(WAIT.long);
    cy.get('.content-wrapper', { timeout: TIMEOUT.actionButton }).should('be.visible');
  });

  it('Test: 04 - Verify Order Status is Visible', () => {
    cy.get(ordersSelectors.tableRows).filter(':visible').first().within(() => {
      cy.get(ordersSelectors.orderStatusBadge).should('be.visible');
    });
  });

  it('Test: 05 - Verify Customer Column in Order Grid', () => {
    cy.get(ordersSelectors.tableRows).filter(':visible').first().within(() => {
      cy.get(ordersSelectors.customerColumn).should('be.visible');
    });
  });

});
