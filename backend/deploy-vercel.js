const { execSync } = require('child_process');

console.log('🚀 Configurando Vercel automaticamente...');

try {
  // Instalar Vercel CLI globalmente
  console.log('📦 Instalando Vercel CLI...');
  execSync('npm install -g vercel', { stdio: 'inherit' });
  
  // Fazer login no Vercel
  console.log('🔐 Fazendo login no Vercel...');
  execSync('vercel login', { stdio: 'inherit' });
  
  // Configurar variáveis de ambiente
  console.log('⚙️ Configurando variáveis de ambiente...');
  execSync('vercel env add DATABASE_URL production', { 
    stdio: 'inherit',
    input: 'postgresql://postgres:123456Teste@db.hmhjmpxsoaoacuntiwtq.supabase.co:5432/postgres\n'
  });
  
  execSync('vercel env add JWT_SECRET production', { 
    stdio: 'inherit',
    input: 'seu-jwt-secret-super-secreto-aqui-2024\n'
  });
  
  execSync('vercel env add CORS_ORIGIN production', { 
    stdio: 'inherit',
    input: 'https://planner-p0cw8rgqx-sobreiras-projects.vercel.app\n'
  });
  
  // Fazer deploy
  console.log('🚀 Fazendo deploy...');
  execSync('vercel --prod', { stdio: 'inherit' });
  
  console.log('✅ Deploy concluído com sucesso!');
  
} catch (error) {
  console.error('❌ Erro:', error.message);
  process.exit(1);
}

