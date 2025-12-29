import { supabase } from './supabaseClient';
import type { User } from '@supabase/supabase-js';
import { enrichProfileFromLinkedIn, linkLinkedInToProfile, type LinkedInProfileData } from './profileService';

/**
 * Extrae datos de LinkedIn del user_metadata de Supabase
 * @param user - Usuario de Supabase con identidad de LinkedIn
 * @returns Datos del perfil de LinkedIn o null si no está disponible
 */
export const extractLinkedInData = (user: User | null): LinkedInProfileData | null => {
  if (!user) return null;

  // eslint-disable-next-line no-console
  console.log('[linkedInAuthService] user.user_metadata:', user.user_metadata);

  if (!user.user_metadata) {
    // eslint-disable-next-line no-console
    console.warn('[linkedInAuthService] No user_metadata found');
    return null;
  }

  // Los datos de LinkedIn OIDC vienen en user_metadata
  const { email, name, picture, sub, headline } = user.user_metadata;

  // eslint-disable-next-line no-console
  console.log('[linkedInAuthService] Extracted data:', { email, name, picture: !!picture, sub, headline });

  if (!email || !name || !sub) {
    // eslint-disable-next-line no-console
    console.warn('[linkedInAuthService] Missing required LinkedIn data', { email: !!email, name: !!name, sub: !!sub });
    return null;
  }

  return {
    email,
    name,
    picture,
    sub,
    headline,
  };
};

/**
 * Inicia el flujo OAuth de LinkedIn para sign-in o registro
 * Redirige al usuario a LinkedIn para autorización
 */
export const signInWithLinkedIn = async (): Promise<void> => {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'linkedin_oidc',
    options: {
      redirectTo: window.location.origin,
      scopes: 'openid profile email',
    },
  });

  if (error) {
    // eslint-disable-next-line no-console
    console.error('[linkedInAuthService] Error signing in with LinkedIn', error.message);
    throw new Error('No se pudo iniciar sesión con LinkedIn. Intenta nuevamente.');
  }
};

/**
 * Vincula identidad de LinkedIn a cuenta existente (para linking)
 * Usado desde TalentProfile para importar foto o vincular cuenta
 */
export const linkLinkedInAccount = async (): Promise<void> => {
  const { error } = await supabase.auth.linkIdentity({
    provider: 'linkedin_oidc',
    options: {
      redirectTo: window.location.origin + '/mi-perfil',
      scopes: 'openid profile email',
    },
  });

  if (error) {
    // eslint-disable-next-line no-console
    console.error('[linkedInAuthService] Error linking LinkedIn account', error.message);
    throw new Error('No se pudo vincular la cuenta de LinkedIn. Intenta nuevamente.');
  }
};

/**
 * Procesa el callback de OAuth y enriquece perfil si es necesario
 * Llamado desde AuthContext después de obtener el perfil
 * @param userId - ID del usuario autenticado
 * @param user - Usuario de Supabase con datos OAuth
 * @param isNewProfile - Indica si es un perfil recién creado (vacío)
 */
export const handleLinkedInCallback = async (
  userId: string,
  user: User,
  isNewProfile: boolean
): Promise<void> => {
  const linkedInData = extractLinkedInData(user);

  if (!linkedInData) {
    // No hay datos de LinkedIn o el usuario no usó OAuth
    return;
  }

  // eslint-disable-next-line no-console
  console.log('[linkedInAuthService] Processing LinkedIn callback', { userId, isNewProfile });

  try {
    if (isNewProfile) {
      // Perfil nuevo: enriquecer con datos de LinkedIn
      await enrichProfileFromLinkedIn(userId, linkedInData);
      // eslint-disable-next-line no-console
      console.log('[linkedInAuthService] Profile enriched from LinkedIn');
    } else {
      // Perfil existente: solo vincular si no está vinculado
      const { data: profile } = await supabase
        .from('profiles')
        .select('linkedin_id')
        .eq('id', userId)
        .single();

      if (profile && !profile.linkedin_id) {
        await linkLinkedInToProfile(userId, linkedInData);
        // eslint-disable-next-line no-console
        console.log('[linkedInAuthService] LinkedIn linked to existing profile');
      }
    }
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('[linkedInAuthService] Error handling LinkedIn callback', error);
    // No lanzamos error para no bloquear el flujo de autenticación
  }
};
