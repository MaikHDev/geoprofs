// for this test to work, make sure you have a pending leave request from employee that is past due date

describe('template spec', () => {
  beforeEach(() => {
    cy.visit('http://localhost:3000/auth')

    cy.get('input[type="email"]').click();
    cy.get('input[type="email"]').type('officemanager@email.com');
    cy.get('input[type="password"]').click();
    cy.get('input[type="password"]').type('12345678');
    cy.get('button.w-full').click();

  });
  it('officemanager_tries_to_review_past_due_date.cy', function() {
    cy.visit('http://localhost:3000/leaveRequests');
    cy.get('tr:nth-child(1) td:nth-child(2)').should('not.exist')
  });
});
