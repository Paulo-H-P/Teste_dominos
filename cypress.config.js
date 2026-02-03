const { defineConfig } = require('cypress')
const { allureCypress } = require('allure-cypress/reporter')
require('dotenv').config()

module.exports = defineConfig({
  e2e: {
    setupNodeEvents(on, config) {
      allureCypress(on, config, { resultsDir: 'allure-results' })
      
      // Configuração do Qase Plugin (hooks) - O plugin envia os resultados automaticamente
      if (process.env.QASE_TOKEN && process.env.QASE_PROJECT_CODE) {
        try {
          const qasePlugin = require('cypress-qase-reporter/plugin')
          // Configura as opções do Qase no config.reporterOptions
          config.reporterOptions = config.reporterOptions || {}
          config.reporterOptions.cypressQaseReporterReporterOptions = {
            token: process.env.QASE_TOKEN,
            projectCode: process.env.QASE_PROJECT_CODE,
            runName: `E2E Tests - ${new Date().toISOString()}`,
            logging: true,
            basePath: 'https://api.qase.io/v1',
          }
          // Inicializa o plugin (hooks before:run e after:run)
          // O plugin automaticamente envia os resultados para o Qase após a execução
          qasePlugin(on, config)
          console.log('✅ Qase Plugin configurado - resultados serão enviados automaticamente após os testes')
        } catch (error) {
          console.warn('⚠️ Erro ao configurar Qase Plugin:', error.message)
        }
      } else {
        console.warn('⚠️ QASE_TOKEN ou QASE_PROJECT_CODE não configurados')
      }
      
      // Configura flags do Chrome para CI (Linux) - mais flags para melhorar conexão
      on('before:browser:launch', (browser = {}, launchOptions) => {
        if (browser.family === 'chromium' && browser.name !== 'electron') {
          launchOptions.args.push('--no-sandbox')
          launchOptions.args.push('--disable-dev-shm-usage')
          launchOptions.args.push('--disable-gpu')
          launchOptions.args.push('--disable-software-rasterizer')
          launchOptions.args.push('--disable-extensions')
          launchOptions.args.push('--disable-background-networking')
          launchOptions.args.push('--disable-background-timer-throttling')
          launchOptions.args.push('--disable-renderer-backgrounding')
          launchOptions.args.push('--disable-backgrounding-occluded-windows')
          launchOptions.args.push('--disable-ipc-flooding-protection')
        }
        return launchOptions
      })
      
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
    
    // Timeout de conexão do Chrome (aumentado para CI)
    execTimeout: 60000,

    chromeWebSecurity: false,
  },
})
