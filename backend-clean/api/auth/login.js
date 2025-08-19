// Simple login serverless function
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

module.exports = async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', 'https://planner-pro-app.vercel.app');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin');
  res.setHeader('Access-Control-Allow-Credentials', 'true');

  // Handle preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email e senha são obrigatórios' });
  }

  // Mock user validation (replace with real database logic)
  const validUsers = [
    { id: 1, email: 'teste@planner.com', password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi' }, // password: password
    { id: 2, email: 'admin@planner.com', password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi' }
  ];

  const user = validUsers.find(u => u.email === email);
  
  if (!user) {
    return res.status(401).json({ error: 'Credenciais inválidas' });
  }

  // Check password (for demo, accept "123456" or use bcrypt)
  const isValidPassword = password === '123456' || await bcrypt.compare(password, user.password);
  
  if (!isValidPassword) {
    return res.status(401).json({ error: 'Credenciais inválidas' });
  }

  // Generate JWT
  const token = jwt.sign(
    { 
      userId: user.id, 
      email: user.email 
    },
    process.env.JWT_SECRET || 'your-secret-key',
    { expiresIn: '24h' }
  );

  res.status(200).json({
    success: true,
    token,
    user: {
      id: user.id,
      email: user.email
    }
  });
};

