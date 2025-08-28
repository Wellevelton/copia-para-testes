const { PrismaClient } = require('@prisma/client');

let prisma = null;

async function getPrismaClient() {
  if (!prisma) {
    try {
      console.log('🔗 Inicializando Prisma Client...');
      prisma = new PrismaClient({
        log: ['error', 'warn'],
        datasources: {
          db: {
            url: process.env.DATABASE_URL
          }
        }
      });
      
      // Testar conexão
      await prisma.$connect();
      console.log('✅ Prisma Client conectado com sucesso');
    } catch (error) {
      console.error('❌ Erro ao conectar Prisma Client:', error);
      throw error;
    }
  }
  
  return prisma;
}

module.exports = { getPrismaClient };

