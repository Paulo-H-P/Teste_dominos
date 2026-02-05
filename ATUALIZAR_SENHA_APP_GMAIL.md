# 🔐 Como Atualizar a Senha de App do Gmail no GitHub

## ✅ Nova Senha de App

**Nova senha:** `mvolzsbubunxmcjq`

## 📋 Passo a Passo para Atualizar no GitHub

### 1. Acessar os Secrets do Repositório

1. Vá para: https://github.com/Paulo-H-P/Teste_dominos
2. Clique em **Settings** (Configurações)
3. No menu lateral, clique em **Secrets and variables** → **Actions**

### 2. Atualizar o Secret `EMAIL_PASSWORD`

1. Procure pelo secret `EMAIL_PASSWORD` na lista
2. Clique no ícone de **lápis** (Edit) ao lado do secret
3. No campo **Value**, **delete a senha antiga** e cole a nova:
   ```
   mvolzsbubunxmcjq
   ```
4. **IMPORTANTE:** Certifique-se de que não há espaços antes ou depois
5. Clique em **Update secret**

### 3. Verificar Outros Secrets

Certifique-se de que os outros secrets estão corretos:

- **`EMAIL_USERNAME`**: `paulohenrique@rfti.com.br`
- **`NOTIFICATION_EMAILS`**: Lista de e-mails separados por vírgula (sem espaços)

### 4. Testar

Após atualizar:

1. Faça um push para a branch `main` ou aguarde a próxima execução do cron (a cada 8 minutos)
2. Verifique os logs do workflow em: **Actions** → **Última execução**
3. O e-mail deve ser enviado com sucesso agora

## ⚠️ Importante

- A senha de app deve ter 16 caracteres (sem espaços)
- Não compartilhe a senha de app publicamente
- Se a senha for comprometida, gere uma nova no Gmail

## 🔗 Links Úteis

- **Secrets do GitHub:** https://github.com/Paulo-H-P/Teste_dominos/settings/secrets/actions
- **Gerenciar Senhas de App:** https://myaccount.google.com/apppasswords
- **Logs do Workflow:** https://github.com/Paulo-H-P/Teste_dominos/actions
