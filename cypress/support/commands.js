// cypress/support/commands.js

// =====================================================
// 1) Performance / screenshots
// =====================================================

// Mede tempo de uma operação e tira screenshot se exceder limite
Cypress.Commands.add('medirTempoComScreenshot', (nomeOperacao, operacao, tempoLimiteSegundos = 10) => {
  const inicio = performance.now()
  const inicioDate = Date.now()

  cy.log(`⏱️ Iniciando: ${nomeOperacao}`)

  return cy.then(() => operacao())
    .then(() => {
      const fim = performance.now()
      const fimDate = Date.now()
      const tempoDecorrido = ((fim - inicio) / 1000).toFixed(2)
      const tempoDecorridoDate = ((fimDate - inicioDate) / 1000).toFixed(2)

      cy.log(`✅ ${nomeOperacao} concluído em ${tempoDecorrido}s`)

      if (parseFloat(tempoDecorrido) > tempoLimiteSegundos) {
        cy.log(`⚠️ ${nomeOperacao} demorou ${tempoDecorrido}s (limite: ${tempoLimiteSegundos}s) - Screenshot`)
        cy.screenshot(`lento_${nomeOperacao.replace(/\s+/g, '_').toLowerCase()}`, {
          capture: 'viewport',
          overwrite: true
        })
      }

      return cy.wrap({
        nome: nomeOperacao,
        tempo: parseFloat(tempoDecorrido),
        tempoDate: parseFloat(tempoDecorridoDate),
        lento: parseFloat(tempoDecorrido) > tempoLimiteSegundos
      }, { log: false })
    })
})

Cypress.Commands.add('screenshotCritico', (nome) => {
  cy.screenshot(`critico_${nome.replace(/\s+/g, '_').toLowerCase()}`, {
    capture: 'viewport',
    overwrite: true
  })
  cy.log(`📸 Screenshot capturado: ${nome}`)
})

// Mede tempo envolvendo uma callback (mantém chain Cypress)
Cypress.Commands.add('medirTempo', (nome, callback, tempoLimiteSegundos = 10) => {
  const inicio = performance.now()
  const inicioDate = Date.now()

  return cy.then(() => callback())
    .then(() => {
      const fim = performance.now()
      const fimDate = Date.now()
      const tempo = ((fim - inicio) / 1000).toFixed(2)
      const tempoDate = ((fimDate - inicioDate) / 1000).toFixed(2)

      cy.log(`⏱️ ${nome}: ${tempo}s`)

      if (parseFloat(tempo) > tempoLimiteSegundos) {
        cy.log(`⚠️ ${nome} demorou ${tempo}s (limite: ${tempoLimiteSegundos}s) - Screenshot`)
        cy.screenshot(`lento_${nome.replace(/\s+/g, '_').toLowerCase()}`, {
          capture: 'viewport',
          overwrite: true
        })
      }

      return cy.wrap({
        nome,
        tempo: parseFloat(tempo),
        tempoDate: parseFloat(tempoDate),
        lento: parseFloat(tempo) > tempoLimiteSegundos
      }, { log: false })
    })
})


// =====================================================
// 2) Estabilização do app (Ionic/Angular) + overlays
// =====================================================

// Espera carregamento mínimo sem depender de seletor do front
Cypress.Commands.add('waitForAppReady', (opts = {}) => {
  const timeout = opts.timeout || 30000

  cy.document({ timeout }).its('readyState').should('eq', 'complete')

  // dupla RAF ajuda MUITO em CI (Ionic)
  cy.window({ timeout }).then((win) => {
    return new Cypress.Promise((resolve) => {
      win.requestAnimationFrame(() => win.requestAnimationFrame(resolve))
    })
  })

  cy.get('body', { timeout }).should('exist')
})

// Remove overlays/backdrops que travam clique (idempotente)
Cypress.Commands.add('dismissOverlays', () => {
  cy.window({ log: false }).then((win) => {
    try {
      // ion-backdrop
      const backdrops = win.document.querySelectorAll('ion-backdrop')
      backdrops.forEach((b) => {
        b.style.display = 'none'
        b.remove()
      })

      // cookie banner
      const cookie = win.document.querySelector('app-cookie-banner')
      if (cookie) {
        cookie.style.display = 'none'
        cookie.remove()
      }

      // modais (apenas “minimiza” sem quebrar teste)
      const modals = win.document.querySelectorAll('ion-modal, ion-alert, ion-popover')
      modals.forEach((m) => {
        m.style.display = 'none'
      })
    } catch (e) {
      // não falha por isso
    }
  })
})


// =====================================================
// 3) Navegação: 1 comando único e previsível
// =====================================================

/**
 * visitWithRetry(pathOrUrl, options)
 *
 * options:
 * - retries (default 2)
 * - timeout (default 60000)
 * - failOnStatusCode (default false)
 * - validate: function() -> cadeia Cypress (ex: waitForAppReady + dismissOverlays + asserts)
 */
Cypress.Commands.add('visitWithRetry', (pathOrUrl, options = {}) => {
  const baseUrl = Cypress.config('baseUrl') || ''
  const url = pathOrUrl.startsWith('http') ? pathOrUrl : `${baseUrl}${pathOrUrl}`

  const retries = Number(options.retries ?? 2)
  const timeout = Number(options.timeout ?? 60000)

  const visitOptions = {
    failOnStatusCode: false,
    timeout,
    ...options,
  }

  // validate default
  const validate = typeof options.validate === 'function'
    ? options.validate
    : () => {
        cy.waitForAppReady({ timeout })
        cy.dismissOverlays()
      }

  const attempt = (n) => {
    cy.log(`🌐 visitWithRetry: tentativa ${n + 1}/${retries + 1} -> ${url}`)

    cy.visit(url, visitOptions)

    cy.then(() => validate())

    cy.location('href', { timeout: 30000 }).then((href) => {
      cy.log(`✅ FINAL_URL: ${href}`)
    })
  }

  // retries sequenciais no pipeline Cypress
  for (let i = 0; i <= retries; i++) {
    cy.then(() => attempt(i))

    if (i < retries) {
      cy.then(() => {
        cy.log('🔁 Preparando retry: limpando overlays e aguardando...')
        cy.dismissOverlays()
      })
      cy.wait(1500, { log: false })
    }
  }
})


// =====================================================
// 4) Assertions / Compatibilidade com seus nomes antigos
// =====================================================

// Assert genérico de rota final (pathname contém o caminho esperado)
Cypress.Commands.add('assertFinalRoute', (expectedPathIncludes) => {
  cy.location('pathname', { timeout: 30000 }).should('include', expectedPathIncludes)
})

// Alias para compatibilidade com o nome antigo usado nos testes
// Ex.: cy.assertPath('/register')
Cypress.Commands.add('assertPath', (expectedPathIncludes) => {
  cy.assertFinalRoute(expectedPathIncludes)
})

// mantém compat com seu uso antigo
Cypress.Commands.add('waitForDocumentReady', () => {
  cy.waitForAppReady({ timeout: 20000 })
})

Cypress.Commands.add('waitForTitleIncludes', (text) => {
  cy.title({ timeout: 20000 }).should('include', text)
})
