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

    it('Cadastro + login pedido + pagamento + acompanhamento ', () => {
      cy.log('🚀 =========================================')
      cy.log('🚀 INICIANDO FLUXO COMPLETO')
      cy.log('🚀 =========================================')

      cy.log('📍 ETAPA 1: Acessando Home')
      HomeCadastrarPage.visitarHome()
      
      cy.log('📍 ETAPA 2: Verificando se Home carregou')
      HomeCadastrarPage.assertHomeCarregou()
      
      cy.log('📍 ETAPA 3: Fechando cookies se existir')
      HomeCadastrarPage.fecharCookiesSeExistir()
      
      cy.log('📍 ETAPA 4: Navegando para cadastro')
      HomeCadastrarPage.irParaCadastro()
      
      cy.log('📍 ETAPA 5: Verificando se chegou no cadastro')
      HomeCadastrarPage.assertFoiParaCadastro()
      
      cy.log('📍 ETAPA 6: Validando tela de cadastro')
      CadastrarPage.assertTelaCadastro()

      cy.log('📍 ETAPA 7: Preenchendo formulário de cadastro')
      PreencherCadastroPage.preencherFormulario()
      
      cy.log('📍 ETAPA 8: Clicando em "Criar minha conta"')
      PreencherCadastroPage.clicarCriarMinhaConta()
      
      cy.log('📍 ETAPA 9: Validando código de segurança')
      ValidarCodigoPage.validarCodigoCompleto('979899')

      cy.log('📍 ETAPA 10: Preparando para continuar (fechando modais)')
      Overlays.prepararParaContinuar()
      Overlays.fecharModalPedirPizzaSeExistir()
      Overlays.fecharModalLojaFechadaSeExistir()

      cy.log('📍 ETAPA 11: Navegando para promoções')
      PromocoesPage.irParaPromocoes()

      cy.log('📍 ETAPA 12: Abrindo promoção por ID')
      PromoProdutoPage.abrirPromocaoPorId('718679')

      cy.log('📍 ETAPA 13: Escolhendo primeiro sabor')
      PromoProdutoPage.escolherSabor()
      
      cy.log('📍 ETAPA 14: Adicionando primeira pizza ao carrinho')
      PromoProdutoPage.adcionarnoCarrinho()

      cy.log('📍 ETAPA 15: Escolhendo segundo sabor')
      PromoProdutoPage.escolherSabor()
      
      cy.log('📍 ETAPA 16: Adicionando segunda pizza ao carrinho')
      PromoProdutoPage.adcionarnoCarrinho()

      cy.log('📍 ETAPA 17: Finalizando carrinho')
      PromoProdutoPage.finalizarCarrinho()
      
      cy.log('📍 ETAPA 18: Adicionando bebida')
      PromoProdutoPage.adicionarBebida()

      cy.log('📍 ETAPA 19: Indo para pagamento')
      PagamentoPage.IrParaPagamento()
      
      cy.log('✅ =========================================')
      cy.log('✅ FLUXO COMPLETO FINALIZADO')
      cy.log('✅ =========================================')

    })

}))  // 👈 Note os DOIS parênteses fechando: um para qase() e um para describe()  





