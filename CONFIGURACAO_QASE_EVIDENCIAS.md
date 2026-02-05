# 📎 Configuração de Evidências no Qase

## ✅ Configurações Aplicadas

### 1. Vídeo Habilitado
- **Configuração:** `video: true` no `cypress.config.js`
- **Localização:** `cypress/videos/`
- **Upload:** Habilitado automaticamente pelo `cypress-qase-reporter` quando `uploadVideos: true`

### 2. Relatório HTML
- **Script:** `scripts/generate-qase-report.js`
- **Localização:** `qase-report/index.html`
- **Formato:** HTML estilizado similar ao relatório Allure
- **Upload:** Copiado para `cypress/screenshots/` para ser anexado automaticamente

### 3. Configuração do Qase Reporter
```javascript
uploadAttachments: true,  // Envia screenshots e vídeos
uploadVideos: true,       // Envia vídeos como evidência
```

## 📋 Estrutura de Arquivos

```
projeto/
├── cypress/
│   ├── videos/
│   │   └── fluxo-acompanhamento.cy.js.mp4  # Vídeo do teste
│   └── screenshots/
│       ├── qase-report.html                 # Relatório HTML (copiado)
│       └── [screenshots dos testes]
├── qase-report/
│   └── index.html                           # Relatório HTML gerado
└── scripts/
    ├── generate-qase-report.js               # Gera relatório HTML
    └── attach-evidence-to-qase.js           # Script auxiliar
```

## 🔄 Fluxo de Funcionamento

1. **Execução do Teste:**
   - Cypress executa o teste
   - Grava vídeo automaticamente (se `video: true`)
   - Captura screenshots em caso de falha

2. **Geração do Relatório:**
   - Hook `after:spec` é executado
   - Script `generate-qase-report.js` gera relatório HTML
   - Relatório é copiado para `cypress/screenshots/`

3. **Upload para Qase:**
   - `cypress-qase-reporter` envia resultados
   - Anexa automaticamente:
     - ✅ Vídeo do teste
     - ✅ Screenshots capturados
     - ✅ Relatório HTML (se estiver em `screenshots/`)

## 📊 Conteúdo do Relatório HTML

O relatório inclui:
- ✅ Resumo de testes (passados/falhados/total)
- ✅ Detalhes de cada teste
- ✅ Status e duração
- ✅ Mensagens de erro (se houver)
- ✅ Estilo visual similar ao Allure

## 🎯 Verificação no Qase

Após a execução, no Qase você verá:
1. **Test Run** criado com os resultados
2. **Vídeo** anexado como evidência
3. **Screenshots** anexados como evidência
4. **Relatório HTML** anexado como evidência (se configurado)

## ⚙️ Configurações no Workflow GitHub Actions

O workflow já está configurado para:
- ✅ Gerar relatório HTML após os testes
- ✅ Verificar se vídeos foram gerados
- ✅ Copiar relatório para pasta de screenshots

## 🔍 Troubleshooting

### Vídeo não está sendo anexado
- Verifique se `video: true` está no `cypress.config.js`
- Verifique se `uploadVideos: true` está na configuração do Qase
- Verifique se o vídeo foi gerado em `cypress/videos/`

### Relatório não está sendo anexado
- Verifique se o script `generate-qase-report.js` foi executado
- Verifique se o relatório foi copiado para `cypress/screenshots/`
- Verifique os logs do workflow para erros

### Tamanho do vídeo muito grande
- Considere reduzir a qualidade do vídeo nas configurações do Cypress
- Ou desabilitar vídeo para testes mais rápidos
