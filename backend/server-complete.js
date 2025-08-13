const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const { body, validationResult } = require('express-validator');

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3000;

// Middleware CORS manual - DEVE vir ANTES das rotas
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  
  // Responder ao preflight request
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

// Middleware CORS do Express (mantido como backup)
app.use(cors({
  origin: [
    'http://localhost:5173', 
    'https://planner-p0cw8rgqx-sobreiras-projects.vercel.app', 
    'https://planner-pro-frontend.netlify.app',
    'https://frontend-37f6fuhhi-sobreiras-projects.vercel.app',
    'https://frontend-31iwn2g5r-sobreiras-projects.vercel.app',
    'https://frontend-prz0ik3kn-sobreiras-projects.vercel.app'
  ],
  credentials: true
}));
app.use(express.json());

// Configurar headers para JavaScript modules
app.use((req, res, next) => {
  if (req.path.endsWith('.js')) {
    res.setHeader('Content-Type', 'application/javascript');
  }
  next();
});

// Endpoint raiz para Vercel
app.get('/', (req, res) => {
  res.json({
    message: 'Planner Pro Backend API',
    status: 'Online',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Middleware de autenticação
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

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Backend funcionando!',
    timestamp: new Date().toISOString(),
    database: 'PostgreSQL + Prisma',
    environment: process.env.NODE_ENV
  });
});

// Autenticação
app.post('/api/auth/register', [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
  body('name').notEmpty().trim()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password, name } = req.body;

    // Verificar se usuário já existe
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return res.status(400).json({ error: 'Email já cadastrado' });
    }

    // Hash da senha
    const hashedPassword = await bcrypt.hash(password, 12);

    // Criar usuário
    const user = await prisma.user.create({
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

    res.json({
      success: true,
      user: { id: user.id, email: user.email, name: user.name },
      token
    });
  } catch (error) {
    console.error('Erro no registro:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

app.post('/api/auth/login', [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    // Buscar usuário
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    // Verificar senha
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Credenciais inválidas' });
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
    console.error('Erro no login:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Autenticação Google
app.post('/api/auth/google', [
  body('idToken').notEmpty(),
  body('email').isEmail().normalizeEmail(),
  body('name').notEmpty().trim(),
  body('googleId').notEmpty()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { idToken, email, name, googleId } = req.body;

    // Verificar se usuário já existe
    let user = await prisma.user.findUnique({
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
    } else {
      // Atualizar googleId se usuário existir
      user = await prisma.user.update({
        where: { id: user.id },
        data: { googleId: googleId }
      });
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
    console.error('Erro no login Google:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Goals
app.get('/api/goals', authenticateToken, async (req, res) => {
  try {
    const goals = await prisma.goal.findMany({
      where: { userId: req.user.userId },
      include: {
        subGoals: {
          orderBy: { order: 'asc' }
        }
      }
    });

    res.json({ data: goals });
  } catch (error) {
    console.error('Erro ao buscar goals:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

app.post('/api/goals', authenticateToken, async (req, res) => {
  try {
    const { title, description, dueDate, category, priority, estimatedHours, tags, subGoals } = req.body;

    const goal = await prisma.goal.create({
      data: {
        title,
        description,
        targetDate: dueDate ? new Date(dueDate) : null,
        category,
        priority,
        estimatedHours,
        tags: tags ? JSON.stringify(tags) : null,
        userId: req.user.userId,
        subGoals: {
          create: subGoals?.map((sg, index) => ({
            title: sg.title,
            description: sg.description,
            order: index
          })) || []
        }
      },
      include: {
        subGoals: true
      }
    });

    res.json({ data: goal });
  } catch (error) {
    console.error('Erro ao criar goal:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

app.put('/api/goals/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, dueDate, category, priority, estimatedHours, tags, subGoals } = req.body;

    const goal = await prisma.goal.update({
      where: { id },
      data: {
        title,
        description,
        targetDate: dueDate ? new Date(dueDate) : null,
        category,
        priority,
        estimatedHours,
        tags: tags ? JSON.stringify(tags) : null,
      },
      include: {
        subGoals: true
      }
    });

    res.json({ data: goal });
  } catch (error) {
    console.error('Erro ao atualizar goal:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

app.delete('/api/goals/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.goal.delete({
      where: { id }
    });

    res.json({ message: 'Goal deleted successfully' });
  } catch (error) {
    console.error('Erro ao deletar goal:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Finances
app.get('/api/finances', authenticateToken, async (req, res) => {
  try {
    const finances = await prisma.finance.findMany({
      where: { userId: req.user.userId },
      orderBy: { date: 'desc' }
    });

    res.json({ data: finances });
  } catch (error) {
    console.error('Erro ao buscar finances:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

app.post('/api/finances', authenticateToken, async (req, res) => {
  try {
    const { description, amount, type, category, date } = req.body;

    const finance = await prisma.finance.create({
      data: {
        description,
        amount: parseFloat(amount),
        type,
        category,
        date: new Date(date),
        userId: req.user.userId
      }
    });

    res.json({ data: finance });
  } catch (error) {
    console.error('Erro ao criar finance:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Travels
app.get('/api/travels', authenticateToken, async (req, res) => {
  try {
    const travels = await prisma.travel.findMany({
      where: { userId: req.user.userId },
      orderBy: { dataInicio: 'asc' }
    });

    res.json({ data: travels });
  } catch (error) {
    console.error('Erro ao buscar travels:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

app.post('/api/travels', authenticateToken, async (req, res) => {
  try {
    const travelData = req.body;
    
    const travel = await prisma.travel.create({
      data: {
        ...travelData,
        userId: req.user.userId,
        dataInicio: new Date(travelData.dataInicio),
        dataFim: new Date(travelData.dataFim)
      }
    });

    res.json({ data: travel });
  } catch (error) {
    console.error('Erro ao criar travel:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Career Planning
app.get('/api/career', authenticateToken, async (req, res) => {
  try {
    // Buscar todos os career items do usuário
    const careerItems = await prisma.careerItem.findMany({
      where: { userId: req.user.userId },
      orderBy: { createdAt: 'desc' }
    });

    // Criar objeto de carreira com dados estruturados
    const careerPlanning = {
      currentRole: 'Desenvolvedor Frontend Jr',
      targetRole: 'Desenvolvedor Full Stack Senior',
      skillsDetailed: [
        { name: 'React', level: 80, category: 'Frontend' },
        { name: 'Node.js', level: 70, category: 'Backend' },
        { name: 'TypeScript', level: 75, category: 'Frontend' }
      ],
      courses: [],
      milestones: [],
      certificationsDetailed: [],
      careerItems: careerItems
    };

    res.json({ data: careerPlanning });
  } catch (error) {
    console.error('Erro ao buscar career:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

app.post('/api/career', authenticateToken, async (req, res) => {
  try {
    const { title, description, company, position, startDate, endDate, status, priority } = req.body;
    
    const career = await prisma.careerItem.create({
      data: {
        title,
        description,
        company,
        position,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        status: status || 'planned',
        priority: priority || 'medium',
        userId: req.user.userId
      }
    });

    res.json({ data: career });
  } catch (error) {
    console.error('Erro ao criar career item:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

app.put('/api/career/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, company, position, startDate, endDate, status, priority } = req.body;
    
    const career = await prisma.careerItem.update({
      where: { id },
      data: {
        title,
        description,
        company,
        position,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        status,
        priority
      }
    });

    res.json({ data: career });
  } catch (error) {
    console.error('Erro ao atualizar career item:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

app.delete('/api/career/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.careerItem.delete({
      where: { id }
    });

    res.json({ message: 'Career item deleted successfully' });
  } catch (error) {
    console.error('Erro ao deletar career item:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Projects
app.get('/api/projects', authenticateToken, async (req, res) => {
  try {
    const projects = await prisma.project.findMany({
      where: { userId: req.user.userId },
      orderBy: { createdAt: 'desc' }
    });

    res.json({ data: projects });
  } catch (error) {
    console.error('Erro ao buscar projects:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

app.post('/api/projects', authenticateToken, async (req, res) => {
  try {
    const { title, description, status, priority, startDate, endDate, category, tags, assignees, dueDate, progress, estimatedHours, actualHours, type, goalId, goals } = req.body;

    const project = await prisma.project.create({
      data: {
        title,
        description,
        status: status || 'pending',
        priority: priority || 'medium',
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        category,
        tags: tags ? JSON.stringify(tags) : null,
        assignees: assignees ? JSON.stringify(assignees) : null,
        dueDate: dueDate ? new Date(dueDate) : null,
        progress: progress || 0,
        estimatedHours: estimatedHours || 0,
        actualHours: actualHours || 0,
        type,
        goalId,
        goals: goals ? JSON.stringify(goals) : null,
        userId: req.user.userId
      }
    });

    res.json({ data: project });
  } catch (error) {
    console.error('Erro ao criar project:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

app.put('/api/projects/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, status, priority, startDate, endDate, category, tags, assignees, dueDate, progress, estimatedHours, actualHours, type, goalId, goals } = req.body;

    const project = await prisma.project.update({
      where: { id },
      data: {
        title,
        description,
        status,
        priority,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        category,
        tags: tags ? JSON.stringify(tags) : null,
        assignees: assignees ? JSON.stringify(assignees) : null,
        dueDate: dueDate ? new Date(dueDate) : null,
        progress,
        estimatedHours,
        actualHours,
        type,
        goalId,
        goals: goals ? JSON.stringify(goals) : null
      }
    });

    res.json({ data: project });
  } catch (error) {
    console.error('Erro ao atualizar project:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

app.delete('/api/projects/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.project.delete({
      where: { id }
    });

    res.json({ message: 'Project deleted successfully' });
  } catch (error) {
    console.error('Erro ao deletar project:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Calendar Events
app.get('/api/calendar', authenticateToken, async (req, res) => {
  try {
    const events = await prisma.calendarEvent.findMany({
      where: { userId: req.user.userId },
      orderBy: { startDate: 'asc' }
    });

    res.json({ data: events });
  } catch (error) {
    console.error('Erro ao buscar calendar events:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

app.post('/api/calendar', authenticateToken, async (req, res) => {
  try {
    const { title, description, startDate, endDate, location, type } = req.body;

    const event = await prisma.calendarEvent.create({
      data: {
        title,
        description,
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : null,
        location,
        type: type || 'event',
        userId: req.user.userId
      }
    });

    res.json({ data: event });
  } catch (error) {
    console.error('Erro ao criar calendar event:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

app.put('/api/calendar/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, startDate, endDate, location, type } = req.body;

    const event = await prisma.calendarEvent.update({
      where: { id },
      data: {
        title,
        description,
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : null,
        location,
        type
      }
    });

    res.json({ data: event });
  } catch (error) {
    console.error('Erro ao atualizar calendar event:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

app.delete('/api/calendar/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.calendarEvent.delete({
      where: { id }
    });

    res.json({ message: 'Calendar event deleted successfully' });
  } catch (error) {
    console.error('Erro ao deletar calendar event:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Financial Planning
app.get('/api/financial-planning', authenticateToken, async (req, res) => {
  try {
    const planning = await prisma.financialPlanning.findMany({
      where: { userId: req.user.userId },
      orderBy: { mes: 'asc' }
    });

    res.json({ data: planning });
  } catch (error) {
    console.error('Erro ao buscar financial planning:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

app.post('/api/financial-planning', authenticateToken, async (req, res) => {
  try {
    const { mes, rendaDev, rendaContab, freelas, rendaTotal, gastos, aporte, saldoAcum } = req.body;

    const planning = await prisma.financialPlanning.create({
      data: {
        mes,
        rendaDev: parseFloat(rendaDev) || 0,
        rendaContab: parseFloat(rendaContab) || 0,
        freelas: parseFloat(freelas) || 0,
        rendaTotal: parseFloat(rendaTotal) || 0,
        gastos: parseFloat(gastos) || 0,
        aporte: parseFloat(aporte) || 0,
        saldoAcum: parseFloat(saldoAcum) || 0,
        userId: req.user.userId
      }
    });

    res.json({ data: planning });
  } catch (error) {
    console.error('Erro ao criar financial planning:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

app.put('/api/financial-planning/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { mes, rendaDev, rendaContab, freelas, rendaTotal, gastos, aporte, saldoAcum } = req.body;

    const planning = await prisma.financialPlanning.update({
      where: { id },
      data: {
        mes,
        rendaDev: parseFloat(rendaDev) || 0,
        rendaContab: parseFloat(rendaContab) || 0,
        freelas: parseFloat(freelas) || 0,
        rendaTotal: parseFloat(rendaTotal) || 0,
        gastos: parseFloat(gastos) || 0,
        aporte: parseFloat(aporte) || 0,
        saldoAcum: parseFloat(saldoAcum) || 0
      }
    });

    res.json({ data: planning });
  } catch (error) {
    console.error('Erro ao atualizar financial planning:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

app.delete('/api/financial-planning/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.financialPlanning.delete({
      where: { id }
    });

    res.json({ message: 'Financial planning item deleted successfully' });
  } catch (error) {
    console.error('Erro ao deletar financial planning:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Route not found',
    path: req.originalUrl
  });
});

// Error handler
app.use((error, req, res, next) => {
  console.error('Erro não tratado:', error);
  res.status(500).json({ error: 'Erro interno do servidor' });
});

// Para desenvolvimento local
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`🚀 Backend completo rodando na porta ${PORT}`);
    console.log(`📡 Health check: http://localhost:${PORT}/api/health`);
    console.log(`🔗 Frontend: http://localhost:5173`);
    console.log(`🗄️ Database: PostgreSQL + Prisma`);
  });
}

// Para Vercel
module.exports = app;
