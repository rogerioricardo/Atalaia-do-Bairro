

import { supabase } from '../lib/supabaseClient';
import { Neighborhood, Alert, CameraProtocol, ChatMessage, UserRole, User, Notification, Plan, ServiceRequest } from '../types';

// Cache simples em memória para evitar requests repetidos de bairros
let cachedNeighborhoods: Neighborhood[] | null = null;

// Helper to map DB snake_case to Frontend camelCase
const mapProfileToUser = (profile: any): User => ({
  id: profile.id,
  name: profile.name || 'Sem Nome',
  email: profile.email || '',
  role: (profile.role as UserRole) || UserRole.RESIDENT,
  plan: profile.plan || 'FREE',
  neighborhoodId: profile.neighborhood_id,
  address: profile.address,
  city: profile.city,
  state: profile.state,
  phone: profile.phone,
  photoUrl: profile.photo_url,
  lat: profile.lat,
  lng: profile.lng,
  mpPublicKey: profile.mp_public_key,
  mpAccessToken: profile.mp_access_token
});

// Helper to sanitize UUIDs for database calls
const sanitizeUUID = (id?: string): string | null => {
    if (!id || id === 'unknown' || id === 'undefined' || id.trim() === '') {
        return null;
    }
    // Simple regex check for UUID format (loose check)
    if (id.length < 20) return null; 
    return id;
};

export const MockService = {
  // --- NEIGHBORHOODS ---
  getNeighborhoods: async (forceRefresh = false): Promise<Neighborhood[]> => {
    // Se já temos em cache e não forçado, retorna cache instantaneamente
    if (cachedNeighborhoods && !forceRefresh) {
        return cachedNeighborhoods;
    }

    try {
        const { data, error } = await supabase.from('neighborhoods').select('*').order('name');
        
        if (error) {
          console.error("Erro ao buscar bairros (Supabase):", error);
          return cachedNeighborhoods || [];
        }
        
        const hoods = (data || []).map(n => ({
          id: n.id,
          name: n.name,
          // Verifica ambas as colunas para garantir compatibilidade
          iframeUrl: n.iframe_url || n.camera_url || '', 
          lat: n.lat,
          lng: n.lng
        }));

        cachedNeighborhoods = hoods;
        return hoods;
    } catch (e) {
        console.error("Erro de conexão ao buscar bairros:", e);
        return [];
    }
  },

  getNeighborhoodById: async (id: string): Promise<Neighborhood | undefined> => {
    // Tenta cache primeiro
    if (cachedNeighborhoods) {
        const found = cachedNeighborhoods.find(n => n.id === id);
        if (found) return found;
    }

    // Busca direta segura
    try {
        const { data, error } = await supabase.from('neighborhoods').select('*').eq('id', id).maybeSingle();
        
        if (error || !data) {
            console.warn("Bairro não encontrado no banco:", id);
            return undefined;
        }

        return {
            id: data.id,
            name: data.name,
            iframeUrl: data.iframe_url || data.camera_url || '',
            lat: data.lat,
            lng: data.lng
        };
    } catch (e) {
        console.error("Erro ao buscar bairro por ID:", e);
        return undefined;
    }
  },

  createNeighborhood: async (name: string, iframeUrl: string, lat?: number, lng?: number): Promise<Neighborhood> => {
    // Salva em ambas as colunas se existirem, ou prefere iframe_url
    const { data, error } = await supabase.from('neighborhoods').insert([{
      name,
      iframe_url: iframeUrl,
      // camera_url: iframeUrl, // Opcional dependendo da estrutura atual
      lat,
      lng
    }]).select().single();
    
    if (error) throw error;
    cachedNeighborhoods = null;

    return {
      id: data.id,
      name: data.name,
      iframeUrl: data.iframe_url || data.camera_url,
      lat: data.lat,
      lng: data.lng
    };
  },

  deleteNeighborhood: async (id: string): Promise<void> => {
      // Primeiro tenta limpar dependências manualmente se o CASCADE falhar
      try {
          await supabase.from('alerts').delete().eq('neighborhood_id', id);
          await supabase.from('chat_messages').delete().eq('neighborhood_id', id);
      } catch (e) {
          console.warn("Erro ao limpar dependências manualmente, confiando no CASCADE...", e);
      }

      const { error } = await supabase.from('neighborhoods').delete().eq('id', id);
      if (error) {
          console.error("Erro ao excluir bairro:", error);
          throw new Error("Erro ao excluir. Verifique se existem vínculos impedindo a ação. Detalhe: " + error.message);
      }
      cachedNeighborhoods = null;
  },

  // --- ALERTS ---
  getAlerts: async (neighborhoodId?: string): Promise<Alert[]> => {
    let query = supabase.from('alerts').select('*').order('timestamp', { ascending: false }).limit(50);
    const safeNeighborhoodId = sanitizeUUID(neighborhoodId);

    // Se tiver ID de bairro, filtra. Se não tiver (Admin Global ou erro), tenta buscar tudo ou filtra nulo.
    // Para SCR e Integrador, é crucial que eles vejam os alertas do bairro.
    if (safeNeighborhoodId) {
      query = query.eq('neighborhood_id', safeNeighborhoodId);
    }
    const { data } = await query;
    return (data || []).map(a => ({
      id: a.id,
      type: a.type,
      userId: a.user_id,
      userName: a.user_name,
      neighborhoodId: a.neighborhood_id,
      timestamp: new Date(a.timestamp),
      message: a.message,
      image: a.image
    }));
  },

  createAlert: async (alert: Omit<Alert, 'id' | 'timestamp'> & { userRole?: UserRole }): Promise<Alert> => {
    const safeNeighborhoodId = sanitizeUUID(alert.neighborhoodId);

    const { data, error } = await supabase.from('alerts').insert([{
      type: alert.type,
      user_id: alert.userId,
      user_name: alert.userName,
      neighborhood_id: safeNeighborhoodId,
      message: alert.message,
      image: alert.image
    }]).select().single();

    if (error) {
        console.error("Erro ao criar alerta:", error);
        throw error;
    }

    // Auto-post to chat (Fire and Forget - Silent Catch)
    try {
        const alertMessages: Record<string, string> = {
            'PANIC': '🚨 PÂNICO ACIONADO! Preciso de ajuda urgente!',
            'DANGER': '⚠️ PERIGO REPORTADO. Fiquem atentos.',
            'SUSPICIOUS': '👀 Atividade suspeita reportada.',
            'OK': '✅ Tudo tranquilo por aqui.'
        };
        
        await supabase.from('chat_messages').insert([{
            neighborhood_id: safeNeighborhoodId,
            user_id: alert.userId,
            user_name: alert.userName,
            user_role: alert.userRole,
            text: alertMessages[alert.type] || 'Alerta',
            is_system_alert: true,
            alert_type: alert.type,
            image: alert.image
        }]);
    } catch (chatError) {
        console.warn("Falha não-crítica ao postar alerta no chat:", chatError);
    }

    return {
      id: data.id,
      type: data.type,
      userId: data.user_id,
      userName: data.user_name,
      neighborhoodId: data.neighborhood_id,
      timestamp: new Date(data.timestamp),
      message: data.message,
      image: data.image
    };
  },

  // --- PROTOCOLS ---
  generateProtocol: async (cameraName: string, lat?: number, lng?: number): Promise<CameraProtocol> => {
    const cleanName = cameraName.toLowerCase().replace(/[^a-z0-9]/g, '');
    return {
      id: crypto.randomUUID(),
      name: cleanName,
      rtmp: `rtmp://cameras.atalaia.cloud/live/${cleanName}`,
      rtsp: `rtsp://cameras.atalaia.cloud:5554/${cleanName}`,
      lat,
      lng
    };
  },

  sendProtocolToAdmin: async (protocol: CameraProtocol, fromUserName: string): Promise<void> => {
    await supabase.from('notifications').insert([{
      type: 'PROTOCOL_SUBMISSION',
      title: 'Novo Protocolo e Coordenadas',
      message: `Integrador ${fromUserName} enviou dados da câmera ${protocol.name}.`,
      data: protocol,
      from_user_name: fromUserName
    }]);
  },

  getNotifications: async (userId?: string): Promise<Notification[]> => {
    // Busca notificações GLOBAIS (sem user_id) ou DIRECIONADAS (com user_id)
    let query = supabase.from('notifications').select('*').order('timestamp', { ascending: false });
    
    if (userId) {
        query = query.or(`user_id.eq.${userId},user_id.is.null`);
    } else {
        query = query.is('user_id', null);
    }

    const { data } = await query;

    return (data || []).map(n => ({
      id: n.id,
      userId: n.user_id,
      type: n.type,
      title: n.title,
      message: n.message,
      data: n.data,
      fromUserName: n.from_user_name,
      timestamp: new Date(n.timestamp),
      read: n.read
    }));
  },

  deleteNotification: async (id: string): Promise<void> => {
    await supabase.from('notifications').delete().eq('id', id);
  },

  // --- CHAT ---
  getMessages: async (neighborhoodId: string): Promise<ChatMessage[]> => {
    const safeNeighborhoodId = sanitizeUUID(neighborhoodId);
    let query = supabase.from('chat_messages').select('*').order('timestamp', { ascending: true }).limit(100);
    
    if (safeNeighborhoodId) {
        query = query.eq('neighborhood_id', safeNeighborhoodId);
    } else {
        // Se for global ou sem bairro, tenta pegar mensagens sem bairro ou falha silenciosa
        query = query.is('neighborhood_id', null);
    }

    const { data } = await query;

    return (data || []).map(m => ({
      id: m.id,
      neighborhoodId: m.neighborhood_id,
      userId: m.user_id,
      userName: m.user_name,
      userRole: m.user_role as UserRole,
      text: m.text,
      timestamp: new Date(m.timestamp),
      isSystemAlert: m.is_system_alert,
      alertType: m.alert_type,
      image: m.image
    }));
  },

  sendMessage: async (msg: Omit<ChatMessage, 'id' | 'timestamp'>): Promise<ChatMessage> => {
    const safeNeighborhoodId = sanitizeUUID(msg.neighborhoodId);

    const { data, error } = await supabase.from('chat_messages').insert([{
      neighborhood_id: safeNeighborhoodId,
      user_id: msg.userId,
      user_name: msg.userName,
      user_role: msg.userRole,
      text: msg.text
    }]).select().single();

    if (error) {
        console.error("Erro ao enviar mensagem:", error);
        throw error;
    }
    
    return {
      id: data.id,
      neighborhoodId: data.neighborhood_id,
      userId: data.user_id,
      userName: data.user_name,
      userRole: data.user_role as UserRole,
      text: data.text,
      timestamp: new Date(data.timestamp),
      isSystemAlert: data.is_system_alert,
      alertType: data.alert_type,
      image: data.image
    };
  },

  // --- USERS & PROFILES ---
  getUsers: async (neighborhoodId?: string): Promise<User[]> => {
    let query = supabase.from('profiles').select('*');
    const safeNeighborhoodId = sanitizeUUID(neighborhoodId);
    
    if (safeNeighborhoodId) {
        query = query.eq('neighborhood_id', safeNeighborhoodId);
    }
    // IMPORTANTE: Removemos filtros de role aqui. O frontend filtra.
    const { data } = await query;
    return (data || []).map(mapProfileToUser);
  },

  createResident: async (userData: Partial<User>, neighborhoodId: string): Promise<User> => {
      const tempId = crypto.randomUUID();
      const safeNeighborhoodId = sanitizeUUID(neighborhoodId);

      const { data, error } = await supabase.from('profiles').insert([{
          id: tempId,
          name: userData.name,
          email: userData.email,
          phone: userData.phone,
          address: userData.address,
          neighborhood_id: safeNeighborhoodId,
          role: 'RESIDENT',
          plan: 'FREE' 
      }]).select().single();

      if (error) throw new Error(error.message);
      return mapProfileToUser(data);
  },

  deleteUser: async (id: string): Promise<void> => {
      await supabase.from('profiles').delete().eq('id', id);
  },

  getPlans: async (): Promise<Plan[]> => {
      const { data } = await supabase.from('plans').select('*').order('price');
      return (data || []).map(p => ({
          id: p.id,
          name: p.name,
          price: p.price,
          features: p.features,
          recommended: p.recommended
      }));
  },

  updateUserPlan: async (userId: string, planId: string): Promise<void> => {
      const { error } = await supabase.from('profiles').update({ plan: planId }).eq('id', userId);
      if (error) throw error;
  },

  // --- INTEGRATOR CONFIG ---
  updateIntegratorConfig: async (userId: string, publicKey: string, accessToken: string): Promise<void> => {
      const { error } = await supabase
          .from('profiles')
          .update({ mp_public_key: publicKey, mp_access_token: accessToken })
          .eq('id', userId);
      
      if (error) throw error;
  },

  getNeighborhoodIntegrator: async (neighborhoodId: string): Promise<User | null> => {
      const safeId = sanitizeUUID(neighborhoodId);
      if (!safeId) return null;

      const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('neighborhood_id', safeId)
          .eq('role', 'INTEGRATOR')
          .limit(1)
          .maybeSingle();

      if (error || !data) return null;
      return mapProfileToUser(data);
  },

  // --- PATROL LOGS (SCR) ---
  registerPatrol: async (userId: string, neighborhoodId: string, note: string, lat?: number, lng?: number, targetUserId?: string): Promise<void> => {
      const safeNeighborhoodId = sanitizeUUID(neighborhoodId);
      
      // 1. Cria o log de ronda
      const { error } = await supabase.from('patrol_logs').insert([{
          user_id: userId,
          neighborhood_id: safeNeighborhoodId,
          target_user_id: targetUserId,
          note: note,
          lat: lat,
          lng: lng
      }]);
      
      if (error) {
          console.error("Erro ao registrar ronda:", error);
          throw new Error('Falha ao registrar check-in');
      }

      // 2. ATUALIZA A POSIÇÃO DO SCR NO PERFIL PARA O MAPA
      if (lat && lng) {
          try {
              await supabase.from('profiles').update({
                  lat: lat,
                  lng: lng
              }).eq('id', userId);
          } catch (posError) {
              console.warn("Erro ao atualizar posição do SCR no mapa:", posError);
          }
      }

      // 3. Se houver um morador alvo, cria uma notificação para ele
      if (targetUserId) {
          try {
              await supabase.from('notifications').insert([{
                  user_id: targetUserId,
                  type: 'PATROL_ALERT',
                  title: 'Aviso do Motovigia (SCR)',
                  message: `Registro de atividade em sua residência: ${note}`,
                  from_user_name: 'Equipe Tática',
                  read: false
              }]);
          } catch (notifError) {
              console.warn("Erro ao notificar morador, mas log foi salvo:", notifError);
          }
      }
  },

  // --- SERVICE REQUESTS (PREMIUM TO SCR) ---
  createServiceRequest: async (userId: string, userName: string, neighborhoodId: string, type: 'ESCORT' | 'EXTRA_ROUND' | 'TRAVEL_NOTICE'): Promise<void> => {
      const safeNeighborhoodId = sanitizeUUID(neighborhoodId);
      
      const { error } = await supabase.from('service_requests').insert([{
          user_id: userId,
          user_name: userName,
          neighborhood_id: safeNeighborhoodId,
          request_type: type,
          status: 'PENDING'
      }]);

      if (error) {
          console.error("Erro ao solicitar serviço:", error);
          throw new Error('Falha ao enviar solicitação ao SCR');
      }
      
      // NOTIFICAR SCRs DO BAIRRO
      try {
          const scrs = await MockService.getNeighborhoodSCRs(safeNeighborhoodId || '');
          const notifs = scrs.map(scr => ({
              user_id: scr.id,
              type: 'PATROL_ALERT',
              title: 'NOVA SOLICITAÇÃO VIP',
              message: `${userName} solicitou: ${type}`,
              from_user_name: userName
          }));

          if (notifs.length > 0) {
              const { error: notifError } = await supabase.from('notifications').insert(notifs);
              if(notifError) console.error("Erro notificando SCR:", notifError);
          }
      } catch (err) {
          console.error("Falha no fluxo de notificação SCR:", err);
      }
  },

  getNeighborhoodSCRs: async (neighborhoodId: string): Promise<User[]> => {
      const safeId = sanitizeUUID(neighborhoodId);
      if (!safeId) return [];
      
      // Busca usuários SCR do bairro. 
      // O RLS deve permitir que qualquer authenticated leia profiles.
      const { data } = await supabase
          .from('profiles')
          .select('*')
          .eq('neighborhood_id', safeId)
          .eq('role', 'SCR');
          
      return (data || []).map(mapProfileToUser);
  },

  getServiceRequests: async (neighborhoodId: string): Promise<ServiceRequest[]> => {
      const safeNeighborhoodId = sanitizeUUID(neighborhoodId);
      if (!safeNeighborhoodId) return [];

      const { data, error } = await supabase
        .from('service_requests')
        .select('*')
        .eq('neighborhood_id', safeNeighborhoodId)
        .order('created_at', { ascending: false });

      if (error) return [];

      return data.map((r: any) => ({
          id: r.id,
          userId: r.user_id,
          userName: r.user_name,
          neighborhoodId: r.neighborhood_id,
          requestType: r.request_type,
          status: r.status,
          createdAt: new Date(r.created_at)
      }));
  }
};
