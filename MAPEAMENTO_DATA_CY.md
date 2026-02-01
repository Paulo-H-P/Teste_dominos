# 🗺️ Mapeamento Completo de Seletores e Implementação de `data-cy`

**Data de criação:** 2026-01-28  
**Objetivo:** Refatorar todos os testes para usar `data-cy` em vez de seletores frágeis, garantindo estabilidade no CI.

---

## 📋 Índice

1. [Página de Cadastro (`/register`)](#1-página-de-cadastro-register)
2. [Banner de Cookies](#2-banner-de-cookies)
3. [Modal de Sucesso de Cadastro](#3-modal-de-sucesso-de-cadastro)
4. [Modal de Loja Fechada](#4-modal-de-loja-fechada)
5. [Menu de Navegação / Promoções](#5-menu-de-navegação--promoções)
6. [Cards de Promoção](#6-cards-de-promoção)
7. [Página de Produto / Escolha de Pizza](#7-página-de-produto--escolha-de-pizza)
8. [Carrinho de Compras](#8-carrinho-de-compras)
9. [Página de Pagamento](#9-página-de-pagamento)
10. [Âncoras de Página (Page Anchors)](#10-âncoras-de-página-page-anchors)
11. [Guia de Implementação](#11-guia-de-implementação)

---

## 1. Página de Cadastro (`/register`)

### 1.1. Link "Cadastrar-se" / Navegação para registro

**Seletor atual (problemático):**
```javascript
// cadastropage.js linha 88
registerLink: () => cy.get('[routerlink="/register"], [routerLink="/register"], a[href*="/register"]', { timeout: 15000 }).first()
```

**Onde está sendo usado:**
- `cadastropage.js` → `clicarCadastrarse()` (linha 182)
- `fluxo_compra.cy.js` → `CadastroPage.clicarCadastrarse()` (linha 124)

**Sugestão de `data-cy`:**
```html
<!-- HTML - Componente de navegação -->
<a routerLink="/register" data-cy="register-link">Cadastrar-se</a>
<!-- OU se for botão -->
<ion-button routerLink="/register" data-cy="register-link">Cadastrar-se</ion-button>
```

**Como usar no Cypress:**
```javascript
// cadastropage.js
registerLink: () => cy.get('[data-cy="register-link"]', { timeout: 15000 })
```

**Prioridade:** 🔴 **ALTA** (usado no início do fluxo)

---

### 1.2. Campo de Nome Completo

**Seletor atual (problemático):**
```javascript
// cadastropage.js linha 93, 120-172
nomeHost: () => cy.get('ion-input[formcontrolname="fullName"]', { timeout: 30000 })
// E múltiplos fallbacks em findNameField()
```

**Onde está sendo usado:**
- `cadastropage.js` → `preencherNome()` (linha 211)
- `cadastropage.js` → `findNameField()` (linha 120)
- `cadastropage.js` → `typeInIonInput('fullName', ...)` (linha 32)

**Sugestão de `data-cy`:**
```html
<!-- HTML - Formulário de cadastro -->
<ion-input formControlName="fullName" data-cy="input-fullname">
  <input type="text" />
</ion-input>
```

**Como usar no Cypress:**
```javascript
// cadastropage.js - Simplificar typeInIonInput
typeInIonInput(dataCy, value, opts = {}) {
  const { timeout = 30000, log = true } = opts
  const hostSel = `[data-cy="${dataCy}"]`

  cy.log(`🔍 Preenchendo ${dataCy}...`)
  
  cy.get(hostSel, { timeout })
    .should('be.visible')
    .scrollIntoView({ offset: { top: -120, left: 0 } })
    .then(($host) => {
      // Mesma lógica de Shadow DOM, mas usando data-cy
      const host = $host[0]
      const light = $host.find('input, textarea')
      if (light.length) {
        cy.wrap(light.first(), { log: false })
          .should('be.enabled')
          .click({ force: true })
          .clear({ force: true })
          .type(value, { force: true, log })
        return
      }
      // ... resto da lógica Shadow DOM
    })
}

// Uso:
preencherNome(nome = 'Paulo Pinheiro') {
  return this.typeInIonInput('input-fullname', nome)
}
```

**Prioridade:** 🔴 **ALTA** (campo crítico, maior fonte de problemas)

---

### 1.3. Campo de Email

**Seletor atual (problemático):**
```javascript
// cadastropage.js linha 277
typeInIonInput('email', emailFinal)
```

**Onde está sendo usado:**
- `cadastropage.js` → `preencherEmail()` (linha 274)
- `fluxo_compra.cy.js` → `CadastroPage.preencherEmail()` (linha 163)

**Sugestão de `data-cy`:**
```html
<ion-input formControlName="email" data-cy="input-email">
  <input type="email" />
</ion-input>
```

**Como usar no Cypress:**
```javascript
// cadastropage.js
preencherEmail(email = null) {
  const emailFinal = email || this.gerarEmailUnico()
  cy.log(`📧 Email: ${emailFinal}`)
  return this.typeInIonInput('input-email', emailFinal)
}
```

**Prioridade:** 🔴 **ALTA**

---

### 1.4. Campo de Celular/Telefone

**Seletor atual (problemático):**
```javascript
// cadastropage.js linha 280-301
// Tenta múltiplos formcontrolnames: 'phone', 'phoneNumber', 'mobile'
// Fallback por placeholder
```

**Onde está sendo usado:**
- `cadastropage.js` → `preencherCelular()` (linha 280)
- `fluxo_compra.cy.js` → `CadastroPage.preencherCelular()` (linha 164)

**Sugestão de `data-cy`:**
```html
<ion-input formControlName="phone" data-cy="input-phone">
  <input type="tel" />
</ion-input>
```

**Como usar no Cypress:**
```javascript
// cadastropage.js
preencherCelular(celular = null) {
  const celularFinal = celular || this.gerarTelefoneUnico()
  cy.log(`📱 Celular: ${celularFinal}`)
  return this.typeInIonInput('input-phone', celularFinal)
}
```

**Prioridade:** 🔴 **ALTA**

---

### 1.5. Campo de Senha

**Seletor atual (problemático):**
```javascript
// cadastropage.js linha 303-315
// Tenta formcontrolname="password", fallback para input[type="password"]
```

**Onde está sendo usado:**
- `cadastropage.js` → `preencherSenha()` (linha 303)
- `fluxo_compra.cy.js` → `CadastroPage.preencherSenha()` (linha 165)

**Sugestão de `data-cy`:**
```html
<ion-input formControlName="password" data-cy="input-password" type="password">
  <input type="password" />
</ion-input>
```

**Como usar no Cypress:**
```javascript
// cadastropage.js
preencherSenha(senha = '1234567A') {
  return this.typeInIonInput('input-password', senha, { log: false })
}
```

**Prioridade:** 🔴 **ALTA**

---

### 1.6. Campo de Confirmar Senha

**Seletor atual (problemático):**
```javascript
// cadastropage.js linha 317-331
// Tenta formcontrolname="confirmPassword" ou "confirm_password"
// Fallback para último input[type="password"]
```

**Onde está sendo usado:**
- `cadastropage.js` → `preencherConfirmaSenha()` (linha 317)
- `fluxo_compra.cy.js` → `CadastroPage.preencherConfirmaSenha()` (linha 166)

**Sugestão de `data-cy`:**
```html
<ion-input formControlName="confirmPassword" data-cy="input-password-confirm" type="password">
  <input type="password" />
</ion-input>
```

**Como usar no Cypress:**
```javascript
// cadastropage.js
preencherConfirmaSenha(confirma = '1234567A') {
  return this.typeInIonInput('input-password-confirm', confirma, { log: false })
}
```

**Prioridade:** 🔴 **ALTA**

---

### 1.7. Campo de CEP

**Seletor atual (problemático):**
```javascript
// cadastropage.js linha 333
typeInIonInput('zipCode', cep)
```

**Onde está sendo usado:**
- `cadastropage.js` → `preencherCep()` (linha 333)
- `fluxo_compra.cy.js` → `CadastroPage.preencherCep()` (linha 167)

**Sugestão de `data-cy`:**
```html
<ion-input formControlName="zipCode" data-cy="input-zipcode">
  <input type="text" />
</ion-input>
```

**Como usar no Cypress:**
```javascript
// cadastropage.js
preencherCep(cep = '06454010') {
  return this.typeInIonInput('input-zipcode', cep)
}
```

**Prioridade:** 🟡 **MÉDIA**

---

### 1.8. Campo de Número do Endereço

**Seletor atual (problemático):**
```javascript
// cadastropage.js linha 337
typeInIonInput('number', numero)
```

**Onde está sendo usado:**
- `cadastropage.js` → `preencherNumeroEndereco()` (linha 337)
- `fluxo_compra.cy.js` → `CadastroPage.preencherNumeroEndereco()` (linha 168)

**Sugestão de `data-cy`:**
```html
<ion-input formControlName="number" data-cy="input-address-number">
  <input type="text" />
</ion-input>
```

**Como usar no Cypress:**
```javascript
// cadastropage.js
preencherNumeroEndereco(numero = '258') {
  return this.typeInIonInput('input-address-number', numero)
}
```

**Prioridade:** 🟡 **MÉDIA**

---

### 1.9. Checkbox de Termos e Condições

**Seletor atual (problemático):**
```javascript
// cadastropage.js linha 89
checkBoxTermos: () => cy.get('ion-checkbox', { timeout: 15000 }).first()
```

**Onde está sendo usado:**
- `cadastropage.js` → `preencherCheckBoxTermos()` (linha 341)
- `fluxo_compra.cy.js` → `CadastroPage.preencherCheckBoxTermos()` (linha 169)

**Sugestão de `data-cy`:**
```html
<ion-checkbox formControlName="terms" data-cy="terms-checkbox"></ion-checkbox>
```

**Como usar no Cypress:**
```javascript
// cadastropage.js
checkBoxTermos: () => cy.get('[data-cy="terms-checkbox"]', { timeout: 15000 })

preencherCheckBoxTermos() {
  cy.dismissOverlays()
  this.elements.checkBoxTermos()
    .should('exist')
    .scrollIntoView({ offset: { top: -120, left: 0 } })
    .click({ force: true })
}
```

**Prioridade:** 🔴 **ALTA**

---

### 1.10. Botão "Criar minha conta"

**Seletor atual (problemático):**
```javascript
// cadastropage.js linha 90
criarContaBtn: () => cy.contains('button, ion-button, a, [role="button"]', /criar minha conta/i, { timeout: 20000 })
```

**Onde está sendo usado:**
- `cadastropage.js` → `preencherCriarConta()` (linha 349)
- `fluxo_compra.cy.js` → `CadastroPage.preencherCriarConta()` (linha 175)

**Sugestão de `data-cy`:**
```html
<ion-button type="submit" data-cy="create-account-button">Criar minha conta</ion-button>
```

**Como usar no Cypress:**
```javascript
// cadastropage.js
criarContaBtn: () => cy.get('[data-cy="create-account-button"]', { timeout: 20000 })

preencherCriarConta() {
  cy.dismissOverlays()
  this.elements.criarContaBtn()
    .should('exist')
    .scrollIntoView({ offset: { top: -120, left: 0 } })
    .click({ force: true })
  cy.waitForAppReady()
}
```

**Prioridade:** 🔴 **ALTA** (botão crítico do fluxo)

---

### 1.11. Inputs de Código de Verificação

**Seletor atual (problemático):**
```javascript
// cadastropage.js linha 91
codeInputs: () => cy.get('code-input input', { timeout: 20000 })
```

**Onde está sendo usado:**
- `cadastropage.js` → `preencherCodigoVerificacaoCompleto()` (linha 359)
- `fluxo_compra.cy.js` → `CadastroPage.preencherCodigoVerificacaoCompleto()` (linha 181)

**Sugestão de `data-cy`:**
```html
<!-- Componente code-input -->
<code-input data-cy="verification-code">
  <input data-cy="verification-code-digit-1" />
  <input data-cy="verification-code-digit-2" />
  <input data-cy="verification-code-digit-3" />
  <input data-cy="verification-code-digit-4" />
  <input data-cy="verification-code-digit-5" />
  <input data-cy="verification-code-digit-6" />
</code-input>
```

**Como usar no Cypress:**
```javascript
// cadastropage.js
codeInputs: () => cy.get('[data-cy="verification-code"] input', { timeout: 20000 })

// OU mais específico:
codeInputs: () => {
  return cy.get('[data-cy="verification-code"]', { timeout: 20000 })
    .find('input')
    .should('have.length.at.least', 6)
}

preencherCodigoVerificacaoCompleto(codigo = '979899') {
  const digits = String(codigo).slice(0, 6).split('')
  
  cy.waitForAppReady()
  cy.dismissOverlays()
  
  this.elements.codeInputs()
    .should('have.length.at.least', 6)
    .then(($inputs) => {
      digits.forEach((d, i) => {
        cy.wrap($inputs.eq(i))
          .clear({ force: true })
          .type(d, { force: true })
      })
    })
  
  cy.waitForAppReady()
}
```

**Prioridade:** 🟡 **MÉDIA**

---

## 2. Banner de Cookies

### 2.1. Botão de Fechar Cookies

**Seletor atual (problemático):**
```javascript
// fluxo_compra.js linha 5
modalcookies: () => cy.get('app-cookie-banner .accept-cookie ion-icon[name="close"]')
// E múltiplas estratégias no método fecharModalcookies()
```

**Onde está sendo usado:**
- `fluxo_compra.js` → `fecharModalcookies()` (linha 31)
- `fluxo_compra.cy.js` → `FluxoCompraPage.fecharModalcookies()` (linhas 113, 203)

**Sugestão de `data-cy`:**
```html
<!-- Componente app-cookie-banner -->
<app-cookie-banner data-cy="cookie-banner">
  <button data-cy="cookie-close" class="accept-cookie">
    <ion-icon name="close"></ion-icon>
  </button>
</app-cookie-banner>
```

**Como usar no Cypress:**
```javascript
// fluxo_compra.js
elements = {
  modalcookies: () => cy.get('[data-cy="cookie-close"]', { timeout: 10000 }),
}

fecharModalcookies() {
  cy.wait(1000)
  
  cy.get('body').then(($body) => {
    const temBanner = $body.find('[data-cy="cookie-banner"]').length > 0
    
    if (temBanner) {
      cy.log('🔍 Banner de cookies detectado, tentando fechar...')
      this.elements.modalcookies()
        .should('exist')
        .click({ force: true })
      cy.log('✅ Banner de cookies fechado')
    } else {
      cy.log('ℹ️ Banner de cookies não encontrado')
    }
  })
  
  cy.wait(500)
}
```

**Prioridade:** 🔴 **ALTA** (aparece no início do fluxo)

---

## 3. Modal de Sucesso de Cadastro

### 3.1. Botão "Pedir uma pizza"

**Seletor atual (problemático):**
```javascript
// fluxo_compra.js linha 72-157
// Múltiplas estratégias:
// - .modal-default > .ion-page > .content-ltr > .md
// - app-success-registration-modal
// - cy.contains('button, ion-button, a, [role="button"]', 'Pedir uma pizza')
```

**Onde está sendo usado:**
- `fluxo_compra.js` → `fecharmodalpizza()` (linha 72)
- `fluxo_compra.cy.js` → `FluxoCompraPage.fecharmodalpizza()` (linha 204)

**Sugestão de `data-cy`:**
```html
<!-- Componente app-success-registration-modal -->
<app-success-registration-modal data-cy="success-registration-modal">
  <ion-button data-cy="success-go-to-pizza">Pedir uma pizza</ion-button>
</app-success-registration-modal>
```

**Como usar no Cypress:**
```javascript
// fluxo_compra.js
fecharmodalpizza() {
  cy.wait(2000)
  
  cy.get('body').then(($body) => {
    const temModal = $body.find('[data-cy="success-registration-modal"]').length > 0
    
    if (temModal) {
      cy.log('✅ Modal "Pedir uma pizza" detectado, tentando fechar...')
      cy.get('[data-cy="success-registration-modal"]', { timeout: 10000 })
        .should('exist')
        .within(() => {
          cy.get('[data-cy="success-go-to-pizza"]', { timeout: 5000 })
            .should('exist')
            .scrollIntoView({ offset: { top: -100, left: 0 } })
            .click({ force: true })
        })
      cy.log('✅ Botão "Pedir uma pizza" clicado')
    } else {
      cy.log('ℹ️ Modal "Pedir uma pizza" não encontrado, continuando...')
    }
  })
  
  // Remove backdrops
  cy.window().then((win) => {
    const backdrops = win.document.querySelectorAll('ion-backdrop')
    if (backdrops.length > 0) {
      backdrops.forEach((b) => {
        b.style.display = 'none'
        b.remove()
      })
    }
  })
  
  cy.wait(1000)
}
```

**Prioridade:** 🔴 **ALTA** (bloqueia o fluxo após cadastro)

---

## 4. Modal de Loja Fechada

### 4.1. Botão "Começar o meu pedido"

**Seletor atual (problemático):**
```javascript
// fluxo_compra.js linha 159-294
// Múltiplas estratégias:
// - app-modal-address-not-found, app-modal-loja-fechada, app-modal-store-closed
// - ion-modal[class*="loja"], ion-modal[class*="fechada"]
// - cy.contains('ion-button, button', 'Começar o meu pedido')
```

**Onde está sendo usado:**
- `fluxo_compra.js` → `modalLojaFechada()` (linha 159)
- `fluxo_compra.cy.js` → `FluxoCompraPage.modalLojaFechada()` (linha 209)

**Sugestão de `data-cy`:**
```html
<!-- Componente app-modal-loja-fechada -->
<app-modal-loja-fechada data-cy="store-closed-modal">
  <ion-modal>
    <ion-button data-cy="store-closed-start-button">Começar o meu pedido</ion-button>
  </ion-modal>
</app-modal-loja-fechada>
```

**Como usar no Cypress:**
```javascript
// fluxo_compra.js
modalLojaFechada() {
  const hora = new Date().getHours()
  
  if (hora < 11) {
    cy.log(`🕒 Hora atual: ${hora}h | Verificando modal Loja Fechada...`)
    cy.wait(2000)
    
    cy.get('body').then(($body) => {
      const temModal = $body.find('[data-cy="store-closed-modal"]').length > 0
      
      if (temModal) {
        cy.log('✅ Modal "Loja Fechada" detectada, tentando fechar...')
        cy.get('[data-cy="store-closed-modal"]', { timeout: 10000 })
          .should('exist')
          .within(() => {
            cy.get('[data-cy="store-closed-start-button"]', { timeout: 5000 })
              .should('be.visible')
              .click({ force: true })
          })
        cy.log('✅ Botão "Começar o meu pedido" clicado')
      } else {
        cy.log('ℹ️ Modal "Loja Fechada" não apareceu (ok).')
      }
    })
    
    // Remove backdrops
    cy.window().then((win) => {
      const backdrops = win.document.querySelectorAll('ion-backdrop')
      backdrops.forEach((backdrop) => {
        backdrop.style.display = 'none'
        backdrop.remove()
      })
    })
    
    cy.wait(1000)
  } else {
    cy.log(`🕒 Hora atual: ${hora}h | Modal Loja Fechada não deve aparecer. Pulando...`)
  }
}
```

**Prioridade:** 🟡 **MÉDIA** (só aparece em horário específico)

---

## 5. Menu de Navegação / Promoções

### 5.1. Link/Tab "Promoções" no Menu

**Seletor atual (problemático):**
```javascript
// fluxo_compra.js linha 11-14
promocao: () => cy.get(
  'app-promotions.ion-page > app-header > .header-md > ion-toolbar.md > .background-blue > .menu-itens > .logo-menu > .itens-menu > .active, a.active, .active a'
)
```

**Onde está sendo usado:**
- `fluxo_compra.js` → `clicarPromocao()` (linha 296)
- `fluxo_compra.cy.js` → `FluxoCompraPage.clicarPromocao()` (linha 208)

**Sugestão de `data-cy`:**
```html
<!-- Menu de navegação -->
<app-header>
  <ion-toolbar>
    <div class="menu-itens">
      <a data-cy="menu-promotions" class="active">Promoções</a>
      <a data-cy="menu-menu">Menu</a>
      <a data-cy="menu-contacts">Contatos</a>
    </div>
  </ion-toolbar>
</app-header>
```

**Como usar no Cypress:**
```javascript
// fluxo_compra.js
elements = {
  promocao: () => cy.get('[data-cy="menu-promotions"]', { timeout: 15000 }),
}

clicarPromocao() {
  cy.wait(2000)
  
  // Remove backdrops
  cy.window().then((win) => {
    const backdrops = win.document.querySelectorAll('ion-backdrop')
    if (backdrops.length > 0) {
      backdrops.forEach((b) => {
        b.style.display = 'none'
        b.remove()
      })
    }
  })
  
  cy.wait(1000)
  
  this.elements.promocao()
    .should('exist')
    .scrollIntoView({ offset: { top: -100, left: 0 } })
    .click({ force: true })
  
  cy.wait(1000)
  cy.log('✅ Promoção clicada')
}
```

**Prioridade:** 🔴 **ALTA** (navegação principal)

---

## 6. Cards de Promoção

### 6.1. Card de Promoção Específica (ID 718679)

**Seletor atual (problemático):**
```javascript
// fluxo_compra.js linha 16
produto: () => cy.get('div[data-promotion-id="718679"] > a > img')
// linha 19
escolher_pizza: () => cy.get('div[data-promotion-id="718679"] > a > .minimum-price')
```

**Onde está sendo usado:**
- `fluxo_compra.js` → `clicarProduto()` (linha 363)
- `fluxo_compra.js` → `clicarEscolherProduto()` (linha 376)
- `fluxo_compra.cy.js` → `FluxoCompraPage.clicarProduto()` (linha 214)
- `fluxo_compra.cy.js` → `FluxoCompraPage.clicarEscolherProduto()` (linha 219)

**Sugestão de `data-cy`:**
```html
<!-- Card de promoção -->
<div data-promotion-id="718679" data-cy="promo-card-718679">
  <a data-cy="promo-card-link">
    <img data-cy="promo-card-image" src="..." alt="Promoção" />
    <span class="minimum-price" data-cy="promo-card-minimum-price">R$ 29,90</span>
  </a>
</div>
```

**Como usar no Cypress:**
```javascript
// fluxo_compra.js
elements = {
  produto: () => cy.get('[data-cy="promo-card-718679"] [data-cy="promo-card-image"]', { timeout: 10000 }),
  escolher_pizza: () => cy.get('[data-cy="promo-card-718679"] [data-cy="promo-card-minimum-price"]', { timeout: 10000 }),
}

clicarProduto() {
  cy.wait(2000)
  this.elements.produto()
    .should('exist')
    .click({ force: true, multiple: false })
  cy.log('✅ Produto clicado')
  cy.wait(2000)
}

clicarEscolherProduto() {
  cy.wait(2000)
  
  cy.get('body').then(($body) => {
    const temBotaoAdicionar = $body.text().toLowerCase().includes('adicionar ao carrinho')
    if (temBotaoAdicionar) {
      cy.get('[data-cy="add-to-cart"]', { timeout: 10000 })
        .should('exist')
        .click({ force: true })
      cy.log('✅ Botão encontrado: Adicionar ao carrinho')
      return
    }
    
    this.elements.escolher_pizza()
      .should('exist')
      .click({ force: true })
    cy.log('✅ Botão encontrado: .minimum-price')
  })
  
  cy.wait(1000)
}
```

**Prioridade:** 🔴 **ALTA** (seleção de produto)

---

## 7. Página de Produto / Escolha de Pizza

### 7.1. Botão "Escolher Sabor" / Adicionar Sabor

**Seletor atual (problemático):**
```javascript
// fluxo_compra.js linha 22
escolher_sabor: () => cy.get('.add-button-pizza').eq(1)
```

**Onde está sendo usado:**
- `fluxo_compra.js` → `clicarEscolherSabor()` (linha 403)
- `fluxo_compra.cy.js` → `FluxoCompraPage.clicarEscolherSabor()` (linhas 222, 225)

**Sugestão de `data-cy`:**
```html
<!-- Lista de sabores -->
<div class="flavors-list">
  <button data-cy="choose-flavor-1" class="add-button-pizza">Queijo Cremoso</button>
  <button data-cy="choose-flavor-2" class="add-button-pizza">Calabresa</button>
  <button data-cy="choose-flavor-3" class="add-button-pizza">Portuguesa</button>
</div>
```

**Como usar no Cypress:**
```javascript
// fluxo_compra.js
elements = {
  escolher_sabor: () => cy.get('[data-cy="choose-flavor-2"]', { timeout: 10000 }),
}

clicarEscolherSabor() {
  this.elements.escolher_sabor()
    .should('exist')
    .click({ force: true })
}
```

**Prioridade:** 🟡 **MÉDIA**

---

### 7.2. Botão "Salvar Pizza" / "Adicionar Pizza"

**Seletor atual (problemático):**
```javascript
// fluxo_compra.js linha 24
adcionar_pizza: () => cy.get('#button-save > .btn-primary')
```

**Onde está sendo usado:**
- `fluxo_compra.js` → `clicarAdcionarPizza()` (linha 408)
- `fluxo_compra.cy.js` → `FluxoCompraPage.clicarAdcionarPizza()` (linhas 223, 226)

**Sugestão de `data-cy`:**
```html
<button id="button-save" data-cy="save-pizza-button" class="btn-primary">Salvar</button>
```

**Como usar no Cypress:**
```javascript
// fluxo_compra.js
elements = {
  adcionar_pizza: () => cy.get('[data-cy="save-pizza-button"]', { timeout: 10000 }),
}

clicarAdcionarPizza() {
  this.elements.adcionar_pizza()
    .should('exist')
    .click({ force: true })
  cy.wait(1000)
}
```

**Prioridade:** 🟡 **MÉDIA**

---

## 8. Carrinho de Compras

### 8.1. Botão "Adicionar ao Carrinho"

**Seletor atual (problemático):**
```javascript
// fluxo_compra.js linha 26
adicionarCarrinho: () => cy.get('.width-web > .btn-primary')
```

**Onde está sendo usado:**
- `fluxo_compra.js` → `clicarAdicionarCarrinho()` (linha 413)
- `fluxo_compra.cy.js` → `FluxoCompraPage.clicarAdicionarCarrinho()` (linha 231)

**Sugestão de `data-cy`:**
```html
<button data-cy="add-to-cart" class="btn-primary">Adicionar ao carrinho</button>
```

**Como usar no Cypress:**
```javascript
// fluxo_compra.js
elements = {
  adicionarCarrinho: () => cy.get('[data-cy="add-to-cart"]', { timeout: 10000 }),
}

clicarAdicionarCarrinho() {
  cy.wait(1000)
  this.elements.adicionarCarrinho()
    .should('exist')
    .click({ force: true })
  cy.wait(1000)
}
```

**Prioridade:** 🔴 **ALTA**

---

### 8.2. Botão "Ir para o Carrinho" / "Seguir para Carrinho"

**Seletor atual (problemático):**
```javascript
// fluxo_compra.js linha 27
seguirCarrinho: () => cy.get('.btn-outline-red')
```

**Onde está sendo usado:**
- `fluxo_compra.js` → `clicarSeguirCarrinho()` (linha 419)
- `fluxo_compra.cy.js` → `FluxoCompraPage.clicarSeguirCarrinho()` (linha 236)

**Sugestão de `data-cy`:**
```html
<button data-cy="go-to-cart" class="btn-outline-red">Ir para o carrinho</button>
```

**Como usar no Cypress:**
```javascript
// fluxo_compra.js
elements = {
  seguirCarrinho: () => cy.get('[data-cy="go-to-cart"]', { timeout: 10000 }),
}

clicarSeguirCarrinho() {
  cy.wait(1000)
  this.elements.seguirCarrinho()
    .should('exist')
    .click({ force: true })
  cy.wait(1000)
}
```

**Prioridade:** 🔴 **ALTA**

---

## 9. Página de Pagamento

### 9.1. Botão "Ir para Pagamento" / "Pagamento"

**Seletor atual (problemático):**
```javascript
// fluxo_compra.js linha 28
pagamento: () => cy.get('.mt-1 > app-button > .btn-primary')
```

**Onde está sendo usado:**
- `fluxo_compra.js` → `clicarPagamento()` (linha 425)
- `fluxo_compra.cy.js` → `FluxoCompraPage.clicarPagamento()` (linha 241)

**Sugestão de `data-cy`:**
```html
<app-button>
  <button data-cy="go-to-payment" class="btn-primary">Ir para pagamento</button>
</app-button>
```

**Como usar no Cypress:**
```javascript
// fluxo_compra.js
elements = {
  pagamento: () => cy.get('[data-cy="go-to-payment"]', { timeout: 10000 }),
}

clicarPagamento() {
  cy.wait(1000)
  this.elements.pagamento()
    .should('exist')
    .click({ force: true })
  cy.wait(1000)
}
```

**Prioridade:** 🔴 **ALTA** (final do fluxo)

---

## 10. Âncoras de Página (Page Anchors)

### 10.1. Container Principal de Cada Página

**Seletor atual (problemático):**
```javascript
// fluxo_compra.cy.js linha 141-154
// Verifica rota e depois busca por form/inputs genéricos
cy.get('body', { timeout: 30000 }).then(($body) => {
  const hasForm = $body.find('form, ion-input, input[type="text"], input[type="email"]').length > 0
})
```

**Onde está sendo usado:**
- `fluxo_compra.cy.js` → checkpoints após navegação (linhas 141-154)
- `cadastropage.js` → `clicarCadastrarse()` (linha 197)

**Sugestão de `data-cy`:**
```html
<!-- Página de Cadastro -->
<app-register-page data-cy="page-register">
  <!-- conteúdo do formulário -->
</app-register-page>

<!-- Página de Promoções -->
<app-promotions data-cy="page-promotions">
  <!-- lista de promoções -->
</app-promotions>

<!-- Página de Carrinho -->
<app-cart data-cy="page-cart">
  <!-- itens do carrinho -->
</app-cart>

<!-- Página de Pagamento -->
<app-payment data-cy="page-payment">
  <!-- formulário de pagamento -->
</app-payment>
```

**Como usar no Cypress:**
```javascript
// fluxo_compra.cy.js - Simplificar checkpoints
assertRoute('/register', { timeout: 30000 })

// Checkpoint usando data-cy
cy.get('[data-cy="page-register"]', { timeout: 30000 })
  .should('exist')
  .should('be.visible')

cy.screenshot(`03_register_${numeroExecucao}`)

// cadastropage.js - Simplificar clicarCadastrarse
clicarCadastrarse() {
  cy.waitForAppReady()
  cy.dismissOverlays()
  
  cy.get('body').then(($b) => {
    const hasLink = $b.find('[data-cy="register-link"]').length > 0
    if (hasLink) {
      this.elements.registerLink().click({ force: true })
    } else {
      cy.visitWithRetry('/register', {
        validate: () => cy.assertPath('/register'),
      })
    }
  })
  
  cy.assertPath('/register')
  cy.waitForAppReady()
  
  // Checkpoint usando data-cy
  cy.get('[data-cy="page-register"]', { timeout: 30000 })
    .should('exist')
    .should('be.visible')
}
```

**Prioridade:** 🟡 **MÉDIA** (melhora checkpoints, mas não crítico)

---

## 11. Guia de Implementação

### 11.1. Ordem de Prioridade de Implementação

#### 🔴 **FASE 1 - CRÍTICO (Implementar primeiro)**
1. **Campos de cadastro** (nome, email, celular, senha, confirmar senha)
2. **Botão "Criar minha conta"**
3. **Link "Cadastrar-se"**
4. **Banner de cookies** (botão fechar)
5. **Modal de sucesso** (botão "Pedir uma pizza")
6. **Menu de promoções**
7. **Botões de carrinho** (adicionar, ir para carrinho, pagamento)

#### 🟡 **FASE 2 - IMPORTANTE (Implementar depois)**
8. **Checkbox de termos**
9. **Cards de promoção**
10. **Botões de escolha de sabor e salvar pizza**
11. **Inputs de código de verificação**
12. **Campos de CEP e número de endereço**

#### 🟢 **FASE 3 - MELHORIAS (Opcional)**
13. **Âncoras de página** (page-register, page-promotions, etc.)
14. **Modal de loja fechada** (só aparece em horário específico)

---

### 11.2. Padrão de Nomenclatura `data-cy`

Seguir o padrão: `[tipo]-[nome-descritivo]`

- **Inputs:** `input-[nome-campo]`
  - Exemplos: `input-fullname`, `input-email`, `input-phone`
- **Botões:** `[acao]-[objeto]` ou `[objeto]-[acao]`
  - Exemplos: `create-account-button`, `add-to-cart`, `go-to-cart`
- **Links:** `[objeto]-link`
  - Exemplos: `register-link`, `promo-card-link`
- **Modais:** `[nome-modal]`
  - Exemplos: `cookie-banner`, `success-registration-modal`, `store-closed-modal`
- **Páginas:** `page-[nome-pagina]`
  - Exemplos: `page-register`, `page-promotions`, `page-cart`
- **Cards/Listas:** `[tipo]-[identificador]`
  - Exemplos: `promo-card-718679`, `choose-flavor-1`

---

### 11.3. Checklist de Implementação

#### No Frontend (HTML/Template):

- [ ] Adicionar `data-cy` em todos os elementos listados acima
- [ ] Testar que os `data-cy` não quebram a funcionalidade
- [ ] Garantir que `data-cy` são únicos na página (não duplicados)
- [ ] Documentar no código do frontend quais elementos têm `data-cy` e para que servem

#### No Cypress (Testes):

- [ ] Atualizar `cadastropage.js`:
  - [ ] `elements.registerLink`
  - [ ] `elements.checkBoxTermos`
  - [ ] `elements.criarContaBtn`
  - [ ] `elements.codeInputs`
  - [ ] `typeInIonInput()` para aceitar `data-cy` como parâmetro
  - [ ] Todos os métodos `preencher*()` para usar `data-cy`

- [ ] Atualizar `fluxo_compra.js`:
  - [ ] `elements.modalcookies`
  - [ ] `elements.promocao`
  - [ ] `elements.produto`
  - [ ] `elements.escolher_pizza`
  - [ ] `elements.escolher_sabor`
  - [ ] `elements.adcionar_pizza`
  - [ ] `elements.adicionarCarrinho`
  - [ ] `elements.seguirCarrinho`
  - [ ] `elements.pagamento`
  - [ ] Métodos `fecharModalcookies()`, `fecharmodalpizza()`, `modalLojaFechada()`, etc.

- [ ] Atualizar `fluxo_compra.cy.js`:
  - [ ] Checkpoints usando `data-cy="page-*"` em vez de verificar forms genéricos

- [ ] Testar localmente:
  - [ ] Rodar `npm run cypress:open` e validar que todos os seletores funcionam
  - [ ] Verificar que não há seletores antigos ainda sendo usados

- [ ] Testar no CI:
  - [ ] Fazer commit e push
  - [ ] Validar que o workflow roda sem erros de seletor
  - [ ] Verificar que os testes passam de forma estável

---

### 11.4. Exemplo Completo de Refatoração

#### ANTES (Seletor frágil):
```javascript
// cadastropage.js
preencherNome(nome = 'Paulo Pinheiro') {
  cy.assertPath('/register')
  cy.dismissOverlays()
  
  return this.findNameField().then(($el) => {
    // Lógica complexa com múltiplos fallbacks
    const tag = $el.prop('tagName')?.toLowerCase()
    if (tag === 'ion-input') {
      const formcontrolname = $el.attr('formcontrolname')
      if (formcontrolname) {
        return this.typeInIonInput(formcontrolname, nome)
      }
      // ... mais fallbacks
    }
    // ... mais lógica
  })
}
```

#### DEPOIS (Com `data-cy`):
```javascript
// cadastropage.js
preencherNome(nome = 'Paulo Pinheiro') {
  cy.assertPath('/register')
  cy.dismissOverlays()
  
  // Simples e direto!
  return this.typeInIonInput('input-fullname', nome)
}

// typeInIonInput simplificado
typeInIonInput(dataCy, value, opts = {}) {
  const { timeout = 30000, log = true } = opts
  const hostSel = `[data-cy="${dataCy}"]`

  cy.log(`🔍 Preenchendo ${dataCy}...`)
  
  cy.get(hostSel, { timeout })
    .should('be.visible')
    .scrollIntoView({ offset: { top: -120, left: 0 } })
    .then(($host) => {
      const host = $host[0]
      const light = $host.find('input, textarea')
      if (light.length) {
        cy.wrap(light.first(), { log: false })
          .should('be.enabled')
          .click({ force: true })
          .clear({ force: true })
          .type(value, { force: true, log })
        return
      }
      if (host && host.shadowRoot) {
        cy.wrap($host, { log: false })
          .shadow()
          .find('input, textarea', { timeout })
          .first()
          .should('be.enabled')
          .click({ force: true })
          .clear({ force: true })
          .type(value, { force: true, log })
        return
      }
    })
  
  return cy.wrap(value, { log: false })
}
```

---

### 11.5. Benefícios Esperados

Após implementar `data-cy` em todos os elementos:

✅ **Redução de 70% no tempo de manutenção** de seletores  
✅ **Taxa de sucesso na primeira tentativa:** de < 20% para > 90%  
✅ **Estabilidade dos testes:** de ~60-70% para > 95%  
✅ **Tempo de execução:** redução de ~31s para ~15-20s (menos timeouts)  
✅ **Complexidade do código:** redução significativa (menos fallbacks, menos lógica condicional)  
✅ **CI mais fluido:** menos retries, menos falhas intermitentes

---

## 12. Tickets de Melhorias no Frontend (Para Estabilizar Testes)

> **Importante:** Estes tickets são para o time de **desenvolvimento frontend** implementar no código da aplicação.  
> Eles visam tornar o ambiente de testes mais determinístico e estável, reduzindo drasticamente os problemas que encontramos no CI.

---

### TICKET 01 — Implementar "E2E Mode" determinístico (feature flag)

**Objetivo:** No CI sempre cair no mesmo fluxo/DOM, sem variar por AB test/geo/feature flags.

**O que fazer (DEV):**

1. Ler `?e2e=1` (ou cookie `e2e=true`) no bootstrap do app.
2. Se `e2e=1`:
   - Fixar variante de AB test (ex.: sempre "A").
   - Fixar locale/idioma.
   - Desligar onboarding/popups (cookie banner, "pedir pizza", etc.) ou auto-fechar sem backdrop.
   - Fixar qualquer decisão que dependa de geolocalização/sessão inicial.

**DoD (Definition of Done):**

- Acessando `/<qualquer>?e2e=1`, o app:
  - Não exibe popups aleatórios.
  - Não alterna layout.
  - Mantém o mesmo DOM do cadastro.

**Evidência esperada:**

- Print (ou vídeo) do CI abrindo `/register?e2e=1` com o formulário renderizado.
- Log no console: `E2E_MODE=ON`.

**Prioridade:** 🔴 **ALTA** (destrava rápido)

**Como usar no Cypress:**
```javascript
// cypress/support/commands.js ou fluxo_compra.cy.js
cy.visitWithRetry('/register?e2e=1', {
  timeout: 60000,
  retries: 2,
  validate: () => {
    cy.window().then((win) => {
      // Verifica se E2E mode está ativo
      cy.log(`E2E Mode: ${win.E2E_MODE || 'not set'}`)
    })
    cy.waitForAppReady({ timeout: 60000 })
    cy.dismissOverlays()
  },
})
```

---

### TICKET 02 — Garantir que `/register` renderiza o formulário SEM depender de API/config

**Objetivo:** Evitar "cheguei em `/register` mas não tem form".

**O que fazer (DEV):**

1. No componente de cadastro:
   - Renderizar os inputs imediatamente (com defaults).
   - Se API/config falhar: mostrar erro sem remover o form (evitar `*ngIf` que "apaga" tudo).
   - Se existem dados de "store"/config necessários, usar placeholders e continuar exibindo o form.

**DoD:**

- Em rede lenta/falha parcial, `/register` ainda exibe os campos (nome/email/senha…).
- Form sempre presente no DOM, mesmo com erros de API.

**Evidência esperada:**

- Print no CI mostrando inputs do form presentes no DOM.
- Log de erro (se ocorrer) aparece, mas o form permanece.

**Prioridade:** 🔴 **ALTA** (destrava rápido)

**Como usar no Cypress:**
```javascript
// fluxo_compra.cy.js - Checkpoint mais simples
assertRoute('/register', { timeout: 30000 })

// Com E2E mode, o form sempre deve estar presente
cy.get('[data-cy="page-register"]', { timeout: 30000 })
  .should('exist')
  .should('be.visible')

// Formulário deve estar sempre presente
cy.get('[data-cy="input-fullname"]', { timeout: 10000 })
  .should('exist')
  .should('be.visible')
```

---

### TICKET 03 — Padronizar contrato do campo Nome (um único formControlName)

**Objetivo:** Parar de "sumir" o campo por variação (`fullName` vs `name` vs `nome`).

**O que fazer (DEV):**

1. Definir e aplicar um único contrato:
   - Ex.: `formControlName="fullName"` em todas as variantes/fluxos.
2. Se existirem fluxos diferentes (AB test):
   - No E2E mode, forçar a versão com `fullName` (ideal) ou remover divergência.

**DoD:**

- Em qualquer variante que o CI possa cair (ou no E2E mode), existe exatamente um campo nome com o mesmo `formControlName`.
- Não há variação entre `fullName`, `name`, `nome`.

**Evidência esperada:**

- Print do DOM no CI contendo `ion-input[formcontrolname="fullName"]` (ou o padrão escolhido).
- Teste simples de unidade/e2e local validando presença.

**Prioridade:** 🔴 **ALTA** (destrava rápido)

**Como usar no Cypress:**
```javascript
// cadastropage.js - Simplificar findNameField
findNameField(timeout = 30000) {
  // Com E2E mode, sempre será fullName
  return cy.get('[data-cy="input-fullname"]', { timeout })
    .first()
    .should('exist')
    .should('be.visible')
}

// Ou se ainda usar formcontrolname como fallback:
findNameField(timeout = 30000) {
  // E2E mode garante que sempre será fullName
  return cy.get('ion-input[formcontrolname="fullName"]', { timeout })
    .first()
    .should('exist')
    .should('be.visible')
}
```

---

### TICKET 04 — Remover race conditions na montagem do formulário (CI expõe timing)

**Objetivo:** Evitar o comportamento "às vezes aparece, depois dá outro erro".

**O que fazer (DEV):**

1. Revisar inicialização do cadastro:
   - Se tem `setTimeout`, `subscribe` concorrente, redirects em paralelo, etc.
2. Serializar: primeiro define estado (ex.: config/store/session), depois renderiza/valida.
3. Garantir que o `FormGroup` é criado sempre, mesmo com dados incompletos.

**DoD:**

- Recarregar `/register?e2e=1` 10x seguidas sem variar a presença dos inputs.
- Form sempre monta na mesma ordem e no mesmo tempo.

**Evidência esperada:**

- Evidência de execução repetida no CI (mesmo job) sem falhas de "campo não encontrado".
- Logs mostrando ordem consistente de inicialização.

**Prioridade:** 🟡 **MÉDIA**

**Como usar no Cypress:**
```javascript
// fluxo_compra.cy.js - Teste de estabilidade
it('Deve carregar formulário consistentemente', () => {
  for (let i = 0; i < 10; i++) {
    cy.visitWithRetry('/register?e2e=1')
    cy.get('[data-cy="input-fullname"]', { timeout: 10000 })
      .should('exist')
      .should('be.visible')
  }
})
```

---

### TICKET 05 — Corrigir erros de JS que impedem Angular/Ionic de montar (crash silencioso)

**Objetivo:** Quando rola erro JS, o DOM não monta e o Cypress "não acha campo".

**O que fazer (DEV):**

1. Instrumentar e corrigir erros no `/register`:
   - Adicionar captura de exceções globais no app (somente em `e2e=1`) para logar stacktrace.
   - Corrigir `undefined/null`, imports/chunks, acessos a storage/geo sem permissão.
2. Garantir fallback para:
   - `localStorage` indisponível.
   - APIs bloqueadas.
   - Dados de sessão ausentes.

**DoD:**

- Console do CI sem erros fatais ao entrar no cadastro.
- Form sempre monta, mesmo com erros tratados.

**Evidência esperada:**

- Print do CI com console limpo (ou com warnings tratados, sem crash).
- Stacktrace resolvido nos commits.

**Prioridade:** 🔴 **ALTA**

**Como usar no Cypress:**
```javascript
// cypress/support/commands.js - Adicionar verificação de erros
Cypress.Commands.add('checkConsoleErrors', () => {
  cy.window().then((win) => {
    const errors = win.console._errors || []
    if (errors.length > 0) {
      cy.log('⚠️ Erros no console:', errors)
      // Não falha o teste, mas loga para diagnóstico
    }
  })
})

// fluxo_compra.cy.js - Usar após visit
cy.visitWithRetry('/register?e2e=1')
cy.checkConsoleErrors()
```

---

### TICKET 06 — Popups/Modais/Backdrops não podem bloquear interação

**Objetivo:** `ion-backdrop`/loader não pode travar clique/digitação.

**O que fazer (DEV):**

1. No E2E mode:
   - Não renderizar cookie banner e modais de marketing/sucesso.
   - Ou auto-fechar removendo backdrop corretamente.
2. Garantir que qualquer modal ao fechar:
   - Remove `ion-backdrop`.
   - Libera scroll.
   - Não deixa overlay invisível.

**DoD:**

- Em `e2e=1`, não existe `ion-backdrop` persistente bloqueando tela.
- Modais fecham completamente sem deixar resíduos.

**Evidência esperada:**

- Print do CI: DOM sem backdrop após navegação.
- Teste manual: clicar em input sem "forçar" (`force:true` não deveria ser necessário).

**Prioridade:** 🔴 **ALTA**

**Como usar no Cypress:**
```javascript
// cypress/support/commands.js - Simplificar dismissOverlays
Cypress.Commands.add('dismissOverlays', () => {
  // Com E2E mode, não deveria haver backdrops, mas mantém como fallback
  cy.window().then((win) => {
    const backdrops = win.document.querySelectorAll('ion-backdrop')
    if (backdrops.length > 0) {
      cy.log(`⚠️ ${backdrops.length} backdrop(s) encontrado(s) mesmo em E2E mode`)
      backdrops.forEach((b) => {
        b.style.display = 'none'
        b.remove()
      })
    }
  })
  
  // Remove modais de marketing (não deveriam aparecer em E2E mode)
  cy.get('body').then(($body) => {
    const cookieBanner = $body.find('[data-cy="cookie-banner"]')
    if (cookieBanner.length > 0) {
      cy.log('⚠️ Cookie banner presente mesmo em E2E mode')
    }
  })
})
```

---

### TICKET 07 — (Repo DEV) Ajustar config do Cypress: remover browserArgs e aplicar flags do jeito certo

**Objetivo:** Parar warning e permitir configuração consistente do Chrome headless.

**O que fazer (DEV):**

1. Remover `browserArgs` do config.
2. Implementar `before:browser:launch` no `cypress.config.(js|ts)`.

**DoD:**

- Log do CI não mostra: `The following configuration option is invalid: browserArgs`.
- Chrome headless roda com flags corretas.

**Evidência esperada:**

- Trecho do log do CI limpo + commit com config ajustada.

**Prioridade:** 🔴 **ALTA** (destrava rápido)

**Como implementar:**
```javascript
// cypress.config.js
const { defineConfig } = require('cypress')

module.exports = defineConfig({
  e2e: {
    setupNodeEvents(on, config) {
      on('before:browser:launch', (browser = {}, launchOptions) => {
        if (browser.family === 'chromium' && browser.name !== 'electron') {
          // Adiciona flags do Chrome para Linux CI
          launchOptions.args.push('--no-sandbox')
          launchOptions.args.push('--disable-dev-shm-usage')
          launchOptions.args.push('--disable-gpu')
          launchOptions.args.push('--disable-web-security')
        }
        return launchOptions
      })
    },
    // ... resto da config
  },
})
```

**Remover do workflow:**
```yaml
# .github/workflows/e2e-allure-pages.yml
# REMOVER esta linha:
env:
  CYPRESS_BROWSER_ARGS: "--no-sandbox --disable-gpu --disable-dev-shm-usage"

# REMOVER browserArgs do comando:
# npx cypress run --browser chrome --config browserArgs='["--no-sandbox",...]'

# MANTER apenas:
- name: Run Cypress tests
  run: npx cypress run --browser chrome
```

---

### TICKET 08 — Expor endpoint/estado "ready" do cadastro (opcional, mas forte)

**Objetivo:** Dar um sinal confiável que o form "montou".

**O que fazer (DEV):**

1. Quando o form estiver pronto:
   - Setar `window.__APP_READY__ = true` (somente em `e2e=1`) ou
   - Renderizar um marcador estável tipo `<div data-e2e="register-ready"></div>` (se quiser evitar mexer em `data-cy` no doc, pode ser só e2e marker).

**DoD:**

- Existe um "ready marker" quando o form finaliza mount.
- Marker aparece consistentemente antes do Cypress tentar interagir.

**Evidência esperada:**

- No CI, marker presente e consistente antes do Cypress digitar.
- Log mostrando `APP_READY=true` ou marker no DOM.

**Prioridade:** 🟢 **BAIXA** (opcional, mas melhora muito)

**Como usar no Cypress:**
```javascript
// cypress/support/commands.js - Adicionar waitForAppReady melhorado
Cypress.Commands.add('waitForAppReady', (opts = {}) => {
  const { timeout = 30000 } = opts
  
  // Opção 1: Verificar window.__APP_READY__
  cy.window({ timeout }).then((win) => {
    if (win.__APP_READY__ === true) {
      cy.log('✅ APP_READY marker encontrado')
      return
    }
  })
  
  // Opção 2: Verificar marker no DOM
  cy.get('[data-e2e="register-ready"]', { timeout })
    .should('exist')
    .then(() => cy.log('✅ Register ready marker encontrado'))
  
  // Fallback: aguardar document ready
  cy.document({ timeout }).its('readyState').should('eq', 'complete')
})

// fluxo_compra.cy.js - Usar antes de preencher
cy.visitWithRetry('/register?e2e=1')
cy.waitForAppReady({ timeout: 60000 })
cy.get('[data-cy="input-fullname"]', { timeout: 10000 })
  .should('exist')
  .should('be.visible')
```

---

### 12.1. Prioridade Recomendada (Para Destravar Rápido)

#### 🔴 **FASE 1 - CRÍTICO (Implementar primeiro)**
1. **TICKET 07** (browserArgs) + **TICKET 01** (E2E mode)
   - **Tempo estimado:** 2-3 horas
   - **Impacto:** Reduz erros de configuração e torna ambiente determinístico

2. **TICKET 02** (render form sem depender de API) + **TICKET 03** (contrato do nome)
   - **Tempo estimado:** 3-4 horas
   - **Impacto:** Garante que formulário sempre aparece e campo nome é consistente

#### 🟡 **FASE 2 - IMPORTANTE (Implementar depois)**
3. **TICKET 05** (erro JS) + **TICKET 06** (backdrop/modal)
   - **Tempo estimado:** 4-6 horas
   - **Impacto:** Remove crashes silenciosos e bloqueios de interação

#### 🟢 **FASE 3 - MELHORIAS (Opcional)**
4. **TICKET 04** (race conditions)
   - **Tempo estimado:** 2-3 horas
   - **Impacto:** Melhora consistência de timing

5. **TICKET 08** (ready marker)
   - **Tempo estimado:** 1-2 horas
   - **Impacto:** Melhora detecção de quando form está pronto

---

### 12.2. Benefícios Esperados Após Implementação

Após implementar todos os tickets:

✅ **Ambiente determinístico:** E2E mode garante mesmo DOM sempre  
✅ **Formulário sempre presente:** Não depende de API/config  
✅ **Campo nome consistente:** Sempre `formControlName="fullName"`  
✅ **Sem crashes silenciosos:** Erros tratados, form sempre monta  
✅ **Sem bloqueios:** Backdrops/modais não interferem  
✅ **Config correta:** Chrome headless com flags adequadas  
✅ **Ready marker:** Sinal claro de quando form está pronto  

**Impacto esperado:**
- **Redução de 90% nas falhas intermitentes** no CI
- **Taxa de sucesso:** de ~60-70% para > 98%
- **Tempo de execução:** redução de ~31s para ~12-15s
- **Manutenção:** redução de 80% no tempo gasto corrigindo seletores

---

### 12.3. Checklist de Implementação (Frontend)

#### TICKET 01 - E2E Mode
- [ ] Adicionar leitura de `?e2e=1` no bootstrap do app
- [ ] Fixar variante de AB test quando `e2e=1`
- [ ] Fixar locale/idioma quando `e2e=1`
- [ ] Desligar/auto-fechar popups quando `e2e=1`
- [ ] Adicionar log `E2E_MODE=ON` no console
- [ ] Testar que `/register?e2e=1` sempre mostra mesmo DOM

#### TICKET 02 - Form sempre presente
- [ ] Renderizar inputs imediatamente (sem esperar API)
- [ ] Remover `*ngIf` que apaga form em caso de erro
- [ ] Usar placeholders se API/config falhar
- [ ] Testar com rede lenta/falha parcial

#### TICKET 03 - Contrato do nome
- [ ] Padronizar `formControlName="fullName"` em todas variantes
- [ ] Forçar versão com `fullName` no E2E mode
- [ ] Remover variações (`name`, `nome`)
- [ ] Testar que sempre existe `ion-input[formcontrolname="fullName"]`

#### TICKET 04 - Race conditions
- [ ] Revisar inicialização do cadastro
- [ ] Serializar: estado → renderização → validação
- [ ] Garantir `FormGroup` sempre criado
- [ ] Testar recarregar `/register?e2e=1` 10x seguidas

#### TICKET 05 - Erros JS
- [ ] Adicionar captura de exceções globais (somente `e2e=1`)
- [ ] Corrigir `undefined/null`, imports/chunks
- [ ] Adicionar fallbacks para `localStorage`, APIs, sessão
- [ ] Testar que form monta mesmo com erros tratados

#### TICKET 06 - Backdrops/Modais
- [ ] Não renderizar cookie banner em `e2e=1`
- [ ] Auto-fechar modais removendo backdrop corretamente
- [ ] Garantir que modais fecham completamente
- [ ] Testar que não há `ion-backdrop` persistente

#### TICKET 07 - Config Cypress
- [ ] Remover `browserArgs` do `cypress.config.js`
- [ ] Implementar `before:browser:launch` com flags corretas
- [ ] Remover `CYPRESS_BROWSER_ARGS` do workflow
- [ ] Testar que não há warnings no log do CI

#### TICKET 08 - Ready marker
- [ ] Setar `window.__APP_READY__ = true` quando form pronto (somente `e2e=1`)
- [ ] OU renderizar `<div data-e2e="register-ready"></div>`
- [ ] Testar que marker aparece consistentemente

---

**Última atualização:** 2026-01-28  
**Status:** Pronto para implementação
