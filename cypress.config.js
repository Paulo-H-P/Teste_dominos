const { defineConfig } = require('cypress')
const { allureCypress } = require('allure-cypress/reporter')
require('dotenv').config()
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { afterSpecHook } = require('cypress-qase-reporter/hooks')

module.exports = defineConfig({
  // Configuração do reporter - usando cypress-multi-reporters
  reporter: 'cypress-multi-reporters',
  reporterOptions: {
    reporterEnabled: 'cypress-qase-reporter',
    cypressQaseReporterReporterOptions: {
      mode: 'testops',  // 👈 ESSENCIAL: Ativa o envio ao Qase
      debug: true,      // Mostra logs detalhados (útil para debug)
      testops: {
        api: {
          token: process.env.QASE_API_TOKEN || process.env.QASE_TOKEN,
        },
        project: process.env.QASE_PROJECT_CODE,
        uploadAttachments: true,  // Envia screenshots e vídeos
        run: {
          complete: true,  // Marca o run como completo ao finalizar
          title: process.env.QASE_RUN_TITLE || 'Automated Test Run',
          description: process.env.QASE_RUN_DESCRIPTION || 'Testes automatizados E2E',
        },
        createTestCases: true,  // 👈 Cria casos automaticamente se não existirem
      },
      framework: {
        cypress: {
          screenshotsFolder: 'cypress/screenshots',
          videosFolder: 'cypress/videos',
          uploadDelay: 10,  // Delay entre uploads (segundos)
          uploadVideos: true,  // Habilitado para enviar vídeos como evidência
        },
      },
    },
  },

  e2e: {
    setupNodeEvents(on, config) {
      allureCypress(on, config, { resultsDir: 'allure-results' })
      
      // ✅ Debug de variáveis de ambiente (útil para verificar configuração)
      console.log('📋 Configuração do Qase:')
      console.log(`   QASE_MODE: ${process.env.QASE_MODE || '❌ Não configurado (deve ser "testops")'}`)
      console.log(`   QASE_API_TOKEN: ${process.env.QASE_API_TOKEN || process.env.QASE_TOKEN ? '✅ Configurado' : '❌ Não configurado'}`)
      console.log(`   QASE_PROJECT_CODE: ${process.env.QASE_PROJECT_CODE || '❌ Não configurado'}`)
      
      if (process.env.QASE_MODE !== 'testops') {
        console.warn('⚠️ ATENÇÃO: QASE_MODE deve ser "testops" para enviar resultados ao Qase!')
      }
      
      // 📁 Registrar plugins do Cypress
      require('cypress-qase-reporter/plugin')(on, config)
      require('cypress-qase-reporter/metadata')(on, config)
      
      // ✅ Envio dos resultados ao Qase ao final de cada spec
      on('after:spec', (spec, results) => {
        if (process.env.QASE_API_TOKEN || process.env.QASE_TOKEN) {
          const fs = require('fs')
          const path = require('path')
          
          // Gerar relatório HTML para o Qase
          try {
            const { generateQaseReport } = require('./scripts/generate-qase-report')
            generateQaseReport(results)
            console.log('✅ Relatório HTML gerado para anexar no Qase')
            
            // Copiar relatório para pasta de screenshots para ser anexado pelo Qase
            const reportPath = path.join('qase-report', 'index.html')
            const screenshotsDir = path.join('cypress', 'screenshots')
            const reportDest = path.join(screenshotsDir, 'qase-report.html')
            
            if (fs.existsSync(reportPath)) {
              if (!fs.existsSync(screenshotsDir)) {
                fs.mkdirSync(screenshotsDir, { recursive: true })
              }
              fs.copyFileSync(reportPath, reportDest)
              console.log(`📄 Relatório copiado para screenshots: ${reportDest}`)
            }
          } catch (error) {
            console.warn('⚠️ Erro ao gerar/copiar relatório HTML:', error.message)
          }

          // Verificar se vídeo foi gerado
          const videoPath = path.join('cypress', 'videos', `${spec.name}.mp4`)
          if (fs.existsSync(videoPath)) {
            const stats = fs.statSync(videoPath)
            const sizeMB = (stats.size / (1024 * 1024)).toFixed(2)
            console.log(`📹 Vídeo encontrado (${sizeMB} MB) e será anexado automaticamente: ${videoPath}`)
          } else {
            console.log(`⚠️ Vídeo não encontrado: ${videoPath}`)
          }

          return afterSpecHook(spec, config)
            .then(() => {
              console.log(`✅ Resultados enviados ao Qase com sucesso: ${spec.name}`)
              console.log('📎 Vídeo e relatório HTML serão anexados automaticamente pelo cypress-qase-reporter')
            })
            .catch((err) => {
              console.error(`❌ Erro ao enviar resultados para Qase: ${(err && err.message) || err}`)
            })
        } else {
          console.log('⚠️ Qase.io não configurado. Defina QASE_API_TOKEN e QASE_PROJECT_CODE no arquivo .env')
        }
      })
      
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
    

    baseUrl: process.env.CYPRESS_BASE_URL || 'https://site-n1.prd-d.ws01.mobi',

    specPattern: 'cypress/e2e/**/*.cy.{js,jsx,ts,tsx}',
    supportFile: 'cypress/support/e2e.js',

    includeShadowDom: true,

    // Desabilitar isolamento entre testes para manter estado da sessão entre it blocks
    testIsolation: false,

    viewportWidth: 1280,
    viewportHeight: 720,

    video: true,  // Habilitado para gerar vídeos como evidência
    videosFolder: 'cypress/videos',
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
