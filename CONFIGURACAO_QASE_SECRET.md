# 🔐 Configuração do Secret QASE_TOKEN no GitHub

## ❌ Problema Encontrado

O erro mostra que o `QASE_API_TOKEN` não está configurado:

```
Error: Either "testops.api.token" parameter or "QASE_TESTOPS_API_TOKEN" environment variable is required in "testops" mode
```

## ✅ Solução: Configurar o Secret no GitHub

### Passo 1: Obter o Token do Qase

1. Acesse: https://app.qase.io
2. Faça login na sua conta
3. Vá em **Settings** → **API Tokens** (ou **Apps** → **Cypress** → **Access tokens**)
4. Crie um novo token ou copie um token existente
5. **IMPORTANTE:** Copie o token completo (é uma string longa)

### Passo 2: Criar o Secret no GitHub

1. Acesse: https://github.com/Paulo-H-P/Teste_dominos/settings/secrets/actions
2. Clique em **New repository secret**
3. Configure:
   - **Name:** `QASE_TOKEN`
   - **Secret:** Cole o token do Qase que você copiou
4. Clique em **Add secret**

### Passo 3: Verificar Configuração

Após criar o secret, o workflow deve funcionar. O token será usado automaticamente nas próximas execuções.

## 📋 Nomes de Secrets Aceitos

O workflow aceita os seguintes nomes de secrets (em ordem de prioridade):

1. `QASE_TOKEN` (recomendado)
2. `QASE_API_TOKEN` (alternativa)

## 🔍 Verificação

Após configurar o secret:

1. Faça um push para a branch `main` ou aguarde a próxima execução do cron
2. Verifique os logs do workflow em: **Actions** → **Última execução**
3. Você deve ver: `QASE_API_TOKEN: ✅ Configurado`

## ⚠️ Importante

- O token do Qase é sensível - não compartilhe publicamente
- Se o token for comprometido, gere um novo no Qase e atualize o secret
- O token deve ter permissões para criar e atualizar test runs no projeto `DOMINOS`

## 🔗 Links Úteis

- **Secrets do GitHub:** https://github.com/Paulo-H-P/Teste_dominos/settings/secrets/actions
- **Qase API Tokens:** https://app.qase.io/settings/api
- **Qase Apps (Cypress):** https://app.qase.io/apps
