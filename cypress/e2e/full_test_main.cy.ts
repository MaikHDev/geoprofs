describe('full request view testing', () => {
  const testEmployee={
    email: "employee@email.com",
    password: "12345678",
  }
  const testManager={
    email: "manager@email.com",
    password: "12345678",
  }
  const testOfficemanager={
    email: "Officemanager@email.com",
    password: "12345678",
  }
  const testAdmin={
    email: "Admin@email.com",
    password: "12345678",
  }

  beforeEach(() => {
    cy.visit("/");
  })

  it("test feature 11", () =>{
    //admin login
    cy.visit("/auth");

    cy.url().should("include", "/auth");
    cy.get("h1").contains("Sign In").should("be.visible");

    cy.get('[data-testid="email-input"]').type(testAdmin.email);
    cy.get('[data-testid="password-input"]').type(testAdmin.password);
    cy.get('[data-testid="sign-in-button"]').click();

    cy.url().should("include", "/auth", {timeout:20000});

    cy.visit("/requestForLeave/view");
    cy.url().should("include", "/requestForLeave/view", {timeout:200000});

    cy.get("h1").contains("Access Denied!").should("be.visible");

    //officemanager login
    cy.visit("/auth");

    cy.url().should("include", "/auth");
    cy.get("h1").contains("Sign In").should("be.visible");

    cy.get('[data-testid="email-input"]').type(testOfficemanager.email);
    cy.get('[data-testid="password-input"]').type(testOfficemanager.password);
    cy.get('[data-testid="sign-in-button"]').click();

    cy.url().should("include", "/auth", {timeout:20000});

    cy.visit("/requestForLeave/view");
    cy.url().should("include", "/requestForLeave/view", {timeout:200000});

    

    //manager login
    cy.visit("/auth");

    cy.url().should("include", "/auth");
    cy.get("h1").contains("Sign In").should("be.visible");

    cy.get('[data-testid="email-input"]').type(testManager.email);
    cy.get('[data-testid="password-input"]').type(testManager.password);
    cy.get('[data-testid="sign-in-button"]').click();

    cy.url().should("include", "/auth", {timeout:20000});

    cy.visit("/requestForLeave/view");
    cy.url().should("include", "/requestForLeave/view", {timeout:200000});


    // employee login
    cy.visit("/auth");

    cy.url().should("include", "/auth");
    cy.get("h1").contains("Sign In").should("be.visible");

    cy.get('[data-testid="email-input"]').type(testEmployee.email);
    cy.get('[data-testid="password-input"]').type(testEmployee.password);
    cy.get('[data-testid="sign-in-button"]').click();

    cy.url().should("include", "/auth", {timeout:20000});

    cy.visit("/requestForLeave/view");
    cy.url().should("include", "/requestForLeave/view", {timeout:200000});


    // test reasoning filter
    cy.get('[data-testid="reason-filter"]').select("vacation"), {timeout:2000}

    cy.get('[data-testid="reason-filter"]').select("personal"), {timeout:2000}

    cy.get('[data-testid="reason-filter"]').select("medical"), {timeout:2000}

    cy.get('[data-testid="reason-filter"]').select("extra"), {timeout:2000}

    cy.get('[data-testid="reason-filter"]').select("All Reasons"), {timeout:2000}

    //test status fliter
    cy.get('[data-testid="status-filter"]').select("pending"), {timeout:2000}

    cy.get('[data-testid="status-filter"]').select("renewal"), {timeout:2000}

    cy.get('[data-testid="status-filter"]').select("denied"), {timeout:2000}

    cy.get('[data-testid="status-filter"]').select("approved"), {timeout:2000}

    cy.get('[data-testid="status-filter"]').select("All Status"), {timeout:2000}

  })
})