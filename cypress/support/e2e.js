// Import commands.js using CommonJS syntax:
require('./commands')

// Import Allure plugin
import 'allure-cypress'

Cypress.on("fail", (err, runnable) => {
    // loga o máximo possível
    Cypress.log({ name: "FAIL", message: err.message });
  
    // tenta registrar url final
    cy.location("href", { log: false }).then((href) => {
      Cypress.log({ name: "FINAL_URL", message: href });
    });
  
    throw err;
  });
  