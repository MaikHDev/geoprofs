// for this test to work, make sure you have a pending leave request from employee

describe('template spec', () => {
  it('employee_tries_review_leave_request', function() {
    cy.visit('http://localhost:3000/leaveRequests');
    cy.contains(/Access Denied!/i,{ timeout: 12000 }).should('be.visible')

  });
});
