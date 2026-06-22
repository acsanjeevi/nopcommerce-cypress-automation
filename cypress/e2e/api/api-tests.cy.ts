import { getEnv } from '../../support/constants';
import apiData from '../../fixtures/api/api-test-data.json';

const baseUrl = () => getEnv('url');
const adminUrl = () => getEnv('adminUrl');

describe('API Tests', () => {

  it('Test: 01 - Storefront Health Check', () => {
    cy.request({
      method: 'GET',
      url: baseUrl() + apiData.storefrontUrl,
      failOnStatusCode: false,
    }).then((res) => {
      expect(res.status).to.eq(200);
      expect(res.body).to.include('nopCommerce');
    });
  });

  it('Test: 02 - Admin Login via API', () => {
    cy.request({
      method: 'GET',
      url: adminUrl() + apiData.adminLogin,
      failOnStatusCode: false,
    }).then((loginPage) => {
      const tokenMatch = (loginPage.body as string).match(
        /name="__RequestVerificationToken".*?value="([^"]+)"/
      );
      const token = tokenMatch ? tokenMatch[1] : '';

      cy.request({
        method: 'POST',
        url: adminUrl() + apiData.adminLogin,
        form: true,
        followRedirect: true,
        failOnStatusCode: false,
        body: {
          Email: getEnv('adminEmail'),
          Password: getEnv('adminPassword'),
          __RequestVerificationToken: token,
        },
      }).then((res) => {
        expect(res.status).to.eq(200);
        expect(res.redirects || []).to.have.length.greaterThan(0);
      });
    });
  });

  it('Test: 03 - Category Admin Page Accessible', () => {
    cy.request({
      method: 'GET',
      url: adminUrl() + apiData.categoryPage,
      failOnStatusCode: false,
    }).then((res) => {
      expect(res.status).to.eq(200);
      expect(res.body).to.include('Category');
    });
  });

  it('Test: 04 - Product Admin Page Accessible', () => {
    cy.request({
      method: 'GET',
      url: adminUrl() + apiData.productPage,
      failOnStatusCode: false,
    }).then((res) => {
      expect(res.status).to.eq(200);
      expect(res.body).to.include('Product');
    });
  });

  it('Test: 05 - Customer Admin Page Accessible', () => {
    cy.request({
      method: 'GET',
      url: adminUrl() + apiData.customerPage,
      failOnStatusCode: false,
    }).then((res) => {
      expect(res.status).to.eq(200);
      expect(res.body).to.include('Customer');
    });
  });

  it('Test: 06 - Order Admin Page Accessible', () => {
    cy.request({
      method: 'GET',
      url: adminUrl() + apiData.orderPage,
      failOnStatusCode: false,
    }).then((res) => {
      expect(res.status).to.eq(200);
      expect(res.body).to.include('Order');
    });
  });

  it('Test: 07 - Invalid Endpoint Returns Error', () => {
    cy.request({
      method: 'GET',
      url: baseUrl() + apiData.invalidEndpoint,
      failOnStatusCode: false,
    }).then((res) => {
      expect(res.status).to.be.gte(400);
    });
  });

  it('Test: 08 - Storefront Product Page Accessible', () => {
    cy.request({
      method: 'GET',
      url: baseUrl() + apiData.storefrontCategory,
      failOnStatusCode: false,
    }).then((res) => {
      expect(res.status).to.be.oneOf([200, 301, 302]);
    });
  });

});
