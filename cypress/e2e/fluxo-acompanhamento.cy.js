import HomeCadastrarPage from './pages/home_cadastrar'
import CadastrarPage from './pages/cadastrar'
import PreencherCadastroPage from './pages/preencher_cadastro'
import ValidarCodigoPage from './pages/validar_codigo'
import Overlays from './pages/overlays'
import PromocoesPage from './pages/promocao'
import PromoProdutoPage from './pages/promo_produto'
import PagamentoPage from './pages/pagamento'





describe('Home → Cadastro', () => {    


    it.only('Cadastro + login pedido + pagamento + acompanhamento', () => {

      HomeCadastrarPage.visitarHome()
        HomeCadastrarPage.assertHomeCarregou()
        HomeCadastrarPage.fecharCookiesSeExistir()
        HomeCadastrarPage.irParaCadastro()
        HomeCadastrarPage.assertFoiParaCadastro()
        CadastrarPage.assertTelaCadastro()

        PreencherCadastroPage.preencherFormulario()
        PreencherCadastroPage.clicarCriarMinhaConta()
        ValidarCodigoPage.validarCodigoCompleto('979899')

        Overlays.prepararParaContinuar()
        //Overlays.PedirPizza()
        Overlays.fecharModalPedirPizzaSeExistir()
        Overlays.fecharModalLojaFechadaSeExistir()

        PromocoesPage.irParaPromocoes()

        PromocoesPage.irParaPromocoes()
        PromoProdutoPage.abrirPromocaoPorId('718679')

        PromoProdutoPage.escolherSabor()
        PromoProdutoPage.adcionarnoCarrinho()

        PromoProdutoPage.escolherSabor()
        PromoProdutoPage.adcionarnoCarrinho()

        PromoProdutoPage.finalizarCarrinho()
        PromoProdutoPage.adicionarBebida()

        PagamentoPage.IrParaPagamento()






      
    })

})




