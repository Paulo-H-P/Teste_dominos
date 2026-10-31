# 📊 Relatório Allure de Testes

Este é o relatório HTML gerado pelo Allure Report para os testes E2E executados no GitHub Actions.

## 📖 Como visualizar

1. **GitHub Pages (Recomendado):**
   - Acesse: https://Paulo-H-P.github.io/Teste_dominos/
   - O relatório está disponível online e atualizado automaticamente

2. **Download do Artifact:**
   - Baixe o artifact `allure-report` na seção de Artifacts desta execução
   - Extraia o arquivo ZIP
   - Abra o arquivo `index.html` em um navegador moderno
   - **Nota:** Alguns recursos podem não funcionar localmente devido a restrições CORS

## 📋 Informações da Execução

- **Commit:** a9eb086a49e8c7413484668fbb95cdb8c357673e
- **Branch:** main
- **Workflow:** E2E Tests - Allure HTML to GitHub Pages
- **Executado em:** 

## 🔍 Estrutura do Relatório

- `index.html` - Página principal do relatório
- `data/` - Dados dos testes em formato JSON
- `widgets/` - Widgets e gráficos do relatório
- `history/` - Histórico de execuções anteriores

## ⚠️ Nota Importante

Para visualização completa, recomenda-se usar o GitHub Pages ou executar um servidor HTTP local:
```bash
# Com Python
python -m http.server 8000

# Com Node.js
npx http-server allure-report -p 8000
```
