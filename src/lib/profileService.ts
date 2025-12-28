import { supabase } from './supabaseClient';
import type { Profile, ProfileRole } from '../context/AuthContext';

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
