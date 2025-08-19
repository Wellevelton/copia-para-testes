import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://your-project.supabase.co';
const supabaseAnonKey = 'your-anon-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Funções auxiliares para o banco de dados
export const dbService = {
  // Usuários
  async createUser(userData) {
    const { data, error } = await supabase
      .from('users')
      .insert([userData])
      .select();
    
    if (error) throw error;
    return data[0];
  },

  async getUserById(id) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  },

  // Projetos
  async getProjects(userId) {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  async createProject(project) {
    const { data, error } = await supabase
      .from('projects')
      .insert([project])
      .select();
    
    if (error) throw error;
    return data[0];
  },

  async updateProject(id, updates) {
    const { data, error } = await supabase
      .from('projects')
      .update(updates)
      .eq('id', id)
      .select();
    
    if (error) throw error;
    return data[0];
  },

  async deleteProject(id) {
    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    return true;
  },

  // Metas
  async getGoals(userId) {
    const { data, error } = await supabase
      .from('goals')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  async createGoal(goal) {
    const { data, error } = await supabase
      .from('goals')
      .insert([goal])
      .select();
    
    if (error) throw error;
    return data[0];
  },

  // Finanças
  async getFinances(userId) {
    const { data, error } = await supabase
      .from('finances')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  async createFinance(finance) {
    const { data, error } = await supabase
      .from('finances')
      .insert([finance])
      .select();
    
    if (error) throw error;
    return data[0];
  },

  // Viagens
  async getTravels(userId) {
    const { data, error } = await supabase
      .from('travels')
      .select('*')
      .eq('user_id', userId)
      .order('start_date', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  async createTravel(travel) {
    const { data, error } = await supabase
      .from('travels')
      .insert([travel])
      .select();
    
    if (error) throw error;
    return data[0];
  },

  // Eventos do Calendário
  async getCalendarEvents(userId) {
    const { data, error } = await supabase
      .from('calendar_events')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: true });
    
    if (error) throw error;
    return data;
  },

  async createCalendarEvent(event) {
    const { data, error } = await supabase
      .from('calendar_events')
      .insert([event])
      .select();
    
    if (error) throw error;
    return data[0];
  },

  // Carreira
  async getCareer(userId) {
    const { data, error } = await supabase
      .from('career')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    if (error) throw error;
    return data;
  },

  async updateCareer(userId, updates) {
    const { data, error } = await supabase
      .from('career')
      .upsert([{ user_id: userId, ...updates }])
      .select();
    
    if (error) throw error;
    return data[0];
  }
};

