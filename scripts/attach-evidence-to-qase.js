#!/usr/bin/env node

/**
 * Script para anexar vídeo e relatório HTML ao Qase como evidências
 */

const fs = require('fs')
const path = require('path')
const https = require('https')

require('dotenv').config()

const QASE_API_TOKEN = process.env.QASE_API_TOKEN || process.env.QASE_TOKEN
const QASE_PROJECT_CODE = process.env.QASE_PROJECT_CODE || 'DOMINOS'
const QASE_API_URL = 'https://api.qase.io/v1'

function uploadAttachment(filePath, runId, resultId) {
  return new Promise((resolve, reject) => {
    if (!fs.existsSync(filePath)) {
      reject(new Error(`Arquivo não encontrado: ${filePath}`))
      return
    }

    const fileContent = fs.readFileSync(filePath)
    const fileName = path.basename(filePath)
    const fileExtension = path.extname(filePath).toLowerCase()
    
    let mimeType = 'application/octet-stream'
    if (fileExtension === '.mp4') {
      mimeType = 'video/mp4'
    } else if (fileExtension === '.html') {
      mimeType = 'text/html'
    } else if (fileExtension === '.png') {
      mimeType = 'image/png'
    }

    const boundary = '----WebKitFormBoundary' + Math.random().toString(36).substring(2)
    const formData = []
    
    formData.push(`--${boundary}`)
    formData.push(`Content-Disposition: form-data; name="file"; filename="${fileName}"`)
    formData.push(`Content-Type: ${mimeType}`)
    formData.push('')
    formData.push(fileContent.toString('base64'))
    formData.push(`--${boundary}--`)

    const postData = Buffer.from(formData.join('\r\n'))

    const options = {
      hostname: 'api.qase.io',
      path: `/v1/attachment/${QASE_PROJECT_CODE}`,
      method: 'POST',
      headers: {
        'Token': QASE_API_TOKEN,
        'Content-Type': `multipart/form-data; boundary=${boundary}`,
        'Content-Length': postData.length
      }
    }

    const req = https.request(options, (res) => {
      let data = ''
      res.on('data', (chunk) => {
        data += chunk
      })
      res.on('end', () => {
        if (res.statusCode === 200 || res.statusCode === 201) {
          try {
            const response = JSON.parse(data)
            resolve(response)
          } catch (error) {
            resolve({ hash: data })
          }
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${data}`))
        }
      })
    })

    req.on('error', (error) => {
      reject(error)
    })

    req.write(postData)
    req.end()
  })
}

async function attachEvidenceToQase(specName, runId) {
  console.log('📎 Anexando evidências ao Qase...')
  
  const evidenceFiles = []
  
  // Verificar vídeo
  const videoPath = path.join('cypress', 'videos', `${specName}.mp4`)
  if (fs.existsSync(videoPath)) {
    evidenceFiles.push({ path: videoPath, type: 'video' })
    console.log(`✅ Vídeo encontrado: ${videoPath}`)
  } else {
    console.log(`⚠️ Vídeo não encontrado: ${videoPath}`)
  }
  
  // Verificar relatório HTML
  const reportPath = path.join('qase-report', 'index.html')
  if (fs.existsSync(reportPath)) {
    evidenceFiles.push({ path: reportPath, type: 'report' })
    console.log(`✅ Relatório HTML encontrado: ${reportPath}`)
  } else {
    console.log(`⚠️ Relatório HTML não encontrado: ${reportPath}`)
  }
  
  if (evidenceFiles.length === 0) {
    console.log('⚠️ Nenhuma evidência encontrada para anexar')
    return
  }
  
  console.log(`📎 Encontradas ${evidenceFiles.length} evidência(s) para anexar`)
  
  // Nota: O cypress-qase-reporter já faz o upload de anexos automaticamente
  // Este script é apenas para referência/logs
  console.log('💡 O cypress-qase-reporter anexará automaticamente os arquivos ao Qase')
}

// Executar se chamado diretamente
if (require.main === module) {
  const specName = process.argv[2] || 'fluxo-acompanhamento.cy.js'
  const runId = process.argv[3]
  attachEvidenceToQase(specName, runId)
    .then(() => console.log('✅ Processo concluído'))
    .catch(error => {
      console.error('❌ Erro:', error.message)
      process.exit(1)
    })
}

module.exports = { attachEvidenceToQase, uploadAttachment }
