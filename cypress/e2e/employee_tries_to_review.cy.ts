// for this test to work, make sure you have a pending leave request from employee

describe('template spec', () => {
  beforeEach(() => {
    cy.visit('http://localhost:3000/auth')

    cy.get('input[type="email"]').click();
    cy.get('input[type="email"]').type('employee@email.com');
    cy.get('input[type="password"]').click();
    cy.get('input[type="password"]').type('12345678');
    cy.get('button.w-full').click();

  });
  it('employee_tries_review_leave_request', function() {
    cy.visit('http://localhost:3000/leaveRequests');
    cy.contains(/Access Denied!/i,{ timeout: 12000 }).should('be.visible')

  });
});
