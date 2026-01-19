// for this test to work, make sure you have a pending leave request from officemanager

describe('template spec', () => {
  beforeEach(() => {
    cy.visit('http://localhost:3000/auth')

    cy.get('input[type="email"]').click();
    cy.get('input[type="email"]').type('officemanager@email.com');
    cy.get('input[type="password"]').click();
    cy.get('input[type="password"]').type('12345678');
    cy.get('button.w-full').click();

  });
  it('officemanager_tries_to_review_his_own_request.cy', function() {
    cy.visit('http://localhost:3000/leaveRequests');
    cy.get('tr:nth-child(1) td:nth-child(2)').should('not.exist')
  });
});
