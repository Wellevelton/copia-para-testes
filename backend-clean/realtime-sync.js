// Real-time Google Calendar synchronization
const { google } = require('googleapis');
const WebSocket = require('ws');

class RealtimeSync {
  constructor() {
    this.clients = new Set();
    this.calendar = null;
    this.oauth2Client = null;
    this.setupGoogleAuth();
  }

  setupGoogleAuth() {
    this.oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );

    this.calendar = google.calendar({ version: 'v3', auth: this.oauth2Client });
  }

  // Setup WebSocket server
  setupWebSocketServer(server) {
    this.wss = new WebSocket.Server({ server });
    
    this.wss.on('connection', (ws, req) => {
      console.log('🔗 Cliente conectado para sync em tempo real');
      this.clients.add(ws);

      ws.on('message', async (message) => {
        try {
          const data = JSON.parse(message);
          await this.handleClientMessage(ws, data);
        } catch (error) {
          console.error('❌ Erro ao processar mensagem:', error);
        }
      });

      ws.on('close', () => {
        console.log('🔌 Cliente desconectado');
        this.clients.delete(ws);
      });

      // Send initial connection confirmation
      ws.send(JSON.stringify({
        type: 'connected',
        message: 'Sincronização em tempo real ativa!'
      }));
    });
  }

  // Handle messages from clients
  async handleClientMessage(ws, data) {
    console.log('📨 Mensagem recebida:', data.type);

    switch (data.type) {
      case 'auth':
        await this.authenticateUser(ws, data.accessToken);
        break;
      case 'create_event':
        await this.createEvent(ws, data.event);
        break;
      case 'update_event':
        await this.updateEvent(ws, data.eventId, data.event);
        break;
      case 'delete_event':
        await this.deleteEvent(ws, data.eventId);
        break;
      case 'sync_calendar':
        await this.syncCalendar(ws);
        break;
    }
  }

  // Authenticate user with Google
  async authenticateUser(ws, accessToken) {
    try {
      this.oauth2Client.setCredentials({ access_token: accessToken });
      
      // Test authentication
      const response = await this.calendar.calendars.get({
        calendarId: 'primary'
      });

      console.log('✅ Usuário autenticado no Google Calendar');
      
      // Setup webhook for this user
      await this.setupWebhook();
      
      ws.send(JSON.stringify({
        type: 'auth_success',
        message: 'Autenticação Google Calendar realizada!'
      }));

      // Initial sync
      await this.syncCalendar(ws);
      
    } catch (error) {
      console.error('❌ Erro na autenticação:', error);
      ws.send(JSON.stringify({
        type: 'auth_error',
        error: error.message
      }));
    }
  }

  // Create event in Google Calendar
  async createEvent(ws, eventData) {
    try {
      console.log('📅 Criando evento no Google Calendar...');
      
      const event = {
        summary: eventData.title,
        description: eventData.description || '',
        start: {
          dateTime: eventData.startDateTime,
          timeZone: 'America/Sao_Paulo',
        },
        end: {
          dateTime: eventData.endDateTime,
          timeZone: 'America/Sao_Paulo',
        },
        location: eventData.location || '',
      };

      const response = await this.calendar.events.insert({
        calendarId: 'primary',
        resource: event,
      });

      console.log('✅ Evento criado:', response.data.id);

      // Broadcast to all connected clients
      this.broadcast({
        type: 'event_created',
        event: response.data,
        source: 'app'
      });

      ws.send(JSON.stringify({
        type: 'create_success',
        event: response.data
      }));

    } catch (error) {
      console.error('❌ Erro ao criar evento:', error);
      ws.send(JSON.stringify({
        type: 'create_error',
        error: error.message
      }));
    }
  }

  // Update event in Google Calendar
  async updateEvent(ws, eventId, eventData) {
    try {
      console.log('📝 Atualizando evento no Google Calendar...');
      
      const event = {
        summary: eventData.title,
        description: eventData.description || '',
        start: {
          dateTime: eventData.startDateTime,
          timeZone: 'America/Sao_Paulo',
        },
        end: {
          dateTime: eventData.endDateTime,
          timeZone: 'America/Sao_Paulo',
        },
        location: eventData.location || '',
      };

      const response = await this.calendar.events.update({
        calendarId: 'primary',
        eventId: eventId,
        resource: event,
      });

      console.log('✅ Evento atualizado:', eventId);

      // Broadcast to all connected clients
      this.broadcast({
        type: 'event_updated',
        event: response.data,
        source: 'app'
      });

      ws.send(JSON.stringify({
        type: 'update_success',
        event: response.data
      }));

    } catch (error) {
      console.error('❌ Erro ao atualizar evento:', error);
      ws.send(JSON.stringify({
        type: 'update_error',
        error: error.message
      }));
    }
  }

  // Delete event from Google Calendar
  async deleteEvent(ws, eventId) {
    try {
      console.log('🗑️ Deletando evento do Google Calendar...');
      
      await this.calendar.events.delete({
        calendarId: 'primary',
        eventId: eventId,
      });

      console.log('✅ Evento deletado:', eventId);

      // Broadcast to all connected clients
      this.broadcast({
        type: 'event_deleted',
        eventId: eventId,
        source: 'app'
      });

      ws.send(JSON.stringify({
        type: 'delete_success',
        eventId: eventId
      }));

    } catch (error) {
      console.error('❌ Erro ao deletar evento:', error);
      ws.send(JSON.stringify({
        type: 'delete_error',
        error: error.message
      }));
    }
  }

  // Sync calendar events
  async syncCalendar(ws) {
    try {
      console.log('🔄 Sincronizando calendário...');
      
      const now = new Date();
      const twoMonthsFromNow = new Date();
      twoMonthsFromNow.setMonth(now.getMonth() + 2);

      const response = await this.calendar.events.list({
        calendarId: 'primary',
        timeMin: now.toISOString(),
        timeMax: twoMonthsFromNow.toISOString(),
        maxResults: 250,
        singleEvents: true,
        orderBy: 'startTime',
      });

      const events = response.data.items || [];
      console.log(`✅ ${events.length} eventos sincronizados`);

      ws.send(JSON.stringify({
        type: 'sync_complete',
        events: events,
        count: events.length
      }));

    } catch (error) {
      console.error('❌ Erro na sincronização:', error);
      ws.send(JSON.stringify({
        type: 'sync_error',
        error: error.message
      }));
    }
  }

  // Setup webhook to receive Google Calendar changes
  async setupWebhook() {
    try {
      console.log('🔔 Configurando webhook do Google Calendar...');
      
      const channelId = `planner-${Date.now()}`;
      const webhookUrl = `${process.env.BASE_URL || 'https://planner-pro-api.vercel.app'}/webhook/calendar`;
      
      const response = await this.calendar.events.watch({
        calendarId: 'primary',
        resource: {
          id: channelId,
          type: 'web_hook',
          address: webhookUrl,
          expiration: Date.now() + (7 * 24 * 60 * 60 * 1000) // 7 dias
        }
      });

      console.log('✅ Webhook configurado:', response.data.id);
      
    } catch (error) {
      console.log('⚠️ Webhook não configurado (normal em desenvolvimento):', error.message);
    }
  }

  // Broadcast message to all connected clients
  broadcast(message) {
    const data = JSON.stringify(message);
    this.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(data);
      }
    });
  }

  // Handle webhook from Google Calendar
  handleWebhook(req, res) {
    console.log('🔔 Webhook recebido do Google Calendar');
    
    // Google Calendar changed, sync with all clients
    this.broadcast({
      type: 'google_calendar_changed',
      message: 'Calendário do Google foi alterado, sincronizando...'
    });

    res.status(200).send('OK');
  }
}

module.exports = RealtimeSync;


