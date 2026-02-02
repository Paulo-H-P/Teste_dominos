import HomeCadastrarPage from './pages/home_cadastrar'
import CadastrarPage from './pages/cadastrar'
import PreencherCadastroPage from './pages/preencher_cadastro'
import ValidarCodigoPage from './pages/validar_codigo'
import Overlays from './pages/overlays'
import PromocoesPage from './pages/promocao'
import PromoProdutoPage from './pages/promo_produto'
import PagamentoPage from './pages/pagamento'





describe('Home → Cadastro', () => {

  

    function chegarnoCadastro() {
        HomeCadastrarPage.visitarHome()
        HomeCadastrarPage.assertHomeCarregou()
        HomeCadastrarPage.fecharCookiesSeExistir()
        HomeCadastrarPage.irParaCadastro()
        HomeCadastrarPage.assertFoiParaCadastro()
        CadastrarPage.assertTelaCadastro()
    }

    function cadastro2() {        
        PreencherCadastroPage.preencherFormulario()
        PreencherCadastroPage.clicarCriarMinhaConta()
        ValidarCodigoPage.validarCodigoCompleto('979899')
    }

    function modaloff(){
      Overlays.prepararParaContinuar()
      //Overlays.PedirPizza()
      Overlays.fecharModalPedirPizzaSeExistir()
      Overlays.fecharModalLojaFechadaSeExistir()


    }

    function ClicouPromocao(){

      PromocoesPage.irParaPromocoes()
      
    }

    function AddCarrinho(){
    PromocoesPage.irParaPromocoes()
    PromoProdutoPage.abrirPromocaoPorId('718679')

    PromoProdutoPage.escolherSabor()
    PromoProdutoPage.adcionarnoCarrinho()

    PromoProdutoPage.escolherSabor()
    PromoProdutoPage.adcionarnoCarrinho()

    PromoProdutoPage.finalizarCarrinho()
    PromoProdutoPage.adicionarBebida()

    }


     it('deve ir da home para o cadastro', () => {
    HomeCadastrarPage.visitarHome()
    HomeCadastrarPage.assertHomeCarregou()
    HomeCadastrarPage.fecharCookiesSeExistir()

    HomeCadastrarPage.irParaCadastro()
    HomeCadastrarPage.assertFoiParaCadastro()

    CadastrarPage.assertTelaCadastro()
  })
  it('deve preencher o formulario de cadastro', () => {
    chegarnoCadastro()
    PreencherCadastroPage.preencherFormulario()
    PreencherCadastroPage.clicarCriarMinhaConta()
    ValidarCodigoPage.validarCodigoCompleto('979899')
    //PreencherCadastroPage.assertFormularioPreencido()
  })

  it('fechar modal e clicar em promoção', () => {
    chegarnoCadastro()
    cadastro2()


   
    Overlays.prepararParaContinuar()
    //Overlays.PedirPizza()
    Overlays.fecharModalPedirPizzaSeExistir()
    Overlays.fecharModalLojaFechadaSeExistir()
    
    
    
  })

  it('clicar em promoção', () => {
    chegarnoCadastro()
    cadastro2()
    modaloff()
    PromocoesPage.irParaPromocoes()
  })

  it('Escolher produto e adicionar ao carrinho', () => {
    chegarnoCadastro()
    cadastro2()
    modaloff()
    ClicouPromocao()

    PromocoesPage.irParaPromocoes()
    PromoProdutoPage.abrirPromocaoPorId('718679')

    PromoProdutoPage.escolherSabor()
    PromoProdutoPage.adcionarnoCarrinho()

    PromoProdutoPage.escolherSabor()
    PromoProdutoPage.adcionarnoCarrinho()

    PromoProdutoPage.finalizarCarrinho()
    PromoProdutoPage.adicionarBebida()
    
    
  })

  it('Ir para pagamento', () => {
    chegarnoCadastro()
    cadastro2()
    modaloff()
    ClicouPromocao()
    AddCarrinho()
    PagamentoPage.IrParaPagamento()
  })
})


