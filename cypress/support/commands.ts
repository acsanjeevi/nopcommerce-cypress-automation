import { TIMEOUT, WAIT } from './constants';

Cypress.Commands.add('waitForSpinnerToDisappear', () => {
  // Poll until both loading indicators are gone; handles late-appearing spinners
  cy.waitUntil(
    () => cy.get('body').then(($body) =>
      $body.find('.blockUI').length === 0 &&
      $body.find('.dataTables_processing:visible').length === 0
    ),
    { timeout: TIMEOUT.tableData, interval: 250, errorMsg: 'Page spinner did not disappear' }
  );
});

Cypress.Commands.add(
  'deleteRecords',
  (recordsName, _confirmMsg, _toastMsg, searchApi, _clearApi, _deleteApi) => {
    cy.log(`Attempting to delete record: ${recordsName}`);

    cy.get('body').then(($body) => {
      const hasEmailSearch = $body.find('#SearchEmail').length > 0;
      const hasNameSearch  = $body.find('[id*="Search"]').length > 0;

      if (hasEmailSearch) {
        cy.get('#SearchEmail').clear().type(recordsName);
      } else if (hasNameSearch) {
        cy.get('[id*="Search"]').first().clear().type(recordsName);
      }
    });

    cy.intercept('POST', searchApi).as('deleteSearchAlias');
    cy.get('[id*="search-"]').first().click();
    cy.wait('@deleteSearchAlias', { timeout: TIMEOUT.searchResult });
    cy.waitForSpinnerToDisappear();

    cy.get('body').then(($body) => {
      const gridBodyRow = $body.find('[id*="-grid"] tbody tr, table tbody tr').first();
      const noData      = $body.text().includes('No data available in table');

      if (noData || gridBodyRow.length === 0) {
        cy.log(`"${recordsName}" not found — skipping deletion.`);
        return;
      }

      cy.get('[id*="-grid"] tbody tr, table tbody tr')
        .first()
        .within(() => {
          cy.get('a[href*="/Edit/"]').click();
        });

      cy.url().should('include', '/Edit/');
      cy.wait(WAIT.medium);

      cy.on('window:confirm', () => true);

      cy.get('button[name="delete"]', { timeout: TIMEOUT.actionButton })
        .should('be.visible')
        .click();

      cy.get('.alert-success', { timeout: TIMEOUT.tableData })
        .should('be.visible');
    });
  }
);

Cypress.Commands.add('validateHeaders', (expectedHeaders: string[], maxColumns: number) => {
  cy.get('thead th').then(($ths) => {
    const visible = $ths.slice(0, maxColumns);
    expectedHeaders.forEach((header, i) => {
      expect(visible.eq(i).text().trim()).to.equal(header);
    });
  });
});

Cypress.Commands.add('searchAndValidateInTable', (searchText: string, _searchApi: string) => {
  cy.get('[id*="Search"]').first().clear().type(searchText);
  cy.get('[id*="search-"]').first().click();
  cy.waitForSpinnerToDisappear();
  cy.get('table tbody tr', { timeout: TIMEOUT.actionButton }).should('exist');
  cy.get('table tbody').should('contain.text', searchText);
});

Cypress.Commands.add(
  'selectedQuickFilter',
  (filterLabel: string, columnSelector: string, expectedValue: string) => {
    cy.contains(filterLabel).click();
    cy.waitForSpinnerToDisappear();
    cy.get('table tbody tr').each(($row) => {
      cy.wrap($row).find(columnSelector).should('contain.text', expectedValue);
    });
  }
);

Cypress.Commands.add(
  'validateContextMenu',
  (triggerSelector: string, menuItemSelector: string, expectedItems: string[]) => {
    cy.get(triggerSelector).first().should('be.visible');
    expectedItems.forEach((item) => {
      cy.get(menuItemSelector).contains(item).should('exist');
    });
  }
);

Cypress.Commands.add('overviewButtons', (buttonSelectors: string[]) => {
  buttonSelectors.forEach((sel) => cy.get(sel).should('be.visible'));
});

Cypress.Commands.add('clickRefreshButton', (api: string) => {
  cy.intercept('POST', api).as('refreshAlias');
  cy.reload();
  cy.wait('@refreshAlias', { timeout: TIMEOUT.listLoad })
    .its('response.statusCode')
    .should('eq', 200);
});
