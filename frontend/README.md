# Planner Pro - Frontend

Frontend do aplicativo Planner Pro, construído com React, Vite e Tailwind CSS, hospedado no Vercel.

## 🚀 Tecnologias

- **React** - Biblioteca JavaScript
- **Vite** - Build tool
- **Tailwind CSS** - Framework CSS
- **Lucide React** - Ícones
- **React Router** - Roteamento

## 📋 Pré-requisitos

- Node.js 18+
- Conta no Vercel
- Git

## 🔧 Instalação

1. **Clone o repositório:**
```bash
git clone https://github.com/Wellevelton/frontend-pro-.git
cd frontend-pro-
```

2. **Instale as dependências:**
```bash
npm install
```

3. **Configure as variáveis de ambiente:**
```bash
cp .env.example .env
```

4. **Inicie o servidor de desenvolvimento:**
```bash
npm run dev
```

## 🌐 Deploy no Vercel

1. **Acesse o Vercel Dashboard**
2. **Conecte o repositório GitHub**
3. **Configure as variáveis de ambiente:**
   - `VITE_API_URL` - URL do backend

4. **Deploy automático:**
```bash
git push origin main
```

## 📱 Funcionalidades

### 🔐 Autenticação
- Login com email/senha
- Login com Google OAuth
- Registro de usuários
- Persistência de sessão

### 📊 Dashboard
- Visão geral de projetos
- Resumo financeiro
- Próximas viagens
- Metas em andamento

### 📋 Projetos
- Criar, editar e deletar projetos
- Definir prioridades e status
- Acompanhar progresso
- Datas de início e fim

### 🎯 Metas
- Criar metas com sub-objetivos
- Definir datas limite
- Acompanhar progresso
- Categorizar por prioridade

### 💰 Finanças
- Registrar receitas e despesas
- Categorizar transações
- Visualizar histórico
- Planejamento financeiro mensal

### ✈️ Viagens
- Planejar viagens detalhadas
- Calcular custos por categoria
- Definir datas e destinos
- Acompanhar gastos

### 💼 Carreira
- Planejar desenvolvimento profissional
- Definir objetivos de carreira
- Acompanhar certificações
- Estabelecer metas

### 📅 Calendário
- Visualizar eventos
- Sincronizar com Google Calendar
- Criar lembretes
- Organizar agenda

## 🎨 Interface

- **Design responsivo** - Funciona em desktop e mobile
- **Tema escuro** - Interface moderna e elegante
- **Componentes reutilizáveis** - Código limpo e organizado
- **Animações suaves** - Experiência de usuário fluida

## 📁 Estrutura do Projeto

```
src/
├── components/          # Componentes React
│   ├── Header.jsx      # Cabeçalho da aplicação
│   ├── LoginScreen.jsx # Tela de login
│   ├── Navigation.jsx  # Navegação
│   ├── modals/         # Modais
│   └── tabs/           # Abas do dashboard
├── data/               # Dados iniciais
├── hooks/              # Hooks customizados
├── services/           # Serviços de API
└── utils/              # Utilitários
```

## 🔧 Scripts

- `npm run dev` - Inicia o servidor de desenvolvimento
- `npm run build` - Gera build de produção
- `npm run preview` - Visualiza o build
- `npm run lint` - Executa o linter

## 🔗 Integração com Backend

O frontend se conecta ao backend através da API REST:

- **Autenticação:** JWT tokens
- **CRUD Operations:** Para todos os recursos
- **Real-time:** Atualizações em tempo real
- **Error Handling:** Tratamento de erros robusto

## 📱 Responsividade

- **Desktop:** Layout completo com sidebar
- **Tablet:** Layout adaptativo
- **Mobile:** Layout otimizado para touch

## 🎯 Performance

- **Lazy Loading:** Carregamento sob demanda
- **Code Splitting:** Divisão de código
- **Optimized Images:** Imagens otimizadas
- **Caching:** Cache inteligente

## 📝 Licença

MIT License

## 👨‍💻 Autor

Wellevelton

## 🔗 Links

- **Frontend:** https://planner-p0cw8rgqx-sobreiras-projects.vercel.app
- **Backend:** https://github.com/Wellevelton/backend-pro
- **Documentação:** https://github.com/Wellevelton/frontend-pro-

