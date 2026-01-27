# Como Abrir o Relatório Allure

## Opção 1: Servidor Automático (Recomendado)
Execute o arquivo `abrir-relatorio.bat` com dois cliques. Ele vai:
1. Iniciar o servidor Allure automaticamente
2. Abrir o navegador com o relatório
3. O servidor ficará rodando até você fechar a janela

## Opção 2: Manual
Execute no terminal:
```bash
npm run allure:serve
```

## Opção 3: Gerar HTML Standalone (Experimental)
```bash
npm run report:standalone
```
Depois abra o arquivo `relatorio-teste.html` no navegador.

**Nota:** O relatório Allure precisa de um servidor HTTP para funcionar corretamente devido a restrições de segurança do navegador (CORS). Por isso, a Opção 1 é a mais confiável.
