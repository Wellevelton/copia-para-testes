# 🔐 Configuração Google OAuth

## 1. Criar Projeto no Google Cloud Console

1. Acesse [Google Cloud Console](https://console.cloud.google.com/)
2. Crie um novo projeto ou selecione existente
3. Ative a **Google+ API** e **Google Calendar API**

## 2. Configurar OAuth 2.0

1. Vá em **APIs & Services > Credentials**
2. Clique em **Create Credentials > OAuth 2.0 Client IDs**
3. Configure:
   - **Application type:** Web application
   - **Name:** Planner Pro
   - **Authorized JavaScript origins:**
     - `https://planner-gwt6msj20-sobreiras-projects.vercel.app`
     - `http://localhost:5173` (desenvolvimento)
   - **Authorized redirect URIs:**
     - `https://planner-gwt6msj20-sobreiras-projects.vercel.app/api/auth/google/callback`
     - `http://localhost:3000/api/auth/google/callback` (desenvolvimento)

## 3. Copiar Credenciais

Copie o **Client ID** e **Client Secret** para o arquivo `.env`:

```env
GOOGLE_CLIENT_ID="seu-client-id-aqui"
GOOGLE_CLIENT_SECRET="seu-client-secret-aqui"
```

## 4. URLs de Redirecionamento

- **Frontend:** `https://planner-gwt6msj20-sobreiras-projects.vercel.app`
- **Backend:** `https://planner-gwt6msj20-sobreiras-projects.vercel.app`
