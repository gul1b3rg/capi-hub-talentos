export type JobStatus = 'Activa' | 'Borrador' | 'Cerrada';

export interface JobFormValues {
  title: string;
  description: string;
  location: string;
  modality: string;
  area: string;
  seniority: string;
  salary_range: string;
  deadline: string;
  status: JobStatus;
  tags: string[];
}
