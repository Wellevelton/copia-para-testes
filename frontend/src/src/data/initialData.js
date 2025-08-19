// Dados iniciais zerados para teste do banco de dados
// Exceto planejamento financeiro que foi mantido conforme solicitado

export const initialProjects = [];

export const initialFinances = [];

export const initialBudget = {
  monthly: {
    planned: 9500,
    actual: 9250,
    target: 10000,
    categories: {
      'Educação': { planned: 500, actual: 299.90, target: 600 },
      'Viagem': { planned: 2000, actual: 450.00, target: 2500 },
      'Moradia': { planned: 1200, actual: 1200.00, target: 1200 },
      'Alimentação': { planned: 800, actual: 350.00, target: 700 },
      'Transporte': { planned: 400, actual: 280.00, target: 350 },
      'Lazer': { planned: 300, actual: 150.00, target: 400 },
      'Emergência': { planned: 500, actual: 0.00, target: 500 }
    }
  }
};

export const initialGoals = [];

export const initialCareerPlanning = {
  currentRole: '',
  targetRole: '',
  currentSalary: 0,
  targetSalary: 0,
  timeline: '',
  careerGoals: '',
  skills: '',
  education: '',
  experience: '',
  certifications: '',
  salaryGoals: '',
  developmentPlan: '',
  skillsDetailed: [],
  certificationsDetailed: [],
  courses: [],
  milestones: []
};

export const initialCalendarEvents = [];

// Planejamento financeiro mantido conforme solicitado
export const planilhaFinanceira = [
  {
    mes: '2026-01',
    rendaDev: 3500,
    rendaContab: 2500,
    freelas: 500,
    rendaTotal: 6500,
    gastos: 2500,
    aporte: 4000,
    saldoAcum: 4000
  },
  {
    mes: '2026-02',
    rendaDev: 3500,
    rendaContab: 2500,
    freelas: 500,
    rendaTotal: 6500,
    gastos: 2512.5,
    aporte: 3987.5,
    saldoAcum: 8023.5
  },
  {
    mes: '2026-03',
    rendaDev: 3500,
    rendaContab: 2500,
    freelas: 500,
    rendaTotal: 6500,
    gastos: 2525.06,
    aporte: 3974.94,
    saldoAcum: 12070.65
  },
  {
    mes: '2026-04',
    rendaDev: 3500,
    rendaContab: 2500,
    freelas: 500,
    rendaTotal: 6500,
    gastos: 2537.69,
    aporte: 3962.31,
    saldoAcum: 16132.96
  },
  {
    mes: '2026-05',
    rendaDev: 3500,
    rendaContab: 2500,
    freelas: 500,
    rendaTotal: 6500,
    gastos: 2550.39,
    aporte: 3949.61,
    saldoAcum: 20282.57
  },
  {
    mes: '2026-06',
    rendaDev: 3500,
    rendaContab: 2500,
    freelas: 500,
    rendaTotal: 6500,
    gastos: 2563.16,
    aporte: 3936.84,
    saldoAcum: 24519.41
  },
  {
    mes: '2026-07',
    rendaDev: 3500,
    rendaContab: 2500,
    freelas: 500,
    rendaTotal: 6500,
    gastos: 2576.00,
    aporte: 3924.00,
    saldoAcum: 28843.41
  },
  {
    mes: '2026-08',
    rendaDev: 3500,
    rendaContab: 2500,
    freelas: 500,
    rendaTotal: 6500,
    gastos: 2588.91,
    aporte: 3911.09,
    saldoAcum: 33254.50
  },
  {
    mes: '2026-09',
    rendaDev: 3500,
    rendaContab: 2500,
    freelas: 500,
    rendaTotal: 6500,
    gastos: 2601.89,
    aporte: 3898.11,
    saldoAcum: 37752.61
  },
  {
    mes: '2026-10',
    rendaDev: 3500,
    rendaContab: 2500,
    freelas: 500,
    rendaTotal: 6500,
    gastos: 2614.94,
    aporte: 3885.06,
    saldoAcum: 42337.67
  },
  {
    mes: '2026-11',
    rendaDev: 3500,
    rendaContab: 2500,
    freelas: 500,
    rendaTotal: 6500,
    gastos: 2628.06,
    aporte: 3871.94,
    saldoAcum: 47009.61
  },
  {
    mes: '2026-12',
    rendaDev: 3500,
    rendaContab: 2500,
    freelas: 500,
    rendaTotal: 6500,
    gastos: 2641.25,
    aporte: 3858.75,
    saldoAcum: 51768.36
  }
];

export const initialTravels = [];
