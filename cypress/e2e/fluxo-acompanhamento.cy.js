import HomeCadastrarPage from '../Pages/Home_cadastrar'
import CadastrarPage from '../Pages/cadastrar'

describe('Home → Cadastro', () => {
  it('deve ir da home para o cadastro', () => {
    HomeCadastrarPage.visitarHome()
    HomeCadastrarPage.assertHomeCarregou()
    HomeCadastrarPage.fecharCookiesSeExistir()

    HomeCadastrarPage.irParaCadastro()
    HomeCadastrarPage.assertFoiParaCadastro()

    CadastrarPage.assertTelaCadastro()
  })
})
