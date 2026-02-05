# Tutorial Completo: Integração Cypress com Qase.io

Este tutorial fornece um guia passo a passo detalhado para integrar o Cypress com o Qase.io usando o `cypress-qase-reporter`, permitindo que você envie resultados de testes automaticamente para o Qase e vincule seus testes aos casos de teste existentes.

## 📋 Índice

1. [Visão Geral](#visão-geral)
2. [Pré-requisitos](#pré-requisitos)
3. [Instalação](#instalação)
4. [Configuração Inicial no Qase.io](#configuração-inicial-no-qaseio)
5. [Configuração do Cypress](#configuração-do-cypress)
6. [Variáveis de Ambiente](#variáveis-de-ambiente)
7. [Vinculando Testes aos Casos do Qase](#vinculando-testes-aos-casos-do-qase)
8. [Executando Testes](#executando-testes)
9. [Verificando Resultados no Qase](#verificando-resultados-no-qase)
10. [Recursos Avançados](#recursos-avançados)
11. [Troubleshooting](#troubleshooting)
12. [Boas Práticas](#boas-práticas)

---

## 🎯 Visão Geral

A integração Cypress-Qase permite:

- ✅ **Envio automático de resultados** de testes para o Qase.io
- ✅ **Vinculação de testes** aos casos de teste existentes no Qase
- ✅ **Upload automático** de screenshots e vídeos
- ✅ **Criação automática** de casos de teste se não existirem
- ✅ **Rastreamento completo** de execuções de testes
- ✅ **Relatórios detalhados** com evidências visuais

**Fluxo de funcionamento:**

1. Você escreve testes no Cypress
2. Vincula os testes aos casos do Qase usando `qase()`
3. Executa os testes normalmente
4. O reporter envia automaticamente os resultados para o Qase
5. Você visualiza os resultados no dashboard do Qase

---

## 📦 Pré-requisitos

Antes de começar, certifique-se de ter:

- **Node.js** instalado (versão 18.x ou superior recomendada)
- **npm** ou **yarn** como gerenciador de pacotes
- **Cypress** instalado no projeto (versão 10+)
- Uma conta no [Qase.io](https://qase.io) (plano gratuito ou pago)
- Um projeto criado no Qase.io
- Token de API do Qase.io

---

## 📥 Instalação

### Passo 1: Instalar Dependências

No diretório raiz do seu projeto, execute:

```bash
npm install --save-dev cypress-qase-reporter@3.1.0
npm install --save-dev cypress-mochawesome-reporter@3.8.4
npm install --save-dev cypress-multi-reporters@2.0.5
npm install --save-dev dotenv@latest
```

**Ou em um único comando:**

```bash
npm install --save-dev cypress-qase-reporter@3.1.0 cypress-mochawesome-reporter@3.8.4 cypress-multi-reporters@2.0.5 dotenv@latest
```

**Explicação das dependências:**
- **cypress-qase-reporter**: Reporter oficial para integração com Qase.io
- **cypress-mochawesome-reporter**: Reporter para gerar relatórios HTML locais (opcional mas recomendado)
- **cypress-multi-reporters**: Permite usar múltiplos reporters simultaneamente
- **dotenv**: Carrega variáveis de ambiente do arquivo `.env`

### Passo 2: Verificar Instalação

Verifique se as dependências foram instaladas corretamente:

```bash
npm list cypress-qase-reporter cypress-mochawesome-reporter cypress-multi-reporters dotenv
```

Você deve ver algo como:

```
facility_com_br_app@0.0.1
├── cypress-qase-reporter@3.1.0
├── cypress-mochawesome-reporter@3.8.4
├── cypress-multi-reporters@2.0.5
└── dotenv@17.2.3
```

---

## 🔧 Configuração Inicial no Qase.io

### Passo 1: Criar Conta e Projeto

1. Acesse [https://qase.io](https://qase.io) e crie uma conta (se ainda não tiver)
2. Crie um novo projeto ou use um existente
3. Anote o **código do projeto** (aparece na URL: `https://app.qase.io/project/CODIGO`)

### Passo 2: Obter Token de API

1. No Qase.io, clique no ícone do seu perfil (canto superior direito)
2. Selecione **"Settings"** ou **"Account Settings"**
3. No menu lateral, clique em **"API Tokens"** ou **"Tokens"**
4. Clique em **"Create Token"** ou **"Generate New Token"**
5. Dê um nome descritivo ao token (ex: "Cypress Integration")
6. Selecione as permissões necessárias:
   - ✅ **Read** (para verificar projetos e casos)
   - ✅ **Write** (para criar casos e enviar resultados)
7. Clique em **"Create"** ou **"Generate"**
8. **COPIE O TOKEN IMEDIATAMENTE** - ele não será exibido novamente!

⚠️ **IMPORTANTE**: Guarde este token em local seguro. Você precisará dele na próxima etapa.

---

## ⚙️ Configuração do Cypress

### Passo 1: Configurar `cypress.config.ts`

Abra ou crie o arquivo `cypress.config.ts` na raiz do projeto e configure da seguinte forma:

```typescript
import { defineConfig } from 'cypress';
import 'dotenv/config';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { afterSpecHook } = require('cypress-qase-reporter/hooks');

export default defineConfig({
  // Configuração do reporter múltiplo
  reporter: 'cypress-multi-reporters',
  reporterOptions: {
    // Habilitar ambos os reporters
    reporterEnabled: 'cypress-mochawesome-reporter, cypress-qase-reporter',

    // 📊 Configuração do Mochawesome (relatório HTML local)
    cypressMochawesomeReporterReporterOptions: {
      reportDir: 'cypress/reports',
      charts: true,
      embeddedScreenshots: true,
      reportPageTitle: 'Relatório de Testes E2E',
      reportTitle: 'Relatório de Testes Cypress',
      inlineAssets: true,
    },

    // 📤 Configuração do Qase.io Reporter
    cypressQaseReporterReporterOptions: {
      mode: 'testops',  // 👈 ESSENCIAL: Ativa o envio ao Qase
      debug: true,      // Mostra logs detalhados (útil para debug)
      testops: {
        api: {
          token: process.env['QASE_API_TOKEN'] || '',
        },
        project: process.env['QASE_PROJECT_CODE'] || '',
        uploadAttachments: true,  // Envia screenshots e vídeos
        run: {
          complete: true,  // Marca o run como completo ao finalizar
          title: process.env['QASE_RUN_TITLE'] || 'Automated Test Run',
          description: process.env['QASE_RUN_DESCRIPTION'] || 'Testes automatizados E2E',
        },
        createTestCases: true,  // 👈 Cria casos automaticamente se não existirem
      },
      framework: {
        cypress: {
          screenshotsFolder: 'cypress/screenshots',
          videosFolder: 'cypress/videos',
          uploadDelay: 10,  // Delay entre uploads (segundos)
          uploadVideos: true,  // Envia vídeos dos testes
        },
      },
    },
  },

  // Habilitar vídeo e screenshots
  video: true,
  videosFolder: 'cypress/videos',
  screenshotsFolder: 'cypress/screenshots',

  e2e: {
    baseUrl: process.env['CYPRESS_BASE_URL'] || 'http://localhost:8100',
    pageLoadTimeout: 120000,
    defaultCommandTimeout: 10000,
    experimentalMemoryManagement: true,
    numTestsKeptInMemory: 1,

    setupNodeEvents(on, config) {
      // ✅ Debug de variáveis de ambiente (útil para verificar configuração)
      console.log('🔑 QASE_API_TOKEN:', process.env['QASE_API_TOKEN'] ? '[OK ✅]' : '[NÃO DEFINIDO ❌]');
      console.log('📁 QASE_PROJECT_CODE:', process.env['QASE_PROJECT_CODE'] || '[NÃO DEFINIDO ❌]');

      // 📁 Registrar plugins do Cypress
      require('cypress-mochawesome-reporter/plugin')(on);
      require('cypress-qase-reporter/plugin')(on, config);
      require('cypress-qase-reporter/metadata')(on, config);
      
      // Outros plugins (exemplo: cypress-grep)
      // require('cypress-grep/src/plugin')(config);

      // ✅ Envio dos resultados ao Qase ao final de cada spec
      on('after:spec', (spec: any, results: any) => {
        if (process.env['QASE_API_TOKEN'] && process.env['QASE_PROJECT_CODE']) {
          return afterSpecHook(spec, config)
            .then(() => {
              console.log(`✅ Resultados enviados ao Qase com sucesso: ${spec.name}`);
            })
            .catch((err: any) => {
              console.error(`❌ Erro ao enviar resultados para Qase: ${(err && err.message) || err}`);
            });
        } else {
          console.log('⚠️ Qase.io não configurado. Defina QASE_API_TOKEN e QASE_PROJECT_CODE no arquivo .env');
        }
      });

      return config;
    },
  },
});
```

### Explicação das Configurações Importantes

**`mode: 'testops'`**: Ativa o modo de integração com Qase TestOps. Sem isso, o reporter não enviará dados.

**`createTestCases: true`**: Se um teste estiver vinculado a um ID que não existe no Qase, cria o caso automaticamente.

**`uploadAttachments: true`**: Envia screenshots e vídeos automaticamente para o Qase.

**`debug: true`**: Mostra logs detalhados no console. Desative em produção para logs mais limpos.

---

## 🔐 Variáveis de Ambiente

### Passo 1: Criar Arquivo `.env`

No diretório raiz do projeto, crie um arquivo chamado `.env`:

```bash
# Windows (PowerShell)
New-Item -Path .env -ItemType File

# Linux/Mac
touch .env
```

### Passo 2: Adicionar Variáveis

Abra o arquivo `.env` e adicione as seguintes variáveis:

```env
# Token de API do Qase.io (obtido na etapa anterior)
QASE_API_TOKEN=seu_token_aqui

# Código do projeto no Qase (ex: FACILITY, MYPROJECT, etc.)
QASE_PROJECT_CODE=FACILITY

# Opcional: Título personalizado para os runs
QASE_RUN_TITLE=Testes Automatizados - Build #123

# Opcional: Descrição do run
QASE_RUN_DESCRIPTION=Execução automática dos testes E2E

# Opcional: URL base da aplicação
CYPRESS_BASE_URL=http://localhost:8100
```

**Exemplo real:**

```env
QASE_API_TOKEN=6f64b77fa96d3dfdd944ebda64a7a666f531dab44cd389fde3a717bad2e73c4f
QASE_PROJECT_CODE=FACILITY
QASE_RUN_TITLE=Testes E2E - Desenvolvimento
CYPRESS_BASE_URL=http://localhost:8100
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
QASE_RUN_TITLE=Automated Test Run
CYPRESS_BASE_URL=http://localhost:8100
```

Este arquivo pode ser commitado no repositório como referência.

---

## 🔗 Vinculando Testes aos Casos do Qase

Existem **três formas principais** de vincular seus testes aos casos do Qase:

### Método 1: Wrapper `qase()` no `describe()` (Recomendado)

Vincula **todos os testes** de um arquivo a **um único caso** do Qase:

```javascript
import { qase } from 'cypress-qase-reporter/mocha';

// Todos os testes deste describe serão vinculados ao caso #58
describe('Cadastro Profissional', qase(58, () => {
  beforeEach(() => {
    cy.viewport('iphone-x');
    cy.visit('/');
  });

  it('Deve abrir a página inicial com sucesso', () => {
    cy.get('body').should('exist');
    cy.screenshot();
  });

  it('Deve navegar para o cadastro', () => {
    cy.visit('/register');
    cy.screenshot();
  });
}));  // 👈 Note os DOIS parênteses fechando
```

**Vantagens:**
- ✅ Simples e direto
- ✅ Todos os testes do arquivo vinculados ao mesmo caso
- ✅ Ideal quando um arquivo testa um único caso de teste

**Quando usar:**
- Quando todos os testes de um arquivo testam o mesmo caso do Qase
- Quando você quer agrupar múltiplos cenários em um único caso

### Método 2: Wrapper `qase()` no `it()` Individual

Vincula **cada teste individual** a um caso diferente:

```javascript
import { qase } from 'cypress-qase-reporter/mocha';

describe('Suite de Testes', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  // Este teste será vinculado ao caso #58
  it('Teste de login', qase(58, () => {
    cy.get('#email').type('usuario@exemplo.com');
    cy.get('#password').type('senha123');
    cy.get('button[type="submit"]').click();
    cy.screenshot();
  }));

  // Este teste será vinculado ao caso #59
  it('Teste de cadastro', qase(59, () => {
    cy.visit('/register');
    cy.get('#nome').type('João Silva');
    cy.screenshot();
  }));

  // Este teste NÃO será vinculado a nenhum caso
  it('Teste sem Qase', () => {
    cy.visit('/');
    cy.screenshot();
  });
});
```

**Vantagens:**
- ✅ Flexibilidade para vincular cada teste a um caso diferente
- ✅ Permite ter testes sem vinculação no mesmo arquivo
- ✅ Ideal quando um arquivo testa múltiplos casos

**Quando usar:**
- Quando cada teste corresponde a um caso diferente no Qase
- Quando você quer granularidade maior na vinculação

### Método 3: Comentário `@qase` (Alternativa)

Usa um comentário especial no início do arquivo ou do teste:

```javascript
// @qase 58
describe('Cadastro Profissional', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('Deve abrir a página inicial', () => {
    cy.get('body').should('exist');
    cy.screenshot();
  });

  it('Deve navegar para o cadastro', () => {
    cy.visit('/register');
    cy.screenshot();
  });
});
```

**Vantagens:**
- ✅ Não requer importação do `qase`
- ✅ Sintaxe mais simples
- ✅ Funciona sem modificar a estrutura do código

**Quando usar:**
- Quando você quer uma sintaxe mais limpa
- Quando não quer usar o wrapper `qase()`

⚠️ **Nota**: Este método pode não funcionar em todas as versões do `cypress-qase-reporter`. Verifique a documentação da versão que você está usando.

### Exemplo Completo: Múltiplos Casos em um Arquivo

```javascript
import { qase } from 'cypress-qase-reporter/mocha';

describe('Fluxo Completo de Cadastro', () => {
  beforeEach(() => {
    cy.viewport('iphone-x');
    cy.visit('/');
  });

  // Caso #58: Login
  describe('Login', qase(58, () => {
    it('Deve fazer login com credenciais válidas', () => {
      cy.get('#email').type('usuario@exemplo.com');
      cy.get('#password').type('senha123');
      cy.get('button[type="submit"]').click();
      cy.url().should('include', '/dashboard');
      cy.screenshot('login-sucesso');
    });
  }));

  // Caso #59: Cadastro
  describe('Cadastro', qase(59, () => {
    it('Deve cadastrar novo usuário', () => {
      cy.visit('/register');
      cy.get('#nome').type('João Silva');
      cy.get('#email').type('joao@exemplo.com');
      cy.get('button[type="submit"]').click();
      cy.screenshot('cadastro-sucesso');
    });
  }));

  // Caso #60: Recuperação de senha
  it('Deve recuperar senha', qase(60, () => {
    cy.visit('/forgot-password');
    cy.get('#email').type('usuario@exemplo.com');
    cy.get('button[type="submit"]').click();
    cy.contains('Email enviado').should('be.visible');
    cy.screenshot('recuperacao-senha');
  }));
});
```

---

## 🚀 Executando Testes

### Executar Todos os Testes

```bash
npx cypress run
```

### Executar um Arquivo Específico

```bash
npx cypress run --spec cypress/e2e/cadastro-profissional.cy.js
```

### Executar com Variáveis de Ambiente Inline

```bash
# Windows (PowerShell)
$env:QASE_API_TOKEN="seu_token"; $env:QASE_PROJECT_CODE="FACILITY"; npx cypress run

# Linux/Mac
QASE_API_TOKEN=seu_token QASE_PROJECT_CODE=FACILITY npx cypress run
```

### Executar em Modo Headed (com navegador visível)

```bash
npx cypress run --headed
```

### Executar com Cypress UI

```bash
npx cypress open
```

### Adicionar Scripts ao `package.json`

Adicione scripts úteis ao seu `package.json`:

```json
{
  "scripts": {
    "cypress:open": "cypress open",
    "cypress:run": "cypress run",
    "test:qase": "cypress run --env qaseEnabled=true",
    "test:headed": "cypress run --headed",
    "test:chrome": "cypress run --browser chrome"
  }
}
```

Depois execute:

```bash
npm run cypress:run
npm run test:qase
```

---

## 📊 Verificando Resultados no Qase

### Passo 1: Acessar o Dashboard

1. Acesse [https://app.qase.io](https://app.qase.io)
2. Selecione seu projeto
3. Vá em **"Test Runs"** ou **"Runs"** no menu lateral

### Passo 2: Verificar o Run Criado

Você verá uma lista de execuções de testes. Cada execução do Cypress cria um novo run com:
- **Título**: Definido em `QASE_RUN_TITLE` ou padrão "Automated Test Run"
- **Status**: Passed, Failed, ou In Progress
- **Data/Hora**: Quando foi executado
- **Duração**: Tempo total de execução

### Passo 3: Ver Detalhes do Run

Clique em um run para ver:
- ✅ Lista de todos os testes executados
- ✅ Status de cada teste (Passed/Failed/Skipped)
- ✅ Screenshots capturados durante os testes
- ✅ Vídeos dos testes (se habilitado)
- ✅ Logs e mensagens de erro
- ✅ Casos de teste vinculados

### Passo 4: Ver Resultados nos Casos de Teste

1. Vá em **"Test Cases"** ou **"Cases"**
2. Clique em um caso de teste
3. Na aba **"Runs"** ou **"Executions"**, você verá todas as execuções desse caso
4. Clique em uma execução para ver:
   - Status (Passed/Failed)
   - Screenshots
   - Vídeo (se disponível)
   - Logs detalhados

---

## 🎯 Recursos Avançados

### 1. Criar Casos Automaticamente

Com `createTestCases: true` na configuração, se você vincular um teste a um ID que não existe, o Qase criará o caso automaticamente usando:
- **Título**: Nome do teste (`it('Nome do teste')`)
- **Descrição**: Descrição do `describe()` ou do teste
- **Steps**: Extraídos dos comandos do Cypress (se possível)

### 2. Upload de Screenshots e Vídeos

Os screenshots e vídeos são enviados automaticamente quando:
- ✅ `uploadAttachments: true` está configurado
- ✅ `cy.screenshot()` é chamado nos testes
- ✅ `video: true` está no `cypress.config.ts`

**Dica**: Use `cy.screenshot()` estrategicamente para documentar pontos importantes do teste:

```javascript
it('Deve fazer login', qase(58, () => {
  cy.visit('/login');
  cy.screenshot('1-pagina-login');
  
  cy.get('#email').type('usuario@exemplo.com');
  cy.get('#password').type('senha123');
  cy.screenshot('2-campos-preenchidos');
  
  cy.get('button[type="submit"]').click();
  cy.url().should('include', '/dashboard');
  cy.screenshot('3-login-sucesso');
}));
```

### 3. Títulos Personalizados para Runs

Use variáveis de ambiente para personalizar os runs:

```env
QASE_RUN_TITLE=Testes E2E - Build #123 - Branch: feature/login
QASE_RUN_DESCRIPTION=Execução automática após merge da branch feature/login
```

### 4. Múltiplos Projetos

Para trabalhar com múltiplos projetos, você pode:

**Opção A**: Usar variáveis de ambiente diferentes por ambiente:

```env
# Desenvolvimento
QASE_PROJECT_CODE_DEV=PROJECT_DEV
QASE_API_TOKEN_DEV=token_dev

# Produção
QASE_PROJECT_CODE_PROD=PROJECT_PROD
QASE_API_TOKEN_PROD=token_prod
```

**Opção B**: Usar scripts diferentes no `package.json`:

```json
{
  "scripts": {
    "test:dev": "cross-env QASE_PROJECT_CODE=DEV_PROJECT cypress run",
    "test:prod": "cross-env QASE_PROJECT_CODE=PROD_PROJECT cypress run"
  }
}
```

### 5. Filtrar Testes por Tags

Se você usar tags nos casos do Qase, pode filtrar execuções:

```javascript
// No Qase, adicione tags aos casos: ['smoke', 'regression']
// No Cypress, você pode usar cypress-grep para filtrar:

// Executar apenas testes com tag 'smoke'
npx cypress run --env grepTags=smoke
```

---

## 🔍 Troubleshooting

### Erro: "QASE_API_TOKEN não encontrado"

**Sintoma**: Console mostra `[NÃO DEFINIDO ❌]` para QASE_API_TOKEN

**Causa**: O arquivo `.env` não existe ou a variável não está definida.

**Solução:**
1. Verifique se o arquivo `.env` existe na raiz do projeto
2. Verifique se contém `QASE_API_TOKEN=seu_token`
3. Certifique-se de que não há espaços antes ou depois do `=`
4. Reinicie o terminal/IDE após criar/modificar o `.env`

### Erro: "Projeto não encontrado no Qase"

**Sintoma**: Erro ao tentar enviar resultados

**Causa**: Código do projeto incorreto ou token sem permissão.

**Solução:**
1. Verifique o código do projeto no Qase.io (aparece na URL: `/project/CODIGO`)
2. Certifique-se de que o código está em maiúsculas (ex: `FACILITY`)
3. Verifique se o token tem permissão para acessar o projeto
4. Teste o token manualmente via API do Qase

### Erro: "HTTP 401: Unauthorized"

**Sintoma**: Erro 401 ao enviar resultados

**Causa**: Token de API inválido ou expirado.

**Solução:**
1. Gere um novo token no Qase.io
2. Atualize o arquivo `.env` com o novo token
3. Execute os testes novamente

### Erro: "HTTP 403: Forbidden"

**Sintoma**: Erro 403 ao enviar resultados

**Causa**: Token não tem permissão para criar casos ou enviar resultados.

**Solução:**
1. No Qase.io, vá em **Settings > API Tokens**
2. Edite o token e certifique-se de que tem permissão **Write**
3. Ou crie um novo token com permissões adequadas

### Testes não aparecem no Qase

**Sintoma**: Testes executam mas não aparecem no Qase

**Possíveis causas e soluções:**

1. **`mode: 'testops'` não está configurado**
   - Verifique se `cypressQaseReporterReporterOptions.mode` está como `'testops'`

2. **Variáveis de ambiente não carregadas**
   - Verifique se `import 'dotenv/config'` está no `cypress.config.ts`
   - Verifique se o arquivo `.env` existe e está correto

3. **Plugin não registrado**
   - Verifique se `require('cypress-qase-reporter/plugin')(on, config)` está no `setupNodeEvents`

4. **Hook `after:spec` não configurado**
   - Verifique se o hook `on('after:spec')` está configurado corretamente

5. **Testes não vinculados a casos**
   - Verifique se os testes usam `qase(ID)` ou comentário `@qase ID`
   - Verifique se o ID existe no Qase ou se `createTestCases: true` está habilitado

### Screenshots não são enviados

**Sintoma**: Testes aparecem mas sem screenshots

**Solução:**
1. Verifique se `uploadAttachments: true` está configurado
2. Verifique se `cy.screenshot()` está sendo chamado nos testes
3. Verifique se `screenshotsFolder` está correto na configuração
4. Verifique os logs do console para erros de upload

### Vídeos não são enviados

**Sintoma**: Testes aparecem mas sem vídeos

**Solução:**
1. Verifique se `video: true` está no `cypress.config.ts`
2. Verifique se `uploadVideos: true` está na configuração do Qase
3. Verifique se `videosFolder` está correto
4. Verifique se há espaço suficiente em disco

### Casos duplicados sendo criados

**Sintoma**: Múltiplos casos com o mesmo nome

**Causa**: Executando testes múltiplas vezes com `createTestCases: true` e IDs diferentes.

**Solução:**
- Use IDs fixos e consistentes
- Ou desative `createTestCases: true` e crie os casos manualmente no Qase primeiro

### Performance: Uploads muito lentos

**Sintoma**: Testes demoram muito para finalizar

**Solução:**
1. Aumente `uploadDelay` na configuração (ex: de 10 para 30 segundos)
2. Desative `uploadVideos: false` se não precisar de vídeos
3. Reduza a quantidade de screenshots nos testes
4. Use `uploadAttachments: false` temporariamente para testes rápidos

---

## ✅ Boas Práticas

### 1. Organização de Testes

- ✅ **Um arquivo = Um caso do Qase**: Quando possível, mantenha um arquivo de teste vinculado a um único caso
- ✅ **Nomes descritivos**: Use nomes claros para arquivos e testes
- ✅ **Estrutura consistente**: Mantenha uma estrutura de pastas organizada

```
cypress/e2e/
  ├── login/
  │   ├── login.cy.js          # Caso #58
  │   └── recuperar-senha.cy.js # Caso #59
  ├── cadastro/
  │   ├── cadastro-cliente.cy.js    # Caso #60
  │   └── cadastro-profissional.cy.js # Caso #61
```

### 2. Screenshots Estratégicos

- ✅ **Screenshot no início**: Capture o estado inicial
- ✅ **Screenshot após ações importantes**: Documente cada passo crítico
- ✅ **Screenshot no final**: Capture o resultado final
- ✅ **Nomes descritivos**: Use `cy.screenshot('1-login-pagina-inicial')` em vez de `cy.screenshot()`

### 3. IDs dos Casos

- ✅ **Documente os IDs**: Mantenha uma lista ou comentário com os IDs usados
- ✅ **IDs consistentes**: Use os mesmos IDs em todos os ambientes
- ✅ **Comentários**: Adicione comentários explicando a vinculação

```javascript
// Caso Qase #58: Cadastro de Profissional
// Link: https://app.qase.io/project/FACILITY/case/58
describe('Cadastro Profissional', qase(58, () => {
  // ...
}));
```

### 4. Variáveis de Ambiente

- ✅ **`.env.example`**: Mantenha um template atualizado
- ✅ **Documentação**: Documente todas as variáveis necessárias
- ✅ **Validação**: Adicione validação no início dos testes

```javascript
before(() => {
  if (!Cypress.env('QASE_API_TOKEN')) {
    throw new Error('QASE_API_TOKEN não configurado!');
  }
});
```

### 5. Tratamento de Erros

- ✅ **Try-catch**: Envolva operações críticas
- ✅ **Logs informativos**: Use `cy.log()` para documentar passos
- ✅ **Screenshots em erros**: Capture screenshots quando testes falharem

```javascript
it('Deve fazer login', qase(58, () => {
  cy.visit('/login');
  
  try {
    cy.get('#email').type('usuario@exemplo.com');
    cy.get('#password').type('senha123');
    cy.get('button[type="submit"]').click();
    cy.url().should('include', '/dashboard');
  } catch (error) {
    cy.screenshot('erro-login');
    throw error;
  }
}));
```

### 6. Manutenção

- ✅ **Atualizar dependências**: Mantenha `cypress-qase-reporter` atualizado
- ✅ **Revisar configuração**: Periodicamente revise a configuração
- ✅ **Limpar runs antigos**: No Qase, limpe runs antigos para manter performance
- ✅ **Documentar mudanças**: Documente qualquer mudança na configuração

---

## 📚 Recursos Adicionais

### Documentação Oficial

- **Cypress-Qase-Reporter**: [https://github.com/qase-tms/cypress-qase-reporter](https://github.com/qase-tms/cypress-qase-reporter)
- **Qase.io API**: [https://developers.qase.io/](https://developers.qase.io/)
- **Cypress Documentation**: [https://docs.cypress.io/](https://docs.cypress.io/)

### Exemplos de Código

Veja os arquivos de exemplo no projeto:
- `cypress/e2e/TEMPLATE_QASE.cy.js` - Template completo
- `cypress/e2e/cadastro-profissional.cy.js` - Exemplo real
- `cypress.config.ts` - Configuração completa

### Comandos Úteis

```bash
# Executar testes e ver logs detalhados
DEBUG=cypress:* npx cypress run

# Executar apenas um teste específico
npx cypress run --spec cypress/e2e/login.cy.js

# Executar em modo interativo
npx cypress open

# Limpar cache do Cypress
npx cypress cache clear
```

---

## ✅ Checklist de Configuração

Use este checklist para garantir que tudo está configurado corretamente:

- [ ] Dependências instaladas (`cypress-qase-reporter`, `cypress-multi-reporters`, etc.)
- [ ] Conta criada no Qase.io
- [ ] Projeto criado no Qase.io
- [ ] Token de API gerado e copiado
- [ ] Arquivo `.env` criado com `QASE_API_TOKEN` e `QASE_PROJECT_CODE`
- [ ] Arquivo `.env` adicionado ao `.gitignore`
- [ ] `cypress.config.ts` configurado corretamente
- [ ] `mode: 'testops'` configurado
- [ ] Plugins registrados no `setupNodeEvents`
- [ ] Hook `after:spec` configurado
- [ ] Testes vinculados aos casos usando `qase()` ou `@qase`
- [ ] Screenshots sendo capturados nos testes
- [ ] Teste de execução realizado com sucesso
- [ ] Resultados verificados no Qase.io
- [ ] Screenshots e vídeos aparecendo no Qase

---

## 🎓 Conclusão

Agora você tem um guia completo para integrar Cypress com Qase.io. Esta integração permite:

- ✅ Rastreamento automático de execuções de testes
- ✅ Vinculação de testes aos casos de teste
- ✅ Documentação visual com screenshots e vídeos
- ✅ Relatórios centralizados no Qase
- ✅ Criação automática de casos de teste

**Próximos passos:**
1. Configure a integração seguindo este tutorial
2. Execute seus primeiros testes
3. Verifique os resultados no Qase.io
4. Ajuste a configuração conforme necessário
5. Integre com CI/CD para execuções automáticas

Se tiver dúvidas ou problemas, consulte a seção de [Troubleshooting](#troubleshooting) ou a documentação oficial.

---

**Última atualização:** Dezembro 2024  
**Versão do tutorial:** 1.0  
**Versão do cypress-qase-reporter testada:** 3.1.0
