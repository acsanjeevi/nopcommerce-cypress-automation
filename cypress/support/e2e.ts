import './commands';
import './authentication';
import 'cypress-wait-until';

import '../business-function/users-commands';
import '../business-function/categories-commands';
import '../business-function/products-commands';
import '../business-function/orders-commands';
import '../business-function/cart-commands';

import 'cypress-mochawesome-reporter/register';
import 'mochawesome/addContext';

import registerCypressGrep = require('@cypress/grep');
registerCypressGrep();

const SUPPRESSED_ERROR_PATTERNS = ['cdn', 'Failed to load external resource', 'msauth.net', 'Things went bad'];

Cypress.on('uncaught:exception', (err) => {
  if (SUPPRESSED_ERROR_PATTERNS.some((pattern) => err.message.includes(pattern))) {
    return false;
  }
  return true;
});

beforeEach(() => {
  const role = Cypress.env('role') as string || 'user';
  cy.log(`Running as role: ${role}`);
});
