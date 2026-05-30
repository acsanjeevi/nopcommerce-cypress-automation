import dayjs from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';

dayjs.extend(isBetween);

export class CommonPage {

  static enterText(selector: string, value: string): typeof CommonPage {
    cy.get(selector).clear({ force: true }).type(value);
    return this;
  }

  static clickOnButton(selector: string): typeof CommonPage {
    cy.get(selector, { timeout: 10_000 })
      .should('be.visible')
      .should('not.be.disabled')
      .click()
      .then(() => cy.wait(500));
    return this;
  }

  static menuClick(selector: string): typeof CommonPage {
    cy.get(selector, { timeout: 10_000 }).click();
    return this;
  }

  static selectDropdownOption(selector: string, value: string): typeof CommonPage {
    cy.get(selector).click();
    cy.get('li.p-dropdown-item').contains(value).click();
    return this;
  }

  static checkOrClickCheckbox(selector: string, shouldCheck = true): typeof CommonPage {
    cy.get(selector).then(($el) => {
      if ($el.hasClass('p-checkbox-box')) {
        const isChecked = $el.hasClass('p-highlight');
        if (isChecked !== shouldCheck) cy.wrap($el).click();
        return;
      }
      const $checkboxBox = $el.find('.p-checkbox-box');
      if ($checkboxBox.length > 0) {
        const isChecked = $checkboxBox.hasClass('p-highlight');
        if (isChecked !== shouldCheck) cy.wrap($checkboxBox).click();
      } else {
        cy.wrap($el)
          .should('exist')
          .then(($checkbox) => {
            const isChecked = $checkbox.prop('checked') as boolean;
            if (isChecked !== shouldCheck) cy.get(selector).click({ force: true });
          });
      }
    });
    return this;
  }

  static clickEllipsisButton(ellipsisSelector: string, optionSelector: string): typeof CommonPage {
    cy.get(ellipsisSelector).first().click();
    cy.get(optionSelector).should('be.visible').click();
    return this;
  }

  static spinnerLoad(selector: string): typeof CommonPage {
    cy.get(selector).should('not.exist');
    return this;
  }

  static verifyInputText(selector: string, value: string): typeof CommonPage {
    cy.get(selector).should('contain.text', value);
    return this;
  }

  static verifyToastMessage(title: string, detail: string): typeof CommonPage {
    cy.get('.p-toast-summary', { timeout: 10_000 }).should('contain.text', title);
    cy.get('.p-toast-detail').should('contain.text', detail);
    return this;
  }

  static deleteConfirmation(confirmationMessage: string, recordName: string): typeof CommonPage {
    cy.get('.p-dialog-content').should('contain.text', confirmationMessage);
    cy.get('.p-dialog-content').should('contain.text', recordName);
    return this;
  }

  static verifyDateInRange(
    dateText: string,
    startDate: string,
    endDate: string,
    format = 'DD/MM/YYYY'
  ): typeof CommonPage {
    const date  = dayjs(dateText, format);
    const start = dayjs(startDate, format);
    const end   = dayjs(endDate, format);
    expect(date.isBetween(start, end, 'day', '[]')).to.be.true;
    return this;
  }
}
