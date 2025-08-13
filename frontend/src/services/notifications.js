class NotificationService {
  constructor() {
    this.permission = 'default';
    this.init();
  }

  async init() {
    if ('Notification' in window) {
      this.permission = await Notification.requestPermission();
    }
  }

  // Solicitar permissão para notificações
  async requestPermission() {
    if ('Notification' in window) {
      this.permission = await Notification.requestPermission();
      return this.permission === 'granted';
    }
    return false;
  }

  // Enviar notificação push
  async sendNotification(title, options = {}) {
    if (this.permission !== 'granted') {
      const granted = await this.requestPermission();
      if (!granted) return false;
    }

    const defaultOptions = {
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      requireInteraction: false,
      ...options
    };

    const notification = new Notification(title, defaultOptions);

    // Auto-close após 5 segundos
    setTimeout(() => {
      notification.close();
    }, 5000);

    return notification;
  }

  // Notificação de evento próximo
  async notifyEvent(event) {
    const title = `Evento Próximo: ${event.title}`;
    const options = {
      body: `O evento "${event.title}" começa em breve!`,
      tag: `event-${event.id}`,
      data: event
    };

    return this.sendNotification(title, options);
  }

  // Notificação de meta alcançada
  async notifyGoalAchieved(goal) {
    const title = '🎯 Meta Alcançada!';
    const options = {
      body: `Parabéns! Você alcançou a meta "${goal.title}"!`,
      tag: `goal-${goal.id}`,
      data: goal
    };

    return this.sendNotification(title, options);
  }

  // Notificação de lembrete financeiro
  async notifyFinancialReminder(reminder) {
    const title = '💰 Lembrete Financeiro';
    const options = {
      body: reminder.message,
      tag: `finance-${reminder.id}`,
      data: reminder
    };

    return this.sendNotification(title, options);
  }

  // Notificação de projeto atrasado
  async notifyProjectOverdue(project) {
    const title = '⚠️ Projeto Atrasado';
    const options = {
      body: `O projeto "${project.title}" está atrasado!`,
      tag: `project-${project.id}`,
      data: project
    };

    return this.sendNotification(title, options);
  }

  // Notificação de viagem próxima
  async notifyTravelUpcoming(travel) {
    const title = '✈️ Viagem Próxima';
    const options = {
      body: `Sua viagem para ${travel.destination} está chegando!`,
      tag: `travel-${travel.id}`,
      data: travel
    };

    return this.sendNotification(title, options);
  }

  // Agendar notificação
  scheduleNotification(title, options, delay) {
    setTimeout(() => {
      this.sendNotification(title, options);
    }, delay);
  }

  // Agendar notificação para data específica
  scheduleNotificationForDate(title, options, date) {
    const now = new Date().getTime();
    const targetTime = new Date(date).getTime();
    const delay = targetTime - now;

    if (delay > 0) {
      this.scheduleNotification(title, options, delay);
    }
  }

  // Notificação de produtividade
  async notifyProductivityUpdate(stats) {
    const title = '📊 Resumo de Produtividade';
    const options = {
      body: `Você completou ${stats.completed} de ${stats.total} tarefas hoje!`,
      tag: 'productivity-daily',
      data: stats
    };

    return this.sendNotification(title, options);
  }

  // Notificação de backup
  async notifyBackupComplete() {
    const title = '💾 Backup Concluído';
    const options = {
      body: 'Seus dados foram salvos com sucesso!',
      tag: 'backup-complete'
    };

    return this.sendNotification(title, options);
  }

  // Notificação de erro
  async notifyError(error) {
    const title = '❌ Erro Detectado';
    const options = {
      body: `Ocorreu um erro: ${error.message}`,
      tag: 'error-notification',
      data: error
    };

    return this.sendNotification(title, options);
  }

  // Notificação de sucesso
  async notifySuccess(message) {
    const title = '✅ Sucesso!';
    const options = {
      body: message,
      tag: 'success-notification'
    };

    return this.sendNotification(title, options);
  }

  // Configurar lembretes automáticos
  setupAutomaticReminders() {
    // Lembrete diário de produtividade
    this.scheduleNotificationForDate(
      '📊 Hora do Resumo Diário',
      {
        body: 'Que tal fazer um resumo do seu dia?',
        tag: 'daily-summary'
      },
      new Date().setHours(18, 0, 0, 0) // 18:00
    );

    // Lembrete semanal de metas
    this.scheduleNotificationForDate(
      '🎯 Revisão Semanal de Metas',
      {
        body: 'Hora de revisar suas metas da semana!',
        tag: 'weekly-goals'
      },
      new Date().setDate(new Date().getDate() + 7) // Próxima semana
    );
  }

  // Limpar todas as notificações
  clearAllNotifications() {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then(registration => {
        registration.getNotifications().then(notifications => {
          notifications.forEach(notification => {
            notification.close();
          });
        });
      });
    }
  }
}

export const notificationService = new NotificationService();

