const { defineConfig } = require('cypress')
const { allureCypress } = require('allure-cypress/reporter')

module.exports = defineConfig({
  e2e: {
    setupNodeEvents(on, config) {
      // Configuração do Allure
      allureCypress(on, config, { resultsDir: "allure-results" })
      return config
    },
    baseUrl: 'https://app.dominos.com.br',
    specPattern: 'cypress/e2e/**/*.cy.{js,jsx,ts,tsx}',
    supportFile: 'cypress/support/e2e.js',
    // Habilita Shadow DOM globalmente
    includeShadowDom: true,
    viewportWidth: 1280,
    viewportHeight: 720,
    video: false, // Desabilitado conforme solicitado
    screenshotOnRunFailure: true,
    screenshotsFolder: 'cypress/screenshots',
    defaultCommandTimeout: 10000,
    requestTimeout: 10000,
    responseTimeout: 10000,
    chromeWebSecurity: false,
  },
})
