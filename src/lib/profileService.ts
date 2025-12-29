import { supabase } from './supabaseClient';
import type { Profile, ProfileRole } from '../context/AuthContext';
import { uploadAvatarFromLinkedIn } from './storageService';

export interface ProfilePayload {
  fullName: string;
  role: ProfileRole;
  location?: string;
  headline?: string;
}

const normalize = (value?: string) => {
  if (!value) return null;
  const trimmed = value.trim();
  return trimmed.length ? trimmed : null;
};

export const upsertProfile = async (userId: string, payload: ProfilePayload) => {
  const { data, error } = await supabase
    .from('profiles')
    .upsert({
      id: userId,
      full_name: payload.fullName,
      role: payload.role,
      location: normalize(payload.location),
      headline: normalize(payload.headline),
    })
    .select()
    .single();

  if (error) {
    // eslint-disable-next-line no-console
    console.error('Error creating profile', error.message);
    throw error;
  }

  return data as Profile;
};

export const updateProfile = async (userId: string, values: Partial<Profile>) => {
  // Crear una promesa con timeout de 10 segundos
  const updatePromise = supabase.from('profiles').update(values).eq('id', userId).select().single();

  const timeoutPromise = new Promise((_, reject) => {
    setTimeout(() => reject(new Error('La actualización está tardando demasiado. Verifica las políticas RLS en Supabase.')), 10000);
  });

  const { data, error } = await Promise.race([updatePromise, timeoutPromise]) as any;

  if (error) {
    // eslint-disable-next-line no-console
    console.error('Error updating profile', error.message);
    throw error;
  }

  return data as Profile;
};

export const isProfileReadyForApplication = (profile: Profile | null) => {
  if (!profile) return false;
  return Boolean(profile.full_name && profile.headline && profile.cv_url);
};

/**
 * Obtiene el perfil público de un talento
 * Solo accesible por empresas que tienen postulaciones de ese talento
 */
export const fetchPublicTalentProfile = async (talentId: string): Promise<Profile> => {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, full_name, headline, location, experience_years, area, availability, linkedin_url, cv_url, is_public_profile, role')
    .eq('id', talentId)
    .eq('role', 'talento')
    .single();

  if (error) {
    console.error('[profileService] Error fetching public talent profile', error.message);
    throw new Error('No se pudo cargar el perfil del talento.');
  }

  if (!data) {
    throw new Error('Perfil no encontrado.');
  }

  return data as Profile;
};

/**
 * Datos extraídos del perfil de LinkedIn vía OAuth
 */
export interface LinkedInProfileData {
  email: string;
  name: string;
  picture?: string;
  sub: string; // LinkedIn user ID
  headline?: string;
}

/**
 * Auto-rellena perfil de talento post-OAuth con datos de LinkedIn
 * @param userId - ID del usuario
 * @param linkedInData - Datos extraídos de LinkedIn
 * @returns Perfil actualizado
 */
export const enrichProfileFromLinkedIn = async (
  userId: string,
  linkedInData: LinkedInProfileData
): Promise<Profile> => {
  // eslint-disable-next-line no-console
  console.log('[profileService] Enriching profile from LinkedIn', { userId, linkedInData });

  const updates: Partial<Profile> = {
    linkedin_id: linkedInData.sub,
  };

  // Auto-rellenar solo si los campos están vacíos
  const { data: currentProfile } = await supabase
    .from('profiles')
    .select('full_name, headline, avatar_url')
    .eq('id', userId)
    .single();

  if (currentProfile) {
    if (!currentProfile.full_name && linkedInData.name) {
      updates.full_name = linkedInData.name;
    }

    if (!currentProfile.headline && linkedInData.headline) {
      updates.headline = linkedInData.headline;
    }

    // Subir avatar si existe y no hay uno guardado
    if (!currentProfile.avatar_url && linkedInData.picture) {
      try {
        const avatarUrl = await uploadAvatarFromLinkedIn(linkedInData.picture, userId);
        updates.avatar_url = avatarUrl;
      } catch (error) {
        // eslint-disable-next-line no-console
        console.warn('[profileService] Failed to upload LinkedIn avatar, continuing...', error);
        // No bloqueamos el proceso si falla la descarga del avatar
      }
    }
  }

  return updateProfile(userId, updates);
};

/**
 * Vincula cuenta de LinkedIn a perfil existente (desde TalentProfile)
 * @param userId - ID del usuario
 * @param linkedInData - Datos extraídos de LinkedIn
 * @returns Perfil actualizado
 */
export const linkLinkedInToProfile = async (
  userId: string,
  linkedInData: LinkedInProfileData
): Promise<Profile> => {
  // eslint-disable-next-line no-console
  console.log('[profileService] Linking LinkedIn to profile', { userId, sub: linkedInData.sub });

  // Verificar si el linkedin_id ya está vinculado a otro perfil
  const { data: existing } = await supabase
    .from('profiles')
    .select('id')
    .eq('linkedin_id', linkedInData.sub)
    .maybeSingle();

  if (existing && existing.id !== userId) {
    throw new Error('Esta cuenta de LinkedIn ya está vinculada a otro usuario.');
  }

  const updates: Partial<Profile> = {
    linkedin_id: linkedInData.sub,
  };

  // Importar avatar si existe y no hay uno guardado
  const { data: currentProfile } = await supabase
    .from('profiles')
    .select('avatar_url')
    .eq('id', userId)
    .single();

  if (currentProfile && !currentProfile.avatar_url && linkedInData.picture) {
    try {
      const avatarUrl = await uploadAvatarFromLinkedIn(linkedInData.picture, userId);
      updates.avatar_url = avatarUrl;
    } catch (error) {
      // eslint-disable-next-line no-console
      console.warn('[profileService] Failed to upload LinkedIn avatar during linking', error);
    }
  }

  return updateProfile(userId, updates);
};

/**
 * Actualiza solo el avatar del perfil
 * @param userId - ID del usuario
 * @param avatarUrl - URL pública del avatar
 * @returns Perfil actualizado
 */
export const updateProfileAvatar = async (userId: string, avatarUrl: string): Promise<Profile> => {
  return updateProfile(userId, { avatar_url: avatarUrl });
};
