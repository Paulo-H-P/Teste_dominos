import HomeCadastrarPage from './pages/home_cadastrar'
import CadastrarPage from './pages/cadastrar'
import PreencherCadastroPage from './pages/preencher_cadastro'
import ValidarCodigoPage from './pages/validar_codigo'
import Overlays from './pages/overlays'




describe('Home → Cadastro', () => {

    function chegarnoCadastro() {
        HomeCadastrarPage.visitarHome()
        HomeCadastrarPage.assertHomeCarregou()
        HomeCadastrarPage.fecharCookiesSeExistir()
        HomeCadastrarPage.irParaCadastro()
        HomeCadastrarPage.assertFoiParaCadastro()
        CadastrarPage.assertTelaCadastro()
    }

    function preencherCadastro() {
        chegarnoCadastro()
        PreencherCadastroPage.preencherFormulario()
        PreencherCadastroPage.clicarCriarMinhaConta()
        ValidarCodigoPage.validarCodigoCompleto('979899')
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

  it.only('fechar modal e clicar em promoção', () => {
    chegarnoCadastro()
    preencherCadastro()

    
    Overlays.prepararParaContinuar()
    Overlays.PedirPizza()
    
    
  })
})




