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

/**
 * waitForAppReady() - Versão robusta que valida se o app Ionic carregou
 * 
 * Verifica:
 * 1. Document ready state
 * 2. URL atual (log)
 * 3. Se há bloqueio/erro fora do app (screenshot + erro) - opcional via opts.checkBlocking
 * 4. Se o app Ionic (ion-app/ion-content) carregou
 * 5. Se não carregou, tenta reload uma vez
 * 
 * @param {Object} opts - Opções
 * @param {number} opts.timeout - Timeout em ms (default: 60000)
 * @param {boolean} opts.checkBlocking - Verificar bloqueios/erros (default: true)
 */
Cypress.Commands.add('waitForAppReady', (opts = {}) => {
  const timeout = opts.timeout || 60000
  // Se checkBlocking for explicitamente false, desabilita. Caso contrário, default é false (mais seguro)
  const checkBlocking = opts.checkBlocking === true

  // 1) Verifica document ready state
  cy.document({ timeout: 30000 }).its('readyState').should('eq', 'complete')

  // 2) Dá um tempo pro webview montar (principalmente em CI headless)
  cy.location('href', { timeout: 30000 }).then((href) => {
    cy.log(`🔗 URL atual: ${href}`)
  })

  // 3) Verifica se app Ionic existe primeiro (mais rápido)
  cy.get('body', { timeout: 30000 }).should('be.visible')
  
  // Só verifica bloqueios se checkBlocking for explicitamente true
  if (!checkBlocking) {
    cy.log('✅ Verificação de bloqueio desabilitada (checkBlocking: false)')
  } else {
    cy.document().then((doc) => {
      const hasIonApp = doc.querySelector('ion-app, ion-content, ion-page, app-root, [ng-version]')
      
      // Se app Ionic existe, não precisa verificar bloqueios
      if (hasIonApp) {
        cy.log('✅ App Ionic detectado - pulando verificação de bloqueio')
        return
      }
      
      // Se app Ionic não existe E checkBlocking está ativo, verifica bloqueios
      const html = doc.documentElement.innerText || ''
      const title = doc.title || ''
      cy.log(`📄 TITLE: ${title}`)
      cy.log(`⚠️ App Ionic não encontrado - verificando bloqueios...`)

      // Padrões mais específicos que realmente indicam bloqueio/erro
      const blockPatterns = [
        /access denied/i,
        /forbidden/i,
        /cloudflare.*challenge/i,
        /captcha.*required/i,
        /registro.*suspeito/i,
        /acesso.*bloqueado/i,
        /error 403/i,
        /error 404/i,
        /error 500/i,
        /error 502/i,
        /error 503/i,
        /error 504/i,
        /blocked.*by.*administrator/i,
        /your.*request.*has.*been.*blocked/i
      ]
      
      const hasBlockPattern = blockPatterns.some(pattern => pattern.test(html) || pattern.test(title))
      
      if (hasBlockPattern) {
        cy.screenshot('BLOQUEIO_OU_ERRO_FORA_DO_APP')
        cy.log(`🚫 Bloqueio detectado - HTML: ${html.substring(0, 200)}...`)
        throw new Error('Página fora do app (bloqueio/erro). Ver screenshot BLOQUEIO_OU_ERRO_FORA_DO_APP')
      }
    })
  }

  // 4) Dupla RAF ajuda MUITO em CI (Ionic) - com timeout de segurança
  cy.window({ timeout: 30000 }).then((win) => {
    return new Cypress.Promise((resolve) => {
      const safetyTimeout = setTimeout(() => {
        cy.log('⚠️ requestAnimationFrame timeout, resolvendo forçadamente')
        resolve()
      }, 2000)

      try {
        if (win.requestAnimationFrame) {
          win.requestAnimationFrame(() => {
            win.requestAnimationFrame(() => {
              clearTimeout(safetyTimeout)
              resolve()
            })
          })
        } else {
          clearTimeout(safetyTimeout)
          resolve()
        }
      } catch (e) {
        clearTimeout(safetyTimeout)
        cy.log(`⚠️ Erro em requestAnimationFrame: ${e.message}`)
        resolve()
      }
    })
  })

  // 5) Agora sim: espera o app Ionic aparecer
  cy.get('body', { timeout: 30000 }).should('be.visible')
  
  // 6) Tenta encontrar app Ionic com múltiplas estratégias
  cy.get('body', { timeout: 10000 }).then(($body) => {
    // Verifica múltiplos seletores do Ionic
    const hasIonApp = $body.find('ion-app, ion-content, ion-page, app-root, [ng-version]').length > 0
    
    if (!hasIonApp) {
      cy.log('⚠️ App Ionic não detectado, tentando reload...')
      cy.reload()
      cy.wait(3000)
      
      // Tenta novamente após reload
      cy.get('body', { timeout: 10000 }).then(($body2) => {
        const hasIonApp2 = $body2.find('ion-app, ion-content, ion-page, app-root, [ng-version]').length > 0
        if (!hasIonApp2) {
          cy.log('⚠️ App Ionic ainda não detectado após reload - continuando mesmo assim')
        }
      })
    }
  })
  
  // 7) Aguarda app Ionic estar presente (com fallback tolerante)
  // Tenta múltiplos seletores e não falha se nenhum for encontrado (apenas loga aviso)
  cy.get('body', { timeout: 5000 }).then(($body) => {
    const selectors = ['ion-app', 'ion-content', 'ion-page', 'app-root', '[ng-version]']
    let found = false
    
    for (const selector of selectors) {
      if ($body.find(selector).length > 0) {
        found = true
        cy.log(`✅ App detectado via: ${selector}`)
        break
      }
    }
    
    if (!found) {
      cy.log('⚠️ Nenhum seletor do app Ionic encontrado, mas continuando...')
      cy.log('⚠️ Isso pode indicar que o app ainda está carregando ou usa estrutura diferente')
    }
  })
  
  cy.log('✅ waitForAppReady concluído')
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
        cy.waitForAppReady({ timeout, checkBlocking: false })
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
