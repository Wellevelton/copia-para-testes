// Real-time synchronization service
class RealtimeSyncService {
  constructor() {
    this.ws = null;
    this.isConnected = false;
    this.events = [];
    this.listeners = new Set();
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 1000;
  }

  // Connect to WebSocket server (disabled for Vercel compatibility)
  connect() {
    console.log('⚠️ WebSocket desabilitado para compatibilidade com Vercel');
    this.isConnected = false;
    // Simulate connection for compatibility
    setTimeout(() => {
      this.notifyListeners({ type: 'connected' });
    }, 100);
    return;
    
    /* WebSocket code disabled for Vercel
    try {
      const wsUrl = import.meta.env.PROD 
        ? 'wss://backend-clean-steel.vercel.app'
        : 'ws://localhost:3001';
      
      console.log('🔗 Conectando ao WebSocket...', wsUrl);
      this.ws = new WebSocket(wsUrl);
      
      this.ws.onopen = () => {
        console.log('✅ WebSocket conectado!');
        this.isConnected = true;
        this.reconnectAttempts = 0;
        this.notifyListeners({ type: 'connected' });
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log('📨 Mensagem recebida:', data);
          this.handleMessage(data);
        } catch (error) {
          console.error('❌ Erro ao processar mensagem:', error);
        }
      };

      this.ws.onclose = () => {
        console.log('🔌 WebSocket desconectado');
        this.isConnected = false;
        this.notifyListeners({ type: 'disconnected' });
        this.attemptReconnect();
      };

      this.ws.onerror = (error) => {
        console.error('❌ Erro no WebSocket:', error);
        this.notifyListeners({ type: 'error', error });
      };

    } catch (error) {
      console.error('❌ Erro ao conectar WebSocket:', error);
    }
    */ // End of disabled WebSocket code
  }

  // Attempt to reconnect
  attemptReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      const delay = this.reconnectDelay * this.reconnectAttempts;
      
      console.log(`🔄 Tentando reconectar em ${delay}ms (tentativa ${this.reconnectAttempts})`);
      
      setTimeout(() => {
        this.connect();
      }, delay);
    } else {
      console.log('❌ Máximo de tentativas de reconexão atingido');
      this.notifyListeners({ type: 'max_reconnect_attempts' });
    }
  }

  // Send message to server
  send(data) {
    if (this.ws && this.isConnected) {
      this.ws.send(JSON.stringify(data));
      console.log('📤 Mensagem enviada:', data);
    } else {
      console.warn('⚠️ WebSocket não conectado, mensagem não enviada');
    }
  }

  // Authenticate with Google Calendar
  authenticate(accessToken) {
    this.send({
      type: 'auth',
      accessToken: accessToken
    });
  }

  // Create event in Google Calendar
  createEvent(eventData) {
    this.send({
      type: 'create_event',
      event: eventData
    });
  }

  // Update event in Google Calendar
  updateEvent(eventId, eventData) {
    this.send({
      type: 'update_event',
      eventId: eventId,
      event: eventData
    });
  }

  // Delete event from Google Calendar
  deleteEvent(eventId) {
    this.send({
      type: 'delete_event',
      eventId: eventId
    });
  }

  // Sync calendar
  syncCalendar() {
    this.send({
      type: 'sync_calendar'
    });
  }

  // Handle incoming messages
  handleMessage(data) {
    switch (data.type) {
      case 'connected':
        console.log('🎉 Sincronização em tempo real ativada!');
        break;
        
      case 'auth_success':
        console.log('✅ Autenticação Google Calendar realizada!');
        this.notifyListeners({ type: 'auth_success' });
        break;
        
      case 'auth_error':
        console.error('❌ Erro na autenticação:', data.error);
        this.notifyListeners({ type: 'auth_error', error: data.error });
        break;
        
      case 'event_created':
        console.log('✅ Evento criado:', data.event);
        this.events.push(data.event);
        this.notifyListeners({ 
          type: 'event_created', 
          event: data.event,
          source: data.source 
        });
        break;
        
      case 'event_updated':
        console.log('✅ Evento atualizado:', data.event);
        const index = this.events.findIndex(e => e.id === data.event.id);
        if (index !== -1) {
          this.events[index] = data.event;
        }
        this.notifyListeners({ 
          type: 'event_updated', 
          event: data.event,
          source: data.source 
        });
        break;
        
      case 'event_deleted':
        console.log('✅ Evento deletado:', data.eventId);
        this.events = this.events.filter(e => e.id !== data.eventId);
        this.notifyListeners({ 
          type: 'event_deleted', 
          eventId: data.eventId,
          source: data.source 
        });
        break;
        
      case 'sync_complete':
        console.log(`✅ Sincronização completa: ${data.count} eventos`);
        this.events = data.events;
        this.notifyListeners({ 
          type: 'sync_complete', 
          events: data.events,
          count: data.count 
        });
        break;
        
      case 'google_calendar_changed':
        console.log('🔔 Google Calendar foi alterado externamente');
        this.syncCalendar(); // Re-sync automatically
        this.notifyListeners({ 
          type: 'external_change',
          message: 'Calendário alterado externamente, sincronizando...'
        });
        break;
        
      default:
        console.log('📨 Mensagem não reconhecida:', data);
    }
  }

  // Add event listener
  addListener(callback) {
    this.listeners.add(callback);
  }

  // Remove event listener
  removeListener(callback) {
    this.listeners.delete(callback);
  }

  // Notify all listeners
  notifyListeners(data) {
    this.listeners.forEach(callback => {
      try {
        callback(data);
      } catch (error) {
        console.error('❌ Erro no listener:', error);
      }
    });
  }

  // Get current events
  getEvents() {
    return this.events;
  }

  // Get connection status
  getConnectionStatus() {
    return {
      isConnected: this.isConnected,
      reconnectAttempts: this.reconnectAttempts
    };
  }

  // Disconnect
  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
      this.isConnected = false;
    }
  }
}

// Export singleton instance
export const realtimeSync = new RealtimeSyncService();
export default realtimeSync;
