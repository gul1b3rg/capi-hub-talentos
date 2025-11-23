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

const readCachedProfile = (): Profile | null => {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(PROFILE_CACHE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as Profile;
  } catch {
    return null;
  }
};

const writeCachedProfile = (value: Profile | null) => {
  if (typeof window === 'undefined') return;
  if (value) {
    window.localStorage.setItem(PROFILE_CACHE_KEY, JSON.stringify(value));
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

  const fetchProfile = async (userId: string) => {
    const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).single();

    if (error) {
      // eslint-disable-next-line no-console
      console.error('Error fetching profile', error.message);
      throw error;
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

    const sync = async () => {
      setLoading(true);
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!isMounted) return;

        setSession(session);

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
        } // si no hay sesión aquí, mantenemos el perfil cacheado hasta el evento de auth
      } catch (sessionError) {
        if (isMounted) {
          setSession(null);
          applyProfile(null);
        }
        // eslint-disable-next-line no-console
        console.error('Error during session sync', sessionError);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    sync();

    const { data: listener } = supabase.auth.onAuthStateChange(async (_event, nextSession) => {
      if (!isMounted) return;
      setSession(nextSession);
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
