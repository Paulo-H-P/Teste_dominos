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
