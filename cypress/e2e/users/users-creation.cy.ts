import { TIMEOUT, WAIT, getEnv } from '../../support/constants';
import usersSelectors from '../../fixtures/users/users-selectors.json';
import creationData from '../../fixtures/users/users-creations-testdata.json';
import usersData from '../../fixtures/users/users-test-data.json';

function ensureCustomerCreated(record: typeof creationData.records[0]): void {
  cy.loadUsersOverview();
  cy.clickOnAddUsers();
  cy.createUsers(record);
  cy.get('body', { timeout: TIMEOUT.successToast }).then(($body) => {
    if ($body.text().includes('already registered') || $body.text().includes('already exists')) {
      cy.log(`Customer ${record.email} already exists — acceptable`);
    } else {
      cy.url().should('include', '/Customer/Edit/');
    }
  });
}

describe('Customer Management - Data Setup', () => {

  before(() => { cy.loginAsAdmin(); });

  it('Test: 01 - Create Customer Alice Johnson', () => {
    ensureCustomerCreated(creationData.records[0]);
  });

  it('Test: 02 - Create Customer Bob Williams', () => {
    ensureCustomerCreated(creationData.records[1]);
  });

  it('Test: 03 - Create Customer Carol Smith', () => {
    ensureCustomerCreated(creationData.records[2]);
  });

});
