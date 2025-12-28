import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabaseClient';

export type ProfileRole = 'talento' | 'empresa';

export interface Profile {
  id: string;
  full_name: string;
  role: ProfileRole;
  location: string | null;
  headline: string | null;
  experience_years?: string | null;
  area?: string | null;
  availability?: string | null;
  linkedin_url?: string | null;
  cv_url?: string | null;
  is_public_profile?: boolean | null;
  created_at: string;
}

interface AuthContextValue {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  role: ProfileRole | null;
  loading: boolean;
  logout: () => Promise<void>;
  refreshProfile: (userId?: string) => Promise<Profile | null>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);
const PROFILE_CACHE_KEY = 'talentos-hub:last-profile';

interface CachedProfile {
  profile: Profile;
  timestamp: number;
}

const PROFILE_TTL = 5 * 60 * 1000; // 5 minutos

const readCachedProfile = (): Profile | null => {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(PROFILE_CACHE_KEY);
    if (!raw) return null;

    const cached = JSON.parse(raw) as CachedProfile;
    const now = Date.now();

    // Verificar si el cache expiró
    if (now - cached.timestamp > PROFILE_TTL) {
      window.localStorage.removeItem(PROFILE_CACHE_KEY);
      return null;
    }

    return cached.profile;
  } catch {
    return null;
  }
};

const writeCachedProfile = (value: Profile | null) => {
  if (typeof window === 'undefined') return;
  if (value) {
    const cached: CachedProfile = {
      profile: value,
      timestamp: Date.now(),
    };
    window.localStorage.setItem(PROFILE_CACHE_KEY, JSON.stringify(cached));
  } else {
    window.localStorage.removeItem(PROFILE_CACHE_KEY);
  }
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfileState] = useState<Profile | null>(() => readCachedProfile());
  const [loading, setLoading] = useState(true);

  const applyProfile = (value: Profile | null) => {
    setProfileState(value);
    writeCachedProfile(value);
  };

  const fetchProfile = async (userId: string): Promise<Profile | null> => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (error) {
      // eslint-disable-next-line no-console
      console.error('Error fetching profile', error.message);
      throw error;
    }

    // Si no hay perfil (null), retornamos null sin lanzar error
    if (!data) {
      // eslint-disable-next-line no-console
      console.warn(`Profile not found for user ${userId}`);
      return null;
    }

    return data as Profile;
  };

  const refreshProfile = useCallback(async (userId?: string) => {
    const targetUserId = userId ?? session?.user?.id;

    if (!targetUserId) {
      applyProfile(null);
      return null;
    }

    try {
      const fetchedProfile = await fetchProfile(targetUserId);
      applyProfile(fetchedProfile);
      return fetchedProfile;
    } catch {
      applyProfile(null);
      return null;
    }
  }, [session?.user?.id]);

  useEffect(() => {
    let isMounted = true;
    let currentUserId: string | null = null;
    let syncCompleted = false; // Track si sync() ya terminó

    const sync = async () => {
      setLoading(true);
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!isMounted) return;

        setSession(session);
        currentUserId = session?.user?.id ?? null;

        if (session?.user) {
          try {
            const fetchedProfile = await fetchProfile(session.user.id);
            if (isMounted) {
              applyProfile(fetchedProfile);
            }
          } catch (profileError) {
            if (isMounted) {
              applyProfile(null);
              // eslint-disable-next-line no-console
              console.warn('Failed to load profile during initial sync', profileError);
            }
          }
        }
      } catch (sessionError) {
        if (isMounted) {
          setSession(null);
          applyProfile(null);
        }
        // eslint-disable-next-line no-console
        console.error('Error during session sync', sessionError);
      } finally {
        if (isMounted) {
          setLoading(false);
          syncCompleted = true;
        }
      }
    };

    sync();

    const { data: listener } = supabase.auth.onAuthStateChange(async (_event, nextSession) => {
      if (!isMounted) return;

      const nextUserId = nextSession?.user?.id ?? null;

      // Ignorar SOLO el evento SIGNED_IN que llega ANTES de que sync() termine
      // Si sync() ya terminó, entonces es un login real que debemos procesar
      if (_event === 'SIGNED_IN' && !syncCompleted) {
        return;
      }

      // Solo hacer fetch si el usuario cambió (login/logout/cambio de cuenta)
      if (nextUserId !== currentUserId) {
        setSession(nextSession);
        currentUserId = nextUserId;

        if (nextSession?.user) {
          setLoading(true);
          try {
            const fetchedProfile = await fetchProfile(nextSession.user.id);
            applyProfile(fetchedProfile);
          } catch {
            applyProfile(null);
            // eslint-disable-next-line no-console
            console.warn('Failed to load profile from auth change');
          } finally {
            setLoading(false);
          }
        } else {
          applyProfile(null);
          setLoading(false);
        }
      } else {
        // Mismo usuario, solo actualizar session sin refetch
        setSession(nextSession);

        // Asegurar que loading se pone en false incluso cuando no hay cambio de usuario
        if (nextSession) {
          setLoading(false);
        }
      }
    });

    return () => {
      isMounted = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  const logout = async () => {
    await supabase.auth.signOut();
    applyProfile(null);
    setSession(null);
  };

  const value = useMemo(() => {
    const user = session?.user ?? null;
    return {
      session,
      user,
      profile,
      role: profile?.role ?? null,
      loading,
      logout,
      refreshProfile,
    };
  }, [session, profile, loading, refreshProfile]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useCurrentProfile = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useCurrentProfile must be used within an AuthProvider');
  }
  const { session, user, profile, role, loading, logout, refreshProfile } = context;

  return { session, user, profile, role, loading, logout, refreshProfile };
};
