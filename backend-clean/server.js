const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const http = require('http');
const { getPrismaClient } = require('./prisma-client');

const app = express();
const server = http.createServer(app);
let prisma;

// Cache simples em memória para otimização
const cache = {
  goals: { data: null, timestamp: 0, ttl: 30000 }, // 30 segundos
  projects: { data: null, timestamp: 0, ttl: 30000 },
  finances: { data: null, timestamp: 0, ttl: 30000 },
  travels: { data: null, timestamp: 0, ttl: 30000 },
  calendar: { data: null, timestamp: 0, ttl: 30000 },
  career: { data: null, timestamp: 0, ttl: 30000 }
};

// Função para verificar se cache é válido
const isCacheValid = (key) => {
  const cacheItem = cache[key];
  return cacheItem && (Date.now() - cacheItem.timestamp) < cacheItem.ttl;
};

// Função para invalidar cache
const invalidateCache = (key) => {
  if (cache[key]) {
    cache[key].data = null;
    cache[key].timestamp = 0;
  }
};

// Função para obter Prisma de forma lazy (só quando necessário)
async function getPrisma() {
  if (!prisma) { // Mudança: !prisma em vez de prisma === null
    console.log('🔗 Conectando Prisma sob demanda...');
    prisma = await getPrismaClient();
  }
  return prisma;
}

// Verificar se estamos em produção (Vercel)
const isProduction = process.env.NODE_ENV === 'production' || process.env.VERCEL === '1';
console.log(`🌍 Ambiente: ${isProduction ? 'PRODUÇÃO' : 'DESENVOLVIMENTO'}`);
console.log(`🔗 DATABASE_URL: ${process.env.DATABASE_URL ? 'Configurado' : 'Não configurado'}`);

// Mock data storage (simula banco de dados)
const mockData = {
  goals: [],
  projects: [],
  finances: [],
  travels: [],
  calendar: [],
  financialPlanning: []
};

const PORT = process.env.PORT || 3001; // Vercel usa PORT padrão

// ==================== CORS CORRETO ====================
const allowedOrigins = [
  'https://frontend-pro-nu.vercel.app', // ✅ ALIAS FIXO DO FRONTEND
  'https://frontend-pro-sobreiras-projects.vercel.app', // ✅ URL FIXA ALTERNATIVA
  'https://frontend-i20hjzr5e-sobreiras-projects.vercel.app', // ✅ FRONTEND ATUAL
  'http://localhost:5173', // Desenvolvimento local
  'http://localhost:3000', // Desenvolvimento local alternativo
];

app.use(cors({
  origin: function (origin, callback) {
    // Permite requisições sem origin (mobile apps, Postman, etc)
    if (!origin) return callback(null, true);
    
    console.log('🔍 CORS check para origin:', origin);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      console.log('✅ CORS permitido para:', origin);
      callback(null, true);
    } else {
      console.log('❌ CORS blocked origin:', origin);
      console.log('📋 Origins permitidos:', allowedOrigins);
      callback(null, true); // TEMPORÁRIO: permitir todos para debug
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Origin', 'X-Requested-With', 'Accept', 'x-client-key', 'x-client-token', 'x-client-secret', 'Authorization'],
  credentials: true,
  preflightContinue: false,
  optionsSuccessStatus: 200
}));

// Middleware para JSON
app.use(express.json());

// ==================== LOGS PARA DEBUG ====================
app.use((req, res, next) => {
  console.log(`🔄 [${new Date().toISOString()}] ${req.method} ${req.path}`);
  console.log('📍 Origin:', req.headers.origin);
  console.log('🌐 User-Agent:', req.headers['user-agent'] ? req.headers['user-agent'].substring(0, 50) + '...' : 'N/A');
  
  // Log específico para requisições problemáticas
  if (req.path.includes('/register') || req.path.includes('/auth/')) {
    console.log('🚨 AUTH ENDPOINT DETECTADO!');
    console.log('📋 Headers:', JSON.stringify(req.headers, null, 2));
  }
  
  next();
});

// ==================== ROTAS ====================

// ==================== OPTIONS HANDLERS PARA CORS ====================
app.options('/api/auth/register', (req, res) => {
  console.log('📋 OPTIONS /api/auth/register - Origin:', req.headers.origin);
  res.status(200).end();
});

app.options('/api/auth/login', (req, res) => {
  console.log('📋 OPTIONS /api/auth/login - Origin:', req.headers.origin);
  res.status(200).end();
});

app.options('/api/goals', (req, res) => {
  console.log('📋 OPTIONS /api/goals - Origin:', req.headers.origin);
  res.status(200).end();
});

app.options('/api/projects', (req, res) => {
  console.log('📋 OPTIONS /api/projects - Origin:', req.headers.origin);
  res.status(200).end();
});

app.options('/api/calendar', (req, res) => {
  console.log('📋 OPTIONS /api/calendar - Origin:', req.headers.origin);
  res.status(200).end();
});

app.options('/api/finances', (req, res) => {
  console.log('📋 OPTIONS /api/finances - Origin:', req.headers.origin);
  res.status(200).end();
});

app.options('/api/travels', (req, res) => {
  console.log('📋 OPTIONS /api/travels - Origin:', req.headers.origin);
  res.status(200).end();
});

app.options('/api/career', (req, res) => {
  console.log('📋 OPTIONS /api/career - Origin:', req.headers.origin);
  res.status(200).end();
});

app.options('/api/financial-planning', (req, res) => {
  console.log('📋 OPTIONS /api/financial-planning - Origin:', req.headers.origin);
  res.status(200).end();
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Backend limpo funcionando!',
    timestamp: new Date().toISOString(),
    cors: 'Configurado corretamente',
    database: prisma ? 'Conectado' : 'Conectando sob demanda',
    env: {
      database_url_present: !!process.env.DATABASE_URL,
      jwt_secret_present: !!process.env.JWT_SECRET,
      node_env: process.env.NODE_ENV
    }
  });
});

// Diagnóstico completo do Prisma
app.get('/api/diagnostic/prisma', async (req, res) => {
  const { testPrismaProduction } = require('./test-prisma-production');
  
  const originalConsoleLog = console.log;
  const originalConsoleError = console.error;
  const logs = [];
  
  // Capturar todos os logs
  console.log = (...args) => {
    const message = args.join(' ');
    logs.push({ type: 'info', message, timestamp: new Date().toISOString() });
    originalConsoleLog(...args);
  };
  
  console.error = (...args) => {
    const message = args.join(' ');
    logs.push({ type: 'error', message, timestamp: new Date().toISOString() });
    originalConsoleError(...args);
  };
  
  try {
    await testPrismaProduction();
    
    // Restaurar console
    console.log = originalConsoleLog;
    console.error = originalConsoleError;
    
    res.json({
      status: 'success',
      message: 'Diagnóstico do Prisma executado',
      logs: logs,
      environment: {
        NODE_ENV: process.env.NODE_ENV,
        VERCEL: process.env.VERCEL,
        DATABASE_URL_CONFIGURED: !!process.env.DATABASE_URL,
        DATABASE_URL_PREVIEW: process.env.DATABASE_URL ? process.env.DATABASE_URL.substring(0, 80) + '...' : 'N/A'
      }
    });
    
  } catch (error) {
    // Restaurar console
    console.log = originalConsoleLog;
    console.error = originalConsoleError;
    
    res.status(500).json({
      status: 'error',
      message: 'Erro no diagnóstico do Prisma',
      error: error.message,
      logs: logs,
      environment: {
        NODE_ENV: process.env.NODE_ENV,
        VERCEL: process.env.VERCEL,
        DATABASE_URL_CONFIGURED: !!process.env.DATABASE_URL
      }
    });
  }
});

// Verificação de tabelas
app.get('/api/diagnostic/tables', async (req, res) => {
  const { checkTables } = require('./check-tables');
  
  const originalConsoleLog = console.log;
  const logs = [];
  
  console.log = (...args) => {
    const message = args.join(' ');
    logs.push(message);
    originalConsoleLog(...args);
  };
  
  try {
    await checkTables();
    console.log = originalConsoleLog;
    
    res.json({
      status: 'success',
      logs: logs
    });
    
  } catch (error) {
    console.log = originalConsoleLog;
    res.status(500).json({
      status: 'error',
      error: error.message,
      logs: logs
    });
  }
});

// Criar tabelas em falta
app.get('/api/diagnostic/create-tables', async (req, res) => {
  const { createMissingTables } = require('./create-missing-tables');
  
  const originalConsoleLog = console.log;
  const originalConsoleError = console.error;
  const logs = [];
  
  console.log = (...args) => {
    const message = args.join(' ');
    logs.push({ type: 'info', message });
    originalConsoleLog(...args);
  };
  
  console.error = (...args) => {
    const message = args.join(' ');
    logs.push({ type: 'error', message });
    originalConsoleError(...args);
  };
  
  try {
    await createMissingTables();
    console.log = originalConsoleLog;
    console.error = originalConsoleError;
    
    res.json({
      status: 'success',
      message: 'Tabelas criadas com sucesso',
      logs: logs
    });
    
  } catch (error) {
    console.log = originalConsoleLog;
    console.error = originalConsoleError;
    res.status(500).json({
      status: 'error',
      error: error.message,
      logs: logs
    });
  }
});

// Migrar tabela travels para novo schema
app.get('/api/diagnostic/migrate-travels', async (req, res) => {
  const { migrateTravelsTable } = require('./migrate-travels-table');
  
  const originalConsoleLog = console.log;
  const originalConsoleError = console.error;
  const logs = [];
  
  console.log = (...args) => {
    const message = args.join(' ');
    logs.push({ type: 'info', message });
    originalConsoleLog(...args);
  };
  
  console.error = (...args) => {
    const message = args.join(' ');
    logs.push({ type: 'error', message });
    originalConsoleError(...args);
  };
  
  try {
    await migrateTravelsTable();
    console.log = originalConsoleLog;
    console.error = originalConsoleError;
    
    res.json({
      status: 'success',
      message: 'Migração da tabela travels concluída',
      logs: logs
    });
    
  } catch (error) {
    console.log = originalConsoleLog;
    console.error = originalConsoleError;
    res.status(500).json({
      status: 'error',
      error: error.message,
      logs: logs
    });
  }
});

// Login
app.post('/api/auth/login', [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 1 })
], async (req, res) => {
  console.log('=== LOGIN ATTEMPT ===');
  console.log('Body:', { email: req.body.email, password: req.body.password ? 'present' : 'missing' });

  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: 'Dados inválidos', details: errors.array() });
    }

    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email e senha são obrigatórios' });
    }

    // Mock user para teste
    if (email === 'teste@planner.com' && password === '123456') {
      const token = jwt.sign(
        { userId: 'mock-user-id', email: email },
        process.env.JWT_SECRET || 'fallback-secret',
        { expiresIn: '7d' }
      );

      console.log('Login successful for:', email);
      res.json({
        success: true,
        user: { id: 'mock-user-id', email: email, name: 'Usuário Teste' },
        token
      });
      return;
    }

    // Se tiver banco, usar Prisma
    if (prisma) {
      const user = await prisma.user.findUnique({
        where: { email }
      });

      if (!user) {
        console.log('User not found:', email);
        return res.status(401).json({ error: 'Email ou senha inválidos' });
      }

      const validPassword = await bcrypt.compare(password, user.password);
      if (!validPassword) {
        console.log('Invalid password for user:', email);
        return res.status(401).json({ error: 'Email ou senha inválidos' });
      }

      const token = jwt.sign(
        { userId: user.id, email: user.email },
        process.env.JWT_SECRET || 'fallback-secret',
        { expiresIn: '7d' }
      );

      console.log('Login successful for:', email);
      res.json({
        success: true,
        user: { id: user.id, email: user.email, name: user.name },
        token
      });
    } else {
      console.log('Invalid credentials:', email);
      res.status(401).json({ error: 'Email ou senha inválidos' });
    }
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Google Login
app.post('/api/auth/google', async (req, res) => {
  console.log('=== GOOGLE LOGIN ATTEMPT ===');
  console.log('Body:', req.body);

  try {
    const { idToken, email, name, googleId } = req.body;

    if (!email || !name || !googleId) {
      return res.status(400).json({ error: 'Dados obrigatórios não fornecidos' });
    }

    let user;
    
    if (prisma) {
      // Verificar se usuário já existe
      user = await prisma.user.findUnique({
        where: { email }
      });

      if (!user) {
        // Criar novo usuário se não existir
        user = await prisma.user.create({
          data: {
            email,
            name,
            googleId: googleId,
            password: '' // Usuários Google não têm senha
          }
        });
        console.log('New Google user created:', email);
      } else {
        // Atualizar googleId se usuário existir
        user = await prisma.user.update({
          where: { id: user.id },
          data: { googleId: googleId }
        });
        console.log('Existing Google user updated:', email);
      }
    } else {
      // Mock mode
      user = {
        id: Date.now(),
        email,
        name: name || email.split('@')[0],
        googleId: googleId || 'mock-google-id'
      };
      console.log('Mock Google user created:', email);
    }

    // Gerar token
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      user: { id: user.id, email: user.email, name: user.name },
      token
    });
  } catch (error) {
    console.error('Google login error:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Registro
app.post('/api/auth/register', [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
  body('name').notEmpty().trim()
], async (req, res) => {
  console.log('=== REGISTER ATTEMPT ===');
  console.log('Origin:', req.headers.origin);
  console.log('Method:', req.method);
  console.log('Content-Type:', req.headers['content-type']);
  console.log('Authorization:', req.headers.authorization ? 'Present' : 'Missing');
  console.log('Body:', { email: req.body.email, name: req.body.name, password: req.body.password ? 'present' : 'missing' });

  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: 'Dados inválidos', details: errors.array() });
    }

    const { email, password, name } = req.body;

    // Tentar conectar ao banco
    const db = await getPrisma();
    if (!db) {
      return res.status(500).json({ error: 'Banco de dados não disponível' });
    }

    // Verificar se usuário já existe
    const existingUser = await db.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return res.status(400).json({ error: 'Email já cadastrado' });
    }

    // Hash da senha
    const hashedPassword = await bcrypt.hash(password, 12);

    // Criar usuário
    const user = await db.user.create({
      data: {
        email,
        name,
        password: hashedPassword
      }
    });

    // Gerar token
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: '7d' }
    );

    console.log('Registration successful for:', email);
    res.json({
      success: true,
      user: { id: user.id, email: user.email, name: user.name },
      token
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// ==================== MIDDLEWARE DE AUTENTICAÇÃO ====================
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Token não fornecido' });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret', (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Token inválido' });
    }
    req.user = user;
    next();
  });
};

// ==================== ROTA DE TESTE ====================
app.get('/api/test-auth', authenticateToken, (req, res) => {
  res.json({ 
    message: 'Usuário autenticado!', 
    user: req.user,
    timestamp: new Date().toISOString()
  });
});

// ==================== ENDPOINTS DE IMPORTAÇÃO ====================

// Importação de planilha de viagens
app.post('/api/import/travels', authenticateToken, async (req, res) => {
  try {
    console.log('=== POST /api/import/travels ===');
    console.log('Body:', req.body);
    
    const { travelData } = req.body;
    
    if (!travelData || !Array.isArray(travelData)) {
      return res.status(400).json({ error: 'Dados de viagem inválidos' });
    }
    
    const db = await getPrisma();
    if (!db) {
      return res.status(500).json({ error: 'Banco de dados não disponível' });
    }
    
    // Limpar viagens existentes do usuário
    await db.travel.deleteMany({
      where: { userId: req.user.userId }
    });
    
    // Criar novas viagens
    const createdTravels = [];
    for (const travel of travelData) {
      try {
        const createdTravel = await db.travel.create({
          data: {
            semana: travel.semana || 0,
            inicio: travel.inicio || '',
            fim: travel.fim || '',
            cidade: travel.cidade || '',
            pais: travel.pais || '',
            zona: travel.zona || '',
            hospedagem_planejado: travel.hospedagem || 0,
            alimentacao_planejado: travel.alimentacao || 0,
            transporte_planejado: travel.transporte || 0,
            academia_planejado: travel.academia || 0,
            suplementos_planejado: travel.suplementos || 0,
            atividades_planejado: travel.atividades || 0,
            total_planejado: travel.total || 0,
            hospedagem_realizado: 0,
            alimentacao_realizado: 0,
            transporte_realizado: 0,
            academia_realizado: 0,
            suplementos_realizado: 0,
            atividades_realizado: 0,
            total_realizado: 0,
            confirmada: false,
            notas: travel.notas || '',
            rating: 8.0,
            bloco: travel.bloco || '',
            userId: req.user.userId
          }
        });
        createdTravels.push(createdTravel);
      } catch (error) {
        console.error('Erro ao criar viagem:', error);
      }
    }
    
    console.log(`✅ ${createdTravels.length} viagens importadas com sucesso`);
    res.json({ 
      success: true, 
      message: `${createdTravels.length} viagens importadas com sucesso`,
      data: createdTravels 
    });
    
  } catch (error) {
    console.error('❌ Erro na importação de viagens:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Importação de planilha financeira
app.post('/api/import/finances', authenticateToken, async (req, res) => {
  try {
    console.log('=== POST /api/import/finances ===');
    console.log('Body:', req.body);
    
    const { financeData } = req.body;
    
    if (!financeData || !Array.isArray(financeData)) {
      return res.status(400).json({ error: 'Dados financeiros inválidos' });
    }
    
    const db = await getPrisma();
    if (!db) {
      return res.status(500).json({ error: 'Banco de dados não disponível' });
    }
    
    // Limpar dados financeiros existentes do usuário
    await db.financialPlanning.deleteMany({
      where: { userId: req.user.userId }
    });
    
    // Criar novos dados financeiros
    const createdFinances = [];
    for (const finance of financeData) {
      try {
        const createdFinance = await db.financialPlanning.create({
          data: {
            mes: finance.mes || '',
            rendaDev: finance.rendaDev || 0,
            rendaContab: finance.rendaContab || 0,
            freelas: finance.freelas || 0,
            rendaTotal: finance.rendaTotal || 0,
            gastos: finance.gastos || 0,
            aporte: finance.aporte || 0,
            saldoAcum: finance.saldoAcum || 0,
            userId: req.user.userId
          }
        });
        createdFinances.push(createdFinance);
      } catch (error) {
        console.error('Erro ao criar dados financeiros:', error);
      }
    }
    
    console.log(`✅ ${createdFinances.length} registros financeiros importados com sucesso`);
    res.json({ 
      success: true, 
      message: `${createdFinances.length} registros financeiros importados com sucesso`,
      data: createdFinances 
    });
    
  } catch (error) {
    console.error('❌ Erro na importação financeira:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// ==================== ROTAS PROTEGIDAS ====================

// Goals - Otimizado com cache
app.get('/api/goals', authenticateToken, async (req, res) => {
  try {
    // Verificar cache primeiro
    if (isCacheValid('goals')) {
      console.log('📦 Retornando goals do cache');
      return res.json(cache.goals.data);
    }

    const db = await getPrisma();
    if (db) {
      const goals = await db.goal.findMany({
        where: { userId: req.user.userId }
      });
      
      // Atualizar cache
      cache.goals.data = goals;
      cache.goals.timestamp = Date.now();
      
      res.json(goals);
    } else {
      // Mock data
      res.json(mockData.goals);
    }
  } catch (error) {
    console.error('Get goals error:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

app.post('/api/goals', authenticateToken, async (req, res) => {
  try {
    console.log('=== POST /api/goals ===');
    console.log('Headers:', req.headers);
    console.log('Body:', req.body);
    console.log('User:', req.user);
    
    const db = await getPrisma();
    console.log('Prisma disponível:', !!db);
    
    if (db) {
      // Criar goal no banco real com novos campos
      const goalData = {
        category: req.body.category || 'Sem categoria',
        title: req.body.title,
        description: req.body.description || '',
        progress: req.body.progress || 0,
        dueDate: req.body.dueDate ? new Date(req.body.dueDate) : null,
        estimatedHours: req.body.estimatedHours || 0,
        status: req.body.status || 'pending',
        priority: req.body.priority || 'medium',
        goals: req.body.goals ? req.body.goals.map(goal => JSON.stringify(goal)) : [], // Converter objetos para JSON strings
        userId: req.user.userId
      };
      
      console.log('Dados para criação:', goalData);
      
      const goal = await db.goal.create({
        data: goalData
      });
      
      console.log('✅ Goal criado com sucesso:', goal);
      res.json({ data: goal });
    } else {
      // Mock mode
      console.log('⚠️ Usando modo mock');
      const goal = {
        id: Date.now(),
        category: req.body.category || 'Sem categoria',
        title: req.body.title,
        description: req.body.description || '',
        progress: req.body.progress || 0,
        dueDate: req.body.dueDate,
        estimatedHours: req.body.estimatedHours || 0,
        goals: req.body.goals ? req.body.goals.map(goal => JSON.stringify(goal)) : [], // Converter objetos para JSON strings
        userId: req.user.userId,
        createdAt: new Date().toISOString()
      };
      mockData.goals.push(goal);
      res.json({ data: goal });
    }
  } catch (error) {
    console.error('❌ Create goal error:', error);
    console.error('Error details:', error.message);
    res.status(500).json({ error: 'Erro interno do servidor', details: error.message });
  }
});

// Delete goal
app.delete('/api/goals/:id', authenticateToken, async (req, res) => {
  try {
    console.log('=== DELETE /api/goals/:id ===');
    console.log('Goal ID:', req.params.id);
    console.log('User ID:', req.user.userId);
    
    const db = await getPrisma();
    if (db) {
      // Verificar se a meta pertence ao usuário
      const goal = await db.goal.findFirst({
        where: { 
          id: req.params.id,
          userId: req.user.userId 
        }
      });
      
      if (!goal) {
        return res.status(404).json({ error: 'Meta não encontrada' });
      }
      
      // Deletar a meta
      await db.goal.delete({
        where: { id: req.params.id }
      });
      
      console.log('✅ Meta deletada com sucesso');
      res.json({ success: true, message: 'Meta deletada com sucesso' });
    } else {
      // Mock mode
      const goalIndex = mockData.goals.findIndex(g => g.id === req.params.id || g.id === parseInt(req.params.id));
      if (goalIndex > -1) {
        mockData.goals.splice(goalIndex, 1);
        console.log('✅ Meta deletada (mock)');
        res.json({ success: true, message: 'Meta deletada com sucesso' });
      } else {
        res.status(404).json({ error: 'Meta não encontrada' });
      }
    }
  } catch (error) {
    console.error('❌ Delete goal error:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Delete project
app.delete('/api/projects/:id', authenticateToken, async (req, res) => {
  try {
    console.log('=== DELETE /api/projects/:id ===');
    console.log('Project ID:', req.params.id);
    console.log('User ID:', req.user.userId);
    
    const db = await getPrisma();
    if (db) {
      // Verificar se o projeto pertence ao usuário
      const project = await db.project.findFirst({
        where: { 
          id: req.params.id,
          userId: req.user.userId 
        }
      });
      
      if (!project) {
        return res.status(404).json({ error: 'Projeto não encontrado' });
      }
      
      // Deletar o projeto
      await db.project.delete({
        where: { id: req.params.id }
      });
      
      console.log('✅ Projeto deletado com sucesso');
      res.json({ success: true, message: 'Projeto deletado com sucesso' });
    } else {
      // Mock mode
      const projectIndex = mockData.projects.findIndex(p => p.id === req.params.id || p.id === parseInt(req.params.id));
      if (projectIndex > -1) {
        mockData.projects.splice(projectIndex, 1);
        console.log('✅ Projeto deletado (mock)');
        res.json({ success: true, message: 'Projeto deletado com sucesso' });
      } else {
        res.status(404).json({ error: 'Projeto não encontrado' });
      }
    }
  } catch (error) {
    console.error('❌ Delete project error:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Delete calendar event
app.delete('/api/calendar/:id', authenticateToken, async (req, res) => {
  try {
    console.log('=== DELETE /api/calendar/:id ===');
    console.log('Event ID:', req.params.id);
    console.log('User ID:', req.user.userId);
    
    const db = await getPrisma();
    if (db) {
      // Verificar se o evento pertence ao usuário
      const event = await db.calendarEvent.findFirst({
        where: { 
          id: req.params.id,
          userId: req.user.userId 
        }
      });
      
      if (!event) {
        return res.status(404).json({ error: 'Evento não encontrado' });
      }
      
      // Deletar o evento
      await db.calendarEvent.delete({
        where: { id: req.params.id }
      });
      
      console.log('✅ Evento deletado com sucesso');
      res.json({ success: true, message: 'Evento deletado com sucesso' });
    } else {
      // Mock mode
      const eventIndex = mockData.calendarEvents.findIndex(e => e.id === req.params.id || e.id === parseInt(req.params.id));
      if (eventIndex > -1) {
        mockData.calendarEvents.splice(eventIndex, 1);
        console.log('✅ Evento deletado (mock)');
        res.json({ success: true, message: 'Evento deletado com sucesso' });
      } else {
        res.status(404).json({ error: 'Evento não encontrado' });
      }
    }
  } catch (error) {
    console.error('❌ Delete calendar event error:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Update goal
app.put('/api/goals/:id', authenticateToken, async (req, res) => {
  try {
    console.log('=== PUT /api/goals/:id ===');
    console.log('Goal ID:', req.params.id);
    console.log('Body:', req.body);
    console.log('User ID:', req.user.userId);
    
    const db = await getPrisma();
    if (db) {
      // Verificar se a meta pertence ao usuário
      const existingGoal = await db.goal.findFirst({
        where: { 
          id: req.params.id,
          userId: req.user.userId 
        }
      });
      
      if (!existingGoal) {
        return res.status(404).json({ error: 'Meta não encontrada' });
      }
      
      // Atualizar a meta
      const updatedGoal = await db.goal.update({
        where: { id: req.params.id },
        data: {
          category: req.body.category || existingGoal.category,
          title: req.body.title || existingGoal.title,
          description: req.body.description || existingGoal.description,
          progress: req.body.progress !== undefined ? req.body.progress : existingGoal.progress,
          dueDate: req.body.dueDate ? new Date(req.body.dueDate) : existingGoal.dueDate,
          estimatedHours: req.body.estimatedHours !== undefined ? req.body.estimatedHours : existingGoal.estimatedHours,
          status: req.body.status || existingGoal.status,
          priority: req.body.priority || existingGoal.priority
        }
      });
      
      // Invalidar cache após atualização
      invalidateCache('goals');
      
      console.log('✅ Meta atualizada com sucesso');
      res.json({ data: updatedGoal });
    } else {
      // Mock mode
      const goalIndex = mockData.goals.findIndex(g => g.id === parseInt(req.params.id));
      if (goalIndex > -1) {
        mockData.goals[goalIndex] = { ...mockData.goals[goalIndex], ...req.body };
        console.log('✅ Meta atualizada (mock)');
        res.json({ data: mockData.goals[goalIndex] });
      } else {
        res.status(404).json({ error: 'Meta não encontrada' });
      }
    }
  } catch (error) {
    console.error('❌ Update goal error:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Update project
app.put('/api/projects/:id', authenticateToken, async (req, res) => {
  try {
    console.log('=== PUT /api/projects/:id ===');
    console.log('Project ID:', req.params.id);
    console.log('Body:', req.body);
    console.log('User ID:', req.user.userId);
    
    const db = await getPrisma();
    if (db) {
      // Verificar se o projeto pertence ao usuário
      const existingProject = await db.project.findFirst({
        where: { 
          id: req.params.id,
          userId: req.user.userId 
        }
      });
      
      if (!existingProject) {
        return res.status(404).json({ error: 'Projeto não encontrado' });
      }
      
      // Atualizar o projeto
      const updatedProject = await db.project.update({
        where: { id: req.params.id },
        data: {
          title: req.body.title || existingProject.title,
          description: req.body.description || existingProject.description,
          category: req.body.category || existingProject.category,
          tags: req.body.tags || existingProject.tags,
          assignee: req.body.assignee || existingProject.assignee,
          dueDate: req.body.dueDate ? new Date(req.body.dueDate) : existingProject.dueDate,
          progress: req.body.progress !== undefined ? req.body.progress : existingProject.progress,
          estimatedHours: req.body.estimatedHours !== undefined ? req.body.estimatedHours : existingProject.estimatedHours,
          status: req.body.status || existingProject.status,
          priority: req.body.priority || existingProject.priority
        }
      });
      
      // Invalidar cache após atualização
      invalidateCache('projects');
      
      console.log('✅ Projeto atualizado com sucesso');
      res.json({ data: updatedProject });
    } else {
      // Mock mode
      const projectIndex = mockData.projects.findIndex(p => p.id === req.params.id || p.id === parseInt(req.params.id));
      if (projectIndex > -1) {
        mockData.projects[projectIndex] = { ...mockData.projects[projectIndex], ...req.body };
        console.log('✅ Projeto atualizado (mock)');
        res.json({ data: mockData.projects[projectIndex] });
      } else {
        res.status(404).json({ error: 'Projeto não encontrado' });
      }
    }
  } catch (error) {
    console.error('❌ Update project error:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Update calendar event
app.put('/api/calendar/:id', authenticateToken, async (req, res) => {
  try {
    console.log('=== PUT /api/calendar/:id ===');
    console.log('Event ID:', req.params.id);
    console.log('Body:', req.body);
    console.log('User ID:', req.user.userId);
    
    const db = await getPrisma();
    if (db) {
      // Verificar se o evento pertence ao usuário
      const existingEvent = await db.calendarEvent.findFirst({
        where: { 
          id: req.params.id,
          userId: req.user.userId 
        }
      });
      
      if (!existingEvent) {
        return res.status(404).json({ error: 'Evento não encontrado' });
      }
      
      // Atualizar o evento
      const updatedEvent = await db.calendarEvent.update({
        where: { id: req.params.id },
        data: {
          title: req.body.title || existingEvent.title,
          description: req.body.description || existingEvent.description,
          startDate: req.body.startDate ? new Date(req.body.startDate) : existingEvent.startDate,
          endDate: req.body.endDate ? new Date(req.body.endDate) : existingEvent.endDate,
          type: req.body.type || existingEvent.type,
          priority: req.body.priority || existingEvent.priority
        }
      });
      
      console.log('✅ Evento atualizado com sucesso');
      res.json({ data: updatedEvent });
    } else {
      // Mock mode
      const eventIndex = mockData.calendarEvents.findIndex(e => e.id === parseInt(req.params.id));
      if (eventIndex > -1) {
        mockData.calendarEvents[eventIndex] = { ...mockData.calendarEvents[eventIndex], ...req.body };
        console.log('✅ Evento atualizado (mock)');
        res.json({ data: mockData.calendarEvents[eventIndex] });
      } else {
        res.status(404).json({ error: 'Evento não encontrado' });
      }
    }
  } catch (error) {
    console.error('❌ Update calendar event error:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Career
app.get('/api/career', authenticateToken, async (req, res) => {
  try {
    const db = await getPrisma();
    if (db) {
      const career = await db.careerItem.findMany({
        where: { userId: req.user.userId }
      });
      res.json(career);
    } else {
      // Mock data
      res.json([
        { id: 1, company: 'Empresa Mock', position: 'Desenvolvedor', startDate: '2024-01-01', endDate: null, current: true },
        { id: 2, company: 'Empresa Anterior', position: 'Junior Dev', startDate: '2022-01-01', endDate: '2023-12-31', current: false }
      ]);
    }
  } catch (error) {
    console.error('Get career error:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Finances
app.get('/api/finances', authenticateToken, async (req, res) => {
  try {
    const db = await getPrisma();
    if (db) {
      const finances = await db.finance.findMany({
        where: { userId: req.user.userId }
      });
      res.json(finances);
    } else {
      // Mock data
      res.json([
        { id: 1, type: 'receita', amount: 5000, description: 'Salário Mock', date: '2025-01-01' },
        { id: 2, type: 'despesa', amount: 1500, description: 'Aluguel Mock', date: '2025-01-01' }
      ]);
    }
  } catch (error) {
    console.error('Get finances error:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

app.post('/api/finances', authenticateToken, async (req, res) => {
  try {
    console.log('=== POST /api/finances ===');
    console.log('Body:', req.body);
    
    const db = await getPrisma();
    if (db) {
      // Filtrar apenas campos válidos do schema
      const financeData = {
        description: req.body.description || '',
        amount: parseFloat(req.body.amount) || 0,
        type: req.body.type || 'expense',
        category: req.body.category || null,
        date: req.body.date ? new Date(req.body.date) : new Date(),
        userId: req.user.userId
      };
      
      console.log('Dados filtrados:', financeData);
      
      const finance = await db.finance.create({
        data: financeData
      });
      
      console.log('✅ Finance criado com sucesso:', finance);
      res.json({ data: finance });
    } else {
      const finance = {
        id: Date.now(),
        description: req.body.description || '',
        amount: parseFloat(req.body.amount) || 0,
        type: req.body.type || 'expense',
        category: req.body.category || null,
        date: req.body.date ? new Date(req.body.date) : new Date(),
        userId: req.user.userId,
        createdAt: new Date().toISOString()
      };
      res.json({ data: finance });
    }
  } catch (error) {
    console.error('❌ Create finance error:', error);
    console.error('Error details:', error.message);
    res.status(500).json({ error: 'Erro interno do servidor', details: error.message });
  }
});

// Update finance
app.put('/api/finances/:id', authenticateToken, async (req, res) => {
  try {
    console.log('=== PUT /api/finances/:id ===');
    console.log('Finance ID:', req.params.id);
    console.log('Body:', req.body);
    console.log('User ID:', req.user.userId);
    
    const db = await getPrisma();
    if (db) {
      // Verificar se a transação pertence ao usuário
      const existingFinance = await db.finance.findFirst({
        where: { 
          id: req.params.id,
          userId: req.user.userId 
        }
      });
      
      if (!existingFinance) {
        return res.status(404).json({ error: 'Transação não encontrada' });
      }
      
      // Atualizar a transação
      const updatedFinance = await db.finance.update({
        where: { id: req.params.id },
        data: {
          description: req.body.description || existingFinance.description,
          amount: req.body.amount !== undefined ? parseFloat(req.body.amount) : existingFinance.amount,
          type: req.body.type || existingFinance.type,
          category: req.body.category || existingFinance.category,
          date: req.body.date ? new Date(req.body.date) : existingFinance.date
        }
      });
      
      console.log('✅ Transação atualizada com sucesso');
      res.json({ data: updatedFinance });
    } else {
      // Mock mode
      const financeIndex = mockData.finances.findIndex(f => f.id === parseInt(req.params.id));
      if (financeIndex > -1) {
        mockData.finances[financeIndex] = { ...mockData.finances[financeIndex], ...req.body };
        console.log('✅ Transação atualizada (mock)');
        res.json({ data: mockData.finances[financeIndex] });
      } else {
        res.status(404).json({ error: 'Transação não encontrada' });
      }
    }
  } catch (error) {
    console.error('❌ Update finance error:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Delete finance
app.delete('/api/finances/:id', authenticateToken, async (req, res) => {
  try {
    console.log('=== DELETE /api/finances/:id ===');
    console.log('Finance ID:', req.params.id);
    console.log('User ID:', req.user.userId);
    
    const db = await getPrisma();
    if (db) {
      // Verificar se a transação pertence ao usuário
      const finance = await db.finance.findFirst({
        where: { 
          id: req.params.id,
          userId: req.user.userId 
        }
      });
      
      if (!finance) {
        return res.status(404).json({ error: 'Transação não encontrada' });
      }
      
      // Deletar a transação
      await db.finance.delete({
        where: { id: req.params.id }
      });
      
      console.log('✅ Transação deletada com sucesso');
      res.json({ success: true, message: 'Transação deletada com sucesso' });
    } else {
      // Mock mode
      const financeIndex = mockData.finances.findIndex(f => f.id === parseInt(req.params.id));
      if (financeIndex > -1) {
        mockData.finances.splice(financeIndex, 1);
        console.log('✅ Transação deletada (mock)');
        res.json({ success: true, message: 'Transação deletada com sucesso' });
      } else {
        res.status(404).json({ error: 'Transação não encontrada' });
      }
    }
  } catch (error) {
    console.error('❌ Delete finance error:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Projects - Otimizado com cache
app.get('/api/projects', authenticateToken, async (req, res) => {
  try {
    // Verificar cache primeiro
    if (isCacheValid('projects')) {
      console.log('📦 Retornando projects do cache');
      return res.json(cache.projects.data);
    }

    const db = await getPrisma();
    if (db) {
      const projects = await db.project.findMany({
        where: { userId: req.user.userId }
      });
      
      // Atualizar cache
      cache.projects.data = projects;
      cache.projects.timestamp = Date.now();
      
      res.json(projects);
    } else {
      // Mock data
      res.json([
        { id: 1, name: 'Projeto Mock 1', description: 'Descrição do projeto', status: 'active', progress: 60 },
        { id: 2, name: 'Projeto Mock 2', description: 'Outro projeto', status: 'completed', progress: 100 }
      ]);
    }
  } catch (error) {
    console.error('Get projects error:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

app.post('/api/projects', authenticateToken, async (req, res) => {
  try {
    const db = await getPrisma();
    if (db) {
      // Criar projeto com novos campos
      const projectData = {
        category: req.body.category || 'Sem categoria',
        title: req.body.title,
        description: req.body.description,
        progress: req.body.progress || 0,
        dueDate: req.body.dueDate ? new Date(req.body.dueDate) : null,
        estimatedHours: req.body.estimatedHours || 0,
        assignee: req.body.assignee,
        status: req.body.status || 'todo',
        priority: req.body.priority || 'medium',
        tags: req.body.tags || [],
        goalId: req.body.goalId, // Incluir o goalId para relacionar com a meta
        userId: req.user.userId
      };
      
      const project = await db.project.create({
        data: projectData
      });
      
      console.log('✅ Project criado com sucesso:', project);
      res.json({ data: project });
    } else {
      const project = {
        id: Date.now(),
        category: req.body.category || 'Sem categoria',
        title: req.body.title,
        description: req.body.description,
        progress: req.body.progress || 0,
        dueDate: req.body.dueDate,
        estimatedHours: req.body.estimatedHours || 0,
        assignee: req.body.assignee,
        tags: req.body.tags || [],
        userId: req.user.userId,
        createdAt: new Date().toISOString()
      };
      res.json({ data: project });
    }
  } catch (error) {
    console.error('Create project error:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Travels
app.get('/api/travels', authenticateToken, async (req, res) => {
  try {
    const db = await getPrisma();
    if (db) {
      const travels = await db.travel.findMany({
        where: { userId: req.user.userId }
      });
      res.json(travels);
    } else {
      // Mock data
      res.json([
        { id: 1, destination: 'Paris', startDate: '2025-06-01', endDate: '2025-06-10', budget: 3000 },
        { id: 2, destination: 'Tokyo', startDate: '2025-12-15', endDate: '2025-12-25', budget: 5000 }
      ]);
    }
  } catch (error) {
    console.error('Get travels error:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

app.post('/api/travels', authenticateToken, async (req, res) => {
  try {
    const db = await getPrisma();
    if (db) {
      const travel = await db.travel.create({
        data: {
          ...req.body,
          userId: req.user.userId
        }
      });
      res.json({ data: travel });
    } else {
      const travel = {
        id: Date.now(),
        ...req.body,
        userId: req.user.userId,
        createdAt: new Date().toISOString()
      };
      res.json({ data: travel });
    }
  } catch (error) {
    console.error('Create travel error:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Atualizar viagem (especialmente gastos reais)
app.put('/api/travels/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const db = await getPrisma();
    
    if (db) {
      // Verificar se a viagem existe e pertence ao usuário
      const existingTravel = await db.travel.findFirst({
        where: { 
          id: id, 
          userId: req.user.userId 
        }
      });
      
      if (!existingTravel) {
        return res.status(404).json({ error: 'Viagem não encontrada' });
      }
      
      // Atualizar viagem
      const updatedTravel = await db.travel.update({
        where: { id: id },
        data: {
          ...req.body,
          updatedAt: new Date()
        }
      });
      
      console.log('✅ Viagem atualizada:', {
        id: updatedTravel.id,
        cidade: updatedTravel.cidade,
        total_realizado: updatedTravel.total_realizado,
        confirmada: updatedTravel.confirmada
      });
      
      res.json({ data: updatedTravel });
    } else {
      res.status(500).json({ error: 'Banco de dados não disponível' });
    }
  } catch (error) {
    console.error('Update travel error:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Delete travel
app.delete('/api/travels/:id', authenticateToken, async (req, res) => {
  try {
    console.log('=== DELETE /api/travels/:id ===');
    console.log('Travel ID:', req.params.id);
    console.log('User ID:', req.user.userId);
    
    const db = await getPrisma();
    if (db) {
      // Verificar se a viagem pertence ao usuário
      const travel = await db.travel.findFirst({
        where: { 
          id: req.params.id,
          userId: req.user.userId 
        }
      });
      
      if (!travel) {
        return res.status(404).json({ error: 'Viagem não encontrada' });
      }
      
      // Deletar a viagem
      await db.travel.delete({
        where: { id: req.params.id }
      });
      
      console.log('✅ Viagem deletada com sucesso');
      res.json({ success: true, message: 'Viagem deletada com sucesso' });
    } else {
      // Mock mode
      const travelIndex = mockData.travels.findIndex(t => t.id === parseInt(req.params.id));
      if (travelIndex > -1) {
        mockData.travels.splice(travelIndex, 1);
        console.log('✅ Viagem deletada (mock)');
        res.json({ success: true, message: 'Viagem deletada com sucesso' });
      } else {
        res.status(404).json({ error: 'Viagem não encontrada' });
      }
    }
  } catch (error) {
    console.error('❌ Delete travel error:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Calendar
app.get('/api/calendar', authenticateToken, async (req, res) => {
  try {
    const db = await getPrisma();
    if (db) {
      const events = await db.calendarEvent.findMany({
        where: { userId: req.user.userId }
      });
      res.json(events);
    } else {
      // Mock data
      res.json([
        { id: 1, title: 'Reunião Mock', date: '2025-01-20', time: '14:00', type: 'meeting' },
        { id: 2, title: 'Evento Mock', date: '2025-01-25', time: '10:00', type: 'personal' }
      ]);
    }
  } catch (error) {
    console.error('Get calendar error:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

app.post('/api/calendar', authenticateToken, async (req, res) => {
  try {
    const db = await getPrisma();
    if (db) {
      // Filtrar apenas campos válidos do schema CalendarEvent
      const validFields = {
        title: req.body.title,
        description: req.body.description,
        startDate: req.body.startDate ? new Date(req.body.startDate) : new Date(),
        endDate: req.body.endDate ? new Date(req.body.endDate) : null,
        location: req.body.location,
        type: req.body.type || 'event',
        userId: req.user.userId
      };
      
      const event = await db.calendarEvent.create({
        data: validFields
      });
      
      // Retornar evento com campos extras para compatibilidade
      const eventWithExtras = {
        ...event,
        goalId: req.body.goalId,
        priority: req.body.priority
      };
      
      res.json({ data: eventWithExtras });
    } else {
      const event = {
        id: Date.now(),
        ...req.body,
        userId: req.user.userId,
        createdAt: new Date().toISOString()
      };
      res.json(event);
    }
  } catch (error) {
    console.error('Create calendar event error:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Financial Planning - Otimizado com cache
app.get('/api/financial-planning', authenticateToken, async (req, res) => {
  try {
    console.log('=== GET /api/financial-planning ===');
    console.log('User ID:', req.user.userId);
    
    // Verificar cache primeiro
    if (isCacheValid('career')) {
      console.log('📦 Retornando financial-planning do cache');
      return res.json(cache.career.data);
    }
    
    const startTime = Date.now();
    
    const db = await getPrisma();
    if (db) {
      console.log('🔍 Buscando dados financeiros para usuário:', req.user.userId);
      
      const planning = await db.financialPlanning.findMany({
        where: { userId: req.user.userId }
      });
      
      const endTime = Date.now();
      console.log(`⏱️ Tempo de consulta: ${endTime - startTime}ms`);
      console.log('📊 Dados encontrados:', planning.length, 'registros');
      
      // Atualizar cache
      cache.career.data = planning;
      cache.career.timestamp = Date.now();
      
      res.json(planning);
    } else {
      console.log('❌ Banco não disponível, retornando mock data');
      // Mock data
      res.json([
        { id: 1, month: '2025-01', income: 6500, expenses: 2500, savings: 4000 },
        { id: 2, month: '2025-02', income: 6500, expenses: 2600, savings: 3900 }
      ]);
    }
  } catch (error) {
    console.error('❌ Get financial planning error:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

app.post('/api/financial-planning', authenticateToken, async (req, res) => {
  try {
    const db = await getPrisma();
    if (db) {
      const planning = await db.financialPlanning.create({
        data: {
          ...req.body,
          userId: req.user.userId
        }
      });
      res.json({ data: planning });
    } else {
      // Mock mode
      const planning = {
        id: Date.now(),
        ...req.body,
        userId: req.user.userId,
        createdAt: new Date().toISOString()
      };
      res.json(planning);
    }
  } catch (error) {
    console.error('Create financial planning error:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Update financial planning
app.put('/api/financial-planning/:id', authenticateToken, async (req, res) => {
  try {
    console.log('=== PUT /api/financial-planning/:id ===');
    console.log('Planning ID:', req.params.id);
    console.log('Body:', req.body);
    console.log('User ID:', req.user.userId);
    
    const db = await getPrisma();
    if (db) {
      // Verificar se o planejamento pertence ao usuário
      const existingPlanning = await db.financialPlanning.findFirst({
        where: { 
          id: req.params.id,
          userId: req.user.userId 
        }
      });
      
      if (!existingPlanning) {
        return res.status(404).json({ error: 'Planejamento não encontrado' });
      }
      
      // Atualizar o planejamento
      const updatedPlanning = await db.financialPlanning.update({
        where: { id: req.params.id },
        data: {
          month: req.body.month || existingPlanning.month,
          income: req.body.income !== undefined ? parseFloat(req.body.income) : existingPlanning.income,
          expenses: req.body.expenses !== undefined ? parseFloat(req.body.expenses) : existingPlanning.expenses,
          savings: req.body.savings !== undefined ? parseFloat(req.body.savings) : existingPlanning.savings,
          notes: req.body.notes || existingPlanning.notes
        }
      });
      
      console.log('✅ Planejamento atualizado com sucesso');
      res.json({ data: updatedPlanning });
    } else {
      // Mock mode
      const planningIndex = mockData.financialPlanning.findIndex(p => p.id === parseInt(req.params.id));
      if (planningIndex > -1) {
        mockData.financialPlanning[planningIndex] = { ...mockData.financialPlanning[planningIndex], ...req.body };
        console.log('✅ Planejamento atualizado (mock)');
        res.json({ data: mockData.financialPlanning[planningIndex] });
      } else {
        res.status(404).json({ error: 'Planejamento não encontrado' });
      }
    }
  } catch (error) {
    console.error('❌ Update financial planning error:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Delete financial planning
app.delete('/api/financial-planning/:id', authenticateToken, async (req, res) => {
  try {
    console.log('=== DELETE /api/financial-planning/:id ===');
    console.log('Planning ID:', req.params.id);
    console.log('User ID:', req.user.userId);
    
    const db = await getPrisma();
    if (db) {
      // Verificar se o planejamento pertence ao usuário
      const planning = await db.financialPlanning.findFirst({
        where: { 
          id: req.params.id,
          userId: req.user.userId 
        }
      });
      
      if (!planning) {
        return res.status(404).json({ error: 'Planejamento não encontrado' });
      }
      
      // Deletar o planejamento
      await db.financialPlanning.delete({
        where: { id: req.params.id }
      });
      
      console.log('✅ Planejamento deletado com sucesso');
      res.json({ success: true, message: 'Planejamento deletado com sucesso' });
    } else {
      // Mock mode
      const planningIndex = mockData.financialPlanning.findIndex(p => p.id === parseInt(req.params.id));
      if (planningIndex > -1) {
        mockData.financialPlanning.splice(planningIndex, 1);
        console.log('✅ Planejamento deletado (mock)');
        res.json({ success: true, message: 'Planejamento deletado com sucesso' });
      } else {
        res.status(404).json({ error: 'Planejamento não encontrado' });
      }
    }
  } catch (error) {
    console.error('❌ Delete financial planning error:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Career - Create
app.post('/api/career', authenticateToken, async (req, res) => {
  try {
    console.log('=== POST /api/career ===');
    console.log('Body:', req.body);
    console.log('User ID:', req.user.userId);
    
    const db = await getPrisma();
    if (db) {
      const careerItem = await db.careerItem.create({
        data: {
          company: req.body.company,
          position: req.body.position,
          startDate: req.body.startDate ? new Date(req.body.startDate) : new Date(),
          endDate: req.body.endDate ? new Date(req.body.endDate) : null,
          current: req.body.current || false,
          description: req.body.description,
          userId: req.user.userId
        }
      });
      
      console.log('✅ Item de carreira criado com sucesso');
      res.json({ data: careerItem });
    } else {
      // Mock mode
      const careerItem = {
        id: Date.now(),
        company: req.body.company,
        position: req.body.position,
        startDate: req.body.startDate ? new Date(req.body.startDate) : new Date(),
        endDate: req.body.endDate ? new Date(req.body.endDate) : null,
        current: req.body.current || false,
        description: req.body.description,
        userId: req.user.userId,
        createdAt: new Date().toISOString()
      };
      res.json({ data: careerItem });
    }
  } catch (error) {
    console.error('❌ Create career error:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Career - Update
app.put('/api/career/:id', authenticateToken, async (req, res) => {
  try {
    console.log('=== PUT /api/career/:id ===');
    console.log('Career ID:', req.params.id);
    console.log('Body:', req.body);
    console.log('User ID:', req.user.userId);
    
    const db = await getPrisma();
    if (db) {
      // Verificar se o item pertence ao usuário
      const existingCareer = await db.careerItem.findFirst({
        where: { 
          id: req.params.id,
          userId: req.user.userId 
        }
      });
      
      if (!existingCareer) {
        return res.status(404).json({ error: 'Item de carreira não encontrado' });
      }
      
      // Atualizar o item
      const updatedCareer = await db.careerItem.update({
        where: { id: req.params.id },
        data: {
          company: req.body.company || existingCareer.company,
          position: req.body.position || existingCareer.position,
          startDate: req.body.startDate ? new Date(req.body.startDate) : existingCareer.startDate,
          endDate: req.body.endDate ? new Date(req.body.endDate) : existingCareer.endDate,
          current: req.body.current !== undefined ? req.body.current : existingCareer.current,
          description: req.body.description || existingCareer.description
        }
      });
      
      console.log('✅ Item de carreira atualizado com sucesso');
      res.json({ data: updatedCareer });
    } else {
      // Mock mode
      const careerIndex = mockData.career.findIndex(c => c.id === parseInt(req.params.id));
      if (careerIndex > -1) {
        mockData.career[careerIndex] = { ...mockData.career[careerIndex], ...req.body };
        console.log('✅ Item de carreira atualizado (mock)');
        res.json({ data: mockData.career[careerIndex] });
      } else {
        res.status(404).json({ error: 'Item de carreira não encontrado' });
      }
    }
  } catch (error) {
    console.error('❌ Update career error:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Career - Delete
app.delete('/api/career/:id', authenticateToken, async (req, res) => {
  try {
    console.log('=== DELETE /api/career/:id ===');
    console.log('Career ID:', req.params.id);
    console.log('User ID:', req.user.userId);
    
    const db = await getPrisma();
    if (db) {
      // Verificar se o item pertence ao usuário
      const career = await db.careerItem.findFirst({
        where: { 
          id: req.params.id,
          userId: req.user.userId 
        }
      });
      
      if (!career) {
        return res.status(404).json({ error: 'Item de carreira não encontrado' });
      }
      
      // Deletar o item
      await db.careerItem.delete({
        where: { id: req.params.id }
      });
      
      console.log('✅ Item de carreira deletado com sucesso');
      res.json({ success: true, message: 'Item de carreira deletado com sucesso' });
    } else {
      // Mock mode
      const careerIndex = mockData.career.findIndex(c => c.id === parseInt(req.params.id));
      if (careerIndex > -1) {
        mockData.career.splice(careerIndex, 1);
        console.log('✅ Item de carreira deletado (mock)');
        res.json({ success: true, message: 'Item de carreira deletado com sucesso' });
      } else {
        res.status(404).json({ error: 'Item de carreira não encontrado' });
      }
    }
  } catch (error) {
    console.error('❌ Delete career error:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Add webhook endpoint for Google Calendar
app.post('/webhook/calendar', (req, res) => {
  realtimeSync.handleWebhook(req, res);
});

// ==================== MÉTODOS HTTP ADICIONAIS ====================

// PATCH endpoints para atualizações parciais
app.patch('/api/goals/:id', authenticateToken, async (req, res) => {
  try {
    console.log('=== PATCH /api/goals/:id ===');
    console.log('Goal ID:', req.params.id);
    console.log('Body:', req.body);
    
    const db = await getPrisma();
    if (db) {
      const existingGoal = await db.goal.findFirst({
        where: { 
          id: req.params.id,
          userId: req.user.userId 
        }
      });
      
      if (!existingGoal) {
        return res.status(404).json({ error: 'Meta não encontrada' });
      }
      
      // Atualização parcial - apenas campos enviados
      const updateData = {};
      if (req.body.category !== undefined) updateData.category = req.body.category;
      if (req.body.title !== undefined) updateData.title = req.body.title;
      if (req.body.description !== undefined) updateData.description = req.body.description;
      if (req.body.progress !== undefined) updateData.progress = req.body.progress;
      if (req.body.dueDate !== undefined) updateData.dueDate = new Date(req.body.dueDate);
      if (req.body.estimatedHours !== undefined) updateData.estimatedHours = req.body.estimatedHours;
      if (req.body.status !== undefined) updateData.status = req.body.status;
      if (req.body.priority !== undefined) updateData.priority = req.body.priority;
      
      const updatedGoal = await db.goal.update({
        where: { id: req.params.id },
        data: updateData
      });
      
      console.log('✅ Meta atualizada parcialmente');
      res.json({ data: updatedGoal });
    } else {
      res.status(500).json({ error: 'Banco de dados não disponível' });
    }
  } catch (error) {
    console.error('❌ PATCH goal error:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

app.patch('/api/projects/:id', authenticateToken, async (req, res) => {
  try {
    console.log('=== PATCH /api/projects/:id ===');
    console.log('Project ID:', req.params.id);
    console.log('Body:', req.body);
    
    const db = await getPrisma();
    if (db) {
      const existingProject = await db.project.findFirst({
        where: { 
          id: req.params.id,
          userId: req.user.userId 
        }
      });
      
      if (!existingProject) {
        return res.status(404).json({ error: 'Projeto não encontrado' });
      }
      
      // Atualização parcial - apenas campos enviados
      const updateData = {};
      if (req.body.title !== undefined) updateData.title = req.body.title;
      if (req.body.description !== undefined) updateData.description = req.body.description;
      if (req.body.category !== undefined) updateData.category = req.body.category;
      if (req.body.tags !== undefined) updateData.tags = req.body.tags;
      if (req.body.assignee !== undefined) updateData.assignee = req.body.assignee;
      if (req.body.dueDate !== undefined) updateData.dueDate = new Date(req.body.dueDate);
      if (req.body.progress !== undefined) updateData.progress = req.body.progress;
      if (req.body.estimatedHours !== undefined) updateData.estimatedHours = req.body.estimatedHours;
      if (req.body.status !== undefined) updateData.status = req.body.status;
      if (req.body.priority !== undefined) updateData.priority = req.body.priority;
      
      const updatedProject = await db.project.update({
        where: { id: req.params.id },
        data: updateData
      });
      
      console.log('✅ Projeto atualizado parcialmente');
      res.json({ data: updatedProject });
    } else {
      res.status(500).json({ error: 'Banco de dados não disponível' });
    }
  } catch (error) {
    console.error('❌ PATCH project error:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// HEAD endpoints para verificar se recursos existem
app.head('/api/goals/:id', authenticateToken, async (req, res) => {
  try {
    const db = await getPrisma();
    if (db) {
      const goal = await db.goal.findFirst({
        where: { 
          id: req.params.id,
          userId: req.user.userId 
        }
      });
      
      if (goal) {
        res.status(200).end();
      } else {
        res.status(404).end();
      }
    } else {
      res.status(404).end();
    }
  } catch (error) {
    res.status(500).end();
  }
});

app.head('/api/projects/:id', authenticateToken, async (req, res) => {
  try {
    const db = await getPrisma();
    if (db) {
      const project = await db.project.findFirst({
        where: { 
          id: req.params.id,
          userId: req.user.userId 
        }
      });
      
      if (project) {
        res.status(200).end();
      } else {
        res.status(404).end();
      }
    } else {
      res.status(404).end();
    }
  } catch (error) {
    res.status(500).end();
  }
});

// ==================== USER PROFILE ENDPOINTS ====================
// Get user profile
app.get('/api/profile', authenticateToken, async (req, res) => {
  try {
    console.log('=== GET /api/profile ===');
    console.log('User ID:', req.user.userId);
    
    const db = await getPrisma();
    if (db) {
      const user = await db.user.findUnique({
        where: { id: req.user.userId },
        select: {
          id: true,
          name: true,
          email: true,
          createdAt: true,
          updatedAt: true
        }
      });
      
      if (user) {
        console.log('✅ Perfil do usuário encontrado');
        res.json({ data: user });
      } else {
        console.log('❌ Usuário não encontrado');
        res.status(404).json({ error: 'Usuário não encontrado' });
      }
    } else {
      console.log('❌ Banco de dados não disponível');
      res.status(500).json({ error: 'Banco de dados não disponível' });
    }
  } catch (error) {
    console.error('❌ Erro ao buscar perfil:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Update user profile
app.put('/api/profile', authenticateToken, async (req, res) => {
  try {
    console.log('=== PUT /api/profile ===');
    console.log('User ID:', req.user.userId);
    console.log('Body:', req.body);
    
    const db = await getPrisma();
    if (db) {
      const updatedUser = await db.user.update({
        where: { id: req.user.userId },
        data: {
          name: req.body.name,
          email: req.body.email
        },
        select: {
          id: true,
          name: true,
          email: true,
          createdAt: true,
          updatedAt: true
        }
      });
      
      console.log('✅ Perfil do usuário atualizado');
      res.json({ data: updatedUser });
    } else {
      console.log('❌ Banco de dados não disponível');
      res.status(500).json({ error: 'Banco de dados não disponível' });
    }
  } catch (error) {
    console.error('❌ Erro ao atualizar perfil:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// TRACE endpoint para debug
app.trace('/api/debug', (req, res) => {
  console.log('=== TRACE /api/debug ===');
  console.log('Headers:', req.headers);
  console.log('Method:', req.method);
  console.log('URL:', req.url);
  console.log('Body:', req.body);
  
  res.status(200).json({
    message: 'Debug information',
    headers: req.headers,
    method: req.method,
    url: req.url,
    timestamp: new Date().toISOString()
  });
});



// ==================== ERROR HANDLERS ====================
// Handler global para erros de CORS
app.use((err, req, res, next) => {
  console.error('❌ ERRO GLOBAL:', err.message);
  console.error('📍 Path:', req.path);
  console.error('🔄 Method:', req.method);
  console.error('📍 Origin:', req.headers.origin);
  
  if (err.message.includes('CORS')) {
    console.error('🚨 ERRO DE CORS DETECTADO!');
    res.status(200).json({ error: 'CORS Error', details: err.message });
  } else {
    res.status(500).json({ error: 'Erro interno', details: err.message });
  }
});

// Catch-all para rotas não encontradas
app.use('*', (req, res) => {
  console.log('❓ Rota não encontrada:', req.method, req.originalUrl);
  console.log('📍 Origin:', req.headers.origin);
  res.status(404).json({ error: 'Endpoint não encontrado' });
});

// ==================== INICIAR SERVIDOR ====================
if (process.env.NODE_ENV !== 'production') {
  server.listen(PORT, () => {
    console.log(`🚀 Backend limpo rodando na porta ${PORT}`);
    console.log(`📡 Health check: http://localhost:${PORT}/api/health`);
    console.log(`🔒 CORS configurado para aceitar frontend Vercel`);
  });
}

// Exportar para Vercel
module.exports = app;
