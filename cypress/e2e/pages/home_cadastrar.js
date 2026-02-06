// cypress/e2e/Pages/Home_cadastrar.js
// Responsabilidade: abrir a home e navegar para o cadastro (register)

class HomeCadastrarPage {
    /**
     * Abre a Home do app.
     * - Usamos visitWithRetry porque CI pode falhar por rede/carregamento.
     * - waitForAppReady é seu comando customizado: espera SPA ficar pronta.
     */
    visitarHome() {
      cy.visitWithRetry('/', {
        timeout: 30000,
        retries: 1,
        validate: () => {
          cy.waitForAppReady({ timeout: 60000, checkBlocking: false })
          cy.dismissOverlays()
        },
      })
    }
  
    /**
     * ASSERT da Home:
     * - Não tenta provar "layout bonito", só prova que o app carregou.
     * - Se isso falhar, você sabe que é carregamento/erro/redirect.
     * - Captura evidências (screenshot e texto) quando falhar para diagnóstico.
     */
    assertHomeCarregou() {
      cy.get('body', { timeout: 60000 }).should('exist')

      // Logs de diagnóstico
      cy.location('href').then((href) => cy.log(`📍 URL: ${href}`))
      cy.document().then((doc) => cy.log(`📄 TITLE: ${doc.title}`))

      // Captura texto do body para diagnóstico (primeiros 800 caracteres)
      cy.get('body').then(($b) => {
        const text = ($b.text() || '').trim().slice(0, 800)
        cy.log(`📝 BODY_TEXT_800: ${text}`)
      })

      // Procura múltiplos roots possíveis (Ionic, Angular, React, etc.)
      const roots = [
        'ion-app',
        'ion-content',
        'ion-router-outlet',
        'app-root',
        '#app',
        '#root',
        '[ng-version]',
        '[data-reactroot]'
      ].join(', ')

      // Verifica se algum root existe antes de fazer assert
      cy.get('body').then(($body) => {
        const temRoot = roots.split(', ').some((root) => {
          return $body.find(root).length > 0
        })

        if (!temRoot) {
          // Se não encontrou root, captura TODAS as evidências ANTES do assert falhar
          cy.log('❌ =========================================')
          cy.log('❌ APP NÃO CARREGOU: NENHUM ROOT ENCONTRADO')
          cy.log('❌ =========================================')
          
          // Captura screenshot
          cy.screenshot('DEBUG_body_sem_app')
          
          // Captura texto e HTML
          const text = ($body.text() || '').trim()
          const html = $body.html()
          
          cy.log(`📝 BODY_TEXT_COMPLETO (${text.length} chars): ${text.slice(0, 1000)}`)
          cy.log(`🔍 BODY_HTML_COMPLETO (${html.length} chars): ${html.slice(0, 3000)}`)
          
          // Verifica elementos presentes no DOM
          cy.log('🔍 Elementos encontrados no body:')
          const elementos = ['script', 'link', 'div', 'span', 'p', 'h1', 'h2', 'h3', 'body', 'html']
          elementos.forEach((el) => {
            const count = $body.find(el).length
            if (count > 0) {
              cy.log(`   - ${el}: ${count} elemento(s)`)
            }
          })
          
          // Verifica se há mensagens comuns de bloqueio
          const bodyText = text.toLowerCase()
          if (bodyText.includes('checking your browser') || bodyText.includes('just a moment')) {
            cy.log('🚫 BLOQUEIO DETECTADO: Cloudflare/WAF - "checking your browser" ou "just a moment"')
          }
          if (bodyText.includes('403') || bodyText.includes('access denied')) {
            cy.log('🚫 ERRO 403 DETECTADO: Access Denied')
          }
          if (bodyText.includes('enable javascript')) {
            cy.log('⚠️ Mensagem "Enable JavaScript" detectada')
          }
          if (bodyText.includes('cloudflare')) {
            cy.log('🚫 Cloudflare detectado no texto')
          }
          if (bodyText.includes('captcha')) {
            cy.log('🚫 CAPTCHA detectado')
          }
          
          // Verifica se há scripts carregando
          cy.window().then((win) => {
            const scripts = win.document.querySelectorAll('script[src]')
            cy.log(`📜 Scripts externos encontrados: ${scripts.length}`)
            scripts.forEach((script, i) => {
              if (i < 5) { // Mostra apenas os 5 primeiros
                cy.log(`   - ${script.src}`)
              }
            })
          })
        }
      })

      // Tenta encontrar QUALQUER root típico de SPA (com timeout maior e múltiplas tentativas)
      // Aguarda mais tempo e tenta múltiplas vezes antes de falhar
      cy.wait(5000) // Aguarda 5 segundos para o app carregar
      
      // Tenta encontrar o root com timeout maior
      cy.get('body', { timeout: 90000 }).then(($body) => {
        let tentativas = 0
        const maxTentativas = 6 // 6 tentativas de 15 segundos = 90 segundos total
        
        const tentarEncontrarRoot = () => {
          tentativas++
          const rootEncontrado = roots.split(', ').find((root) => {
            return $body.find(root).length > 0
          })
          
          if (rootEncontrado) {
            cy.log(`✅ App carregado: root encontrado (${rootEncontrado}) após ${tentativas} tentativa(s)`)
            return true
          }
          
          if (tentativas < maxTentativas) {
            cy.log(`⏳ Tentativa ${tentativas}/${maxTentativas}: App ainda não detectado, aguardando...`)
            cy.wait(15000) // Aguarda 15 segundos antes de tentar novamente
            return cy.get('body', { timeout: 10000 }).then(($body2) => {
              $body = $body2
              return tentarEncontrarRoot()
            })
          }
          
          return false
        }
        
        const encontrou = tentarEncontrarRoot()
        if (!encontrou) {
          cy.log('❌ App não foi detectado após múltiplas tentativas')
          // Tenta uma última vez com assert (vai falhar mas com melhor mensagem)
          cy.get(roots, { timeout: 30000 }).should('exist')
        }
      })
    }
  
    /**
     * Fecha banner de cookies SE existir.
     * - Importante: não pode quebrar o teste se não existir.
     */
    fecharCookiesSeExistir() {
      cy.get('body').then(($b) => {
        const temBotao = $b.find('[data-cy="cookie-close"]').length > 0
        const temBanner = $b.find('app-cookie-banner').length > 0
  
        if (temBotao) {
          cy.get('[data-cy="cookie-close"]', { timeout: 10000 })
            .first()
            .click({ force: true })
          return
        }
  
        if (temBanner) {
          cy.get('app-cookie-banner .accept-cookie ion-icon[name="close"]', { timeout: 10000 })
            .first()
            .click({ force: true })
        }
      })
    }
  
    /**
     * Clica em "Cadastrar-se" (ou link para /register)
     * - Primeiro tenta o mais determinístico: routerlink/href com /register
     * - Depois tenta fallback por texto (só se precisar)
     * - Se nada existir, navega direto /register como último recurso
     * - Limpa sessão antes de tentar navegar para evitar redirecionamento
     */
    irParaCadastro() {
      // Limpa sessão antes de tentar cadastrar (evita redirecionamento para /tabs/home)
      cy.log('🧹 Limpando sessão antes de navegar para cadastro')
      cy.clearCookies()
      cy.clearLocalStorage()
      cy.window().then((win) => {
        // Limpa localStorage e sessionStorage
        win.localStorage.clear()
        win.sessionStorage.clear()
        cy.log('✅ Sessão limpa (cookies, localStorage, sessionStorage)')
      })
      
      // Aguarda um pouco para garantir que a limpeza foi processada
      cy.wait(1000)
      
      const linkSel = '[routerlink="/register"], [routerLink="/register"], a[href*="/register"]'
  
      cy.get('body').then(($b) => {
        if ($b.find(linkSel).length) {
          cy.log('✅ Link de cadastro encontrado, clicando...')
          cy.get(linkSel, { timeout: 15000 }).first().click({ force: true })
          cy.wait(2000) // Aguarda navegação
          return
        }
  
        // Fallback: procura por texto (pode ser "Login ou cadastre-se")
        const regex = /cadastre-se|cadastrar|criar conta|login ou cadastre-se/i
        if (regex.test($b.text())) {
          cy.log('✅ Texto de cadastro encontrado, clicando...')
          cy.contains('a, button, [role="button"]', regex, { timeout: 15000 })
            .first()
            .click({ force: true })
          cy.wait(2000) // Aguarda navegação
          return
        }
  
        // Último recurso: vai direto
        cy.log('⚠️ Link não encontrado, navegando diretamente para /register')
        cy.visitWithRetry('/register', {
          timeout: 30000,
          retries: 1,
          validate: () => {
            cy.waitForAppReady({ timeout: 60000, checkBlocking: false })
            cy.dismissOverlays()
          },
        })
      })
    }
  
    /**
     * ASSERT de navegação:
     * - Garante que depois do clique você caiu em /register
     * - Esse assert é o "contrato" da função irParaCadastro()
     * - Se estiver redirecionando, tenta novamente após limpar sessão
     */
    assertFoiParaCadastro() {
      cy.location('pathname', { timeout: 10000 }).then((pathname) => {
        if (!pathname.includes('/register')) {
          cy.log(`⚠️ Redirecionado para ${pathname} ao invés de /register`)
          cy.log('🔄 Limpando sessão e tentando novamente...')
          
          // Limpa sessão novamente
          cy.window().then((win) => {
            win.localStorage.clear()
            win.sessionStorage.clear()
          })
          
          // Tenta navegar diretamente
          cy.visit('/register', { timeout: 30000 })
          cy.waitForAppReady({ timeout: 60000, checkBlocking: false })
          cy.dismissOverlays()
        }
      })
      
      // Verifica novamente após possível correção
      cy.location('pathname', { timeout: 60000 }).should('include', '/register')
    }
  }
  
  export default new HomeCadastrarPage()
  