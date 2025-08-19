import { google } from 'googleapis';

// Configuração do Google Calendar
const SCOPES = ['https://www.googleapis.com/auth/calendar'];
const CREDENTIALS = {
  client_id: 'your-client-id',
  client_secret: 'your-client-secret',
  redirect_uri: 'http://localhost:3000/auth/google/callback'
};

class GoogleCalendarService {
  constructor() {
    this.auth = null;
    this.calendar = null;
  }

  // Inicializar autenticação
  async initialize() {
    try {
      this.auth = new google.auth.OAuth2(
        CREDENTIALS.client_id,
        CREDENTIALS.client_secret,
        CREDENTIALS.redirect_uri
      );

      // Verificar se há token salvo
      const token = localStorage.getItem('google_token');
      if (token) {
        this.auth.setCredentials(JSON.parse(token));
        this.calendar = google.calendar({ version: 'v3', auth: this.auth });
        return true;
      }
      return false;
    } catch (error) {
      console.error('Erro ao inicializar Google Calendar:', error);
      return false;
    }
  }

  // Gerar URL de autorização
  generateAuthUrl() {
    return this.auth.generateAuthUrl({
      access_type: 'offline',
      scope: SCOPES,
      prompt: 'consent'
    });
  }

  // Processar callback de autorização
  async handleAuthCallback(code) {
    try {
      const { tokens } = await this.auth.getToken(code);
      this.auth.setCredentials(tokens);
      localStorage.setItem('google_token', JSON.stringify(tokens));
      this.calendar = google.calendar({ version: 'v3', auth: this.auth });
      return true;
    } catch (error) {
      console.error('Erro ao processar callback:', error);
      return false;
    }
  }

  // Buscar eventos do calendário
  async getEvents(calendarId = 'primary', timeMin = null, timeMax = null) {
    try {
      if (!this.calendar) {
        throw new Error('Calendário não inicializado');
      }

      const response = await this.calendar.events.list({
        calendarId,
        timeMin: timeMin || new Date().toISOString(),
        timeMax: timeMax || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        singleEvents: true,
        orderBy: 'startTime'
      });

      return response.data.items.map(event => ({
        id: event.id,
        title: event.summary,
        description: event.description,
        start: event.start.dateTime || event.start.date,
        end: event.end.dateTime || event.end.date,
        location: event.location,
        attendees: event.attendees,
        reminders: event.reminders
      }));
    } catch (error) {
      console.error('Erro ao buscar eventos:', error);
      throw error;
    }
  }

  // Criar evento no calendário
  async createEvent(eventData) {
    try {
      if (!this.calendar) {
        throw new Error('Calendário não inicializado');
      }

      const event = {
        summary: eventData.title,
        description: eventData.description,
        start: {
          dateTime: eventData.start,
          timeZone: 'America/Sao_Paulo'
        },
        end: {
          dateTime: eventData.end,
          timeZone: 'America/Sao_Paulo'
        },
        location: eventData.location,
        reminders: {
          useDefault: false,
          overrides: [
            { method: 'email', minutes: 24 * 60 },
            { method: 'popup', minutes: 30 }
          ]
        }
      };

      const response = await this.calendar.events.insert({
        calendarId: 'primary',
        resource: event
      });

      return response.data;
    } catch (error) {
      console.error('Erro ao criar evento:', error);
      throw error;
    }
  }

  // Atualizar evento
  async updateEvent(eventId, eventData) {
    try {
      if (!this.calendar) {
        throw new Error('Calendário não inicializado');
      }

      const event = {
        summary: eventData.title,
        description: eventData.description,
        start: {
          dateTime: eventData.start,
          timeZone: 'America/Sao_Paulo'
        },
        end: {
          dateTime: eventData.end,
          timeZone: 'America/Sao_Paulo'
        },
        location: eventData.location
      };

      const response = await this.calendar.events.update({
        calendarId: 'primary',
        eventId,
        resource: event
      });

      return response.data;
    } catch (error) {
      console.error('Erro ao atualizar evento:', error);
      throw error;
    }
  }

  // Deletar evento
  async deleteEvent(eventId) {
    try {
      if (!this.calendar) {
        throw new Error('Calendário não inicializado');
      }

      await this.calendar.events.delete({
        calendarId: 'primary',
        eventId
      });

      return true;
    } catch (error) {
      console.error('Erro ao deletar evento:', error);
      throw error;
    }
  }

  // Sincronizar eventos com o banco local
  async syncEvents() {
    try {
      const googleEvents = await this.getEvents();
      
      // Aqui você pode implementar a lógica para sincronizar
      // com o banco de dados local
      
      return googleEvents;
    } catch (error) {
      console.error('Erro na sincronização:', error);
      throw error;
    }
  }

  // Logout
  logout() {
    localStorage.removeItem('google_token');
    this.auth = null;
    this.calendar = null;
  }
}

export const googleCalendarService = new GoogleCalendarService();

