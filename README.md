# Dominos Acompanhamento

Projeto de testes E2E automatizados para o site Domino's Pizza usando Cypress e Allure Report.

## 🚀 Tecnologias

- **Cypress**: Framework de testes E2E
- **Allure Report**: Geração de relatórios de testes
- **GitHub Actions**: CI/CD automatizado
- **GitHub Pages**: Publicação automática de relatórios

## 📋 Como executar

### Localmente

```bash
# Instalar dependências
npm install

# Executar testes
npm run cypress:run

# Gerar relatório Allure
npm run allure:generate

# Abrir relatório
npm run allure:open
```

## 🔄 CI/CD

O projeto está configurado com GitHub Actions para:
- Executar testes automaticamente a cada push na branch `main`
- Executar testes a cada 10 minutos (agendado)
- Gerar relatórios Allure (HTML e PDF)
- Publicar relatórios no GitHub Pages

## 📊 Relatórios

Os relatórios são publicados automaticamente em:
- **GitHub Pages**: https://paulo-h-p.github.io/dominos_acompanhamento/
- **Artifacts**: Disponível nas Actions do GitHub

## 📝 Estrutura do Projeto

```
├── cypress/
│   ├── e2e/           # Testes E2E
│   └── support/       # Comandos customizados
├── scripts/           # Scripts auxiliares
├── .github/
│   └── workflows/     # GitHub Actions workflows
└── package.json       # Dependências e scripts
```
