import creationData from '../../fixtures/orders/orders-creations-testdata.json';

describe('Orders — Bulk Data Seeding via Storefront Checkout', () => {

  before(() => {
    cy.loginAsAdmin();
  });

  creationData.records.forEach((record, index) => {
    const testNumber = String(index + 1).padStart(2, '0');

    it(`TC-ORD-C${testNumber} — Confirm order record exists for customer "${record.customer}"`, () => {
      cy.loadOrdersOverview();
      cy.clickOnAddOrders();
      cy.createOrders(record);
    });
  });
});
