# Seletores para Política de Privacidade - Domino's

## Seletores mais comuns (teste qual funciona):

### 1. Por texto (RECOMENDADO - mais estável):
```javascript
cy.contains('Política de Privacidade').click()
cy.contains('política de privacidade', { matchCase: false }).click()
cy.contains('Privacidade').click()
```

### 2. Por link com href:
```javascript
cy.get('a[href*="privacidade"]').click()
cy.get('a[href*="privacy"]').click()
cy.get('a[href*="politica"]').click()
cy.get('a[href*="policy"]').click()
```

### 3. Por classe CSS:
```javascript
cy.get('[class*="privacy"]').click()
cy.get('[class*="privacidade"]').click()
cy.get('.privacy-policy').click()
cy.get('.privacy-link').click()
cy.get('.link-privacy').click()
```

### 4. Por atributo data:
```javascript
cy.get('[data-testid*="privacy"]').click()
cy.get('[data-cy*="privacy"]').click()
cy.get('[data-test*="privacy"]').click()
```

### 5. Por ID:
```javascript
cy.get('#privacy-policy').click()
cy.get('#politica-privacidade').click()
cy.get('#privacy').click()
```

## Como encontrar o seletor correto:

1. **Execute o Cypress em modo interativo:**
   ```bash
   npm run cypress:open
   ```

2. **Use cy.pause() no seu teste** para inspecionar manualmente:
   ```javascript
   cy.visit('/')
   cy.pause() // Pausa aqui para você inspecionar no DevTools
   ```

3. **No DevTools do navegador:**
   - Clique com botão direito no link "Política de Privacidade"
   - Selecione "Inspecionar"
   - Veja o HTML e identifique:
     - Classes CSS
     - ID
     - Atributos (href, data-*, etc.)
     - Tag do elemento

4. **Use o Cypress Playground** (no Cypress Test Runner):
   - Clique no ícone de seleção de elemento
   - Clique no link da política de privacidade
   - O Cypress mostrará o seletor sugerido

## Exemplo completo no seu teste:

```javascript
describe('Fluxo de compra', () => {
  it('Deve visitar a página de compra', () => {
    cy.visit('/')
    cy.url().should('include', 'app.dominos.com.br')
    
    // Aceita cookies
    cy.get('.accept-cookie > .md').should('be.visible')
    cy.get('.accept-cookie > .md').click()
    
    // Clica na política de privacidade (escolha o seletor que funcionar)
    cy.contains('Política de Privacidade').click()
    // OU
    // cy.get('a[href*="privacidade"]').click()
  })
})
```
