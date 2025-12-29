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
import { enrichProfileFromLinkedIn } from '../lib/profileService';

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
    // eslint-disable-next-line no-console
    console.log('[AuthContext] fetchProfile called', { userId, hasUser: !!user });

    // CRITICAL FIX: Delay to allow auth.uid() to propagate after setSession()
    // RLS policies use auth.uid() which may not be immediately available in PostgreSQL context
    // Increased to 1500ms as shorter delays were insufficient for RLS context propagation
    await new Promise(resolve => setTimeout(resolve, 1500));

    // eslint-disable-next-line no-console
    console.log('[AuthContext] Starting profile query after RLS delay');

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    // eslint-disable-next-line no-console
    console.log('[AuthContext] Profile query result', { hasData: !!data, hasError: !!error, errorCode: error?.code });

    if (error) {
      // eslint-disable-next-line no-console
      console.error('[AuthContext] Error fetching profile', error.message, error);
      throw error;
    }

    // Si no hay perfil (null), crearlo si es usuario OAuth de LinkedIn
    if (!data) {
      // eslint-disable-next-line no-console
      console.warn(`[AuthContext] Profile not found for user ${userId}`);

      // Si el usuario viene de OAuth LinkedIn, crear perfil automáticamente
      if (user) {
        const linkedInData = extractLinkedInData(user);
        if (linkedInData) {
          // eslint-disable-next-line no-console
          console.log('[AuthContext] LinkedIn data extracted, creating profile', { name: linkedInData.name, sub: linkedInData.sub });

          try {
            const { data: newProfile, error: createError } = await supabase
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
            console.log('[AuthContext] Profile created successfully', { profileId: newProfile.id, role: newProfile.role });

            // eslint-disable-next-line no-console
            console.log('[AuthContext] Now enriching with LinkedIn data (avatar, etc.)');

            // Enriquecer con avatar y otros datos
            await handleLinkedInCallback(userId, user, true);

            // eslint-disable-next-line no-console
            console.log('[AuthContext] LinkedIn callback processed, refetching enriched profile');

            // Refetch para obtener el perfil completo con avatar
            const { data: enrichedProfile, error: refetchError } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', userId)
              .single();

            if (refetchError) {
              // eslint-disable-next-line no-console
              console.error('[AuthContext] Error refetching enriched profile', refetchError);
              return newProfile as Profile;
            }

            // eslint-disable-next-line no-console
            console.log('[AuthContext] Final enriched profile loaded', { hasAvatar: !!enrichedProfile?.avatar_url });

            return enrichedProfile as Profile;
          } catch (err) {
            // eslint-disable-next-line no-console
            console.error('[AuthContext] Failed to create LinkedIn profile - Exception:', err);
            return null;
          }
        } else {
          // eslint-disable-next-line no-console
          console.warn('[AuthContext] No LinkedIn data found in user metadata');
        }
      }

      return null;
    }

    const profile = data as Profile;

    // CRITICAL FIX: Enriquecer perfiles vacíos de intentos previos de OAuth
    // Si el perfil existe pero está vacío (full_name === '' o !linkedin_id), enriquecerlo
    const isEmptyProfile = !profile.full_name || (!profile.full_name.trim() && !profile.linkedin_id);

    if (isEmptyProfile && user) {
      const linkedInData = extractLinkedInData(user);
      if (linkedInData) {
        // eslint-disable-next-line no-console
        console.log('[AuthContext] Detected empty profile from previous OAuth attempt, enriching with LinkedIn data', {
          userId,
          full_name: profile.full_name,
          linkedin_id: profile.linkedin_id
        });

        try {
          await enrichProfileFromLinkedIn(userId, linkedInData);

          // eslint-disable-next-line no-console
          console.log('[AuthContext] Empty profile enriched successfully, refetching');

          // Refetch profile actualizado
          const { data: enrichedProfile, error: refetchError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single();

          if (refetchError) {
            // eslint-disable-next-line no-console
            console.error('[AuthContext] Error refetching enriched profile', refetchError);
            return profile;
          }

          // eslint-disable-next-line no-console
          console.log('[AuthContext] Enriched profile loaded', {
            full_name: enrichedProfile?.full_name,
            linkedin_id: enrichedProfile?.linkedin_id,
            avatar_url: !!enrichedProfile?.avatar_url
          });

          return enrichedProfile as Profile;
        } catch (error) {
          // eslint-disable-next-line no-console
          console.error('[AuthContext] Failed to enrich empty profile', error);
          return profile;
        }
      } else {
        // eslint-disable-next-line no-console
        console.warn('[AuthContext] Empty profile detected but no LinkedIn data available');
      }
    }

    // Procesar callback de LinkedIn si es perfil nuevo o sin linkedin_id
    if (user && !isEmptyProfile) {
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
          sessionStorage.removeItem('supabase.auth.hash');

          // Parse hash parameters manually since Supabase won't auto-detect restored hash
          const hashParams = new URLSearchParams(preservedHash.substring(1));
          const accessToken = hashParams.get('access_token');
          const refreshToken = hashParams.get('refresh_token');

          if (accessToken && refreshToken) {
            // eslint-disable-next-line no-console
            console.log('[AuthContext] Manually setting session from OAuth tokens');
            try {
              const { data: sessionData, error: setSessionError } = await supabase.auth.setSession({
                access_token: accessToken,
                refresh_token: refreshToken,
              });

              if (setSessionError) {
                // eslint-disable-next-line no-console
                console.error('[AuthContext] Error setting session from OAuth tokens', setSessionError);
              } else {
                // eslint-disable-next-line no-console
                console.log('[AuthContext] Session set successfully from OAuth', { userId: sessionData.session?.user?.id });

                // CRITICAL: Force token refresh to ensure RLS context is properly set
                // eslint-disable-next-line no-console
                console.log('[AuthContext] Forcing token refresh to propagate RLS context');
                await supabase.auth.refreshSession();
                // eslint-disable-next-line no-console
                console.log('[AuthContext] Token refresh completed');
              }
            } catch (error) {
              // eslint-disable-next-line no-console
              console.error('[AuthContext] Failed to set session from OAuth', error);
            }
          }
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

        // eslint-disable-next-line no-console
        console.log('[AuthContext] About to check if nextSession.user exists', {
          hasNextSession: !!nextSession,
          hasUser: !!nextSession?.user,
          userId: nextSession?.user?.id
        });

        if (nextSession?.user) {
          // eslint-disable-next-line no-console
          console.log('[AuthContext] nextSession.user exists, setting loading and calling fetchProfile');
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
          // eslint-disable-next-line no-console
          console.warn('[AuthContext] nextSession.user is null/undefined, cannot fetch profile');
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
