import { TIMEOUT, WAIT } from '../../support/constants';

const INSTALL_URL          = '/install';
const INSTALL_DONE_TIMEOUT = 300_000;

const DB = {
  provider: 'postgresql',
  server:   'postgres',
  name:     'nopcommerce',
  user:     'nopuser',
  password: 'nopassword',
} as const;

const ADMIN = {
  email:    'admin@yourstore.com',
  password: 'admin',
} as const;

const INSTALL = {
  adminEmail:          'input[name="AdminEmail"]',
  adminPassword:       'input[name="AdminPassword"]',
  confirmPassword:     'input[name="ConfirmPassword"]',
  createSampleData:    'input[name="InstallSampleData"]',
  subscribeNewsletter: 'input[name="SubscribeNewsletters"]',
  dataProvider:        'select[name="DataProvider"]',
  createDatabase:      'input[name="CreateDatabaseIfNotExists"]',
  serverName:          'input[name="ServerName"]',
  databaseName:        'input[name="DatabaseName"]',
  dbUsername:          'input[name="Username"]',
  dbPassword:          'input[name="Password"]',
  installButton:       'button[type="submit"], input[type="submit"]',
} as const;

describe('Application Setup', () => {

  it('Test: 01 - Verify Application is Ready', { retries: { runMode: 3 } }, () => {
    cy.visit(Cypress.env('url') as string, {
      failOnStatusCode: false,
      retryOnNetworkFailure: true,
      timeout: 60_000,
    });
    cy.waitForSpinnerToDisappear();

    cy.title().then((pageTitle) => {
      if (!pageTitle.toLowerCase().includes('install')) {
        cy.log('nopCommerce is already installed');
        return;
      }

      cy.visit(Cypress.env('url') as string + INSTALL_URL, {
        failOnStatusCode: false,
        retryOnNetworkFailure: true,
        timeout: 60_000,
      });
      cy.wait(WAIT.long);

      cy.get(INSTALL.adminEmail, { timeout: TIMEOUT.actionButton }).clear().type(ADMIN.email);
      cy.get(INSTALL.adminPassword).clear().type(ADMIN.password);
      cy.get(INSTALL.confirmPassword).clear().type(ADMIN.password);

      cy.get('body').then(($body) => {
        const $sampleCb = $body.find('input[name="InstallSampleData"][type="checkbox"]');
        if ($sampleCb.length) {
          if (!$sampleCb.is(':checked')) cy.wrap($sampleCb).check({ force: true });
        } else {
          cy.get(INSTALL.createSampleData).invoke('val', 'true');
        }

        const $nlCb = $body.find('input[name="SubscribeNewsletters"][type="checkbox"]');
        if ($nlCb.length) {
          if ($nlCb.is(':checked')) cy.wrap($nlCb).uncheck({ force: true });
        } else {
          cy.get(INSTALL.subscribeNewsletter).invoke('val', 'false');
        }
      });

      cy.get(INSTALL.dataProvider).find('option').then(($opts) => {
        const pgOpt = $opts.filter((_, el) =>
          el.textContent!.toLowerCase().includes('postgre')
        );
        if (pgOpt.length) {
          cy.get(INSTALL.dataProvider).select(pgOpt.val() as string);
        }
      });
      cy.wait(WAIT.medium);

      cy.get('body').then(($body) => {
        const $dbCb = $body.find('input[name="CreateDatabaseIfNotExists"][type="checkbox"]');
        if ($dbCb.length) {
          if (!$dbCb.is(':checked')) cy.wrap($dbCb).check({ force: true });
        } else {
          cy.get(INSTALL.createDatabase).invoke('val', 'true');
        }
      });

      cy.get(INSTALL.serverName).clear().type(DB.server);
      cy.get(INSTALL.databaseName).clear().type(DB.name);

      cy.get('body').then(($body) => {
        if ($body.find(INSTALL.dbUsername).length > 0) cy.get(INSTALL.dbUsername).clear().type(DB.user);
        if ($body.find(INSTALL.dbPassword).length > 0) cy.get(INSTALL.dbPassword).clear().type(DB.password);
      });

      cy.get(INSTALL.installButton, { timeout: TIMEOUT.actionButton }).first().click();

      cy.waitUntil(
        () => cy.request({ method: 'GET', url: Cypress.env('url') as string, failOnStatusCode: false })
          .then((r) => !(r.body as string).toLowerCase().includes('install')),
        { timeout: INSTALL_DONE_TIMEOUT, interval: 10_000, errorMsg: 'Installation did not complete within 5 minutes' }
      );
    });

    cy.get('body', { timeout: TIMEOUT.pageLoad }).should('be.visible');
    cy.url().should('not.include', INSTALL_URL);
  });

  it('Test: 02 - Verify Admin Panel Login', () => {
    cy.loginAsAdmin();
    cy.url().should('include', '/Admin');
    cy.get('.content-wrapper', { timeout: TIMEOUT.tableData }).should('be.visible');
  });

});
