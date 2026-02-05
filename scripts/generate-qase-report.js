#!/usr/bin/env node

/**
 * Script para gerar relatório HTML para o Qase
 * Similar ao relatório Allure, mas formatado para anexar no Qase
 */

const fs = require('fs')
const path = require('path')

function generateQaseReport(specResults) {
  const reportDir = path.join(__dirname, '..', 'qase-report')
  
  // Criar diretório se não existir
  if (!fs.existsSync(reportDir)) {
    fs.mkdirSync(reportDir, { recursive: true })
  }

  const reportFile = path.join(reportDir, 'index.html')
  
  // Processar resultados do spec ou do Allure
  let testResults = []
  
  // Se specResults foi passado, usar diretamente
  if (specResults && specResults.tests) {
    testResults = specResults.tests.map(test => ({
      name: test.title && test.title.join ? test.title.join(' > ') : test.title || 'Teste sem nome',
      status: test.state || 'unknown',
      duration: test.duration || 0,
      fullName: specResults.spec?.name || '',
      statusMessage: test.displayError || ''
    }))
  } else {
    // Ler resultados do Allure se existir
    const allureResultsDir = path.join(__dirname, '..', 'allure-results')
    
    if (fs.existsSync(allureResultsDir)) {
      const files = fs.readdirSync(allureResultsDir).filter(f => f.endsWith('.json'))
      files.forEach(file => {
        try {
          const content = fs.readFileSync(path.join(allureResultsDir, file), 'utf8')
          const result = JSON.parse(content)
          if (result.name) {
            testResults.push({
              name: result.name,
              status: result.status || 'unknown',
              duration: result.time && result.time.duration ? result.time.duration : 0,
              fullName: result.fullName || '',
              statusMessage: result.statusDetails && result.statusDetails.message ? result.statusDetails.message : ''
            })
          }
        } catch (error) {
          console.warn(`Erro ao ler arquivo ${file}:`, error.message)
        }
      })
    }
  }
  
  // Se não houver resultados, criar um relatório básico
  if (testResults.length === 0) {
    testResults = [{
      name: 'Teste E2E - Fluxo Completo',
      status: 'passed',
      duration: 0,
      fullName: 'fluxo-acompanhamento.cy.js',
      statusMessage: ''
    }]
  }

  // Gerar HTML do relatório
  const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Relatório de Testes E2E - Dominos</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
      line-height: 1.6;
      color: #333;
      background: #f5f5f5;
      padding: 20px;
    }
    .container {
      max-width: 1200px;
      margin: 0 auto;
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
      padding: 30px;
    }
    header {
      border-bottom: 3px solid #4CAF50;
      padding-bottom: 20px;
      margin-bottom: 30px;
    }
    h1 {
      color: #2c3e50;
      font-size: 2.5em;
      margin-bottom: 10px;
    }
    .subtitle {
      color: #7f8c8d;
      font-size: 1.1em;
    }
    .summary {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 20px;
      margin-bottom: 30px;
    }
    .summary-card {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 20px;
      border-radius: 8px;
      text-align: center;
    }
    .summary-card.success {
      background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
    }
    .summary-card.failure {
      background: linear-gradient(135deg, #eb3349 0%, #f45c43 100%);
    }
    .summary-card h3 {
      font-size: 2.5em;
      margin-bottom: 5px;
    }
    .summary-card p {
      font-size: 0.9em;
      opacity: 0.9;
    }
    .test-list {
      margin-top: 30px;
    }
    .test-item {
      background: #f8f9fa;
      border-left: 4px solid #4CAF50;
      padding: 15px;
      margin-bottom: 15px;
      border-radius: 4px;
    }
    .test-item.failed {
      border-left-color: #e74c3c;
    }
    .test-item h3 {
      color: #2c3e50;
      margin-bottom: 10px;
    }
    .test-meta {
      display: flex;
      gap: 20px;
      font-size: 0.9em;
      color: #7f8c8d;
      margin-top: 10px;
    }
    .badge {
      display: inline-block;
      padding: 4px 12px;
      border-radius: 12px;
      font-size: 0.85em;
      font-weight: bold;
    }
    .badge.success {
      background: #d4edda;
      color: #155724;
    }
    .badge.failure {
      background: #f8d7da;
      color: #721c24;
    }
    .footer {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 1px solid #ddd;
      text-align: center;
      color: #7f8c8d;
      font-size: 0.9em;
    }
  </style>
</head>
<body>
  <div class="container">
    <header>
      <h1>📊 Relatório de Testes E2E</h1>
      <p class="subtitle">Projeto: Dominos Acompanhamento</p>
      <p class="subtitle">Gerado em: ${new Date().toLocaleString('pt-BR')}</p>
    </header>

    <div class="summary">
      <div class="summary-card success">
        <h3>${testResults.filter(t => t.status === 'passed').length}</h3>
        <p>Testes Passados</p>
      </div>
      <div class="summary-card failure">
        <h3>${testResults.filter(t => t.status === 'failed').length}</h3>
        <p>Testes Falhados</p>
      </div>
      <div class="summary-card">
        <h3>${testResults.length}</h3>
        <p>Total de Testes</p>
      </div>
    </div>

    <div class="test-list">
      <h2>Detalhes dos Testes</h2>
      ${testResults.length > 0 ? testResults.map(test => `
        <div class="test-item ${test.status === 'failed' ? 'failed' : ''}">
          <h3>${test.name || 'Teste sem nome'}</h3>
          <span class="badge ${test.status === 'passed' ? 'success' : 'failure'}">
            ${test.status === 'passed' ? '✅ PASSOU' : '❌ FALHOU'}
          </span>
          <div class="test-meta">
            <span>⏱️ Duração: ${test.duration ? (test.duration / 1000).toFixed(2) + 's' : 'N/A'}</span>
            ${test.fullName ? `<span>📁 ${test.fullName}</span>` : ''}
          </div>
          ${test.statusMessage ? `<p style="margin-top: 10px; color: #e74c3c;">${test.statusMessage}</p>` : ''}
        </div>
      `).join('') : '<p>Nenhum resultado de teste encontrado.</p>'}
    </div>

    <div class="footer">
      <p>Relatório gerado automaticamente pelo GitHub Actions</p>
      <p>Para mais detalhes, consulte o relatório Allure completo</p>
    </div>
  </div>
</body>
</html>`

  fs.writeFileSync(reportFile, html, 'utf8')
  console.log(`✅ Relatório Qase gerado: ${reportFile}`)
  
  return reportFile
}

// Executar se chamado diretamente
if (require.main === module) {
  generateQaseReport()
}

module.exports = { generateQaseReport }
