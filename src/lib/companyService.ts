import { supabase } from './supabaseClient';

export interface Company {
  id: string;
  owner_id: string;
  name: string;
  description: string | null;
  logo_url: string | null;
  website: string | null;
  industry: string | null;
  location: string | null;
  phone: string | null;
  responsible_name: string | null;
  corporate_email: string | null;
  corporate_phone: string | null;
  created_at: string;
}

export interface CompanyPayload {
  name: string;
  description?: string;
  logo_url?: string;
  website?: string;
  industry?: string;
  location?: string;
  corporate_email?: string;
  corporate_phone?: string;
}

export const fetchCompanyByOwner = async (ownerId: string) => {
  const { data, error } = await supabase
    .from('companies')
    .select('*')
    .eq('owner_id', ownerId)
    .maybeSingle();

  if (error) {
    // eslint-disable-next-line no-console
    console.error('Error fetching company by owner', error.message);
    throw error;
  }

  return (data as Company | null) ?? null;
};

export const fetchCompanyById = async (companyId: string) => {
  const { data, error } = await supabase.from('companies').select('*').eq('id', companyId).maybeSingle();

  if (error) {
    // eslint-disable-next-line no-console
    console.error('Error fetching company by id', error.message);
    throw error;
  }

  return (data as Company | null) ?? null;
};

export const createCompanyProfile = async (ownerId: string, payload: CompanyPayload) => {
  const { data, error } = await supabase
    .from('companies')
    .insert({ owner_id: ownerId, ...payload })
    .select()
    .single();

  if (error) {
    // eslint-disable-next-line no-console
    console.error('Error creating company profile', error.message);
    throw error;
  }

  return data as Company;
};

export const fetchCompaniesForFilters = async () => {
  const { data, error } = await supabase.from('companies').select('id, name').order('name');

  if (error) {
    // eslint-disable-next-line no-console
    console.error('Error fetching company list', error.message);
    throw error;
  }

  return (data ?? []) as { id: string; name: string }[];
};

export interface CompanyListItem {
  id: string;
  name: string;
  industry: string | null;
  location: string | null;
  logo_url: string | null;
}

export interface CompanyFilters {
  search: string;
}

export interface CompanyPagination {
  limit: number;
  offset: number;
}

/**
 * Obtiene lista paginada de empresas para el directorio público
 */
export const fetchPublicCompanies = async (
  filters: CompanyFilters,
  pagination: CompanyPagination
): Promise<{ companies: CompanyListItem[]; hasMore: boolean }> => {
  let query = supabase
    .from('companies')
    .select('id, name, industry, location, logo_url')
    .order('name', { ascending: true });

  // Filtro de búsqueda por nombre
  if (filters.search.trim()) {
    query = query.ilike('name', `%${filters.search.trim()}%`);
  }

  // Paginación
  const { limit, offset } = pagination;
  query = query.range(offset, offset + limit - 1);

  const { data, error } = await query;

  if (error) {
    // eslint-disable-next-line no-console
    console.error('[companyService] Error fetching public companies', error);
    throw error;
  }

  const hasMore = data.length === limit;

  return {
    companies: data as CompanyListItem[],
    hasMore,
  };
};

export const updateCompanyProfile = async (companyId: string, payload: CompanyPayload) => {
  const { data, error } = await supabase.from('companies').update(payload).eq('id', companyId).select().single();

  if (error) {
    // eslint-disable-next-line no-console
    console.error('Error updating company profile', error.message);
    throw error;
  }

  return data as Company;
};

export interface JobSummary {
  id: string;
  title: string;
  status: string;
  location: string | null;
  modality: string | null;
  created_at: string;
}

export const fetchActiveJobsForCompany = async (companyId: string) => {
  const { data, error } = await supabase
    .from('jobs')
    .select('id, title, status, location, modality, created_at')
    .eq('company_id', companyId)
    .eq('status', 'Activa')
    .order('created_at', { ascending: false });

  if (error) {
    // eslint-disable-next-line no-console
    console.error('Error fetching company jobs', error.message);
    throw error;
  }

  return (data as JobSummary[]) ?? [];
};

export const countActiveJobs = async (companyId: string) => {
  const { count, error } = await supabase
    .from('jobs')
    .select('id', { count: 'exact', head: true })
    .eq('company_id', companyId)
    .eq('status', 'Activa');

  if (error) {
    // eslint-disable-next-line no-console
    console.error('Error counting active jobs', error.message);
    throw error;
  }

  return count ?? 0;
};

export const countNewApplications = async (companyId: string) => {
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

  const { count, error } = await supabase
    .from('applications')
    .select('id, jobs!inner(company_id)', { count: 'exact', head: true })
    .eq('jobs.company_id', companyId)
    .gte('created_at', sevenDaysAgo);

  if (error) {
    // eslint-disable-next-line no-console
    console.error('Error counting applications', error.message);
    throw error;
  }

  return count ?? 0;
};

export const countSavedTalents = async (companyId: string) => {
  const { count, error } = await supabase
    .from('saved_talents')
    .select('id', { count: 'exact', head: true })
    .eq('company_id', companyId);

  if (error) {
    // eslint-disable-next-line no-console
    console.error('Error counting saved talents', error.message);
    throw error;
  }

  return count ?? 0;
};
