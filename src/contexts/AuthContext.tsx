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

const PERFIS_PADRAO: Record<string, Pick<Usuario, 'nome' | 'role' | 'clube_id'>> = {
  'admin@resenleirao.com': { nome: 'Admin', role: 'admin', clube_id: null },
  'leo@resenleirao.com': { nome: 'Leo', role: 'dono', clube_id: '1' },
  'felipe@resenleirao.com': { nome: 'Felipe', role: 'dono', clube_id: '2' },
  'diego@resenleirao.com': { nome: 'Diego', role: 'dono', clube_id: '3' },
  'pedro@resenleirao.com': { nome: 'Pedro', role: 'dono', clube_id: '4' },
  'berenguer@resenleirao.com': { nome: 'Berenguer', role: 'dono', clube_id: '5' },
  'bruno@resenleirao.com': { nome: 'Bruno', role: 'dono', clube_id: '6' },
  'yves@resenleirao.com': { nome: 'Yves', role: 'dono', clube_id: '7' },
  'adriano@resenleirao.com': { nome: 'Adriano', role: 'dono', clube_id: '8' },
  'jhonny@resenleirao.com': { nome: 'Jhonny', role: 'dono', clube_id: '9' },
  'piscina@resenleirao.com': { nome: 'Piscina', role: 'dono', clube_id: '10' },
};

const montarUsuario = (authUser: {
  id: string;
  email?: string;
  app_metadata?: Record<string, unknown>;
  user_metadata?: Record<string, unknown>;
}, perfil?: Partial<Usuario> | null): Usuario => {
  const email = (perfil?.email || authUser.email || '').toLowerCase();
  const perfilPadrao = PERFIS_PADRAO[email];
  const roleMetadata = authUser.app_metadata?.role;
  const role = perfil?.role
    || (roleMetadata === 'admin' || roleMetadata === 'dono' ? roleMetadata : undefined)
    || perfilPadrao?.role
    || 'visitante';

  return {
    id: authUser.id,
    email,
    nome: perfil?.nome || String(authUser.user_metadata?.nome || perfilPadrao?.nome || authUser.email || 'Usuário'),
    role,
    clube_id: perfil?.clube_id ?? perfilPadrao?.clube_id ?? null,
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
    const getSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          setUser(montarUsuario(session.user));
          void buscarUsuario(session.user).then(setUser);
        }
      } catch (error) {
        console.error('Não foi possível restaurar a sessão:', error);
      } finally {
        setLoading(false);
      }
    };

    void getSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser(montarUsuario(session.user));
        // O callback do Auth precisa retornar antes de iniciar outra consulta
        // ao Supabase; caso contrário signInWithPassword pode ficar bloqueado.
        window.setTimeout(() => {
          void buscarUsuario(session.user).then(setUser);
        }, 0);
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

    setUser(montarUsuario(data.user));
    void buscarUsuario(data.user).then(setUser);
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
