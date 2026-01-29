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
import { encryptData, decryptData } from '../lib/encryption';

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
  current_company?: string | null;
  web_url?: string | null;
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
    const encrypted = window.localStorage.getItem(PROFILE_CACHE_KEY);
    if (!encrypted) return null;

    // Decrypt the cached data
    const cached = decryptData<CachedProfile>(encrypted);
    if (!cached) {
      // If decryption fails, remove invalid cache
      window.localStorage.removeItem(PROFILE_CACHE_KEY);
      return null;
    }

    const now = Date.now();

    // Verificar si el cache expiró
    if (now - cached.timestamp > PROFILE_TTL) {
      window.localStorage.removeItem(PROFILE_CACHE_KEY);
      return null;
    }

    return cached.profile;
  } catch {
    // If any error occurs, remove cache and return null
    window.localStorage.removeItem(PROFILE_CACHE_KEY);
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
    // Encrypt the cached data before storing
    const encrypted = encryptData(cached);
    window.localStorage.setItem(PROFILE_CACHE_KEY, encrypted);
  } else {
    window.localStorage.removeItem(PROFILE_CACHE_KEY);
  }
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfileState] = useState<Profile | null>(() => readCachedProfile());
  // Only show loading if no cached profile exists
  const [loading, setLoading] = useState(() => {
    const cached = readCachedProfile();
    return !cached;  // Start with loading=false if cache exists
  });

  const applyProfile = (value: Profile | null) => {
    setProfileState(value);
    writeCachedProfile(value);
  };

  const fetchProfile = async (userId: string, user?: User): Promise<Profile | null> => {
    // eslint-disable-next-line no-console
    console.log('[AuthContext] fetchProfile called', { userId, hasUser: !!user });

    // ALTERNATIVE SOLUTION: Retry query with exponential backoff and timeout to handle RLS propagation delay
    // This approach doesn't rely on waiting a fixed time but actively retries until success or timeout
    let data = null;
    let error = null;
    const maxRetries = 3; // Reduced from 6 to 3 for faster UX
    let retryDelay = 100; // Reduced from 150ms to 100ms

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      // eslint-disable-next-line no-console
      console.log(`[AuthContext] Profile query attempt ${attempt}/${maxRetries}`);

      const queryPromise = supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      // Reduced timeout from 3s to 1s per attempt for faster UX
      const timeoutPromise = new Promise<{ data: null, error: any }>((_, reject) =>
        setTimeout(() => reject(new Error('Query timeout')), 1000)
      );

      try {
        const result = await Promise.race([queryPromise, timeoutPromise]);
        data = result.data;
        error = result.error;

        // eslint-disable-next-line no-console
        console.log(`[AuthContext] Attempt ${attempt} result:`, { hasData: !!data, hasError: !!error, errorCode: error?.code });

        // If successful (data found or confirmed not exists), break
        if (data || error?.code === 'PGRST116') {
          // eslint-disable-next-line no-console
          console.log('[AuthContext] Profile query succeeded or confirmed not exists');
          break;
        }

        // If we got an error that's not timeout-related, also break
        if (error && error.code !== 'PGRST116') {
          // eslint-disable-next-line no-console
          console.error('[AuthContext] Query failed with error:', error);
          break;
        }
      } catch (timeoutError) {
        // eslint-disable-next-line no-console
        console.warn(`[AuthContext] Attempt ${attempt} timed out after 1s, will retry...`);
        error = timeoutError as any;
      }

      // Wait before retrying (exponential backoff)
      if (attempt < maxRetries) {
        // eslint-disable-next-line no-console
        console.log(`[AuthContext] Waiting ${retryDelay}ms before retry`);
        await new Promise(resolve => setTimeout(resolve, retryDelay));
        retryDelay = Math.min(retryDelay * 1.8, 2000); // Cap at 2 seconds
      }
    }

    // eslint-disable-next-line no-console
    console.log('[AuthContext] Final profile query result after all retries', { hasData: !!data, hasError: !!error, errorCode: error?.code });

    // If error is a timeout after all retries, don't throw - treat as profile not found
    // This allows the code to proceed with profile creation
    if (error && error.message !== 'Query timeout') {
      // eslint-disable-next-line no-console
      console.error('[AuthContext] Error fetching profile (non-timeout)', error.message, error);
      throw error;
    }

    if (error?.message === 'Query timeout') {
      // eslint-disable-next-line no-console
      console.warn('[AuthContext] Query timed out after all retries - RLS context may not be ready. Proceeding as if profile not found.');
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
            // eslint-disable-next-line no-console
            console.log('[AuthContext] Attempting to INSERT profile with LinkedIn data...');

            // Wrap INSERT with timeout to prevent hanging
            const insertPromise = supabase
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

            const insertTimeout = new Promise<{ data: null, error: any }>((_, reject) =>
              setTimeout(() => reject(new Error('INSERT timeout')), 2000) // Reduced from 5s to 2s
            );

            const { data: newProfile, error: createError } = await Promise.race([insertPromise, insertTimeout]);

            if (createError) {
              // eslint-disable-next-line no-console
              console.error('[AuthContext] Error creating LinkedIn profile', createError);

              // If timeout, it means RLS is blocking the INSERT too
              if (createError.message === 'INSERT timeout') {
                // eslint-disable-next-line no-console
                console.error('[AuthContext] INSERT timed out - RLS policies are blocking INSERT. Profile may already exist or RLS needs fixing.');
                // Try to fetch the profile again in case it was created by a trigger
                const { data: existingProfile } = await supabase
                  .from('profiles')
                  .select('*')
                  .eq('id', userId)
                  .maybeSingle();

                if (existingProfile) {
                  // eslint-disable-next-line no-console
                  console.log('[AuthContext] Found existing profile after INSERT timeout');
                  return existingProfile as Profile;
                }
              }

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
    let isRefreshing = false; // Flag to prevent duplicate fetches during refresh
    let initialSyncCompleted = false; // Flag to track if initial sync has completed

    const sync = async () => {
      // Check if we have cached profile
      const cachedProfile = readCachedProfile();

      // Only set loading if we don't have cache
      if (!cachedProfile) {
        setLoading(true);
      }

      try {
        // eslint-disable-next-line no-console
        console.log('[AuthContext] Starting initial session sync', { hasCachedProfile: !!cachedProfile });

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
              isRefreshing = true; // Set flag to prevent duplicate fetches

              const { data: sessionData, error: setSessionError } = await supabase.auth.setSession({
                access_token: accessToken,
                refresh_token: refreshToken,
              });

              if (setSessionError) {
                // eslint-disable-next-line no-console
                console.error('[AuthContext] Error setting session from OAuth tokens', setSessionError);
                isRefreshing = false;
              } else {
                // eslint-disable-next-line no-console
                console.log('[AuthContext] Session set successfully from OAuth', { userId: sessionData.session?.user?.id });

                // CRITICAL: Force token refresh to ensure RLS context is properly set
                // eslint-disable-next-line no-console
                console.log('[AuthContext] Forcing token refresh to propagate RLS context');
                await supabase.auth.refreshSession();
                // eslint-disable-next-line no-console
                console.log('[AuthContext] Token refresh completed');

                isRefreshing = false; // Clear flag after refresh completes
              }
            } catch (error) {
              // eslint-disable-next-line no-console
              console.error('[AuthContext] Failed to set session from OAuth', error);
              isRefreshing = false;
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
            // If cache exists and matches user, use it immediately and fetch in background
            if (cachedProfile && cachedProfile.id === session.user.id) {
              // eslint-disable-next-line no-console
              console.log('[AuthContext] Using cached profile, fetching fresh in background');

              // UI already showing cached data, fetch fresh in background
              fetchProfile(session.user.id, session.user)
                .then(fresh => {
                  if (isMounted && fresh) {
                    applyProfile(fresh);  // Update silently when ready
                    // eslint-disable-next-line no-console
                    console.log('[AuthContext] Profile refreshed from background fetch');
                  }
                })
                .catch(err => {
                  // eslint-disable-next-line no-console
                  console.error('[AuthContext] Background profile refresh failed', err);
                  // Keep using cached profile
                });
            } else {
              // No cache or different user - await fetch before showing UI
              // eslint-disable-next-line no-console
              console.log('[AuthContext] Fetching profile for user', session.user.id);
              const fetchedProfile = await fetchProfile(session.user.id, session.user);
              if (isMounted) {
                applyProfile(fetchedProfile);
                // eslint-disable-next-line no-console
                console.log('[AuthContext] Profile applied', { hasProfile: !!fetchedProfile, role: fetchedProfile?.role });
              }
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
          initialSyncCompleted = true; // Mark initial sync as completed
          // eslint-disable-next-line no-console
          console.log('[AuthContext] Initial sync completed');
        }
      }
    };

    sync();

    const { data: listener } = supabase.auth.onAuthStateChange(async (event, nextSession) => {
      if (!isMounted) return;

      // Skip INITIAL_SESSION - always handled by initial sync
      if (event === 'INITIAL_SESSION') {
        // eslint-disable-next-line no-console
        console.log('[AuthContext] Skipping INITIAL_SESSION event - handled by initial sync');
        return;
      }

      // Skip SIGNED_IN only during initial mount (before initial sync completes)
      // After initial sync, we need to handle SIGNED_IN for actual logins
      if (event === 'SIGNED_IN' && !initialSyncCompleted) {
        // eslint-disable-next-line no-console
        console.log('[AuthContext] Skipping SIGNED_IN event - initial sync not yet completed');
        return;
      }

      // Skip if we're currently refreshing session during OAuth - will be handled by sync()
      if (isRefreshing) {
        // eslint-disable-next-line no-console
        console.log('[AuthContext] Skipping auth state change during OAuth refresh', { event });
        return;
      }

      // eslint-disable-next-line no-console
      console.log('[AuthContext] Auth state changed', { event, userId: nextSession?.user?.id });

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

        // CRITICAL: If session became null, clear profile immediately
        if (!nextSession) {
          applyProfile(null); // Clear profile from state and localStorage
          setLoading(false);
        } else {
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
