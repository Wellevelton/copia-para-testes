const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed do banco de dados...');

  // Criar usuário de teste
  const hashedPassword = await bcrypt.hash('123456', 12);
  
  const user = await prisma.user.upsert({
    where: { email: 'teste@planner.com' },
    update: {},
    create: {
      email: 'teste@planner.com',
      name: 'Usuário Teste',
      password: hashedPassword,
    },
  });

  console.log('✅ Usuário criado:', user.email);

  // Dados de planejamento financeiro (mantidos como exemplo)
  const financialPlanningData = [
    {
      mes: '2026-01',
      rendaDev: 3500,
      rendaContab: 2500,
      freelas: 500,
      rendaTotal: 6500,
      gastos: 2500,
      aporte: 4000,
      saldoAcum: 4000,
      userId: user.id
    },
    {
      mes: '2026-02',
      rendaDev: 3500,
      rendaContab: 2500,
      freelas: 500,
      rendaTotal: 6500,
      gastos: 2512.5,
      aporte: 3987.5,
      saldoAcum: 8023.5,
      userId: user.id
    },
    {
      mes: '2026-03',
      rendaDev: 3500,
      rendaContab: 2500,
      freelas: 500,
      rendaTotal: 6500,
      gastos: 2525.06,
      aporte: 3974.94,
      saldoAcum: 12070.65,
      userId: user.id
    }
  ];

  // Inserir dados de planejamento financeiro
  for (const data of financialPlanningData) {
    await prisma.financialPlanning.upsert({
      where: { 
        mes_userId: {
          mes: data.mes,
          userId: user.id
        }
      },
      update: data,
      create: data,
    });
  }

  console.log('✅ Dados de planejamento financeiro inseridos');

  console.log('🎉 Seed concluído com sucesso!');
  console.log('📧 Email de teste: teste@planner.com');
  console.log('🔑 Senha: 123456');
}

main()
  .catch((e) => {
    console.error('❌ Erro no seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
