const { defineConfig } = require('cypress')
const { allureCypress } = require('allure-cypress/reporter')

module.exports = defineConfig({
  e2e: {
    setupNodeEvents(on, config) {
      allureCypress(on, config, { resultsDir: 'allure-results' })
      return config
    },
    

    baseUrl: process.env.CYPRESS_BASE_URL || 'https://app.dominos.com.br',

    specPattern: 'cypress/e2e/**/*.cy.{js,jsx,ts,tsx}',
    supportFile: 'cypress/support/e2e.js',

    includeShadowDom: true,

    viewportWidth: 1280,
    viewportHeight: 720,

    video: false,
    screenshotOnRunFailure: true,
    screenshotsFolder: 'cypress/screenshots',

    retries: { runMode: 2, openMode: 0 },

    // Timeouts (definidos uma única vez)
    defaultCommandTimeout: 15000,
    pageLoadTimeout: 60000,
    requestTimeout: 20000,
    responseTimeout: 30000,

    chromeWebSecurity: false,
  },
})
