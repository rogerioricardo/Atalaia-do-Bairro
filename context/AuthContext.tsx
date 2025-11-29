
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import { supabase } from '../lib/supabaseClient';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string, role?: UserRole, name?: string, neighborhoodId?: string) => Promise<void>;
  logout: () => void;
  updateProfile: (data: Partial<User>) => Promise<void>;
  isAuthenticated: boolean;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Helper to map DB profile to User object
  const mapProfile = (profile: any): User => ({
      id: profile.id,
      name: profile.name || profile.email,
      email: profile.email,
      role: profile.role || UserRole.RESIDENT,
      plan: profile.plan || 'FREE',
      neighborhoodId: profile.neighborhood_id,
      address: profile.address,
      city: profile.city,
      state: profile.state,
      phone: profile.phone,
      photoUrl: profile.photo_url,
      lat: profile.lat,
      lng: profile.lng
  });

  const fetchProfile = async (userId: string, email: string) => {
      // Fire and forget - não bloqueia a UI
      try {
          const { data, error } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', userId)
              .single();

          if (data) {
              setUser(mapProfile(data));
          } else if (!data) {
              // SELF HEALING
              console.warn("Profile missing, attempting self-healing...");
              const { data: newProfile } = await supabase
                  .from('profiles')
                  .insert([{
                      id: userId,
                      email: email,
                      name: email.split('@')[0],
                      role: 'RESIDENT',
                      plan: 'FREE'
                  }])
                  .select()
                  .single();
              
              if (newProfile) {
                  setUser(mapProfile(newProfile));
              }
          }
      } catch (e) {
          console.error("Background profile fetch error:", e);
      }
  };

  useEffect(() => {
    const initAuth = async () => {
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (session?.user) {
                // Set optimistic user first
                setUser({
                    id: session.user.id,
                    email: session.user.email!,
                    name: session.user.user_metadata?.name || session.user.email!.split('@')[0],
                    role: (session.user.user_metadata?.role as UserRole) || UserRole.RESIDENT,
                    plan: 'FREE', // Default until fetch
                    neighborhoodId: session.user.user_metadata?.neighborhood_id
                });
                // Fetch full details in background
                fetchProfile(session.user.id, session.user.email!);
            }
        } catch (error) {
            console.error("Auth init error", error);
        } finally {
            setLoading(false);
        }
    };
    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
         if (!user) {
             // Re-apply optimistic update if user state was lost
             setUser({
                id: session.user.id,
                email: session.user.email!,
                name: session.user.user_metadata?.name || session.user.email!.split('@')[0],
                role: (session.user.user_metadata?.role as UserRole) || UserRole.RESIDENT,
                plan: 'FREE',
                neighborhoodId: session.user.user_metadata?.neighborhood_id
            });
            fetchProfile(session.user.id, session.user.email!);
         }
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;

        if (data.user) {
            // LOGIN IMEDIATO (OPTIMISTIC)
            // Não esperamos o banco de dados responder o perfil. Entramos na hora.
            setUser({
                id: data.user.id,
                email: data.user.email!,
                name: data.user.user_metadata?.name || email.split('@')[0],
                role: (data.user.user_metadata?.role as UserRole) || UserRole.RESIDENT,
                plan: 'FREE',
                neighborhoodId: data.user.user_metadata?.neighborhood_id
            });
            
            // Carrega detalhes em background
            fetchProfile(data.user.id, data.user.email!);
        }
    } finally {
        setLoading(false);
    }
  };

  const register = async (email: string, password: string, role: UserRole, name: string, neighborhoodId?: string) => {
      const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
              data: {
                  role: role,
                  name: name,
                  neighborhood_id: neighborhoodId
              }
          }
      });
      if (error) throw error;
      // Auto login logic will catch the session change
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  const updateProfile = async (data: Partial<User>) => {
    if (!user) return;
    
    const dbUpdates = {
        name: data.name,
        address: data.address,
        city: data.city,
        state: data.state,
        phone: data.phone,
        photo_url: data.photoUrl,
        lat: data.lat,
        lng: data.lng
    };

    const { error } = await supabase.from('profiles').update(dbUpdates).eq('id', user.id);
    if (error) throw error;
    
    setUser({ ...user, ...data });
  };

  return (
    <AuthContext.Provider value={{ 
        user, 
        login: async (email, password, role, name, neighborhoodId) => {
             if (name) {
                 return register(email, password, role!, name, neighborhoodId);
             } else {
                 return login(email, password);
             }
        }, 
        logout, 
        updateProfile, 
        isAuthenticated: !!user,
        loading 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
