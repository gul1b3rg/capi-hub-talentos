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
import { handleLinkedInCallback, extractLinkedInData } from '../lib/linkedInAuthService';

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
  avatar_url?: string | null;
  linkedin_id?: string | null;
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

  const fetchProfile = async (userId: string, user?: User): Promise<Profile | null> => {
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

    // Si no hay perfil (null), crearlo si es usuario OAuth de LinkedIn
    if (!data) {
      // eslint-disable-next-line no-console
      console.warn(`Profile not found for user ${userId}`);

      // Si el usuario viene de OAuth LinkedIn, crear perfil automáticamente
      if (user) {
        const linkedInData = extractLinkedInData(user);
        if (linkedInData) {
          // eslint-disable-next-line no-console
          console.log('[AuthContext] Creating profile for LinkedIn OAuth user');

          try {
            const { error: createError } = await supabase
              .from('profiles')
              .insert({
                id: userId,
                role: 'talento',
                full_name: linkedInData.name,
                headline: linkedInData.headline || null,
                linkedin_id: linkedInData.sub,
              })
              .select()
              .single();

            if (createError) {
              // eslint-disable-next-line no-console
              console.error('[AuthContext] Error creating LinkedIn profile', createError);
              return null;
            }

            // eslint-disable-next-line no-console
            console.log('[AuthContext] Profile created, now enriching with LinkedIn data');

            // Enriquecer con avatar y otros datos
            await handleLinkedInCallback(userId, user, true);

            // Refetch para obtener el perfil completo con avatar
            const { data: enrichedProfile } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', userId)
              .single();

            return enrichedProfile as Profile;
          } catch (err) {
            // eslint-disable-next-line no-console
            console.error('[AuthContext] Failed to create LinkedIn profile', err);
            return null;
          }
        }
      }

      return null;
    }

    const profile = data as Profile;

    // Procesar callback de LinkedIn si es perfil nuevo o sin linkedin_id
    if (user) {
      const isNewProfile = !profile.full_name && !profile.headline;
      await handleLinkedInCallback(userId, user, isNewProfile);

      // Refetch profile si fue enriquecido
      if (isNewProfile) {
        const { data: updatedData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .maybeSingle();

        return updatedData as Profile;
      }
    }

    return profile;
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

    const sync = async () => {
      setLoading(true);
      try {
        // eslint-disable-next-line no-console
        console.log('[AuthContext] Starting initial session sync');

        // Restore OAuth hash if it was preserved by main.tsx before BrowserRouter cleared it
        const preservedHash = sessionStorage.getItem('supabase.auth.hash');
        if (preservedHash) {
          // eslint-disable-next-line no-console
          console.log('[AuthContext] Restoring preserved OAuth hash from sessionStorage');
          window.location.hash = preservedHash;
          sessionStorage.removeItem('supabase.auth.hash');

          // Give Supabase a moment to process the restored hash
          await new Promise((resolve) => setTimeout(resolve, 100));
        }

        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!isMounted) return;

        // eslint-disable-next-line no-console
        console.log('[AuthContext] Session obtained', { hasSession: !!session, userId: session?.user?.id });

        setSession(session);
        currentUserId = session?.user?.id ?? null;

        if (session?.user) {
          try {
            // eslint-disable-next-line no-console
            console.log('[AuthContext] Fetching profile for user', session.user.id);
            const fetchedProfile = await fetchProfile(session.user.id, session.user);
            if (isMounted) {
              applyProfile(fetchedProfile);
              // eslint-disable-next-line no-console
              console.log('[AuthContext] Profile applied', { hasProfile: !!fetchedProfile, role: fetchedProfile?.role });
            }
          } catch (profileError) {
            if (isMounted) {
              applyProfile(null);
              // eslint-disable-next-line no-console
              console.error('[AuthContext] Failed to load profile during initial sync', profileError);
            }
          }
        } else {
          // eslint-disable-next-line no-console
          console.log('[AuthContext] No session found, user not authenticated');
        }
      } catch (sessionError) {
        if (isMounted) {
          setSession(null);
          applyProfile(null);
        }
        // eslint-disable-next-line no-console
        console.error('[AuthContext] Error during session sync', sessionError);
      } finally {
        if (isMounted) {
          setLoading(false);
          // eslint-disable-next-line no-console
          console.log('[AuthContext] Initial sync completed');
        }
      }
    };

    sync();

    const { data: listener } = supabase.auth.onAuthStateChange(async (_event, nextSession) => {
      if (!isMounted) return;

      // eslint-disable-next-line no-console
      console.log('[AuthContext] Auth state changed', { event: _event, userId: nextSession?.user?.id });

      const nextUserId = nextSession?.user?.id ?? null;

      // Solo hacer fetch si el usuario cambió (login/logout/cambio de cuenta)
      if (nextUserId !== currentUserId) {
        // eslint-disable-next-line no-console
        console.log('[AuthContext] User changed, fetching profile', { from: currentUserId, to: nextUserId });
        setSession(nextSession);
        currentUserId = nextUserId;

        if (nextSession?.user) {
          setLoading(true);
          try {
            const fetchedProfile = await fetchProfile(nextSession.user.id, nextSession.user);
            applyProfile(fetchedProfile);
            // eslint-disable-next-line no-console
            console.log('[AuthContext] Profile fetched from auth change', { hasProfile: !!fetchedProfile });
          } catch (error) {
            applyProfile(null);
            // eslint-disable-next-line no-console
            console.error('[AuthContext] Failed to load profile from auth change', error);
          } finally {
            setLoading(false);
          }
        } else {
          applyProfile(null);
          setLoading(false);
        }
      } else {
        // Mismo usuario, solo actualizar session sin refetch
        // eslint-disable-next-line no-console
        console.log('[AuthContext] Same user, updating session only');
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
