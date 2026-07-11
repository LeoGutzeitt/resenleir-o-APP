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

const montarUsuario = (authUser: {
  id: string;
  email?: string;
  app_metadata?: Record<string, unknown>;
  user_metadata?: Record<string, unknown>;
}, perfil?: Partial<Usuario> | null): Usuario => {
  const roleMetadata = authUser.app_metadata?.role;
  const role = perfil?.role
    || (roleMetadata === 'admin' || roleMetadata === 'dono' ? roleMetadata : 'visitante');

  return {
    id: authUser.id,
    email: perfil?.email || authUser.email || '',
    nome: perfil?.nome || String(authUser.user_metadata?.nome || authUser.email || 'Usuário'),
    role,
    clube_id: perfil?.clube_id ?? null,
  };
};

const buscarUsuario = async (authUser: Parameters<typeof montarUsuario>[0]): Promise<Usuario> => {
  const { data: perfil, error } = await supabase
    .from('usuarios')
    .select('id, email, nome, role, clube_id')
    .eq('id', authUser.id)
    .maybeSingle();

  if (error) {
    console.error('Não foi possível carregar o perfil do usuário:', error.message);
  }

  return montarUsuario(authUser, perfil);
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<Usuario | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Verificar sessão atual
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) setUser(await buscarUsuario(session.user));
      setLoading(false);
    };

    getSession();

    // Escutar mudanças de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        void buscarUsuario(session.user).then(setUser);
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

    if (error || !data.user) {
      return false;
    }

    setUser(await buscarUsuario(data.user));
    return true;
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

// oxlint-disable-next-line react/only-export-components
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
