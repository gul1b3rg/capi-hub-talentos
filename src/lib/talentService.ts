import { supabase } from './supabaseClient';
import type { PublicTalentProfile, TalentFilters, TalentPagination, ProfileViewCount } from '../types/talent';

/**
 * Obtiene lista paginada de talentos públicos con filtros
 * @param filters - Filtros de búsqueda (nombre, área, experiencia, ordenamiento)
 * @param pagination - Paginación (limit, offset)
 * @returns Lista de talentos y flag hasMore para infinite scroll
 */
export const fetchPublicTalents = async (
  filters: TalentFilters,
  pagination: TalentPagination
): Promise<{ talents: PublicTalentProfile[]; hasMore: boolean }> => {
  let query = supabase
    .from('profiles')
    .select(`
      id,
      full_name,
      headline,
      location,
      area,
      experience_years,
      availability,
      avatar_url,
      linkedin_url,
      current_company,
      web_url,
      created_at
    `)
    .eq('role', 'talento')
    .eq('is_public_profile', true);

  // Aplicar filtro de búsqueda (nombre o headline)
  if (filters.search.trim()) {
    const searchTerm = filters.search.trim();
    query = query.or(`full_name.ilike.%${searchTerm}%,headline.ilike.%${searchTerm}%`);
  }

  // Filtro por área
  if (filters.area) {
    query = query.eq('area', filters.area);
  }

  // Filtro por años de experiencia
  if (filters.experience_years) {
    query = query.eq('experience_years', filters.experience_years);
  }

  // Filtro por ubicación (parcial match)
  if (filters.location.trim()) {
    query = query.ilike('location', `%${filters.location.trim()}%`);
  }

  // Ordenamiento
  switch (filters.sortBy) {
    case 'popular':
      // TODO: JOIN con talent_popularity cuando esté disponible
      // Por ahora usar created_at como fallback
      query = query.order('created_at', { ascending: false });
      break;
    case 'recent':
      query = query.order('created_at', { ascending: false });
      break;
    case 'name':
      query = query.order('full_name', { ascending: true });
      break;
  }

  // Paginación
  const { limit, offset } = pagination;
  query = query.range(offset, offset + limit - 1);

  const { data, error } = await query;

  if (error) {
    // eslint-disable-next-line no-console
    console.error('[talentService] Error fetching public talents', error);
    throw error;
  }

  const hasMore = data.length === limit;

  return {
    talents: data as PublicTalentProfile[],
    hasMore
  };
};

/**
 * Incrementa el contador de vistas de un perfil
 * Silently fails si hay errores (no debe bloquear UX)
 * @param profileId - ID del perfil visto
 * @param viewerId - ID del usuario que vio (null si anónimo)
 */
export const incrementProfileView = async (
  profileId: string,
  viewerId?: string
): Promise<void> => {
  try {
    const { error } = await supabase
      .from('profile_views')
      .insert({
        profile_id: profileId,
        viewer_id: viewerId || null
      });

    if (error) {
      // Ignorar errores de duplicados (misma persona vio el mismo día)
      // PostgreSQL code 23505 o Supabase code 409 (constraint violation)
      if (error.code !== '23505' && error.code !== '409') {
        // eslint-disable-next-line no-console
        console.error('[talentService] Error incrementing profile view', error);
      }
      // else: silently ignore duplicate view (expected behavior)
    }
  } catch (error) {
    // Silent fail - no bloquear UX
    // eslint-disable-next-line no-console
    console.warn('[talentService] Failed to increment profile view', error);
  }
};

/**
 * Obtiene el conteo de vistas de un perfil
 * @param profileId - ID del perfil
 * @returns Contador de vistas (total, última semana, etc.)
 */
export const getProfileViewCount = async (
  profileId: string
): Promise<ProfileViewCount> => {
  try {
    const { data, error } = await supabase
      .from('talent_popularity')
      .select('total_views, views_last_week, views_last_month, unique_viewers')
      .eq('profile_id', profileId)
      .maybeSingle();

    if (error) {
      // eslint-disable-next-line no-console
      console.error('[talentService] Error fetching profile view count', error);
      return { total: 0, lastWeek: 0 };
    }

    if (!data) {
      return { total: 0, lastWeek: 0 };
    }

    return {
      total: data.total_views || 0,
      lastWeek: data.views_last_week || 0,
      lastMonth: data.views_last_month || 0,
      uniqueViewers: data.unique_viewers || 0
    };
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('[talentService] Exception in getProfileViewCount', error);
    return { total: 0, lastWeek: 0 };
  }
};
