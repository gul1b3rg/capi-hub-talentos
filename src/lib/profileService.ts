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
  const { data, error } = await supabase.from('profiles').update(values).eq('id', userId).select().single();

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
