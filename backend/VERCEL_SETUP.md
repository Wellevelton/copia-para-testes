# 🚀 Configuração do Vercel para o Backend

## 📋 Variáveis de Ambiente Necessárias

Acesse o [Vercel Dashboard](https://vercel.com/dashboard) e configure as seguintes variáveis de ambiente para o projeto `backend-pro`:

### 🔧 Variáveis Obrigatórias

1. **DATABASE_URL**
   ```
   postgresql://postgres:123456Teste@db.hmhjmpxsoaoacuntiwtq.supabase.co:5432/postgres
   ```

2. **JWT_SECRET**
   ```
   seu-jwt-secret-super-secreto-aqui-2024
   ```

3. **CORS_ORIGIN**
   ```
   https://planner-p0cw8rgqx-sobreiras-projects.vercel.app
   ```

### 🔧 Variáveis Opcionais (para Google OAuth)

4. **GOOGLE_CLIENT_ID**
   ```
   seu-google-client-id-aqui
   ```

5. **GOOGLE_CLIENT_SECRET**
   ```
   seu-google-client-secret-aqui
   ```

## 📝 Como Configurar

1. Acesse [vercel.com/dashboard](https://vercel.com/dashboard)
2. Clique no projeto `backend-pro`
3. Vá para **Settings** → **Environment Variables**
4. Adicione cada variável acima
5. Clique em **Save**
6. Vá para **Deployments** e clique em **Redeploy** no último deployment

## 🔍 Teste da API

Após configurar, teste a API:

```bash
# Teste básico
curl https://backend-pro-sobreiras-projects.vercel.app/

# Teste health check
curl https://backend-pro-sobreiras-projects.vercel.app/api/health
```

## 🎯 URLs Importantes

- **Backend API**: `https://backend-pro-sobreiras-projects.vercel.app`
- **Frontend**: `https://planner-p0cw8rgqx-sobreiras-projects.vercel.app`
- **GitHub Backend**: `https://github.com/Wellevelton/backend-pro`
- **GitHub Frontend**: `https://github.com/Wellevelton/frontend-pro`

## 🚨 Problemas Comuns

1. **Erro 500**: Verifique se todas as variáveis de ambiente estão configuradas
2. **CORS Error**: Verifique se o `CORS_ORIGIN` está correto
3. **Database Error**: Verifique se o `DATABASE_URL` está correto

## 📞 Suporte

Se houver problemas, verifique os logs no Vercel Dashboard → Deployments → Último deployment → Functions → server-complete.js

