import { supabase } from './supabaseClient';
import type { JobStatus } from '../types/jobs';

export interface JobRecord {
  id: string;
  company_id: string;
  title: string;
  description: string;
  location: string | null;
  modality: string | null;
  area: string | null;
  seniority: string | null;
  salary_range: string | null;
  status: JobStatus;
  deadline: string | null;
  created_at: string;
  published_at: string | null;
}

export interface JobFilters {
  area?: string;
  seniority?: string;
  modality?: string;
  location?: string;
  companyId?: string;
  search?: string;
}

export interface JobWithRelations extends JobRecord {
  company?: {
    id: string;
    name: string;
    industry: string | null;
    location: string | null;
    logo_url?: string | null;
    owner_id?: string | null;
  } | null;
  tags: string[];
}

const mapJobResponse = (job: any): JobWithRelations => ({
  id: job.id,
  company_id: job.company_id,
  title: job.title,
  description: job.description,
  location: job.location,
  modality: job.modality,
  area: job.area,
  seniority: job.seniority,
  salary_range: job.salary_range,
  status: job.status,
  deadline: job.deadline,
  created_at: job.created_at,
  published_at: job.published_at,
  company: job.companies
    ? {
        id: job.companies.id,
        name: job.companies.name,
        industry: job.companies.industry,
        location: job.companies.location,
        logo_url: job.companies.logo_url,
        owner_id: job.companies.owner_id,
      }
    : null,
  tags: Array.isArray(job.job_tags) ? job.job_tags.map((tag: { tag: string }) => tag.tag) : [],
});

const normalizeTags = (tags: string[]) =>
  tags
    .map((tag) => tag.trim())
    .filter((tag, index, original) => tag.length > 0 && original.indexOf(tag) === index);

const replaceJobTags = async (jobId: string, tags: string[]) => {
  await supabase.from('job_tags').delete().eq('job_id', jobId);
  if (!tags.length) return;
  const tagPayload = tags.map((tag) => ({ job_id: jobId, tag }));
  const { error } = await supabase.from('job_tags').insert(tagPayload);
  if (error) {
    // eslint-disable-next-line no-console
    console.error('Error inserting job tags', error.message);
    throw error;
  }
};

export const fetchCompanyJobs = async (companyId: string) => {
  const { data, error } = await supabase
    .from('jobs')
    .select('*, job_tags(tag)')
    .eq('company_id', companyId)
    .order('created_at', { ascending: false });

  if (error) {
    // eslint-disable-next-line no-console
    console.error('Error fetching company jobs', error.message);
    throw error;
  }

  return (data ?? []).map((job) => mapJobResponse(job));
};

export const fetchJobDetail = async (jobId: string) => {
  const { data, error } = await supabase
    .from('jobs')
    .select('*, companies:company_id(id, name, industry, location, logo_url, owner_id), job_tags(tag)')
    .eq('id', jobId)
    .single();

  if (error) {
    // eslint-disable-next-line no-console
    console.error('Error fetching job detail', error.message);
    throw error;
  }

  const job = mapJobResponse(data);
  if (data.companies) {
    job.company = {
      id: data.companies.id,
      name: data.companies.name,
      industry: data.companies.industry,
      location: data.companies.location,
    };
  }
  return job;
};

export interface PaginationOptions {
  limit?: number;
  offset?: number;
}

export interface PaginatedJobsResponse {
  jobs: JobWithRelations[];
  totalCount: number;
  hasMore: boolean;
}

export const fetchPublicJobs = async (
  filters: JobFilters,
  options: PaginationOptions = {}
): Promise<PaginatedJobsResponse> => {
  const { limit = 20, offset = 0 } = options;

  let query = supabase
    .from('jobs')
    .select('*, companies:company_id(id, name, industry, location, logo_url, owner_id), job_tags(tag)', { count: 'exact' })
    .eq('status', 'Activa')
    .order('published_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (filters.area) query = query.eq('area', filters.area);
  if (filters.seniority) query = query.eq('seniority', filters.seniority);
  if (filters.modality) query = query.eq('modality', filters.modality);
  if (filters.location) query = query.ilike('location', `%${filters.location}%`);
  if (filters.companyId) query = query.eq('company_id', filters.companyId);
  if (filters.search) {
    const term = `%${filters.search}%`;
    query = query.or(`title.ilike.${term},description.ilike.${term}`);
  }

  const { data, error, count } = await query;

  if (error) {
    // eslint-disable-next-line no-console
    console.error('Error fetching public jobs', error.message);
    throw error;
  }

  const jobs = (data ?? []).map((job) => mapJobResponse(job));
  const totalCount = count ?? 0;
  const hasMore = totalCount > offset + limit;

  return {
    jobs,
    totalCount,
    hasMore,
  };
};

interface JobPayload {
  title: string;
  description: string;
  location: string;
  modality: string;
  area: string;
  seniority: string;
  salary_range: string;
  status: JobStatus;
  deadline: string | null;
  published_at: string | null;
}

export const createJob = async (companyId: string, payload: JobPayload, tags: string[]) => {
  const { data, error } = await supabase
    .from('jobs')
    .insert({ ...payload, company_id: companyId })
    .select()
    .single();

  if (error) {
    // eslint-disable-next-line no-console
    console.error('Error creating job', error.message);
    throw error;
  }

  await replaceJobTags(data.id, normalizeTags(tags));

  return data as JobRecord;
};

export const updateJob = async (jobId: string, payload: Partial<JobPayload>, tags: string[]) => {
  const { data, error } = await supabase.from('jobs').update(payload).eq('id', jobId).select().single();

  if (error) {
    // eslint-disable-next-line no-console
    console.error('Error updating job', error.message);
    throw error;
  }

  await replaceJobTags(jobId, normalizeTags(tags));

  return data as JobRecord;
};

export const updateJobStatus = async (jobId: string, status: JobStatus) => {
  const publishedAt = status === 'Activa' ? new Date().toISOString() : null;
  const { data, error } = await supabase
    .from('jobs')
    .update({ status, published_at: publishedAt })
    .eq('id', jobId)
    .select()
    .single();

  if (error) {
    // eslint-disable-next-line no-console
    console.error('Error updating job status', error.message);
    throw error;
  }

  return data as JobRecord;
};

export const duplicateJob = async (jobId: string, companyId: string) => {
  const original = await fetchJobDetail(jobId);

  const { data, error } = await supabase
    .from('jobs')
    .insert({
      company_id: companyId,
      title: `${original.title} (copia)`,
      description: original.description,
      location: original.location,
      modality: original.modality,
      area: original.area,
      seniority: original.seniority,
      salary_range: original.salary_range,
      status: 'Borrador',
      deadline: original.deadline,
      published_at: null,
    })
    .select()
    .single();

  if (error) {
    // eslint-disable-next-line no-console
    console.error('Error duplicating job', error.message);
    throw error;
  }

  await replaceJobTags(data.id, normalizeTags(original.tags));

  return data as JobRecord;
};
