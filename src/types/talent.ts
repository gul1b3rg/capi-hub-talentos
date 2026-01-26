/**
 * Perfil público de talento para la galería
 * Solo incluye información visible públicamente
 */
export interface PublicTalentProfile {
  id: string;
  full_name: string;
  headline: string | null;
  location: string | null;
  area: string | null;
  experience_years: string | null;
  availability: string | null;
  avatar_url: string | null;
  linkedin_url: string | null;
  current_company: string | null;
  web_url: string | null;
  created_at: string;

  // Métricas de popularidad (joins con talent_popularity)
  total_views?: number;
  views_last_week?: number;
  unique_viewers?: number;
}

/**
 * Filtros para búsqueda de talentos
 */
export interface TalentFilters {
  search: string;
  area: string | null;
  experience_years: string | null;
  location: string;
  sortBy: 'recent' | 'popular' | 'name';
}

/**
 * Paginación para infinite scroll
 */
export interface TalentPagination {
  limit: number;
  offset: number;
}

/**
 * Métricas de vistas de un perfil
 */
export interface ProfileViewCount {
  total: number;
  lastWeek: number;
  lastMonth?: number;
  uniqueViewers?: number;
}
