// Separate logout function
export function logout() {
  cy.visit("/profile", { timeout: 10000 });

  cy.get('[data-testid="profile-logout-button"]').click();

  cy.url({ timeout: 10000 }).should("include", "/");

  cy.get("div.Toastify__toast").click();
  cy.get("div.Toastify__toast").should("have.text", "Successfully signed out!");
}

describe("Logout Flow", () => {
  beforeEach(() => {
    // Login first
    cy.visit("/auth");
    cy.get('input[name="email"]').type("admin@email.com");
    cy.get('input[name="password"]').type("12345678");
    cy.get('button[type="submit"]').click();

    cy.url({ timeout: 10000 }).should("include", "/dashboard");
  });

  it("should successfully log out", () => {
    logout();
  });
});

describe("Logging in", () => {
  const admin = {
    email: "admin@email.com",
    password: "12345678",
    verified: true,
  };
  const officeManager = {
    email: "office-manager@email.com",
    password: "12345678",
    verified: true,
  };

  const manager = {
    email: "manager@email.com",
    password: "12345678",
    verified: true,
  };

  const employee2 = {
    email: "employee2@email.com",
    password: "12345678",
    verified: false,
  };

  beforeEach(() => {
    cy.visit("/");
  });

  it("should successfully log in as ADMIN from homepage, redirect to dashboard and show specific perms", () => {
    cy.get('[data-testid="header-login-button"]').click();

    cy.url().should("include", "/auth");
    cy.get("h1").contains("Sign In").should("be.visible");

    cy.get('input[name="email"]').type(admin.email);
    cy.get('input[name="password"]').type(admin.password);

    cy.get('button[type="submit"]').click();

    cy.url({ timeout: 10000 }).should("include", "/dashboard");

    cy.get('[data-testid="header-dashboard-link"]').should("be.visible", {
      timeout: 2000,
    });
    cy.get('[data-testid="header-login-button"]').should("not.exist", {
      timeout: 2000,
    });
    cy.get('[data-testid="header-view-leave-requests-button"]').should(
      "be.visible",
      {
        timeout: 2000,
      },
    );
    cy.get('[data-testid="header-call-in-sick-button"]').should("not.exist", {
      timeout: 2000,
    });
    cy.get('[data-testid="header-make-leave-request-button"]').should(
      "not.exist",
      {
        timeout: 2000,
      },
    );
    cy.get('[data-testid="header-create-user-button"]').should("be.visible", {
      timeout: 2000,
    });

    cy.getCookie("better-auth.session_token").should("exist");
  });

  it("should successfully log in as OFFICE MANAGER from homepage, redirect to dashboard and show specific perms", () => {
    cy.get('[data-testid="header-login-button"]').click();

    cy.url().should("include", "/auth");
    cy.get("h1").contains("Sign In").should("be.visible");

    cy.get('input[name="email"]').type(officeManager.email);
    cy.get('input[name="password"]').type(officeManager.password);

    cy.get('button[type="submit"]').click();

    cy.url({ timeout: 10000 }).should("include", "/dashboard");

    cy.get('[data-testid="header-dashboard-link"]').should("be.visible", {
      timeout: 2000,
    });
    cy.get('[data-testid="header-login-button"]').should("not.exist", {
      timeout: 2000,
    });
    cy.get('[data-testid="header-view-leave-requests-button"]').should(
      "be.visible",
      {
        timeout: 2000,
      },
    );
    cy.get('[data-testid="header-call-in-sick-button"]').should("not.exist", {
      timeout: 2000,
    });
    cy.get('[data-testid="header-make-leave-request-button"]').should(
      "not.exist",
      {
        timeout: 2000,
      },
    );
    cy.get('[data-testid="header-create-user-button"]').should("be.visible", {
      timeout: 2000,
    });

    cy.getCookie("better-auth.session_token").should("exist");
  });

  it("should successfully log in as MANAGER from homepage, redirect to dashboard and show specific perms", () => {
    cy.get('[data-testid="header-login-button"]').click();

    cy.url().should("include", "/auth");
    cy.get("h1").contains("Sign In").should("be.visible");

    cy.get('input[name="email"]').type(manager.email);
    cy.get('input[name="password"]').type(manager.password);

    cy.get('button[type="submit"]').click();

    cy.url({ timeout: 10000 }).should("include", "/dashboard");

    cy.get('[data-testid="header-dashboard-link"]').should("be.visible", {
      timeout: 2000,
    });
    cy.get('[data-testid="header-login-button"]').should("not.exist", {
      timeout: 2000,
    });
    cy.get('[data-testid="header-view-leave-requests-button"]').should(
      "be.visible",
      {
        timeout: 2000,
      },
    );
    cy.get('[data-testid="header-call-in-sick-button"]').should("be.visible", {
      timeout: 2000,
    });
    cy.get('[data-testid="header-make-leave-request-button"]').should(
      "be.visible",
      {
        timeout: 2000,
      },
    );
    cy.get('[data-testid="header-create-user-button"]').should("not.exist", {
      timeout: 2000,
    });

    cy.getCookie("better-auth.session_token").should("exist");
  });

  const employee1 = {
    email: "employee1@email.com",
    password: "12345678",
    verified: true,
  };

  it("should successfully log in as a VERIFIED EMPLOYEE from homepage, redirect to dashboard and show specific perms", () => {
    cy.get('[data-testid="header-login-button"]').click();

    cy.url().should("include", "/auth");
    cy.get("h1").contains("Sign In").should("be.visible");

    cy.get('input[name="email"]').type(employee1.email);
    cy.get('input[name="password"]').type(employee1.password);

    cy.get('button[type="submit"]').click();

    cy.url({ timeout: 10000 }).should("include", "/dashboard");

    cy.get('[data-testid="header-dashboard-link"]').should("be.visible", {
      timeout: 2000,
    });
    cy.get('[data-testid="header-login-button"]').should("not.exist", {
      timeout: 2000,
    });
    cy.get('[data-testid="header-view-leave-requests-button"]').should(
      "not.exist",
      {
        timeout: 2000,
      },
    );
    cy.get('[data-testid="header-call-in-sick-button"]').should("be.visible", {
      timeout: 2000,
    });
    cy.get('[data-testid="header-make-leave-request-button"]').should(
      "be.visible",
      {
        timeout: 2000,
      },
    );
    cy.get('[data-testid="header-create-user-button"]').should("not.exist", {
      timeout: 2000,
    });

    cy.getCookie("better-auth.session_token").should("exist");
  });

  it("should show error message with invalid credentials when entering incorrect email & password", () => {
    cy.visit("/auth");

    cy.get('input[name="email"]').type("wrong@email.com");
    cy.get('input[name="password"]').type("wrongpassword");

    cy.get('button[type="submit"]').click();

    cy.get('[data-testid="error-message"]', { timeout: 10000 }).should(
      "be.visible",
    );
    cy.get('[data-testid="error-message"]').should(
      "have.text",
      "Invalid email or password",
    );

    cy.url().should("include", "/auth");
  });

  it("should show error message with invalid credentials when entering incorrect password", () => {
    cy.visit("/auth");

    cy.get('input[name="email"]').type("admin@email.com");
    cy.get('input[name="password"]').type("wrongpassword");

    cy.get('button[type="submit"]').click();

    cy.get('[data-testid="error-message"]', { timeout: 10000 }).should(
      "be.visible",
    );
    cy.get('[data-testid="error-message"]').should(
      "have.text",
      "Invalid email or password",
    );

    cy.url().should("include", "/auth");
  });

  it("should show error message with invalid credentials when entering incorrect email", () => {
    cy.visit("/auth");

    cy.get('input[name="email"]').type("notAdmin@email.com");
    cy.get('input[name="password"]').type("12345678");

    cy.get('button[type="submit"]').click();

    cy.get('[data-testid="error-message"]', { timeout: 10000 }).should(
      "be.visible",
    );
    cy.get('[data-testid="error-message"]').should(
      "have.text",
      "Invalid email or password",
    );

    cy.url().should("include", "/auth");
  });

  it("should successfully error of email not verified when logging in as a NON-VERIFIED EMPLOYEE from homepage", () => {
    cy.visit("/auth");

    cy.get('input[name="email"]').type(employee2.email);
    cy.get('input[name="password"]').type(employee2.password);

    cy.get('button[type="submit"]').click();

    cy.get('[data-testid="error-message"]', { timeout: 10000 }).should(
      "be.visible",
    );
    cy.get('[data-testid="error-message"]').should(
      "have.text",
      "Email not verified",
    );

    cy.url().should("include", "/auth");
  });
});
