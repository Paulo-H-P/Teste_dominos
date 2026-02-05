# 📧 Configuração de Notificação por E-mail no GitHub Actions

## ✅ Configuração Aplicada

O workflow `.github/workflows/teste-dominos.yml` foi atualizado com o passo de envio de e-mail.

## 🔐 Secrets Necessários no GitHub

Você precisa criar **3 secrets** no repositório GitHub:

### Passo 1: Acessar Secrets
1. Vá em **Settings** → **Secrets and variables** → **Actions**
2. Clique em **New repository secret**

### Passo 2: Criar os Secrets

#### 1. `EMAIL_USERNAME`
- **Nome:** `EMAIL_USERNAME`
- **Valor:** `paulohenrique@rfti.com.br`

#### 2. `EMAIL_PASSWORD`
- **Nome:** `EMAIL_PASSWORD`
- **Valor:** `rcbgbnsfvbypvkxg`

#### 3. `NOTIFICATION_EMAILS`
- **Nome:** `NOTIFICATION_EMAILS`
- **Valor:** Lista de e-mails separados por vírgula (sem espaços)
  - Exemplo: `caio@alphacode.com.br,paulodalto@rfti.com.br,paulohenrique@rfti.com.br`

## 📋 Configuração SMTP

A configuração está usando:
- **Servidor SMTP:** `smtp.gmail.com`
- **Porta:** `587`
- **Segurança:** TLS (secure: true)

## ✉️ Conteúdo do E-mail

O e-mail enviado contém:
- ✅ Status da execução (Sucesso/Falha)
- 📊 Link para o relatório Allure no GitHub Pages
- 🔗 Link para os logs completos do workflow
- 🔗 Link para o Qase Test Run
- 📋 Informações do commit, branch e timestamp

## 🚀 Como Funciona

1. O workflow executa os testes E2E
2. Gera o relatório Allure
3. Publica no GitHub Pages
4. **Envia e-mail automaticamente** para os destinatários configurados
5. O e-mail é enviado **sempre**, independente do resultado dos testes (`if: always()`)

## ✅ Verificação

Após criar os secrets:
1. Faça um push para a branch `main` ou aguarde a próxima execução do cron (a cada 8 minutos)
2. Verifique a caixa de entrada dos e-mails configurados
3. O assunto do e-mail será: `E2E Dominos – Status: [success/failure] – [branch]`

## 🔍 Troubleshooting

### E-mail não está sendo enviado
- Verifique se os 3 secrets estão criados corretamente
- Verifique se os nomes dos secrets estão exatamente como mostrado acima
- Verifique os logs do workflow na aba "Actions" do GitHub

### Erro de autenticação SMTP
- Verifique se a senha de app do Gmail está correta
- Certifique-se de que a verificação em duas etapas está ativada no Gmail
- Verifique se a senha de app foi gerada corretamente

### E-mails não chegam
- Verifique a pasta de spam
- Verifique se os e-mails de destino estão corretos no secret `NOTIFICATION_EMAILS`
- Verifique se não há espaços extras na lista de e-mails
