import { supabase } from './supabaseClient';
import type { Profile } from '../context/AuthContext';
import type { ApplicationStatus } from '../types/applications';

// ========== TIPOS ==========

export interface ApplicationRecord {
  id: string;
  job_id: string;
  talent_id: string;
  status: ApplicationStatus;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface ApplicationWithRelations extends ApplicationRecord {
  job?: {
    id: string;
    title: string;
    location: string | null;
    modality: string | null;
    status: string;
    company_id: string;
  } | null;
  talent?: {
    id: string;
    full_name: string;
    headline: string | null;
    cv_url: string | null;
    linkedin_url: string | null;
  } | null;
  company?: {
    id: string;
    name: string;
    logo_url: string | null;
  } | null;
}

// ========== VALIDACIONES ==========

const validateJobIsActive = async (jobId: string): Promise<void> => {
  const { data, error } = await supabase
    .from('jobs')
    .select('status')
    .eq('id', jobId)
    .single();

  if (error) {
    console.error('[applicationService] Error validating job', error.message);
    throw new Error('No se pudo verificar la vacancia.');
  }

  if (!data || data.status !== 'Activa') {
    throw new Error('Esta vacancia ya no está activa.');
  }
};

const validateProfileReady = (profile: Profile): void => {
  if (!profile.full_name || !profile.headline || !profile.cv_url) {
    throw new Error(
      'Debes completar tu perfil (nombre, titular y CV) antes de postularte.'
    );
  }
};

// ========== FUNCIONES PRINCIPALES ==========

/**
 * Verifica si un talento ya se postuló a una vacancia
 */
export const checkIfAlreadyApplied = async (
  jobId: string,
  talentId: string
): Promise<boolean> => {
  const { data, error } = await supabase
    .from('applications')
    .select('id')
    .eq('job_id', jobId)
    .eq('talent_id', talentId)
    .maybeSingle();

  if (error) {
    console.error('[applicationService] Error checking application', error.message);
    throw error;
  }

  return data !== null;
};

/**
 * Crea una nueva postulación
 */
export const createApplication = async (
  jobId: string,
  talentId: string,
  profile: Profile
): Promise<ApplicationRecord> => {
  // Validación 1: Perfil completo
  validateProfileReady(profile);

  // Validación 2: Vacancia activa
  await validateJobIsActive(jobId);

  // Validación 3: No duplicados
  const alreadyApplied = await checkIfAlreadyApplied(jobId, talentId);
  if (alreadyApplied) {
    throw new Error('Ya te postulaste a esta vacancia.');
  }

  // Crear postulación
  const { data, error } = await supabase
    .from('applications')
    .insert({
      job_id: jobId,
      talent_id: talentId,
      status: 'Recibida',
    })
    .select()
    .single();

  if (error) {
    console.error('[applicationService] Error creating application', error.message);
    throw new Error('No se pudo crear la postulación. Intenta nuevamente.');
  }

  return data as ApplicationRecord;
};

/**
 * Obtiene todas las postulaciones de un talento
 */
export const fetchApplicationsByTalent = async (
  talentId: string
): Promise<ApplicationWithRelations[]> => {
  const { data, error } = await supabase
    .from('applications')
    .select(`
      *,
      jobs:job_id (
        id,
        title,
        location,
        modality,
        status,
        company_id,
        companies:company_id (id, name, logo_url)
      )
    `)
    .eq('talent_id', talentId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('[applicationService] Error fetching talent applications', error.message);
    throw error;
  }

  // Mapear respuesta para estructura limpia
  return (data ?? []).map((app: any) => ({
    ...app,
    job: app.jobs ? {
      id: app.jobs.id,
      title: app.jobs.title,
      location: app.jobs.location,
      modality: app.jobs.modality,
      status: app.jobs.status,
      company_id: app.jobs.company_id,
    } : null,
    company: app.jobs?.companies ? {
      id: app.jobs.companies.id,
      name: app.jobs.companies.name,
      logo_url: app.jobs.companies.logo_url,
    } : null,
  })) as ApplicationWithRelations[];
};

/**
 * Obtiene todas las postulaciones de una vacancia específica
 */
export const fetchApplicationsByJob = async (
  jobId: string
): Promise<ApplicationWithRelations[]> => {
  const { data, error } = await supabase
    .from('applications')
    .select(`
      *,
      profiles:talent_id (
        id,
        full_name,
        headline,
        cv_url,
        linkedin_url
      )
    `)
    .eq('job_id', jobId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('[applicationService] Error fetching job applications', error.message);
    throw error;
  }

  return (data ?? []).map((app: any) => ({
    ...app,
    talent: app.profiles ? {
      id: app.profiles.id,
      full_name: app.profiles.full_name,
      headline: app.profiles.headline,
      cv_url: app.profiles.cv_url,
      linkedin_url: app.profiles.linkedin_url,
    } : null,
  })) as ApplicationWithRelations[];
};

/**
 * Obtiene todas las postulaciones de todas las vacancias de una empresa
 */
export const fetchApplicationsByCompany = async (
  companyId: string
): Promise<ApplicationWithRelations[]> => {
  const { data, error } = await supabase
    .from('applications')
    .select(`
      *,
      jobs:job_id!inner (
        id,
        title,
        location,
        modality,
        status,
        company_id
      ),
      talent:profiles!talent_id (
        id,
        full_name,
        headline,
        cv_url,
        linkedin_url
      )
    `)
    .eq('jobs.company_id', companyId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('[applicationService] Error fetching company applications', error.message);
    throw error;
  }

  return (data ?? []).map((app: any) => ({
    ...app,
    job: app.jobs ? {
      id: app.jobs.id,
      title: app.jobs.title,
      location: app.jobs.location,
      modality: app.jobs.modality,
      status: app.jobs.status,
      company_id: app.jobs.company_id,
    } : null,
    talent: app.talent ? {
      id: app.talent.id,
      full_name: app.talent.full_name,
      headline: app.talent.headline,
      cv_url: app.talent.cv_url,
      linkedin_url: app.talent.linkedin_url,
    } : null,
  })) as ApplicationWithRelations[];
};

/**
 * Actualiza el estado de una postulación (solo empresas)
 */
export const updateApplicationStatus = async (
  applicationId: string,
  newStatus: ApplicationStatus,
  notes?: string
): Promise<ApplicationRecord> => {
  const payload: any = { status: newStatus };
  if (notes !== undefined) {
    payload.notes = notes;
  }

  const { data, error } = await supabase
    .from('applications')
    .update(payload)
    .eq('id', applicationId)
    .select()
    .single();

  if (error) {
    console.error('[applicationService] Error updating application status', error.message);
    throw new Error('No se pudo actualizar el estado de la postulación.');
  }

  return data as ApplicationRecord;
};

/**
 * Cuenta postulaciones por estado (para dashboard de empresa)
 */
export const countApplicationsByStatus = async (
  companyId: string
): Promise<Record<ApplicationStatus, number>> => {
  const { data, error } = await supabase
    .from('applications')
    .select('status, jobs!inner(company_id)')
    .eq('jobs.company_id', companyId);

  if (error) {
    console.error('[applicationService] Error counting applications by status', error.message);
    throw error;
  }

  const counts: Record<ApplicationStatus, number> = {
    'Recibida': 0,
    'En revisión': 0,
    'Entrevista agendada': 0,
    'Aceptada': 0,
    'Rechazada': 0,
  };

  data?.forEach((app: any) => {
    if (app.status in counts) {
      counts[app.status as ApplicationStatus]++;
    }
  });

  return counts;
};
