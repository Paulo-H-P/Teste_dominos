# Tutorial Completo: Importação de Casos de Teste Automatizados para o Qase.io

Este tutorial fornece um guia passo a passo detalhado para configurar e importar casos de teste automatizados para o Qase.io, permitindo que você replique este processo em outros projetos.

## 📋 Índice

1. [Visão Geral](#visão-geral)
2. [Pré-requisitos](#pré-requisitos)
3. [Configuração Inicial no Qase.io](#configuração-inicial-no-qaseio)
4. [Instalação de Dependências](#instalação-de-dependências)
5. [Configuração de Variáveis de Ambiente](#configuração-de-variáveis-de-ambiente)
6. [Estrutura de Arquivos](#estrutura-de-arquivos)
7. [Formato dos Casos de Teste](#formato-dos-casos-de-teste)
8. [Scripts de Conversão](#scripts-de-conversão)
9. [Scripts de Importação](#scripts-de-importação)
10. [Fluxo Completo de Uso](#fluxo-completo-de-uso)
11. [Troubleshooting](#troubleshooting)
12. [Exemplos Práticos](#exemplos-práticos)

---

## 🎯 Visão Geral

O processo de importação consiste em três etapas principais:

1. **Extração/Conversão**: Converter seus casos de teste do formato atual (Cypress, JSON, etc.) para o formato JSON esperado pelo Qase
2. **Preparação**: Salvar os casos convertidos no arquivo `.qase/cases.json`
3. **Importação**: Enviar os casos para o Qase.io via API

---

## 📦 Pré-requisitos

Antes de começar, certifique-se de ter:

- **Node.js** instalado (versão 20.x ou superior recomendada)
- **npm** ou **yarn** como gerenciador de pacotes
- Uma conta no [Qase.io](https://qase.io) (plano gratuito ou pago)
- Acesso ao projeto no Qase.io onde deseja importar os casos
- Casos de teste em formato estruturado (Cypress, JSON, Gherkin, etc.)

---

## 🔧 Configuração Inicial no Qase.io

### Passo 1: Criar Conta no Qase.io

1. Acesse [https://qase.io](https://qase.io)
2. Clique em **"Sign Up"** ou **"Get Started"**
3. Preencha o formulário de cadastro
4. Confirme seu email (se necessário)

### Passo 2: Criar um Projeto

1. Após fazer login, clique em **"Create Project"** ou **"New Project"**
2. Preencha os dados do projeto:
   - **Project Name**: Nome do seu projeto (ex: "Facility App")
   - **Project Code**: Código único do projeto (ex: "FACILITY") - **IMPORTANTE**: Este código será usado nas variáveis de ambiente
   - **Description**: Descrição opcional do projeto
3. Clique em **"Create"**

### Passo 3: Obter o Token de API

1. No Qase.io, clique no ícone do seu perfil (canto superior direito)
2. Selecione **"Settings"** ou **"Account Settings"**
3. No menu lateral, clique em **"API Tokens"** ou **"Tokens"**
4. Clique em **"Create Token"** ou **"Generate New Token"**
5. Dê um nome descritivo ao token (ex: "Import Script - Facility")
6. Selecione as permissões necessárias:
   - ✅ **Read** (para verificar projetos)
   - ✅ **Write** (para criar casos de teste)
7. Clique em **"Create"** ou **"Generate"**
8. **COPIE O TOKEN IMEDIATAMENTE** - ele não será exibido novamente!
   - Exemplo de token: `6f64b77fa96d3dfdd944ebda64a7a666f531dab44cd389fde3a717bad2e73c4f`

⚠️ **IMPORTANTE**: Guarde este token em local seguro. Você precisará dele na próxima etapa.

---

## 📥 Instalação de Dependências

### Passo 1: Instalar Dependências Necessárias

No diretório raiz do seu projeto, execute:

```bash
npm install --save-dev dotenv node-fetch
```

Ou se estiver usando yarn:

```bash
yarn add -D dotenv node-fetch
```

**Explicação das dependências:**
- **dotenv**: Carrega variáveis de ambiente de um arquivo `.env`
- **node-fetch**: Permite fazer requisições HTTP para a API do Qase (necessário para Node.js < 18)

### Passo 2: Verificar Instalação

Verifique se as dependências foram instaladas corretamente:

```bash
npm list dotenv node-fetch
```

Você deve ver algo como:

```
facility_com_br_app@0.0.1
├── dotenv@17.2.3
└── node-fetch@2.7.0
```

---

## 🔐 Configuração de Variáveis de Ambiente

### Passo 1: Criar Arquivo `.env`

No diretório raiz do projeto, crie um arquivo chamado `.env`:

```bash
# Windows (PowerShell)
New-Item -Path .env -ItemType File

# Linux/Mac
touch .env
```

### Passo 2: Adicionar Variáveis de Ambiente

Abra o arquivo `.env` e adicione as seguintes variáveis:

```env
# Token de API do Qase.io (obtido na etapa anterior)
QASE_API_TOKEN=seu_token_aqui

# Código do projeto no Qase (ex: FACILITY, MYPROJECT, etc.)
QASE_PROJECT_CODE=FACILITY

# Opcional: Token alternativo (se você usar nomes diferentes)
QASE_CASES_TOKEN=seu_token_aqui
```

**Exemplo real:**

```env
QASE_API_TOKEN=6f64b77fa96d3dfdd944ebda64a7a666f531dab44cd389fde3a717bad2e73c4f
QASE_PROJECT_CODE=FACILITY
```

### Passo 3: Adicionar `.env` ao `.gitignore`

⚠️ **IMPORTANTE**: Nunca commite o arquivo `.env` no repositório!

Adicione ao seu `.gitignore`:

```gitignore
# Environment variables
.env
.env.local
.env.*.local
```

### Passo 4: Criar Arquivo `.env.example` (Opcional mas Recomendado)

Crie um arquivo `.env.example` como template:

```env
QASE_API_TOKEN=your_api_token_here
QASE_PROJECT_CODE=YOUR_PROJECT_CODE
```

Este arquivo pode ser commitado no repositório como referência para outros desenvolvedores.

---

## 📁 Estrutura de Arquivos

Crie a seguinte estrutura de diretórios no seu projeto:

```
seu-projeto/
├── .env                          # Variáveis de ambiente (NÃO commitar)
├── .env.example                  # Template de variáveis (pode commitar)
├── .gitignore                    # Deve incluir .env
├── package.json                  # Dependências do projeto
├── scripts/                      # Scripts de conversão e importação
│   ├── import-cases.js          # Script principal de importação
│   ├── convert-to-qase.js       # Script de conversão (exemplo)
│   └── ...                      # Outros scripts conforme necessário
└── .qase/                       # Diretório para casos convertidos
    └── cases.json               # Casos de teste no formato Qase
```

### Criando a Estrutura

```bash
# Criar diretório de scripts (se não existir)
mkdir -p scripts

# Criar diretório .qase (se não existir)
mkdir -p .qase
```

---

## 📝 Formato dos Casos de Teste

O Qase.io espera casos de teste em formato JSON específico. Cada caso deve seguir esta estrutura:

### Estrutura Básica

```json
{
  "title": "Título do caso de teste",
  "description": "Descrição detalhada do caso",
  "preconditions": "Pré-condições (opcional)",
  "postconditions": "Pós-condições (opcional)",
  "severity": "critical|major|normal|minor|trivial",
  "priority": "high|medium|low",
  "tags": ["tag1", "tag2", "tag3"],
  "steps": [
    {
      "action": "Ação a ser executada",
      "expected_result": "Resultado esperado"
    }
  ]
}
```

### Exemplo Completo

```json
{
  "title": "Login com credenciais válidas",
  "description": "Verificar se o usuário consegue fazer login com email e senha corretos",
  "preconditions": "Usuário deve estar cadastrado no sistema",
  "postconditions": "Usuário deve estar autenticado e redirecionado para o dashboard",
  "severity": "normal",
  "priority": "high",
  "tags": ["login", "autenticação", "smoke"],
  "steps": [
    {
      "action": "Given que estou na página de login",
      "expected_result": ""
    },
    {
      "action": "When preencho o campo email com 'usuario@exemplo.com'",
      "expected_result": ""
    },
    {
      "action": "And preencho o campo senha com 'senha123'",
      "expected_result": ""
    },
    {
      "action": "And clico no botão 'Entrar'",
      "expected_result": ""
    },
    {
      "action": "Then devo ser redirecionado para o dashboard",
      "expected_result": "devo ser redirecionado para o dashboard"
    },
    {
      "action": "And devo ver a mensagem 'Bem-vindo'",
      "expected_result": "devo ver a mensagem 'Bem-vindo'"
    }
  ]
}
```

### Valores Válidos

**Severity:**
- `critical` → Severidade 1 (mais crítica)
- `major` → Severidade 2
- `normal` → Severidade 3 (padrão)
- `minor` → Severidade 4
- `trivial` → Severidade 5 (menos crítica)

**Priority:**
- `high` → Prioridade 1 (mais alta)
- `medium` → Prioridade 2 (padrão)
- `low` → Prioridade 3 (mais baixa)

### Arquivo Completo: `.qase/cases.json`

O arquivo `.qase/cases.json` deve ser um **array** de casos:

```json
[
  {
    "title": "Caso de teste 1",
    "description": "Descrição 1",
    "severity": "normal",
    "priority": "medium",
    "tags": ["tag1"],
    "steps": []
  },
  {
    "title": "Caso de teste 2",
    "description": "Descrição 2",
    "severity": "normal",
    "priority": "medium",
    "tags": ["tag2"],
    "steps": []
  }
]
```

---

## 🔄 Scripts de Conversão

Os scripts de conversão transformam seus casos de teste do formato original para o formato JSON do Qase.

### Exemplo: Script de Conversão Básico

Crie o arquivo `scripts/convert-to-qase.js`:

```javascript
#!/usr/bin/env node

/**
 * Script para converter casos de teste para o formato esperado pelo Qase.io
 * 
 * Uso: node scripts/convert-to-qase.js
 */

const fs = require('fs');
const path = require('path');

// Função para converter script Gherkin em steps
function parseGherkinScript(script) {
  if (!script) return [];
  
  const lines = script.split('\n').map(line => line.trim()).filter(line => line);
  const steps = [];
  
  for (const line of lines) {
    if (line.startsWith('Feature:') || line.startsWith('Scenario:')) {
      // Feature e Scenario são usados como description
      continue;
    } else if (line.match(/^(Given|When|Then|And|But)\s+/i)) {
      // Extrair o prefixo e o conteúdo
      const match = line.match(/^(Given|When|Then|And|But)\s+(.+)$/i);
      if (match) {
        const prefix = match[1];
        const content = match[2];
        
        // Para Then, And, But - o conteúdo é o resultado esperado
        // Para Given, When - o conteúdo é a ação
        const isExpectedResult = /^(Then|And|But)/i.test(prefix);
        
        steps.push({
          action: line,
          expected_result: isExpectedResult ? content : ''
        });
      }
    }
  }
  
  return steps;
}

// Função principal
function main() {
  console.log('🔄 Convertendo casos de teste para formato Qase...\n');
  
  // 1. Ler arquivo de origem (ajuste o caminho conforme seu caso)
  const sourceFile = path.join(__dirname, '..', 'cypress', 'e2e', 'meus-testes.json');
  
  if (!fs.existsSync(sourceFile)) {
    console.error('❌ Arquivo de origem não encontrado!');
    process.exit(1);
  }
  
  // 2. Carregar dados de origem
  let sourceData;
  try {
    const fileContent = fs.readFileSync(sourceFile, 'utf8');
    sourceData = JSON.parse(fileContent);
  } catch (error) {
    console.error(`❌ Erro ao ler arquivo: ${error.message}`);
    process.exit(1);
  }
  
  // 3. Validar formato
  if (!Array.isArray(sourceData) && !sourceData.cases) {
    console.error('❌ Formato inválido: arquivo deve conter um array ou objeto com propriedade "cases"');
    process.exit(1);
  }
  
  const cases = Array.isArray(sourceData) ? sourceData : sourceData.cases;
  
  // 4. Converter casos
  const convertedCases = cases.map((testCase) => {
    const steps = parseGherkinScript(testCase.script || testCase.gherkin);
    const description = testCase.description || testCase.script || testCase.title;
    
    return {
      title: testCase.title,
      description: description,
      preconditions: testCase.preconditions || '',
      postconditions: testCase.postconditions || '',
      severity: testCase.severity || 'normal',
      priority: testCase.priority || 'medium',
      tags: testCase.tags || [],
      steps: steps
    };
  });
  
  console.log(`✅ Processados ${convertedCases.length} casos\n`);
  
  // 5. Salvar no arquivo .qase/cases.json
  const outputFile = path.join(__dirname, '..', '.qase', 'cases.json');
  const outputDir = path.dirname(outputFile);
  
  // Criar diretório se não existir
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  try {
    fs.writeFileSync(outputFile, JSON.stringify(convertedCases, null, 2), 'utf8');
    console.log(`✅ Conversão concluída!`);
    console.log(`📋 ${convertedCases.length} casos convertidos`);
    console.log(`📁 Arquivo salvo em: ${outputFile}\n`);
    console.log('💡 Execute "node scripts/import-cases.js" para importar os casos para o Qase.io');
  } catch (error) {
    console.error(`❌ Erro ao salvar arquivo: ${error.message}`);
    process.exit(1);
  }
}

// Executar script
if (require.main === module) {
  main();
}

module.exports = { main };
```

### Adaptando o Script para Seu Formato

Você precisará adaptar o script conforme o formato dos seus casos de teste:

1. **Se seus casos estão em arquivos Cypress (.cy.js):**
   - Você precisará extrair os testes usando um parser de AST ou regex
   - Ou criar um formato intermediário JSON primeiro

2. **Se seus casos estão em formato Gherkin (.feature):**
   - Use uma biblioteca como `gherkin` para fazer o parse
   - Instale: `npm install gherkin`

3. **Se seus casos estão em formato JSON customizado:**
   - Ajuste a função de conversão para mapear os campos corretos

---

## 📤 Scripts de Importação

O script de importação envia os casos convertidos para o Qase.io via API.

### Script Principal: `scripts/import-cases.js`

Crie o arquivo `scripts/import-cases.js`:

```javascript
#!/usr/bin/env node

/**
 * Script para importar casos de teste do arquivo .qase/cases.json para o Qase.io
 * 
 * Uso: node scripts/import-cases.js
 * 
 * Requer variáveis de ambiente:
 * - QASE_API_TOKEN: Token de API do Qase
 * - QASE_PROJECT_CODE: Código do projeto no Qase
 */

const fs = require('fs');
const path = require('path');

// Carregar variáveis de ambiente do arquivo .env
try {
  require('dotenv').config();
} catch (error) {
  // dotenv não está instalado ou não há arquivo .env
}

// Configurações
const QASE_API_TOKEN = process.env.QASE_CASES_TOKEN || process.env.QASE_API_TOKEN;
const QASE_PROJECT_CODE = process.env.QASE_PROJECT_CODE;
const QASE_API_URL = 'https://api.qase.io/v1';

// Validar configurações
if (!QASE_API_TOKEN) {
  console.error('❌ Erro: QASE_API_TOKEN não encontrado nas variáveis de ambiente!');
  console.error('💡 Crie um arquivo .env com QASE_API_TOKEN=seu_token');
  process.exit(1);
}

if (!QASE_PROJECT_CODE) {
  console.error('❌ Erro: QASE_PROJECT_CODE não encontrado nas variáveis de ambiente!');
  console.error('💡 Crie um arquivo .env com QASE_PROJECT_CODE=seu_codigo');
  process.exit(1);
}

// Cores para output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// Função para fazer requisições HTTP
async function makeRequest(url, options = {}) {
  // Para Node.js 18+, use fetch nativo
  // Para versões anteriores, use node-fetch
  let fetch;
  try {
    fetch = (await import('node-fetch')).default;
  } catch (error) {
    // Node.js 18+ tem fetch nativo
    fetch = global.fetch;
  }
  
  const defaultOptions = {
    headers: {
      'Token': QASE_API_TOKEN,
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    }
  };

  const mergedOptions = { ...defaultOptions, ...options };
  
  try {
    const response = await fetch(url, mergedOptions);
    const data = await response.json();
    
    if (!response.ok) {
      console.log(`❌ Detalhes do erro HTTP ${response.status}:`, JSON.stringify(data, null, 2));
      throw new Error(`HTTP ${response.status}: ${data.error || data.errorMessage || 'Unknown error'}`);
    }
    
    return data;
  } catch (error) {
    throw new Error(`Request failed: ${error.message}`);
  }
}

// Função para mapear valores de severity e priority
function mapSeverity(severity) {
  const severityMap = {
    'critical': 1,
    'major': 2,
    'normal': 3,
    'minor': 4,
    'trivial': 5
  };
  return severityMap[severity] || 3;
}

function mapPriority(priority) {
  const priorityMap = {
    'high': 1,
    'medium': 2,
    'low': 3
  };
  return priorityMap[priority] || 2;
}

// Função para criar um caso de teste
async function createTestCase(testCase) {
  const url = `${QASE_API_URL}/case/${QASE_PROJECT_CODE}`;
  
  const payload = {
    title: testCase.title,
    description: testCase.description || '',
    preconditions: testCase.preconditions || '',
    postconditions: testCase.postconditions || '',
    severity: mapSeverity(testCase.severity),
    priority: mapPriority(testCase.priority),
    tags: testCase.tags || [],
    steps: testCase.steps || []
  };

  try {
    const result = await makeRequest(url, {
      method: 'POST',
      body: JSON.stringify(payload)
    });
    
    return result;
  } catch (error) {
    throw new Error(`Failed to create test case "${testCase.title}": ${error.message}`);
  }
}

// Função para verificar se o projeto existe
async function checkProject() {
  try {
    const url = `${QASE_API_URL}/project/${QASE_PROJECT_CODE}`;
    await makeRequest(url);
    return true;
  } catch (error) {
    return false;
  }
}

// Função principal
async function main() {
  log('🚀 Iniciando importação de casos de teste para o Qase.io', 'bright');
  log(`📁 Projeto: ${QASE_PROJECT_CODE}`, 'blue');
  log(`🔑 Token: ${QASE_API_TOKEN.substring(0, 10)}...`, 'blue');
  
  // Verificar se o arquivo existe
  const casesFile = path.join(__dirname, '..', '.qase', 'cases.json');
  
  if (!fs.existsSync(casesFile)) {
    log('❌ Arquivo .qase/cases.json não encontrado!', 'red');
    log('💡 Execute primeiro o script de conversão para gerar o arquivo cases.json', 'yellow');
    process.exit(1);
  }
  
  // Carregar casos de teste
  let testCases;
  try {
    const fileContent = fs.readFileSync(casesFile, 'utf8');
    testCases = JSON.parse(fileContent);
  } catch (error) {
    log(`❌ Erro ao ler arquivo .qase/cases.json: ${error.message}`, 'red');
    process.exit(1);
  }
  
  if (!Array.isArray(testCases) || testCases.length === 0) {
    log('❌ Nenhum caso de teste encontrado no arquivo!', 'red');
    process.exit(1);
  }
  
  log(`📋 Encontrados ${testCases.length} casos de teste`, 'green');
  
  // Verificar se o projeto existe
  log('🔍 Verificando projeto no Qase...', 'yellow');
  const projectExists = await checkProject();
  
  if (!projectExists) {
    log(`❌ Projeto "${QASE_PROJECT_CODE}" não encontrado no Qase!`, 'red');
    log('💡 Verifique se o código do projeto está correto e se você tem acesso a ele.', 'yellow');
    process.exit(1);
  }
  
  log('✅ Projeto encontrado!', 'green');
  
  // Importar casos de teste
  let successCount = 0;
  let errorCount = 0;
  
  log(`\n📝 Importando ${testCases.length} casos...\n`, 'bright');
  
  for (let i = 0; i < testCases.length; i++) {
    const testCase = testCases[i];
    
    try {
      log(`📝 Criando caso ${i + 1}/${testCases.length}: "${testCase.title}"`, 'cyan');
      
      const result = await createTestCase(testCase);
      
      if (result.result && result.result.id) {
        log(`✅ Caso criado com sucesso! ID: ${result.result.id}`, 'green');
        successCount++;
      } else {
        log(`⚠️ Caso criado mas sem ID retornado`, 'yellow');
        successCount++;
      }
      
      // Pequena pausa entre requisições para não sobrecarregar a API
      await new Promise(resolve => setTimeout(resolve, 500));
      
    } catch (error) {
      log(`❌ Erro ao criar caso "${testCase.title}": ${error.message}`, 'red');
      errorCount++;
    }
  }
  
  // Resumo final
  log('\n📊 Resumo da importação:', 'bright');
  log(`✅ Casos criados com sucesso: ${successCount}`, 'green');
  log(`❌ Casos com erro: ${errorCount}`, 'red');
  log(`📋 Total processado: ${testCases.length}`, 'blue');
  
  if (successCount > 0) {
    log(`\n🎉 Importação concluída!`, 'green');
    log(`🔗 Acesse: https://app.qase.io/project/${QASE_PROJECT_CODE}/cases`, 'green');
  }
  
  if (errorCount > 0) {
    log(`\n⚠️ Alguns casos falharam. Verifique os erros acima.`, 'yellow');
    process.exit(1);
  }
}

// Executar script
if (require.main === module) {
  main().catch(error => {
    log(`💥 Erro fatal: ${error.message}`, 'red');
    process.exit(1);
  });
}

module.exports = { main };
```

### Adicionar Scripts ao package.json

Adicione os scripts ao seu `package.json`:

```json
{
  "scripts": {
    "qase:convert": "node scripts/convert-to-qase.js",
    "qase:import": "node scripts/import-cases.js",
    "qase:full": "npm run qase:convert && npm run qase:import"
  }
}
```

---

## 🚀 Fluxo Completo de Uso

### Passo 1: Preparar Casos de Teste

Tenha seus casos de teste em um formato estruturado (JSON, arquivo de texto, etc.).

### Passo 2: Converter Casos

Execute o script de conversão:

```bash
npm run qase:convert
```

Ou diretamente:

```bash
node scripts/convert-to-qase.js
```

**O que acontece:**
- O script lê seus casos de teste do formato original
- Converte para o formato JSON do Qase
- Salva em `.qase/cases.json`

### Passo 3: Verificar Arquivo Gerado

Abra `.qase/cases.json` e verifique se os casos foram convertidos corretamente:

```bash
# Windows (PowerShell)
Get-Content .qase\cases.json | ConvertFrom-Json | Select-Object -First 1

# Linux/Mac
cat .qase/cases.json | jq '.[0]'
```

### Passo 4: Importar para o Qase

Execute o script de importação:

```bash
npm run qase:import
```

Ou diretamente:

```bash
node scripts/import-cases.js
```

**O que acontece:**
- O script lê `.qase/cases.json`
- Verifica se o projeto existe no Qase
- Cria cada caso de teste via API
- Exibe progresso e resumo final

### Passo 5: Verificar no Qase.io

1. Acesse [https://app.qase.io](https://app.qase.io)
2. Selecione seu projeto
3. Vá em **"Test Cases"** ou **"Cases"**
4. Verifique se os casos foram importados

---

## 🔍 Troubleshooting

### Erro: "QASE_API_TOKEN não encontrado"

**Causa:** O arquivo `.env` não existe ou a variável não está definida.

**Solução:**
1. Verifique se o arquivo `.env` existe na raiz do projeto
2. Verifique se contém `QASE_API_TOKEN=seu_token`
3. Certifique-se de que não há espaços antes ou depois do `=`

### Erro: "Projeto não encontrado no Qase"

**Causa:** O código do projeto está incorreto ou você não tem acesso.

**Solução:**
1. Verifique o código do projeto no Qase.io (aparece na URL: `/project/CODIGO`)
2. Certifique-se de que o token tem permissão para acessar o projeto
3. Verifique se o código está em maiúsculas (ex: `FACILITY`)

### Erro: "HTTP 401: Unauthorized"

**Causa:** Token de API inválido ou expirado.

**Solução:**
1. Gere um novo token no Qase.io
2. Atualize o arquivo `.env` com o novo token
3. Execute o script novamente

### Erro: "HTTP 403: Forbidden"

**Causa:** Token não tem permissão para criar casos de teste.

**Solução:**
1. No Qase.io, vá em **Settings > API Tokens**
2. Edite o token e certifique-se de que tem permissão **Write**
3. Ou crie um novo token com permissões adequadas

### Erro: "Request failed: fetch is not defined"

**Causa:** Node.js versão antiga sem suporte a fetch nativo e node-fetch não instalado.

**Solução:**
```bash
npm install --save-dev node-fetch@2
```

### Erro: "Arquivo .qase/cases.json não encontrado"

**Causa:** O script de conversão não foi executado ou falhou.

**Solução:**
1. Execute primeiro o script de conversão: `npm run qase:convert`
2. Verifique se o arquivo foi criado: `ls .qase/cases.json` (Linux/Mac) ou `dir .qase\cases.json` (Windows)

### Casos duplicados sendo criados

**Causa:** Executando o script de importação múltiplas vezes.

**Solução:**
- O Qase permite casos com títulos duplicados
- Se quiser evitar duplicatas, adicione lógica no script para verificar casos existentes antes de criar
- Ou delete os casos duplicados manualmente no Qase.io

### Importação muito lenta

**Causa:** Muitos casos sendo importados sem delay entre requisições.

**Solução:**
- O script já inclui um delay de 500ms entre requisições
- Se necessário, aumente o delay no script (linha com `setTimeout(resolve, 500)`)

---

## 💡 Exemplos Práticos

### Exemplo 1: Importar Casos de um Arquivo JSON Simples

**Arquivo de origem:** `testes.json`

```json
{
  "casos": [
    {
      "titulo": "Teste de login",
      "descricao": "Verificar login",
      "severidade": "normal",
      "prioridade": "high"
    }
  ]
}
```

**Script de conversão adaptado:**

```javascript
// No script convert-to-qase.js, ajuste a função main:
const convertedCases = sourceData.casos.map((testCase) => {
  return {
    title: testCase.titulo,
    description: testCase.descricao,
    severity: testCase.severidade,
    priority: testCase.prioridade,
    tags: [],
    steps: []
  };
});
```

### Exemplo 2: Importar com Suite Específica

Para importar casos em uma suite específica, modifique o script `import-cases.js`:

```javascript
// Adicione esta função
async function createOrGetSuite(suiteName) {
  const url = `${QASE_API_URL}/suite/${QASE_PROJECT_CODE}`;
  
  // Buscar suites existentes
  try {
    const listUrl = `${QASE_API_URL}/suite/${QASE_PROJECT_CODE}?limit=100`;
    const suites = await makeRequest(listUrl);
    
    if (suites.result && suites.result.entities) {
      const existingSuite = suites.result.entities.find(s => s.title === suiteName);
      if (existingSuite) {
        return existingSuite.id;
      }
    }
  } catch (error) {
    // Continuar para criar nova suite
  }
  
  // Criar nova suite
  const payload = { title: suiteName };
  const result = await makeRequest(url, {
    method: 'POST',
    body: JSON.stringify(payload)
  });
  
  return result.result.id;
}

// Modifique createTestCase para incluir suite_id
async function createTestCase(testCase, suiteId) {
  const payload = {
    // ... outros campos
    suite_id: suiteId
  };
  // ...
}
```

### Exemplo 3: Adicionar Tags Automaticamente

Para adicionar tags baseadas em padrões:

```javascript
function generateTags(testCase) {
  const tags = [];
  
  // Adicionar tag baseada no título
  if (testCase.title.toLowerCase().includes('login')) {
    tags.push('login');
  }
  
  // Adicionar tag baseada na severidade
  tags.push(testCase.severity);
  
  // Adicionar data atual
  const today = new Date().toISOString().split('T')[0];
  tags.push(`imported-${today}`);
  
  return tags;
}
```

---

## 📚 Recursos Adicionais

### Documentação da API do Qase

- **API Documentation**: [https://developers.qase.io/](https://developers.qase.io/)
- **API Reference**: [https://developers.qase.io/reference](https://developers.qase.io/reference)

### Endpoints Úteis

- **Criar caso**: `POST /v1/case/{code}`
- **Listar casos**: `GET /v1/case/{code}`
- **Criar suite**: `POST /v1/suite/{code}`
- **Verificar projeto**: `GET /v1/project/{code}`

### Exemplos de Payload

**Criar caso de teste:**

```json
{
  "title": "Título do caso",
  "description": "Descrição",
  "severity": 3,
  "priority": 2,
  "tags": ["tag1", "tag2"],
  "steps": [
    {
      "action": "Ação",
      "expected_result": "Resultado esperado"
    }
  ]
}
```

---

## ✅ Checklist de Configuração

Use este checklist para garantir que tudo está configurado corretamente:

- [ ] Conta criada no Qase.io
- [ ] Projeto criado no Qase.io
- [ ] Token de API gerado e copiado
- [ ] Arquivo `.env` criado com `QASE_API_TOKEN` e `QASE_PROJECT_CODE`
- [ ] Arquivo `.env` adicionado ao `.gitignore`
- [ ] Dependências instaladas (`dotenv`, `node-fetch`)
- [ ] Diretório `.qase/` criado
- [ ] Script de conversão criado e adaptado ao seu formato
- [ ] Script de importação criado
- [ ] Scripts adicionados ao `package.json`
- [ ] Arquivo `.qase/cases.json` gerado com sucesso
- [ ] Importação executada com sucesso
- [ ] Casos verificados no Qase.io

---

## 🎓 Conclusão

Agora você tem um guia completo para configurar a importação de casos de teste para o Qase.io em qualquer projeto. Lembre-se de:

1. **Sempre proteger suas credenciais** - nunca commite o arquivo `.env`
2. **Testar com poucos casos primeiro** - valide o processo antes de importar muitos casos
3. **Adaptar os scripts** - cada projeto tem um formato diferente de casos de teste
4. **Documentar** - mantenha este tutorial atualizado conforme você adapta o processo

Se tiver dúvidas ou problemas, consulte a seção de [Troubleshooting](#troubleshooting) ou a documentação oficial do Qase.io.

---

**Última atualização:** Dezembro 2024  
**Versão do tutorial:** 1.0
