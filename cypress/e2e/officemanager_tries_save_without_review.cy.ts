// for this test to work, make sure you have a pending leave request from employee

describe('template spec', () => {
  beforeEach(() => {
    cy.visit('http://localhost:3000/auth')

    cy.get('input[type="email"]').click();
    cy.get('input[type="email"]').type('officemanager@email.com');
    cy.get('input[type="password"]').click();
    cy.get('input[type="password"]').type('12345678');
    cy.get('button.w-full').click();

  });
  it('officemanager_can_review_leave_request', function() {
    cy.visit('http://localhost:3000/leaveRequests');
    cy.get('tr:nth-child(1) td:nth-child(2)').click();

    cy.url().should('include', '/leaveRequest/')
    cy.get('button.font-semibold').should('be.disabled');
  });
});
