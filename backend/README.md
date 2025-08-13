# Planner Pro - Backend API

Backend API para o aplicativo Planner Pro, construído com Node.js, Express e Prisma, hospedado no Supabase.

## 🚀 Tecnologias

- **Node.js** - Runtime JavaScript
- **Express.js** - Framework web
- **Prisma** - ORM para banco de dados
- **PostgreSQL** - Banco de dados (Supabase)
- **JWT** - Autenticação
- **bcryptjs** - Hash de senhas

## 📋 Pré-requisitos

- Node.js 18+
- Conta no Supabase
- Git

## 🔧 Instalação

1. **Clone o repositório:**
```bash
git clone https://github.com/Wellevelton/backend-pro.git
cd backend-pro
```

2. **Instale as dependências:**
```bash
npm install
```

3. **Configure as variáveis de ambiente:**
```bash
cp env.example .env
```

4. **Configure o banco de dados:**
```bash
npm run db:generate
npm run db:push
npm run db:seed
```

5. **Inicie o servidor:**
```bash
npm run dev
```

## 🌐 Deploy no Supabase

1. **Acesse o Supabase Dashboard**
2. **Crie um novo projeto**
3. **Configure as variáveis de ambiente:**
   - `DATABASE_URL` - URL do PostgreSQL do Supabase
   - `JWT_SECRET` - Chave secreta para JWT
   - `CORS_ORIGIN` - URL do frontend

4. **Deploy:**
```bash
npm run deploy
```

## 📊 Banco de Dados

O banco de dados inclui as seguintes tabelas:

- **users** - Usuários do sistema
- **projects** - Projetos
- **goals** - Metas
- **sub_goals** - Sub-metas
- **finances** - Transações financeiras
- **financial_planning** - Planejamento financeiro
- **travels** - Viagens planejadas
- **career_items** - Itens de carreira
- **calendar_events** - Eventos do calendário

## 🔐 Autenticação

- **Registro:** `POST /api/auth/register`
- **Login:** `POST /api/auth/login`
- **Google OAuth:** `GET /api/auth/google`

## 📡 Endpoints

### Autenticação
- `POST /api/auth/register` - Registrar usuário
- `POST /api/auth/login` - Login
- `GET /api/auth/google` - Login Google OAuth

### Projetos
- `GET /api/projects` - Listar projetos
- `POST /api/projects` - Criar projeto
- `PUT /api/projects/:id` - Atualizar projeto
- `DELETE /api/projects/:id` - Deletar projeto

### Metas
- `GET /api/goals` - Listar metas
- `POST /api/goals` - Criar meta
- `PUT /api/goals/:id` - Atualizar meta
- `DELETE /api/goals/:id` - Deletar meta

### Finanças
- `GET /api/finances` - Listar transações
- `POST /api/finances` - Criar transação
- `PUT /api/finances/:id` - Atualizar transação
- `DELETE /api/finances/:id` - Deletar transação

### Planejamento Financeiro
- `GET /api/financial-planning` - Listar planejamento
- `POST /api/financial-planning` - Criar planejamento
- `PUT /api/financial-planning/:id` - Atualizar planejamento
- `DELETE /api/financial-planning/:id` - Deletar planejamento

### Viagens
- `GET /api/travels` - Listar viagens
- `POST /api/travels` - Criar viagem
- `PUT /api/travels/:id` - Atualizar viagem
- `DELETE /api/travels/:id` - Deletar viagem

### Carreira
- `GET /api/career` - Listar itens de carreira
- `POST /api/career` - Criar item de carreira
- `PUT /api/career/:id` - Atualizar item de carreira
- `DELETE /api/career/:id` - Deletar item de carreira

### Calendário
- `GET /api/calendar` - Listar eventos
- `POST /api/calendar` - Criar evento
- `PUT /api/calendar/:id` - Atualizar evento
- `DELETE /api/calendar/:id` - Deletar evento

## 🔧 Scripts

- `npm start` - Inicia o servidor em produção
- `npm run dev` - Inicia o servidor em desenvolvimento
- `npm run db:generate` - Gera o cliente Prisma
- `npm run db:push` - Sincroniza o schema com o banco
- `npm run db:seed` - Popula o banco com dados iniciais
- `npm run db:studio` - Abre o Prisma Studio
- `npm run deploy` - Deploy completo

## 📝 Licença

MIT License

## 👨‍💻 Autor

Wellevelton
