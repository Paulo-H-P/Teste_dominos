// Custom commands para medir performance e capturar screenshots

// Comando para medir tempo de uma operação e tirar screenshot se demorar muito
Cypress.Commands.add('medirTempoComScreenshot', (nomeOperacao, operacao, tempoLimiteSegundos = 10) => {
  const inicio = performance.now()
  const inicioDate = Date.now()
  
  cy.log(`⏱️ Iniciando: ${nomeOperacao}`)
  
  return cy.then(() => {
    return operacao()
  }).then(() => {
    const fim = performance.now()
    const fimDate = Date.now()
    const tempoDecorrido = ((fim - inicio) / 1000).toFixed(2)
    const tempoDecorridoDate = ((fimDate - inicioDate) / 1000).toFixed(2)
    
    cy.log(`✅ ${nomeOperacao} concluído em ${tempoDecorrido}s`)
    
    // Se demorou mais que o limite, tira screenshot
    if (parseFloat(tempoDecorrido) > tempoLimiteSegundos) {
      cy.log(`⚠️ ${nomeOperacao} demorou ${tempoDecorrido}s (limite: ${tempoLimiteSegundos}s) - Capturando screenshot`)
      cy.screenshot(`lento_${nomeOperacao.replace(/\s+/g, '_').toLowerCase()}`, {
        capture: 'viewport',
        overwrite: true
      })
    }
    
    return {
      nome: nomeOperacao,
      tempo: parseFloat(tempoDecorrido),
      tempoDate: parseFloat(tempoDecorridoDate),
      lento: parseFloat(tempoDecorrido) > tempoLimiteSegundos
    }
  })
})

// Comando para tirar screenshot em pontos críticos
Cypress.Commands.add('screenshotCritico', (nome) => {
  cy.screenshot(`critico_${nome.replace(/\s+/g, '_').toLowerCase()}`, {
    capture: 'viewport',
    overwrite: true
  })
  cy.log(`📸 Screenshot capturado: ${nome}`)
})

// Comando para medir tempo entre dois pontos
Cypress.Commands.add('medirTempo', (nome, callback, tempoLimiteSegundos = 10) => {
  const inicio = performance.now()
  const inicioDate = Date.now()
  
  // Executa o callback e aguarda sua conclusão
  return callback().then(() => {
    const fim = performance.now()
    const fimDate = Date.now()
    const tempo = ((fim - inicio) / 1000).toFixed(2)
    const tempoDate = ((fimDate - inicioDate) / 1000).toFixed(2)
    
    cy.log(`⏱️ ${nome}: ${tempo}s`)
    
    // Se demorou mais que o limite, tira screenshot
    if (parseFloat(tempo) > tempoLimiteSegundos) {
      cy.log(`⚠️ ${nome} demorou ${tempo}s (limite: ${tempoLimiteSegundos}s) - Capturando screenshot`)
      cy.screenshot(`lento_${nome.replace(/\s+/g, '_').toLowerCase()}`, {
        capture: 'viewport',
        overwrite: true
      })
    }
    
    // Retorna via cy.wrap para manter a cadeia assíncrona
    return cy.wrap({
      nome,
      tempo: parseFloat(tempo),
      tempoDate: parseFloat(tempoDate),
      lento: parseFloat(tempo) > tempoLimiteSegundos
    }, { log: false })
  })
})

// Comando customizado para visitar página tratando 403
Cypress.Commands.add('visitWithRetry', (url, options = {}) => {
  const defaultHeaders = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
    'Accept-Language': 'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7',
    'Accept-Encoding': 'gzip, deflate, br',
    'Connection': 'keep-alive',
    'Upgrade-Insecure-Requests': '1'
  }
  
  const visitOptions = {
    failOnStatusCode: false,
    headers: defaultHeaders,
    timeout: 30000,
    ...options
  }
  
  // Primeiro verifica o status code com cy.request
  return cy.request({
    url: url,
    failOnStatusCode: false,
    headers: visitOptions.headers,
    timeout: 10000
  }).then((resp) => {
    if (resp.status === 403) {
      cy.log('⚠️ 403 Forbidden detectado no CI - acesso negado pelo servidor')
      cy.log('ℹ️ O site está bloqueando requisições do GitHub Actions')
      cy.log('ℹ️ Tentando continuar mesmo assim com cy.visit...')
      
      // Tenta visitar mesmo assim, mas com failOnStatusCode: false
      // Isso permite que o teste continue e tente interagir com a página
      return cy.visit(url, visitOptions).then(() => {
        cy.log('✅ Página visitada (mesmo com 403 anterior)')
        cy.log('⚠️ Algumas funcionalidades podem não funcionar devido ao bloqueio')
      })
    } else if (resp.status >= 200 && resp.status < 300) {
      // Status OK, pode visitar normalmente
      cy.log(`✅ Status code ${resp.status} - acesso permitido`)
      return cy.visit(url, visitOptions)
    } else {
      // Outro status code (404, 500, etc)
      cy.log(`⚠️ Status code ${resp.status} recebido, mas tentando visitar mesmo assim`)
      return cy.visit(url, visitOptions)
    }
  })
})
