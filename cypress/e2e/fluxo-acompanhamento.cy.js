import HomeCadastrarPage from './pages/home_cadastrar'
import CadastrarPage from './pages/cadastrar'
import PreencherCadastroPage from './pages/preencher_cadastro'
import ValidarCodigoPage from './pages/validar_codigo'
import Overlays from './pages/overlays'
import PromocoesPage from './pages/promocao'
import PromoProdutoPage from './pages/promo_produto'
import PagamentoPage from './pages/pagamento'
import { qase } from 'cypress-qase-reporter/mocha'





// Caso Qase #2: Cadastro + login pedido + pagamento + acompanhamento
// Configuração: 05 Feb 2026 13:27:58
describe('Home → Cadastro', qase(2, () => {    
    // Manter estado entre testes - verificar URL atual e continuar
    beforeEach(() => {
      cy.log('🔄 Verificando estado atual da sessão')
      // Não limpa cookies/localStorage - mantém estado entre testes
    })

    it('ETAPA 1-2: Acessar e validar Home', qase(3, () => {
      cy.log('🚀 =========================================')
      cy.log('🚀 INICIANDO FLUXO COMPLETO')
      cy.log('🚀 =========================================')

      // Verifica se já está na home (caso o teste anterior tenha passado)
      cy.location('href', { timeout: 5000 }).then((href) => {
        const isHome = href.includes('app.dominos.com.br') && !href.includes('/register')
        
        if (!isHome) {
          cy.log('📍 ETAPA 1: Acessando Home')
          HomeCadastrarPage.visitarHome()
        } else {
          cy.log('📍 ETAPA 1: Já está na Home, pulando visita')
        }
      })
      
      cy.log('📍 ETAPA 2: Verificando se Home carregou')
      HomeCadastrarPage.assertHomeCarregou()
    }))

    it('ETAPA 3: Fechar cookies se existir', qase(4, () => {
      cy.log('📍 ETAPA 3: Fechando cookies se existir')
      HomeCadastrarPage.fecharCookiesSeExistir()
    }))

    it('ETAPA 4-5: Navegar para cadastro', qase(5, () => {
      cy.log('📍 ETAPA 4: Navegando para cadastro')
      HomeCadastrarPage.irParaCadastro()
      
      cy.log('📍 ETAPA 5: Verificando se chegou no cadastro')
      HomeCadastrarPage.assertFoiParaCadastro()
    }))

    it('ETAPA 6: Validar tela de cadastro', qase(6, () => {
      cy.log('📍 ETAPA 6: Validando tela de cadastro')
      CadastrarPage.assertTelaCadastro()
    }))

    it('ETAPA 7: Preencher formulário de cadastro', qase(7, () => {
      cy.log('📍 ETAPA 7: Preenchendo formulário de cadastro')
      PreencherCadastroPage.preencherFormulario()
    }))

    it('ETAPA 8: Clicar em "Criar minha conta"', qase(8, () => {
      cy.log('📍 ETAPA 8: Clicando em "Criar minha conta"')
      PreencherCadastroPage.clicarCriarMinhaConta()
    }))

    it('ETAPA 9: Validar código de segurança', qase(9, () => {
      cy.log('📍 ETAPA 9: Validando código de segurança')
      ValidarCodigoPage.validarCodigoCompleto('979899')
    }))

    it('ETAPA 10: Preparar para continuar (fechar modais)', qase(10, () => {
      cy.log('📍 ETAPA 10: Preparando para continuar (fechando modais)')
      Overlays.prepararParaContinuar()
      Overlays.fecharModalPedirPizzaSeExistir()
      Overlays.fecharModalLojaFechadaSeExistir()
    }))

    it('ETAPA 11: Navegar para promoções', qase(11, () => {
      cy.log('📍 ETAPA 11: Navegando para promoções')
      PromocoesPage.irParaPromocoes()
    }))

    it('ETAPA 12: Abrir promoção por ID', qase(12, () => {
      cy.log('📍 ETAPA 12: Abrindo promoção por ID')
      PromoProdutoPage.abrirPromocaoPorId('718679')
    }))

    it('ETAPA 13-14: Escolher primeiro sabor e adicionar ao carrinho', qase(13, () => {
      cy.log('📍 ETAPA 13: Escolhendo primeiro sabor')
      PromoProdutoPage.escolherSabor()
      
      cy.log('📍 ETAPA 14: Adicionando primeira pizza ao carrinho')
      PromoProdutoPage.adcionarnoCarrinho()
    }))

    it('ETAPA 15-16: Escolher segundo sabor e adicionar ao carrinho', qase(14, () => {
      cy.log('📍 ETAPA 15: Escolhendo segundo sabor')
      PromoProdutoPage.escolherSabor()
      
      cy.log('📍 ETAPA 16: Adicionando segunda pizza ao carrinho')
      PromoProdutoPage.adcionarnoCarrinho()
    }))

    it('ETAPA 17: Finalizar carrinho', qase(15, () => {
      cy.log('📍 ETAPA 17: Finalizando carrinho')
      PromoProdutoPage.finalizarCarrinho()
    }))

    it('ETAPA 18: Adicionar bebida', qase(16, () => {
      cy.log('📍 ETAPA 18: Adicionando bebida')
      PromoProdutoPage.adicionarBebida()
    }))

    it('ETAPA 19: Ir para pagamento', qase(17, () => {
      cy.log('📍 ETAPA 19: Indo para pagamento')
      PagamentoPage.IrParaPagamento()
      
      cy.log('✅ =========================================')
      cy.log('✅ FLUXO COMPLETO FINALIZADO')
      cy.log('✅ =========================================')
    }))

}))  // 👈 Note os DOIS parênteses fechando: um para qase() e um para describe()  





