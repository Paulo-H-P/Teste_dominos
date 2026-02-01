# 📧 Configuração de Notificações por E-mail

Este documento explica como configurar as notificações por e-mail para receber os status dos testes E2E.

## ✅ Confirmação do Schedule

O teste está configurado para rodar **a cada 10 minutos** automaticamente:
```yaml
schedule:
  - cron: "*/10 * * * *"
```

## 🔧 Configuração dos Secrets do GitHub

Para receber notificações por e-mail, você precisa configurar os seguintes secrets no repositório:

### 1. Acesse as Configurações do Repositório

1. Vá para o repositório no GitHub
2. Clique em **Settings** (Configurações)
3. No menu lateral, clique em **Secrets and variables** > **Actions**
4. Clique em **New repository secret**

### 2. Configure os Secrets Necessários

#### `EMAIL_USERNAME`
- **Descrição:** E-mail do remetente (Gmail)
- **Exemplo:** `seuemail@gmail.com`
- **Nota:** Se usar Gmail, você precisará criar uma "Senha de App" (veja instruções abaixo)

#### `EMAIL_PASSWORD`
- **Descrição:** Senha do e-mail ou "Senha de App" do Gmail
- **Exemplo:** `sua-senha-de-app`
- **Nota:** Para Gmail, use uma "Senha de App" (não a senha normal)

#### `NOTIFICATION_EMAILS`
- **Descrição:** Lista de e-mails que receberão as notificações (separados por vírgula)
- **Exemplo:** `email1@gmail.com,email2@dominio.com,email3@outro.com`
- **Formato:** E-mails separados por vírgula, sem espaços

## 📝 Como Criar uma Senha de App no Gmail

Se você usar Gmail como remetente, precisa criar uma "Senha de App":

1. Acesse sua [Conta do Google](https://myaccount.google.com/)
2. Vá em **Segurança**
3. Ative a **Verificação em duas etapas** (se ainda não estiver ativada)
4. Role até **Senhas de app**
5. Selecione **App:** "Mail" e **Dispositivo:** "Outro (nome personalizado)"
6. Digite "GitHub Actions" e clique em **Gerar**
7. Copie a senha gerada (16 caracteres) e use como `EMAIL_PASSWORD`

## 📋 Exemplo de Configuração

```
EMAIL_USERNAME = seuemail@gmail.com
EMAIL_PASSWORD = abcd efgh ijkl mnop  (senha de app do Gmail)
NOTIFICATION_EMAILS = paulo@exemplo.com,maria@exemplo.com,joao@exemplo.com
```

## 📧 Formato das Notificações

As notificações serão enviadas com:

- **Assunto:** Status dos testes (✅ Passou ou ❌ Falhou) + Repositório + Branch
- **Conteúdo:**
  - Status dos testes
  - Link para o relatório Allure (GitHub Pages)
  - Link para a execução completa do workflow
  - Informações do commit e branch
  - Data/hora da execução

## ⚙️ Outros Provedores de E-mail

Se você não usar Gmail, pode configurar outros provedores SMTP:

### Outlook/Hotmail
```yaml
server_address: smtp-mail.outlook.com
server_port: 587
```

### Yahoo
```yaml
server_address: smtp.mail.yahoo.com
server_port: 587
```

### Servidor SMTP Personalizado
Ajuste as variáveis `server_address` e `server_port` no workflow conforme necessário.

## 🔍 Verificação

Após configurar os secrets:

1. O workflow rodará automaticamente a cada 10 minutos
2. Você receberá um e-mail a cada execução (sucesso ou falha)
3. Verifique a pasta de spam se não receber os e-mails

## 📌 Notas Importantes

- ⚠️ Os e-mails são enviados **sempre** (sucesso ou falha) devido ao `if: always()`
- 📧 O formato do e-mail é HTML com links clicáveis
- 🔒 As senhas são armazenadas de forma segura nos secrets do GitHub
- ⏰ O schedule roda a cada 10 minutos (pode ser ajustado se necessário)
