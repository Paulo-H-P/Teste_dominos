# 🔐 Solução: Erro de Autenticação Gmail (535-5.7.8)

## ❌ Erro Encontrado

```
Error: Invalid login: 535-5.7.8 Username and Password not accepted.
```

Este erro indica que o Gmail está rejeitando as credenciais fornecidas.

## ✅ Solução Passo a Passo

### 1. Verificar Verificação em Duas Etapas

**IMPORTANTE:** A verificação em duas etapas **DEVE** estar ativada para criar senhas de app.

1. Acesse: https://myaccount.google.com/security
2. Procure por **"Verificação em duas etapas"**
3. Se não estiver ativada:
   - Clique em **"Ativar"**
   - Siga as instruções para configurar
   - Use seu telefone para receber códigos de verificação

### 2. Gerar Nova Senha de App

1. Acesse: https://myaccount.google.com/apppasswords
   - Se o link não funcionar, vá em: https://myaccount.google.com/security
   - Role até **"Senhas de app"** e clique

2. Selecione as opções:
   - **App:** "Mail"
   - **Dispositivo:** "Outro (nome personalizado)"
   - Digite: `GitHub Actions`
   - Clique em **Gerar**

3. **Copie a senha gerada:**
   - Será uma senha de 16 caracteres
   - Exemplo: `rcbgbnsfvbypvkxg`
   - **IMPORTANTE:** Copie sem espaços!

### 3. Atualizar Secret no GitHub

1. Acesse seu repositório no GitHub
2. Vá em: **Settings** → **Secrets and variables** → **Actions**
3. Procure pelo secret `EMAIL_PASSWORD`
4. Clique em **Edit** (ou **Update**)
5. Cole a nova senha de app (sem espaços)
6. Clique em **Update secret**

### 4. Verificar Outros Secrets

Certifique-se de que os secrets estão configurados corretamente:

#### `EMAIL_USERNAME`
- Deve ser o e-mail completo: `paulohenrique@rfti.com.br`
- Sem espaços antes ou depois

#### `EMAIL_PASSWORD`
- Deve ser a senha de app gerada (16 caracteres)
- Sem espaços
- Não use a senha normal do Gmail!

#### `NOTIFICATION_EMAILS`
- Lista de e-mails separados por vírgula
- Sem espaços: `email1@exemplo.com,email2@exemplo.com`
- Com espaços (ERRADO): `email1@exemplo.com, email2@exemplo.com`

### 5. Testar Novamente

Após atualizar os secrets:

1. Faça um push para a branch `main` ou aguarde a próxima execução do cron
2. Verifique os logs do workflow em: **Actions** → **Última execução**
3. Se o erro persistir, verifique:
   - Se a senha de app foi copiada corretamente (sem espaços)
   - Se a verificação em duas etapas está realmente ativada
   - Se o e-mail no `EMAIL_USERNAME` está correto

## 🔍 Verificações Adicionais

### Se o erro continuar:

1. **Gere uma nova senha de app:**
   - Delete a senha de app antiga
   - Gere uma nova
   - Atualize o secret no GitHub

2. **Verifique o formato do e-mail:**
   - O Gmail pode ter restrições para contas corporativas (@rfti.com.br)
   - Se for uma conta Google Workspace, pode precisar de configurações adicionais

3. **Tente usar outro provedor SMTP:**
   - Outlook: `smtp-mail.outlook.com` (porta 587)
   - Yahoo: `smtp.mail.yahoo.com` (porta 587)
   - Servidor SMTP corporativo (se disponível)

## 📝 Notas Importantes

- ⚠️ **Nunca** use a senha normal do Gmail no GitHub Actions
- ✅ **Sempre** use uma senha de app gerada especificamente para isso
- 🔒 As senhas de app são mais seguras e podem ser revogadas facilmente
- 📧 O workflow continuará funcionando mesmo se o e-mail falhar (graças ao `continue-on-error: true`)

## 🆘 Ainda com Problemas?

Se após seguir todos os passos o erro persistir:

1. Verifique os logs completos do workflow
2. Tente gerar uma nova senha de app
3. Verifique se a conta do Gmail não está bloqueada ou suspensa
4. Considere usar outro provedor de e-mail temporariamente
