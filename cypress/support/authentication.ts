import { TIMEOUT, WAIT } from './constants';

const cypressEnv = (key: string): string => (Cypress.env(key) as string) ?? '';

const LOGIN_SELECTORS = {
  emailInput:    '#Email',
  passwordInput: '#Password',
  loginButton:   '.login-button',
  loggedInUser:  '.ico-account',
} as const;

const ADMIN_LOGIN_SELECTORS = {
  emailInput:     '#Email',
  passwordInput:  '#Password',
  loginButton:    '.login-button',
  adminDashboard: '.content-wrapper',
} as const;

const REGISTER_SELECTORS = {
  firstName:       '#FirstName',
  lastName:        '#LastName',
  email:           '#Email',
  password:        '#Password',
  confirmPassword: '#ConfirmPassword',
  submitButton:    '#register-button',
} as const;

Cypress.Commands.add('loginAsCustomer', () => {
  const email    = cypressEnv('customerEmail');
  const password = cypressEnv('customerPassword');
  const username = cypressEnv('customerUsername') || 'Sanjeevi';

  if (!email || !password) {
    throw new Error('Customer credentials missing — check CYPRESS_CUSTOMER_EMAIL / PASSWORD in secured.env');
  }

  cy.visit(cypressEnv('url') + '/register', { failOnStatusCode: false });
  cy.get('body', { timeout: TIMEOUT.pageLoad }).then(($body) => {
    if ($body.find(`${REGISTER_SELECTORS.firstName}:visible`).length > 0) {
      cy.get(REGISTER_SELECTORS.firstName).type(username);
      cy.get(REGISTER_SELECTORS.lastName).type('AutoTest');
      cy.get(REGISTER_SELECTORS.email).clear().type(email);
      cy.get(REGISTER_SELECTORS.password).type(password, { log: false });
      cy.get(REGISTER_SELECTORS.confirmPassword).type(password, { log: false });
      cy.get(REGISTER_SELECTORS.submitButton).click();
      cy.wait(WAIT.long);
    }
  });

  cy.visit(cypressEnv('url') + '/login', { failOnStatusCode: false });
  cy.get(LOGIN_SELECTORS.emailInput, { timeout: TIMEOUT.pageLoad }).should('be.visible').clear().type(email);
  cy.get(LOGIN_SELECTORS.passwordInput).clear().type(password, { log: false });
  cy.get(LOGIN_SELECTORS.loginButton).first().click();
  cy.get(LOGIN_SELECTORS.loggedInUser, { timeout: TIMEOUT.pageLoad }).should('be.visible');
  cy.log(`Logged in as customer: ${email}`);
});

Cypress.Commands.add('loginAsAdmin', () => {
  const email    = cypressEnv('adminEmail');
  const password = cypressEnv('adminPassword');

  if (!email || !password) {
    throw new Error('Admin credentials missing — check CYPRESS_ADMIN_EMAIL / PASSWORD in secured.env');
  }

  const adminBase = cypressEnv('adminUrl').replace(/\/+$/, '');
  const loginUrl  = adminBase.endsWith('/Admin')
    ? adminBase.replace(/\/Admin$/, '/login?ReturnUrl=%2FAdmin')
    : `${adminBase}/login?ReturnUrl=%2FAdmin`;

  cy.visit(loginUrl, { failOnStatusCode: false });
  cy.get(ADMIN_LOGIN_SELECTORS.emailInput, { timeout: TIMEOUT.pageLoad }).should('be.visible').clear().type(email);
  cy.get(ADMIN_LOGIN_SELECTORS.passwordInput).clear().type(password, { log: false });
  cy.get(ADMIN_LOGIN_SELECTORS.loginButton).first().click();
  cy.get(ADMIN_LOGIN_SELECTORS.adminDashboard, { timeout: TIMEOUT.pageLoad }).should('be.visible');
  cy.log(`Logged in as admin: ${email}`);
});
