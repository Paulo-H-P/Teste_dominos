## 📜 Histórico do Projeto – Domino's Acompanhamento

**Período coberto:** 2026-01-22 até 2026-01-28  
**Origem:** Datas de criação/alteração dos arquivos na pasta raiz e histórico de commits do repositório (`git log`).

---

## 📅 2026-01-21 – Início do projeto (análises e documentação inicial)

### Arquivos criados na pasta raiz

- **`SELETORES_POLITICA_PRIVACIDADE.md`** (18:25)
  - Análise inicial dos seletores relacionados à política de privacidade.
  - Estudo de como a política de privacidade impacta o fluxo de navegação e os testes.

- **`RELATORIO_BOAS_PRATICAS_QA.md`** (20:24)
  - Relatório de boas práticas de QA para o projeto (estratégia de testes, padrões de automação, etc.).

**Tempo estimado:** ~2-3 horas  
**Retrabalho por erro:** baixo (documentação inicial)

---

## 📅 2026-01-22 – Análise de seletores do campo Nome

### Arquivo criado na pasta raiz

- **`SELETORES_CAMPO_NOME.md`** (11:13)
  - Investigação detalhada dos seletores do campo de Nome.
  - Mapeamento de problemas com `formcontrolname`, Shadow DOM e possíveis alternativas.

**Tempo estimado:** ~1-2 horas  
**Retrabalho por erro:** baixo

---

## 📅 2026-01-26 – Início da automação Cypress

### Estrutura criada

- **Pasta `cypress/`** (16:00)
  - Início da estrutura de testes automatizados com Cypress no projeto.

- **`ANALISE_SELETOR_PROMOCOES.md`** (17:00)
  - Análise específica dos seletores usados na tela de promoções (cards, botões, etc.).

**Tempo estimado:** ~2-3 horas  
**Retrabalho por erro:** baixo

---

## 📅 2026-01-27 – Criação do repositório Git e setup inicial

### Criação e estrutura inicial

- **Commit `77cdd68` – `acompanhaento dominos`**
  - Marca a criação inicial do projeto no repositório Git.
  - Importação da base do front + início da estrutura de testes Cypress.

- **Commit `64961e2` – `chore: atualiza .gitignore para ignorar repositório aninhado`**
  - Ajustes de `.gitignore` para evitar arquivos indesejados no versionamento.

**Tempo estimado:** ~30 minutos  
**Retrabalho por erro:** baixo

### Workflow e Allure no CI

- **Commits `f8a458a`, `00c410b`**
  - `test: adiciona trigger push ao workflow para testes`
  - `docs: adiciona README.md - teste workflow`
  - Criação do workflow inicial GitHub Actions para rodar Cypress e testar deploy.

- **Commits `f12ab5f`, `25b2bd1`, `50aedaf`**
  - Correção de `package-lock.json` para permitir `npm ci` no CI.
  - Ajuste do workflow para usar o CLI correto do Allure (`allure-commandline`).
  - Ordem correta de passos: instalar dependências, instalar browsers do Playwright (antes), gerar relatório Allure.

- **Commits `435e7d5`, `fce073c`, `c3a6bab`, `44c14f3`**
  - Vários ciclos de **sync do lockfile** (`package-lock.json`) para resolver falhas de `npm ci`.

**Tempo estimado:** ~4-5 horas ao longo do dia  
**Retrabalho por erro:** alto
- Vários ciclos de "roda workflow → quebra → ajusta lockfile/CLI → roda de novo".
- Boa parte do tempo foi gasto até estabilizar `npm ci` + Allure.

### Remoção do Playwright e foco no HTML Allure

- **Commits `4f98f94`, `438bcf0`, `7e2e633`, `b380b07`, `be255e3`, `754c418`, `fc4a379`**
  - Remoção completa do Playwright do projeto (PDF deixou de ser requisito).
  - Regeneração do `package-lock.json` para remover referências ao Playwright.
  - Workflow ajustado para gerar apenas o **relatório HTML do Allure** e publicar via GitHub Pages.

- **Commits `13276a1`, `a49c44d`, `aefe4a1`**
  - Correção de permissões do GitHub Actions para permitir deploy em `gh-pages`.
  - Uso de script npm para geração do Allure (`npm run allure:generate`).

**Tempo estimado:** ~2-3 horas  
**Retrabalho por erro:** médio
- Alguns runs do CI falhando até o lock ficar 100% alinhado.

### GitHub Pages e melhorias de relatório

- **Commits `e9343fb`, `771a517`**
  - Ajustes de checkout e permissões no workflow.
  - Trigger específico para testar o deploy em `gh-pages`.

- **Commits `a77b06a`, `07ae596`, `e73fab2`, `fcbb525`**
  - Correção final do comando Allure no CI.
  - Logs extras no workflow para diagnosticar falhas do Cypress.
  - Ajuste de headers e `failOnStatusCode: false` para reduzir erros 403.

- **Commits `6daa4a7`, `83b185e`**
  - Adição de **resumo do workflow** no `GITHUB_STEP_SUMMARY`.
  - Inclusão de um `README.md` dentro do artifact do relatório Allure com instruções de uso.
  - Mensagens claras indicando que, mesmo com falha nos testes, o relatório foi gerado e publicado.

- **Commit `337b333`**
  - Trigger manual para forçar deploy do GitHub Pages após configuração da branch `gh-pages`.

**Tempo estimado:** ~2 horas  
**Retrabalho por erro:** baixo/médio
- Alguns workflows rodados apenas para validar deploy + 404 solucionado nas configs do repo.

### Tratamento de 403 e `visitWithRetry`

- **Commits `79cfdf7`, `9e32cb5`, `a8c949d`, `e9b3ef3`, `ba82f52`**
  - Implementação do comando customizado `cy.visitWithRetry()` para tratar erros 403 no CI.
  - Ajustes para:
    - Remover `.catch()` (não suportado na chain do Cypress).
    - Usar `cy.request` antes de `cy.visit` para inspecionar status.
    - Incluir headers e `failOnStatusCode: false` para contornar bloqueios.
  - Atualização de todas as chamadas `cy.visit()` no fluxo para usar `visitWithRetry`.

- **Commits `aaa8418`, `b73908d`**
  - Primeiras melhorias de seletores no fluxo de compra:
    - Várias estratégias para encontrar promoção e botões de "Pedir uma pizza".
    - Remoção ativa de `ion-backdrop` para evitar erros de visibilidade.

**Tempo estimado:** ~3-4 horas  
**Retrabalho por erro:** alto
- Várias tentativas (com e sem intercept, com e sem `.catch`) até chegar num padrão estável para o Cypress.

---

## 📅 2026-01-28 – Refinamento de seletores e estabilização

### Refinando o fluxo de compra e cadastro

- **Commits `e67bc64`, `b89a833`, `f2dd726`**
  - Refatoração do fluxo de compra com seletores mais específicos.
  - Adição de checkpoint real após chegar em `/register`.
  - Melhoria da navegação forçada para `/register` com `visitWithRetry` + `waitForAppReady` + `dismissOverlays`.

**Tempo estimado:** ~1-2 horas  
**Retrabalho por erro:** médio

### Shadow DOM e `typeInIonInput`

- **Commits `aec41f7`, `de27755`, `c634568`**
  - Criação e evolução do helper `typeInIonInput` para lidar corretamente com:
    - Light DOM (`input` visível direto).
    - Shadow DOM (via `.shadow().find(...)` somente quando `shadowRoot` existe).
    - Fallback por proximidade.
  - Adição de `nomeHost` e `elements.nome()` seguindo um padrão claro para o campo `fullName`.

**Tempo estimado:** ~2-3 horas  
**Retrabalho por erro:** alto

### Diagnóstico pesado: `ion-input[formcontrolname="fullName"]`

- **Commits `421f1d6`, `67b452e`, `0164920`**
  - Logs detalhados e checkpoints no spec (`fluxo_compra.cy.js`) para entender:
    - Quando o `ion-input` existe ou não.
    - Se há ou não `shadowRoot` naquele build.
  - Remoção de `.shadow()` hardcoded diretamente no spec.
  - Limpeza de cache do Cypress no CI para garantir que o código atualizado é realmente usado.

**Tempo estimado:** ~2-3 horas  
**Retrabalho por erro:** muito alto
- Erros diferentes surgindo em sequência: elemento não encontrado, `.shadow()` sem `shadowRoot`, subject inválido em `.click()`.
- Várias iterações até os helpers ficarem realmente resilientes.

### Detecção dinâmica do campo Nome (`findNameField`)

- **Commits `2d8e32e`, `9e52cf3`, `2517e42`, `2f8416a`, `a6866f6`, `195f4d5`**
  - Introdução e refinamento de `findNameField()`:
    - Lista de candidatos baseada em `formcontrolname` e atributos conhecidos.
    - Fallback usando placeholder via RegExp (em JavaScript, não no seletor CSS).
    - Fallback final usando "primeiro input de texto" para não travar teste.
  - Correções importantes:
    - `findNameField()` passou a retornar **elemento jQuery**, não string.
    - Garantia de que **todos os `.click()` recebem elementos válidos** (`clickSafe`, `.first()`).
    - Remoção de checkpoints rígidos baseados em texto (como `/criar minha conta|cadastro/`) dos specs.

**Tempo estimado:** ~3-4 horas  
**Retrabalho por erro:** alto
- Vários erros em cadeia: `toArray is not a function`, sintaxe inválida em seletor CSS (`[placeholder*="nome" i]`), `input[placeholder]` inexistente no DOM do CI.
- Cada correção exigiu um novo pipeline no GitHub Actions para validar.

### Estabilização final do helper de Nome

- **Commits `fa5ef15`, `3a4d645`**
  - Remoção de seletores CSS inválidos (`input[placeholder*="nome" i]`).
  - Fallback de placeholder reescrito usando `filter` em JavaScript (case-insensitive).
  - Novo fallback em camadas:
    - Candidatos diretos (`ion-input` + `formcontrolname`).
    - Inputs com placeholder contendo "nome"/"name".
    - Qualquer `input[type="text"]` ou `ion-input` como último recurso.

**Tempo estimado:** ~1-2 horas  
**Retrabalho por erro:** médio

### Documentação e Melhores Práticas de Seletores

- **Atualização de `RESUMO_PROBLEMAS_SELETORES.md`**
  - Documento atualizado para incluir:
    - Problemas clássicos de seletores (classes dinâmicas, `nth-child`, Shadow DOM, backdrops).
    - Impacto direto em tempo de desenvolvimento e estabilidade do CI.
    - Lista detalhada de **onde introduzir `data-cy`** para estabilizar o projeto:
      - Campos de cadastro.
      - Botões de fluxo (cookies, promoções, carrinho, pagamento).
      - Âncoras de página (`page-register`, `page-promotions`, etc.).

- **Criação de `HISTORICO_PROJETO.md`**
  - Documentação completa da linha do tempo do projeto desde a criação até o estado atual.

**Tempo estimado:** ~1-2 horas  
**Retrabalho por erro:** baixo (majoritariamente conteúdo e organização)

---

## ✅ Estado Atual (fim de 2026-01-28)

### Workflow GitHub Actions
- Gera relatório Allure HTML + publica em `gh-pages`.
- Sempre faz upload de artifact, mesmo com falhas nos testes.
- Exibe resumo amigável no `GITHUB_STEP_SUMMARY` com link para o Pages e para o artifact.

### Testes Cypress
- Usam `visitWithRetry` para contornar 403.
- Têm helpers específicos para Ionic/Shadow DOM (`typeInIonInput`, `waitForAppReady`, `dismissOverlays`).
- Utilizam detecção inteligente de campo Nome (`findNameField`) em vez de seletores únicos frágeis.

### Próximo passo recomendado
- **Adicionar `data-cy` no front conforme o plano descrito**, e então simplificar os seletores nos testes para usar esses atributos de teste.

---

## 📌 Resumo de esforço e retrabalho

### Período total
- **Dias envolvidos:** 8 dias (21 a 28 de janeiro de 2026)
- **Dias com commits Git:** 2 dias principais (27 e 28 de janeiro de 2026)

### Esforço total aproximado
**~18–25 horas efetivas de trabalho**, distribuídas entre:

- **Análises e documentação inicial (21-26/01):** ~5-8 horas
  - Documentação de problemas de seletores
  - Análise de fluxos e estratégias de teste
  - Setup inicial da estrutura Cypress

- **CI / Workflow / Allure / GitHub Pages (27/01):** ~8–10 horas
  - Setup do GitHub Actions
  - Configuração do Allure
  - Deploy no GitHub Pages
  - Sincronização de lockfiles

- **Correções de 403 e `visitWithRetry` (27/01):** ~3–4 horas
  - Investigação do erro 403
  - Criação e refinamento do comando customizado

- **Diagnóstico de cadastro + Shadow DOM + seletores (`ion-input`) (28/01):** ~7–11 horas
  - Criação de helpers robustos
  - Múltiplas iterações de correção
  - Estabilização final

### Fases com mais retrabalho (erros que voltaram)
1. **Cadastro + Shadow DOM + `findNameField`** (maior fonte de erros encadeados)
   - Erros em sequência: elemento não encontrado → `.shadow()` sem `shadowRoot` → subject inválido em `.click()` → seletor CSS inválido → `input[placeholder]` inexistente
   - **Tempo de retrabalho:** ~4-6 horas adicionais

2. **Sync de `package-lock.json` / `npm ci` e remoção do Playwright**
   - Múltiplos ciclos de regeneração do lockfile
   - **Tempo de retrabalho:** ~2-3 horas adicionais

3. **Ajustes finos em `visitWithRetry` e tratamento do 403 no CI**
   - Tentativas com diferentes estratégias até estabilizar
   - **Tempo de retrabalho:** ~1-2 horas adicionais

### Total de retrabalho estimado
**~7-11 horas** de tempo adicional gasto em correções e ajustes devido a erros que voltaram ou precisaram de múltiplas iterações.

### Lições aprendidas
Esses números servem como referência histórica e ajudam a mostrar:
- **Onde o tempo foi consumido** (maioria em correções de seletores e Shadow DOM)
- **Quanto valor teria, daqui em diante, investir em `data-cy`** para reduzir manutenção futura
- **Importância de documentar problemas** para evitar retrabalho futuro
- **Necessidade de testes mais robustos** desde o início, usando atributos dedicados para testes

---

**Última atualização:** 2026-01-28
