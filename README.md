# Planner Pro - Sistema Completo

Sistema de planejamento pessoal completo com frontend React e backend Node.js.

## 🚀 Estrutura do Projeto

```
copia-para-testes/
├── frontend/          # Aplicação React (Vite)
├── backend/           # API Node.js (Express)
└── README.md          # Este arquivo
```

## 📋 Pré-requisitos

- Node.js 18+ 
- npm ou yarn
- Git

## 🛠️ Setup Local

### 1. Frontend

```bash
cd frontend
npm install
npm run dev
```

O frontend estará disponível em: `http://localhost:5173`

### 2. Backend

```bash
cd backend
npm install
npm run dev
```

O backend estará disponível em: `http://localhost:3000`

## 🌐 Deploy

### Frontend (Vercel)

```bash
cd frontend
vercel --prod
```

### Backend (Vercel)

```bash
cd backend
vercel --prod
```

## 🔧 Configuração

### Variáveis de Ambiente

Crie um arquivo `.env` no backend:

```env
DATABASE_URL="sua_url_do_banco"
JWT_SECRET="seu_jwt_secret"
GOOGLE_CLIENT_ID="seu_google_client_id"
GOOGLE_CLIENT_SECRET="seu_google_client_secret"
```

## 📱 Funcionalidades

- ✅ Autenticação (Login/Registro)
- ✅ Gerenciamento de Projetos
- ✅ Planejamento Financeiro
- ✅ Metas e Objetivos
- ✅ Calendário de Eventos
- ✅ Viagens
- ✅ Carreira
- ✅ Relatórios e Analytics
- ✅ Configurações

## 🎨 Tecnologias

### Frontend
- React 18
- Vite
- Tailwind CSS
- Lucide React (Ícones)
- React Router

### Backend
- Node.js
- Express
- Prisma (ORM)
- JWT (Autenticação)
- Passport (OAuth)
- bcryptjs (Hash)

## 📊 Status

- ✅ Sistema funcionando localmente
- ✅ Frontend e backend integrados
- ✅ Deploy configurado
- ✅ CORS configurado
- ✅ Autenticação funcionando

## 🔗 Links

- **Frontend**: [URL do Vercel]
- **Backend**: [URL do Vercel]
- **Repositório**: https://github.com/Wellevelton/copia-para-testes.git

## 👨‍💻 Desenvolvimento

Para continuar o desenvolvimento:

1. Clone o repositório
2. Configure as variáveis de ambiente
3. Execute `npm install` em ambos os diretórios
4. Execute `npm run dev` para desenvolvimento local

## 📝 Licença

Este projeto está sob a licença MIT.
