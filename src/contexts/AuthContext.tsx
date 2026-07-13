import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import type { Usuario } from '../types';

interface AuthContextType {
  user: Usuario | null;
  login: (email: string, senha: string) => Promise<boolean>;
  logout: () => Promise<void>;
  isAdmin: boolean;
  isDono: boolean;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<Usuario | null>(null);
  const [loading, setLoading] = useState(true);

// Helper function to get or create user profile
  const getUserProfile = async (authUser: { id: string; email?: string }) => {
    const { data: userData, error: userError } = await supabase
      .from('usuarios')
      .select('*')
      .eq('id', authUser.id)
      .single();

    if (userData) {
      return userData;
    }

    // If user doesn't have profile, create one
    if (userError?.code === 'PGRST116' && authUser.email) {
      const isAdmin = authUser.email === 'admin@resenleirao.com';
      const clubeMap: Record<string, number | null> = {
        'leo@resenleirao.com': 1,
        'felipe@resenleirao.com': 2,
        'diego@resenleirao.com': 3,
        'pedro@resenleirao.com': 4,
        'berenguer@resenleirao.com': 5,
        'bruno@resenleirao.com': 6,
        'yves@resenleirao.com': 7,
        'adriano@resenleirao.com': 8,
        'jhonny@resenleirao.com': 9,
        'piscina@resenleirao.com': 10,
      };

      const { data: newUserData } = await supabase
        .from('usuarios')
        .insert({
          id: authUser.id,
          email: authUser.email,
          nome: authUser.email.split('@')[0],
          role: isAdmin ? 'admin' : 'dono',
          clube_id: clubeMap[authUser.email] || null
        })
        .select()
        .single();

      return newUserData;
    }

    return null;
  };

  useEffect(() => {
    // Verificar sessão atual
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const userData = await getUserProfile(session.user);
        if (userData) {
          setUser({
            id: userData.id,
            email: userData.email,
            nome: userData.nome,
            role: userData.role,
            clube_id: userData.clube_id
          });
        }
      }
      setLoading(false);
    };

    getSession();

    // Escutar mudanças de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const userData = await getUserProfile(session.user);
        if (userData) {
          setUser({
            id: userData.id,
            email: userData.email,
            nome: userData.nome,
            role: userData.role,
            clube_id: userData.clube_id
          });
        }
      } else {
        setUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, senha: string): Promise<boolean> => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password: senha
    });

    if (error) {
      console.error('Login error:', error.message);
      return false;
    }

    if (!data.user) {
      console.error('No user returned from login');
      return false;
    }

    // Buscar ou criar perfil do usuário
    const userData = await getUserProfile(data.user);
    
    if (userData) {
      setUser({
        id: userData.id,
        email: userData.email,
        nome: userData.nome,
        role: userData.role,
        clube_id: userData.clube_id
      });
      return true;
    }
    
    console.error('User profile not found and could not be created');
    return false;
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        isAdmin: user?.role === 'admin',
        isDono: user?.role === 'dono',
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}