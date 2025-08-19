// Simple Google login serverless function
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

  const { idToken, email, name } = req.body;

  if (!email) {
    return res.status(400).json({ error: 'Email é obrigatório' });
  }

  // Create or find user in database (mock for now)
  const userData = {
    id: Date.now(), // Mock ID
    email: email,
    name: name || email.split('@')[0],
    provider: 'google'
  };

  // Generate JWT
  const token = jwt.sign(
    { 
      userId: userData.id, 
      email: userData.email,
      name: userData.name,
      provider: 'google'
    },
    process.env.JWT_SECRET || 'your-secret-key',
    { expiresIn: '24h' }
  );

  res.status(200).json({
    success: true,
    token,
    user: userData
  });
};

